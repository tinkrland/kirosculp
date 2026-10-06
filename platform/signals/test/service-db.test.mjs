// batch 5 tests: the decision service against the real cumulative schema.
// the ports run as service_role (and, for the negative cases, as roles that must
// be refused) inside pglite. local only, not live supabase.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTestDatabase } from '../../../scripts/build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from '../../../scripts/seed-security-test-data.mjs';
import { checkGeographyInvariant } from '../../../scripts/check-trust-schema-invariant.mjs';
import {
  PayoutSignalCheckService, ReplayMismatchError, PolicyUnavailableError, CheckNotRecordedError,
} from '../payout-signal-check.mjs';
import { createDbPolicyStore, createDbRecorder, createDbTerritoryListStore } from '../db-ports.mjs';
import { FreeIpIntelligenceAdapter } from '../ip-intelligence.mjs';
import { loadFeeds } from '../feeds.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload } from './fixtures.mjs';
import { IPS, writeFeedDir } from './ip-fixtures.mjs';
import { StubCommercialAdapter } from './stub-commercial-adapter.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const originalLog = console.log;
console.log = () => {};
const db = await buildTestDatabase();
await seedTestData(db);
console.log = originalLog;
after(async () => { await db.close(); });

const feeds = writeFeedDir();
after(() => feeds.cleanup());
const { sources } = loadFeeds({ dir: feeds.dir });

const profile = (await db.query('select id from public.creator_profiles where user_id = $1', [TEST_USERS.creator_alice.id])).rows[0].id;
const otherProfile = (await db.query('select id from public.creator_profiles where user_id = $1', [TEST_USERS.creator_bob.id])).rows[0].id;

/** a query function that runs each statement in its own transaction under a role. */
const queryAs = (role, uid = null) => (sql, params) =>
  db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    if (uid) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    return tx.query(sql, params);
  });

function serviceFor({ role = 'service_role', uid = null, policyVersion = 'v1', ipAdapter, keyRing = makeKeyRing() } = {}) {
  const query = queryAs(role, uid);
  return new PayoutSignalCheckService({
    ipAdapter: ipAdapter ?? new FreeIpIntelligenceAdapter({ sources }),
    keyRing,
    territoryListStore: createDbTerritoryListStore(query),
    policyStore: createDbPolicyStore(query),
    recorder: createDbRecorder(query),
    policyVersion,
  });
}

const req = (o = {}) => ({
  creatorProfileId: profile, moment: 'payout_onboarding', submissionId: crypto.randomUUID(),
  observedIp: IPS.residential, rawDevicePayload: desktopPayload(), market: 'GB', ...o,
});
const count = async (table) => (await db.query(`select count(*)::int as n from sculptura_private.${table}`)).rows[0].n;
const row = async (sub) => (await db.query(
  `select d.*, e.device_hash, e.ip_digest, e.hash_key_id, e.collection_status, e.device_features
     from sculptura_private.payout_signal_decisions d
     left join sculptura_private.creator_signal_events e using (submission_id) where d.submission_id = $1`, [sub])).rows[0];

// ---------------------------------------------------------- policy from the db

test('positive: the database policy drives the outcome for in, pk and bd and leaves others alone', async () => {
  const service = serviceFor();
  for (const market of ['IN', 'PK', 'BD']) {
    const r = await service.check(req({ market, observedIp: IPS.vpn }));
    assert.equal(r.outcome, 'needs_review', market);
    assert.deepEqual(r.reasonCodes, ['vpn_detected']);
    assert.deepEqual(r.selectedChecks, ['proxy', 'vpn']);
    assert.equal(r.policyVersion, 'v1');
  }
  for (const market of ['US', 'GB', 'DE', 'NG', 'ZZ']) {
    const r = await service.check(req({ market, observedIp: IPS.vpn }));
    assert.equal(r.outcome, 'pass', market);
    assert.deepEqual(r.selectedChecks, []);
  }
});

test('positive: every market the policy names exists in the rails matrix, and only in, pk, bd are strict', async () => {
  const rails = JSON.parse(fs.readFileSync(path.join(root, 'operations/country-rollout/creator-payout-rails.json'), 'utf8'));
  const known = new Set(rails.markets.map((m) => m.market));
  const policy = (await db.query(`select market, mandatory_checks from sculptura_private.payout_signal_policy where enabled`)).rows;
  for (const p of policy.filter((x) => x.market !== 'DEFAULT')) assert.ok(known.has(p.market), `${p.market} is in the rails matrix`);
  assert.deepEqual(policy.filter((p) => p.mandatory_checks.length > 0).map((p) => p.market).sort(), ['BD', 'IN', 'PK']);
  for (const m of ['IN', 'PK', 'BD']) {
    const entry = rails.markets.find((x) => x.market === m);
    assert.equal(entry.primary_rail, 'payoneer', `${m} is a payoneer-primary corridor in the matrix`);
  }
});

