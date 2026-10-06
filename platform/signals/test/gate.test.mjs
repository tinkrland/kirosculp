// batch 6 tests: the payout gate, the server-side entry contract for the two money
// moments. in-memory ports; the database-backed path is in gate-db.test.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createPayoutSignalGate, clientIpFromTrustedProxy, ROUTES, MAX_BODY_BYTES,
} from '../payout-gate.mjs';
import { PayoutSignalCheckService } from '../payout-signal-check.mjs';
import { FreeIpIntelligenceAdapter } from '../ip-intelligence.mjs';
import { loadFeeds } from '../feeds.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload } from './fixtures.mjs';
import { IPS, writeFeedDir } from './ip-fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ALICE = '10000000-0000-0000-0000-000000000001';
const BOB = '10000000-0000-0000-0000-000000000003';
const ONBOARDING = '/payout/onboarding/signals';
const REQUEST = '/payout/request/signals';

// ---------------------------------------------------------------- test doubles

const policies = {
  DEFAULT: { policyVersion: 'v1', mandatoryChecks: [], positiveOutcome: 'needs_review' },
  IN: { policyVersion: 'v1', mandatoryChecks: ['proxy', 'vpn'], positiveOutcome: 'needs_review' },
};
function memoryRecorder() {
  const rows = new Map();
  return {
    rows,
    async record(row) {
      rows.set(row.submissionId, row);
      return { outcome: row.outcome, reason_codes: row.reasonCodes, policy_version: row.policyVersion, selected_checks: row.selectedChecks, replayed: false };
    },
    async findExisting(id) {
      const r = rows.get(id);
      return r ? { creatorProfileId: r.creatorProfileId, moment: r.moment, deviceHash: r.deviceHash, ipDigest: r.ipDigest,
        decision: { outcome: r.outcome, reasonCodes: r.reasonCodes, policyVersion: r.policyVersion, selectedChecks: r.selectedChecks } } : null;
    },
  };
}

/** a gate wired to in-memory ports. `world` is what the server knows about the caller. */
function makeGate(world = {}, { ipAdapter, service: serviceOverride } = {}) {
  const feeds = writeFeedDir();
  const { sources } = loadFeeds({ dir: feeds.dir });
  const recorder = memoryRecorder();
  const seen = { markets: [], checks: [] };
  const service = serviceOverride ?? new PayoutSignalCheckService({
    ipAdapter: ipAdapter ?? new FreeIpIntelligenceAdapter({ sources }),
    territoryListStore: { async getEmbargoList() { return { embargoedTerritories: new Set() }; } },
    keyRing: makeKeyRing(),
    policyStore: { async getPolicy(_v, market) { seen.markets.push(market); return policies[market] ?? policies.DEFAULT; } },
    recorder,
  });
  const realCheck = service.check.bind(service);
  service.check = async (input) => { seen.checks.push(structuredClone({ ...input, rawDevicePayload: undefined })); return realCheck(input); };

  const events = [];
  const state = {
    session: { creatorProfileId: ALICE }, market: 'GB', ip: IPS.residential, ...world,
  };
  const gate = createPayoutSignalGate({
    service,
    authenticate: async () => state.session,
    resolveMarket: async (id) => { seen.resolvedFor = id; return typeof state.market === 'function' ? state.market() : state.market; },
    clientIp: () => state.ip,
    telemetry: (e) => events.push(e),
  });
  return { gate, recorder, seen, events, state, cleanup: feeds.cleanup };
}

const post = (path, body, extra = {}) => ({
  method: 'POST', path, headers: {}, rawBody: JSON.stringify(body), socketAddress: '203.0.113.99', ...extra,
});
const good = (over = {}) => ({ submissionId: crypto.randomUUID(), device: desktopPayload(), ...over });

// --------------------------------------------------------------------- routing

test('positive: both money-moment routes reach the service with the right moment', async () => {
  for (const [route, moment] of Object.entries(ROUTES)) {
    const { gate, recorder, cleanup } = makeGate();
    try {
      const r = await gate.handle(post(route, good()));
      assert.equal(r.status, 200, route);
      assert.equal([...recorder.rows.values()][0].moment, moment);
    } finally { cleanup(); }
  }
  assert.deepEqual(Object.keys(ROUTES).sort(), [ONBOARDING, REQUEST]);
});

