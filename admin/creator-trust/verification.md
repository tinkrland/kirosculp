# local verification, 2026-10-01

## passed

`npm run test:creator-trust`: 63 local pglite database assertions passed against
the actual 0009 migration, using the existing has_role helper and role fixtures.

coverage includes anonymous/creator/buyer denial, admin read/change, actor
provenance, role revocation, read-only service access, direct-write rejection,
append-only audit, stale revision rejection, same-request replay, invalid
references/levels, separate review state, failed-audit rollback and snapshot
json validation. trusted/disabled level definitions are test fixtures only.

contract/manufacturer/market, offerings, research and jsonl validation commands
passed. all changed markdown passed lowercase and new-relative-link checks.

## pre-existing repository failures

`npm run validate` stops on nine existing prose violations, verified unchanged
against the pre-change head: buildplan/platform/channels.md,
buildplan/platform/creator-services.md, manufacturing/routing/provenance-metadata.md,
offerings/piercings/placements.md, offerings/research/sources.md,
offerings/styles/README.md, platform/payments/README.md,
platform/spree-prototype/README.md and studio/design-agent/byok.md.

`npm test`: 14 of 15 paracraft tests passed. the existing profile-001/unit-box
check expects seven constraints but receives nine. a clean pre-change git
archive reproduces the same failure. no unrelated fixes were made.

## not verified or deployed

no live supabase migration, postgrest schema configuration or admin ui was
changed. actual jwt verification is supabase's boundary; the local fixture
supplies session identity to exercise database authorization. multi-session
concurrency, canonical human/profile ownership, policy taxonomy and lawful
retention/deletion handling remain separate verification/design work.

see [schema and access contract](README.md).
