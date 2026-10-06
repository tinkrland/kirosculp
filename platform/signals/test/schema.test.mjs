// batch 2 tests: migration 0011 against the cumulative schema replay.
// covers grants vs rls, constraints, atomicity, idempotency, append-only history,
// the 12-month purge, and the no-geography-in-trust invariant.
// run with: node --test platform/signals/test/
//
// local pglite only. this does not prove live supabase or postgrest behavior.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTestDatabase } from '../../../scripts/build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from '../../../scripts/seed-security-test-data.mjs';
import {
  checkGeographyInvariant,
  columnLooksGeographic,
  EXPECTED_TRUST_TABLES,
} from '../../../scripts/check-trust-schema-invariant.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// the builder and seeder are chatty; keep test output readable.
const originalLog = console.log;
console.log = () => {};
const db = await buildTestDatabase();
await seedTestData(db);
console.log = originalLog;
after(async () => { await db.close(); });

const ADMIN = TEST_USERS.admin.id;
const ALICE = TEST_USERS.creator_alice.id;
const CAROL = TEST_USERS.buyer_carol.id;
const aliceProfile = (await db.query('select id from public.creator_profiles where user_id = $1', [ALICE])).rows[0].id;
const bobProfile = (await db.query('select id from public.creator_profiles where user_id = $1', [TEST_USERS.creator_bob.id])).rows[0].id;

/** run fn inside a transaction as the given role and jwt subject. rolls back on error. */
async function as(role, uid, fn) {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    if (uid) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    return fn(tx);
  });
}

/** classify a failure the way the existing denial harness does: grant layer vs rls vs other. */
async function failure(fn) {
  try { await fn(); } catch (e) { return e; }
  assert.fail('expected the statement to fail');
}
const isGrantBlock = (e) => /permission denied/i.test(e.message);

const hex = (c) => c.repeat(64);
const flag = (value, source, coverage = 'full') => ({
  value, coverage, source_id: source, dataset_version: '2026-10-05',
});
const cleanFlags = () => ({
  proxy: flag(false, 'ip2proxy-lite-px2'),
  vpn: flag(false, 'x4bnet-vpn'),
  tor: flag(false, 'tor-bulk-exit'),
  datacenter: flag(false, 'x4bnet-datacenter'),
});
// batch 2 fixtures predate the batch 8 geo column; "not evaluated" is accurate
// here since none of these tests exercise the embargoed-territory check.
const noGeo = () => ({ country_code: null, coverage: 'none', source_id: null, dataset_version: null });

function args(o = {}) {
  const v = {
    creator: aliceProfile, moment: 'payout_onboarding', submission: crypto.randomUUID(),
    deviceHash: hex('a'), ipDigest: hex('b'), keyId: 'k-2026-q4', collection: 'complete',
    features: { schema_version: '1', component_coverage: 0.9, automation_indicators: [], inconsistency_indicators: [] },
    processor: 'p1', policy: 'v1', checks: ['proxy', 'vpn'], outcome: 'pass', reasons: [],
    flags: cleanFlags(), adapter: 'a1', geo: noGeo(), ...o,
  };
  return [
    v.creator, v.moment, v.submission, v.deviceHash, v.ipDigest, v.keyId, v.collection,
    JSON.stringify(v.features), v.processor, v.policy, JSON.stringify(v.checks), v.outcome,
    JSON.stringify(v.reasons), JSON.stringify(v.flags), v.adapter, JSON.stringify(v.geo),
  ];
}
const RECORD_SQL = `select public.record_payout_signal_check(
  $1::uuid,$2,$3::uuid,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb,$12,$13::jsonb,$14::jsonb,$15,$16::jsonb) as r`;
const record = (o, role = 'service_role') => as(role, null, (tx) => tx.query(RECORD_SQL, args(o)));
const count = async (table) =>
  (await db.query(`select count(*)::int as n from sculptura_private.${table}`)).rows[0].n;

// ------------------------------------------------------------- replay / policy

