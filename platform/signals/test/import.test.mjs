// batch 4 tests: the feed importer, its cli, and swapping in a different adapter.
// the only network use is a loopback http server on 127.0.0.1 inside the test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importFeeds, FeedImportError, FEED_FILES } from '../import-feeds.mjs';
import { loadFeeds, MANIFEST_NAME } from '../feeds.mjs';
import {
  FreeIpIntelligenceAdapter, assertIpIntelligenceResult, toStoredNetworkFlags, FLAG_NAMES,
} from '../ip-intelligence.mjs';
import { buildInputs, parseArgs, fetchText, PUBLIC_FEED_URLS } from '../../../scripts/import-ip-feeds.mjs';
import { IPS, FEED_TEXT, PROXY_CSV, writeFeedDir } from './ip-fixtures.mjs';
import { StubCommercialAdapter, VENDOR_FIELD_NAMES } from './stub-commercial-adapter.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'signals-import-'));
const textOf = {
  'x4bnet-vpn:4': FEED_TEXT.vpn,
  'x4bnet-datacenter:4': FEED_TEXT.datacenter,
  'tor-bulk-exit:4': FEED_TEXT.tor,
  'ip2proxy-lite-px2:4': PROXY_CSV.v4(),
  'ip2proxy-lite-px2:6': PROXY_CSV.v6(),
};
const inputFor = (id, family, text = textOf[`${id}:${family}`]) => ({ id, family, read: () => text });
const allInputs = () => FEED_FILES.map((f) => inputFor(f.id, f.family));

// ------------------------------------------------------------------ importer

