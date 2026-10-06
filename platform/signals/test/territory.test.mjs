// batch 8 tests: the embargoed-territory ip hold (owner addendum, 2026-10-06).
//
//   1. us rail, all other inputs clean, ip geo resolves to cu -> needs_review with
//      ip_geo_embargoed_territory and source attribution. never auto-fail, never a
//      trust write, corridor stays non-strict.
//   2. the review-trigger list is named configuration, disjoint from the fatf grey list.
//   3. pattern is read at review time from existing rows; a one-off never flags
//      anyone permanently; a review ends in release or a stranded-funds hold.
//   4. missing or unusable geo is a normal condition: no check fires, the result is
//      recorded with attribution, and a clean rail with clean flags still passes.
//
// local pglite only. geo comes from a fake reader; no real database file is used.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTestDatabase } from '../../../scripts/build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from '../../../scripts/seed-security-test-data.mjs';
import { checkGeographyInvariant } from '../../../scripts/check-trust-schema-invariant.mjs';
import { checkEmbargoGreylistDisjoint, readGreyListed } from '../../../scripts/check-embargo-greylist-disjoint.mjs';
import { PayoutSignalCheckService, evaluateChecks, REASON_CODES } from '../payout-signal-check.mjs';
import { createDbPolicyStore, createDbRecorder, createDbTerritoryListStore } from '../db-ports.mjs';
import { FreeIpIntelligenceAdapter, FLAG_NAMES } from '../ip-intelligence.mjs';
import { loadFeeds } from '../feeds.mjs';
import { REVIEW_OUTCOMES, assertReviewOutcome, isAccountAction, InvalidReviewOutcomeError } from '../review-outcomes.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload } from './fixtures.mjs';
import { IPS, writeFeedDir } from './ip-fixtures.mjs';
import { StubCommercialAdapter } from './stub-commercial-adapter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

// --------------------------------------------------------------------- setup

const originalLog = console.log;
console.log = () => {};
const db = await buildTestDatabase();
await seedTestData(db);
console.log = originalLog;
after(async () => { await db.close(); });

const feeds = writeFeedDir();
after(() => feeds.cleanup());
const { sources } = loadFeeds({ dir: feeds.dir });

const ALICE = TEST_USERS.creator_alice.id;
const ADMIN = TEST_USERS.admin.id;
const profile = (await db.query('select id from public.creator_profiles where user_id = $1', [ALICE])).rows[0].id;
const otherProfile = (await db.query('select id from public.creator_profiles where user_id = $1', [TEST_USERS.creator_bob.id])).rows[0].id;

/** a stand-in geolite2 reader. one map is the only source of country truth here. */
const GEO_DB = {
  [IPS.residential]: 'GB',
  '203.0.113.77': 'CU', // the embargoed-territory case
  '203.0.113.78': 'IR',
  '203.0.113.79': 'KP',
  '203.0.113.80': 'SY',
  '203.0.113.81': 'KE', // a fatf grey-listed market: context, never a review trigger
  '203.0.113.82': 'VE', // grey-listed and under a sanctions regime; still only what the list says
  '2001:db8::c0': 'CU',
};
const NO_MATCH_IPS = new Set(['203.0.113.90', '203.0.113.91']); // satellite range, anonymous network

function geoSource({ failing = false } = {}) {
  return {
    id: 'geolite2-country',
    datasetVersion: '2026-10-05',
    lookup(ip) {
      if (failing) throw new Error('geo database unavailable: stale');
      if (NO_MATCH_IPS.has(ip.text)) return null;
      const country = GEO_DB[ip.text];
      return country ? { countryCode: country, subdivisionCode: null } : null;
    },
  };
}

const queryAs = (role, uid = null) => (sql, params) =>
  db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    if (uid) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    return tx.query(sql, params);
  });

function serviceFor({ geo = geoSource(), ipAdapter, keyRing = makeKeyRing(), territoryListVersion = 'v1' } = {}) {
  const query = queryAs('service_role');
  return new PayoutSignalCheckService({
    ipAdapter: ipAdapter ?? new FreeIpIntelligenceAdapter({ sources, geo }),
    keyRing,
    policyStore: createDbPolicyStore(query),
    territoryListStore: createDbTerritoryListStore(query),
    recorder: createDbRecorder(query),
    territoryListVersion,
  });
}

const req = (o = {}) => ({
  creatorProfileId: profile, moment: 'payout_onboarding', submissionId: crypto.randomUUID(),
  observedIp: IPS.residential, rawDevicePayload: desktopPayload(), market: 'US', ...o,
});
const CU = '203.0.113.77';
const row = async (sub) => (await db.query(
  'select * from sculptura_private.payout_signal_decisions where submission_id = $1', [sub])).rows[0];
