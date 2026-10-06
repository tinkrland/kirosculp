// batch 5 tests: policy evaluation and the decision service, with in-memory ports.
// the database-backed path is covered in service-db.test.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PayoutSignalCheckService, evaluateChecks as evaluateChecksRaw, REASON_CODES, MONEY_MOMENTS,
  ServiceInputError, MoneyMomentNotAllowedError, PolicyUnavailableError, ReplayMismatchError,
  CheckNotRecordedError,
} from '../payout-signal-check.mjs';
import { FreeIpIntelligenceAdapter, InvalidIpError, FLAG_NAMES } from '../ip-intelligence.mjs';
import { loadFeeds } from '../feeds.mjs';
import { MONEY_MOMENTS as CLIENT_MOMENTS } from '../collector.mjs';
import { RAW_MARKER, makeKeyRing, desktopPayload } from './fixtures.mjs';
import { IPS, writeFeedDir } from './ip-fixtures.mjs';
import { StubCommercialAdapter, VENDOR_FIELD_NAMES } from './stub-commercial-adapter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const STRICT = { mandatoryChecks: ['proxy', 'vpn'], positiveOutcome: 'needs_review' };

// the mandatory-check tests in this file predate the territory check and do not
// exercise it, so they run against an empty review-trigger list. the territory
// behavior has its own file, territory.test.mjs.
const NO_TERRITORIES = { embargoedTerritories: new Set() };
const evaluateChecks = (policy, dev, network, territories = NO_TERRITORIES) =>
  evaluateChecksRaw(policy, dev, network, territories);
const emptyTerritoryStore = { async getEmbargoList() { return NO_TERRITORIES; } };

// ------------------------------------------------------------ test doubles

/** a valid port result built from compact per-flag states. */
function net(states = {}) {
  const result = {
    adapterVersion: 'test-1', ipVersion: 4, coverage: {}, availability: {}, flags: {}, sources: [],
    geo: { countryCode: null, subdivisionCode: null, coverage: 'none', source: null },
  };
  for (const name of FLAG_NAMES) {
    const s = { value: false, coverage: 'full', availability: 'ok', ...(states[name] ?? {}) };
    result.coverage[name] = s.coverage;
    result.availability[name] = s.availability;
    result.flags[name] = {
      value: s.value,
      source: s.coverage === 'none' ? null : { id: `src-${name}`, datasetVersion: 'v-test' },
      confidence: 'medium',
    };
  }
  return result;
}
const device = (collectionStatus = 'complete') => ({ collectionStatus });

/** an in-memory recorder that mimics the database function's contract. */
function memoryRecorder() {
  const rows = new Map();
  const calls = { record: 0, find: 0 };
  return {
    rows, calls,
    async record(row) {
      calls.record++;
      rows.set(row.submissionId, row);
      return { outcome: row.outcome, reason_codes: row.reasonCodes, policy_version: row.policyVersion, selected_checks: row.selectedChecks, replayed: false };
    },
    async findExisting(id) {
      calls.find++;
      const r = rows.get(id);
      if (!r) return null;
      return {
        creatorProfileId: r.creatorProfileId, moment: r.moment, deviceHash: r.deviceHash, ipDigest: r.ipDigest,
        decision: { outcome: r.outcome, reasonCodes: r.reasonCodes, policyVersion: r.policyVersion, selectedChecks: r.selectedChecks },
      };
    },
  };
}

const POLICIES = {
  DEFAULT: { policyVersion: 'v1', mandatoryChecks: [], positiveOutcome: 'needs_review' },
  IN: { policyVersion: 'v1', ...STRICT }, PK: { policyVersion: 'v1', ...STRICT }, BD: { policyVersion: 'v1', ...STRICT },
};
function memoryPolicyStore(table = POLICIES) {
  const calls = [];
  return { calls, async getPolicy(version, market) { calls.push({ version, market }); return table[market] ?? table.DEFAULT ?? null; } };
}

function makeService(overrides = {}) {
  const feeds = writeFeedDir();
  const { sources } = loadFeeds({ dir: feeds.dir });
  const recorder = overrides.recorder ?? memoryRecorder();
  const policyStore = overrides.policyStore ?? memoryPolicyStore();
  const ipAdapter = overrides.ipAdapter ?? new FreeIpIntelligenceAdapter({ sources });
  const telemetry = overrides.telemetry ?? null;
  const territoryListStore = overrides.territoryListStore ?? emptyTerritoryStore;
  const service = new PayoutSignalCheckService({ ipAdapter, keyRing: makeKeyRing(), policyStore, territoryListStore, recorder, telemetry });
  return { service, recorder, policyStore, ipAdapter, cleanup: feeds.cleanup };
}

