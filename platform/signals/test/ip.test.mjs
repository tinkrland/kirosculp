// batch 4 tests: ip parsing, feed parsers, the free adapter, the feed loader, the
// result contract, and swapping in a different adapter. offline, fixtures only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseIp, parseCidrOrHost, parseIpList, parseIp2ProxyCsv, RangeSet, createRangeSource,
  FreeIpIntelligenceAdapter, InvalidIpError, AdapterContractError, assertIpIntelligenceResult,
  toStoredNetworkFlags, isNonPublic, FLAG_NAMES, ADAPTER_VERSION,
} from '../ip-intelligence.mjs';
import { loadFeeds, buildManifest, MANIFEST_NAME, FEED_CONFIG } from '../feeds.mjs';
import { IPS, FEED_TEXT, writeFeedDir } from './ip-fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** a fully loaded free adapter over fresh fixture files. */
function freshAdapter(opts) {
  const feeds = writeFeedDir(opts);
  const { sources, report } = loadFeeds({ dir: feeds.dir });
  return { adapter: new FreeIpIntelligenceAdapter({ sources }), report, feeds };
}

// ------------------------------------------------------------------ parsing

test('positive: valid v4, v6, compressed and mapped addresses parse', () => {
  assert.deepEqual(parseIp('192.0.2.10'), { version: 4, value: 3221225994n, mapped: false });
  assert.equal(parseIp('2001:db8::1').version, 6);
  assert.equal(parseIp('::1').value, 1n);
  assert.equal(parseIp('::').value, 0n);
  assert.equal(parseIp('2001:0db8:0000:0000:0000:0000:0000:0001').value, parseIp('2001:db8::1').value);
  const mapped = parseIp('::ffff:198.51.100.20');
  assert.equal(mapped.version, 4, 'a mapped address is the ipv4 client it carries');
  assert.equal(mapped.mapped, true);
  assert.equal(mapped.value, parseIp('198.51.100.20').value);
});

test('negative: malformed addresses are rejected before any lookup', () => {
  const bad = [
    '', ' ', '1.2.3', '1.2.3.4.5', '256.1.1.1', '1.2.3.-4', '01.2.3.4x', 'abc', 'localhost', '1.2.3.4/24',
    '1.2.3.4 ', ' 1.2.3.4', '2001:db8::zz', '2001:db8:::1', 'fe80::1%eth0', '::ffff:999.1.1.1',
    '1'.repeat(46), null, undefined, 42, {}, [], ['1.2.3.4'],
  ];
  for (const input of bad) assert.throws(() => parseIp(input), InvalidIpError, JSON.stringify(input));
});

test('positive: cidr and host parsing is exact at the edges', () => {
  assert.deepEqual(parseCidrOrHost('198.51.100.0/24'), { version: 4, from: parseIp('198.51.100.0').value, to: parseIp('198.51.100.255').value });
  const host = parseCidrOrHost('203.0.113.30');
  assert.equal(host.from, host.to);
  const all = parseCidrOrHost('0.0.0.0/0');
  assert.equal(all.to - all.from, (1n << 32n) - 1n);
  assert.equal(parseCidrOrHost('198.51.100.77/24').from, parseIp('198.51.100.0').value, 'host bits are masked');
  assert.equal(parseCidrOrHost('2001:db8::/32').version, 6);
  for (const bad of ['1.2.3.4/33', '1.2.3.4/-1', '1.2.3.4/x', '2001:db8::/129', 'nope', '1.2.3.4/', '::ffff:1.2.3.4']) {
    assert.equal(parseCidrOrHost(bad), null, bad);
  }
});

