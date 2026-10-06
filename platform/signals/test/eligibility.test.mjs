// batch 9 tests: "not yet" at payout onboarding. two owner rulings (2026-10-06):
// the minor-creator park (jeremiah brown jr. case) and the parked-market hold
// (faizah aisler case). both are roadmap or age state, not fraud: no signal check,
// no recorded decision, no needs_review, no trust input, no ledger change.
//
// every path has a positive and a negative case. the database-backed cases run on
// the real cumulative pglite schema.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTestDatabase } from '../../../scripts/build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from '../../../scripts/seed-security-test-data.mjs';
import { checkParkedHoldPolicy } from '../../../scripts/check-parked-hold-policy.mjs';
import { createPayoutSignalGate, ROUTES } from '../payout-gate.mjs';
import {
  createEligibilityEvaluator, createRailsMatrixProvider, loadRailsMatrix, parseIsoDate, DEFAULT_RAILS_PATH,
  ELIGIBILITY_STATUSES, NOT_YET_CAUSES, RailsMatrixUnavailableError, InvalidEligibilityInputError,
} from '../payout-eligibility.mjs';
import { PARKED_MARKET_HOLD, holdMarketCodes } from '../parked-market-policy.mjs';
import { PayoutSignalCheckService } from '../payout-signal-check.mjs';
import { createDbPolicyStore, createDbRecorder, createDbTerritoryListStore } from '../db-ports.mjs';
import { FreeIpIntelligenceAdapter } from '../ip-intelligence.mjs';
import { loadFeeds } from '../feeds.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload } from './fixtures.mjs';
import { IPS, writeFeedDir } from './ip-fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ALICE = '10000000-0000-0000-0000-000000000001';
const NOW = new Date('2026-10-06T12:00:00Z');
const ONBOARDING = '/payout/onboarding/signals';
const REQUEST = '/payout/request/signals';

/** a small matrix: three enabled markets, two roadmap-parked, one sanctions market in the parked appendix. */
const matrix = (over = {}) => ({
  enabledMarkets: new Set(['US', 'IN', 'DE']),
  parkedMarkets: new Map([['SA', 'v2 candidate: gcc; paypal payouts supported'], ['AE', 'v2 candidate: gcc'], ['IR', 'out of scope, sanctions']]),
  ...over,
});
const evaluatorFor = (rails = matrix(), now = () => NOW) => createEligibilityEvaluator({ loadRails: async () => rails, now });
const evaluate = (facts, rails, now) => evaluatorFor(rails, now).evaluate(facts);

const adult = { status: 'adult' };
/** a minor who turns 18 on the given date. */
const minor = (majorityDate) => ({ status: 'minor', majorityDate });

// ------------------------------------------------------- 1. the minor-creator park

test('positive: jeremiah, 17 with a us rail, is told not yet, not no', async () => {
  const r = await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: minor('2027-03-01') });
  assert.deepEqual(r, { status: 'not_yet', cause: 'minor_creator' });
});

test('negative: a minor has no payout path in any market, with or without a rail', async () => {
  for (const residenceMarket of ['US', 'SA', 'DE', 'IR', null]) {
    for (const railMarket of ['US', 'IN', 'SA', null]) {
      const r = await evaluate({ residenceMarket, railMarket, ageAttestation: minor('2027-03-01') });
      assert.deepEqual(r, { status: 'not_yet', cause: 'minor_creator' }, `${residenceMarket}/${railMarket}`);
    }
  }
});

test('positive: payout unlocks on the day they turn 18, and not a day before (delilah, the boundary case)', async () => {
  const at = (iso) => () => new Date(iso);
  const att = minor('2026-10-07');
  assert.equal((await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: att }, matrix(), at('2026-10-06T00:00:00Z'))).status, 'not_yet');
  assert.equal((await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: att }, matrix(), at('2026-10-06T23:59:59Z'))).status, 'not_yet', 'still 17 at the last second of the day before');
  assert.equal((await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: att }, matrix(), at('2026-10-07T00:00:00Z'))).status, 'proceed', 'unlocked at the start of the birthday');
  assert.equal((await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: att }, matrix(), at('2027-10-07T00:00:00Z'))).status, 'proceed', 'and stays unlocked');
});