const request = (o = {}) => ({
  creatorProfileId: crypto.randomUUID(), moment: 'payout_onboarding', submissionId: crypto.randomUUID(),
  observedIp: IPS.residential, rawDevicePayload: desktopPayload(), market: 'GB', ...o,
});

// ------------------------------------------------------ pure policy: outcomes

test('positive: the owner-ruled outcomes, one case each', () => {
  const run = (policy, dev, network) => evaluateChecks(policy, dev, network);
  const clean = net();
  assert.deepEqual(run(STRICT, device(), clean), { outcome: 'pass', reasonCodes: [], selectedChecks: ['proxy', 'vpn'] });

  assert.deepEqual(run(STRICT, device(), net({ vpn: { value: true } })).reasonCodes, ['vpn_detected']);
  assert.equal(run(STRICT, device(), net({ vpn: { value: true } })).outcome, 'needs_review', 'ruling 1: review, not fail');
  assert.deepEqual(run(STRICT, device(), net({ proxy: { value: true }, vpn: { value: true } })).reasonCodes, ['proxy_detected', 'vpn_detected']);

  const feedDown = run(STRICT, device(), net({ vpn: { coverage: 'none', availability: 'unavailable' } }));
  assert.deepEqual([feedDown.outcome, feedDown.reasonCodes], ['needs_review', ['feed_unavailable']], 'ruling 2');

  const noCoverage = run(STRICT, device(), net({ vpn: { coverage: 'none' } }));
  assert.deepEqual([noCoverage.outcome, noCoverage.reasonCodes], ['needs_review', ['coverage_unavailable']]);

  const noCollection = run(STRICT, device('unavailable'), clean);
  assert.deepEqual([noCollection.outcome, noCollection.reasonCodes], ['needs_review', ['collection_unavailable']], 'ruling 3');

  assert.equal(run(STRICT, device('partial'), clean).outcome, 'pass', 'partial collection is not a failed collection');
});

test('positive: only mandatory checks gate, so a positive outside the mandatory set is evidence only', () => {
  assert.equal(evaluateChecks(STRICT, device(), net({ tor: { value: true } })).outcome, 'pass');
  assert.equal(evaluateChecks(STRICT, device(), net({ datacenter: { value: true } })).outcome, 'pass');
  const nonStrict = { mandatoryChecks: [], positiveOutcome: 'needs_review' };
  assert.equal(evaluateChecks(nonStrict, device(), net({ vpn: { value: true }, proxy: { value: true } })).outcome, 'pass', 'non-strict markets have no gate');
  assert.equal(evaluateChecks(nonStrict, device(), null).outcome, 'pass', 'no mandatory check means no feed is required');
  assert.equal(evaluateChecks(nonStrict, device('unavailable'), net()).outcome, 'needs_review', 'a failed collection still needs review everywhere');
});

test('positive: fail is used only when configured and only for a positive, never for an outage', () => {
  const failPolicy = { mandatoryChecks: ['proxy', 'vpn'], positiveOutcome: 'fail' };
  assert.equal(evaluateChecks(failPolicy, device(), net({ vpn: { value: true } })).outcome, 'fail');
  assert.equal(evaluateChecks(failPolicy, device(), null).outcome, 'needs_review', 'our outage is never a hard fail');
  assert.equal(evaluateChecks(failPolicy, device('unavailable'), net()).outcome, 'needs_review');
  assert.equal(evaluateChecks(failPolicy, device(), net({ vpn: { coverage: 'none' } })).outcome, 'needs_review');
  const both = evaluateChecks(failPolicy, device(), net({ proxy: { coverage: 'none', availability: 'unavailable' }, vpn: { value: true } }));
  assert.deepEqual([both.outcome, both.reasonCodes], ['fail', ['vpn_detected', 'feed_unavailable']], 'a real positive still fails');
});

test('positive: a positive from a partly failed source is kept alongside the outage reason', () => {
  const r = evaluateChecks(STRICT, device(), net({ vpn: { value: true, coverage: 'partial', availability: 'unavailable' } }));
  assert.deepEqual(r.reasonCodes, ['vpn_detected', 'feed_unavailable']);
  assert.equal(r.outcome, 'needs_review');
});

