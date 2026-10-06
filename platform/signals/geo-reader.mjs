// geo-reader.mjs
//
// geolite2 country lookup for the embargoed-territory check (batch 8). the
// first real consumer of the `geo` field the ip intelligence port has returned,
// unused, since batch 4 (design.md, deferred items: nothing in the two money
// moments needed geo before this).
//
// uses the `maxmind` npm package (mit license, src-0026) to read a geolite2
// country mmdb file. the reader participates in the same manifest-validated
// pattern as feeds.mjs: a missing, tampered, truncated or stale database loads
// as unavailable, not as a silent miss. a stale database violates the geolite2
// eula's 30-day update-and-destroy obligation (src-0022) before it violates any
// code in this leg, but the staleness check here catches it either way.
//
// "no result" is a normal condition, not a failure: an anonymous network, a
// satellite range, or any address absent from the database returns null from
// maxmind's reader, and this module passes that through as a lookup with no
// country, which the adapter records as coverage `full` and a null country
// ("evaluated, no match"). only a database-level problem (missing file, bad
// hash, stale database) is unavailable, and the adapter records that as
// coverage `none` ("not evaluated").

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const GEO_DB_ID = 'geolite2-country';
export const MANIFEST_NAME = 'manifest.json';
export const MANIFEST_SCHEMA_VERSION = 1;

/** the eula requires destroying an old database within 30 days of a new release
 *  (src-0022). this is stricter than that: a database older than this is already
 *  being used past the point a prompt update should have replaced it. */
export const MAX_AGE_HOURS = 30 * 24;

export const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/**
 * @param {{ file: string, retrievedAt: string }} entry
 * @param {string} dir directory holding the file, used to compute its hash
 */
export function buildGeoManifest(entry, dir) {
  const full = path.join(dir, entry.file);
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    id: GEO_DB_ID,
    file: entry.file,
    retrievedAt: entry.retrievedAt,
    bytes: fs.statSync(full).size,
    sha256: sha256File(full),
  };
}

/**
 * @typedef {object} GeoSource
 * @property {(ip: { version: 4 | 6, value: bigint }) => { countryCode: string | null, subdivisionCode: string | null } | null} lookup
 *   matches the shape `FreeIpIntelligenceAdapter` already expects from its
 *   `geo` constructor option. returns null for no result (normal), throws for
 *   a database-level problem (unavailable).
 */

class UnavailableGeoSource {
  constructor(reason) {
    this.reason = reason;
    this.id = GEO_DB_ID;
    this.datasetVersion = 'unavailable';
  }
  lookup() { throw new Error(`geo database unavailable: ${this.reason}`); }
}

/**
 * loads the geolite2 country database from a directory using the same
 * manifest-validation shape as feeds.mjs: integrity (sha-256), freshness
 * (retrievedAt), and a minimum size floor against a truncated download.
 *
 * @param {{ dir: string, now?: Date, open: (filepath: string) => Promise<{ get: (ip: string) => unknown }> }} args
 *   `open` is injected so tests never need a real mmdb file; production code
 *   passes `maxmind.open`.
 * @returns {Promise<{ source: GeoSource, status: 'ok' | 'missing' | 'corrupt' | 'stale' | 'too_small' }>}
 */
export async function loadGeoDatabase({ dir, now = new Date(), open }) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_NAME), 'utf8'));
    if (manifest?.schemaVersion !== MANIFEST_SCHEMA_VERSION || manifest.id !== GEO_DB_ID) manifest = null;
  } catch {
    manifest = null;
  }
  if (!manifest) return { source: new UnavailableGeoSource('missing'), status: 'missing' };

  const file = path.join(dir, String(manifest.file));
  try {
    if (path.basename(file) !== manifest.file) throw Object.assign(new Error('path'), { reason: 'corrupt' });
    if (!fs.existsSync(file)) throw Object.assign(new Error('absent'), { reason: 'missing' });
    if (sha256File(file) !== manifest.sha256) throw Object.assign(new Error('hash'), { reason: 'corrupt' });
    // a real geolite2-country database is tens of mb; a few kb means a truncated
    // or placeholder download, not a usable database.
    if (fs.statSync(file).size < 100_000) throw Object.assign(new Error('small'), { reason: 'too_small' });
    const age = now.getTime() - new Date(manifest.retrievedAt).getTime();
    if (!Number.isFinite(age) || age < -3_600_000) throw Object.assign(new Error('date'), { reason: 'corrupt' });
    if (age > MAX_AGE_HOURS * 3_600_000) throw Object.assign(new Error('old'), { reason: 'stale' });
  } catch (error) {
    const reason = error.reason ?? 'corrupt';
    return { source: new UnavailableGeoSource(reason), status: reason };
  }

  let reader;
  try {
    reader = await open(file);
  } catch {
    return { source: new UnavailableGeoSource('corrupt'), status: 'corrupt' };
  }

  const source = {
    id: GEO_DB_ID,
    datasetVersion: manifest.retrievedAt,
    lookup(ip) {
      // the adapter passes the parsed ip plus its original text, because the
      // mmdb reader wants a string; this module never does its own parsing.
      const result = reader.get(ip.text);
      if (!result) return null; // no result for this address: a normal miss
      // only the located country counts. registered_country is where a network
      // owner registered the block, not where the user is: satellite and anycast
      // ranges often carry only that, and the owner ruling treats them as no geo.
      const countryCode = result.country?.iso_code ?? null;
      const subdivisionCode = result.subdivisions?.[0]?.iso_code ?? null;
      if (countryCode === null) return null;
      return { countryCode, subdivisionCode };
    },
  };
  return { source, status: 'ok' };
}
