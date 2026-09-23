# Pricing and settlement

## Earnings lock

Creator chooses the amount that must land in their balance per completed sale. Console solves for retail after regional manufacturing cost, processing cost, platform fee, shipping policy, and applicable risk reserve.

## Retail lock

Creator chooses the customer-facing retail amount. Console subtracts the same costs and shows the resulting creator earnings before publication.

## Sale lifecycle

```text
quote → authorized payment → paid order → manufacturing reserved
      → shipped → delivered → claim window → creator payout released
```

Exact payout timing, refund allocation, chargeback liability, and insurance recovery remain policy decisions. They must be explicit before live money moves.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- Price, manufacturing cost, and creator earnings columns exist on order rows, but no ledger or reconciliation engine exists.

### What exists now

- Stored totals are snapshots without balanced entries or payout-state accounting.

### Required changes

- Implement double-entry or equivalently auditable ledger records for charges, fees, production costs, reserves, earnings, refunds, chargebacks, and payouts.

See the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.

## Prototype reference

The [Mock finance flow](../mock-finance-flow.md) proposes a balanced Supabase ledger and explicitly distinguishes simulated allocations from provider transfers and regulated escrow. Formance Ledger is a later [single-source-of-truth evaluation](../../../docs/architecture/data-and-analytics.md), Not a second live ledger.