test('positive: an adult attestation proceeds, and a stray majority date on it changes nothing', async () => {
  assert.deepEqual(await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: adult }), { status: 'proceed' });
  assert.deepEqual(await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: { status: 'adult', majorityDate: '2099-01-01' } }), { status: 'proceed' });
});

test('negative: no attestation is not yet, never a silent pass', async () => {
  for (const missing of [null, undefined]) {
    assert.deepEqual(await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: missing }), { status: 'not_yet', cause: 'age_attestation_missing' });
  }
});

test('negative: a malformed attestation is not yet, never a pass', async () => {
  const bad = [
    'adult', 7, true, [], {}, { status: 'teen' }, { status: 'ADULT' }, { status: 'minor' },
    minor(null), minor(''), minor('soon'), minor('2027-02-30'), minor('2027-13-01'), minor('27-03-01'), minor('2027/03/01'),
    minor('2027-03-01T00:00:00Z'), minor(20270301), minor('2099-01-01'), // more than 18 years away: nobody is younger than zero
  ];
  for (const attestation of bad) {
    const r = await evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: attestation });
    assert.equal(r.status, 'not_yet', JSON.stringify(attestation));
    assert.ok(['age_attestation_invalid'].includes(r.cause), JSON.stringify(attestation));
  }
});

test('positive: parseIsoDate accepts real calendar dates and rejects the ones Date would roll forward', () => {
  for (const ok of ['2026-10-06', '2028-02-29', '2000-01-01']) assert.equal(parseIsoDate(ok), ok);
  for (const bad of ['2027-02-29', '2026-04-31', '2026-00-10', '2026-10-00', '2026-1-6', ' 2026-10-06', '2026-10-06 ', null, undefined, 20261006, {}]) {
    assert.equal(parseIsoDate(bad), null, String(bad));
  }
});

test('negative: a minor is told not yet even when the rails matrix cannot be read, because the matrix is not needed to decide', async () => {
  const broken = createEligibilityEvaluator({ loadRails: async () => { throw new RailsMatrixUnavailableError('unreadable'); }, now: () => NOW });
  assert.equal((await broken.evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: minor('2027-03-01') })).status, 'not_yet');
  await assert.rejects(() => broken.evaluate({ residenceMarket: 'US', railMarket: 'US', ageAttestation: adult }), RailsMatrixUnavailableError);
});

// ------------------------------------------------------- 2. the parked-market hold

test('positive: faizah, resident in a parked market with no rail, is told not yet', async () => {
  assert.deepEqual(await evaluate({ residenceMarket: 'SA', railMarket: null, ageAttestation: adult }), { status: 'not_yet', cause: 'market_not_open' });
});

test('positive: a rail in an already enabled market lifts the hold, keyed by the rail', async () => {
  for (const rail of ['US', 'IN', 'DE']) {
    assert.deepEqual(await evaluate({ residenceMarket: 'SA', railMarket: rail, ageAttestation: adult }), { status: 'proceed' }, rail);
  }
});

test('negative: a rail in a market that is not enabled does not lift the hold', async () => {
  for (const rail of ['AE', 'SA', 'IR', 'ZZ']) {
    assert.deepEqual(await evaluate({ residenceMarket: 'SA', railMarket: rail, ageAttestation: adult }), { status: 'not_yet', cause: 'market_not_open' }, rail);
  }
});

test('positive: when the market opens the hold lifts with no code change, because the matrix is read on every call', async () => {
  let rails = matrix();
  const ev = createEligibilityEvaluator({ loadRails: async () => rails, now: () => NOW });
  const facts = { residenceMarket: 'SA', railMarket: null, ageAttestation: adult };
  assert.equal((await ev.evaluate(facts)).status, 'not_yet');
  rails = matrix({ enabledMarkets: new Set(['US', 'IN', 'DE', 'SA']), parkedMarkets: new Map([['AE', 'v2 candidate']]) });
  assert.equal((await ev.evaluate(facts)).status, 'proceed', 'sa opened');
  assert.equal((await ev.evaluate({ ...facts, railMarket: 'SA' })).status, 'proceed', 'and a sa rail is now an enabled rail');
});

test('negative: if a matrix ever listed a market as both enabled and parked, the evaluator still lets the enabled market through', async () => {
  // the loader refuses such a matrix. this is defense in depth for a provider that does not.
  const both = matrix({ enabledMarkets: new Set(['US', 'SA']) });
  assert.deepEqual(await evaluate({ residenceMarket: 'SA', railMarket: null, ageAttestation: adult }, both), { status: 'proceed' });
});