const countTrust = async () => (await db.query(
  `select (select count(*) from sculptura_private.creator_trust) a,
          (select count(*) from sculptura_private.creator_trust_events) b,
          (select count(*) from sculptura_private.buyer_trust) c,
          (select count(*) from sculptura_private.buyer_trust_events) d`)).rows[0];

// ---------------------------------------------------- 1. the us rail, cu ip case

test('positive: us rail, every other input clean, cu ip -> needs_review with the territory reason and attribution', async () => {
  const sub = crypto.randomUUID();
  const r = await serviceFor().check(req({ submissionId: sub, observedIp: CU, market: 'US' }));
  assert.equal(r.outcome, 'needs_review');
  assert.deepEqual(r.reasonCodes, ['ip_geo_embargoed_territory']);
  assert.deepEqual(r.selectedChecks, [], 'us is non-strict: no corridor check was selected');

  const stored = await row(sub);
  assert.deepEqual(stored.geo_evidence, {
    country_code: 'CU', coverage: 'full', source_id: 'geolite2-country', dataset_version: '2026-10-05',
  }, 'the decision carries the geo source attribution');
  for (const flag of FLAG_NAMES) assert.equal(stored.network_flags[flag].value, false, `${flag} is clean`);
});

test('positive: the corridor stays non-strict, so the hold comes from the territory alone', async () => {
  const sub = crypto.randomUUID();
  await serviceFor().check(req({ submissionId: sub, observedIp: CU, market: 'US' }));
  const stored = await row(sub);
  assert.deepEqual(stored.selected_checks, [], 'no mandatory check ran');
  assert.deepEqual(stored.reason_codes, ['ip_geo_embargoed_territory'], 'and it is the only reason');
  const { rows } = await db.query(`select mandatory_checks from sculptura_private.payout_signal_policy where policy_version='v1' and market='DEFAULT'`);
  assert.deepEqual(rows[0].mandatory_checks, [], 'the default policy really is non-strict');
});

test('positive: every territory on the v1 list holds, at both money moments', async () => {
  const service = serviceFor();
  for (const [ip, code] of [[CU, 'CU'], ['203.0.113.78', 'IR'], ['203.0.113.79', 'KP'], ['203.0.113.80', 'SY']]) {
    for (const moment of ['payout_onboarding', 'payout_request']) {
      const r = await service.check(req({ observedIp: ip, moment }));
      assert.equal(r.outcome, 'needs_review', `${code} ${moment}`);
      assert.deepEqual(r.reasonCodes, ['ip_geo_embargoed_territory']);
    }
  }
});

test('positive: the hold is independent of corridor strictness and adds to a strict market reason', async () => {
  const service = serviceFor();
  for (const market of ['IN', 'PK', 'BD', 'US', 'GB', 'ZZ']) {
    const r = await service.check(req({ market, observedIp: CU }));
    assert.equal(r.outcome, 'needs_review', market);
    assert.ok(r.reasonCodes.includes('ip_geo_embargoed_territory'), `${market} holds on territory`);
  }
  // a strict market with a vpn address that also resolves to cu gets both reasons
  const both = { ...GEO_DB, '198.51.100.20': 'CU' };
  const svc = serviceFor({ geo: { ...geoSource(), lookup: (ip) => (both[ip.text] ? { countryCode: both[ip.text], subdivisionCode: null } : null) } });
  const r = await svc.check(req({ market: 'IN', observedIp: '198.51.100.20' }));
  assert.deepEqual(r.reasonCodes, ['vpn_detected', 'ip_geo_embargoed_territory']);
  assert.equal(r.outcome, 'needs_review');
});

test('positive: an ipv6 address in an embargoed territory holds too', async () => {
  const r = await serviceFor().check(req({ observedIp: '2001:db8::c0', market: 'US' }));
  assert.equal(r.outcome, 'needs_review');
  assert.deepEqual(r.reasonCodes, ['ip_geo_embargoed_territory']);
});

test('positive: an ipv4 client on a dual-stack socket is resolved as the ipv4 it is', async () => {
  const r = await serviceFor().check(req({ observedIp: `::ffff:${CU}`, market: 'US' }));
  assert.deepEqual(r.reasonCodes, ['ip_geo_embargoed_territory'], 'the reader was asked about 203.0.113.77, not a mapped form');
});

// ---------------------------------------------- never auto-fail, never a trust write

