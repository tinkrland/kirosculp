# Platform: creators

Creator-facing offering tools publish accepted design releases, manage listings and collections, configure storefront presentation, choose channels, and optionally open commissions. This layer never opens or edits geometry.

## Progression

```text
creator identity
  ↓
private Studio projects
  ↓
validated design releases
  ↓
ordinary listings and passive made-to-order sales
  ↓
optional commission toggle
  ↓
authenticated commission requests and lifecycle
```

Creator signup does not automatically:

- Publish a listing
- Open a storefront to discovery
- Enable commissions
- Give buyers or commissioners access to the Studio

Ordinary listings are the default offering path. After a creator has a store and released work, they may deliberately toggle commissions on. They may later toggle commissions off without unpublishing their standard listings.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura.dev/src/pages/market/CreateAccount.jsx`
- `sculptura.dev/src/pages/market/AccessAccount.jsx`
- `sculptura.dev/src/pages/market/MarketDashboard.jsx`
- `sculptura.dev/src/pages/market/StoreSettings.jsx`
- `sculptura.dev/src/pages/market/MyStore.jsx`
- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`
- `sculptura.dev/src/lib/db.js`

### What exists now

- A key-based market-account flow and creator dashboard exist
- The generated key is hashed in storage, while the active handle and raw key are kept in session storage
- Commission settings include an availability toggle, rates, turnaround, rush behavior, terms, and intake questions
- Current commission intake remains anonymous and incomplete, so the toggle cannot safely activate the intended product yet

### Required changes

- Replace the custom store key with authenticated creator identity, recovery, revocation, and roles
- Move private payout configuration to provider-owned or protected operational records
- Make creator publishing consume verified releases
- Preserve ordinary listings independently from commission availability
- Connect the commission toggle to authenticated intake and the complete protected lifecycle, not merely a public form

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
