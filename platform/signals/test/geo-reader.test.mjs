// batch 8 tests: the geolite2 country reader. a fake mmdb reader stands in for
// the real `maxmind` library, injected through `open`, so no real database file
// is needed and no test loads a provider database.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadGeoDatabase, buildGeoManifest, GEO_DB_ID, MANIFEST_NAME, MAX_AGE_HOURS } from '../geo-reader.mjs';
import { parseIp } from '../ip-intelligence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const withText = (ipText) => ({ ...parseIp(ipText), text: ipText });

/** records produced by a stand-in geolite2-country database. */
const RECORDS = {
  '203.0.113.5': { country: { iso_code: 'CU' } },
  '198.51.100.9': { country: { iso_code: 'US' } },
  '192.0.2.77': { registered_country: { iso_code: 'CU' }, represented_country: { iso_code: 'CU' } }, // network registered elsewhere, no located country
  '2001:db8::1': { subdivisions: [{ iso_code: 'ZZ-A' }], country: { iso_code: 'ZZ' } },
};
/** addresses the stand-in reader has no record for: anonymous networks, satellite ranges. */
const NO_MATCH = new Set(['203.0.113.200', '198.51.100.200']);

function fakeOpen(shouldThrow = false) {
  return async (filepath) => {
    if (shouldThrow) throw new Error('corrupt mmdb');
    return {
      get: (ipText) => {
        if (NO_MATCH.has(ipText)) return null;
        return RECORDS[ipText] ?? null;
      },
      _filepath: filepath,
    };
  };
}

/** writes a usable geo database directory: a placeholder file big enough to
 *  pass the size floor, plus a manifest describing it. */
function writeGeoDir({ retrievedAt = new Date().toISOString(), bytes = 150_000, fileName = 'GeoLite2-Country.mmdb' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-geo-'));
  fs.writeFileSync(path.join(dir, fileName), Buffer.alloc(bytes, 1));
  const manifest = buildGeoManifest({ file: fileName, retrievedAt }, dir);
  fs.writeFileSync(path.join(dir, MANIFEST_NAME), JSON.stringify(manifest, null, 2));
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }), file: (name) => path.join(dir, name) };
}

// ------------------------------------------------------------------ loading

test('positive: a fresh, intact database loads ok and resolves known addresses', async () => {
  const geo = writeGeoDir();
  try {
    const { source, status } = await loadGeoDatabase({ dir: geo.dir, open: fakeOpen() });
    assert.equal(status, 'ok');
    assert.equal(source.id, GEO_DB_ID);
    assert.ok(source.datasetVersion.length > 0);
    assert.deepEqual(source.lookup(withText('203.0.113.5')), { countryCode: 'CU', subdivisionCode: null });
    assert.deepEqual(source.lookup(withText('198.51.100.9')), { countryCode: 'US', subdivisionCode: null });
  } finally { geo.cleanup(); }
});

test('positive: a located country and a subdivision are read; a registered or represented country alone is not a location', async () => {
  const geo = writeGeoDir();
  try {
    const { source } = await loadGeoDatabase({ dir: geo.dir, open: fakeOpen() });
    assert.equal(source.lookup(withText('192.0.2.77')), null, 'registered_country only means no located country, so no geo');
    assert.deepEqual(source.lookup(withText('2001:db8::1')), { countryCode: 'ZZ', subdivisionCode: 'ZZ-A' });
  } finally { geo.cleanup(); }
});

test('positive: no result (anonymous network, satellite range) is a normal miss, not an error', async () => {
  const geo = writeGeoDir();
  try {
    const { source, status } = await loadGeoDatabase({ dir: geo.dir, open: fakeOpen() });
    assert.equal(status, 'ok');
    assert.equal(source.lookup(withText('203.0.113.200')), null);
    assert.equal(source.lookup(withText('198.51.100.200')), null);
    assert.doesNotThrow(() => source.lookup(withText('203.0.113.200')));
  } finally { geo.cleanup(); }
});

// ------------------------------------------------------------- unavailable