test('negative: every other path is a 404 that reaches nothing', async () => {
  const { gate, recorder, seen, cleanup } = makeGate();
  try {
    const paths = [
      '/signup', '/login', '/browse', '/listings', '/listings/create', '/checkout', '/orders', '/storefront/alice',
      '/payout', '/payout/request', '/payout/onboarding', '/payout/request/signals/', '/payout/request/signals/extra',
      '/PAYOUT/REQUEST/SIGNALS', '/payout/../payout/request/signals', '', '/', undefined, null, 42, '__proto__', 'constructor',
    ];
    for (const p of paths) {
      const r = await gate.handle(post(p, good()));
      assert.equal(r.status, 404, String(p));
      assert.deepEqual(r.body, { status: 'not_found' });
      assert.equal(r.decision, null);
    }
    assert.equal(recorder.rows.size, 0);
    assert.equal(seen.checks.length, 0, 'the service was never called');
    assert.equal(seen.markets.length, 0);
  } finally { cleanup(); }
  const nothing = await makeGate().gate.handle(undefined);
  assert.equal(nothing.status, 404);
});

test('negative: only POST is accepted on the money-moment routes', async () => {
  const { gate, seen, cleanup } = makeGate();
  try {
    for (const method of ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'post', undefined]) {
      const r = await gate.handle(post(ONBOARDING, good(), { method }));
      assert.equal(r.status, 405, String(method));
    }
    assert.equal(seen.checks.length, 0);
  } finally { cleanup(); }
});

// ------------------------------------------------------------ who is calling

test('negative: no session is a 401 and reaches nothing', async () => {
  const { gate, state, seen, recorder, cleanup } = makeGate({ session: null });
  try {
    assert.equal((await gate.handle(post(ONBOARDING, good()))).status, 401);
    state.session = undefined;
    assert.equal((await gate.handle(post(ONBOARDING, good()))).status, 401);
    assert.equal(seen.checks.length, 0);
    assert.equal(recorder.rows.size, 0);
  } finally { cleanup(); }
  const throwing = createPayoutSignalGate({
    service: {}, authenticate: async () => { throw new Error(`session store down ${RAW_MARKER}`); },
    resolveMarket: async () => 'GB', clientIp: () => IPS.residential,
  });
  const r = await throwing.handle(post(ONBOARDING, good()));
  assert.equal(r.status, 401, 'an auth failure is a 401, never an exception');
  assert.ok(!JSON.stringify(r).includes(RAW_MARKER));
});

test('negative: a signed-in user who is not a creator is a 403 and reaches nothing', async () => {
  for (const session of [{ creatorProfileId: null }, { creatorProfileId: undefined }, { creatorProfileId: '' }, { creatorProfileId: 42 }, {}]) {
    const { gate, seen, recorder, cleanup } = makeGate({ session });
    try {
      assert.equal((await gate.handle(post(ONBOARDING, good()))).status, 403, JSON.stringify(session));
      assert.equal(seen.checks.length, 0);
      assert.equal(recorder.rows.size, 0);
    } finally { cleanup(); }
  }
});

test('negative: a creator id in the body is rejected, and the session creator is the only one ever used', async () => {
  const { gate, seen, recorder, cleanup } = makeGate();
  try {
    for (const extra of [{ creatorProfileId: BOB }, { creator_profile_id: BOB }, { creatorId: BOB }, { userId: BOB }, { creator: BOB }]) {
      const r = await gate.handle(post(ONBOARDING, good(extra)));
      assert.equal(r.status, 400, Object.keys(extra)[0]);
    }
    assert.equal(seen.checks.length, 0, 'rejected before the service');
    const ok = await gate.handle(post(ONBOARDING, good()));
    assert.equal(ok.status, 200);
    assert.equal(seen.checks[0].creatorProfileId, ALICE, 'the session creator is used');
    assert.equal(seen.resolvedFor, ALICE, 'and the market is resolved for the session creator');
    assert.equal([...recorder.rows.values()][0].creatorProfileId, ALICE);
  } finally { cleanup(); }
});