test('positive: 0011 applies in the cumulative replay and creates the three tables', async () => {
  const t = await db.query(
    `select table_name from information_schema.tables
      where table_schema = 'sculptura_private' and table_name in
        ('payout_signal_policy','creator_signal_events','payout_signal_decisions')
      order by table_name`);
  assert.deepEqual(t.rows.map((r) => r.table_name),
    ['creator_signal_events', 'payout_signal_decisions', 'payout_signal_policy']);
});

test('positive: the v1 policy seed makes proxy and vpn mandatory in in, pk, bd only', async () => {
  const rows = (await db.query(
    `select market, mandatory_checks, positive_outcome from sculptura_private.payout_signal_policy
      where policy_version = 'v1' order by market`)).rows;
  const byMarket = Object.fromEntries(rows.map((r) => [r.market, r]));
  assert.deepEqual(Object.keys(byMarket).sort(), ['BD', 'DEFAULT', 'IN', 'PK']);
  for (const m of ['IN', 'PK', 'BD']) {
    assert.deepEqual([...byMarket[m].mandatory_checks].sort(), ['proxy', 'vpn'], m);
    assert.equal(byMarket[m].positive_outcome, 'needs_review', `${m} positive goes to review (ruling 1)`);
  }
  assert.deepEqual(byMarket.DEFAULT.mandatory_checks, []);
});

test('positive: every policy market exists in creator-payout-rails.json', () => {
  const rails = JSON.parse(fs.readFileSync(
    path.join(root, 'operations/country-rollout/creator-payout-rails.json'), 'utf8'));
  const railMarkets = new Set(rails.markets.map((m) => m.market));
  return db.query(`select distinct market from sculptura_private.payout_signal_policy where market <> 'DEFAULT'`)
    .then(({ rows }) => {
      assert.ok(rows.length >= 3);
      for (const { market } of rows) assert.ok(railMarkets.has(market), `${market} is in the rails matrix`);
    });
});

test('negative: policy rows outside the closed vocabulary are rejected', async () => {
  const bad = [
    ["'v2','in','{}','needs_review'", 'lowercase market'],
    ["'v2','IND','{}','needs_review'", 'three letter market'],
    ["'v2','IN','{geo}','needs_review'", 'unknown check name'],
    ["'v2','IN','{}','ban'", 'unknown positive outcome'],
    ["'V2','IN','{}','needs_review'", 'uppercase policy version'],
  ];
  for (const [values, why] of bad) {
    const e = await failure(() => db.query(
      `insert into sculptura_private.payout_signal_policy (policy_version, market, mandatory_checks, positive_outcome)
       values (${values.replace("'{}'", "'{}'::text[]").replace("'{geo}'", "'{geo}'::text[]")})`));
    assert.equal(e.code, '23514', why);
  }
  const dup = await failure(() => db.query(
    `insert into sculptura_private.payout_signal_policy (policy_version, market) values ('v1','IN')`));
  assert.equal(dup.code, '23505', 'duplicate (version, market) is rejected');
});

// ------------------------------------------------------------------ access

test('positive: service_role records a check and admin reads it back through the rpc', async () => {
  const sub = crypto.randomUUID();
  const { rows } = await record({ submission: sub });
  assert.equal(rows[0].r.outcome, 'pass');
  assert.equal(rows[0].r.replayed, false);

  const read = await as('authenticated', ADMIN, (tx) =>
    tx.query('select public.admin_get_payout_signals($1::uuid, 10) as r', [aliceProfile]));
  const { decisions, events } = read.rows[0].r;
  assert.ok(decisions.some((d) => d.submission_id === sub), 'decision visible to admin');
  assert.ok(events.some((e) => e.submission_id === sub), 'stored features visible to admin');
  const d = decisions.find((x) => x.submission_id === sub);
  assert.equal(d.request_digest, undefined, 'replay digest is not exposed');
  assert.ok(d.network_flags.vpn.source_id, 'source attribution is visible');
});

test('positive control: admin sees rows by direct select, so rls filters rather than blanket-denies', async () => {
  const r = await as('authenticated', ADMIN, (tx) =>
    tx.query('select count(*)::int as n from sculptura_private.payout_signal_decisions'));
  assert.ok(r.rows[0].n >= 1);
});