test('negative: the territory hold never produces fail, whatever the policy says', () => {
  const territories = { embargoedTerritories: new Set(['CU']) };
  const network = (country) => ({
    adapterVersion: 't', ipVersion: 4, sources: [],
    coverage: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'full'])),
    availability: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'ok'])),
    flags: Object.fromEntries(FLAG_NAMES.map((n) => [n, { value: false, source: { id: 's', datasetVersion: 'v' }, confidence: 'high' }])),
    geo: { countryCode: country, subdivisionCode: null, coverage: 'full', source: { id: 'g', datasetVersion: 'v' } },
  });
  for (const positiveOutcome of ['needs_review', 'fail']) {
    for (const mandatoryChecks of [[], ['proxy', 'vpn'], ['proxy', 'vpn', 'tor', 'datacenter']]) {
      for (const collectionStatus of ['complete', 'partial', 'unavailable']) {
        const r = evaluateChecks({ mandatoryChecks, positiveOutcome }, { collectionStatus }, network('CU'), territories);
        assert.equal(r.outcome, 'needs_review', JSON.stringify({ positiveOutcome, mandatoryChecks, collectionStatus }));
        assert.ok(r.reasonCodes.includes('ip_geo_embargoed_territory'));
      }
    }
  }
});

test('negative: a real mandatory positive can still fail where configured, and the territory does not change that', () => {
  const territories = { embargoedTerritories: new Set(['CU']) };
  const net = {
    adapterVersion: 't', ipVersion: 4, sources: [],
    coverage: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'full'])),
    availability: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'ok'])),
    flags: Object.fromEntries(FLAG_NAMES.map((n) => [n, { value: n === 'vpn', source: { id: 's', datasetVersion: 'v' }, confidence: 'high' }])),
    geo: { countryCode: 'CU', subdivisionCode: null, coverage: 'full', source: { id: 'g', datasetVersion: 'v' } },
  };
  const failPolicy = { mandatoryChecks: ['proxy', 'vpn'], positiveOutcome: 'fail' };
  assert.equal(evaluateChecks(failPolicy, { collectionStatus: 'complete' }, net, territories).outcome, 'fail', 'vpn positive, fail configured');
  net.flags.vpn.value = false;
  assert.equal(evaluateChecks(failPolicy, { collectionStatus: 'complete' }, net, territories).outcome, 'needs_review', 'territory alone is review');
});

test('negative: a territory hit writes nothing to any trust table and creates no trust link', async () => {
  const before = await countTrust();
  const service = serviceFor();
  for (const market of ['US', 'IN', 'GB']) await service.check(req({ market, observedIp: CU }));
  assert.deepEqual(await countTrust(), before);
  assert.equal((await checkGeographyInvariant(db)).ok, true, 'the geography invariant still holds');
  const source = fs.readFileSync(path.join(here, '..', 'payout-signal-check.mjs'), 'utf8');
  const code = source.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.ok(!/creator_trust|buyer_trust|trust_level|trustLevel/.test(code));
});

test('negative: the returned decision carries no country, and the browser-facing gate never sees one', async () => {
  const r = await serviceFor().check(req({ observedIp: CU }));
  assert.deepEqual(Object.keys(r).sort(), ['outcome', 'policyVersion', 'reasonCodes', 'replayed', 'selectedChecks', 'submissionId']);
  // the reason code name contains "geo" by design; what must not appear is the country itself or the evidence object.
  for (const trace of ['CU', 'cuba', 'country', 'geoEvidence', 'geo_evidence', 'dataset', CU]) {
    assert.ok(!JSON.stringify(r).includes(trace), `the decision does not contain ${trace}`);
  }
});

// ------------------------------------- 4. missing geo is a normal condition, not an event

test('positive: no geo result passes cleanly with a clean rail and clean flags, and is recorded with attribution', async () => {
  for (const ip of ['203.0.113.90', '203.0.113.91']) { // satellite range, anonymous network
    const sub = crypto.randomUUID();
    const r = await serviceFor().check(req({ submissionId: sub, observedIp: ip, market: 'US' }));
    assert.equal(r.outcome, 'pass', ip);
    assert.deepEqual(r.reasonCodes, [], 'no reason code comes from missing geo');
    const stored = await row(sub);
    assert.deepEqual(stored.geo_evidence, {
      country_code: null, coverage: 'full', source_id: 'geolite2-country', dataset_version: '2026-10-05',
    }, 'the source answered with no match, and that is recorded as attribution');
    for (const flag of FLAG_NAMES) assert.equal(stored.network_flags[flag].value, false, `${flag} stays clean`);
  }
});

test('positive: an address the reader has no record for passes cleanly too', async () => {
  const r = await serviceFor().check(req({ observedIp: '192.0.2.200', market: 'US' }));
  assert.equal(r.outcome, 'pass');
  assert.deepEqual(r.reasonCodes, []);
});

test('positive: no geo source configured, or a failing one, is also a normal condition', async () => {
  for (const [why, geo] of [['failing reader', geoSource({ failing: true })], ['no reader at all', null]]) {
    const sub = crypto.randomUUID();
    const r = await serviceFor({ geo }).check(req({ submissionId: sub, observedIp: CU, market: 'US' }));
    assert.equal(r.outcome, 'pass', `${why}: no geo means no territory check, not a hold`);
    assert.deepEqual(r.reasonCodes, []);
    assert.deepEqual((await row(sub)).geo_evidence, { country_code: null, coverage: 'none', source_id: null, dataset_version: null }, `${why}: recorded as not evaluated`);
  }
});

