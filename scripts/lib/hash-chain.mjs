/**
 * hash chain utilities for tamper-evident record chains
 * 
 * supports design-release, tune-log, and future ranking-decision chains
 */
import crypto from 'node:crypto';

/**
 * compute canonical json serialization
 * sorted keys, no whitespace, deterministic output for hash computation
 * 
 * @param {object} obj - object to serialize
 * @returns {string} canonical json string
 */
export function canonicalJson(obj) {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => {
    return JSON.stringify(key) + ':' + canonicalJson(obj[key]);
  });
  
  return '{' + pairs.join(',') + '}';
}

/**
 * compute record hash (sha-256) over canonical json
 * excludes prev_hash field for chain computation
 * 
 * @param {object} record - record to hash
 * @param {string[]} excludeFields - fields to exclude from hash (default: ['prev_hash'])
 * @returns {string} sha-256 hash (64 hex chars)
 */
export function computeRecordHash(record, excludeFields = ['prev_hash']) {
  const recordCopy = { ...record };
  
  // remove excluded fields
  for (const field of excludeFields) {
    delete recordCopy[field];
  }
  
  const canonical = canonicalJson(recordCopy);
  const hash = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  
  return hash;
}

/**
 * verify hash chain integrity
 * walks from start to end, checking each link
 * 
 * @param {object[]} records - array of records in chain order
 * @param {string} chainType - 'design-release', 'tune-log', or 'ranking-decision'
 * @returns {object} { valid: boolean, firstBrokenLink: number|null, details: string }
 */
export function verifyChain(records, chainType = 'design-release') {
  if (!records || records.length === 0) {
    return { valid: false, firstBrokenLink: null, details: 'empty chain' };
  }
  
  // genesis record must have null prev_hash
  if (records[0].prev_hash !== null) {
    return {
      valid: false,
      firstBrokenLink: 0,
      details: 'genesis record must have prev_hash = null'
    };
  }
  
  // verify each link
  for (let i = 1; i < records.length; i++) {
    const prevRecord = records[i - 1];
    const currentRecord = records[i];
    
    // compute hash of previous record
    const prevHash = computeRecordHash(prevRecord);
    
    // check if current record's prev_hash matches
    if (currentRecord.prev_hash !== prevHash) {
      return {
        valid: false,
        firstBrokenLink: i,
        details: `record ${i} prev_hash (${currentRecord.prev_hash}) does not match computed hash of record ${i-1} (${prevHash})`
      };
    }
  }
  
  return {
    valid: true,
    firstBrokenLink: null,
    details: `chain verified: ${records.length} records`
  };
}

/**
 * compute merkle root from an array of record hashes
 * 
 * @param {string[]} hashes - array of sha-256 hashes
 * @returns {string} merkle root hash
 */
export function computeMerkleRoot(hashes) {
  if (hashes.length === 0) return '';
  if (hashes.length === 1) return hashes[0];
  
  const tree = [...hashes];
  
  while (tree.length > 1) {
    const nextLevel = [];
    
    for (let i = 0; i < tree.length; i += 2) {
      if (i + 1 < tree.length) {
        // hash pair
        const combined = tree[i] + tree[i + 1];
        const hash = crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
        nextLevel.push(hash);
      } else {
        // odd one out, promote to next level
        nextLevel.push(tree[i]);
      }
    }
    
    tree.splice(0, tree.length, ...nextLevel);
  }
  
  return tree[0];
}

/**
 * link a new record to the chain
 * computes prev_hash from the last record
 * 
 * @param {object} newRecord - new record to link (without prev_hash)
 * @param {object|null} lastRecord - previous record in chain (null for genesis)
 * @returns {object} newRecord with prev_hash set
 */
export function linkRecord(newRecord, lastRecord) {
  const recordWithHash = { ...newRecord };
  
  if (lastRecord === null) {
    // genesis record
    recordWithHash.prev_hash = null;
  } else {
    // compute hash of last record
    recordWithHash.prev_hash = computeRecordHash(lastRecord);
  }
  
  return recordWithHash;
}