test('positive: a range set merges, searches and respects boundaries', () => {
  const set = new RangeSet([[10n, 20n], [15n, 30n], [31n, 40n], [100n, 100n], [5n, 6n]]);
  assert.equal(set.size, 3, '10-20, 15-30 and adjacent 31-40 merge into one');
  for (const v of [5n, 6n, 10n, 25n, 40n, 100n]) assert.equal(set.contains(v), true, String(v));
  for (const v of [0n, 4n, 7n, 9n, 41n, 99n, 101n]) assert.equal(set.contains(v), false, String(v));
  assert.equal(new RangeSet().contains(1n), false);
});

test('positive: list parsing skips comments, counts bad lines and splits families', () => {
  const text = ['# header', '', '198.51.100.0/24   # inline', '203.0.113.30', '2001:db8::/32', 'garbage', '1.2.3.4/99', '  '].join('\r\n');
  const r = parseIpList(text);
  assert.equal(r.v4.length, 2);
  assert.equal(r.v6.length, 1);
  assert.equal(r.entries, 3);
  assert.equal(r.invalidLines, 2);
});

test('positive: the ip2proxy csv keeps open proxies only and reads past country columns', () => {
  const csv = [
    '"3405803976","3405803983","PUB","US","United States"',
    '"3221225984","3221226239","-","-","-"',
    '"100","200","VPN","-","-"',
    'not,a,row',
    '"300","100","PUB","-","-"',
    '"1","99999999999","PUB","-","-"',
  ].join('\n');
  const r = parseIp2ProxyCsv(csv, { family: 4 });
  assert.equal(r.entries, 1);
  assert.equal(r.unexpectedTypes, 1, 'a vpn row means a commercial file was loaded');
  assert.equal(r.invalidLines, 3, 'bad row, reversed range, out-of-range value');
  assert.deepEqual(Object.keys(r).sort(), ['entries', 'invalidLines', 'ranges', 'unexpectedTypes'], 'no country field is kept');
  assert.deepEqual(r.ranges, [[3405803976n, 3405803983n]], 'only the address range survives');
});

// ------------------------------------------------------------ flag mapping

test('positive: each address is flagged by exactly the source the spec assigns', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const r = async (ip) => assertIpIntelligenceResult(await adapter.lookup(ip));
    const flagsOf = async (ip) => Object.fromEntries(FLAG_NAMES.map((n) => [n, false]).map(([n]) => [n, null]))
      && (await r(ip)).flags;

    const vpn = await flagsOf(IPS.vpn);
    assert.equal(vpn.vpn.value, true);
    assert.equal(vpn.vpn.source.id, 'x4bnet-vpn');
    assert.equal(vpn.datacenter.value, true, 'the datacenter list is a superset that includes vpns');
    assert.equal(vpn.tor.value, false);
    assert.equal(vpn.proxy.value, false);

    const dc = await flagsOf(IPS.datacenterOnly);
    assert.equal(dc.datacenter.value, true);
    assert.equal(dc.vpn.value, false);
    assert.equal(dc.datacenter.source.id, 'x4bnet-datacenter');

    const tor = await flagsOf(IPS.tor);
    assert.equal(tor.tor.value, true);
    assert.equal(tor.tor.source.id, 'tor-bulk-exit');

    const proxy = await flagsOf(IPS.openProxy);
    assert.equal(proxy.proxy.value, true);
    assert.equal(proxy.proxy.source.id, 'ip2proxy-lite-px2');
    assert.equal(proxy.vpn.value, false, 'ip2proxy lite never raises vpn');
    assert.equal(proxy.tor.value, false, 'ip2proxy lite never raises tor');

    const proxy6 = await flagsOf(IPS.openProxyV6);
    assert.equal(proxy6.proxy.value, true, 'ip2proxy lite covers ipv6');
  } finally { feeds.cleanup(); }
});

