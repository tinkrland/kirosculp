# hash chain tamper-evidence implementation

**commit subject**: tamper-evident hash chain for release and tune-log records

## purpose

dispute-evidence groundwork: sculptura cannot quietly rewrite historical records. when the platform is the adversary in a creator dispute, hash chains prove whether records were edited after anchoring.

## scope

this is tamper-evidence, not court-admissibility. the system proves "no record edited since anchor time", nothing stronger.

## changes

### schemas (contracts/)

**design-release.schema.json**:
- added `prev_hash` field (sha-256, ^[a-f0-9]{64}$, nullable only for genesis)
- links record n to record n-1 via hash of predecessor
- `parameter_hash` kept as-is (separate concern: parameter determinism)
- updated description: canonical json format documented for independent verification

**tune-log.schema.json** (created):
- event batch schema with `prev_hash` field (same pattern as design-release)
- events exclude prompt text and reason fields per privacy rules
- batch-level chaining: batch n links to batch n-1

### implementation (scripts/)

**scripts/lib/hash-chain.mjs** (created):
- `canonicalJson(obj)`: deterministic serialization (sorted keys, no whitespace)
- `computeRecordHash(record)`: sha-256 over canonical json, excluding prev_hash
- `verifyChain(records)`: walk chain, report first broken link
- `linkRecord(newRecord, lastRecord)`: compute prev_hash for new record
- `computeMerkleRoot(hashes)`: fold day's hashes into merkle tree

**scripts/anchor-daily-chains.mjs** (created):
- daily anchoring script (run via cron)
- collects day's records, computes merkle root, writes anchor file
- v1: file system storage (operations/anchors/)
- pluggable anchor method: future rfc 3161 tsa or signed public commit

**scripts/verify-chain.mjs** (created):
- verifier script: given records + anchor, verify integrity
- reports first broken link if tampering detected
- independent parties can verify without trusting sculptura's implementation

**scripts/test-hash-chain.mjs** (created):
- integration test: canonical json, linking, verification, tampering detection
- 8 test cases, all passing

### anchoring (operations/)

**operations/anchors/** (created):
- directory for daily anchor files
- format: `{chain-type}-{date}.json` (utc date per geographic-ambiguity rule)
- includes merkle root, record count, anchor method, timestamp

**operations/anchors/README.md** (created):
- anchor file format documentation
- verification instructions
- future anchor methods (rfc 3161, signed commit)

### validation (scripts/)

**scripts/validate-data-contracts.mjs** (updated):
- added hash chain test cases
- positive: 3-record chain with valid prev_hash links
- negative: chain with tampered prev_hash (verification fails)
- test output: "validated hash chain with 1 positive and 1 negative test case"

### documentation (contracts/)

**contracts/hash-chain.md** (created):
- complete hash chain documentation
- canonical json format specification
- verification process for independent parties
- dispute scenario walkthrough
- adding new chains (extensible design)

### package.json

added script: `"test:hash-chain": "node scripts/test-hash-chain.mjs"`

## verification

```bash
npm run test:hash-chain  # integration test
node scripts/validate-data-contracts.mjs  # includes hash chain cases
```

both pass successfully.

## canonical json

record hashes use canonical json for independent verification:
- sorted keys (lexicographic order)
- no whitespace
- prev_hash field excluded from hash computation

example:
```json
{"a":1,"b":{"c":2,"d":3}}
```

any party can recompute hashes from raw records and verify the chain.

## daily anchoring

```bash
node scripts/anchor-daily-chains.mjs design-release 2026-10-02
node scripts/anchor-daily-chains.mjs tune-log 2026-10-02
```

produces anchor files in `operations/anchors/`:
- `design-release-2026-10-02.json`
- `tune-log-2026-10-02.json`

## verification example

```bash
# verify chain integrity
node scripts/verify-chain.mjs records.json

# verify against anchor
node scripts/verify-chain.mjs records.json operations/anchors/design-release-2026-10-02.json
```

if verification passes: no record edited since anchor timestamp.

## extensibility

ranking-decision logs (platform/discoverability) can join later:
1. add prev_hash to schema
2. use linkRecord() when creating records
3. anchor daily
4. verify with existing scripts

no schema rework needed - chain format is generic.

## privacy rules

**tune-log**: event objects exclude prompt text and reason fields. only structured metadata logged (tool name, outcome, error code).

**geographic ambiguity**: all timestamps utc only, per operations rule.

## dispute scenario

creator claims: "sculptura edited my release record to hide a bug."

verification:
1. creator provides release record + anchor file
2. verifier computes hash, walks chain to anchor
3. if chain verifies: record unchanged since anchor
4. if chain broken: sculptura rewrote history

the hash chain proves whether sculptura edited records, not whether the original was correct.

## files changed

```
contracts/design-release.schema.json (modified - prev_hash added)
contracts/tune-log.schema.json (created)
contracts/hash-chain.md (created)
operations/anchors/README.md (created)
scripts/lib/hash-chain.mjs (created)
scripts/anchor-daily-chains.mjs (created)
scripts/verify-chain.mjs (created)
scripts/test-hash-chain.mjs (created)
scripts/validate-data-contracts.mjs (modified - test cases added)
package.json (modified - test:hash-chain script added)
```

## validation output

```
validated the design-release schema, 7 manufacturer records, and 22 shipping market records
validated private creator trust snapshot contract
validated private buyer trust snapshot contract
validated listing.schema.json with 2 positive and 3 negative test cases
validated purchase-request.schema.json with 2 positive and 3 negative test cases
validated hash chain with 1 positive and 1 negative test case
```

## ready for commit

tamper-evident hash chain implementation complete and tested.