test('positive: reason codes always come out in one canonical order, whatever the input order', () => {
  const everything = evaluateChecks(
    { mandatoryChecks: ['datacenter', 'tor', 'vpn', 'proxy'], positiveOutcome: 'needs_review' }, // listed backwards
    device('unavailable'),
    net({
      proxy: { value: true }, vpn: { value: true }, tor: { value: true },
      datacenter: { value: true, coverage: 'partial', availability: 'unavailable' },
    }),
  );
  assert.deepEqual(everything.reasonCodes, [
    'proxy_detected', 'vpn_detected', 'tor_detected', 'datacenter_detected', 'feed_unavailable', 'collection_unavailable',
  ]);
  assert.deepEqual(everything.selectedChecks, ['proxy', 'vpn', 'tor', 'datacenter'], 'selected checks are canonical too');
  assert.ok(everything.reasonCodes.length <= 8, 'fits the database limit of eight');
  assert.deepEqual(everything.reasonCodes, REASON_CODES.filter((c) => everything.reasonCodes.includes(c)));
});

test('negative: a null network result means every mandatory feed is unavailable', () => {
  const r = evaluateChecks({ mandatoryChecks: ['proxy', 'vpn', 'tor', 'datacenter'], positiveOutcome: 'needs_review' }, device(), null);
  assert.deepEqual([r.outcome, r.reasonCodes], ['needs_review', ['feed_unavailable']]);
});

test('positive: exhaustive sweep, no unevaluated or positive mandatory check ever passes', () => {
  const states = [];
  for (const availability of ['ok', 'unavailable']) {
    for (const coverage of ['full', 'partial', 'none']) {
      for (const value of [true, false]) {
        if (coverage === 'none' && value) continue; // the contract forbids it
        states.push({ availability, coverage, value });
      }
    }
  }
  assert.equal(states.length, 10);
  let cases = 0;
  for (const a of states) for (const b of states) {
    for (const collection of ['complete', 'partial', 'unavailable']) {
      for (const positiveOutcome of ['needs_review', 'fail']) {
        const policy = { mandatoryChecks: ['proxy', 'vpn'], positiveOutcome };
        const r = evaluateChecks(policy, device(collection), net({ proxy: a, vpn: b }));
        cases++;
        const label = JSON.stringify({ a, b, collection, positiveOutcome });
        const unevaluated = [a, b].some((s) => s.coverage === 'none' || s.availability === 'unavailable');
        const positive = a.value || b.value;
        if (unevaluated || positive || collection === 'unavailable') assert.notEqual(r.outcome, 'pass', label);
        else assert.equal(r.outcome, 'pass', label);
        assert.equal(r.outcome === 'pass', r.reasonCodes.length === 0, `pass iff no reason: ${label}`);
        if (r.outcome === 'fail') assert.ok(positive && positiveOutcome === 'fail', `fail only when configured and positive: ${label}`);
        if (positiveOutcome === 'needs_review') assert.notEqual(r.outcome, 'fail', label);
        assert.ok(r.reasonCodes.every((c) => REASON_CODES.includes(c)), label);
        assert.equal(new Set(r.reasonCodes).size, r.reasonCodes.length, 'no duplicate reasons');
      }
    }
  }
  assert.equal(cases, 600);
});

test('positive: evaluation is deterministic and does not mutate its inputs', () => {
  const policy = structuredClone(STRICT);
  const network = net({ vpn: { value: true } });
  const before = JSON.stringify([policy, network]);
  const a = evaluateChecks(policy, device(), network);
  const b = evaluateChecks(policy, device(), network);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify([policy, network]), before);
});

// ------------------------------------------------- service: moments and input

test('positive: both money moments run a check and write exactly one decision each', async () => {
  for (const moment of MONEY_MOMENTS) {
    const { service, recorder, cleanup } = makeService();
    try {
      const r = await service.check(request({ moment }));
      assert.equal(r.outcome, 'pass');
      assert.equal(r.replayed, false);
      assert.equal(recorder.rows.size, 1, moment);
      assert.equal([...recorder.rows.values()][0].moment, moment);
    } finally { cleanup(); }
  }
});

test('negative: any other moment is refused before the adapter, the policy or storage is touched', async () => {
  const touched = { adapter: 0 };
  const spyAdapter = { lookup: async () => { touched.adapter++; throw new Error('must not run'); } };
  const { service, recorder, policyStore, cleanup } = makeService({ ipAdapter: spyAdapter });
  try {
    for (const moment of ['signup', 'browse', 'listing_create', 'checkout', 'login', 'payout', 'PAYOUT_REQUEST', '', undefined, null, 7, {}]) {
      await assert.rejects(() => service.check(request({ moment })), MoneyMomentNotAllowedError, String(moment));
    }
    assert.equal(touched.adapter, 0);
    assert.equal(recorder.calls.record + recorder.calls.find, 0, 'storage untouched');
    assert.equal(policyStore.calls.length, 0, 'policy untouched');
  } finally { cleanup(); }
});