test('positive: a residential address is clean on every flag with full coverage and attribution', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const r = assertIpIntelligenceResult(await adapter.lookup(IPS.residential));
    assert.equal(r.adapterVersion, ADAPTER_VERSION);
    assert.equal(r.ipVersion, 4);
    for (const name of FLAG_NAMES) {
      assert.equal(r.flags[name].value, false, name);
      assert.equal(r.coverage[name], 'full', name);
      assert.equal(r.availability[name], 'ok', name);
      assert.ok(r.flags[name].source.id && r.flags[name].source.datasetVersion, `${name} is attributed`);
    }
  } finally { feeds.cleanup(); }
});

test('positive: every positive flag carries source id and dataset version', async () => {
  const { adapter, feeds } = freshAdapter({ datasetVersion: '2026-10-06' });
  try {
    for (const [ip, flag] of [[IPS.vpn, 'vpn'], [IPS.tor, 'tor'], [IPS.openProxy, 'proxy'], [IPS.datacenterOnly, 'datacenter']]) {
      const r = await adapter.lookup(ip);
      assert.equal(r.flags[flag].value, true, flag);
      assert.equal(r.flags[flag].source.datasetVersion, '2026-10-06', flag);
      assert.ok(r.flags[flag].source.id.length > 0, flag);
    }
  } finally { feeds.cleanup(); }
});

// -------------------------------------------------- ipv6 and non-public coverage

test('positive: ipv6 is covered for proxy but reports coverage none for vpn, datacenter and tor', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const r = assertIpIntelligenceResult(await adapter.lookup(IPS.residentialV6));
    assert.equal(r.ipVersion, 6);
    assert.equal(r.coverage.proxy, 'full');
    for (const name of ['vpn', 'datacenter', 'tor']) {
      assert.equal(r.coverage[name], 'none', `${name} is not evaluated on ipv6`);
      assert.equal(r.flags[name].value, false);
    }
  } finally { feeds.cleanup(); }
});

test('negative: a "none" flag is never reported as clean, and the contract rejects a true one', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const r = await adapter.lookup(IPS.residentialV6);
    const stored = toStoredNetworkFlags(r);
    assert.deepEqual(stored.vpn, { value: false, coverage: 'none', source_id: null, dataset_version: null });
    const forged = structuredClone(r);
    forged.flags.vpn.value = true;
    assert.throws(() => assertIpIntelligenceResult(forged), AdapterContractError, 'true but not evaluated');
  } finally { feeds.cleanup(); }
});

test('positive: an ipv4 client on a dual-stack socket is looked up as ipv4, not pushed into the uncovered path', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const r = await adapter.lookup(IPS.mappedV4Vpn);
    assert.equal(r.ipVersion, 4);
    assert.equal(r.flags.vpn.value, true);
    assert.equal(r.coverage.vpn, 'full');
  } finally { feeds.cleanup(); }
});

test('negative: private, loopback, link-local and reserved addresses are never judged clean', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    for (const ip of [IPS.privateV4, IPS.loopbackV6, '127.0.0.1', '192.168.1.1', '172.16.5.5', '169.254.1.1', 'fe80::1', 'fc00::1', '0.0.0.0', '224.0.0.1', '100.64.1.1']) {
      const r = assertIpIntelligenceResult(await adapter.lookup(ip));
      assert.equal(r.addressKind, 'non_public', ip);
      for (const name of FLAG_NAMES) assert.equal(r.coverage[name], 'none', `${ip} ${name}`);
    }
    for (const ip of ['192.0.2.10', '198.51.100.20', '203.0.113.30', '8.8.8.8', '2001:db8::1']) {
      assert.equal(isNonPublic(parseIp(ip)), false, `${ip} is routable for this purpose`);
    }
  } finally { feeds.cleanup(); }
});

// --------------------------------------------------------------- precedence

const src = (id, ranges, extra = {}) => createRangeSource({ id, datasetVersion: 'v-test', v4: ranges, ...extra });
const cidr = (c) => { const p = parseCidrOrHost(c); return [p.from, p.to]; };

