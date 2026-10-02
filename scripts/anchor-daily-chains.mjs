#!/usr/bin/env node
/**
 * anchor-daily-chains.mjs - daily chain anchoring
 * 
 * folds the day's chain into a merkle root and anchors it via pluggable method.
 * v1: signed commit to public branch or rfc 3161 timestamp authority.
 * 
 * stores anchored roots in operations/anchors/ with source and utc timestamp.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { computeRecordHash, computeMerkleRoot } from './lib/hash-chain.mjs';

const ROOT = process.cwd();
const ANCHORS_DIR = path.join(ROOT, 'operations/anchors');

/**
 * collect all records created in the specified date (utc)
 * 
 * @param {object[]} records - all records
 * @param {string} dateStr - date in YYYY-MM-DD format (utc)
 * @returns {object[]} records created on that date
 */
function recordsForDate(records, dateStr) {
  return records.filter(record => {
    const timestamp = record.created_at || record.batch_timestamp;
    if (!timestamp) return false;
    
    const date = new Date(timestamp);
    const recordDate = date.toISOString().split('T')[0];
    
    return recordDate === dateStr;
  });
}

/**
 * anchor a merkle root
 * v1: write to file system with metadata
 * future: call rfc 3161 tsa or sign+commit to public branch
 * 
 * @param {string} merkleRoot - root hash to anchor
 * @param {string} chainType - 'design-release', 'tune-log', etc
 * @param {string} dateStr - date being anchored (YYYY-MM-DD utc)
 * @param {number} recordCount - number of records in the anchor
 * @returns {object} anchor metadata
 */
function anchorMerkleRoot(merkleRoot, chainType, dateStr, recordCount) {
  const anchorId = `${chainType}-${dateStr}`;
  const timestamp = new Date().toISOString();
  
  const anchor = {
    anchor_id: anchorId,
    chain_type: chainType,
    date: dateStr,
    merkle_root: merkleRoot,
    record_count: recordCount,
    anchored_at: timestamp,
    anchor_method: 'filesystem-v1',
    anchor_source: 'local',
    notes: 'v1 anchoring: file system only. future: rfc 3161 tsa or signed public branch commit.'
  };
  
  // ensure anchors directory exists
  if (!fs.existsSync(ANCHORS_DIR)) {
    fs.mkdirSync(ANCHORS_DIR, { recursive: true });
  }
  
  // write anchor file
  const anchorFile = path.join(ANCHORS_DIR, `${anchorId}.json`);
  fs.writeFileSync(anchorFile, JSON.stringify(anchor, null, 2), 'utf8');
  
  console.log(`anchored ${recordCount} ${chainType} records for ${dateStr}`);
  console.log(`  merkle root: ${merkleRoot}`);
  console.log(`  anchor file: ${path.relative(ROOT, anchorFile)}`);
  
  return anchor;
}

/**
 * process a chain for daily anchoring
 * 
 * @param {object[]} records - all records in chain
 * @param {string} chainType - chain identifier
 * @param {string} dateStr - date to anchor (YYYY-MM-DD utc)
 */
function anchorChainForDate(records, chainType, dateStr) {
  const dayRecords = recordsForDate(records, dateStr);
  
  if (dayRecords.length === 0) {
    console.log(`no ${chainType} records for ${dateStr}`);
    return null;
  }
  
  // compute hash for each record
  const hashes = dayRecords.map(record => computeRecordHash(record));
  
  // compute merkle root
  const merkleRoot = computeMerkleRoot(hashes);
  
  // anchor it
  return anchorMerkleRoot(merkleRoot, chainType, dateStr, dayRecords.length);
}

/**
 * main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('usage: node anchor-daily-chains.mjs <chain-type> <date-yyyy-mm-dd>');
    console.error('  chain-type: design-release, tune-log, ranking-decision');
    console.error('  date: utc date to anchor (e.g. 2026-10-02)');
    process.exit(1);
  }
  
  const chainType = args[0];
  const dateStr = args[1];
  
  // validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.error(`invalid date format: ${dateStr} (expected YYYY-MM-DD)`);
    process.exit(1);
  }
  
  // load records for the chain type
  // this is a stub - in production, query the database
  const records = loadRecordsStub(chainType);
  
  // anchor
  const anchor = anchorChainForDate(records, chainType, dateStr);
  
  if (anchor) {
    console.log(`\nanchor complete: ${anchor.anchor_id}`);
  }
}

/**
 * stub: load records from file system
 * in production, query supabase
 */
function loadRecordsStub(chainType) {
  console.log(`stub: loading ${chainType} records from file system`);
  // return empty for now - this would query the database in production
  return [];
}

main();