test('positive: the service moment list equals the client collector list', () => {
  assert.deepEqual([...MONEY_MOMENTS].sort(), [...CLIENT_MOMENTS].sort());
});

test('negative: caller-supplied outcome, trust, geography or provider fields are rejected', async () => {
  const { service, recorder, cleanup } = makeService();
  try {
    for (const extra of [
      { outcome: 'pass' }, { reasonCodes: [] }, { trustLevel: 'trusted' }, { score: 0.99 },
      { policyVersion: 'v9' }, { mandatoryChecks: [] }, { geo: { countryCode: 'GB' } },
      { country: 'GB' }, { corridor: 'IN' }, { networkFlags: {} }, { providerResult: {} }, { ipIntelligence: {} },
      { creatorTrust: 'high' }, { deviceHash: 'a'.repeat(64) },
    ]) {
      await assert.rejects(() => service.check({ ...request(), ...extra }), ServiceInputError, Object.keys(extra)[0]);
    }
    assert.equal(recorder.rows.size, 0);
    assert.equal(recorder.calls.record + recorder.calls.find, 0);
  } finally { cleanup(); }
});

test('negative: malformed ids, markets and addresses are rejected before anything is recorded', async () => {
  const { service, recorder, cleanup } = makeService();
  try {
    for (const bad of [
      { creatorProfileId: 'not-a-uuid' }, { creatorProfileId: undefined }, { creatorProfileId: 7 },
      { submissionId: 'abc' }, { submissionId: '' }, { submissionId: null },
      { market: 'gb' }, { market: 'GBR' }, { market: '' }, { market: 'DEFAULT' }, { market: undefined }, { market: 'G1' },
    ]) {
      await assert.rejects(() => service.check(request(bad)), ServiceInputError, JSON.stringify(bad));
    }
    for (const observedIp of ['', 'nope', '1.2.3', '300.1.1.1', null, undefined, 42]) {
      await assert.rejects(() => service.check(request({ observedIp })), InvalidIpError, String(observedIp));
    }
    for (const notAnObject of [null, undefined, 'x', 7, []]) {
      await assert.rejects(() => service.check(notAnObject), (e) => e instanceof ServiceInputError || e instanceof MoneyMomentNotAllowedError);
    }
    assert.equal(recorder.calls.record, 0);
  } finally { cleanup(); }
});

// -------------------------------------------------- service: strict vs other

test('positive: strict markets make vpn and proxy mandatory, so a positive goes to review', async () => {
  for (const market of ['IN', 'PK', 'BD']) {
    for (const [observedIp, code] of [[IPS.vpn, 'vpn_detected'], [IPS.openProxy, 'proxy_detected']]) {
      const { service, cleanup } = makeService();
      try {
        const r = await service.check(request({ market, observedIp }));
        assert.equal(r.outcome, 'needs_review', `${market} ${code}`);
        assert.deepEqual(r.reasonCodes, [code]);
        assert.deepEqual(r.selectedChecks, ['proxy', 'vpn']);
      } finally { cleanup(); }
    }
  }
});

test('positive: the same address passes in a non-strict market, where the checks are not a gate', async () => {
  for (const market of ['GB', 'US', 'DE', 'ZZ']) {
    const { service, recorder, cleanup } = makeService();
    try {
      for (const observedIp of [IPS.vpn, IPS.openProxy, IPS.tor]) {
        const r = await service.check(request({ market, observedIp }));
        assert.equal(r.outcome, 'pass', `${market} ${observedIp}`);
        assert.deepEqual(r.selectedChecks, []);
      }
      const stored = [...recorder.rows.values()][0];
      assert.equal(stored.networkFlags.vpn.value, true, 'the flag is still recorded as evidence');
      assert.equal(stored.networkFlags.vpn.source_id, 'x4bnet-vpn');
    } finally { cleanup(); }
  }
});

test('positive: an unknown but well-formed market falls back to the default policy', async () => {
  const { service, policyStore, cleanup } = makeService();
  try {
    const r = await service.check(request({ market: 'ZZ', observedIp: IPS.vpn }));
    assert.equal(r.outcome, 'pass');
    assert.deepEqual(policyStore.calls, [{ version: 'v1', market: 'ZZ' }]);
  } finally { cleanup(); }
});

