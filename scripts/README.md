# validation scripts

`validate-data-contracts.mjs` currently validates manufacturer capability records and shipping-market records against their schemas and cross-record rules.

`validate-offerings.mjs` checks the draft ring-base and earring-finding inventories without implying they are live offerings.

`normalize-prose.py` enforces lowercase markdown prose with no emojis or em dashes while preserving code, urls, file paths, and link destinations. `npm run validate` checks this rule alongside the data schemas. `build-source-audit.py` reads each supplied source file and refreshes [`audit/source-files.tsv`](../audit/source-files.tsv) when the source snapshots are available.

## missing validation

application source has no equivalent contract suite for the studio project, tessa proposals, paracraft builds, design releases, listings, quotes, purchases, manufacturing orders, or operational events.

extend validation as those contracts are introduced. ci should reject schema drift, unknown versions, invalid cross-references, unsupported market activation, and release records whose declared files or hashes do not agree.

## private creator trust database tests

`npm run test:creator-trust` executes the actual 0009 migration against a local
pglite postgres instance with the existing has_role helper and role fixtures.
it checks admin versus creator/buyer/anonymous access, forbidden direct writes,
append-only history, idempotency, revision conflicts and audit-failure rollback.
fixtures do not prove live supabase/postgrest exposure or multi-session races.

`npm run test:buyer-trust` applies 0009 and 0010 to a local database, checking
buyer-side privacy and audited updates plus independence from creator trust.
registered buyers are the identity scope; guest attribution is not inferred.
