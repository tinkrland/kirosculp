# promotions: creator coupons, platform promos, and multi-store checkout

creator platforms (teespring/spring, ko-fi) hand creators their own
coupon codes; marketplaces (etsy) let one cart span many shops. sculptura
does both, with one rule that keeps the money clean.

## the lane rule

a discount only ever eats the money of the party that funded it:

- **creator coupons** are creator-funded. a creator discounts their own
  pieces; the discount comes out of their net earnings side, never out
  of platform fees or manufacturing cost. server-side trusted pricing
  validates the resulting net against the floor (manufacturing + fees)
  and rejects a coupon that would break it, at creation time and again
  at checkout.
- **platform promos** are platform-funded. they reduce the platform's
  take (or are a platform subsidy) across eligible items; they never
  reduce any creator's net.

because the lanes never touch, **a creator coupon and a platform promo
stack freely**: the buyer can apply both, and the split remains
traceable line by line. what does not stack is same-lane stacking: at
most one creator coupon per creator segment and at most one platform
promo per checkout (the platform may auto-apply the best eligible one).

## creator coupons

- creator-owned codes scoped to their own listings, optionally per
  listing, collection, or wear-context/symbol tag within the
  vocabulary.
- types at v1 spec: percentage or fixed amount off, with bounds
  (min order, start/end dates, usage count, first-n-buyers).
- a coupon cannot cross a store boundary: it applies only inside that
  creator's cart segment.

## platform promos

- platform-owned: sitewide, seasonal, or targeted (e.g. drop launch,
  new-buyer). eligibility is platform policy, never creator-set.
- the platform may also run **creator-partnered** promos where the
  platform funds an extra discount on a specific creator's pieces, but
  the ledger entry still records the platform's share as the funding
  side.

## multi-store checkout

like etsy, one cart can span multiple creators; the checkout is one
payment, but the cart is segmented per creator at pricing time:

- each creator's items form a **segment**: separate itemized subtotal,
  separate shipping (pieces are made-to-order and ship from different
  routing anyway), separate coupon application.
- on payment capture, each segment posts its own order and escrow
  hold; the buyer sees one receipt with per-creator itemization, the
  platform sees n orders against one payment.
- refunds are per order (per creator), never cart-wide, matching the
  escrow structure.
- gift card redemption (when built) draws the shared payment side and
  allocates pro rata across segments.

## spree prototype path

spree's promotion engine (spree::promotion, coupon codes, per-store
scoping in multi-store setups) models both levels: creator = store,
store-scoped promotions for creator coupons, a global promotion for
platform promos. the lane rule and the pricing floor are enforced by
the trusted pricing layer, not by spree.

## boundaries

- coupons apply to listings, never to raw releases, and never change
  the two-way pricing model's recorded intent (the ledger always shows
  list price, discount, funding party, and resulting split).
- no fake promotions: a promo needs a real funding side in the ledger;
  markdown-as-marketing ("was $x") is a separate, later rule.
- drop listings accept coupons only if the creator enabled them;
  locked/preclock listings accept none.
