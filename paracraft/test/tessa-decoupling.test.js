// tessa decoupling guard: enforces that paracraft/ contains no tessa
// imports or references, per buildplan/paracraft/README.md decoupling rule.
// paracraft must be independently extractable and testable without any
// agent dependencies.

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const paracraftRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function getAllFiles(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && (entry.endsWith(".js") || entry.endsWith(".json") || entry.endsWith(".md"))) {
      files.push(fullPath);
    }
  }
  return files;
}

test("paracraft contains no tessa imports or references", () => {
  const allFiles = getAllFiles(paracraftRoot);
  
  const violations = [];
  
  for (const file of allFiles) {
    // skip this test file itself and readme documentation
    const relPath = file.replace(/\\/g, "/").split("/paracraft/")[1] || file;
    if (relPath === "test/tessa-decoupling.test.js" || relPath === "README.md") {
      continue;
    }
    
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // skip comments that document the decoupling rule itself
      if (trimmed.startsWith("//") && /never imports? tessa|not import.*tessa|without.*tessa/i.test(trimmed)) {
        continue;
      }
      
      // case-insensitive search for "tessa"
      if (/tessa/i.test(line)) {
        violations.push({
          file: "paracraft/" + relPath,
          line: i + 1,
          content: line.trim()
        });
      }
    }
  }
  
  if (violations.length > 0) {
    const report = violations.map(v => `  ${v.file}:${v.line} - ${v.content}`).join("\n");
    assert.fail(`tessa decoupling violated in ${violations.length} location(s):\n${report}\n\nparacraft must not import or reference tessa per buildplan/paracraft/README.md`);
  }
  
  assert.ok(true, "no tessa references found in paracraft source files");
});
