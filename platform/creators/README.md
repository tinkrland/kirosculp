# platform: creators

creator-facing offering tools: publish an accepted design release, manage listings and collections, configure storefront presentation, choose channels, and set commission availability. this layer never opens or edits geometry.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura.dev/src/pages/market/CreateAccount.jsx`
- `AccessAccount.jsx`
- `MarketDashboard.jsx`
- `StoreSettings.jsx`
- `MyStore.jsx`
- `sculptura.dev/src/lib/db.js`

### what exists now

- A key-based market-account flow and creator dashboard exist. The generated key is hashed in storage, while the active handle and raw key are kept in session storage.

### required changes

- Replace the custom store key with authenticated creator identity, recovery, revocation, and roles.
- Move private payout configuration to provider-owned or protected operational records.
- Make creator publishing consume verified releases.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