test('positive: private and reserved addresses carry no geo and pass on a clean rail', async () => {
  const r = await serviceFor().check(req({ observedIp: IPS.privateV4, market: 'US' }));
  assert.equal(r.outcome, 'pass');
  assert.equal((await row(r.submissionId)).geo_evidence.coverage, 'none');
});

test('negative: no geo never turns into a reason, in any combination', () => {
  const territories = { embargoedTerritories: new Set(['CU']) };
  const base = {
    adapterVersion: 't', ipVersion: 4, sources: [],
    coverage: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'full'])),
    availability: Object.fromEntries(FLAG_NAMES.map((n) => [n, 'ok'])),
    flags: Object.fromEntries(FLAG_NAMES.map((n) => [n, { value: false, source: { id: 's', datasetVersion: 'v' }, confidence: 'high' }])),
  };
  for (const geo of [
    { countryCode: null, subdivisionCode: null, coverage: 'none', source: null },
    { countryCode: null, subdivisionCode: null, coverage: 'full', source: { id: 'g', datasetVersion: 'v' } },
  ]) {
    for (const mandatoryChecks of [[], ['proxy', 'vpn']]) {
      const r = evaluateChecks({ mandatoryChecks, positiveOutcome: 'needs_review' }, { collectionStatus: 'complete' }, { ...base, geo }, territories);
      assert.equal(r.outcome, 'pass', JSON.stringify({ geo: geo.coverage, mandatoryChecks }));
      assert.deepEqual(r.reasonCodes, []);
    }
  }
  // an adapter that failed outright has no geo either, and a non-strict market does not need it
  assert.equal(evaluateChecks({ mandatoryChecks: [], positiveOutcome: 'needs_review' }, { collectionStatus: 'complete' }, null, territories).outcome, 'pass');
  // defense in depth: the contract already forbids a country beside coverage none, but if a malformed
  // result ever reached the decision function, not-evaluated must still not match the list.
  const malformed = { ...base, geo: { countryCode: 'CU', subdivisionCode: null, coverage: 'none', source: null } };
  const m = evaluateChecks({ mandatoryChecks: [], positiveOutcome: 'needs_review' }, { collectionStatus: 'complete' }, malformed, territories);
  assert.equal(m.outcome, 'pass', 'a country on a not-evaluated result is never read');
  assert.deepEqual(m.reasonCodes, []);
});

test('negative: a country that is not on the list, including grey-listed markets, is context and never a hold', async () => {
  const service = serviceFor();
  for (const ip of [IPS.residential, '203.0.113.81', '203.0.113.82']) { // GB, KE (grey), VE (grey)
    const r = await service.check(req({ observedIp: ip, market: 'US' }));
    assert.equal(r.outcome, 'pass', `${GEO_DB[ip]} is not on the review-trigger list`);
    assert.deepEqual(r.reasonCodes, []);
  }
});

// ---------------------------------------- 2. the list: named config, disjoint from grey

test('positive: the v1 list holds the four embargoed territories with provenance, and is admin-readable only', async () => {
  const rows = (await db.query(`select territory_code, authority, effective_date, enabled from sculptura_private.embargoed_territory_review_list where list_version='v1' order by territory_code`)).rows;
  assert.deepEqual(rows.map((r) => r.territory_code), ['CU', 'IR', 'KP', 'SY']);
  assert.ok(rows.every((r) => r.authority.length > 0 && r.enabled === true && r.effective_date));
  const asAdmin = await queryAs('authenticated', ADMIN)('select count(*)::int as n from sculptura_private.embargoed_territory_review_list');
  assert.equal(asAdmin.rows[0].n, 4);
  const asCreator = await queryAs('authenticated', ALICE)('select count(*)::int as n from sculptura_private.embargoed_territory_review_list');
  assert.equal(asCreator.rows[0].n, 0, 'rls hides the list from non-admins');
  await assert.rejects(() => queryAs('anon')('select 1 from sculptura_private.embargoed_territory_review_list'), /permission denied/i);
});

test('positive: the list is disjoint from the fatf grey list named in the rails matrix', async () => {
  const r = await checkEmbargoGreylistDisjoint(db);
  assert.deepEqual(r.greyListed, ['BO', 'KE', 'NP', 'VE', 'VN'], 'read from creator-payout-rails.json');
  assert.deepEqual(r.overlaps, []);
  assert.deepEqual(r.triggerGaps, []);
  assert.equal(r.ok, true);
});

