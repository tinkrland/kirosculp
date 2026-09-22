# refunds

full and partial refund policy, allocation across platform/manufacturer/creator balances, chargeback handling, and immutable adjustment entries. a refund never deletes or rewrites the original settlement.

## audited implementation reference

**status: missing**

### existing source evidence

- No refund, return, chargeback, credit, adjustment, or claim implementation was found.

### what exists now

- Order status labels do not form a refund system.

### required changes

- Build append-only financial adjustments connected to payment, production, shipping, creator earnings, and payout recovery.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