test('positive: a new policy version can configure fail for one market, and the old version is untouched', async () => {
  await db.query(`insert into sculptura_private.payout_signal_policy (policy_version, market, mandatory_checks, positive_outcome)
                  values ('v2','DEFAULT','{}','needs_review'), ('v2','PK','{proxy,vpn}','fail'), ('v2','IN','{proxy,vpn}','needs_review')`);
  try {
    const v2 = serviceFor({ policyVersion: 'v2' });
    assert.equal((await v2.check(req({ market: 'PK', observedIp: IPS.vpn }))).outcome, 'fail', 'per-corridor fail is configurable later');
    assert.equal((await v2.check(req({ market: 'IN', observedIp: IPS.vpn }))).outcome, 'needs_review');
    const outage = { lookup: async () => { throw new Error('down'); } };
    assert.equal((await serviceFor({ policyVersion: 'v2', ipAdapter: outage }).check(req({ market: 'PK' }))).outcome, 'needs_review', 'an outage is never a fail even where fail is configured');
    assert.equal((await serviceFor().check(req({ market: 'PK', observedIp: IPS.vpn }))).outcome, 'needs_review', 'v1 unchanged');
  } finally {
    await db.query(`delete from sculptura_private.payout_signal_policy where policy_version = 'v2'`);
  }
});

test('negative: a disabled market row falls back to default, and no enabled policy at all means the check holds', async () => {
  await db.query(`update sculptura_private.payout_signal_policy set enabled = false where policy_version = 'v1' and market = 'IN'`);
  try {
    const r = await serviceFor().check(req({ market: 'IN', observedIp: IPS.vpn }));
    assert.equal(r.outcome, 'pass', 'IN fell back to DEFAULT, which has no mandatory checks');
    await db.query(`update sculptura_private.payout_signal_policy set enabled = false where policy_version = 'v1'`);
    await assert.rejects(() => serviceFor().check(req({ market: 'IN' })), PolicyUnavailableError);
    assert.equal(await count('payout_signal_decisions') > 0, true);
  } finally {
    await db.query(`update sculptura_private.payout_signal_policy set enabled = true where policy_version = 'v1'`);
  }
  assert.equal((await serviceFor().check(req({ market: 'IN', observedIp: IPS.vpn }))).outcome, 'needs_review', 'restored');
});

// --------------------------------------------------------------- stored shape

test('positive: a check stores the hashes, key id, features, flags and reasons it decided on', async () => {
  const keyRing = makeKeyRing();
  const service = serviceFor({ keyRing });
  const sub = crypto.randomUUID();
  const r = await service.check(req({ submissionId: sub, market: 'IN', observedIp: IPS.vpn }));
  const stored = await row(sub);

  assert.equal(stored.outcome, r.outcome);
  assert.deepEqual(stored.reason_codes, ['vpn_detected']);
  assert.deepEqual(stored.selected_checks, ['proxy', 'vpn']);
  assert.equal(stored.collection_status, 'complete');
  assert.match(stored.device_hash, /^[0-9a-f]{64}$/);
  assert.equal(stored.hash_key_id, 'k-2026-q4');
  assert.equal(stored.ip_digest, keyRing.digest('ip', `4:${(await import('../ip-intelligence.mjs')).parseIp(IPS.vpn).value}`));
  assert.deepEqual(stored.network_flags.vpn, { value: true, coverage: 'full', source_id: 'x4bnet-vpn', dataset_version: '2026-10-06' });
  assert.equal(stored.network_flags.proxy.value, false);
  assert.equal(stored.adapter_version, 'free-ip-intelligence-1');
  assert.equal(stored.policy_version, 'v1');
});

test('positive: the decision record has no market, country or corridor column, and the invariant still holds', async () => {
  const cols = (await db.query(`select column_name from information_schema.columns
    where table_schema='sculptura_private' and table_name='payout_signal_decisions'`)).rows.map((c) => c.column_name);
  // geo_evidence is the one reviewed exception (batch 8): decision evidence, not a creator attribute.
  assert.ok(!cols.filter((c) => c !== 'geo_evidence').some((c) => /market|country|geo|corridor|region/i.test(c)), cols.join(','));
  assert.equal((await checkGeographyInvariant(db)).ok, true);
});

