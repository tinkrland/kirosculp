#!/usr/bin/env node
/**
 * apply the project's lowercase/no-emoji/no-em-dash prose rule to markdown.
 *
 * syntax, code, urls, file names, and link destinations keep their original case.
 * use --check in ci to detect future prose that violates the rule.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

// protected patterns: code, urls, file paths, link destinations, html tags
const PROTECTED = /(`[^`\n]*`|\]\([^\n)]*\)|https?:\/\/[^\s<>]+|(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+(?:\.[A-Za-z0-9]+)?|\b[A-Za-z0-9_.-]+\.(?:md|jsonc?|jsx?|tsx?|py|sql|svg|toml|xml|html|css)\b|<[^>]+>)/;

// emoji and em-dash patterns
const EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF]\ufe0f?|[\u200d\ufe0f]/gu;

function normalize(line) {
  let result = '';
  let position = 0;
  let match;
  
  // Use a global regex to find all protected patterns
  const globalProtected = new RegExp(PROTECTED.source, 'g');
  
  while ((match = globalProtected.exec(line)) !== null) {
    // Add the non-protected part before this match (normalized)
    const before = line.substring(position, match.index);
    let normalized = before;
    normalized = normalized.replace(EMOJI, '');
    normalized = normalized.replace(/ — /g, ': ').replace(/—/g, ', ');
    normalized = normalized.toLowerCase();
    result += normalized;
    
    // Add the protected match as-is
    result += match[0];
    position = match.index + match[0].length;
  }
  
  // Add any remaining text after the last match (normalized)
  const after = line.substring(position);
  let normalized = after;
  normalized = normalized.replace(EMOJI, '');
  normalized = normalized.replace(/ — /g, ': ').replace(/—/g, ', ');
  normalized = normalized.toLowerCase();
  result += normalized;
  
  // Clean up spacing before commas
  result = result.replace(/ +,/g, ',');
  
  // Preserve ending whitespace/newline
  if (result.endsWith('\n')) {
    return result.slice(0, -1).replace(/[ \t]+$/, '') + '\n';
  }
  return result.replace(/[ \t]+$/, '');
}

function rewrite(text) {
  // guard against splitting off a trailing empty element when the text
  // ends with a newline: splitting 'a\n' on '\n' yields ['a', ''], and
  // pushing a '\n' for that final element would add a blank line to
  // every file. strip the trailing newline first, rejoin with '\n'.
  const hadTrailingNewline = text.endsWith('\n');
  const body = hadTrailingNewline ? text.slice(0, -1) : text;
  const lines = body.split('\n');
  const results = [];
  let fenced = false;
  
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      results.push(line);
    } else if (fenced) {
      results.push(line);
    } else {
      results.push(normalize(line));
    }
  }
  
  let out = results.join('\n');
  if (hadTrailingNewline) out += '\n';
  return out;
}

function* walkMarkdownFiles(dir, excludeDirs = ['node_modules', '.git', 'what-exists', '.kiro', '.kiro-instructions']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        yield* walkMarkdownFiles(fullPath, excludeDirs);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield fullPath;
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const checkMode = args.includes('--check');
  // generated artifacts excluded from prose normalisation
  const excludeFiles = ['benchmarks/report.md'];
  const changed = [];
  
  for (const file of walkMarkdownFiles(ROOT)) {
    const relativePath = path.relative(ROOT, file).replace(/\\/g, '/');
    if (excludeFiles.some(ex => relativePath === ex || relativePath.endsWith('/' + ex))) continue;
    const old = fs.readFileSync(file, 'utf8');
    const newContent = rewrite(old);
    
    if (old !== newContent) {
      changed.push(relativePath);
      if (!checkMode) {
        fs.writeFileSync(file, newContent, 'utf8');
      }
    }
  }
  
  console.log(`${checkMode ? 'violations' : 'normalized files'}: ${changed.length}`);
  
  if (checkMode && changed.length > 0) {
    console.log(changed.join('\n'));
    process.exit(1);
  }
}

main();
