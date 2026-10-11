#!/usr/bin/env node
// fetch-provider-feeds.mjs
//
// authorized live provisioning for the two credential-backed signal feeds.
// the free adapter reads feed files from disk; this script is the out-of-band
// step that produces them, added with owner authorization on 2026-10-11.
// not run by any test and not run by the leg itself.
//
//   ip2proxy lite px2  proxy flag  ip2location account download token, under
//                                 the ip2location lite terms of use including
//                                 the attribution acknowledgment (src-0023).
//                                 two zips, one per address family: PX2LITE
//                                 (ipv4 csv) and PX2LITE.IPV6 (ipv6 csv). the
//                                 px2 edition carries proxy ranges only,
//                                 which is the spec boundary: proxy flag and
//                                 nothing else.
//   geolite2 country   geo        maxmind license key, under the geolite2
//                                 eula (src-0022): prompt use of updated
//                                 databases, destruction of old versions
//                                 within 30 days of a new release. the
//                                 replaced database directory is destroyed on
//                                 success, and the reader's 30-day age limit
//                                 (geo-reader.mjs) is the same owner-ratified
//                                 setting.
//
// credentials come from the environment only, never from args, files or the
// repo (the hygiene check enforces that none is committed):
//
//   IP2LOCATION_TOKEN    ip2location account download token
//   MAXMIND_LICENSE_KEY  maxmind license key
//
// usage:
//   node scripts/fetch-provider-feeds.mjs [--only ip2proxy|geolite2]
//     --out <dir>      feed directory, default platform/signals/data
//     --geo-out <dir>  geo database directory, default platform/signals/data-geo
//
// the ip2proxy branch refreshes the whole ip feed set, public lists included:
// the importer refuses a partial set, so a provider-only import could never
// bootstrap and a provider-only refresh would be a second command for no
// reason. everything goes through importFeeds(), the same staging,
// validation and atomic swap the --from-dir flow uses: a bad download never
// replaces a working set, and feeds not supplied this run carry over with
// their original dates. the geo database is staged, hash-manifested, opened
// with the pinned reader and smoke-looked-up before the swap; a failure
// leaves the current database untouched.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { open as openMmdb } from 'maxmind';

import { importFeeds } from '../platform/signals/import-feeds.mjs';
import { buildGeoManifest, loadGeoDatabase } from '../platform/signals/geo-reader.mjs';
import { fetchText, PUBLIC_FEED_URLS } from './import-ip-feeds.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export class ProviderFetchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProviderFetchError';
    this.code = 'provider_fetch_failed';
  }
}

/** download urls, built from the environment credential at run time. the
 *  maxmind url is the geoip_download endpoint with a license_key query
 *  parameter; the account-id/basic-auth download api rejects these keys.
 *  ip2location ships one zip per address family. */
export const PROVIDER_FEED_URLS = Object.freeze({
  'ip2proxy-lite-px2:4': (token) =>
    `https://www.ip2location.com/download?token=${encodeURIComponent(token)}&file=PX2LITE`,
  'ip2proxy-lite-px2:6': (token) =>
    `https://www.ip2location.com/download?token=${encodeURIComponent(token)}&file=PX2LITE.IPV6`,
  'geolite2-country': (key) =>
    `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${encodeURIComponent(key)}&suffix=tar.gz`,
});

/** generous ceiling for all downloads: the px2 zips are ~18-20 mb today, the
 *  country tarball ~3 mb. a multiple beyond this is a wrong response, not a
 *  database. */
export const MAX_DOWNLOAD_BYTES = 96 * 1024 * 1024;

/** the csv entry inside each px2 zip, by address family. */
export const PX2_CSV_NAMES = Object.freeze({
  4: 'IP2PROXY-LITE-PX2.CSV',
  6: 'IP2PROXY-LITE-PX2.IPV6.CSV',
});
/** the mmdb file name the geo reader's manifest expects. */
export const GEO_DB_FILE = 'geolite2-country.mmdb';

/**
 * fetch a url into a buffer, refusing answers above the ceiling.
 * follows redirects (the maxmind endpoint 302s to a signed url).
 */
export async function fetchBinary(url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(180_000) });
  if (!response.ok) throw new ProviderFetchError(`${url} answered ${response.status}`);
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_DOWNLOAD_BYTES) throw new ProviderFetchError(`${url} declares more than ${MAX_DOWNLOAD_BYTES} bytes`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) throw new ProviderFetchError(`${url} is empty`);
  if (buffer.length > MAX_DOWNLOAD_BYTES) throw new ProviderFetchError(`${url} exceeds ${MAX_DOWNLOAD_BYTES} bytes`);
  return buffer;
}