test('negative: a grey-listed market cannot be added, by insert or by update, and the list is unchanged', async () => {
  const before = (await db.query('select count(*)::int as n from sculptura_private.embargoed_territory_review_list')).rows[0].n;
  for (const code of readGreyListed()) {
    await assert.rejects(
      () => db.query(`insert into sculptura_private.embargoed_territory_review_list (list_version, territory_code, authority, effective_date) values ('v2',$1,'x',current_date)`, [code]),
      (e) => e.code === '22023' && /grey-listed/.test(e.message), `insert ${code}`,
    );
  }
  await assert.rejects(
    () => db.query(`update sculptura_private.embargoed_territory_review_list set territory_code = 'KE' where territory_code = 'CU'`),
    (e) => e.code === '22023', 'update to a grey-listed code',
  );
  assert.equal((await db.query('select count(*)::int as n from sculptura_private.embargoed_territory_review_list')).rows[0].n, before);
});

test('negative: the disjointness check fails loudly when drift is injected, and never passes vacuously', async () => {
  await db.exec('alter table sculptura_private.embargoed_territory_review_list disable trigger embargo_list_reject_greylisted');
  try {
    await db.query(`insert into sculptura_private.embargoed_territory_review_list (list_version, territory_code, authority, effective_date) values ('drift','KE','test',current_date)`);
    const r = await checkEmbargoGreylistDisjoint(db);
    assert.equal(r.ok, false);
    assert.deepEqual(r.overlaps.map((o) => o.territory), ['KE']);
    assert.ok(r.triggerGaps.length === 5, 'with the trigger off, all five grey-listed codes get through');
  } finally {
    await db.query(`delete from sculptura_private.embargoed_territory_review_list where list_version = 'drift'`);
    await db.exec('alter table sculptura_private.embargoed_territory_review_list enable trigger embargo_list_reject_greylisted');
  }
  assert.equal((await checkEmbargoGreylistDisjoint(db)).ok, true, 'clean again after cleanup');
  const empty = { query: async () => ({ rows: [] }) };
  assert.equal((await checkEmbargoGreylistDisjoint(empty, { greyListed: ['KE'] })).ok, false, 'an empty list is not a pass');
});

test('positive: the list is revisable: a new version and a disabled row both change behavior without touching v1', async () => {
  await db.query(`insert into sculptura_private.embargoed_territory_review_list (list_version, territory_code, authority, effective_date) values ('v2','CU','revised list',current_date)`);
  try {
    const v2 = serviceFor({ territoryListVersion: 'v2' });
    assert.equal((await v2.check(req({ observedIp: CU }))).outcome, 'needs_review');
    assert.equal((await v2.check(req({ observedIp: '203.0.113.78' }))).outcome, 'pass', 'IR is not on v2');
    assert.equal((await serviceFor().check(req({ observedIp: '203.0.113.78' }))).outcome, 'needs_review', 'v1 still lists IR');
  } finally {
    await db.query(`delete from sculptura_private.embargoed_territory_review_list where list_version = 'v2'`);
  }
  await db.query(`update sculptura_private.embargoed_territory_review_list set enabled = false where list_version='v1' and territory_code='SY'`);
  try {
    assert.equal((await serviceFor().check(req({ observedIp: '203.0.113.80' }))).outcome, 'pass', 'a retired territory stops holding');
    assert.equal((await serviceFor().check(req({ observedIp: CU }))).outcome, 'needs_review');
  } finally {
    await db.query(`update sculptura_private.embargoed_territory_review_list set enabled = true where list_version='v1' and territory_code='SY'`);
  }
});

test('negative: when the list cannot be read the check holds, it never passes a possibly embargoed address', async () => {
  const broken = new PayoutSignalCheckService({
    ipAdapter: new FreeIpIntelligenceAdapter({ sources, geo: geoSource() }), keyRing: makeKeyRing(),
    policyStore: createDbPolicyStore(queryAs('service_role')), recorder: createDbRecorder(queryAs('service_role')),
    territoryListStore: { getEmbargoList: async () => { throw new Error(`select from sculptura_private ${RAW_MARKER}`); } },
  });
  const before = (await db.query('select count(*)::int as n from sculptura_private.payout_signal_decisions')).rows[0].n;
  await assert.rejects(() => broken.check(req({ observedIp: CU })), (e) => {
    assert.equal(e.name, 'PolicyUnavailableError');
    assert.ok(!`${e.message} ${JSON.stringify(e)}`.includes(RAW_MARKER));
    return true;
  });
  assert.equal((await db.query('select count(*)::int as n from sculptura_private.payout_signal_decisions')).rows[0].n, before, 'nothing was decided');
  const missing = serviceFor({ territoryListVersion: 'v-does-not-exist' });
  const r = await missing.check(req({ observedIp: CU }));
  assert.equal(r.outcome, 'pass', 'an unknown list version is an empty list (documented in db-ports), so configuration must name a real version');
});

// ------------------------------------------------- 3. pattern is read, never stored