test('negative: a creator who lives somewhere else, or in an unknown place, has no park from this layer', async () => {
  for (const residenceMarket of ['DE', 'US', 'AE', null, undefined]) {
    assert.deepEqual(await evaluate({ residenceMarket, railMarket: null, ageAttestation: adult }), { status: 'proceed' }, String(residenceMarket));
  }
});

test('negative: a sanctions market in the parked appendix is not a friendly park: this layer has no opinion on it', async () => {
  // ir is in the matrix parked appendix as out of scope, sanctions. it is not on the hold list, so
  // this layer never tells an ir resident "not yet". the embargo review and rails deny-by-default own it.
  assert.ok(!holdMarketCodes().has('IR'));
  assert.deepEqual(await evaluate({ residenceMarket: 'IR', railMarket: null, ageAttestation: adult }), { status: 'proceed' });
});

test('negative: a market must be on the hold list and still parked for the hold to apply', async () => {
  const empty = createEligibilityEvaluator({ loadRails: async () => matrix(), holdPolicy: { listVersion: 'x', markets: [{ market: 'AE' }] }, now: () => NOW });
  assert.equal((await empty.evaluate({ residenceMarket: 'SA', railMarket: null, ageAttestation: adult })).status, 'proceed', 'sa is parked but not on this list');
  assert.equal((await empty.evaluate({ residenceMarket: 'AE', railMarket: null, ageAttestation: adult })).status, 'not_yet', 'ae is on this list');
  const notParked = createEligibilityEvaluator({ loadRails: async () => matrix({ parkedMarkets: new Map() }), now: () => NOW });
  assert.equal((await notParked.evaluate({ residenceMarket: 'SA', railMarket: null, ageAttestation: adult })).status, 'proceed', 'on the list but no longer parked');
});

// ------------------------------------------------- 3. vocabulary and input handling

test('negative: the only outcomes are proceed and not_yet, and there is no no, fail or review', async () => {
  assert.deepEqual([...ELIGIBILITY_STATUSES], ['proceed', 'not_yet']);
  assert.ok(NOT_YET_CAUSES.every((c) => !/^(no|fail|review|denied|rejected|banned)$/.test(c)));
  const seen = new Set();
  for (const residenceMarket of ['SA', 'US', 'IR', null]) {
    for (const railMarket of ['US', 'AE', 'ZZ', null]) {
      for (const ageAttestation of [adult, minor('2027-03-01'), null, { status: 'x' }]) {
        const r = await evaluate({ residenceMarket, railMarket, ageAttestation });
        assert.ok(ELIGIBILITY_STATUSES.includes(r.status));
        if (r.status === 'not_yet') assert.ok(NOT_YET_CAUSES.includes(r.cause));
        seen.add(r.status);
        assert.deepEqual(Object.keys(r).sort(), r.status === 'not_yet' ? ['cause', 'status'] : ['status']);
      }
    }
  }
  assert.deepEqual([...seen].sort(), ['not_yet', 'proceed'], 'the grid reaches both outcomes');
});

test('negative: a malformed market code is a programming error, not a quiet pass', async () => {
  for (const residenceMarket of ['sa', 'SAU', 'S', '', 5, {}, []]) {
    await assert.rejects(() => evaluate({ residenceMarket, railMarket: null, ageAttestation: adult }), InvalidEligibilityInputError, String(residenceMarket));
  }
  for (const railMarket of ['us', 'USA', '', 5, {}]) {
    await assert.rejects(() => evaluate({ residenceMarket: 'US', railMarket, ageAttestation: adult }), InvalidEligibilityInputError, String(railMarket));
  }
  assert.throws(() => createEligibilityEvaluator({}), TypeError);
});

// ------------------------------------------------------------ 4. the rails matrix

test('positive: the real rails matrix loads, with sa parked and us enabled and no overlap', () => {
  const rails = loadRailsMatrix();
  assert.ok(rails.enabledMarkets.has('US'));
  assert.ok(rails.parkedMarkets.has('SA'));
  assert.ok(!rails.enabledMarkets.has('SA'));
  assert.equal([...rails.parkedMarkets.keys()].filter((m) => rails.enabledMarkets.has(m)).length, 0);
  assert.ok(rails.enabledMarkets.size >= 30, `${rails.enabledMarkets.size} enabled markets`);
});

