# platform source state

## present surfaces

- `sculptura.dev/src/pages/` and `src/components/` contain home, explore, product, creator profile, storefront, collections, cart, guest checkout, buyer lists/follows, creator dashboards, commission request, and admin interfaces.
- supabase migrations define listings/artifacts, market accounts, orders, collections, follows, commission requests, manufacturers, settings, and roles. some storefront and buyer actions use supabase, while other surfaces use browser storage or static demo data. look up the file row in [`source-files.tsv`](source-files.tsv) before treating a page as operational.
- `src/components/market/sections/` and `src/components/market/mystore/` are visual references for creators managing offerings, but the ability to change a ui field is not proof of a protected backend lifecycle.

## partial and rebuild work

- `supabase/functions/publish-artifact/index.ts` verifies a creator access key and forces review, but accepts browser-provided manufacturing costs, earnings, and prices. publishing must consume a validated studio release instead.
- `src/pages/Checkout.jsx`, the cart components, and `supabase/functions/place-order/index.ts` can assemble and insert an order, including a guest order. they cannot authorize/capture payment, reserve a manufacturing route, produce a route-aware trusted price, or settle creator earnings. the old `placed` row is not a paid order.
- commissions currently allow an anonymous request path and have no complete conversation, terms, protected funds, acceptance, cancellation, and dispute state. keep them muted until the whole authenticated lifecycle is enforceable.
- signup and market access still depend on a generated creator key and browser session state rather than a complete identity, recovery, revocation, and role model. creator signup does not imply commission activation or marketplace discoverability.
- admin pages and manufacturer settings are control surfaces, not connected production routing or secure operator permission enforcement.
- any geometry-generation or standalone product-studio code in the offering app must move behind the studio boundary. buyers do not directly use tessa or paracraft.

## acceptance condition

platform listings bind to exact validated release ids, versions, and asset hashes. ordinary buyer checkout can remain guest-friendly while server-owned pricing, verified payment state, fulfillment, and private order access remain secure. commission intake requires authenticated buyers and a complete protected lifecycle.