test('negative: a strict-market check writes no corridor, market or country value anywhere in the database', async () => {
  const dump = async () => {
    const tables = (await db.query(`select table_schema, table_name from information_schema.tables
      where table_type='BASE TABLE' and table_schema in ('public','sculptura_private')
        and table_name not in ('payout_signal_policy')`)).rows;
    let text = '';
    for (const t of tables) text += (await db.query(`select to_jsonb(x)::text j from ${t.table_schema}.${t.table_name} x`)).rows.map((r) => r.j).join('\n');
    return text;
  };
  const before = await dump();
  const sub = crypto.randomUUID();
  await serviceFor().check(req({ submissionId: sub, market: 'BD', observedIp: IPS.vpn }));
  const newText = (await dump()).replace(before, '');
  const stored = JSON.stringify(await row(sub));
  for (const trace of ['"BD"', 'Bangladesh', 'corridor', '"market"']) assert.ok(!stored.includes(trace), `the stored record has no ${trace}`);
  assert.ok(newText.length > 0);
});

test('negative: running strict-market checks leaves every trust table exactly as it was', async () => {
  const snapshot = async () => (await db.query(
    `select (select count(*) from sculptura_private.creator_trust) a,
            (select count(*) from sculptura_private.creator_trust_events) b,
            (select count(*) from sculptura_private.buyer_trust) c,
            (select count(*) from sculptura_private.buyer_trust_events) d,
            (select coalesce(string_agg(x::text, '|' order by creator_profile_id), '') from sculptura_private.creator_trust x) e`)).rows[0];
  const before = await snapshot();
  const service = serviceFor();
  for (const market of ['IN', 'PK', 'BD', 'GB']) {
    await service.check(req({ market, observedIp: IPS.vpn }));
    await service.check(req({ market, observedIp: IPS.tor, rawDevicePayload: null }));
  }
  assert.deepEqual(await snapshot(), before);
});

test('negative: after a full run of checks, no table contains any raw input or plaintext address', async () => {
  const service = serviceFor();
  const ips = [IPS.vpn, IPS.tor, IPS.residential, IPS.openProxy, IPS.residentialV6];
  for (const observedIp of ips) await service.check(req({ observedIp, market: 'IN' }));
  const tables = (await db.query(`select table_schema, table_name from information_schema.tables
    where table_type='BASE TABLE' and table_schema in ('public','sculptura_private')`)).rows;
  let text = '';
  for (const t of tables) text += (await db.query(`select to_jsonb(x)::text j from ${t.table_schema}.${t.table_name} x`)).rows.map((r) => r.j).join('\n');
  for (const trace of [RAW_MARKER, 'Chrome/120', 'Mozilla', 'GeForce', ...ips]) assert.ok(!text.includes(trace), `no ${trace} in storage`);
});

// --------------------------------------------------------------- idempotency

test('positive: a repeat through the database returns the stored decision and writes nothing new', async () => {
  const service = serviceFor();
  const sub = crypto.randomUUID();
  const first = await service.check(req({ submissionId: sub, market: 'IN', observedIp: IPS.vpn }));
  const [d, e] = [await count('payout_signal_decisions'), await count('creator_signal_events')];
  const second = await service.check(req({ submissionId: sub, market: 'IN', observedIp: IPS.vpn }));
  assert.equal(second.replayed, true);
  assert.deepEqual([second.outcome, second.reasonCodes], [first.outcome, first.reasonCodes]);
  assert.deepEqual([await count('payout_signal_decisions'), await count('creator_signal_events')], [d, e]);
});

test('positive: a retry during a feed outage still returns the original decision', async () => {
  const sub = crypto.randomUUID();
  const keyRing = makeKeyRing(); // one ring, as a real server would hold
  await serviceFor({ keyRing }).check(req({ submissionId: sub, market: 'IN' }));
  const down = serviceFor({ keyRing, ipAdapter: { lookup: async () => { throw new Error('down'); } } });
  const retry = await down.check(req({ submissionId: sub, market: 'IN' }));
  assert.equal(retry.outcome, 'pass');
  assert.equal(retry.replayed, true);
});

test('negative: a reused submission id with a different device, address, creator or moment is rejected and the row is unchanged', async () => {
  const keyRing = makeKeyRing();
  const service = serviceFor({ keyRing });
  const sub = crypto.randomUUID();
  await service.check(req({ submissionId: sub }));
  const before = JSON.stringify(await row(sub));
  const other = desktopPayload({ components: { screen: { is_touchscreen: true, maxTouchPoints: 5, colorDepth: 30, mediaMatches: [] } } });
  for (const [why, change] of [
    ['device', { rawDevicePayload: other }], ['address', { observedIp: IPS.tor }],
    ['creator', { creatorProfileId: otherProfile }], ['moment', { moment: 'payout_request' }],
  ]) {
    await assert.rejects(() => service.check(req({ submissionId: sub, ...change })), ReplayMismatchError, why);
  }
  assert.equal(JSON.stringify(await row(sub)), before);
});