test('positive: a clean strict-market request passes and ipv6 in a strict market needs review for coverage', async () => {
  const { service, cleanup } = makeService();
  try {
    assert.equal((await service.check(request({ market: 'IN' }))).outcome, 'pass');
    const v6 = await service.check(request({ market: 'IN', observedIp: IPS.residentialV6 }));
    assert.equal(v6.outcome, 'needs_review');
    assert.deepEqual(v6.reasonCodes, ['coverage_unavailable'], 'ipv6 vpn was not evaluated, so it cannot pass');
    const v6proxy = await service.check(request({ market: 'IN', observedIp: IPS.openProxyV6 }));
    assert.deepEqual(v6proxy.reasonCodes, ['proxy_detected', 'coverage_unavailable']);
  } finally { cleanup(); }
});

test('negative: private and reserved addresses are never a pass in a strict market', async () => {
  const { service, cleanup } = makeService();
  try {
    for (const observedIp of [IPS.privateV4, IPS.loopbackV6, '192.168.0.1']) {
      const r = await service.check(request({ market: 'PK', observedIp }));
      assert.equal(r.outcome, 'needs_review', observedIp);
      assert.deepEqual(r.reasonCodes, ['coverage_unavailable']);
    }
  } finally { cleanup(); }
});

test('positive: an ipv4 client on a dual-stack socket is judged as ipv4', async () => {
  const { service, cleanup } = makeService();
  try {
    const r = await service.check(request({ market: 'BD', observedIp: IPS.mappedV4Vpn }));
    assert.deepEqual(r.reasonCodes, ['vpn_detected'], 'detected, not coverage_unavailable');
  } finally { cleanup(); }
});

// ------------------------------------------- service: failures never pass

test('negative: a failed or missing device collection is needs_review in every market', async () => {
  const { service, cleanup } = makeService();
  try {
    for (const market of ['GB', 'IN']) {
      for (const rawDevicePayload of [null, undefined, 'junk', {}, { components: {} }, { components: { webgl: 'unsupported' } }]) {
        const r = await service.check(request({ market, rawDevicePayload }));
        assert.equal(r.outcome, 'needs_review', `${market} ${JSON.stringify(rawDevicePayload)}`);
        assert.deepEqual(r.reasonCodes, ['collection_unavailable']);
      }
    }
  } finally { cleanup(); }
});

test('negative: a down or broken ip adapter is feed_unavailable, never pass and never fail', async () => {
  for (const [why, lookup] of [
    ['throws', async () => { throw new Error('vendor api unreachable'); }],
    ['rejects', () => Promise.reject(new Error('boom'))],
    ['returns junk', async () => ({ nonsense: true })],
    ['returns null', async () => null],
    ['breaks the contract', async () => { const r = net(); r.flags.vpn.value = true; r.coverage.vpn = 'none'; return r; }],
    ['unattributed positive', async () => { const r = net({ vpn: { value: true } }); r.flags.vpn.source = null; return r; }],
  ]) {
    const { service, recorder, cleanup } = makeService({ ipAdapter: { lookup } });
    try {
      const strict = await service.check(request({ market: 'IN' }));
      assert.equal(strict.outcome, 'needs_review', why);
      assert.deepEqual(strict.reasonCodes, ['feed_unavailable'], why);
      const stored = [...recorder.rows.values()][0];
      assert.equal(stored.adapterVersion, 'adapter-unavailable');
      for (const name of FLAG_NAMES) assert.equal(stored.networkFlags[name].coverage, 'none', `${why} ${name} is not evaluated`);
      const open = await service.check(request({ market: 'GB' }));
      assert.equal(open.outcome, 'pass', `${why}: a non-strict market does not need the feed`);
    } finally { cleanup(); }
  }
});

test('negative: feeds that fail to load leave every mandatory check unavailable', async () => {
  const empty = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP ?? '.'), 'signals-nofeeds-'));
  try {
    const { sources } = loadFeeds({ dir: empty });
    const { service, cleanup } = makeService({ ipAdapter: new FreeIpIntelligenceAdapter({ sources }) });
    try {
      const r = await service.check(request({ market: 'IN' }));
      assert.equal(r.outcome, 'needs_review');
      assert.deepEqual(r.reasonCodes, ['feed_unavailable']);
    } finally { cleanup(); }
  } finally { fs.rmSync(empty, { recursive: true, force: true }); }
});

test('negative: no policy means the check throws, so the workflow holds instead of passing', async () => {
  const { service, recorder, cleanup } = makeService({ policyStore: { getPolicy: async () => null } });
  try {
    await assert.rejects(() => service.check(request()), PolicyUnavailableError);
    assert.equal(recorder.calls.record, 0);
  } finally { cleanup(); }
});

