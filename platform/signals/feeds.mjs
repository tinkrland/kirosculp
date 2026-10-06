// feeds.mjs
//
// loads refreshed feed files into range sources for the free adapter, and
// builds the manifest that describes them. feed files live in a gitignored
// directory (platform/signals/data/) and are produced out of band by
// scripts/import-ip-feeds.mjs. tests use small fixture files and never fetch.
//
// a feed that is missing, corrupt, suspiciously small or stale is loaded as an
// unavailable source. that becomes `feed_unavailable` and `needs_review` for a
// mandatory check, never a silent pass and never a hard user fail (ruling 2).
//
// the staleness limits below are owner-ratified settings (ruling 2026-10-06),
// first proposed as implementation defaults. they are parked for a revisit once
// real traffic volume exists; that revisit is expected, not optional.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { createRangeSource, parseIpList, parseIp2ProxyCsv } from './ip-intelligence.mjs';

export const MANIFEST_NAME = 'manifest.json';
export const MANIFEST_SCHEMA_VERSION = 1;

/** more than this share of invalid lines marks a feed corrupt. */
export const MAX_INVALID_SHARE = 0.01;

const HOUR = 3600 * 1000;

/**
 * what each feed is, which flag it backs, and its sanity limits. floors are set
 * well under the sizes observed on 2026-10-06 (x4bnet vpn 11271, datacenter
 * 44365, tor 19348) so a truncated download is caught but normal churn is not.
 */
export const FEED_CONFIG = Object.freeze([
  { id: 'x4bnet-vpn', flag: 'vpn', kind: 'list', families: [4], minEntries: 2000, maxAgeHours: 14 * 24, confidence: 'medium' },
  { id: 'x4bnet-datacenter', flag: 'datacenter', kind: 'list', families: [4], minEntries: 10000, maxAgeHours: 14 * 24, confidence: 'medium' },
  { id: 'tor-bulk-exit', flag: 'tor', kind: 'list', families: [4], minEntries: 1000, maxAgeHours: 48, confidence: 'high' },
  { id: 'ip2proxy-lite-px2', flag: 'proxy', kind: 'ip2proxy', families: [4, 6], minEntries: 100, maxAgeHours: 45 * 24, confidence: 'medium' },
]);

export const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

/**
 * @param {Array<{ id: string, family: 4 | 6, file: string, datasetVersion: string, retrievedAt: string }>} items
 * @param {string} dir directory holding the files, used to hash them
 */
export function buildManifest(items, dir) {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    feeds: items.map((item) => {
      const full = path.join(dir, item.file);
      return { ...item, bytes: fs.statSync(full).size, sha256: sha256File(full) };
    }),
  };
}

function unavailableSource(config, datasetVersion, families, reason) {
  return Object.freeze({
    id: config.id,
    datasetVersion,
    confidence: config.confidence,
    reason,
    covers: (version) => families.includes(version),
    contains: () => { throw new Error(`feed unavailable: ${reason}`); },
  });
}

/**
 * @param {{ dir: string, now?: Date }} args
 * @returns {{ sources: Record<string, any[]>, report: Array<{ id: string, status: string, detail?: string }> }}
 */
export function loadFeeds({ dir, now = new Date() }) {
  const report = [];
  const sources = { proxy: [], vpn: [], tor: [], datacenter: [] };

  let manifest = null;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_NAME), 'utf8'));
    if (manifest?.schemaVersion !== MANIFEST_SCHEMA_VERSION || !Array.isArray(manifest.feeds)) manifest = null;
  } catch {
    manifest = null;
  }

  for (const config of FEED_CONFIG) {
    const entries = manifest ? manifest.feeds.filter((f) => f.id === config.id) : [];
    if (entries.length === 0) {
      report.push({ id: config.id, status: 'missing', detail: manifest ? 'not in manifest' : 'no manifest' });
      sources[config.flag].push(unavailableSource(config, 'none', config.families, 'missing'));
      continue;
    }

    const datasetVersion = entries[0].datasetVersion ?? 'unknown';
    const v4 = [];
    const v6 = [];
    let problem = null;
    const have = new Set();

    for (const entry of entries) {
      have.add(entry.family);
      const file = path.join(dir, String(entry.file));
      try {
        if (path.basename(file) !== entry.file) throw Object.assign(new Error('bad path'), { reason: 'corrupt' });
        if (!fs.existsSync(file)) throw Object.assign(new Error('absent'), { reason: 'missing' });
        if (sha256File(file) !== entry.sha256) throw Object.assign(new Error('hash'), { reason: 'corrupt' });
        const age = now.getTime() - new Date(entry.retrievedAt).getTime();
        if (!Number.isFinite(age) || age < -HOUR) throw Object.assign(new Error('date'), { reason: 'corrupt' });
        if (age > config.maxAgeHours * HOUR) throw Object.assign(new Error('old'), { reason: 'stale' });

        const text = fs.readFileSync(file, 'utf8');
        let parsed;
        if (config.kind === 'list') {
          const p = parseIpList(text);
          parsed = { ranges: entry.family === 4 ? p.v4 : p.v6, entries: p.entries, invalid: p.invalidLines };
        } else {
          const p = parseIp2ProxyCsv(text, { family: entry.family });
          parsed = { ranges: p.ranges, entries: p.entries, invalid: p.invalidLines };
        }
        // garbage first: a mostly invalid file is corrupt whatever its size.
        if (parsed.invalid / Math.max(1, parsed.entries + parsed.invalid) > MAX_INVALID_SHARE) {
          throw Object.assign(new Error('invalid'), { reason: 'corrupt' });
        }
        if (parsed.entries < config.minEntries) throw Object.assign(new Error('small'), { reason: 'too_small' });
        (entry.family === 4 ? v4 : v6).push(...parsed.ranges);
      } catch (error) {
        problem = problem ?? error.reason ?? 'corrupt';
      }
    }

    // an expected address family with no file is a missing feed, not a quiet gap.
    if (!problem && config.families.some((f) => !have.has(f))) problem = 'missing';
    if (problem) {
      report.push({ id: config.id, status: problem });
      sources[config.flag].push(unavailableSource(config, datasetVersion, config.families, problem));
      continue;
    }
    report.push({ id: config.id, status: 'ok', detail: `${v4.length + v6.length} ranges` });
    sources[config.flag].push(createRangeSource({
      id: config.id,
      datasetVersion,
      confidence: config.confidence,
      v4: have.has(4) ? v4 : null,
      v6: have.has(6) ? v6 : null,
    }));
  }

  return { sources, report };
}