// -------------------------------------------- what the body may and may not say

test('negative: a client cannot supply a market, outcome, trust value, policy, geography, provider result or address', async () => {
  const { gate, seen, recorder, cleanup } = makeGate();
  try {
    const forbidden = [
      { market: 'GB' }, { country: 'GB' }, { corridor: 'IN' }, { geo: { countryCode: 'GB' } }, { region: 'EU' },
      { outcome: 'pass' }, { status: 'continue' }, { decision: { outcome: 'pass' } }, { reasonCodes: [] },
      { trustLevel: 'trusted' }, { score: 1 }, { policyVersion: 'v9' }, { mandatoryChecks: [] }, { positiveOutcome: 'pass' },
      { providerResult: { vpn: false } }, { networkFlags: {} }, { ipIntelligence: {} }, { flags: {} },
      { observedIp: '192.0.2.1' }, { ip: '192.0.2.1' }, { clientIp: '192.0.2.1' }, { xForwardedFor: '192.0.2.1' },
      { moment: 'payout_request' }, { deviceHash: 'a'.repeat(64) }, { hashKeyId: 'k' }, { skip: true }, { __proto__: { a: 1 }, constructor: 1 },
    ];
    for (const extra of forbidden) {
      const body = { submissionId: crypto.randomUUID(), device: desktopPayload(), ...extra };
      const r = await gate.handle(post(ONBOARDING, body));
      assert.equal(r.status, 400, JSON.stringify(Object.keys(extra)));
      assert.equal(r.decision, null);
    }
    assert.equal(seen.checks.length, 0);
    assert.equal(recorder.rows.size, 0);
  } finally { cleanup(); }
});

test('negative: malformed, oversized and non-object bodies are a 400 before anything else runs', async () => {
  const { gate, seen, cleanup } = makeGate();
  try {
    const huge = JSON.stringify({ submissionId: crypto.randomUUID(), device: { components: { fonts: { f: 'x'.repeat(MAX_BODY_BYTES) } } } });
    for (const rawBody of [undefined, null, '', 'not json', '[]', '"str"', '7', 'null', '{"submissionId":', huge, Buffer.from('{"a":'), 42, {}]) {
      const r = await gate.handle({ ...post(ONBOARDING, good()), rawBody });
      assert.equal(r.status, 400, String(rawBody).slice(0, 30));
    }
    for (const submissionId of [undefined, null, 7, {}, [], true]) {
      assert.equal((await gate.handle(post(ONBOARDING, { submissionId, device: desktopPayload() }))).status, 400, String(submissionId));
    }
    assert.equal(seen.checks.length, 0);
  } finally { cleanup(); }
});

test('positive: a buffer body works, and a missing device is a failed collection, not a crash', async () => {
  const { gate, cleanup } = makeGate({ market: 'IN' });
  try {
    const buf = Buffer.from(JSON.stringify(good()));
    assert.equal((await gate.handle({ ...post(ONBOARDING, good()), rawBody: buf })).status, 200);
    const r = await gate.handle(post(ONBOARDING, { submissionId: crypto.randomUUID() }));
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'review');
    assert.deepEqual(r.decision.reasonCodes, ['collection_unavailable']);
  } finally { cleanup(); }
});

// ----------------------------------------------------------- market from server

test('positive: the market comes from the server record, and a strict market gates while another does not', async () => {
  for (const [market, expected] of [['IN', 'review'], ['GB', 'continue']]) {
    const { gate, seen, cleanup } = makeGate({ market, ip: IPS.vpn });
    try {
      const r = await gate.handle(post(ONBOARDING, good()));
      assert.equal(r.body.status, expected, market);
      assert.deepEqual(seen.markets, [market]);
    } finally { cleanup(); }
  }
});

