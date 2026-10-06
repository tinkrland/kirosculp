#!/usr/bin/env node
// validate-signal-sources.mjs
//
// checks the signals-and-ip-intel entries in research/sources/sources.jsonl.
// the repo convention is that every claim about the outside world has a logged
// source with a boundary saying what the source actually supports. for the
// device and ip feeds that means license, attribution, update terms and an
// explicit "does not support" statement.
//
// usage:
//   node scripts/validate-signal-sources.mjs
//   import { validateSignalSources } from './scripts/validate-signal-sources.mjs';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** topics that mark a ledger entry as part of the signals leg. */
export const SIGNAL_TOPICS = ['device_signals', 'ip_intelligence'];

/** every one of these must be covered by at least one signals entry. */
export const REQUIRED_TOPICS = ['device_signals', 'geo', 'proxy', 'vpn', 'tor'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {Array<Record<string, any>>} records parsed ledger lines
 * @returns {string[]} failures, empty when the ledger is valid
 */
export function validateSignalSources(records) {
  const failures = [];

  const seen = new Set();
  for (const r of records) {
    if (seen.has(r.source_id)) failures.push(`${r.source_id}: duplicate source_id`);
    seen.add(r.source_id);
  }

  const signalRecords = records.filter(
    (r) => Array.isArray(r.topics) && r.topics.some((t) => SIGNAL_TOPICS.includes(t)),
  );

  for (const r of signalRecords) {
    const id = r.source_id;
    const text = (k) => typeof r[k] === 'string' && r[k].trim().length > 0;

    if (!text('license')) failures.push(`${id}: missing license`);
    if (!text('update_terms')) failures.push(`${id}: missing update_terms`);
    if (typeof r.attribution_required !== 'boolean') {
      failures.push(`${id}: attribution_required must be a boolean`);
    }
    if (!text('url') || !r.url.startsWith('https://')) failures.push(`${id}: url must be https`);
    if (!DATE.test(r.accessed_at ?? '')) failures.push(`${id}: accessed_at must be yyyy-mm-dd`);

    if (!text('boundary')) {
      failures.push(`${id}: missing boundary`);
    } else {
      const b = r.boundary.toLowerCase();
      if (!b.includes('supports:')) failures.push(`${id}: boundary must state what the source supports`);
      if (!b.includes('does not support')) {
        failures.push(`${id}: boundary must state what the source does not support`);
      }
    }
  }

  const covered = new Set(signalRecords.flatMap((r) => r.topics));
  for (const topic of REQUIRED_TOPICS) {
    if (!covered.has(topic)) failures.push(`no signals source covers topic "${topic}"`);
  }

  return failures;
}

export function readLedger(file = path.join(root, 'research/sources/sources.jsonl')) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const records = readLedger();
  const failures = validateSignalSources(records);
  if (failures.length) {
    console.error('signal source ledger validation failed:');
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  const n = records.filter((r) => r.topics?.some((t) => SIGNAL_TOPICS.includes(t))).length;
  console.log(`signal source ledger valid: ${n} signals entries of ${records.length} total`);
}
