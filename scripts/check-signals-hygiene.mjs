#!/usr/bin/env node
// check-signals-hygiene.mjs
//
// guards the signals-and-ip-intel leg against two mistakes:
//   1. committing a provider database (geolite2, ip2proxy, ip2location files).
//   2. committing a secret-shaped value in code, fixtures, migrations or docs.
//
// usage:
//   node scripts/check-signals-hygiene.mjs
//   import { scanTree } from './scripts/check-signals-hygiene.mjs';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['node_modules', '.git']);
const TEXT_EXT = new Set(['.mjs', '.js', '.json', '.jsonl', '.md', '.sql', '.txt', '.env', '.yml', '.yaml']);

/** provider database file names, by vendor product. */
const PROVIDER_FILE =
  /(geolite2?|geoip2?|ip2proxy|ip2location|ipinfo)[^/\\]*\.(mmdb|bin|csv|zip|gz|tar|tgz)$/i;
const MMDB = /\.mmdb$/i;

/** secret-shaped values. patterns only; no real credential appears here. */
const SECRET_PATTERNS = [
  ['github token', /github_pat_[A-Za-z0-9_]{20,}/],
  ['firecrawl key', /\bfc-[0-9a-f]{32}\b/],
  ['browserbase key', /\bbb_live_[A-Za-z0-9_-]{10,}/],
  ['aws access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  [
    'assigned credential',
    /(license[_-]?key|api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-+/=]{16,}['"]/i,
  ],
];

/**
 * @param {string} dir directory or file to scan
 * @param {{ relativeTo?: string }} [opts]
 * @returns {{ providerFiles: string[], secrets: Array<{ file: string, kind: string }> }}
 */
export function scanTree(dir, opts = {}) {
  const base = opts.relativeTo ?? dir;
  const result = { providerFiles: [], secrets: [] };
  if (!fs.existsSync(dir)) return result;

  const visit = (p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(p))) return;
      for (const name of fs.readdirSync(p)) visit(path.join(p, name));
      return;
    }
    const rel = path.relative(base, p).split(path.sep).join('/') || path.basename(p);
    if (PROVIDER_FILE.test(p) || MMDB.test(p)) {
      result.providerFiles.push(rel);
      return;
    }
    if (!TEXT_EXT.has(path.extname(p).toLowerCase()) || stat.size > 2_000_000) return;
    const text = fs.readFileSync(p, 'utf8');
    for (const [kind, pattern] of SECRET_PATTERNS) {
      if (pattern.test(text)) result.secrets.push({ file: rel, kind });
    }
  };
  visit(dir);
  return result;
}

/** the paths that belong to the signals leg, relative to the repo root. */
export const SIGNALS_TARGETS = [
  'platform/signals',
  'research/sources',
  'scripts/validate-signal-sources.mjs',
  'scripts/check-signals-hygiene.mjs',
  'scripts/check-trust-schema-invariant.mjs',
  'migrations',
  'security',
];

export function scanRepo(repoRoot = root) {
  const merged = { providerFiles: [], secrets: [] };
  for (const target of SIGNALS_TARGETS) {
    const r = scanTree(path.join(repoRoot, target), { relativeTo: repoRoot });
    merged.providerFiles.push(...r.providerFiles);
    merged.secrets.push(...r.secrets);
  }
  // provider databases must not sit anywhere in the repo, not just the targets.
  const whole = scanTreeProviderOnly(repoRoot);
  for (const f of whole) if (!merged.providerFiles.includes(f)) merged.providerFiles.push(f);
  return merged;
}

function scanTreeProviderOnly(repoRoot) {
  const found = [];
  const visit = (p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(p))) return;
      for (const name of fs.readdirSync(p)) visit(path.join(p, name));
    } else if (PROVIDER_FILE.test(p) || MMDB.test(p)) {
      found.push(path.relative(repoRoot, p).split(path.sep).join('/'));
    }
  };
  visit(repoRoot);
  return found;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const { providerFiles, secrets } = scanRepo();
  if (providerFiles.length || secrets.length) {
    console.error('signals hygiene check failed:');
    for (const f of providerFiles) console.error(`  provider database file: ${f}`);
    for (const s of secrets) console.error(`  secret-shaped value (${s.kind}): ${s.file}`);
    process.exit(1);
  }
  console.log('signals hygiene clean: no provider database files, no secret-shaped values');
}
