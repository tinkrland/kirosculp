# Console

Console is the creator and buyer operational surface. It makes the business understandable without becoming a second implementation of the business.

## Contains

- `creators/`: earnings, payouts, orders, delivery exceptions, and support
- `buyers/`: receipts, tracking, refunds, claims, and later commission payment state
- `support/`: cases and communication over operational workflows
- `reporting/`: reconciled read models and exports

## Rule

Console reads and commands operations. Financial ledgers, purchase state, shipment state, insurance decisions, and country support remain owned by `operations/`.

## Current implementation

See the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
