// tests for scripts/fetch-provider-feeds.mjs: the zip reader, the url
// builders, argument parsing, and the geo database
// staging and swap. no network use and no real provider database: the mmdb
// reader is injected, and the "database" is a generated file of sufficient
// size. the only subprocess is tar, which the script itself requires.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

import {
  ProviderFetchError,
  PROVIDER_FEED_URLS,
  MAX_DOWNLOAD_BYTES,
  PX2_CSV_NAMES,
  GEO_DB_FILE,
  unzipEntry,
  refreshGeoDatabase,
  parseArgs,
} from '../../../scripts/fetch-provider-feeds.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'signals-fetch-'));

// ------------------------------------------------------------------ zip

/** writes a minimal but structurally valid zip in memory. */
function makeZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const data = zlib.deflateRawSync(Buffer.from(content, 'utf8'));

    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0);
    head.writeUInt16LE(20, 4); // version
    head.writeUInt16LE(0, 6); // flags
    head.writeUInt16LE(8, 8); // method: deflate
    head.writeUInt32LE(0, 14); // crc32, unused by the reader
    head.writeUInt32LE(data.length, 18); // compressed size
    head.writeUInt32LE(Buffer.byteLength(content), 22); // uncompressed size
    head.writeUInt16LE(nameBuf.length, 26);
    head.writeUInt16LE(0, 28);
    const local = Buffer.concat([head, nameBuf, data]);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 16); // crc32
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(Buffer.byteLength(content), 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centrals.push(Buffer.concat([central, nameBuf]));
    offset += local.length;
    locals.push(local);
  }
  const localBuf = Buffer.concat(locals);
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8); // entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(localBuf.length, 16);
  return Buffer.concat([localBuf, centralBuf, eocd]);
}

test('positive: unzipEntry inflates the wanted deflated entry', () => {
  const zip = makeZip([['README_LITE.TXT', 'lite terms'], [PX2_CSV_NAMES[4], '"1","2","PUB","US","usa"']]);
  assert.equal(unzipEntry(zip, PX2_CSV_NAMES[4]).toString('utf8'), '"1","2","PUB","US","usa"');
  assert.equal(unzipEntry(zip, 'README_LITE.TXT').toString('utf8'), 'lite terms');
});

test('negative: unzipEntry refuses a missing entry and a non-zip buffer', () => {
  const zip = makeZip([[PX2_CSV_NAMES[4], 'x']]);
  assert.throws(() => unzipEntry(zip, 'NOT_THERE.CSV'), ProviderFetchError);
  assert.throws(() => unzipEntry(Buffer.from('not a zip at all, really'), PX2_CSV_NAMES[4]), ProviderFetchError);
  assert.throws(() => unzipEntry(Buffer.alloc(4), PX2_CSV_NAMES[4]), ProviderFetchError);
});

