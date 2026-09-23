# Manufacturing quotes

Normalized, time-bounded quote snapshots tied to design release, alloy, finish, quantity, destination, partner, currency, and expiry. A local estimate is labeled as an estimate and never silently replaces a production quote.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- Static manufacturing-cost maps appear on artifact records and creator forms. No provider quote integration was found.

### What exists now

- Checkout and publishing treat stored costs as if they were usable quotes.

### Required changes

- Create normalized quote requests and responses tied to release hash, variant, destination, partner, currency, expiry, shipping, and assumptions.
- Never accept manufacturing cost from listing clients.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
