#!/usr/bin/env node
// import-ip-feeds.mjs
//
// out-of-band refresh of the ip feed files used by platform/signals. not run by
// any test and not run by this leg: a live fetch is a separate, authorized step.
//
//   node scripts/import-ip-feeds.mjs --fetch
//       fetch the public lists (x4bnet vpn, x4bnet datacenter, tor bulk exit).
//       needs no account and no key.
//
//   node scripts/import-ip-feeds.mjs --from-dir <dir>
//       read local files instead of fetching. expected names inside <dir>:
//         x4bnet-vpn-ipv4.txt  x4bnet-datacenter-ipv4.txt  tor-bulk-exit-ipv4.txt
//         ip2proxy-lite-px2-ipv4.csv  ip2proxy-lite-px2-ipv6.csv
//       the ip2proxy lite csv files need a free account at lite.ip2location.com
//       and are only ever read from disk here. accepting the ip2location lite
//       terms of use, including the attribution acknowledgment, is a prerequisite.
//
//   options: --out <dir>  default platform/signals/data
//            --only <id>  limit to one feed id; may repeat
//
// output goes to a gitignored directory. provider files are never committed.
// a refresh that fails validation leaves the current feed set untouched.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importFeeds, FEED_FILES, FeedImportError } from '../platform/signals/import-feeds.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** public list urls, from the source ledger (src-0024, src-0025). */
export const PUBLIC_FEED_URLS = Object.freeze({
  'x4bnet-vpn': 'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/vpn/ipv4.txt',
  'x4bnet-datacenter': 'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/datacenter/ipv4.txt',
  'tor-bulk-exit': 'https://check.torproject.org/torbulkexitlist',
});

const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024;

export async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000), redirect: 'follow' });
  if (!response.ok) throw new FeedImportError(`${url} answered ${response.status}`);
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_DOWNLOAD_BYTES) throw new FeedImportError(`${url} is larger than ${MAX_DOWNLOAD_BYTES} bytes`);
  const text = await response.text();
  if (text.length > MAX_DOWNLOAD_BYTES) throw new FeedImportError(`${url} is larger than ${MAX_DOWNLOAD_BYTES} bytes`);
  return text;
}

/**
 * @param {{ fetch: boolean, fromDir: string | null, only: string[] }} opts
 * @returns {Array<{ id: string, family: 4 | 6, read: () => Promise<string> | string }>}
 */
export function buildInputs({ fetch: live, fromDir, only }) {
  const wanted = (id) => only.length === 0 || only.includes(id);
  const inputs = [];
  for (const spec of FEED_FILES) {
    if (!wanted(spec.id)) continue;
    const url = PUBLIC_FEED_URLS[spec.id];
    if (fromDir) {
      const file = path.join(fromDir, spec.file);
      if (fs.existsSync(file)) inputs.push({ id: spec.id, family: spec.family, read: () => fs.readFileSync(file, 'utf8') });
    } else if (live && url) {
      inputs.push({ id: spec.id, family: spec.family, read: () => fetchText(url) });
    }
  }
  return inputs;
}

export function parseArgs(argv) {
  const opts = { fetch: false, fromDir: null, out: path.join(root, 'platform/signals/data'), only: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fetch') opts.fetch = true;
    else if (a === '--from-dir') opts.fromDir = path.resolve(argv[++i] ?? '');
    else if (a === '--out') opts.out = path.resolve(argv[++i] ?? '');
    else if (a === '--only') opts.only.push(argv[++i]);
    else throw new FeedImportError(`unknown argument ${a}`);
  }
  if (opts.fetch === !!opts.fromDir) throw new FeedImportError('choose exactly one of --fetch or --from-dir <dir>');
  return opts;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    const inputs = buildInputs(opts);
    if (inputs.length === 0) throw new FeedImportError('nothing to import');
    const { report, carriedOver, written } = await importFeeds({ outDir: opts.out, inputs });
    console.log(`feed set written to ${path.relative(root, opts.out) || opts.out}`);
    for (const r of report) console.log(`  ${r.id}: ${r.status}${r.detail ? ` (${r.detail})` : ''}`);
    if (carriedOver.length) console.log(`  carried over unchanged: ${carriedOver.join(', ')}`);
    console.log(`  written this run: ${written.join(', ')}`);
  } catch (error) {
    console.error(`feed import failed: ${error.message}`);
    for (const r of error.report ?? []) console.error(`  ${r.id}: ${r.status}`);
    process.exit(1);
  }
}
