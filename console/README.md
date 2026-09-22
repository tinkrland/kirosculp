# console

console is the creator and buyer operational surface. it makes the business understandable without becoming a second implementation of the business.

## contains

- `creators/`: earnings, payouts, orders, delivery exceptions, and support
- `buyers/`: receipts, tracking, refunds, claims, and later commission payment state
- `support/`: cases and communication over operational workflows
- `reporting/`: reconciled read models and exports

## rule

console reads and commands operations. financial ledgers, purchase state, shipment state, insurance decisions, and country support remain owned by `operations/`.