function withMatrixFile(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rails-'));
  const file = path.join(dir, 'rails.json');
  const base = JSON.parse(fs.readFileSync(DEFAULT_RAILS_PATH, 'utf8'));
  const next = mutate(structuredClone(base));
  fs.writeFileSync(file, typeof next === 'string' ? next : JSON.stringify(next));
  return { file, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

test('negative: a broken, unsafe or ambiguous matrix is unavailable, and the error leaks nothing', () => {
  const cases = {
    'deny_by_default off': (m) => { m.deny_by_default = false; return m; },
    'deny_by_default missing': (m) => { delete m.deny_by_default; return m; },
    'a market both enabled and parked': (m) => { m.parked_markets.push({ market: 'US', reason: 'x' }); return m; },
    'a bad market code': (m) => { m.markets[0].market = 'usa'; return m; },
    'a bad parked code': (m) => { m.parked_markets[0].market = 7; return m; },
    'no enabled markets': (m) => { m.markets = []; return m; },
    'markets missing': (m) => { delete m.markets; return m; },
    'not json': () => `{ not json ${RAW_MARKER}`,
  };
  for (const [why, mutate] of Object.entries(cases)) {
    const f = withMatrixFile(mutate);
    try {
      assert.throws(() => loadRailsMatrix(f.file), (e) => {
        assert.ok(e instanceof RailsMatrixUnavailableError, why);
        assert.ok(!`${e.message}`.includes(RAW_MARKER) && !`${e.message}`.includes(f.file), `${why}: no content or path in the error`);
        return true;
      }, why);
    } finally { f.cleanup(); }
  }
  assert.throws(() => loadRailsMatrix(path.join(os.tmpdir(), 'no-such-rails.json')), RailsMatrixUnavailableError);
});

test('positive: the provider re-reads the file on every call, so a market that opens is seen at once', async () => {
  const f = withMatrixFile((m) => m);
  try {
    const provider = createRailsMatrixProvider({ file: f.file });
    assert.ok((await provider()).parkedMarkets.has('SA'));
    const edited = JSON.parse(fs.readFileSync(f.file, 'utf8'));
    const row = edited.parked_markets.find((m) => m.market === 'SA');
    edited.parked_markets = edited.parked_markets.filter((m) => m.market !== 'SA');
    edited.markets.push({ ...edited.markets[0], market: 'SA', primary_rail: 'paypal_payouts' });
    fs.writeFileSync(f.file, JSON.stringify(edited));
    const after = await provider();
    assert.ok(after.enabledMarkets.has('SA') && !after.parkedMarkets.has('SA'), `sa moved out of ${row.reason}`);
  } finally { f.cleanup(); }
});

// ------------------------------------------------------------- 5. the hold list

test('positive: the hold list is sa only, frozen, and the real matrix agrees with it', () => {
  assert.deepEqual(PARKED_MARKET_HOLD.markets.map((m) => m.market), ['SA']);
  assert.ok(Object.isFrozen(PARKED_MARKET_HOLD) && Object.isFrozen(PARKED_MARKET_HOLD.markets) && Object.isFrozen(PARKED_MARKET_HOLD.markets[0]));
  assert.throws(() => PARKED_MARKET_HOLD.markets.push({ market: 'IR' }), TypeError);
  const r = checkParkedHoldPolicy({ embargoedCodes: ['CU', 'IR', 'SY', 'KP'] });
  assert.deepEqual(r, { ok: true, problems: [], opened: [], listed: 1 });
});

test('negative: the check rejects every market that is not roadmap state, an empty list, and bad or duplicate codes', () => {
  const list = (...codes) => ({ listVersion: 'x', markets: codes.map((market) => ({ market })) });
  const problems = (policy, embargoedCodes = []) => checkParkedHoldPolicy({ policy, embargoedCodes });
  for (const [code, why] of [['IR', 'sanctions'], ['SY', 'sanctions'], ['IQ', 'grey list'], ['CM', 'grey list hold'], ['KW', 'gcc and grey listed'], ['PS', 'out of scope']]) {
    const r = problems(list(code));
    assert.equal(r.ok, false, `${code} (${why})`);
    assert.match(r.problems[0], /not roadmap state/);
  }
  assert.equal(problems(list()).ok, false, 'an empty list is not a pass');
  assert.match(problems(list()).problems[0], /vacuously/);
  assert.equal(problems(list('ZZ')).ok, false, 'in neither list');
  assert.equal(problems(list('sa')).ok, false, 'lowercase');
  assert.equal(problems(list('SA', 'SA')).ok, false, 'duplicate');
  assert.equal(problems(list('SA'), ['SA']).ok, false, 'on the embargo list');
  assert.equal(problems(list('KE')).ok, false, 'an enabled grey-listed market is still not a park');
});

test('positive: a market that has opened is reported for cleanup and does not fail the check', () => {
  const f = withMatrixFile((m) => {
    m.parked_markets = m.parked_markets.filter((p) => p.market !== 'SA');
    m.markets.push({ ...m.markets[0], market: 'SA', fatf_grey_list: false });
    return m;
  });
  try {
    const r = checkParkedHoldPolicy({ railsPath: f.file });
    assert.equal(r.ok, true);
    assert.deepEqual(r.opened, ['SA']);
  } finally { f.cleanup(); }
});

// ------------------------------------------------------------- 6. the gate

const facts = {
  jeremiah: { residenceMarket: 'US', ageAttestation: minor('2027-03-01') },
  faizah: { residenceMarket: 'SA', ageAttestation: adult },
  adultUs: { residenceMarket: 'US', ageAttestation: adult },
};

function makeSpyGate(world = {}) {
  const calls = [];
  const events = [];
  const state = { session: { creatorProfileId: ALICE }, market: null, facts: facts.faizah, rails: matrix(), ...world };
  const service = {
    async check(input) {
      calls.push(input);
      return { submissionId: input.submissionId, outcome: 'pass', reasonCodes: [], policyVersion: 'v1', selectedChecks: [], replayed: false };
    },
  };
  const gate = createPayoutSignalGate({
    service,
    authenticate: async () => state.session,
    resolveMarket: async () => (typeof state.market === 'function' ? state.market() : state.market),
    resolveCreatorFacts: async () => (typeof state.facts === 'function' ? state.facts() : state.facts),
    eligibility: createEligibilityEvaluator({
      loadRails: async () => { if (state.rails instanceof Error) throw state.rails; return state.rails; },
      now: () => NOW,
    }),
    clientIp: () => IPS.residential,
    telemetry: (e) => events.push(e),
  });
  return { gate, calls, events, state };
}
const post = (p, body, extra = {}) => ({ method: 'POST', path: p, headers: {}, rawBody: JSON.stringify(body), socketAddress: '203.0.113.99', ...extra });
const good = (over = {}) => ({ submissionId: crypto.randomUUID(), device: desktopPayload(), ...over });

test('positive: the gate tells a minor and a parked-market creator not_yet, at both money moments, without reaching the service', async () => {
  for (const [who, world, cause] of [
    ['jeremiah', { facts: facts.jeremiah, market: 'US' }, 'minor_creator'],
    ['faizah', { facts: facts.faizah, market: null }, 'market_not_open'],
  ]) {
    for (const route of Object.keys(ROUTES)) {
      const { gate, calls, events } = makeSpyGate(world);
      const r = await gate.handle(post(route, good()));
      assert.equal(r.status, 200, `${who} ${route}`);
      assert.deepEqual(r.body, { status: 'not_yet' });
      assert.deepEqual(r.decision, { eligibility: 'not_yet', cause });
      assert.equal(calls.length, 0, 'no signal check ran');
      assert.deepEqual(events, [{ event: 'payout_signal_gate', result: 'not_yet', cause, moment: ROUTES[route] }]);
    }
  }
});

test('negative: not_yet is never a review, a hold, an error status or a refusal', async () => {
  const { gate } = makeSpyGate({ facts: facts.jeremiah, market: 'US' });
  const r = await gate.handle(post(ONBOARDING, good()));
  assert.equal(r.status, 200, 'not a 403 or 451');
  assert.notEqual(r.body.status, 'review');
  assert.notEqual(r.body.status, 'hold');
  assert.equal(r.body.status, 'not_yet', 'the word is not_yet, and nothing else');
  assert.deepEqual(Object.keys(r.body), ['status']);
});

test('negative: what the browser and the telemetry are told carries no age, market, creator, date or cause', async () => {
  for (const world of [{ facts: facts.jeremiah, market: 'US' }, { facts: facts.faizah, market: null }]) {
    const { gate, events } = makeSpyGate(world);
    const r = await gate.handle(post(ONBOARDING, good()));
    const text = JSON.stringify(r.body);
    for (const trace of ['minor', 'adult', 'age', '2027', 'SA', 'US', 'market', 'cause', 'attestation', ALICE, 'residence', 'rail']) {
      assert.ok(!text.includes(trace), `browser body has no ${trace}`);
    }
    // the cause is server-side telemetry and names no one. identity, market, date and residence stay out.
    for (const trace of ['2027', '"SA"', '"US"', ALICE, 'residence', 'creatorProfileId', 'submissionId']) {
      assert.ok(!JSON.stringify(events).includes(trace), `telemetry has no ${trace}`);
    }
  }
});

test('negative: unauthenticated, non-creator and malformed requests are refused before eligibility is consulted', async () => {
  const unauth = makeSpyGate({ session: null, facts: () => { throw new Error('must not be read'); } });
  assert.equal((await unauth.gate.handle(post(ONBOARDING, good()))).status, 401);
  const nonCreator = makeSpyGate({ session: { creatorProfileId: null }, facts: () => { throw new Error('must not be read'); } });
  assert.equal((await nonCreator.gate.handle(post(ONBOARDING, good()))).status, 403);
  const bad = makeSpyGate({ facts: facts.jeremiah, market: 'US' });
  assert.equal((await bad.gate.handle(post(ONBOARDING, { ...good(), market: 'US' }))).status, 400, 'a client-supplied market is still refused');
  assert.equal((await bad.gate.handle(post(ONBOARDING, { device: {} }))).status, 400);
  assert.equal((await bad.gate.handle({ method: 'POST', path: ONBOARDING, rawBody: '{', headers: {} })).status, 400);
  assert.equal(bad.events.length, 0);
});

test('negative: if the facts or the matrix cannot be read it is a hold, never a false not_yet and never a pass', async () => {
  const cases = [
    ['facts throw', { facts: () => { throw new Error(`db ${RAW_MARKER}`); }, market: 'US' }],
    ['matrix unreadable, adult', { facts: facts.adultUs, market: 'US', rails: new RailsMatrixUnavailableError('unreadable') }],
    ['matrix unreadable, parked resident', { facts: facts.faizah, market: null, rails: new RailsMatrixUnavailableError('unreadable') }],
    ['rail lookup throws', { facts: facts.faizah, market: () => { throw new Error('payout record unreadable'); } }],
    ['malformed residence', { facts: { residenceMarket: 'sa', ageAttestation: adult }, market: null }],
  ];
  for (const [why, world] of cases) {
    const { gate, calls, events } = makeSpyGate(world);
    const r = await gate.handle(post(ONBOARDING, good()));
    assert.equal(r.status, 503, why);
    assert.deepEqual(r.body, { status: 'hold' }, why);
    assert.equal(r.decision, null);
    assert.equal(calls.length, 0, why);
    assert.equal(events[0].result, 'hold', why);
    assert.ok(!JSON.stringify([r, events]).includes(RAW_MARKER), `${why}: no leak`);
  }
});

test('positive: a parked-market creator with a rail in an enabled market goes on to the signal check, keyed by the rail', async () => {
  const { gate, calls } = makeSpyGate({ facts: facts.faizah, market: 'US' });
  const r = await gate.handle(post(ONBOARDING, good()));
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'continue');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].market, 'US', 'the rail market selects the checks');
  assert.ok(!JSON.stringify(calls[0]).includes('SA'), 'the residence market never reaches the service');
  assert.deepEqual(Object.keys(calls[0]).sort(), ['creatorProfileId', 'market', 'moment', 'observedIp', 'rawDevicePayload', 'submissionId']);
});

