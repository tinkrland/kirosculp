# manufacturing quotes

normalized, time-bounded quote snapshots tied to design release, alloy, finish, quantity, destination, partner, currency, and expiry. a local estimate is labeled as an estimate and never silently replaces a production quote.

## audited implementation reference

**status: missing**

### existing source evidence

- Static manufacturing-cost maps appear on artifact records and creator forms. No provider quote integration was found.

### what exists now

- Checkout and publishing treat stored costs as if they were usable quotes.

### required changes

- Create normalized quote requests and responses tied to release hash, variant, destination, partner, currency, expiry, shipping, and assumptions.
- Never accept manufacturing cost from listing clients.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
