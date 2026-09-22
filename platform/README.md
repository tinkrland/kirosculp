# platform

platform is the offering surface. it turns an accepted design release into something people can discover and buy.

## owns

- listings and publication state
- sculptura storefronts and white-label storefronts
- connected channels such as shopify
- discovery, collections, following, wishlists, and carts
- guest checkout for ordinary purchases
- logged-in buyer accounts
- future commission intake and creator selection

## does not own

- geometry generation or castability decisions
- creator payout math
- manufacturer api calls or regional routing

## publication gate

no listing may point to an unvalidated studio project. it must point to a specific immutable design release with `castability.passed = true`.

## commissions

creator commission preferences may exist now, but requesting/accepting work remains muted until escrow and the whole lifecycle are designed together. see `shells/commissions-muted/`.

## current implementation

see the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