test('negative (rls): non-admin authenticated users select zero rows from all three tables', async () => {
  for (const uid of [ALICE, CAROL]) {
    for (const t of ['payout_signal_decisions', 'creator_signal_events', 'payout_signal_policy']) {
      const r = await as('authenticated', uid, (tx) =>
        tx.query(`select count(*)::int as n from sculptura_private.${t}`));
      assert.equal(r.rows[0].n, 0, `${uid} sees no ${t} rows`);
    }
  }
});

test('negative (grant layer): anon cannot reach the private schema at all', async () => {
  for (const t of ['payout_signal_decisions', 'creator_signal_events', 'payout_signal_policy']) {
    const e = await failure(() => as('anon', null, (tx) => tx.query(`select 1 from sculptura_private.${t}`)));
    assert.ok(isGrantBlock(e), `anon blocked at the grant layer for ${t}: ${e.message}`);
  }
});

test('negative: the admin rpc rejects non-admins and anon before looking up the creator', async () => {
  const e1 = await failure(() => as('authenticated', ALICE, (tx) =>
    tx.query('select public.admin_get_payout_signals($1::uuid)', [aliceProfile])));
  assert.equal(e1.code, '42501');
  const e2 = await failure(() => as('anon', null, (tx) =>
    tx.query('select public.admin_get_payout_signals($1::uuid)', [aliceProfile])));
  assert.ok(isGrantBlock(e2), 'anon is blocked before the function body runs');
});

test('negative: no client role, including admin and service_role, has a direct write path', async () => {
  const stmts = [
    `insert into sculptura_private.payout_signal_decisions (creator_profile_id) values ('${aliceProfile}')`,
    `update sculptura_private.payout_signal_decisions set outcome = 'pass'`,
    `delete from sculptura_private.payout_signal_decisions`,
    `insert into sculptura_private.creator_signal_events (creator_profile_id) values ('${aliceProfile}')`,
    `update sculptura_private.creator_signal_events set hash_key_id = 'x'`,
    `delete from sculptura_private.creator_signal_events`,
    `update sculptura_private.payout_signal_policy set positive_outcome = 'fail'`,
    `delete from sculptura_private.payout_signal_policy`,
  ];
  const roles = [['anon', null], ['authenticated', ALICE], ['authenticated', ADMIN], ['service_role', null]];
  for (const [role, uid] of roles) {
    for (const sql of stmts) {
      const e = await failure(() => as(role, uid, (tx) => tx.query(sql)));
      assert.ok(isGrantBlock(e), `${role} blocked at the grant layer: ${sql.slice(0, 60)}`);
    }
  }
});

test('negative: only service_role can execute the write and purge functions', async () => {
  for (const [role, uid] of [['anon', null], ['authenticated', ALICE], ['authenticated', ADMIN]]) {
    const e1 = await failure(() => record({}, role).then(() => {}));
    assert.ok(isGrantBlock(e1), `${role} cannot record`);
    const e2 = await failure(() => as(role, uid, (tx) =>
      tx.query('select sculptura_private.purge_expired_signal_events()')));
    assert.ok(isGrantBlock(e2), `${role} cannot purge`);
  }
});

// -------------------------------------------------------------- constraints

test('negative: invalid moment, outcome, reason code and shape are rejected with check violations', async () => {
  const cases = [
    [{ moment: 'signup' }, 'moment outside the two money moments'],
    [{ moment: 'checkout' }, 'ordinary checkout is not a money moment'],
    [{ outcome: 'allow' }, 'unknown outcome'],
    [{ outcome: 'needs_review', reasons: ['because'] }, 'unknown reason code'],
    [{ outcome: 'pass', reasons: ['vpn_detected'] }, 'pass must carry no reason'],
    [{ outcome: 'needs_review', reasons: [] }, 'non-pass must carry a reason'],
    [{ deviceHash: 'not-hex' }, 'device hash shape'],
    [{ ipDigest: '203.0.113.9' }, 'a plaintext ip is not a valid digest'],
    [{ keyId: 'K 1' }, 'key id shape'],
    [{ collection: 'complete', deviceHash: null }, 'complete collection needs a hash'],
    [{ collection: 'unavailable' }, 'unavailable collection must have no hash'],
    [{ checks: ['geo'] }, 'unknown check name'],
  ];
  for (const [o, why] of cases) {
    const e = await failure(() => record(o));
    assert.equal(e.code, '23514', `${why}: ${e.message}`);
  }
});