test('positive: a full import writes every file and a manifest that loads clean', async () => {
  const base = tmp();
  try {
    const out = path.join(base, 'data');
    const { report, written, carriedOver } = await importFeeds({ outDir: out, inputs: allInputs() });
    assert.equal(written.length, 5);
    assert.deepEqual(carriedOver, []);
    assert.ok(report.every((r) => r.status === 'ok'));
    assert.deepEqual(loadFeeds({ dir: out }).report.map((r) => r.status), ['ok', 'ok', 'ok', 'ok']);
    assert.deepEqual(fs.readdirSync(base), ['data'], 'no staging directory is left behind');
    assert.ok(fs.existsSync(path.join(out, MANIFEST_NAME)));
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('positive: a partial refresh carries the other feeds over with their original dates', async () => {
  const base = tmp();
  try {
    const out = path.join(base, 'data');
    const first = new Date('2026-10-01T00:00:00Z');
    await importFeeds({ outDir: out, inputs: allInputs(), now: first, datasetVersion: '2026-10-01' });

    const second = new Date('2026-10-03T00:00:00Z');
    const r = await importFeeds({ outDir: out, inputs: [inputFor('tor-bulk-exit', 4)], now: second, datasetVersion: '2026-10-03' });
    assert.deepEqual(r.written, ['tor-bulk-exit-ipv4.txt']);
    assert.equal(r.carriedOver.length, 4);

    const m = JSON.parse(fs.readFileSync(path.join(out, MANIFEST_NAME), 'utf8'));
    const by = (id) => m.feeds.find((f) => f.id === id);
    assert.equal(by('tor-bulk-exit').retrievedAt, second.toISOString());
    assert.equal(by('tor-bulk-exit').datasetVersion, '2026-10-03');
    assert.equal(by('x4bnet-vpn').retrievedAt, first.toISOString(), 'a carried-over feed keeps its real age');
    assert.equal(by('x4bnet-vpn').datasetVersion, '2026-10-01');
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('negative: a bad download never replaces a working feed set', async () => {
  const base = tmp();
  try {
    const out = path.join(base, 'data');
    await importFeeds({ outDir: out, inputs: allInputs() });
    const before = fs.readFileSync(path.join(out, MANIFEST_NAME), 'utf8');
    const beforeFile = fs.readFileSync(path.join(out, 'tor-bulk-exit-ipv4.txt'), 'utf8');

    for (const [why, text] of [['truncated', '203.0.113.30\n'], ['garbage', 'not an ip\n'.repeat(2000)], ['html error page', '<html>503</html>']]) {
      await assert.rejects(() => importFeeds({ outDir: out, inputs: [inputFor('tor-bulk-exit', 4, text)] }), FeedImportError, why);
    }
    await assert.rejects(() => importFeeds({ outDir: out, inputs: [inputFor('tor-bulk-exit', 4, '')] }), FeedImportError, 'empty');
    await assert.rejects(() => importFeeds({ outDir: out, inputs: [{ id: 'tor-bulk-exit', family: 4, read: () => { throw new Error('network down'); } }] }), /network down/);

    assert.equal(fs.readFileSync(path.join(out, MANIFEST_NAME), 'utf8'), before, 'manifest untouched');
    assert.equal(fs.readFileSync(path.join(out, 'tor-bulk-exit-ipv4.txt'), 'utf8'), beforeFile, 'feed untouched');
    assert.deepEqual(fs.readdirSync(base), ['data'], 'no staging or backup directory left behind');
    assert.ok(loadFeeds({ dir: out }).report.every((r) => r.status === 'ok'), 'the old set still serves');
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('negative: an unknown feed id or address family is refused before anything is written', async () => {
  const base = tmp();
  try {
    const out = path.join(base, 'data');
    await assert.rejects(() => importFeeds({ outDir: out, inputs: [inputFor('mystery-feed', 4, 'x')] }), /unknown feed/);
    await assert.rejects(() => importFeeds({ outDir: out, inputs: [inputFor('tor-bulk-exit', 6, 'x')] }), /unknown feed/);
    assert.equal(fs.existsSync(out), false);
    assert.deepEqual(fs.readdirSync(base), []);
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

test('negative: a first partial import is refused because the feed set would be incomplete', async () => {
  const base = tmp();
  try {
    const out = path.join(base, 'data');
    await assert.rejects(() => importFeeds({ outDir: out, inputs: [inputFor('tor-bulk-exit', 4)] }), /x4bnet-vpn is missing/);
    assert.equal(fs.existsSync(out), false, 'nothing half-built is left in place');
  } finally { fs.rmSync(base, { recursive: true, force: true }); }
});

// ----------------------------------------------------------------------- cli

test('positive: cli arguments require exactly one source and reject anything unknown', () => {
  assert.equal(parseArgs(['--fetch']).fetch, true);
  assert.ok(parseArgs(['--from-dir', 'x']).fromDir.endsWith('x'));
  assert.deepEqual(parseArgs(['--fetch', '--only', 'tor-bulk-exit']).only, ['tor-bulk-exit']);
  assert.throws(() => parseArgs([]), /exactly one/);
  assert.throws(() => parseArgs(['--fetch', '--from-dir', 'x']), /exactly one/);
  assert.throws(() => parseArgs(['--fetch', '--apikey', 'x']), /unknown argument/);
});

test('positive: --from-dir reads local files, and --fetch only ever targets the three public lists', () => {
  const dir = tmp();
  try {
    for (const f of FEED_FILES) fs.writeFileSync(path.join(dir, f.file), textOf[`${f.id}:${f.family}`]);
    assert.equal(buildInputs({ fetch: false, fromDir: dir, only: [] }).length, 5);
    assert.equal(buildInputs({ fetch: false, fromDir: dir, only: ['tor-bulk-exit'] }).length, 1);
    const live = buildInputs({ fetch: true, fromDir: null, only: [] });
    assert.deepEqual(live.map((i) => i.id).sort(), ['tor-bulk-exit', 'x4bnet-datacenter', 'x4bnet-vpn']);
    assert.ok(!live.some((i) => i.id === 'ip2proxy-lite-px2'), 'ip2proxy needs an account, so it is never fetched');
    for (const url of Object.values(PUBLIC_FEED_URLS)) assert.match(url, /^https:\/\//);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('negative: fetchText refuses an error status and an oversized body (loopback server only)', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/ok') { res.writeHead(200); res.end('203.0.113.30\n'); }
    else if (req.url === '/big') { res.writeHead(200, { 'content-length': String(9 * 1024 * 1024) }); res.end('x'); }
    else { res.writeHead(503); res.end('busy'); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal(await fetchText(`${base}/ok`), '203.0.113.30\n');
    await assert.rejects(() => fetchText(`${base}/down`), /503/);
    await assert.rejects(() => fetchText(`${base}/big`), /larger than/);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

// ------------------------------------------------------------- adapter swap

/** stands in for any caller: it depends on the port result and nothing else. */
async function networkEvidenceFor(adapter, ip) {
  const result = assertIpIntelligenceResult(await adapter.lookup(ip, { moment: 'payout_request' }));
  return { stored: toStoredNetworkFlags(result), ipVersion: result.ipVersion, adapterVersion: result.adapterVersion };
}

test('positive: the same caller code runs unchanged against the free adapter and a commercial stub', async () => {
  const feeds = writeFeedDir();
  try {
    const { sources } = loadFeeds({ dir: feeds.dir });
    const free = new FreeIpIntelligenceAdapter({ sources });
    const commercial = new StubCommercialAdapter();

    for (const adapter of [free, commercial]) {
      const vpn = await networkEvidenceFor(adapter, IPS.vpn);
      assert.equal(vpn.stored.vpn.value, true, adapter.constructor.name);
      assert.ok(vpn.stored.vpn.source_id, 'attributed');
      assert.deepEqual(Object.keys(vpn.stored).sort(), [...FLAG_NAMES].sort());
      const tor = await networkEvidenceFor(adapter, IPS.tor);
      assert.equal(tor.stored.tor.value, true);
      const clean = await networkEvidenceFor(adapter, IPS.residential);
      assert.ok(FLAG_NAMES.every((n) => clean.stored[n].value === false));
    }
    assert.notEqual((await networkEvidenceFor(free, IPS.vpn)).adapterVersion, (await networkEvidenceFor(commercial, IPS.vpn)).adapterVersion);
  } finally { feeds.cleanup(); }
});

test('positive: the commercial stub closes the ipv6 gap, and the caller sees it only through coverage', async () => {
  const feeds = writeFeedDir();
  try {
    const { sources } = loadFeeds({ dir: feeds.dir });
    const free = await networkEvidenceFor(new FreeIpIntelligenceAdapter({ sources }), '2001:db8::77');
    const commercial = await networkEvidenceFor(new StubCommercialAdapter(), '2001:db8::77');
    assert.equal(free.stored.vpn.coverage, 'none', 'the free feeds cannot see ipv6 vpn');
    assert.equal(free.stored.vpn.value, false);
    assert.equal(commercial.stored.vpn.coverage, 'full');
    assert.equal(commercial.stored.vpn.value, true, 'the commercial feed can');
  } finally { feeds.cleanup(); }
});

test('negative: vendor field names never reach the stored result or a caller-facing module', async () => {
  const commercial = await networkEvidenceFor(new StubCommercialAdapter(), IPS.vpn);
  const serialized = JSON.stringify(commercial);
  for (const field of VENDOR_FIELD_NAMES) assert.ok(!serialized.includes(field), `${field} is a vendor name`);

  for (const file of ['ip-intelligence.mjs', 'feeds.mjs', 'import-feeds.mjs']) {
    const source = fs.readFileSync(path.join(here, '..', file), 'utf8');
    for (const field of VENDOR_FIELD_NAMES) assert.ok(!source.includes(field), `${file} must not name ${field}`);
    assert.ok(!source.includes('stub-commercial-adapter'), `${file} must not import the stub`);
  }
});

test('negative: a failing or contract-breaking adapter is rejected by the caller check', async () => {
  await assert.rejects(() => networkEvidenceFor(new StubCommercialAdapter({ failing: true }), IPS.vpn), /unreachable/);
  const broken = { lookup: async () => ({ adapterVersion: 'x', ipVersion: 4, coverage: {}, availability: {}, flags: {}, sources: [] }) };
  await assert.rejects(() => networkEvidenceFor(broken, IPS.vpn), /broke the contract/);
  const liar = { lookup: async () => {
    const r = await new StubCommercialAdapter().lookup(IPS.residential);
    r.flags.tor = { value: true, source: null, confidence: 'high' }; // a positive with no attribution
    return r;
  } };
  await assert.rejects(() => networkEvidenceFor(liar, IPS.residential), /without source attribution/);
});