test('negative: a policy read that throws is an unavailable policy and leaks nothing', async () => {
  const leaky = { getPolicy: async () => { throw Object.assign(new Error(`select from sculptura_private ${RAW_MARKER}`), { code: '42501' }); } };
  const { service, recorder, cleanup } = makeService({ policyStore: leaky });
  try {
    await assert.rejects(() => service.check(request()), (e) => {
      assert.ok(e instanceof PolicyUnavailableError);
      assert.ok(!`${e.message} ${JSON.stringify(e)}`.includes(RAW_MARKER));
      return true;
    });
    assert.equal(recorder.calls.record, 0);
  } finally { cleanup(); }
});

test('positive: seeded-style uuids without version bits are accepted', async () => {
  const { service, cleanup } = makeService();
  try {
    const r = await service.check(request({
      creatorProfileId: '10000000-0000-0000-0000-000000000001',
      submissionId: '20000000-0000-0000-0000-00000000abcd',
    }));
    assert.equal(r.outcome, 'pass');
    assert.equal(r.submissionId, '20000000-0000-0000-0000-00000000abcd');
  } finally { cleanup(); }
});

test('negative: a storage failure throws a class and code only, with no message, sql or input', async () => {
  const leaky = Object.assign(new Error(`insert into sculptura_private... ${RAW_MARKER} 203.0.113.9`), { code: '08006', name: 'ConnectionError' });
  const recorder = { ...memoryRecorder(), record: async () => { throw leaky; } };
  const { service, cleanup } = makeService({ recorder });
  try {
    await assert.rejects(() => service.check(request()), (e) => {
      assert.ok(e instanceof CheckNotRecordedError);
      assert.equal(e.causeClass, 'ConnectionError');
      assert.equal(e.causeCode, '08006');
      const text = `${e.message} ${JSON.stringify(e)} ${e.stack}`;
      assert.ok(!text.includes(RAW_MARKER) && !text.includes('203.0.113.9') && !text.includes('sculptura_private'));
      assert.equal(e.cause, undefined, 'the original error is not attached');
      return true;
    });
    const readFails = { ...memoryRecorder(), findExisting: async () => { throw new Error('read failed'); } };
    const second = makeService({ recorder: readFails });
    try { await assert.rejects(() => second.service.check(request()), CheckNotRecordedError); } finally { second.cleanup(); }
  } finally { cleanup(); }
});

// -------------------------------------------------------------- idempotency

test('positive: a repeat of the same request returns the stored decision without recomputing', async () => {
  const { service, recorder, ipAdapter, cleanup } = makeService();
  try {
    const req = request({ market: 'IN', observedIp: IPS.vpn });
    const first = await service.check({ ...req, rawDevicePayload: desktopPayload() });
    assert.equal(first.replayed, false);

    let lookups = 0;
    const original = ipAdapter.lookup.bind(ipAdapter);
    ipAdapter.lookup = async (...a) => { lookups++; return original(...a); };
    const second = await service.check({ ...req, rawDevicePayload: desktopPayload() });
    assert.equal(second.replayed, true);
    assert.deepEqual([second.outcome, second.reasonCodes], [first.outcome, first.reasonCodes]);
    assert.equal(lookups, 0, 'a known submission is not looked up again');
    assert.equal(recorder.rows.size, 1);
  } finally { cleanup(); }
});

test('positive: a retry still returns the original decision after the feeds change state', async () => {
  const flaky = { up: true, inner: null, async lookup(ip, ctx) { if (!this.up) throw new Error('down'); return this.inner.lookup(ip, ctx); } };
  const feeds = writeFeedDir();
  try {
    const { sources } = loadFeeds({ dir: feeds.dir });
    flaky.inner = new FreeIpIntelligenceAdapter({ sources });
    const { service, cleanup } = makeService({ ipAdapter: flaky });
    try {
      const req = request({ market: 'IN' });
      const first = await service.check({ ...req, rawDevicePayload: desktopPayload() });
      assert.equal(first.outcome, 'pass');
      flaky.up = false;
      const retry = await service.check({ ...req, rawDevicePayload: desktopPayload() });
      assert.equal(retry.outcome, 'pass', 'an honest retry is not turned into a conflict by an outage');
      assert.equal(retry.replayed, true);
    } finally { cleanup(); }
  } finally { feeds.cleanup(); }
});

