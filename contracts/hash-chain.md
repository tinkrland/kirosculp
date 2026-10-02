# hash chain tamper-evidence

## purpose

immutable record chains with tamper-evidence for dispute resolution. when sculptura is the adversary in a creator dispute, the platform cannot quietly rewrite historical records.

## scope

this is tamper-evidence, not court-admissibility. the system proves "no record edited since anchor time". it does not prove the original record was correct, only that it hasn't changed.

## chains

three record types form hash chains:

1. **design-release**: studio → platform handoff (castability, parameters, assets)
2. **tune-log**: agent tuning events (session start, tool use, decision points, errors)
3. **ranking-decision** (future): discoverability algorithm decisions

each chain is independent but uses the same hash chain format.

## hash chain structure

each record has:
- `prev_hash`: sha-256 hash of the immediately preceding record
- genesis record: `prev_hash = null`
- record n: `prev_hash = hash(record n-1)`

record hash is computed over canonical json (sorted keys, no whitespace) excluding the `prev_hash` field itself.

### example chain

```
record 0 (genesis):
  prev_hash: null
  ... other fields ...
  
record 1:
  prev_hash: hash(record 0)  // a1b2c3...
  ... other fields ...
  
record 2:
  prev_hash: hash(record 1)  // d4e5f6...
  ... other fields ...
```

if record 1 is edited, its hash changes, breaking the link to record 2.

## canonical json

to allow independent verification, record hashes use canonical json:

```javascript
// canonical form: sorted keys, no whitespace
{"a":1,"b":{"c":2,"d":3}}

// not canonical: unsorted keys, whitespace
{
  "b": {"d": 3, "c": 2},
  "a": 1
}
```

given a record, any party can recompute its hash and verify the chain without trusting sculptura's implementation.

## daily anchoring

each day, the day's records are folded into a merkle root and anchored:

```
day's records: [r1, r2, r3, r4]
hashes: [hash(r1), hash(r2), hash(r3), hash(r4)]
merkle root: merkle_tree(hashes)
```

the merkle root is anchored via:
- **v1**: file system storage (operations/anchors/)
- **v2** (future): rfc 3161 timestamp authority
- **v3** (future): signed commit to public git branch

anchor file format:

```json
{
  "anchor_id": "design-release-2026-10-02",
  "chain_type": "design-release",
  "date": "2026-10-02",
  "merkle_root": "a1b2c3d4e5f6...",
  "record_count": 47,
  "anchored_at": "2026-10-03T00:05:12Z",
  "anchor_method": "filesystem-v1",
  "anchor_source": "local"
}
```

## verification

### verify chain integrity

```bash
node scripts/verify-chain.mjs records.json
```

walks the chain, checking each `prev_hash` matches the computed hash of the predecessor.

### verify against anchor

```bash
node scripts/verify-chain.mjs records.json operations/anchors/design-release-2026-10-02.json
```

verifies the chain, then computes the merkle root and compares to the anchored root.

if verification passes: no record edited since anchor timestamp.

## implementation

**library**: `scripts/lib/hash-chain.mjs`
- `computeRecordHash(record)`: sha-256 over canonical json
- `verifyChain(records)`: walk chain, report first broken link
- `linkRecord(newRecord, lastRecord)`: compute prev_hash for new record
- `computeMerkleRoot(hashes)`: fold hashes into merkle tree

**scripts**:
- `scripts/anchor-daily-chains.mjs`: anchor a day's records
- `scripts/verify-chain.mjs`: verify chain integrity

**validation**: `scripts/validate-data-contracts.mjs` includes hash chain test cases

## adding new chains

to add a new record type to the hash chain system:

1. add `prev_hash` field to schema (nullable for genesis)
2. use `linkRecord()` when creating records
3. anchor daily via `anchor-daily-chains.mjs`
4. verify with `verify-chain.mjs`

no schema rework needed - the chain format is generic.

## privacy rules

**tune-log**: event objects must not include prompt text or reason fields. only structured metadata (tool name, outcome, error code) is logged.

**geographic ambiguity**: all timestamps are utc only, per operations geographic-ambiguity rule.

## dispute scenario

creator claims: "sculptura edited my release record to blame me for a casting failure."

verification:
1. creator provides: release record + anchor file
2. verifier computes hash of release record
3. verifier walks chain to anchor
4. if chain verifies: record unchanged since anchor
5. if chain broken: sculptura edited records after anchor

the hash chain doesn't prove the original record was correct, but it proves whether sculptura rewrote history.

## references

- design-release.schema.json: prev_hash field, canonical json description
- tune-log.schema.json: prev_hash field, privacy rules
- operations/anchors/README.md: anchor file format, daily process
- scripts/lib/hash-chain.mjs: implementation
