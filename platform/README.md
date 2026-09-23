# Platform

Platform is the offering surface. It turns an accepted design release into something people can discover and buy.

## Owns

- Listings and publication state
- Sculptura storefronts and white-label storefronts
- Connected channels such as shopify
- Discovery, collections, following, wishlists, and carts
- Guest checkout for ordinary purchases
- Logged-in buyer accounts
- Future commission intake and creator selection

## Does not own

- Geometry generation or castability decisions
- Creator payout math
- Manufacturer API calls or regional routing

## Publication gate

No listing may point to an unvalidated studio project. It must point to a specific immutable design release with `castability.passed = true`.

## Commissions

Creator commission preferences may exist now, but requesting/accepting work remains muted until escrow and the whole lifecycle are designed together. See `shells/commissions-muted/`.

## Current implementation

See the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