test('positive: the same creator moves from not_yet to continue as soon as a rail is verified', async () => {
  const { gate, state, calls } = makeSpyGate({ facts: facts.faizah, market: null });
  assert.equal((await gate.handle(post(ONBOARDING, good()))).body.status, 'not_yet');
  state.market = 'US';
  assert.equal((await gate.handle(post(ONBOARDING, good()))).body.status, 'continue');
  assert.equal(calls.length, 1);
});

test('positive: a minor turning 18 goes from not_yet to the ordinary onboarding path, where their own kyc is still required', async () => {
  const clock = { now: new Date('2027-02-28T12:00:00Z') };
  const calls = [];
  const gate = createPayoutSignalGate({
    service: { async check(input) { calls.push(input); return { submissionId: input.submissionId, outcome: 'pass', reasonCodes: [], policyVersion: 'v1', selectedChecks: [], replayed: false }; } },
    authenticate: async () => ({ creatorProfileId: ALICE }),
    resolveMarket: async () => state.market,
    resolveCreatorFacts: async () => facts.jeremiah,
    eligibility: createEligibilityEvaluator({ loadRails: async () => matrix(), now: () => clock.now }),
    clientIp: () => IPS.residential,
  });
  const state = { market: null };
  assert.equal((await gate.handle(post(ONBOARDING, good()))).body.status, 'not_yet', 'day before the birthday');
  clock.now = new Date('2027-03-01T00:00:00Z');
  const noKyc = await gate.handle(post(ONBOARDING, good()));
  assert.equal(noKyc.status, 503, 'at 18 with no verified payout account the park is lifted, but nothing is unlocked by age alone');
  assert.deepEqual(noKyc.body, { status: 'hold' });
  assert.equal(calls.length, 0);
  state.market = 'US'; // the creator passed their own provider kyc
  assert.equal((await gate.handle(post(ONBOARDING, good()))).body.status, 'continue');
});