test('negative: an unknown market is a hold, never a guess and never a pass', async () => {
  for (const market of [null, undefined, 42, () => { throw new Error('payout record unreadable'); }]) {
    const { gate, recorder, seen, events, cleanup } = makeGate({ market });
    try {
      const r = await gate.handle(post(ONBOARDING, good()));
      assert.equal(r.status, 503);
      assert.deepEqual(r.body, { status: 'hold' });
      assert.equal(r.decision, null);
      assert.equal(seen.checks.length, 0);
      assert.equal(recorder.rows.size, 0);
      assert.equal(events[0].cause, 'market_unknown');
    } finally { cleanup(); }
  }
});

// --------------------------------------------------------- client address rule

test('positive: the client address is the entry just inside the trusted proxies', () => {
  const xff = (v) => ({ headers: { 'x-forwarded-for': v } });
  assert.equal(clientIpFromTrustedProxy({ socketAddress: '203.0.113.5' }, { trustedProxyHops: 0 }), '203.0.113.5');
  assert.equal(clientIpFromTrustedProxy(xff('198.51.100.7'), { trustedProxyHops: 1 }), '198.51.100.7');
  assert.equal(clientIpFromTrustedProxy(xff('198.51.100.7, 10.0.0.2'), { trustedProxyHops: 2 }), '198.51.100.7');
  assert.equal(clientIpFromTrustedProxy(xff('192.0.2.1,198.51.100.7'), { trustedProxyHops: 1 }), '198.51.100.7', 'one trusted proxy: the last entry is ours');
  assert.equal(clientIpFromTrustedProxy({ headers: { 'x-forwarded-for': ['192.0.2.1', '198.51.100.7'] } }, { trustedProxyHops: 1 }), '198.51.100.7', 'repeated headers join');
  assert.equal(clientIpFromTrustedProxy(xff('2001:db8::1'), { trustedProxyHops: 1 }), '2001:db8::1');
});

test('negative: a client-forged leftmost x-forwarded-for entry is never used', () => {
  const spoof = { headers: { 'x-forwarded-for': '198.51.100.99, 203.0.113.7' }, socketAddress: '10.0.0.1' };
  assert.equal(clientIpFromTrustedProxy(spoof, { trustedProxyHops: 1 }), '203.0.113.7', 'the entry our proxy wrote, not the one the client claimed');
  const twoProxies = { headers: { 'x-forwarded-for': '192.0.2.250, 198.51.100.7, 10.0.0.2' } };
  assert.equal(clientIpFromTrustedProxy(twoProxies, { trustedProxyHops: 2 }), '198.51.100.7');
  assert.notEqual(clientIpFromTrustedProxy(twoProxies, { trustedProxyHops: 2 }), '192.0.2.250');
  assert.equal(clientIpFromTrustedProxy({ headers: { 'x-forwarded-for': '198.51.100.99' }, socketAddress: '203.0.113.5' }, { trustedProxyHops: 0 }), '203.0.113.5', 'with no trusted proxy the header is ignored entirely');
});

test('negative: a missing, short or malformed chain yields no address, which the gate turns into a hold', async () => {
  const xff = (v) => ({ headers: { 'x-forwarded-for': v } });
  for (const [request, hops] of [
    [{}, 1], [{ headers: {} }, 1], [xff(''), 1], [xff('   '), 1], [xff('198.51.100.7'), 2], [xff('not-an-ip'), 1],
    [xff('198.51.100.7, bogus'), 1], [xff('198.51.100.7:8080'), 1], [{ socketAddress: undefined }, 0], [{ socketAddress: 'nope' }, 0],
    [xff('198.51.100.7%eth0'), 1], [xff(42), 1],
  ]) {
    assert.equal(clientIpFromTrustedProxy(request, { trustedProxyHops: hops }), null, JSON.stringify(request));
  }
  for (const bad of [-1, 11, 1.5, '1', null, undefined, NaN]) {
    assert.throws(() => clientIpFromTrustedProxy({}, { trustedProxyHops: bad }), TypeError, String(bad));
  }
  const { gate, recorder, events, cleanup } = makeGate({ ip: null });
  try {
    const r = await gate.handle(post(ONBOARDING, good()));
    assert.equal(r.status, 503);
    assert.deepEqual(r.body, { status: 'hold' });
    assert.equal(recorder.rows.size, 0);
    assert.equal(events[0].cause, 'client_ip_unavailable');
  } finally { cleanup(); }
});

