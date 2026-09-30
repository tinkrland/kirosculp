# platform

platform is the offering surface. it turns an accepted design release into something people can discover and buy. the shared [offerings taxonomy](../offerings/README.md) describes product families and candidate configuration options, but the platform alone owns the purchasable listing.

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

## creator access and telemetry

[human creator admission](creator-access.md) is invitation-based. the
[creator-integrity problem](creator-integrity/problem.md) and
[solution](creator-integrity/solution.md) distinguish autonomous account farming
from tessa's normal built-in role. storefront publication requires a phone
number on file and verified email; stripe/persona handle payout verification.

[umami is primary telemetry](storefronts/analytics.md), including default
creator-facing analytics. optional creator-owned google analytics supplements it.

## publication gate

no listing may point to an unvalidated studio project. it must point to a specific immutable design release with `castability.passed = true`.

## commissions

creator commission preferences may exist now, but requesting/accepting work remains muted until the whole lifecycle is enforceable together. the escrow and ledger primitive now exists and is verified live ([payments](payments/README.md)); intake stays muted until messaging, acceptance, revisions, and disputes ship against it. see `shells/commissions-muted/`.

## current implementation

see the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