/**
 * extract one entry from an in-memory zip, using the central directory. zip64
 * is not supported; provider zips are far below that size. deflated and stored
 * entries are both handled.
 *
 * @param {Buffer} buffer
 * @param {string} wantedName exact entry name
 * @returns {Buffer} the inflated entry
 */
export function unzipEntry(buffer, wantedName) {
  if (buffer.length < 22) throw new ProviderFetchError('not a zip file: too small');
  // end-of-central-directory record: scan back over the possible comment.
  let eocd = -1;
  const floor = Math.max(0, buffer.length - 22 - 65535);
  for (let i = buffer.length - 22; i >= floor; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new ProviderFetchError('not a zip file: no end-of-central-directory');
  const count = buffer.readUInt16LE(eocd + 10);
  let ptr = buffer.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (ptr + 46 > buffer.length || buffer.readUInt32LE(ptr) !== 0x02014b50) {
      throw new ProviderFetchError('corrupt zip: central directory out of range');
    }
    const method = buffer.readUInt16LE(ptr + 10);
    const compSize = buffer.readUInt32LE(ptr + 20);
    const nameLen = buffer.readUInt16LE(ptr + 28);
    const extraLen = buffer.readUInt16LE(ptr + 30);
    const commentLen = buffer.readUInt16LE(ptr + 32);
    const localOffset = buffer.readUInt32LE(ptr + 42);
    const name = buffer.toString('utf8', ptr + 46, ptr + 46 + nameLen);
    if (name === wantedName) {
      if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new ProviderFetchError(`corrupt zip: no local header for ${wantedName}`);
      }
      const localNameLen = buffer.readUInt16LE(localOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLen + localExtraLen;
      const data = buffer.subarray(start, start + compSize);
      if (method === 0) return Buffer.from(data);
      if (method !== 8) throw new ProviderFetchError(`unsupported zip method ${method} for ${wantedName}`);
      return zlib.inflateRawSync(data);
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  throw new ProviderFetchError(`zip entry not found: ${wantedName}`);
}

/**
 * stage, validate and swap the geo database directory.
 *
 * @param {{ geoOut: string, tarball: Buffer, now: Date, open?: (file: string) => any }} args
 *   `open` is injectable so tests never need a real mmdb reader; production
 *   passes the pinned maxmind reader.
 * @returns {Promise<{ status: string, bytes: number, file: string }>}
 */
export async function refreshGeoDatabase({ geoOut, tarball, now, open = openMmdb }) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-geo-'));
  const cleanup = () => fs.rmSync(work, { recursive: true, force: true });
  try {
    fs.writeFileSync(path.join(work, 'geo.tar.gz'), tarball);
    fs.mkdirSync(path.join(work, 'extract'), { recursive: true });
    const extracted = spawnSync('tar', ['-xzf', path.join(work, 'geo.tar.gz'), '-C', path.join(work, 'extract')]);
    if (extracted.status !== 0) {
      throw new ProviderFetchError(`tar could not read the geolite2 tarball: ${extracted.stderr?.toString().trim()}`);
    }
    const staging = path.join(work, 'staging');
    fs.mkdirSync(staging);
    // the geolite2 tarball nests the database one directory deep
    // (GeoLite2-Country_YYYYMMDD/GeoLite2-Country.mmdb).
    const extract = path.join(work, 'extract');
    let mmdbPath = null;
    for (const entry of fs.readdirSync(extract)) {
      const full = path.join(extract, entry);
      if (fs.statSync(full).isFile() && entry.endsWith('.mmdb')) mmdbPath = full;
      if (fs.statSync(full).isDirectory()) {
        for (const inner of fs.readdirSync(full)) {
          if (inner.endsWith('.mmdb')) {
            if (mmdbPath) throw new ProviderFetchError('more than one mmdb in the tarball');
            mmdbPath = path.join(full, inner);
          }
        }
      }
    }
    if (!mmdbPath) throw new ProviderFetchError('no mmdb in the geolite2 tarball');
    fs.copyFileSync(mmdbPath, path.join(staging, GEO_DB_FILE));
    fs.writeFileSync(
      path.join(staging, 'manifest.json'),
      JSON.stringify(buildGeoManifest({ file: GEO_DB_FILE, retrievedAt: now.toISOString() }, staging), null, 2),
    );

    // validate exactly as the service will, then smoke-test a lookup.
    const { source, status } = await loadGeoDatabase({ dir: staging, now, open });
    if (status !== 'ok') throw new ProviderFetchError(`refusing to install the geo database: ${status}`);
    source.lookup({ text: '8.8.8.8' });

    // swap, destroying the replaced database per the eula obligation.
    fs.mkdirSync(path.dirname(path.resolve(geoOut)), { recursive: true });
    const backup = `${geoOut}.replaced-${path.basename(work)}`;
    const hadOld = fs.existsSync(geoOut);
    if (hadOld) fs.renameSync(geoOut, backup);
    try {
      fs.renameSync(staging, geoOut);
    } catch (error) {
      if (hadOld) fs.renameSync(backup, geoOut); // put the old database back
      throw error;
    }
    if (hadOld) fs.rmSync(backup, { recursive: true, force: true });
    return { status, bytes: fs.statSync(path.join(geoOut, GEO_DB_FILE)).size, file: GEO_DB_FILE };
  } finally {
    cleanup();
  }
}

export function parseArgs(argv) {
  const opts = {
    only: [],
    out: path.join(root, 'platform/signals/data'),
    geoOut: path.join(root, 'platform/signals/data-geo'),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') opts.only.push(argv[++i]);
    else if (a === '--out') opts.out = path.resolve(argv[++i] ?? '');
    else if (a === '--geo-out') opts.geoOut = path.resolve(argv[++i] ?? '');
    else throw new ProviderFetchError(`unknown argument ${a}`);
  }
  for (const only of opts.only) {
    if (!['ip2proxy', 'geolite2'].includes(only)) {
      throw new ProviderFetchError(`--only accepts ip2proxy or geolite2, not ${only}`);
    }
  }
  return opts;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    const want = (name) => opts.only.length === 0 || opts.only.includes(name);
    const now = new Date();

    if (want('ip2proxy')) {
      const token = process.env.IP2LOCATION_TOKEN;
      if (!token) throw new ProviderFetchError('IP2LOCATION_TOKEN is not set');
      console.log('fetching the public ip lists (x4bnet, tor)...');
      const publicInputs = Object.entries(PUBLIC_FEED_URLS).map(([id, url]) => ({
        id,
        family: 4,
        read: () => fetchText(url),
      }));
      const px2Inputs = [];
      for (const family of [4, 6]) {
        console.log(`fetching ip2proxy lite px2 ipv${family} from ip2location...`);
        const zip = await fetchBinary(PROVIDER_FEED_URLS[`ip2proxy-lite-px2:${family}`](token));
        const csv = unzipEntry(zip, PX2_CSV_NAMES[family]).toString('utf8');
        if (csv.trim().length === 0) throw new ProviderFetchError(`the px2 ipv${family} csv is empty`);
        console.log(`  px2 ipv${family} csv: ${csv.length.toLocaleString('en-us')} bytes`);
        px2Inputs.push({ id: 'ip2proxy-lite-px2', family, read: () => csv });
      }
      const { report, carriedOver, written } = await importFeeds({
        outDir: opts.out,
        datasetVersion: now.toISOString().slice(0, 10),
        inputs: [...publicInputs, ...px2Inputs],
      });
      console.log(`feed set written to ${path.relative(root, opts.out) || opts.out}`);
      for (const r of report) console.log(`  ${r.id}: ${r.status}${r.detail ? ` (${r.detail})` : ''}`);
      if (carriedOver.length) console.log(`  carried over unchanged: ${carriedOver.join(', ')}`);
      console.log(`  written this run: ${written.join(', ')}`);
    }

    if (want('geolite2')) {
      const key = process.env.MAXMIND_LICENSE_KEY;
      if (!key) throw new ProviderFetchError('MAXMIND_LICENSE_KEY is not set');
      console.log('fetching geolite2 country from maxmind...');
      const tarball = await fetchBinary(PROVIDER_FEED_URLS['geolite2-country'](key));
      const geo = await refreshGeoDatabase({ geoOut: opts.geoOut, tarball, now });
      console.log(`geo database written to ${path.relative(root, opts.geoOut) || opts.geoOut}`);
      console.log(`  ${geo.file}: ${geo.status}, ${geo.bytes} bytes, retrieved ${now.toISOString()}`);
    }
  } catch (error) {
    console.error(`provider feed fetch failed: ${error.message}`);
    for (const r of error.report ?? []) console.error(`  ${r.id}: ${r.status}`);
    process.exit(1);
  }
}