test('negative: the same submission id with a different device, address, creator or moment is rejected', async () => {
  const { service, recorder, cleanup } = makeService();
  try {
    const req = request({ market: 'GB' });
    const first = await service.check({ ...req, rawDevicePayload: desktopPayload() });
    const other = desktopPayload({ components: { screen: { is_touchscreen: true, maxTouchPoints: 5, colorDepth: 30, mediaMatches: [] } } });
    const variants = [
      ['device', { rawDevicePayload: other }],
      ['address', { observedIp: IPS.tor, rawDevicePayload: desktopPayload() }],
      ['creator', { creatorProfileId: crypto.randomUUID(), rawDevicePayload: desktopPayload() }],
      ['moment', { moment: 'payout_request', rawDevicePayload: desktopPayload() }],
    ];
    for (const [why, change] of variants) {
      await assert.rejects(() => service.check({ ...req, ...change }), ReplayMismatchError, why);
    }
    assert.equal(recorder.rows.size, 1);
    assert.equal([...recorder.rows.values()][0].outcome, first.outcome, 'the original is intact');
  } finally { cleanup(); }
});

test('positive: a concurrent request that loses the race resolves to the stored decision', async () => {
  const base = memoryRecorder();
  let stored = null;
  const racing = {
    ...base,
    async findExisting(id) { return stored ? base.findExisting(id) : null; },
    async record(row) {
      base.rows.set(row.submissionId, row); stored = row; // the "other" request got there first
      throw Object.assign(new Error('submission id reused with different input'), { code: '22023' });
    },
  };
  const { service, cleanup } = makeService({ recorder: racing });
  try {
    const r = await service.check(request());
    assert.equal(r.replayed, true);
    assert.equal(r.outcome, 'pass');
  } finally { cleanup(); }

  const neverStored = { ...memoryRecorder(), record: async () => { throw Object.assign(new Error('x'), { code: '22023' }); } };
  const second = makeService({ recorder: neverStored });
  try { await assert.rejects(() => second.service.check(request()), ReplayMismatchError); } finally { second.cleanup(); }
});

// ------------------------------------------------------- what is kept / returned

test('negative: the returned decision carries no payload, address, hash, market, geo or provider data', async () => {
  const { service, cleanup } = makeService();
  try {
    const r = await service.check(request({ market: 'IN', observedIp: IPS.vpn }));
    assert.deepEqual(Object.keys(r).sort(), ['outcome', 'policyVersion', 'reasonCodes', 'replayed', 'selectedChecks', 'submissionId']);
    const text = JSON.stringify(r);
    for (const trace of [IPS.vpn, 'x4bnet', 'commercial', RAW_MARKER, 'Chrome', 'GeForce', '"IN"', 'market', 'country', 'geo']) {
      assert.ok(!text.includes(trace), `the decision does not contain ${trace}`);
    }
  } finally { cleanup(); }
});

test('negative: the recorded row has hashes and flags but no address, payload or market', async () => {
  const { service, recorder, cleanup } = makeService();
  try {
    const raw = desktopPayload();
    await service.check({ ...request({ market: 'PK', observedIp: IPS.vpn }), rawDevicePayload: raw });
    const row = [...recorder.rows.values()][0];
    assert.match(row.deviceHash, /^[0-9a-f]{64}$/);
    assert.match(row.ipDigest, /^[0-9a-f]{64}$/);
    // geoEvidence is the one reviewed exception (batch 8): attributed decision evidence.
    assert.ok(!Object.keys(row).filter((k) => k !== 'geoEvidence').some((k) => /market|country|geo|corridor|ip$|payload/i.test(k)), Object.keys(row).join(','));
    assert.deepEqual(Object.keys(row.geoEvidence).sort(), ['country_code', 'coverage', 'dataset_version', 'source_id']);
    assert.ok(!JSON.stringify(row.geoEvidence).includes(IPS.vpn), 'the geo evidence holds no plaintext address');
    const text = JSON.stringify(row);
    for (const trace of [IPS.vpn, RAW_MARKER, 'Chrome/120', 'PK']) assert.ok(!text.includes(trace), trace);
    assert.deepEqual(Object.keys(raw), [], 'the raw payload object was cleared after processing');
  } finally { cleanup(); }
});