test('positive: a decision made under a retired key is still recognized as the same device by key id', async () => {
  const q3 = crypto.randomBytes(32);
  const q4 = crypto.randomBytes(32);
  const { KeyRing } = await import('../key-ring.mjs');
  const oldRing = new KeyRing({ activeKeyId: 'k-2026-q3', keys: { 'k-2026-q3': q3 } });
  const newRing = new KeyRing({ activeKeyId: 'k-2026-q4', keys: { 'k-2026-q3': q3, 'k-2026-q4': q4 } });
  const a = crypto.randomUUID();
  const b = crypto.randomUUID();
  await serviceFor({ keyRing: oldRing }).check(req({ submissionId: a }));
  await serviceFor({ keyRing: newRing }).check(req({ submissionId: b }));
  const [ra, rb] = [await row(a), await row(b)];
  assert.equal(ra.hash_key_id, 'k-2026-q3');
  assert.equal(rb.hash_key_id, 'k-2026-q4');
  assert.notEqual(ra.device_hash, rb.device_hash, 'different keys give different hashes, so the id is what links them');
  const { processDevicePayload } = await import('../device-processor.mjs');
  assert.equal(processDevicePayload(desktopPayload(), newRing).hashKeyId, 'k-2026-q4');
  assert.equal(newRing.digest('device', 'x', ra.hash_key_id), oldRing.digest('device', 'x'), 'the retired key still verifies the old row');
});

// -------------------------------------------------- roles that must be refused

test('negative: without service_role the service cannot read or record, so nothing is decided', async () => {
  for (const [role, uid] of [['anon', null], ['authenticated', TEST_USERS.creator_alice.id], ['authenticated', TEST_USERS.admin.id]]) {
    const before = [await count('payout_signal_decisions'), await count('creator_signal_events')];
    // the existing-decision read runs first and is refused, so this is a storage failure.
    await assert.rejects(() => serviceFor({ role, uid }).check(req({ market: 'IN' })), (e) => {
      assert.ok(e instanceof CheckNotRecordedError || e instanceof PolicyUnavailableError, `${role} ${e.name}`);
      assert.ok(!`${e.message} ${JSON.stringify(e)}`.includes('sculptura_private'), 'no table name in the error');
      return true;
    }, `${role} ${uid ?? ''}`);
    assert.deepEqual([await count('payout_signal_decisions'), await count('creator_signal_events')], before, `${role} wrote nothing`);
  }
});

test('negative: a recorder with a missing privilege surfaces a storage failure with no sql in it', async () => {
  const policyOnly = queryAs('service_role');
  const noWrite = createDbRecorder(async (sql, params) => {
    if (sql.includes('record_payout_signal_check')) return queryAs('authenticated', TEST_USERS.admin.id)(sql, params);
    return policyOnly(sql, params);
  });
  const service = new PayoutSignalCheckService({
    ipAdapter: new FreeIpIntelligenceAdapter({ sources }), keyRing: makeKeyRing(),
    territoryListStore: createDbTerritoryListStore(policyOnly),
    policyStore: createDbPolicyStore(policyOnly), recorder: noWrite,
  });
  await assert.rejects(() => service.check(req()), (e) => {
    assert.ok(e instanceof CheckNotRecordedError);
    assert.ok(!`${e.message} ${JSON.stringify(e)}`.includes('record_payout_signal_check'));
    assert.equal(e.causeCode, '42501');
    return true;
  });
});

test('positive: an admin reads the decision, flags and attribution through the rpc, and a creator cannot', async () => {
  const sub = crypto.randomUUID();
  await serviceFor().check(req({ submissionId: sub, market: 'PK', observedIp: IPS.openProxy }));
  const asAdmin = await queryAs('authenticated', TEST_USERS.admin.id)('select public.admin_get_payout_signals($1::uuid, 50) as r', [profile]);
  const decision = asAdmin.rows[0].r.decisions.find((d) => d.submission_id === sub);
  assert.deepEqual(decision.reason_codes, ['proxy_detected']);
  assert.equal(decision.network_flags.proxy.source_id, 'ip2proxy-lite-px2');
  assert.ok(asAdmin.rows[0].r.events.some((e) => e.submission_id === sub));
  await assert.rejects(() => queryAs('authenticated', TEST_USERS.creator_alice.id)('select public.admin_get_payout_signals($1::uuid)', [profile]), /admin authorization required/);
});

// -------------------------------------------------------------- adapter swap

test('positive: the same database-backed service runs with a commercial adapter and closes the ipv6 gap', async () => {
  const free = serviceFor();
  const commercial = serviceFor({ ipAdapter: new StubCommercialAdapter() });
  const v6 = () => req({ market: 'IN', observedIp: '2001:db8::77' });
  const a = await free.check(v6());
  const b = await commercial.check(v6());
  assert.deepEqual(a.reasonCodes, ['coverage_unavailable']);
  assert.deepEqual(b.reasonCodes, ['vpn_detected']);
  const stored = await row(b.submissionId);
  assert.equal(stored.adapter_version, 'commercial-stub-1');
  assert.equal(stored.network_flags.vpn.coverage, 'full');
});
