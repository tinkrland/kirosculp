# channels: native integrations, adapter tier, and what not to adopt

how sculptura connects to external sales channels. standing model from
the scoping decision: the platform owns channel connections, and every
order from anywhere returns as a release-bound purchase request. this
page decides the tiers and the tooling verdicts (researched
2026-09-29, sources logged in
[research sources](../../offerings/research/sources.md)).

## tier 1: native integrations (build first)

where the buyer volume and the apis are both real:

- **shopify** (first: largest creator-commerce overlap, mature admin
  api, product/webhook support)
- **etsy** (first: the marketplace most sculptura-native creators will
  already sell on; sync listings, orders return release-bound)
- **pinterest products, instagram/meta commerce, tiktok shop**
  (scheduled candidates per the standing plan)
- **amazon** (promote from long-tail to native-priority research:
  sp-api is real and the volume justifies a proper adapter rather than
  an afterthought)

## tier 2: adapter tier (the long tail, thin adapters)

woocommerce, squarespace, webflow, wix studio, bigcommerce, weebly,
bigcartel. the architecture for these is one internal contract
(orders arrive as release-bound purchase requests; the platform owns
pricing, escrow, fulfillment behind every one) plus one thin adapter
per channel. each adapter costs real work (auth, product sync, webhook
shape, order translation, error/retry semantics), so they get built by
demand signal, not by directory completeness. weebly and bigcartel
have weak or minimal apis and stay last.

## tooling verdicts (researched 2026-09-29)

### openship: reference implementation, not a dependency

openship (github.com/openshiporg/openship) is a real open-source order
routing oms: shops are order sources, channels are fulfillment
destinations, links connect them, matches map items before an order is
placed downstream. the *shape* of this is exactly our adapter-tier
problem and is worth studying: their docs are honest that the repo's
adapter coverage is thin (shopify and openfront) and that credential
handling and non-durable callback paths require hardening before
production orders. so: borrow the shop-to-channel routing model as the
pattern for our channel middleware; do not deploy it as-is expecting
wix/amazon/weebly/bigcommerce/bigcartel coverage for free.

### openlinker: real, alpha, and poland-focused today

correction (2026-09-29): an earlier pass failed to surface it and
wrongly called it confabulated. openlinker
([openlinker.io](https://openlinker.io/en/)) is a real open-source
(apache 2.0, v0.12.0 alpha) self-hosted e-commerce integration
platform: typescript/nestjs/react/postgresql/redis/docker, with
order flows (source to destination, buyer auto-provisioned,
cursor-based resumable ingestion), bidirectional inventory sync,
and a listing wizard with ai-drafted descriptions. its architecture
is port/adapter shaped (ordersource, offermanager, invoicingport,
fiscalizationport), which is the same model our adapter tier needs.

the honest limit: its live integrations today are poland-market
(Allegro, ERLI, KSeF fiscalization, polish invoicing suites) with
prestaShop/woocommerce destinations; none of shopify, wix, amazon,
weebly, bigcartel, or bigcommerce are live. so it is the second
reference implementation alongside openship: study the port/adapter
pattern and the resumable ingestion design; do not expect it to cover
our long tail out of the box, and it is alpha software.

openship and openlinker together actually strengthen the adapter-tier
verdict: the pattern is proven twice in open source, which means the
thin-adapter-over-one-contract design is the industry shape, and our
differentiation is the release-bound purchase request behind it.

### medusa v2 / saleor (and vendure, the same family): real, wrong category

these are self-hostable headless commerce *engines*: full product,
cart, checkout, and storefront stacks. adopting one would mean running
a second commerce system alongside supabase, which contradicts the
supabase-first decision and the plan's own platform leg (spree is
already only the checkout-mechanics sandbox). they do not solve the
channel problem; they *are* an alternative to the thing we are building.
verdict: no. a vendure/medusa channel *adapter* is not a thing to adopt
either; if a creator sells on a medusa-based store, it arrives through
a generic api/webhook adapter like any other long-tail channel.

## boundaries

- every channel, native or adapter, funnels into the same
  release-bound purchase request; no channel ever bypasses trusted
  pricing or escrow ([creator-surfaces.md](creator-surfaces.md)).
- channel adapters are platform-owned infrastructure; the studio
  never knows a channel exists.
- white-label storefronts are not a channel: they are the platform
  itself under the creator's brand ([creator-surfaces.md](creator-surfaces.md)).
