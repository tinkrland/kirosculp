# pricing and settlement

## earnings lock

creator chooses the amount that must land in their balance per completed sale. console solves for retail after regional manufacturing cost, processing cost, platform fee, shipping policy, and applicable risk reserve.

## retail lock

creator chooses the customer-facing retail amount. console subtracts the same costs and shows the resulting creator earnings before publication.

## sale lifecycle

```text
quote → authorized payment → paid order → manufacturing reserved
      → shipped → delivered → claim window → creator payout released
```

exact payout timing, refund allocation, chargeback liability, and insurance recovery remain policy decisions. they must be explicit before live money moves.

## audited implementation reference

**status: missing**

### existing source evidence

- Price, manufacturing cost, and creator earnings columns exist on order rows, but no ledger or reconciliation engine exists.

### what exists now

- Stored totals are snapshots without balanced entries or payout-state accounting.

### required changes

- Implement double-entry or equivalently auditable ledger records for charges, fees, production costs, reserves, earnings, refunds, chargebacks, and payouts.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.

## prototype reference

The [mock finance flow](../mock-finance-flow.md) proposes a balanced Supabase ledger and explicitly distinguishes simulated allocations from provider transfers and regulated escrow. Fleetbase Ledger is a later [single-source-of-truth evaluation](../../../docs/architecture/data-and-analytics.md), not a second live ledger.
