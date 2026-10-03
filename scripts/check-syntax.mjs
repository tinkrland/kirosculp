// syntax gate: every .js/.mjs in the repo must parse.
// born in the main..containment review: platform/api/checkout-submit.js
// shipped with a syntax error because no gate parsed it. this gate walks
// all plain js/mjs outside node_modules (jsx excluded: jsx needs a
// transpiler, not node --check) and fails on the first file that does
// not parse.

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (/\.(js|mjs)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

let failures = 0;
for (const file of walk('.')) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failures++;
    console.error(`FAIL ${file}`);
    console.error(String(err.stderr || err.message).trim());
  }
}

if (failures > 0) {
  console.error(`syntax gate: ${failures} file(s) fail to parse`);
  process.exit(1);
}
console.log('syntax gate: all js/mjs files parse');