test('positive: a positive from any source raises the flag, and a negative cannot erase it', async () => {
  const a = src('feed-a', [cidr('198.51.100.0/24')]);
  const b = src('feed-b', [cidr('203.0.113.0/24')]); // does not list the address
  const adapter = new FreeIpIntelligenceAdapter({ sources: { vpn: [b, a] } }); // negative source first
  const r = assertIpIntelligenceResult(await adapter.lookup('198.51.100.9'));
  assert.equal(r.flags.vpn.value, true, 'the later positive wins over the earlier negative');
  assert.equal(r.flags.vpn.source.id, 'feed-a', 'and is the attributed source');
  assert.equal(r.coverage.vpn, 'full');
});

test('negative: one source failing is unavailable, not clean, and a positive elsewhere still counts', async () => {
  const broken = Object.freeze({ id: 'broken', datasetVersion: 'v1', confidence: 'medium', covers: () => true, contains: () => { throw new Error('boom'); } });
  const ok = src('feed-ok', [cidr('203.0.113.0/24')]);

  const only = new FreeIpIntelligenceAdapter({ sources: { vpn: [broken] } });
  const r1 = await only.lookup('198.51.100.9');
  assert.equal(r1.availability.vpn, 'unavailable');
  assert.equal(r1.coverage.vpn, 'none', 'nothing could evaluate it, so it is not clean');
  assert.equal(r1.flags.vpn.value, false);

  const mixed = new FreeIpIntelligenceAdapter({ sources: { vpn: [broken, ok] } });
  const r2 = await mixed.lookup('203.0.113.9');
  assert.equal(r2.flags.vpn.value, true, 'a positive from the working source is kept');
  assert.equal(r2.availability.vpn, 'unavailable', 'and the partial failure is still reported');
  assert.equal(r2.coverage.vpn, 'partial');
  const r3 = await mixed.lookup('192.0.2.9');
  assert.equal(r3.coverage.vpn, 'partial', 'one working source clean, one failed: partial, not full');
});

test('negative: a flag with no configured source is not evaluated', async () => {
  const adapter = new FreeIpIntelligenceAdapter({ sources: { vpn: [src('only-vpn', [cidr('198.51.100.0/24')])] } });
  const r = await adapter.lookup('192.0.2.1');
  assert.equal(r.coverage.vpn, 'full');
  for (const name of ['proxy', 'tor', 'datacenter']) assert.equal(r.coverage[name], 'none', name);
});

test('negative: a malformed ip throws before any source is called', async () => {
  let called = 0;
  const spy = Object.freeze({ id: 's', datasetVersion: 'v', confidence: 'low', covers: () => { called++; return true; }, contains: () => { called++; return false; } });
  const adapter = new FreeIpIntelligenceAdapter({ sources: { vpn: [spy] } });
  for (const bad of ['', 'nope', '1.2.3', '300.1.1.1', null, undefined, 7]) {
    await assert.rejects(() => adapter.lookup(bad), InvalidIpError);
  }
  assert.equal(called, 0);
});

test('positive: geo is optional, absent by default, and a failing geo reader does not break the lookup', async () => {
  const geoSource = { id: 'test-geo', datasetVersion: 'v1' };
  const noGeo = await new FreeIpIntelligenceAdapter({}).lookup('192.0.2.1');
  assert.deepEqual(noGeo.geo, { countryCode: null, subdivisionCode: null, coverage: 'none', source: null });
  const withGeo = await new FreeIpIntelligenceAdapter({
    geo: { ...geoSource, lookup: () => ({ countryCode: 'ZZ', subdivisionCode: null }) },
  }).lookup('192.0.2.1');
  assert.equal(withGeo.geo.coverage, 'full');
  assert.equal(withGeo.geo.countryCode, 'ZZ');
  assert.deepEqual(withGeo.geo.source, geoSource);
  const noMatch = await new FreeIpIntelligenceAdapter({
    geo: { ...geoSource, lookup: () => null },
  }).lookup('192.0.2.1');
  assert.equal(noMatch.geo.coverage, 'full', 'a source that answered with no match is still evaluated');
  assert.equal(noMatch.geo.countryCode, null, 'but has no country');
  assert.deepEqual(noMatch.geo.source, geoSource, 'and is still attributed');
  const brokenGeo = await new FreeIpIntelligenceAdapter({ geo: { lookup: () => { throw new Error('mmdb corrupt'); } } }).lookup('192.0.2.1');
  assert.equal(brokenGeo.geo.coverage, 'none');
  assert.equal(brokenGeo.geo.source, null);
  assert.ok(!('geo' in toStoredNetworkFlags(withGeo)), 'geo is not part of what network flags store');
  assert.deepEqual(Object.keys(toStoredNetworkFlags(withGeo)).sort(), ['datacenter', 'proxy', 'tor', 'vpn']);
});