test('negative: the gate cannot be built without the eligibility pieces, so the park cannot be skipped by omission', () => {
  const base = {
    service: {}, authenticate: async () => null, resolveMarket: async () => null, clientIp: () => null,
    resolveCreatorFacts: async () => null, eligibility: evaluatorFor(),
  };
  assert.doesNotThrow(() => createPayoutSignalGate(base));
  for (const missing of ['resolveCreatorFacts', 'eligibility']) {
    assert.throws(() => createPayoutSignalGate({ ...base, [missing]: undefined }), TypeError, missing);
  }
});

// ------------------------------- 7. real database: nothing recorded, nothing trusted, nothing moved

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

const queryAsService = (sql, params) => db.transaction(async (tx) => { await tx.exec('set local role service_role'); return tx.query(sql, params); });
const realService = () => new PayoutSignalCheckService({
  ipAdapter: new FreeIpIntelligenceAdapter({
    sources,
    geo: { id: 'geolite2-country', datasetVersion: '2026-10-05', lookup: (ip) => (ip.text === '203.0.113.77' ? { countryCode: 'CU', subdivisionCode: null } : null) },
  }),
  keyRing: makeKeyRing(),
  policyStore: createDbPolicyStore(queryAsService),
  territoryListStore: createDbTerritoryListStore(queryAsService),
  recorder: createDbRecorder(queryAsService),
});
const realGate = ({ facts: f, market, ip = IPS.residential }) => createPayoutSignalGate({
  service: realService(),
  authenticate: async () => ({ creatorProfileId: profile }),
  resolveMarket: async () => market,
  resolveCreatorFacts: async () => f,
  eligibility: createEligibilityEvaluator({ loadRails: createRailsMatrixProvider(), now: () => NOW }),
  clientIp: () => ip,
});
const counts = async () => (await db.query(`
  select (select count(*) from sculptura_private.payout_signal_decisions)::int as decisions,
         (select count(*) from sculptura_private.creator_signal_events)::int as events,
         (select count(*) from sculptura_private.creator_trust)::int as creator_trust,
         (select count(*) from sculptura_private.creator_trust_events)::int as creator_trust_events,
         (select count(*) from sculptura_private.buyer_trust)::int as buyer_trust,
         (select count(*) from sculptura_private.buyer_trust_events)::int as buyer_trust_events,
         (select count(*) from public.ledger_entries)::int as ledger`)).rows[0];