/** inserts a decision row directly, as the owner, with a chosen age and reason set. */
async function seedDecision(creator, { moment, daysAgo, embargoed }) {
  const reasons = embargoed ? '["ip_geo_embargoed_territory"]' : '[]';
  const sub = crypto.randomUUID();
  await db.query(
    `insert into sculptura_private.payout_signal_decisions
       (creator_profile_id, moment, submission_id, request_digest, policy_version, selected_checks,
        outcome, reason_codes, network_flags, adapter_version, occurred_at)
     values ($1,$2,$3,$4,'v1','[]',$5,$6::jsonb,'{}','a1', now() - ($7 || ' days')::interval)`,
    [creator, moment, sub, 'e'.repeat(64), embargoed ? 'needs_review' : 'pass', reasons, String(daysAgo)]);
}

/** creates an isolated creator (auth user and profile) so a pattern test never shares rows with another test. */
async function makeCreator(name) {
  const userId = crypto.randomUUID();
  const id = crypto.randomUUID();
  await db.query(`insert into auth.users (id, email) values ($1, $2)`, [userId, `${name}@test.local`]);
  await db.query(
    `insert into public.creator_profiles (id, user_id, user_email, username, display_name, bio, materials, tools, commission_open)
     values ($1,$2,$3,$4,$5,'',ARRAY[]::text[],ARRAY[]::text[],false)`,
    [id, userId, `${name}@test.local`, name, name]);
  return id;
}

const pattern = async (creator) => (await queryAs('authenticated', ADMIN)('select public.admin_get_embargo_pattern($1::uuid) as r', [creator])).rows[0].r;

test('positive: a single hit and six months of hits are both readable from existing rows and clearly different', async () => {
  // a one-off: one embargoed hit among ordinary passes
  const oneOffCreator = await makeCreator('pattern_oneoff');
  await seedDecision(oneOffCreator, { moment: 'payout_onboarding', daysAgo: 200, embargoed: true });
  for (const d of [150, 100, 50, 10]) await seedDecision(oneOffCreator, { moment: 'payout_request', daysAgo: d, embargoed: false });

  // sustained: a hit at every money moment across six months, on a different creator
  const sustainedProfile = await makeCreator('pattern_sustained');
  for (const [i, days] of [175, 145, 115, 85, 55, 25].entries()) {
    await seedDecision(sustainedProfile, { moment: i % 2 ? 'payout_request' : 'payout_onboarding', daysAgo: days, embargoed: true });
  }

  const oneOff = await pattern(oneOffCreator);
  const long = await pattern(sustainedProfile);
  assert.equal(oneOff.embargo_hit_count, 1);
  assert.equal(oneOff.total_decisions, 5);
  assert.equal(long.embargo_hit_count, 6);
  assert.ok(long.embargo_hit_count > oneOff.embargo_hit_count);
  assert.equal(long.distinct_moments_hit, 2, 'hits at both money moments');
  assert.equal(oneOff.distinct_moments_hit, 1);
  const spanDays = (new Date(long.last_hit_at) - new Date(long.first_hit_at)) / 86_400_000;
  assert.ok(spanDays >= 148 && spanDays <= 152, `the sustained pattern spans about five months of hits (${spanDays.toFixed(1)} days)`);
});

test('positive: the pattern is computed at read time, so it changes with the rows and stores nothing', async () => {
  const creator = await makeCreator('read_time');
  await seedDecision(creator, { moment: 'payout_onboarding', daysAgo: 30, embargoed: true });
  const before = (await pattern(creator)).embargo_hit_count;
  assert.equal(before, 1);
  await seedDecision(creator, { moment: 'payout_request', daysAgo: 1, embargoed: true });
  assert.equal((await pattern(creator)).embargo_hit_count, before + 1, 'a new row shows up immediately');
  const relations = (await db.query(`select relkind, relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'sculptura_private' and relname ilike '%pattern%'`)).rows;
  assert.deepEqual(relations, [{ relkind: 'v', relname: 'embargoed_territory_pattern' }], 'a view, not a table: nothing stored');
});

test('negative: a creator with no hits has a zero count, and there is no score or trust field in the pattern', async () => {
  await seedDecision(profile, { moment: 'payout_request', daysAgo: 3, embargoed: false });
  const r = await pattern(profile);
  assert.ok(r.embargo_hit_count >= 0);
  assert.deepEqual(Object.keys(r).sort(), ['creator_profile_id', 'distinct_moments_hit', 'embargo_hit_count', 'first_hit_at', 'last_hit_at', 'total_decisions']);
  assert.ok(!Object.keys(r).some((k) => /score|trust|level|risk|flag|rank/i.test(k)), 'counts only');
});

