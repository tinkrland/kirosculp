# manufacturing quotes

normalized, time-bounded quote snapshots tied to design release, alloy, finish, quantity, destination, partner, currency, and expiry. a local estimate is labeled as an estimate and never silently replaces a production quote.

## audited implementation reference

**status: missing**

### existing source evidence

- static manufacturing-cost maps appear on artifact records and creator forms. no provider quote integration was found.

### what exists now

- checkout and publishing treat stored costs as if they were usable quotes.

### required changes

- create normalized quote requests and responses tied to release hash, variant, destination, partner, currency, expiry, shipping, and assumptions.
- never accept manufacturing cost from listing clients.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
