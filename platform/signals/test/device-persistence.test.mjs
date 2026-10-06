// batch 3 tests: what reaches durable storage after device processing.
// builds the cumulative schema, processes a payload full of distinctive markers,
// stores the processed result, then scans every table for any trace of the raw input.
// local pglite only.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { buildTestDatabase } from '../../../scripts/build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from '../../../scripts/seed-security-test-data.mjs';
import { processDevicePayload, disposeRawPayload } from '../device-processor.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload, excludedComponents, headlessPayload } from './fixtures.mjs';

const originalLog = console.log;
console.log = () => {};
const db = await buildTestDatabase();
await seedTestData(db);
console.log = originalLog;
after(async () => { await db.close(); });

const ring = makeKeyRing();
const profile = (await db.query('select id from public.creator_profiles where user_id = $1', [TEST_USERS.creator_alice.id])).rows[0].id;

const flag = (value, source) => ({ value, coverage: 'full', source_id: source, dataset_version: '2026-10-05' });
const flags = () => ({
  proxy: flag(false, 'ip2proxy-lite-px2'), vpn: flag(false, 'x4bnet-vpn'),
  tor: flag(false, 'tor-bulk-exit'), datacenter: flag(false, 'x4bnet-datacenter'),
});

/** store a processed signal the way the service will: hashes and features only. */
async function store(processed, ip, submission = crypto.randomUUID(), moment = 'payout_onboarding') {
  const tx = db;
  await tx.query('set role service_role');
  try {
    await tx.query(
      `select public.record_payout_signal_check($1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb,$12,$13::jsonb,$14::jsonb,$15)`,
      [profile, moment, submission, processed.deviceHash, ring.digest('ip', ip, processed.hashKeyId),
        processed.hashKeyId, processed.collectionStatus, JSON.stringify(processed.features),
        processed.processorVersion, 'v1', '["proxy","vpn"]',
        processed.collectionStatus === 'unavailable' ? 'needs_review' : 'pass',
        processed.collectionStatus === 'unavailable' ? '["collection_unavailable"]' : '[]',
        JSON.stringify(flags()), 'a1']);
  } finally {
    await tx.query('reset role');
  }
  return submission;
}

/** every row of every base table in both schemas, as text. */
async function allStoredText() {
  const tables = (await db.query(
    `select table_schema, table_name from information_schema.tables
      where table_type = 'BASE TABLE' and table_schema in ('public','sculptura_private')`)).rows;
  let text = '';
  for (const t of tables) {
    const rows = await db.query(`select to_jsonb(x)::text as j from ${t.table_schema}.${t.table_name} x`);
    text += rows.rows.map((r) => r.j).join('\n');
  }
  return { tableCount: tables.length, text };
}

test('positive: a processed signal is stored as hash, key id, status and bounded features', async () => {
  const processed = processDevicePayload(desktopPayload(), ring);
  const sub = await store(processed, '203.0.113.9');
  const row = (await db.query('select * from sculptura_private.creator_signal_events where submission_id = $1', [sub])).rows[0];
  assert.equal(row.device_hash, processed.deviceHash);
  assert.equal(row.hash_key_id, 'k-2026-q4');
  assert.equal(row.collection_status, 'complete');
  assert.deepEqual(row.device_features, processed.features);
  assert.equal(row.ip_digest, ring.digest('ip', '203.0.113.9'));
});

test('positive control: the storage scan does find a marker when one is planted', async () => {
  await db.query(
    `insert into sculptura_private.creator_trust_levels (level_key, description) values ('scan_control', $1)`,
    [`planted ${RAW_MARKER}`]);
  try {
    const { text } = await allStoredText();
    assert.ok(text.includes(RAW_MARKER), 'the scanner can see a planted marker, so an empty result means something');
  } finally {
    await db.query(`delete from sculptura_private.creator_trust_levels where level_key = 'scan_control'`);
  }
  assert.ok(!(await allStoredText()).text.includes(RAW_MARKER), 'and it is gone after cleanup');
});

test('negative: after processing, no table in either schema contains any raw input', async () => {
  const raw = desktopPayload({ components: excludedComponents() });
  const processed = processDevicePayload(raw, ring);
  await store(processed, '198.51.100.23');
  disposeRawPayload(raw);

  const { tableCount, text } = await allStoredText();
  assert.ok(tableCount >= 25, `scanned ${tableCount} tables`);
  const traces = [
    RAW_MARKER, 'Chrome/120', 'Mozilla/5.0', 'GeForce', 'Win32', 'Asia/Dhaka', 'en-US', 'voice-a',
    'PDF Viewer', 'internal-pdf-viewer', '198.51.100.23', '203.0.113.9',
  ];
  for (const trace of traces) assert.ok(!text.includes(trace), `durable storage contains no ${trace}`);
});

test('negative: the event table has no column that could hold a raw payload or a plaintext ip', async () => {
  const cols = (await db.query(
    `select column_name, data_type from information_schema.columns
      where table_schema='sculptura_private' and table_name='creator_signal_events' order by ordinal_position`)).rows;
  assert.deepEqual(cols.map((c) => c.column_name), [
    'id', 'creator_profile_id', 'moment', 'submission_id', 'device_hash', 'ip_digest', 'hash_key_id',
    'collection_status', 'device_features', 'processor_version', 'occurred_at']);
  assert.ok(!cols.some((c) => /payload|raw|user_?agent|^ip$|ip_address|fingerprint/i.test(c.column_name)));
});

test('positive: an unavailable collection stores a null hash and the key id, never a fabricated fingerprint', async () => {
  const processed = processDevicePayload(null, ring);
  const sub = await store(processed, '203.0.113.10');
  const row = (await db.query('select device_hash, collection_status, hash_key_id, device_features from sculptura_private.creator_signal_events where submission_id = $1', [sub])).rows[0];
  assert.equal(row.device_hash, null);
  assert.equal(row.collection_status, 'unavailable');
  assert.equal(row.hash_key_id, 'k-2026-q4');
  assert.equal(row.device_features.component_coverage, 0);
});

test('positive: the same device at two moments gives the same hash, so repeat use is comparable', async () => {
  const a = processDevicePayload(desktopPayload(), ring);
  const b = processDevicePayload(desktopPayload(), ring);
  const s1 = await store(a, '203.0.113.11', crypto.randomUUID(), 'payout_onboarding');
  const s2 = await store(b, '203.0.113.12', crypto.randomUUID(), 'payout_request');
  const rows = (await db.query('select device_hash from sculptura_private.creator_signal_events where submission_id in ($1,$2)', [s1, s2])).rows;
  assert.equal(rows.length, 2);
  assert.equal(rows[0].device_hash, rows[1].device_hash);
});

test('negative: indicators are stored as fixed vocabulary, not as client strings', async () => {
  const processed = processDevicePayload(headlessPayload(), ring);
  const sub = await store(processed, '203.0.113.13');
  const row = (await db.query('select device_features from sculptura_private.creator_signal_events where submission_id = $1', [sub])).rows[0];
  assert.deepEqual(row.device_features.automation_indicators, ['headless_user_agent', 'software_renderer']);
  assert.ok(!JSON.stringify(row).includes('HeadlessChrome'), 'the user agent itself is not stored');
});