test('negative: a missing manifest or missing file is unavailable, never a silent miss', async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-geo-empty-'));
  try {
    const { source, status } = await loadGeoDatabase({ dir: empty, open: fakeOpen() });
    assert.equal(status, 'missing');
    assert.throws(() => source.lookup(withText('203.0.113.5')));
  } finally { fs.rmSync(empty, { recursive: true, force: true }); }

  const geo = writeGeoDir();
  try {
    fs.rmSync(geo.file('GeoLite2-Country.mmdb'));
    const { status } = await loadGeoDatabase({ dir: geo.dir, open: fakeOpen() });
    assert.equal(status, 'missing');
  } finally { geo.cleanup(); }
});

test('negative: a tampered or truncated database is unavailable, never trusted', async () => {
  const tampered = writeGeoDir();
  try {
    fs.appendFileSync(tampered.file('GeoLite2-Country.mmdb'), 'extra bytes');
    const { status } = await loadGeoDatabase({ dir: tampered.dir, open: fakeOpen() });
    assert.equal(status, 'corrupt', 'hash mismatch');
  } finally { tampered.cleanup(); }

  const truncated = writeGeoDir({ bytes: 500 });
  try {
    const { status } = await loadGeoDatabase({ dir: truncated.dir, open: fakeOpen() });
    assert.equal(status, 'too_small');
  } finally { truncated.cleanup(); }

  const escape = writeGeoDir();
  try {
    const m = JSON.parse(fs.readFileSync(escape.file(MANIFEST_NAME), 'utf8'));
    m.file = '../../etc/passwd';
    fs.writeFileSync(escape.file(MANIFEST_NAME), JSON.stringify(m));
    const { status } = await loadGeoDatabase({ dir: escape.dir, open: fakeOpen() });
    assert.notEqual(status, 'ok');
  } finally { escape.cleanup(); }
});

test('negative: a stale database past the eula update window is unavailable', async () => {
  const now = new Date('2026-10-06T12:00:00Z');
  const fresh = writeGeoDir({ retrievedAt: new Date(now.getTime() - 5 * 24 * 3_600_000).toISOString() });
  try {
    assert.equal((await loadGeoDatabase({ dir: fresh.dir, now, open: fakeOpen() })).status, 'ok');
  } finally { fresh.cleanup(); }

  const stale = writeGeoDir({ retrievedAt: new Date(now.getTime() - (MAX_AGE_HOURS + 1) * 3_600_000).toISOString() });
  try {
    assert.equal((await loadGeoDatabase({ dir: stale.dir, now, open: fakeOpen() })).status, 'stale');
  } finally { stale.cleanup(); }

  const futureDated = writeGeoDir({ retrievedAt: new Date(now.getTime() + 10 * 24 * 3_600_000).toISOString() });
  try {
    assert.equal((await loadGeoDatabase({ dir: futureDated.dir, now, open: fakeOpen() })).status, 'corrupt');
  } finally { futureDated.cleanup(); }

  const badDate = writeGeoDir({ retrievedAt: 'not-a-date' });
  try {
    assert.equal((await loadGeoDatabase({ dir: badDate.dir, now, open: fakeOpen() })).status, 'corrupt');
  } finally { badDate.cleanup(); }
});

test('negative: a reader that fails to open is unavailable', async () => {
  const geo = writeGeoDir();
  try {
    const { status, source } = await loadGeoDatabase({ dir: geo.dir, open: fakeOpen(true) });
    assert.equal(status, 'corrupt');
    assert.throws(() => source.lookup(withText('203.0.113.5')));
  } finally { geo.cleanup(); }
});

test('negative: a wrong-schema or wrong-id manifest is treated as missing', async () => {
  const geo = writeGeoDir();
  try {
    const m = JSON.parse(fs.readFileSync(geo.file(MANIFEST_NAME), 'utf8'));
    fs.writeFileSync(geo.file(MANIFEST_NAME), JSON.stringify({ ...m, id: 'something-else' }));
    assert.equal((await loadGeoDatabase({ dir: geo.dir, open: fakeOpen() })).status, 'missing');
  } finally { geo.cleanup(); }
});

// -------------------------------------------------------------------- hygiene

test('negative: no provider database file or network code is reachable from the reader module', () => {
  const source = fs.readFileSync(path.join(here, '..', 'geo-reader.mjs'), 'utf8');
  for (const api of ['fetch(', 'http.request', 'https.request', 'child_process']) {
    assert.ok(!source.includes(api), `geo-reader.mjs must not use ${api}`);
  }
  assert.ok(!/\.mmdb['"`]/.test(source.replace(/\/\/.*$/gm, '')), 'no mmdb filename is hardcoded');
});