test('negative: network flags must attribute their source, and coverage none can never be true', async () => {
  const noSource = cleanFlags(); noSource.vpn.source_id = null;
  const e1 = await failure(() => record({ flags: noSource }));
  assert.equal(e1.code, '23514', 'an evaluated flag without a source is rejected');

  const noneTrue = cleanFlags(); noneTrue.tor = { value: true, coverage: 'none', source_id: null, dataset_version: null };
  const e2 = await failure(() => record({ flags: noneTrue }));
  assert.equal(e2.code, '23514', 'a flag that was not evaluated cannot be true');

  const extra = cleanFlags(); extra.vpn.country = 'IN';
  const e3 = await failure(() => record({ flags: extra }));
  assert.equal(e3.code, '23514', 'a geography key cannot ride along inside a flag');

  const unknownFlag = { ...cleanFlags(), residential: flag(false, 'x') };
  const e4 = await failure(() => record({ flags: unknownFlag }));
  assert.equal(e4.code, '23514', 'unknown flag name');
});

test('positive: a not-evaluated flag is stored as coverage none and false, never as clean', async () => {
  const flags = cleanFlags();
  for (const k of ['vpn', 'tor', 'datacenter']) {
    flags[k] = { value: false, coverage: 'none', source_id: null, dataset_version: null };
  }
  const sub = crypto.randomUUID();
  await record({ submission: sub, flags, outcome: 'needs_review', reasons: ['coverage_unavailable'] });
  const row = (await db.query(
    'select network_flags from sculptura_private.payout_signal_decisions where submission_id = $1', [sub])).rows[0];
  assert.equal(row.network_flags.vpn.coverage, 'none');
  assert.equal(row.network_flags.vpn.value, false);
});

test('negative: device features are a closed shape, so a raw payload cannot be stored', async () => {
  const rawish = [
    { user_agent: 'Mozilla/5.0', canvas: 'abc' },
    { schema_version: '1', screen_resolution: '1920x1080' },
    { schema_version: '1', automation_indicators: ['Has Spaces'] },
    { schema_version: '1', component_coverage: 2 },
    { schema_version: 'x'.repeat(40) },
    { schema_version: '1', automation_indicators: Array.from({ length: 20 }, (_, i) => `i${i}`) },
  ];
  for (const features of rawish) {
    const e = await failure(() => record({ features }));
    assert.equal(e.code, '23514', JSON.stringify(features).slice(0, 60));
  }
});

test('negative: a failed write is atomic and leaves neither an event nor a decision', async () => {
  const before = [await count('creator_signal_events'), await count('payout_signal_decisions')];
  const sub = crypto.randomUUID();
  const bad = cleanFlags(); bad.vpn.source_id = null;
  await failure(() => record({ submission: sub, flags: bad }));
  assert.deepEqual([await count('creator_signal_events'), await count('payout_signal_decisions')], before);
  const left = await db.query('select 1 from sculptura_private.creator_signal_events where submission_id = $1', [sub]);
  assert.equal(left.rows.length, 0);
});

// ------------------------------------------------------------- idempotency

test('positive: replaying the same submission returns the original decision without a duplicate', async () => {
  const o = { submission: crypto.randomUUID(), outcome: 'needs_review', reasons: ['vpn_detected'],
    flags: { ...cleanFlags(), vpn: flag(true, 'x4bnet-vpn') } };
  const first = (await record(o)).rows[0].r;
  const second = (await record(o)).rows[0].r;
  assert.equal(first.replayed, false);
  assert.equal(second.replayed, true);
  assert.equal(second.outcome, 'needs_review');
  const n = await db.query('select count(*)::int as n from sculptura_private.payout_signal_decisions where submission_id = $1', [o.submission]);
  assert.equal(n.rows[0].n, 1);
});

