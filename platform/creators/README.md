# platform: creators

creator-facing offering tools publish accepted design releases, manage listings and collections, configure storefront presentation, choose channels, and optionally open commissions. this layer never opens or edits geometry.

## admission, publication and payout

creator profiles are human-operated, with tessa built into the studio.
[invitation-based admission](../creator-access.md) is separate from storefront
publication, which requires a phone number on file and verified email.
identity verification at payout is handled through stripe/persona, not a
sculptura-operated government-id collection flow.

see [creator integrity](../creator-integrity/solution.md) and
[storefront analytics](../storefronts/analytics.md): umami is the default;
creator-owned google analytics is an optional supplement.

## progression

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

creator signup does not automatically:

- publish a listing
- open a storefront to discovery
- enable commissions
- give buyers or commissioners access to the studio

ordinary listings are the default offering path. after a creator has a store and released work, they may deliberately toggle commissions on. they may later toggle commissions off without unpublishing their standard listings.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/market/CreateAccount.jsx`](../../what-exists/lovable/src/pages/market/CreateAccount.jsx)
- [`sculptura.dev/src/pages/market/AccessAccount.jsx`](../../what-exists/lovable/src/pages/market/AccessAccount.jsx)
- [`sculptura.dev/src/pages/market/MarketDashboard.jsx`](../../what-exists/lovable/src/pages/market/MarketDashboard.jsx)
- [`sculptura.dev/src/pages/market/StoreSettings.jsx`](../../what-exists/lovable/src/pages/market/StoreSettings.jsx)
- [`sculptura.dev/src/pages/market/MyStore.jsx`](../../what-exists/lovable/src/pages/market/MyStore.jsx)
- [`sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`](../../what-exists/lovable/src/components/market/settings/SettingsCommissions.jsx)
- [`sculptura.dev/src/lib/db.js`](../../what-exists/lovable/src/lib/db.js)

### what exists now

- a key-based market-account flow and creator dashboard exist
- the generated key is hashed in storage, while the active handle and raw key are kept in session storage
- commission settings include an availability toggle, rates, turnaround, rush behavior, terms, and intake questions
- current commission intake remains anonymous and incomplete, so the toggle cannot safely activate the intended product yet

### required changes

- replace the custom store key with authenticated creator identity, recovery, revocation, and roles
- move private payout configuration to provider-owned or protected operational records
- make creator publishing consume verified releases
- preserve ordinary listings independently from commission availability
- connect the commission toggle to authenticated intake and the complete protected lifecycle, not merely a public form

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
