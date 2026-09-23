# Refunds

Full and partial refund policy, allocation across platform/manufacturer/creator balances, chargeback handling, and immutable adjustment entries. A refund never deletes or rewrites the original settlement.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- No refund, return, chargeback, credit, adjustment, or claim implementation was found.

### What exists now

- Order status labels do not form a refund system.

### Required changes

- Build append-only financial adjustments connected to payment, production, shipping, creator earnings, and payout recovery.

See the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