test('negative: reusing a submission id with changed input is rejected and nothing is overwritten', async () => {
  const sub = crypto.randomUUID();
  await record({ submission: sub });
  const e = await failure(() => record({ submission: sub, outcome: 'needs_review', reasons: ['vpn_detected'] }));
  assert.equal(e.code, '22023');
  const stored = (await db.query('select outcome from sculptura_private.payout_signal_decisions where submission_id = $1', [sub])).rows[0];
  assert.equal(stored.outcome, 'pass', 'the original decision is intact');
});

test('negative: a decision for one creator cannot be replayed under another creator', async () => {
  const sub = crypto.randomUUID();
  await record({ submission: sub, creator: aliceProfile });
  const e = await failure(() => record({ submission: sub, creator: bobProfile }));
  assert.equal(e.code, '22023');
});

// ------------------------------------------------------ append-only and purge

test('negative: events are never updated, decisions are never edited, and truncate is refused', async () => {
  const sub = crypto.randomUUID();
  await record({ submission: sub });
  const stmts = [
    [`update sculptura_private.creator_signal_events set hash_key_id = 'k-x' where submission_id = '${sub}'`, 'event update'],
    [`update sculptura_private.payout_signal_decisions set outcome = 'fail' where submission_id = '${sub}'`, 'decision update'],
    [`delete from sculptura_private.payout_signal_decisions where submission_id = '${sub}'`, 'decision delete'],
    [`delete from sculptura_private.creator_signal_events where submission_id = '${sub}'`, 'event delete outside the purge'],
    ['truncate sculptura_private.creator_signal_events', 'event truncate'],
    ['truncate sculptura_private.payout_signal_decisions', 'decision truncate'],
  ];
  for (const [sql, why] of stmts) {
    // run as the owner: the triggers must hold even for the role that could otherwise write.
    const e = await failure(() => db.query(sql));
    assert.equal(e.code, '42501', why);
  }
});

test('positive: the purge removes events older than 12 months, keeps newer ones, and keeps decisions', async () => {
  const insert = async (sub, age) => {
    await db.query(
      `insert into sculptura_private.creator_signal_events
         (creator_profile_id, moment, submission_id, device_hash, ip_digest, hash_key_id,
          collection_status, device_features, processor_version, occurred_at)
       values ($1,'payout_request',$2,$3,$4,'k-2025-q1','complete','{}','p1', now() - $5::interval)`,
      [aliceProfile, sub, hex('c'), hex('d'), age]);
    await db.query(
      `insert into sculptura_private.payout_signal_decisions
         (creator_profile_id, moment, submission_id, request_digest, policy_version,
          selected_checks, outcome, reason_codes, network_flags, adapter_version, occurred_at)
       values ($1,'payout_request',$2,$3,'v1','[]','pass','[]',$4::jsonb,'a1', now() - $5::interval)`,
      [aliceProfile, sub, hex('e'), JSON.stringify(cleanFlags()), age]);
  };
  const oldSub = crypto.randomUUID();
  const freshSub = crypto.randomUUID();
  await insert(oldSub, '13 months');
  await insert(freshSub, '11 months');

  const deleted = (await as('service_role', null, (tx) =>
    tx.query('select sculptura_private.purge_expired_signal_events() as n'))).rows[0].n;
  assert.ok(deleted >= 1, 'at least the 13 month old event was purged');

  const ev = async (sub) => (await db.query('select 1 from sculptura_private.creator_signal_events where submission_id = $1', [sub])).rows.length;
  const dec = async (sub) => (await db.query('select 1 from sculptura_private.payout_signal_decisions where submission_id = $1', [sub])).rows.length;
  assert.equal(await ev(oldSub), 0, 'old event purged');
  assert.equal(await ev(freshSub), 1, 'event inside 12 months kept');
  assert.equal(await dec(oldSub), 1, 'the old decision survives the event purge');

  // the purge flag is transaction-local: a plain delete is refused again afterwards.
  const e = await failure(() => db.query(`delete from sculptura_private.creator_signal_events where submission_id = '${freshSub}'`));
  assert.equal(e.code, '42501');
});

// ----------------------------------------------- trust untouched / invariant