test('negative: a corrupt central directory offset is refused', () => {
  const zip = makeZip([[PX2_CSV_NAMES[4], 'x']]);
  // patch the central-directory offset inside the end-of-central-directory
  // record, which sits at the end of the buffer, not at offset 16 of it.
  let eocd = -1;
  for (let i = zip.length - 22; i >= 0; i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  assert.ok(eocd >= 0);
  zip.writeUInt32LE(999999, eocd + 16);
  assert.throws(() => unzipEntry(zip, PX2_CSV_NAMES[4]), ProviderFetchError);
});

// ------------------------------------------------------------------ urls and args

test('positive: the provider urls embed the credential through encodeURIComponent', () => {
  const v4 = PROVIDER_FEED_URLS['ip2proxy-lite-px2:4']('abc 123/xyz');
  assert.ok(v4.includes('token=abc%20123%2Fxyz'));
  assert.ok(v4.includes('file=PX2LITE'));
  const v6 = PROVIDER_FEED_URLS['ip2proxy-lite-px2:6']('abc 123/xyz');
  assert.ok(v6.includes('token=abc%20123%2Fxyz'));
  assert.ok(v6.includes('file=PX2LITE.IPV6'));
  // one csv entry per family zip
  assert.equal(PX2_CSV_NAMES[4], 'IP2PROXY-LITE-PX2.CSV');
  assert.equal(PX2_CSV_NAMES[6], 'IP2PROXY-LITE-PX2.IPV6.CSV');
  const geo = PROVIDER_FEED_URLS['geolite2-country']('k_ey');
  assert.ok(geo.includes('license_key=k_ey'));
  assert.ok(geo.includes('edition_id=GeoLite2-Country'));
  assert.ok(geo.includes('suffix=tar.gz'));
});

test('positive: parseArgs defaults and the only filter', () => {
  const opts = parseArgs([]);
  assert.equal(opts.only.length, 0);
  assert.ok(opts.out.endsWith('platform/signals/data'));
  assert.ok(opts.geoOut.endsWith('platform/signals/data-geo'));
  const two = parseArgs(['--only', 'ip2proxy', '--only', 'geolite2']);
  assert.deepEqual(two.only, ['ip2proxy', 'geolite2']);
});

test('negative: an unknown only value or flag is refused', () => {
  assert.throws(() => parseArgs(['--only', 'ipinfo']), ProviderFetchError);
  assert.throws(() => parseArgs(['--frobnicate']), ProviderFetchError);
});

// ------------------------------------------------------------------ geo swap

const MMDB_SIZE = 200_000; // above the reader's 100 kb floor

function makeGeoTarball() {
  const base = tmp();
  fs.mkdirSync(path.join(base, 'GeoLite2-Country_20261009'));
  fs.writeFileSync(path.join(base, 'GeoLite2-Country_20261009', 'GeoLite2-Country.mmdb'), Buffer.alloc(MMDB_SIZE, 7));
  fs.writeFileSync(path.join(base, 'GeoLite2-Country_20261009', 'LICENSE.txt'), 'eula');
  const tarball = path.join(base, 'geo.tar.gz');
  const packed = spawnSync('tar', ['-czf', tarball, '-C', base, 'GeoLite2-Country_20261009']);
  assert.equal(packed.status, 0, packed.stderr?.toString());
  return { tarball: fs.readFileSync(tarball), base };
}

const stubOpen = () => ({ get: () => null }); // reader: "no result" is a normal miss

test('positive: refreshGeoDatabase installs a manifest-validated database and destroys the old one', async () => {
  const { tarball } = makeGeoTarball();
  const geoOut = path.join(tmp(), 'data-geo');
  const first = await refreshGeoDatabase({ geoOut, tarball, now: new Date(), open: stubOpen });
  assert.equal(first.status, 'ok');
  assert.equal(first.bytes, MMDB_SIZE);
  assert.ok(fs.existsSync(path.join(geoOut, GEO_DB_FILE)));
  const manifest = JSON.parse(fs.readFileSync(path.join(geoOut, 'manifest.json'), 'utf8'));
  assert.equal(manifest.id, 'geolite2-country');
  assert.equal(manifest.file, GEO_DB_FILE);
  assert.equal(manifest.bytes, MMDB_SIZE);

  // second install replaces the first and leaves no backup behind
  const parent = path.dirname(geoOut);
  await refreshGeoDatabase({ geoOut, tarball, now: new Date(), open: stubOpen });
  const leftovers = fs.readdirSync(parent).filter((n) => n.startsWith('data-geo.'));
  assert.equal(leftovers.length, 0);
  assert.equal(fs.readdirSync(geoOut).length, 2); // mmdb + manifest
});

test('negative: a tarball with no mmdb fails and leaves the installed database untouched', async () => {
  const { tarball } = makeGeoTarball();
  const base = tmp();
  const badDir = path.join(base, 'GeoLite2-Country_20261009');
  fs.mkdirSync(badDir);
  fs.writeFileSync(path.join(badDir, 'LICENSE.txt'), 'eula'); // no mmdb inside
  const badTar = path.join(base, 'bad.tar.gz');
  const packed = spawnSync('tar', ['-czf', badTar, '-C', base, 'GeoLite2-Country_20261009']);
  assert.equal(packed.status, 0);
  const bad = fs.readFileSync(badTar);

  const geoOut = path.join(tmp(), 'data-geo');
  await refreshGeoDatabase({ geoOut, tarball, now: new Date(), open: stubOpen });
  const before = fs.readFileSync(path.join(geoOut, GEO_DB_FILE));

  await assert.rejects(
    () => refreshGeoDatabase({ geoOut, tarball: bad, now: new Date(), open: stubOpen }),
    ProviderFetchError,
  );
  assert.deepEqual(fs.readFileSync(path.join(geoOut, GEO_DB_FILE)), before);
});

test('positive: the download ceiling is well above the observed provider sizes', () => {
  // px2lite zip is ~18 mb today; the ceiling leaves growth room while
  // still catching a wrong response.
  assert.ok(MAX_DOWNLOAD_BYTES > 64 * 1024 * 1024);
});
