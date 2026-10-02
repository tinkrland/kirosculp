#!/usr/bin/env node
/**
 * validate-jsonl.mjs — parse every .jsonl in research/ and report broken lines.
 *
 * exits 1 if any file has unparseable lines, 0 if all clean.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const RESEARCH_DIR = path.join(ROOT, 'research');

function* walkJsonlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      yield* walkJsonlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
      yield fullPath;
    }
  }
}

function validateJsonl(filepath) {
  const name = path.relative(ROOT, filepath).replace(/\\/g, '/');
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  
  const errors = [];
  let count = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    count++;
    try {
      JSON.parse(line);
    } catch (e) {
      errors.push({
        lineNum: i + 1,
        error: e.message,
        preview: line.substring(0, 120)
      });
    }
  }
  
  if (errors.length > 0) {
    console.log(`FAIL ${name}: ${errors.length} broken / ${count} total`);
    for (const { lineNum, error, preview } of errors) {
      console.log(`  line ${lineNum}: ${error}`);
      console.log(`    ${preview}...`);
    }
  } else {
    console.log(`OK   ${name}: ${count} records`);
  }
  
  return errors.length === 0;
}

function main() {
  if (!fs.existsSync(RESEARCH_DIR)) {
    console.log('no research directory found');
    return 0;
  }
  
  const files = Array.from(walkJsonlFiles(RESEARCH_DIR));
  
  if (files.length === 0) {
    console.log('no .jsonl files found');
    return 1;
  }
  
  let allOk = true;
  for (const file of files) {
    if (!validateJsonl(file)) {
      allOk = false;
    }
  }
  
  if (allOk) {
    console.log('all jsonl files valid');
    return 0;
  } else {
    return 1;
  }
}

process.exit(main());