test('negative: assertIpIntelligenceResult rejects a malformed or unattributed geo field', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const good = await adapter.lookup(IPS.residential);
    assert.doesNotThrow(() => assertIpIntelligenceResult(good));
    const noGeoField = structuredClone(good); delete noGeoField.geo;
    assert.throws(() => assertIpIntelligenceResult(noGeoField), AdapterContractError);
    const badCoverage = structuredClone(good); badCoverage.geo.coverage = 'partial';
    assert.throws(() => assertIpIntelligenceResult(badCoverage), AdapterContractError, 'geo coverage is full or none, never partial');
    const unattributed = structuredClone(good); unattributed.geo = { countryCode: 'ZZ', subdivisionCode: null, coverage: 'full', source: null };
    assert.throws(() => assertIpIntelligenceResult(unattributed), AdapterContractError);
    const noneWithCountry = structuredClone(good); noneWithCountry.geo = { countryCode: 'ZZ', subdivisionCode: null, coverage: 'none', source: null };
    assert.throws(() => assertIpIntelligenceResult(noneWithCountry), AdapterContractError, 'coverage none cannot carry a country');
  } finally { feeds.cleanup(); }
});

// ------------------------------------------------------------- feed loader

test('positive: fresh, intact feeds load as available sources', () => {
  const { report, feeds } = freshAdapter();
  try {
    assert.deepEqual(report.map((x) => x.status), ['ok', 'ok', 'ok', 'ok']);
    assert.deepEqual(report.map((x) => x.id), FEED_CONFIG.map((f) => f.id));
  } finally { feeds.cleanup(); }
});

test('negative: a missing manifest or a missing feed is unavailable, never clean', async () => {
  const empty = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP ?? '.'), 'signals-empty-'));
  try {
    const { sources, report } = loadFeeds({ dir: empty });
    assert.ok(report.every((x) => x.status === 'missing'));
    const adapter = new FreeIpIntelligenceAdapter({ sources });
    const r = await adapter.lookup(IPS.residential);
    for (const name of FLAG_NAMES) {
      assert.equal(r.availability[name], 'unavailable', name);
      assert.equal(r.coverage[name], 'none', `${name} is not evaluated, so not clean`);
    }
  } finally { fs.rmSync(empty, { recursive: true, force: true }); }

  const feeds = writeFeedDir({ skip: ['tor-bulk-exit:4'] });
  try {
    const { report } = loadFeeds({ dir: feeds.dir });
    assert.equal(report.find((x) => x.id === 'tor-bulk-exit').status, 'missing');
    assert.equal(report.find((x) => x.id === 'x4bnet-vpn').status, 'ok', 'the others still load');
  } finally { feeds.cleanup(); }
});

test('negative: an expected address family with no file is a missing feed, not a quiet gap', () => {
  const feeds = writeFeedDir({ skip: ['ip2proxy-lite-px2:6'] });
  try {
    const { report } = loadFeeds({ dir: feeds.dir });
    assert.equal(report.find((x) => x.id === 'ip2proxy-lite-px2').status, 'missing');
  } finally { feeds.cleanup(); }
});

