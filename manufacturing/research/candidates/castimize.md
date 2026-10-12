# castimize

status: drafted

## finding

castimize is a lost-wax casting platform for designers, jewelers and businesses,
not a single foundry: it instantiates a manufacturer network across the us,
europe, canada and india, with worldwide shipping. it advertises instant
automated quote calculation on design upload ("once your design is uploaded,
our system instantly calculates the production cost and estimated delivery
time based on material choice"), a completed order base of 1000+, and a live
etsy integration that automates jewelry orders and fulfillment. this is the
strongest evidence found so far of a partner-shaped automated quote-and-order
path without custom api work.

## conditions and caveats

- the network model means the actual casting facility varies per order, which
  collides with the route-evidence contract: origin is an output of routing and
  must be stored as per-order facts (facility, assay office, dispatch,
  customs territory), never assumed from the platform's marketing geography.
- precious-metal compliance (hallmark/assay office adjacency) is unverified.
- no mention of a public developer api; the etsy integration and upload-based
  quoting are the automation evidence. api existence needs the full verification
  pass.

## sources

- [castimize homepage](https://castimize.com): platform description, network geography, instant quote claim. (retrieved 2026-10-12)
- [etsy integration with castimize](https://castimize.com/articles/news/etsy-integration-with-castimize/): automated order fulfillment integration. (retrieved 2026-10-12)
- [castimize celebrates 1000+ orders for lost wax casting](https://castimize.com/articles/news/castimize-celebrates-1000-orders-for-lost-wax-casting/): order volume. (retrieved 2026-10-12)

## how this enters the engine

step 0 (precious-metal lost-wax process fit) passes on marketing evidence;
network-of-facilities model means per-order origin facts must come from the
order record, not the platform. api verification pending.
