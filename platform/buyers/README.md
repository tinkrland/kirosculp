# Platform: buyers

Buyer-facing browsing, product detail, wishlists, carts, guest checkout, and authenticated account history. Ordinary purchases do not require an account. Commissions will.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura.dev/src/pages/BuyerDashboard.jsx`
- `sculptura.dev/src/components/follow/FollowButton.jsx`
- `sculptura.dev/src/components/follow/FollowsAndLists.jsx`
- `sculptura.dev/src/lib/followStore.js`
- `sculptura.dev/src/lib/wishlistStore.js`
- `sculptura.dev/src/pages/SharedList.jsx`

### What exists now

- Authenticated order history and database-backed follows/lists exist. Wishlists remain local-storage-only, and demo users use local fallbacks.

### Required changes

- Define buyer ownership and privacy for every list.
- Support safe claiming of guest orders.
- Replace mixed demo/live behavior with explicit environments.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