test('negative: stale, future-dated, tampered and truncated feeds are rejected', () => {
  const now = new Date('2026-10-06T12:00:00Z');
  const status = (opts) => {
    const feeds = writeFeedDir(opts);
    try { return { feeds, report: loadFeeds({ dir: feeds.dir, now }).report }; }
    finally { feeds.cleanup(); }
  };
  assert.equal(status({ retrievedAt: '2026-10-06T06:00:00Z' }).report.every((x) => x.status === 'ok'), true);
  const torStale = status({ retrievedAt: '2026-10-01T00:00:00Z' }).report;
  assert.equal(torStale.find((x) => x.id === 'tor-bulk-exit').status, 'stale', 'tor list limit is 48 hours');
  assert.equal(torStale.find((x) => x.id === 'x4bnet-vpn').status, 'ok', 'x4bnet limit is 14 days');
  assert.equal(status({ retrievedAt: '2026-12-01T00:00:00Z' }).report.every((x) => x.status === 'corrupt'), true, 'future dated');
  assert.equal(status({ retrievedAt: 'not-a-date' }).report.every((x) => x.status === 'corrupt'), true);

  const tampered = writeFeedDir({ retrievedAt: now.toISOString() });
  try {
    fs.appendFileSync(tampered.file('x4bnet-vpn-ipv4.txt'), '192.0.2.0/24\n');
    assert.equal(loadFeeds({ dir: tampered.dir, now }).report.find((x) => x.id === 'x4bnet-vpn').status, 'corrupt', 'hash mismatch');
  } finally { tampered.cleanup(); }

  const truncated = writeFeedDir({ retrievedAt: now.toISOString() });
  try {
    fs.writeFileSync(truncated.file('x4bnet-datacenter-ipv4.txt'), '198.51.100.0/25\n');
    const m = JSON.parse(fs.readFileSync(truncated.file(MANIFEST_NAME), 'utf8'));
    fs.writeFileSync(truncated.file(MANIFEST_NAME), JSON.stringify(buildManifest(m.feeds.map(({ bytes, sha256, ...rest }) => rest), truncated.dir)));
    assert.equal(loadFeeds({ dir: truncated.dir, now }).report.find((x) => x.id === 'x4bnet-datacenter').status, 'too_small', 'a truncated download is caught');
  } finally { truncated.cleanup(); }
});

test('negative: a feed that is mostly garbage is corrupt, and a manifest path cannot escape the directory', () => {
  const now = new Date('2026-10-06T12:00:00Z');
  const garbage = writeFeedDir({ retrievedAt: now.toISOString() });
  try {
    fs.writeFileSync(garbage.file('tor-bulk-exit-ipv4.txt'), Array.from({ length: 1500 }, (_, i) => (i % 2 ? 'not an ip' : '103.0.0.1')).join('\n'));
    const m = JSON.parse(fs.readFileSync(garbage.file(MANIFEST_NAME), 'utf8'));
    fs.writeFileSync(garbage.file(MANIFEST_NAME), JSON.stringify(buildManifest(m.feeds.map(({ bytes, sha256, ...rest }) => rest), garbage.dir)));
    assert.equal(loadFeeds({ dir: garbage.dir, now }).report.find((x) => x.id === 'tor-bulk-exit').status, 'corrupt');
  } finally { garbage.cleanup(); }

  const escape = writeFeedDir({ retrievedAt: now.toISOString() });
  try {
    const m = JSON.parse(fs.readFileSync(escape.file(MANIFEST_NAME), 'utf8'));
    m.feeds[0].file = '../../etc/passwd';
    fs.writeFileSync(escape.file(MANIFEST_NAME), JSON.stringify(m));
    assert.notEqual(loadFeeds({ dir: escape.dir, now }).report.find((x) => x.id === m.feeds[0].id).status, 'ok');
  } finally { escape.cleanup(); }
});