// ----------------------------------------------- what the browser is told

test('positive: the browser is told continue or review and nothing else', async () => {
  const cases = [['GB', IPS.residential, 'continue'], ['IN', IPS.residential, 'continue'], ['IN', IPS.vpn, 'review'], ['IN', IPS.openProxy, 'review'], ['IN', IPS.residentialV6, 'review']];
  for (const [market, ip, expected] of cases) {
    const { gate, cleanup } = makeGate({ market, ip });
    try {
      const r = await gate.handle(post(ONBOARDING, good()));
      assert.equal(r.status, 200);
      assert.equal(r.body.status, expected, `${market} ${ip}`);
      assert.deepEqual(Object.keys(r.body).sort(), ['status', 'submissionId']);
    } finally { cleanup(); }
  }
});

test('negative: the browser response never carries a reason, flag, source, market, address or hash', async () => {
  const { gate, cleanup } = makeGate({ market: 'IN', ip: IPS.vpn });
  try {
    const r = await gate.handle(post(ONBOARDING, good()));
    const text = JSON.stringify(r.body);
    for (const trace of [
      'vpn', 'proxy', 'tor', 'datacenter', 'detected', 'unavailable', 'coverage', 'reason', 'flag', 'x4bnet', 'ip2proxy', 'source',
      'market', 'IN', 'country', 'geo', IPS.vpn, 'hash', 'digest', 'policy', 'outcome', 'needs_review', 'fail', 'pass',
    ]) {
      // 'IN' is checked as a quoted token so it cannot match inside another word
      const needle = trace === 'IN' ? '"IN"' : trace;
      assert.ok(!text.includes(needle), `the browser body does not contain ${trace}`);
    }
    assert.ok(r.decision.reasonCodes.includes('vpn_detected'), 'the server-side decision still has the reason');
    assert.equal(r.decision.policyVersion, 'v1');
  } finally { cleanup(); }
});

test('positive: the server-side decision is complete for the payout workflow and still holds no market or address', async () => {
  const { gate, cleanup } = makeGate({ market: 'IN', ip: IPS.tor });
  try {
    const r = await gate.handle(post(REQUEST, good()));
    assert.deepEqual(Object.keys(r.decision).sort(), ['outcome', 'policyVersion', 'reasonCodes', 'replayed', 'selectedChecks', 'submissionId']);
    const text = JSON.stringify(r.decision);
    for (const trace of [IPS.tor, '"IN"', 'market', RAW_MARKER]) assert.ok(!text.includes(trace), trace);
  } finally { cleanup(); }
});

// ----------------------------------------------------------------- failures hold

test('negative: service failures are a 503 hold with no detail, never a pass and never a user failure', async () => {
  const { PolicyUnavailableError, CheckNotRecordedError } = await import('../payout-signal-check.mjs');
  const leaky = (e) => Object.assign(e, { message: `secret ${RAW_MARKER} ${IPS.vpn}` });
  for (const thrown of [
    new PolicyUnavailableError(), new CheckNotRecordedError(leaky(new Error('x'))), new Error(`unexpected ${RAW_MARKER}`),
    new TypeError('bug'), { not: 'an error' }, null,
  ]) {
    const { gate, events, cleanup } = makeGate({}, { service: { check: async () => { throw thrown; } } });
    try {
      const r = await gate.handle(post(ONBOARDING, good()));
      assert.equal(r.status, 503, String(thrown?.name));
      assert.deepEqual(r.body, { status: 'hold' });
      assert.equal(r.decision, null);
      const text = JSON.stringify({ r, events });
      assert.ok(!text.includes(RAW_MARKER) && !text.includes(IPS.vpn), 'nothing from the error leaks');
    } finally { cleanup(); }
  }
});

