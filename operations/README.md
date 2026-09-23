# Operations

Operations owns the non-creative work required to take a real order safely: money, protection, delivery, jurisdiction, and market availability.

```text
country eligibility
  + trusted price
  + buyer purchase
  + manufacturing route
  + payment and settlement
  + insured delivery
  + refund or claim handling
```

## Domains

- `financial/`: purchase, pricing, payout, settlement, and refunds
- `insurance/`: route/value coverage and claims
- `shipping/`: serviceability, tracking, returns, and customs documents
- `legal/`: terms, intellectual property, disputes, and counsel-reviewed decisions
- `compliance/`: identity, sanctions, tax evidence, consumer, privacy, and retention requirements
- `country-rollout/`: deny-by-default phased market availability

Operations may deny checkout even when a listing exists. Manufacturing may also deny it when no eligible production route exists. Both checks are required.

## Current implementation

See the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
