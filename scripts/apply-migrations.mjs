#!/usr/bin/env node
// apply the full schema history to a fresh supabase project, in order:
// the lovable base migrations, then the repo's own numbered migrations.
// runs over the supabase management api's database/query endpoint as
// postgres, the same path used for the foundation project (see
// migrations/README.md).
//
// usage:
//   SUPABASE_MGMT_TOKEN=<sbp_...> \
//   SUPABASE_PROJECT_REF=<ref> \
//   node scripts/apply-migrations.mjs
//
// review each migration before running; this script applies them in
// order and stops at the first failure with the file name and error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..');

const token = process.env.SUPABASE_MGMT_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;
if (!token || !ref) {
  console.error('need SUPABASE_MGMT_TOKEN and SUPABASE_PROJECT_REF env vars');
  process.exit(1);
}

const lovableDir = path.join(repoRoot, 'what-exists', 'lovable', 'supabase', 'migrations');
const repoDir = path.join(repoRoot, 'migrations');

const files = [
  ...fs.readdirSync(lovableDir).filter(f => f.endsWith('.sql')).sort().map(f => path.join(lovableDir, f)),
  ...fs.readdirSync(repoDir).filter(f => f.endsWith('.sql')).sort().map(f => path.join(repoDir, f)),
];

async function run(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 500)}`);
  return text;
}

let applied = 0;
for (const file of files) {
  const sql = fs.readFileSync(file, 'utf8');
  process.stdout.write(`applying ${path.basename(file)} ... `);
  try {
    await run(sql);
    applied++;
    console.log('ok');
  } catch (err) {
    console.error('FAILED');
    console.error(err.message);
    process.exit(1);
  }
}
console.log(`applied ${applied}/${files.length} migrations to ${ref}`);
