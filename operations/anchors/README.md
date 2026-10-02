# anchors

tamper-evident anchoring for immutable record chains.

## purpose

this directory stores daily anchored merkle roots for hash chains:
- design-release records (studio → platform handoff)
- tune-log batches (agent tuning events)
- ranking-decision logs (future: platform discoverability)

each anchor proves "no record edited since anchor time" for dispute evidence.

## scope

this is tamper-evidence, not a court-admissibility claim. the hash chain detects quiet rewrites of historical records, which matters when sculptura is the adversary in a creator dispute.

## anchor format

each file is named `{chain-type}-{date}.json` where date is `YYYY-MM-DD` in utc (geographic ambiguity per operations rules).

```json
{
  "anchor_id": "design-release-2026-10-02",
  "chain_type": "design-release",
  "date": "2026-10-02",
  "merkle_root": "a1b2c3...",
  "record_count": 47,
  "anchored_at": "2026-10-03T00:05:12Z",
  "anchor_method": "filesystem-v1",
  "anchor_source": "local",
  "notes": "v1 anchoring: file system only. future: rfc 3161 tsa or signed public branch commit."
}
```

## anchor methods

**v1 (current)**: file system storage with git commit history as timestamp source.

**future v2**: rfc 3161 timestamp authority call for cryptographic proof.

**future v3**: signed commit to public branch (git log becomes the audit trail).

anchor method is pluggable - the merkle root computation is deterministic and independent of how it's anchored.

## verification

given a set of records and an anchor file:

```bash
node scripts/verify-chain.mjs records.json operations/anchors/design-release-2026-10-02.json
```

the verifier:
1. walks the hash chain (each record's prev_hash must match the predecessor's computed hash)
2. computes the merkle root from all record hashes
3. compares to the anchored merkle root

if verification passes, no record was edited since the anchor timestamp.

## canonical json

record hashes are computed over canonical json:
- sorted keys (lexicographic)
- no whitespace
- prev_hash field excluded from the hash input

independent parties can recompute hashes from the raw records to verify the chain without trusting sculptura's verifier.

## daily anchoring

run daily via cron or ci:

```bash
node scripts/anchor-daily-chains.mjs design-release 2026-10-02
node scripts/anchor-daily-chains.mjs tune-log 2026-10-02
```

## adding new chains

new record types can join the hash chain system:
1. add prev_hash field to the schema (nullable for genesis)
2. use scripts/lib/hash-chain.mjs to link records
3. anchor daily via scripts/anchor-daily-chains.mjs
4. verify with scripts/verify-chain.mjs

the chain format is generic - no schema rework needed for new streams.