test('negative: a reused submission id with different input is a 409 and the original stands', async () => {
  const { gate, recorder, cleanup } = makeGate({ market: 'GB' });
  try {
    const sub = crypto.randomUUID();
    const first = await gate.handle(post(ONBOARDING, { submissionId: sub, device: desktopPayload() }));
    assert.equal(first.status, 200);
    const other = desktopPayload({ components: { screen: { is_touchscreen: true, maxTouchPoints: 5, colorDepth: 30, mediaMatches: [] } } });
    const clash = await gate.handle(post(ONBOARDING, { submissionId: sub, device: other }));
    assert.equal(clash.status, 409);
    assert.deepEqual(clash.body, { status: 'conflict' });
    assert.equal(recorder.rows.size, 1);
    const again = await gate.handle(post(ONBOARDING, { submissionId: sub, device: desktopPayload() }));
    assert.equal(again.status, 200);
    assert.equal(again.decision.replayed, true);
  } finally { cleanup(); }
});

test('negative: an invalid submission id from the body is a 400 before any lookup', async () => {
  const { gate, seen, cleanup } = makeGate();
  try {
    for (const submissionId of ['', 'abc', '1234', 'not-a-uuid', '../../etc', "'; drop table x; --", 'x'.repeat(100)]) {
      const r = await gate.handle(post(ONBOARDING, { submissionId, device: desktopPayload() }));
      assert.equal(r.status, 400, submissionId.slice(0, 20));
    }
    assert.equal(seen.markets.length, 0, 'the policy was never read');
  } finally { cleanup(); }
});

// ------------------------------------------------------------------- telemetry

test('positive: telemetry carries ids and outcomes only, and a throwing hook cannot change a response', async () => {
  const { gate, events, cleanup } = makeGate({ market: 'IN', ip: IPS.vpn });
  try {
    await gate.handle(post(ONBOARDING, good()));
    assert.equal(events.length, 1);
    assert.deepEqual(Object.keys(events[0]).sort(), ['event', 'moment', 'outcome', 'result', 'submissionId']);
    const text = JSON.stringify(events);
    for (const trace of [IPS.vpn, RAW_MARKER, '"IN"', 'vpn_detected', 'x4bnet']) assert.ok(!text.includes(trace), trace);
  } finally { cleanup(); }
  const feeds = writeFeedDir();
  try {
    const { sources } = loadFeeds({ dir: feeds.dir });
    const service = new PayoutSignalCheckService({
      ipAdapter: new FreeIpIntelligenceAdapter({ sources }), keyRing: makeKeyRing(), recorder: memoryRecorder(),
      territoryListStore: { async getEmbargoList() { return { embargoedTerritories: new Set() }; } },
      policyStore: { getPolicy: async () => policies.DEFAULT },
    });
    const gate2 = createPayoutSignalGate({
      service, authenticate: async () => ({ creatorProfileId: ALICE }), resolveMarket: async () => 'GB',
      clientIp: () => IPS.residential, telemetry: () => { throw new Error('hook failed'); },
    });
    assert.equal((await gate2.handle(post(ONBOARDING, good()))).status, 200);
  } finally { feeds.cleanup(); }
});

// --------------------------------------------------------------- static rules

test('negative: the gate imports no network, storage, trust or geography code and makes no payout', () => {
  const source = fs.readFileSync(path.join(here, '..', 'payout-gate.mjs'), 'utf8');
  const code = source.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.ok(!/creator_trust|buyer_trust|trustLevel|trust_level/.test(code));
  assert.ok(!/countryCode|\.geo\b|country_code/.test(code));
  for (const term of ['fetch(', 'http.request', 'https.request', 'child_process', 'stripe', 'payoneer', 'paypal', 'transfer(', 'payout(']) {
    assert.ok(!code.toLowerCase().includes(term.toLowerCase()), `gate must not contain ${term}`);
  }
  const imports = [...code.matchAll(/^import[^;]*from '([^']+)'/gms)].map((m) => m[1]).sort();
  assert.deepEqual(imports, ['./ip-intelligence.mjs', './payout-signal-check.mjs']);
});
