# Validation scripts

`validate-data-contracts.mjs` currently validates manufacturer capability records and shipping-market records against their schemas and cross-record rules.

## Missing validation

Application source has no equivalent contract suite for the Studio project, Tessa proposals, ParaCraft builds, design releases, listings, quotes, purchases, manufacturing orders, or operational events.

Extend validation as those contracts are introduced. CI should reject schema drift, unknown versions, invalid cross-references, unsupported market activation, and release records whose declared files or hashes do not agree.
