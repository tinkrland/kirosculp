# Console: buyers

Buyer views over operations: receipts, tracking, delivery state, insurance or claim progress, refunds, and commission payment state when commissions exist.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura.dev/src/pages/BuyerDashboard.jsx`
- `sculptura.dev/src/pages/SharedList.jsx`
- `sculptura.dev/src/lib/followStore.js`
- `sculptura.dev/src/lib/wishlistStore.js`

### What exists now

- Order history, follows, lists, wishlists, and recommendations are represented, but persistence and identity differ by feature.

### Required changes

- Unify buyer identity and privacy rules.
- Add delivery, cancellation, refund, claim, commission, and support views backed by operational records.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
