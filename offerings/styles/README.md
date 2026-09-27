# styles: the design-vocabulary leg

buyers and commissioners do not speak in era names. they say "swirly",
"flowy", "old looking", "chunky", "delicate", "sharp". creators do speak
in style names ("art deco", "art nouveau", "brutalist") but mean the
visual language behind them. this leg builds the bridge: a versioned
**style vocabulary** that maps plain language to named styles through
shared visual concepts, so search, discovery, commissions briefs, and
tessa all resolve "swirls and flowers" to art nouveau (and near misses
like victorian or organic-modern) without an llm call at query time.

this is vocabulary, not geometry. a style tag never alters paracraft
output; it filters, labels, routes, and explains. styling a piece stays
the creator's job in the studio.

## the three-layer model

the latent-similarity problem decomposes into three node types; the
resolution is graph traversal, which is why falkordb (already the
chosen graph side of the supabase + falkordb pairing) is the right
home:

1. **phrase layer** — words people actually type or say: "swirly",
   "dainty", "chunky", "statement", "vintage-y", "gothic". mined from
   search behavior, marketplace category language, and sprawl evidence.
2. **concept layer** — visual primitives that phrases express and
   styles feature: `whiplash_curve`, `floral`, `scrollwork`, `bow`,
   `garland`, `knot`, `serpent`, `chevron`, `fan`, `star`, `rope_twist`.
   plus descriptor axes: organic vs geometric, ornate vs clean, dainty
   vs chunky, antique vs modern.
3. **style layer** — the named styles: georgian, victorian, art
   nouveau, edwardian, art deco, egyptian revival, retro,
   mid-century modernist, brutalist, organic modern, everyday fine
   (the retail category for what gets mislabeled minimalist),
   celestial, gothic, biker.

edges carry weights:

- `(:phrase)-[:expresses {weight}]->(:concept)`
- `(:style)-[:features {weight}]->(:concept)`
- `(:style)-[:similar_to {score}]->(:style)` — precomputed at
  vocabulary build time from concept overlap, never at query time.

resolution of "swirls and flowers": `swirl` expresses `whiplash_curve`
+ `scrollwork`; `flowers` expresses `floral`; invert the `features`
edges, sum weights; art nouveau tops, victorian and organic modern
follow. deterministic, explainable, and the same graph powers
"show me more like this" by walking `similar_to`.

## the ask for falkordb

- node keys and weighted edges as above; phrase nodes deduped to
  canonical forms ("swirly", "swirls", "swirly flowery" all resolve
  through concept edges, not string matching alone).
- `similar_to` recomputed offline whenever the vocabulary version
  changes, so query-time traversal is pure lookup.
- optional fuzzy layer for never-seen phrases: if the deployed falkordb
  build supports vector indexes, store offline-computed phrase
  embeddings and match the raw phrase against them before falling back
  to keyword parsing. embeddings are a vocabulary-build artifact, never
  a query-time llm call.
- tessa consumes the same graph when interpreting a commission brief:
  phrase -> concept -> style, plus the style's concept list as the
  vocabulary she may use back to the creator.

## artifacts

- [style-vocabulary.jsonl](style-vocabulary.jsonl): the versioned seed.
  one record per style: era bounds, concept features with weights,
  canonical customer phrases, confusables (`confusable_with`), and
  status (`drafted` until sprawl evidence is consolidated).
- [research/sources.md](../research/sources.md): sprawl sources and
  their boundaries, per the offerings evidence convention.

## boundaries

- a style name is a filter and a label, never a geometry template and
  never a promise that a piece in that style passes validation.
- era styles are naming conventions, not authenticity claims: a new
  sculptura piece is "art deco style", never "art deco", and the
  vocabulary keeps that distinction.
- culturally loaded names (e.g. "bohemian", "tribal") are held out of
  v0.1 deliberately; they need the same care the nativity/cultural
  motifs got in [configure](../configure/README.md).