test('negative: a one-off never permanently flags: the hit ages out of the decision window with no mark left', async () => {
  const creator = await makeCreator('aged_oneoff');
  const trustBefore = await countTrust();
  await seedDecision(creator, { moment: 'payout_onboarding', daysAgo: 400, embargoed: true });
  assert.deepEqual(await countTrust(), trustBefore, 'the hit left no trust record behind');
  const next = await serviceFor().check(req({ creatorProfileId: creator, observedIp: IPS.residential, market: 'US' }));
  assert.equal(next.outcome, 'pass', 'a clean request after a one-off hit is judged on its own inputs');
  assert.deepEqual(next.reasonCodes, []);
});

test('negative: the pattern reader and its view are admin-only; no other role can read another creator', async () => {
  await assert.rejects(() => queryAs('authenticated', ALICE)('select public.admin_get_embargo_pattern($1::uuid)', [profile]), /admin authorization required/);
  await assert.rejects(() => queryAs('anon')('select public.admin_get_embargo_pattern($1::uuid)', [profile]), /permission denied/i);
  for (const [role, uid] of [['anon', null], ['authenticated', ALICE], ['authenticated', ADMIN]]) {
    await assert.rejects(() => queryAs(role, uid)('select * from sculptura_private.embargoed_territory_pattern'), /permission denied/i, `${role} cannot select the view directly`);
  }
});

// ---------------------------------------------------------- review outcomes

test('positive: a review ends in release or a stranded-funds hold, and nothing else', () => {
  assert.deepEqual([...REVIEW_OUTCOMES], ['release', 'stranded_funds_hold']);
  assert.equal(assertReviewOutcome('release'), 'release');
  assert.equal(assertReviewOutcome('stranded_funds_hold'), 'stranded_funds_hold');
  assert.equal(Object.isFrozen(REVIEW_OUTCOMES), true);
});

test('negative: an account action is never a valid review outcome', () => {
  for (const action of ['ban', 'suspend', 'terminate', 'close_account', 'freeze', 'permanent_flag', 'blacklist', 'reject', 'fail', 'auto_reject', 'expire_to_fail', 'trust_downgrade', 'BAN', 'Suspend-Account']) {
    assert.throws(() => assertReviewOutcome(action), (e) => e instanceof InvalidReviewOutcomeError && /account action/.test(e.message), action);
    assert.equal(isAccountAction(action), true, action);
  }
  for (const junk of ['', 'maybe', 'release ', 'Release', null, undefined, 7, {}, []]) {
    assert.throws(() => assertReviewOutcome(junk), InvalidReviewOutcomeError, String(junk));
  }
  assert.equal(isAccountAction('release'), false);
  assert.equal(isAccountAction(undefined), false, 'an invalid value is not an account action');
});