test('positive: the ip digest is stable across textual forms of the same address and differs per address', async () => {
  const { service, recorder, cleanup } = makeService();
  try {
    const forms = ['2001:db8::1', '2001:0db8:0000:0000:0000:0000:0000:0001', '2001:DB8::1'];
    for (const observedIp of forms) await service.check(request({ observedIp }));
    const other = request({ observedIp: '2001:db8::2' });
    await service.check(other);
    const digests = [...recorder.rows.values()].map((r) => r.ipDigest);
    assert.equal(new Set(digests.slice(0, 3)).size, 1, 'one address, one digest');
    assert.notEqual(digests[3], digests[0]);
    await service.check(request({ observedIp: IPS.mappedV4Vpn }));
    await service.check(request({ observedIp: IPS.vpn }));
    const last = [...recorder.rows.values()].slice(-2).map((r) => r.ipDigest);
    assert.equal(last[0], last[1], 'a mapped ipv4 address and the plain one share a digest');
  } finally { cleanup(); }
});

test('positive: telemetry carries ids, outcome and reasons only, and a throwing hook cannot change a decision', async () => {
  const events = [];
  const { service, cleanup } = makeService({ telemetry: (e) => events.push(e) });
  try {
    await service.check(request({ market: 'IN', observedIp: IPS.vpn }));
    assert.equal(events.length, 1);
    assert.deepEqual(Object.keys(events[0]).sort(), ['event', 'outcome', 'policyVersion', 'reasonCodes', 'replayed', 'serviceVersion', 'submissionId']);
    const text = JSON.stringify(events);
    for (const trace of [IPS.vpn, RAW_MARKER, '"IN"', 'x4bnet']) assert.ok(!text.includes(trace), trace);
  } finally { cleanup(); }
  const boom = makeService({ telemetry: () => { throw new Error('hook failed'); } });
  try { assert.equal((await boom.service.check(request())).outcome, 'pass'); } finally { boom.cleanup(); }
});

// ------------------------------------------------------- swap and static rules

test('positive: the same service decides with the free adapter and with a commercial stub', async () => {
  const free = makeService();
  const commercial = makeService({ ipAdapter: new StubCommercialAdapter() });
  try {
    for (const { service } of [free, commercial]) {
      assert.equal((await service.check(request({ market: 'IN', observedIp: IPS.vpn }))).outcome, 'needs_review');
      assert.equal((await service.check(request({ market: 'IN', observedIp: IPS.residential }))).outcome, 'pass');
      assert.equal((await service.check(request({ market: 'GB', observedIp: IPS.vpn }))).outcome, 'pass');
    }
    // a fresh payload each time: the service clears the caller's payload after processing.
    const v6 = () => request({ market: 'IN', observedIp: '2001:db8::77' });
    assert.deepEqual((await free.service.check(v6())).reasonCodes, ['coverage_unavailable'], 'the free feeds cannot see ipv6 vpn');
    assert.deepEqual((await commercial.service.check(v6())).reasonCodes, ['vpn_detected'], 'a commercial feed closes the gap');
  } finally { free.cleanup(); commercial.cleanup(); }
});

test('negative: the service names no vendor field, imports no stub, touches no trust table and never persists a raw country', () => {
  const source = fs.readFileSync(path.join(here, '..', 'payout-signal-check.mjs'), 'utf8');
  const code = source.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  for (const field of VENDOR_FIELD_NAMES) assert.ok(!code.includes(field), `names ${field}`);
  assert.ok(!code.includes('stub-commercial-adapter') && !code.includes('maxmind') && !code.includes('ipinfo'));
  assert.ok(!/creator_trust|buyer_trust|trust_level|trustLevel/.test(code), 'no code path reaches a trust record');
  // the service reads geo only inside evaluateChecks (to test membership of the
  // review-trigger list) and stores it only through toStoredGeoEvidence, which
  // emits an attributed object. it never builds a country field of its own, and
  // never returns one to a caller.
  const geoReads = code.split('\n').filter((l) => /\.geo\b|countryCode|subdivisionCode/.test(l));
  assert.ok(geoReads.length > 0 && geoReads.length <= 4, `geo is read in a few reviewed places: ${geoReads.length}`);
  assert.ok(!/return\s*\{[^}]*(countryCode|country_code)/.test(code), 'no result object carries a country');
  assert.ok(!/subdivision/.test(code.replace(/subdivisionCode/g, '')), 'no subdivision handling beyond the port');
  for (const net of ['fetch(', 'http.request', 'https.request', 'child_process']) assert.ok(!code.includes(net), net);
});

test('negative: the database ports take no driver and only parameterized sql', () => {
  const source = fs.readFileSync(path.join(here, '..', 'db-ports.mjs'), 'utf8');
  assert.ok(!/^\s*import\s/m.test(source), 'no imports, so no driver');
  assert.ok(!/\$\{/.test(source.replace(/^\s*\/\/.*$/gm, '')), 'no template interpolation into sql');
});