test('positive: against the real schema and the real rails matrix, not_yet writes nothing anywhere', async () => {
  const before = await counts();
  for (const f of [facts.jeremiah, facts.faizah]) {
    for (const route of Object.keys(ROUTES)) {
      const r = await realGate({ facts: f, market: f === facts.jeremiah ? 'US' : null, ip: '203.0.113.77' }).handle(post(route, good()));
      assert.deepEqual(r.body, { status: 'not_yet' }, 'even from an embargoed address: no payout is possible, so there is nothing to review');
    }
  }
  assert.deepEqual(await counts(), before, 'no decision, no device event, no trust row, no ledger entry');
});

test('positive: the embargo review still applies to a parked-market creator who does present an enabled rail', async () => {
  const before = await counts();
  const r = await realGate({ facts: facts.faizah, market: 'US', ip: '203.0.113.77' }).handle(post(ONBOARDING, good()));
  assert.equal(r.body.status, 'review', 'two independent layers: the park does not switch the territory check off');
  assert.deepEqual(r.decision.reasonCodes, ['ip_geo_embargoed_territory']);
  const after = await counts();
  assert.equal(after.decisions, before.decisions + 1);
  assert.equal(after.creator_trust, before.creator_trust, 'and it still writes no trust');
});

test('positive: the ordinary path is untouched for an adult with a rail', async () => {
  const r = await realGate({ facts: facts.adultUs, market: 'US' }).handle(post(ONBOARDING, good()));
  assert.equal(r.body.status, 'continue');
  assert.equal(r.decision.outcome, 'pass');
});

