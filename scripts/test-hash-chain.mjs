#!/usr/bin/env node
/**
 * test-hash-chain.mjs - integration test for hash chain system
 * 
 * creates a small chain, anchors it, verifies it, then tests tampering detection
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { 
  canonicalJson, 
  computeRecordHash, 
  verifyChain, 
  linkRecord,
  computeMerkleRoot 
} from './lib/hash-chain.mjs';

const TEMP_DIR = 'temp-hash-chain-test';

function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    cleanup();
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

function main() {
  console.log('hash chain integration test\n');
  
  // setup
  cleanup();
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  // test 1: canonical json
  console.log('test 1: canonical json');
  const obj1 = { b: 2, a: 1, c: { d: 4, c: 3 } };
  const canonical1 = canonicalJson(obj1);
  assert(canonical1 === '{"a":1,"b":2,"c":{"c":3,"d":4}}', 'canonical json sorts keys');
  
  const obj2 = { a: [3, 1, 2], b: null };
  const canonical2 = canonicalJson(obj2);
  assert(canonical2 === '{"a":[3,1,2],"b":null}', 'canonical json preserves array order');
  
  // test 2: record hash
  console.log('\ntest 2: record hash computation');
  const record1 = {
    id: 'r1',
    data: 'test',
    prev_hash: null
  };
  const hash1 = computeRecordHash(record1);
  assert(hash1.length === 64, 'record hash is 64 hex chars');
  assert(/^[a-f0-9]{64}$/.test(hash1), 'record hash is lowercase hex');
  
  // test 3: chain linking
  console.log('\ntest 3: chain linking');
  const genesis = {
    id: 'r1',
    data: 'genesis',
    prev_hash: null
  };
  
  const record2 = linkRecord({
    id: 'r2',
    data: 'second'
  }, genesis);
  
  assert(record2.prev_hash === computeRecordHash(genesis), 'linkRecord sets prev_hash correctly');
  
  const record3 = linkRecord({
    id: 'r3',
    data: 'third'
  }, record2);
  
  // test 4: chain verification (valid)
  console.log('\ntest 4: valid chain verification');
  const chain = [genesis, record2, record3];
  const result1 = verifyChain(chain);
  assert(result1.valid === true, 'valid chain passes verification');
  assert(result1.firstBrokenLink === null, 'valid chain has no broken links');
  
  // test 5: chain verification (tampered)
  console.log('\ntest 5: tampered chain detection');
  const tamperedRecord2 = { ...record2, data: 'tampered' };
  const tamperedChain = [genesis, tamperedRecord2, record3];
  const result2 = verifyChain(tamperedChain);
  assert(result2.valid === false, 'tampered chain fails verification');
  assert(result2.firstBrokenLink === 2, 'detects correct broken link position');
  
  // test 6: merkle root
  console.log('\ntest 6: merkle root computation');
  const hashes = chain.map(r => computeRecordHash(r));
  const root = computeMerkleRoot(hashes);
  assert(root.length === 64, 'merkle root is 64 hex chars');
  
  // test 7: anchor and verify flow
  console.log('\ntest 7: anchor and verify flow');
  
  // write chain to file
  const chainFile = path.join(TEMP_DIR, 'test-chain.json');
  fs.writeFileSync(chainFile, JSON.stringify(chain, null, 2), 'utf8');
  
  // create anchor
  const anchor = {
    anchor_id: 'test-chain-2026-10-02',
    chain_type: 'test',
    date: '2026-10-02',
    merkle_root: root,
    record_count: chain.length,
    anchored_at: new Date().toISOString(),
    anchor_method: 'test',
    anchor_source: 'test'
  };
  
  const anchorFile = path.join(TEMP_DIR, 'test-anchor.json');
  fs.writeFileSync(anchorFile, JSON.stringify(anchor, null, 2), 'utf8');
  
  assert(fs.existsSync(chainFile), 'chain file created');
  assert(fs.existsSync(anchorFile), 'anchor file created');
  
  // test 8: genesis must have null prev_hash
  console.log('\ntest 8: genesis validation');
  const invalidGenesis = {
    id: 'r1',
    data: 'invalid',
    prev_hash: 'a'.repeat(64)
  };
  const invalidChain = [invalidGenesis];
  const result3 = verifyChain(invalidChain);
  assert(result3.valid === false, 'genesis with non-null prev_hash fails');
  assert(result3.details.includes('genesis'), 'error mentions genesis');
  
  // cleanup
  cleanup();
  
  console.log('\n✓ all tests passed');
}

main();
