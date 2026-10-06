// batch 1 tests: source ledger validation and provider-data / secret hygiene.
// run with: node --test platform/signals/test/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  validateSignalSources,
  readLedger,
  REQUIRED_TOPICS,
} from '../../../scripts/validate-signal-sources.mjs';
import { scanTree, scanRepo } from '../../../scripts/check-signals-hygiene.mjs';

const goodEntry = (overrides = {}) => ({
  source_id: 'src-9001',
  url: 'https://example.com/terms',
  accessed_at: '2026-10-06',
  topics: ['ip_intelligence', 'geo'],
  license: 'example license',
  attribution_required: true,
  update_terms: 'monthly',
  boundary: 'supports: country lookups. does not support: vpn claims.',
  ...overrides,
});

/** a ledger that covers every required topic, used as a valid baseline. */
const coveringLedger = () => [
  goodEntry({ source_id: 'src-9001', topics: ['device_signals'] }),
  goodEntry({ source_id: 'src-9002', topics: ['ip_intelligence', 'geo'] }),
  goodEntry({ source_id: 'src-9003', topics: ['ip_intelligence', 'proxy'] }),
  goodEntry({ source_id: 'src-9004', topics: ['ip_intelligence', 'vpn'] }),
  goodEntry({ source_id: 'src-9005', topics: ['ip_intelligence', 'tor'] }),
];

test('positive: the committed ledger has complete signals entries', () => {
  const records = readLedger();
  assert.deepEqual(validateSignalSources(records), []);
  const signals = records.filter((r) => r.topics?.includes('ip_intelligence') || r.topics?.includes('device_signals'));
  assert.equal(signals.length, 6, 'thumbmarkjs, geolite2, ip2proxy lite, x4bnet, tor list, maxmind reader');
});

test('positive: every required topic is covered by the committed ledger', () => {
  const covered = new Set(readLedger().flatMap((r) => r.topics ?? []));
  for (const topic of REQUIRED_TOPICS) assert.ok(covered.has(topic), `topic ${topic} covered`);
});

test('positive: a synthetic covering ledger validates', () => {
  assert.deepEqual(validateSignalSources(coveringLedger()), []);
});

test('negative: an entry without a license is rejected', () => {
  const ledger = coveringLedger();
  delete ledger[1].license;
  const failures = validateSignalSources(ledger);
  assert.ok(failures.some((f) => f.includes('src-9002') && f.includes('missing license')), failures.join('\n'));
});

test('negative: an entry without a boundary is rejected', () => {
  const ledger = coveringLedger();
  delete ledger[2].boundary;
  const failures = validateSignalSources(ledger);
  assert.ok(failures.some((f) => f.includes('src-9003') && f.includes('missing boundary')));
});

test('negative: a boundary that never says what the source does not support is rejected', () => {
  const ledger = coveringLedger();
  ledger[3].boundary = 'supports: vpn lists, and everything else too.';
  const failures = validateSignalSources(ledger);
  assert.ok(failures.some((f) => f.includes('src-9004') && f.includes('does not support')));
});

test('negative: a non-boolean attribution flag, a non-https url and a bad date are rejected', () => {
  const ledger = coveringLedger();
  ledger[0].attribution_required = 'yes';
  ledger[1].url = 'http://example.com';
  ledger[4].accessed_at = 'yesterday';
  const failures = validateSignalSources(ledger).join('\n');
  assert.match(failures, /src-9001: attribution_required must be a boolean/);
  assert.match(failures, /src-9002: url must be https/);
  assert.match(failures, /src-9005: accessed_at must be yyyy-mm-dd/);
});

test('negative: a ledger missing a required topic is rejected', () => {
  const ledger = coveringLedger().filter((r) => !r.topics.includes('tor'));
  const failures = validateSignalSources(ledger);
  assert.ok(failures.some((f) => f.includes('topic "tor"')));
});

test('negative: duplicate source ids are rejected', () => {
  const ledger = coveringLedger();
  ledger[1].source_id = ledger[0].source_id;
  assert.ok(validateSignalSources(ledger).some((f) => f.includes('duplicate source_id')));
});

test('positive: the repository has no provider database files and no secret-shaped values', () => {
  const { providerFiles, secrets } = scanRepo();
  assert.deepEqual(providerFiles, []);
  assert.deepEqual(secrets, []);
});

test('negative: hygiene scan flags provider database files and secret-shaped values', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-hygiene-'));
  try {
    // built at runtime so this test file never contains a secret-shaped literal.
    const fakeToken = 'github' + '_pat_' + 'A1b2C3d4E5'.repeat(4);
    const fakeKey = 'fc' + '-' + '0123456789abcdef'.repeat(2);
    fs.writeFileSync(path.join(dir, 'GeoLite2-City.mmdb'), 'not a real database');
    fs.writeFileSync(path.join(dir, 'IP2PROXY-LITE-PX2.BIN'), 'not a real database');
    fs.writeFileSync(path.join(dir, 'notes.md'), `token: ${fakeToken}\n`);
    fs.writeFileSync(path.join(dir, 'fixture.json'), JSON.stringify({ key: fakeKey }));

    const { providerFiles, secrets } = scanTree(dir);
    assert.deepEqual(providerFiles.sort(), ['GeoLite2-City.mmdb', 'IP2PROXY-LITE-PX2.BIN']);
    const kinds = secrets.map((s) => s.kind).sort();
    assert.deepEqual(kinds, ['firecrawl key', 'github token']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('positive: hygiene scan leaves ordinary fixtures alone', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-hygiene-ok-'));
  try {
    fs.writeFileSync(path.join(dir, 'ranges.txt'), '203.0.113.0/24\n198.51.100.0/24\n');
    fs.writeFileSync(path.join(dir, 'notes.md'), 'the key id is k-2026-q4, the key itself is never committed.\n');
    const { providerFiles, secrets } = scanTree(dir);
    assert.deepEqual(providerFiles, []);
    assert.deepEqual(secrets, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
