# validation scripts

`validate-data-contracts.mjs` currently validates manufacturer capability records and shipping-market records against their schemas and cross-record rules.

`normalize-prose.py` enforces lowercase markdown prose with no emojis or em dashes while preserving code, urls, file paths, and link destinations. `npm run validate` checks this rule alongside the data schemas. `build-source-audit.py` reads each supplied source file and refreshes [`audit/source-files.tsv`](../audit/source-files.tsv) when the source snapshots are available.

## missing validation

application source has no equivalent contract suite for the studio project, tessa proposals, paracraft builds, design releases, listings, quotes, purchases, manufacturing orders, or operational events.

extend validation as those contracts are introduced. ci should reject schema drift, unknown versions, invalid cross-references, unsupported market activation, and release records whose declared files or hashes do not agree.
