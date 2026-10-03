# platform: buyers

buyer-facing browsing, product detail, wishlists, carts, guest checkout, and authenticated account history. ordinary purchases do not require an account. commissions will.

the engagement model (likes, lists, wishlist, follows, metal preference) is specified in [engagement.md](engagement.md).

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/BuyerDashboard.jsx`](../../what-exists/lovable/src/pages/BuyerDashboard.jsx)
- [`sculptura.dev/src/components/follow/FollowButton.jsx`](../../what-exists/lovable/src/components/follow/FollowButton.jsx)
- [`sculptura.dev/src/components/follow/FollowsAndLists.jsx`](../../what-exists/lovable/src/components/follow/FollowsAndLists.jsx)
- [`sculptura.dev/src/lib/followStore.js`](../../what-exists/lovable/src/lib/followStore.js)
- [`sculptura.dev/src/lib/wishlistStore.js`](../../what-exists/lovable/src/lib/wishlistStore.js)
- [`sculptura.dev/src/pages/SharedList.jsx`](../../what-exists/lovable/src/pages/SharedList.jsx)

### what exists now

- authenticated order history and database-backed follows/lists exist. wishlists remain local-storage-only, and demo users use local fallbacks.

### required changes

- define buyer ownership and privacy for every list. the design is now
  specified in [engagement.md](engagement.md); the remaining work is
  implementing it.
- support safe claiming of guest orders.
- replace mixed demo/live behavior with explicit environments.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
