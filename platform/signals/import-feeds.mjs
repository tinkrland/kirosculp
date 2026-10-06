// import-feeds.mjs
//
// builds a feed directory (feeds + manifest) for loadFeeds(). pure file logic:
// no network code here. the cli in scripts/import-ip-feeds.mjs supplies readers
// that fetch or read local files, and tests supply fake readers.
//
// a refresh never replaces a working feed set with a bad one:
//   1. new files are written to a staging directory next to the target.
//   2. feeds not supplied this run are carried over from the current directory.
//   3. the staged set is validated with the same loader the service uses.
//   4. only if every feed loads ok is the target swapped.
// on any failure the staging directory is removed and the target is untouched.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { FEED_CONFIG, MANIFEST_NAME, buildManifest, loadFeeds } from './feeds.mjs';

/** every file the importer can write, keyed by feed id and address family. */
export const FEED_FILES = Object.freeze([
  { id: 'x4bnet-vpn', family: 4, file: 'x4bnet-vpn-ipv4.txt' },
  { id: 'x4bnet-datacenter', family: 4, file: 'x4bnet-datacenter-ipv4.txt' },
  { id: 'tor-bulk-exit', family: 4, file: 'tor-bulk-exit-ipv4.txt' },
  { id: 'ip2proxy-lite-px2', family: 4, file: 'ip2proxy-lite-px2-ipv4.csv' },
  { id: 'ip2proxy-lite-px2', family: 6, file: 'ip2proxy-lite-px2-ipv6.csv' },
]);

export class FeedImportError extends Error {
  constructor(message, report = []) {
    super(message);
    this.name = 'FeedImportError';
    this.code = 'feed_import_failed';
    this.report = report;
  }
}

const isoDay = (date) => date.toISOString().slice(0, 10);
const specKey = (id, family) => `${id}:${family}`;

/**
 * @param {object} args
 * @param {string} args.outDir  target directory, created if absent
 * @param {Array<{ id: string, family: 4 | 6, read: () => Promise<string> | string }>} args.inputs
 * @param {Date} [args.now]
 * @param {string} [args.datasetVersion] defaults to the import date
 * @returns {Promise<{ report: Array<{ id: string, status: string, detail?: string }>, carriedOver: string[], written: string[] }>}
 */
export async function importFeeds({ outDir, inputs, now = new Date(), datasetVersion = isoDay(now) }) {
  const known = new Map(FEED_FILES.map((f) => [specKey(f.id, f.family), f]));
  for (const input of inputs) {
    if (!known.has(specKey(input.id, input.family))) {
      throw new FeedImportError(`unknown feed ${input.id} for ipv${input.family}`);
    }
  }
  const supplied = new Set(inputs.map((i) => specKey(i.id, i.family)));

  const parent = path.dirname(path.resolve(outDir));
  fs.mkdirSync(parent, { recursive: true });
  const staging = path.join(parent, `.${path.basename(outDir)}.staging-${crypto.randomBytes(4).toString('hex')}`);
  fs.mkdirSync(staging);

  const cleanup = () => fs.rmSync(staging, { recursive: true, force: true });
  try {
    const items = [];
    const written = [];
    const carriedOver = [];

    // 1. new files
    for (const input of inputs) {
      const spec = known.get(specKey(input.id, input.family));
      const text = await input.read();
      if (typeof text !== 'string' || text.length === 0) {
        throw new FeedImportError(`${input.id} ipv${input.family}: empty or non-text download`);
      }
      fs.writeFileSync(path.join(staging, spec.file), text);
      items.push({ id: spec.id, family: spec.family, file: spec.file, datasetVersion, retrievedAt: now.toISOString() });
      written.push(spec.file);
    }

    // 2. carry over feeds not supplied this run, with their original dates
    let previous = null;
    try {
      previous = JSON.parse(fs.readFileSync(path.join(outDir, MANIFEST_NAME), 'utf8'));
    } catch { /* first import */ }
    for (const spec of FEED_FILES) {
      if (supplied.has(specKey(spec.id, spec.family))) continue;
      const old = previous?.feeds?.find((f) => f.id === spec.id && f.family === spec.family);
      const oldFile = old ? path.join(outDir, path.basename(String(old.file))) : null;
      if (old && oldFile && fs.existsSync(oldFile)) {
        fs.copyFileSync(oldFile, path.join(staging, spec.file));
        items.push({ id: spec.id, family: spec.family, file: spec.file, datasetVersion: old.datasetVersion, retrievedAt: old.retrievedAt });
        carriedOver.push(spec.file);
      }
    }

    fs.writeFileSync(path.join(staging, MANIFEST_NAME), JSON.stringify(buildManifest(items, staging), null, 2));

    // 3. validate exactly as the service will
    const { report } = loadFeeds({ dir: staging, now });
    const bad = report.filter((r) => r.status !== 'ok');
    if (bad.length > 0) {
      throw new FeedImportError(
        `refusing to replace the feed set: ${bad.map((b) => `${b.id} is ${b.status}`).join(', ')}`,
        report,
      );
    }

    // 4. swap, keeping the old set until the new one is in place
    const backup = `${outDir}.previous-${crypto.randomBytes(4).toString('hex')}`;
    const hadOld = fs.existsSync(outDir);
    if (hadOld) fs.renameSync(outDir, backup);
    try {
      fs.renameSync(staging, outDir);
    } catch (error) {
      if (hadOld) fs.renameSync(backup, outDir); // put the old set back
      throw error;
    }
    if (hadOld) fs.rmSync(backup, { recursive: true, force: true });

    return { report, carriedOver, written };
  } catch (error) {
    cleanup();
    throw error;
  } finally {
    if (fs.existsSync(staging)) cleanup();
  }
}

export { FEED_CONFIG };