test('positive: the trust tables keep exactly their original columns', async () => {
  const cols = async (t) => (await db.query(
    `select column_name from information_schema.columns
      where table_schema='sculptura_private' and table_name=$1 order by ordinal_position`, [t])).rows.map((r) => r.column_name);
  assert.deepEqual(await cols('creator_trust'), [
    'creator_profile_id', 'level_key', 'review_state', 'policy_version', 'decision_reason',
    'evidence_refs', 'revision', 'assessed_by', 'created_at', 'updated_at']);
  assert.deepEqual(await cols('buyer_trust'), [
    'buyer_user_id', 'level_key', 'review_state', 'policy_version', 'decision_reason',
    'evidence_refs', 'revision', 'assessed_by', 'created_at', 'updated_at']);
});

test('positive: recording signal checks writes nothing to any trust table', async () => {
  const n = async () => (await db.query(
    `select (select count(*) from sculptura_private.creator_trust)
          + (select count(*) from sculptura_private.creator_trust_events)
          + (select count(*) from sculptura_private.buyer_trust)
          + (select count(*) from sculptura_private.buyer_trust_events) as n`)).rows[0].n;
  const before = await n();
  await record({ outcome: 'needs_review', reasons: ['vpn_detected'], flags: { ...cleanFlags(), vpn: flag(true, 'x4bnet-vpn') } });
  assert.equal(await n(), before);
});

test('positive: the geography invariant holds on the cumulative schema', async () => {
  const r = await checkGeographyInvariant(db);
  assert.deepEqual(r.missingTrustTables, []);
  assert.deepEqual(r.trustViolations, []);
  assert.deepEqual(r.signalViolations, []);
  assert.deepEqual(r.crossReferences, []);
  assert.equal(r.ok, true);
  for (const t of EXPECTED_TRUST_TABLES) assert.ok(r.trustTables.includes(t));
});

test('negative: the invariant fails for a throwaway trust table with a corridor column', async () => {
  await db.exec('create table sculptura_private.throwaway_trust (id int, corridor text)');
  try {
    const r = await checkGeographyInvariant(db);
    assert.equal(r.ok, false);
    assert.deepEqual(r.trustViolations, [{ table: 'throwaway_trust', column: 'corridor' }]);
  } finally {
    await db.exec('drop table sculptura_private.throwaway_trust');
  }
  assert.equal((await checkGeographyInvariant(db)).ok, true, 'clean again after cleanup');
});

test('negative: the invariant fails when a signal evidence table gains a market column', async () => {
  await db.exec('alter table sculptura_private.payout_signal_decisions add column market text');
  try {
    const r = await checkGeographyInvariant(db);
    assert.equal(r.ok, false);
    assert.deepEqual(r.signalViolations, [{ table: 'payout_signal_decisions', column: 'market' }]);
  } finally {
    await db.exec('alter table sculptura_private.payout_signal_decisions drop column market');
  }
});

test('negative: the invariant fails when a foreign key links signals to trust', async () => {
  await db.exec(`alter table sculptura_private.payout_signal_decisions
    add constraint throwaway_fk foreign key (creator_profile_id)
    references sculptura_private.creator_trust (creator_profile_id) not valid`);
  try {
    const r = await checkGeographyInvariant(db);
    assert.equal(r.ok, false);
    assert.deepEqual(r.crossReferences, [{ from: 'payout_signal_decisions', to: 'creator_trust' }]);
  } finally {
    await db.exec('alter table sculptura_private.payout_signal_decisions drop constraint throwaway_fk');
  }
});

test('negative: the invariant refuses to pass vacuously when the trust tables are missing', async () => {
  const empty = { query: async () => ({ rows: [] }) };
  const r = await checkGeographyInvariant(empty);
  assert.equal(r.ok, false);
  assert.deepEqual(r.missingTrustTables, EXPECTED_TRUST_TABLES);
});

test('unit: column name matching is by whole token', () => {
  for (const name of ['corridor', 'market', 'market_code', 'country', 'geo_region', 'iso_code', 'time_zone_tz']) {
    assert.equal(columnLooksGeographic(name), true, name);
  }
  for (const name of ['policy_version', 'isolation_level', 'evidence_refs', 'level_key', 'creator_profile_id', 'submission_id']) {
    assert.equal(columnLooksGeographic(name), false, name);
  }
});