test('positive: accrual for a creator who is not yet eligible is an ordinary creator_payable liability, with no special event type', async () => {
  const accounts = (await db.query(
    `select pg_get_constraintdef(c.oid) as def from pg_constraint c
       join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public' and t.relname = 'ledger_entries' and c.contype = 'c' and pg_get_constraintdef(c.oid) like '%account%'`)).rows[0].def;
  for (const account of ['buyer_source', 'platform_escrow', 'creator_payable', 'manufacturer_payable', 'platform_fee', 'refund_source']) {
    assert.ok(accounts.includes(`'${account}'`), account);
  }
  assert.equal((accounts.match(/'[a-z_]+'/g) ?? []).length, 6, 'exactly the six existing accounts: nothing was added for minors or parked markets');
  const columns = (await db.query(
    `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'ledger_entries'`)).rows.map((r) => r.column_name);
  assert.ok(!columns.some((c) => /age|minor|market|residen|parked|country|kyc|hold_reason/i.test(c)), `ledger columns: ${columns.join(', ')}`);

  // a sale for a not-yet-eligible creator: an ordinary balanced group that credits creator_payable.
  const group = crypto.randomUUID();
  await db.query(
    `insert into public.ledger_entries (group_id, account, direction, amount_cents, memo) values
       ($1,'platform_escrow','debit',5000,'sale proceeds held'),
       ($1,'creator_payable','credit',5000,'creator share accrues')`, [group]);
  const balance = (await db.query('select net_cents::int as net, entry_count::int as n from public.ledger_group_balances where group_id = $1', [group])).rows[0];
  assert.deepEqual(balance, { net: 0, n: 2 }, 'balanced, like any other sale');
  await assert.rejects(() => queryAsService('update public.ledger_entries set amount_cents = 1 where group_id = $1', [group]),
    /permission denied/i, 'and append-only, like any other entry');
});

// ---------------------------------------------------------------- 8. static rules

test('negative: the eligibility code reads no trust, writes no ledger or decision, keeps no residence and makes no payout', () => {
  for (const file of ['payout-eligibility.mjs', 'parked-market-policy.mjs']) {
    const source = fs.readFileSync(path.join(here, '..', file), 'utf8');
    const code = source.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/*')).join('\n');
    assert.ok(!/creator_trust|buyer_trust|trustLevel|trust_level/.test(code), `${file}: no trust`);
    assert.ok(!/ledger|payable|escrow|insert into|update |delete from|\.query\(/i.test(code), `${file}: no ledger or sql`);
    assert.ok(!/needs_review|'fail'|"fail"|'review'/.test(code), `${file}: no review or fail outcome`);
    assert.ok(!/console\.|telemetry|fetch\(|child_process|http\.request|https\.request/.test(code), `${file}: no logging or network`);
    assert.ok(!/stripe|payoneer|paypal|transfer\(|payout\(/i.test(code), `${file}: makes no payout`);
    assert.ok(!/record\(|recorder/.test(code), `${file}: writes no decision`);
  }
  const imports = [...fs.readFileSync(path.join(here, '..', 'payout-eligibility.mjs'), 'utf8').matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1]).sort();
  assert.deepEqual(imports, ['./parked-market-policy.mjs', 'node:fs', 'node:path', 'node:url'], 'no database, service or trust import');
});