// ----------------------------------------------------------------- contract

test('negative: the result contract rejects an unattributed or malformed result', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const good = await adapter.lookup(IPS.residential);
    assert.doesNotThrow(() => assertIpIntelligenceResult(good));

    const noSource = structuredClone(good); noSource.flags.tor.source = null;
    assert.throws(() => assertIpIntelligenceResult(noSource), /without source attribution/);
    const noVersion = structuredClone(good); noVersion.flags.vpn.source.datasetVersion = '';
    assert.throws(() => assertIpIntelligenceResult(noVersion), AdapterContractError);
    const badCoverage = structuredClone(good); badCoverage.coverage.proxy = 'mostly';
    assert.throws(() => assertIpIntelligenceResult(badCoverage), AdapterContractError);
    const missingFlag = structuredClone(good); delete missingFlag.flags.datacenter;
    assert.throws(() => assertIpIntelligenceResult(missingFlag), AdapterContractError);
    const badIpVersion = structuredClone(good); badIpVersion.ipVersion = 5;
    assert.throws(() => assertIpIntelligenceResult(badIpVersion), AdapterContractError);
    for (const junk of [null, undefined, 'x', 7, []]) assert.throws(() => assertIpIntelligenceResult(junk), AdapterContractError);
  } finally { feeds.cleanup(); }
});

test('positive: stored flags satisfy the database constraint shape', async () => {
  const { adapter, feeds } = freshAdapter();
  try {
    const stored = toStoredNetworkFlags(await adapter.lookup(IPS.vpn));
    assert.deepEqual(Object.keys(stored.vpn).sort(), ['coverage', 'dataset_version', 'source_id', 'value']);
    assert.equal(stored.vpn.source_id, 'x4bnet-vpn');
    assert.ok(!JSON.stringify(stored).includes(IPS.vpn), 'the address itself is not in the stored flags');
  } finally { feeds.cleanup(); }
});

test('positive: production-sized lists parse and look up quickly, and lookups stay correct', () => {
  // generated, not real data: 60k disjoint /24 blocks, larger than the real datacenter list.
  const lines = Array.from({ length: 60000 }, (_, i) => `${1 + (i >> 16)}.${(i >> 8) & 255}.${i & 255}.0/24`);
  const started = Date.now();
  const parsed = parseIpList(lines.join('\n'));
  const source = createRangeSource({ id: 'scale', datasetVersion: 'v', v4: parsed.v4 });
  const built = Date.now() - started;
  assert.equal(parsed.entries, 60000);
  assert.equal(parsed.invalidLines, 0);
  assert.ok(built < 3000, `parse and build took ${built}ms`);

  const t2 = Date.now();
  let hits = 0;
  for (let i = 0; i < 20000; i++) {
    const n = i * 3; // every third block, so hits and misses both occur
    const inList = n < 60000;
    const ip = parseIp(`${1 + (n >> 16)}.${(n >> 8) & 255}.${n & 255}.77`);
    const got = source.contains(ip);
    assert.equal(got, inList, `block ${n}`);
    if (got) hits++;
  }
  assert.ok(Date.now() - t2 < 2000, 'twenty thousand lookups are fast');
  assert.equal(hits, 20000);
  assert.equal(source.contains(parseIp('250.1.1.1')), false, 'an address beyond every block misses');
});

test('negative: no provider database, api key or network code is reachable from the adapter modules', () => {
  for (const file of ['ip-intelligence.mjs', 'feeds.mjs']) {
    const source = fs.readFileSync(path.join(here, '..', file), 'utf8');
    for (const api of ['fetch(', 'http.request', 'https.request', 'XMLHttpRequest', 'WebSocket', 'child_process', 'net.connect', 'dns.']) {
      assert.ok(!source.includes(api), `${file} must not use ${api}`);
    }
  }
  assert.ok(FEED_TEXT.vpn.length > 0);
});
