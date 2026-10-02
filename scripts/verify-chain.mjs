#!/usr/bin/env node
/**
 * verify-chain.mjs - verify hash chain integrity
 * 
 * given a set of records plus one anchored merkle root,
 * verify the chain and report the first broken link, if any.
 * 
 * usage:
 *   node verify-chain.mjs <records-file.json> [anchor-file.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { verifyChain, computeRecordHash, computeMerkleRoot } from './lib/hash-chain.mjs';

/**
 * verify chain against an anchored merkle root
 * 
 * @param {object[]} records - records to verify
 * @param {object} anchor - anchor metadata with merkle_root
 * @returns {object} verification result
 */
function verifyAgainstAnchor(records, anchor) {
  // first verify the chain internally
  const chainResult = verifyChain(records);
  
  if (!chainResult.valid) {
    return {
      valid: false,
      details: `chain broken before anchor check: ${chainResult.details}`,
      firstBrokenLink: chainResult.firstBrokenLink
    };
  }
  
  // compute merkle root from records
  const hashes = records.map(record => computeRecordHash(record));
  const computedRoot = computeMerkleRoot(hashes);
  
  // compare to anchored root
  if (computedRoot !== anchor.merkle_root) {
    return {
      valid: false,
      details: `merkle root mismatch: computed ${computedRoot}, anchored ${anchor.merkle_root}`,
      firstBrokenLink: null
    };
  }
  
  return {
    valid: true,
    details: `chain verified against anchor ${anchor.anchor_id}: ${records.length} records`,
    firstBrokenLink: null
  };
}

/**
 * main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('usage: node verify-chain.mjs <records-file.json> [anchor-file.json]');
    console.error('');
    console.error('verifies hash chain integrity for a set of records.');
    console.error('if anchor-file is provided, also verifies against the anchored merkle root.');
    process.exit(1);
  }
  
  const recordsFile = args[0];
  const anchorFile = args[1] || null;
  
  // load records
  if (!fs.existsSync(recordsFile)) {
    console.error(`records file not found: ${recordsFile}`);
    process.exit(1);
  }
  
  const recordsData = JSON.parse(fs.readFileSync(recordsFile, 'utf8'));
  const records = Array.isArray(recordsData) ? recordsData : recordsData.records || [];
  
  if (records.length === 0) {
    console.log('no records to verify');
    process.exit(0);
  }
  
  console.log(`verifying chain: ${records.length} records`);
  console.log('');
  
  // verify chain
  let result;
  
  if (anchorFile) {
    // verify against anchor
    if (!fs.existsSync(anchorFile)) {
      console.error(`anchor file not found: ${anchorFile}`);
      process.exit(1);
    }
    
    const anchor = JSON.parse(fs.readFileSync(anchorFile, 'utf8'));
    console.log(`anchor: ${anchor.anchor_id}`);
    console.log(`  merkle root: ${anchor.merkle_root}`);
    console.log(`  anchored at: ${anchor.anchored_at}`);
    console.log('');
    
    result = verifyAgainstAnchor(records, anchor);
  } else {
    // verify chain only (no anchor)
    result = verifyChain(records);
  }
  
  // report result
  if (result.valid) {
    console.log('✓ verification passed');
    console.log(`  ${result.details}`);
    process.exit(0);
  } else {
    console.log('✗ verification failed');
    console.log(`  ${result.details}`);
    if (result.firstBrokenLink !== null) {
      console.log(`  first broken link: record ${result.firstBrokenLink}`);
    }
    process.exit(1);
  }
}

main();
