# platform leg

this leg reworks the offering app so every listing and order binds to a design release instead of client-supplied claims. the source audit found publishing that accepts browser-provided costs and prices, and an unpaid checkout: both must go.

## steps

1. **release-bound publishing:** publish-artifact consumes a verified release id, version, and asset hash. no creator-entered manufacturing costs, earnings, or prices.
2. **listing model:** a listing references exactly one release version; offered metals, sizes, and finishes come from the release's validated variants plus the [offerings taxonomy](../../offerings/README.md) for presentation.
3. **checkout intake:** checkout assembles a release-bound purchase request (release id, variant, quantity, destination) for the [operations leg](../operations/README.md) to price and confirm. the client sends no amounts.
4. **two-way pricing surface:** the creator fixes net earnings or retail price; operations computes the other. the platform renders the result, it never computes it.
5. **commerce code separation:** move the storefront, cart, and marketplace code that currently lives inside the studio snapshot over to the platform side, then remove the studio's commerce dependencies.
6. **commission surfaces stay muted** until the authenticated, escrowed lifecycle exists; the existing muted shell stays.

## creator surfaces

the creator has three surfaces (public creator page, creator console,
white-label storefront), each with one job and explicit never-does
boundaries: [creator-surfaces.md](creator-surfaces.md). the public
creator page's tab set (overview, catalog, commissions, about, links)
is defined there too.

## discovery

one query box, resolved once, rendered across tabs (pieces, creators,
collections); supabase fts for exact matches, falkordb vocabulary
traversal for latent concept matching. collections (creator-owned,
public) and lists (buyer-owned, private) are separate objects, and
scheduled drops run a server-enforced preclock:
[discovery.md](discovery.md).

## promotions

creator coupons and platform promos with the lane rule (a discount
only eats the funding party's money, so the two stack freely while
same-lane stacking is capped at one), and etsy-style multi-store
checkout: one payment, per-creator itemized orders:
[promotions.md](promotions.md).

## creator services

unscheduled direction: modular creator-side toggles (whitelabel
storefront/email, dns management, whitelabel shipping, printed cards),
wallet-funded to avoid double transaction fees, and bonfire-style
resin-pattern samples printed locally:
[creator-services.md](creator-services.md).

## build depth

this leg is engineered properly, not as a shallow mvp: full creator and buyer flows, release-bound everything, and no demo-mode shortcuts. the full depth definition is in [scoping.md](../scoping.md), the proper-not-shallow scope for all platform surfaces.

## waiting on

the first design releases from the [studio leg](../studio/README.md), and the security containment before buyer-facing flows build on the current database.

## hands over

release-bound purchase requests to [operations](../operations/README.md).