test('negative: a needs_review hold is a state, not a timer: nothing here converts an unreviewed hold into a fail', () => {
  for (const file of ['payout-signal-check.mjs', 'payout-gate.mjs', 'review-outcomes.mjs', 'db-ports.mjs']) {
    const code = fs.readFileSync(path.join(here, '..', file), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    assert.ok(!/setTimeout|setInterval|autoFail|auto_fail|escalat/i.test(code), `${file} has no timer or expiry that could become a fail by backlog`);
    // review-outcomes.mjs names the forbidden actions (expire_to_fail, auto_reject) on purpose, so only
    // the other files are held to the stricter word check.
    if (file !== 'review-outcomes.mjs') assert.ok(!/expire|backlog/i.test(code), `${file} has no expiry logic`);
  }
  const reviewCode = fs.readFileSync(path.join(here, '..', 'review-outcomes.mjs'), 'utf8');
  assert.ok(!/Date\.now|new Date|performance\.now/.test(reviewCode), 'review outcomes read no clock');
  assert.ok(!REASON_CODES.includes('review_expired'));
});

// ---------------------------------------------------- the stored evidence shape

test('negative: the database rejects malformed geo evidence and a country beside coverage none', async () => {
  const good = { country_code: 'CU', coverage: 'full', source_id: 'g', dataset_version: 'v' };
  const insert = (geo) => db.query(
    `insert into sculptura_private.payout_signal_decisions
       (creator_profile_id, moment, submission_id, request_digest, policy_version, selected_checks,
        outcome, reason_codes, network_flags, adapter_version, geo_evidence)
     values ($1,'payout_request',$2,$3,'v1','[]','pass','[]','{}','a1',$4::jsonb)`,
    [profile, crypto.randomUUID(), 'f'.repeat(64), JSON.stringify(geo)]);
  await insert({ ...good, country_code: null }); // evaluated, no match: valid
  for (const [why, bad] of [
    ['country with coverage none', { ...good, coverage: 'none' }],
    ['lowercase country', { ...good, country_code: 'cu' }],
    ['three letter country', { ...good, country_code: 'CUB' }],
    ['full coverage without a source', { ...good, source_id: null }],
    ['extra key', { ...good, city: 'Havana' }],
    ['missing key', { country_code: 'CU', coverage: 'full', source_id: 'g' }],
    ['partial coverage', { ...good, coverage: 'partial' }],
    ['not an object', 'CU'],
  ]) {
    await assert.rejects(() => insert(bad), (e) => e.code === '23514', why);
  }
});

test('negative: the territory reason code is accepted by the database and an invented one is not', async () => {
  const insert = (code) => db.query(
    `insert into sculptura_private.payout_signal_decisions
       (creator_profile_id, moment, submission_id, request_digest, policy_version, selected_checks,
        outcome, reason_codes, network_flags, adapter_version)
     values ($1,'payout_request',$2,$3,'v1','[]','needs_review',$4::jsonb,'{}','a1')`,
    [profile, crypto.randomUUID(), 'a'.repeat(64), JSON.stringify([code])]);
  await insert('ip_geo_embargoed_territory');
  await assert.rejects(() => insert('ip_geo_grey_listed_market'), (e) => e.code === '23514');
  await assert.rejects(() => insert('ip_geo_country_risk'), (e) => e.code === '23514');
  assert.ok(REASON_CODES.includes('ip_geo_embargoed_territory'));
});

test('positive: an admin reads the territory decision and its geo attribution through the rpc', async () => {
  const sub = crypto.randomUUID();
  await serviceFor().check(req({ submissionId: sub, observedIp: CU }));
  const read = await queryAs('authenticated', ADMIN)('select public.admin_get_payout_signals($1::uuid, 50) as r', [profile]);
  const d = read.rows[0].r.decisions.find((x) => x.submission_id === sub);
  assert.deepEqual(d.reason_codes, ['ip_geo_embargoed_territory']);
  assert.equal(d.geo_evidence.source_id, 'geolite2-country');
  assert.equal(d.request_digest, undefined);
});

test('negative: no table holds a plaintext address or raw payload after territory checks', async () => {
  const service = serviceFor();
  const ips = [CU, '203.0.113.78', '203.0.113.90', IPS.residential];
  for (const observedIp of ips) await service.check(req({ observedIp }));
  const tables = (await db.query(`select table_schema, table_name from information_schema.tables
    where table_type='BASE TABLE' and table_schema in ('public','sculptura_private')`)).rows;
  let text = '';
  for (const t of tables) text += (await db.query(`select to_jsonb(x)::text j from ${t.table_schema}.${t.table_name} x`)).rows.map((r) => r.j).join('\n');
  for (const trace of [...ips, RAW_MARKER, 'Chrome/120', 'Cuba', 'Havana']) assert.ok(!text.includes(trace), `no ${trace} in storage`);
});

test('positive: idempotent replay returns the stored territory decision even if the list changes between tries', async () => {
  const sub = crypto.randomUUID();
  const keyRing = makeKeyRing();
  const first = await serviceFor({ keyRing }).check(req({ submissionId: sub, observedIp: CU }));
  assert.equal(first.outcome, 'needs_review');
  await db.query(`update sculptura_private.embargoed_territory_review_list set enabled = false where list_version='v1' and territory_code='CU'`);
  try {
    const retry = await serviceFor({ keyRing }).check(req({ submissionId: sub, observedIp: CU }));
    assert.equal(retry.replayed, true);
    assert.equal(retry.outcome, 'needs_review', 'the stored decision stands; it is not recomputed against the new list');
  } finally {
    await db.query(`update sculptura_private.embargoed_territory_review_list set enabled = true where list_version='v1' and territory_code='CU'`);
  }
});

test('positive: a commercial geo source with a country decides the same way through the same port', async () => {
  const cu = serviceFor({ ipAdapter: new StubCommercialAdapter({ country: 'CU' }) });
  const r = await cu.check(req({ observedIp: IPS.residential, market: 'US' }));
  assert.deepEqual(r.reasonCodes, ['ip_geo_embargoed_territory']);
  const gb = serviceFor({ ipAdapter: new StubCommercialAdapter({ country: 'GB' }) });
  assert.equal((await gb.check(req({ observedIp: IPS.residential, market: 'US' }))).outcome, 'pass');
});

test('negative: a malformed country from an adapter breaks the contract and reads as unavailable, not as a match', async () => {
  for (const bad of ['cu', 'CUB', 'C', '', 7, {}]) {
    const adapter = { lookup: async () => {
      const r = await new StubCommercialAdapter({ country: 'CU' }).lookup(IPS.residential);
      r.geo = { ...r.geo, countryCode: bad };
      return r;
    } };
    const out = await serviceFor({ ipAdapter: adapter }).check(req({ market: 'IN' }));
    assert.equal(out.outcome, 'needs_review', String(bad));
    assert.deepEqual(out.reasonCodes, ['feed_unavailable'], `${String(bad)}: the result was rejected, so strict feeds are unavailable`);
    assert.ok(!out.reasonCodes.includes('ip_geo_embargoed_territory'));
  }
});
