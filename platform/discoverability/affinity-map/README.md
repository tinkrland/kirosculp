# affinity-map v0.1: the structural affinity table

status: implemented cold-start half. this directory implements the structural
half of the [affinity-map spec](../affinity-map.md): a deterministic
taste-intelligence engine that sits between engagement capture and ranking
policy. the policy layer owns every ranking call; this engine only computes.

## what this is

`affinity-table.json` answers "people who like x also like y" before any
signal volume exists. it is a structural prior computed from the governed
vocabulary alone, over the union of all three vocabularies: the 13 styles,
the 24 symbols and the 4 wear contexts, 41 terms total. later, real
co-occurrence counts blend with this prior deterministically. it seeds the
authored affinity corpus without authoring corpus profiles yet: that stays
an open item in the spec.

the core is a pure module, the same pattern as the themailtell
classification core: versioned vocabulary files and a versioned config in,
one versioned table out. no learned models, no embeddings, no llm anywhere
in the path, no price, no geography, no telemetry input, no clock. same
inputs produce identical output, proven by the input hash and output hash
recorded in the table itself.

## the union lesson

scoring runs over the union of all three vocabularies, not style only. a
style-first pass strands celestial: its moon and sun features meet nothing
in the style file, so its only style-layer overlap is a weak ornate axis.
in the union, celestial's real neighbors surface from the symbol layer:
metal_silver via planet moon, metal_gold via planet sun, cancer and leo via
their ruling planets. the facet crosswalk that makes this possible lives in
`config.json`, never in code.

the wear-context vocabulary carries no feature or axis content in v0.1, so
its four rows have empty neighborhoods. that is honest, not a bug: nothing
pads them. metal_platinum is the same: one facet, no sharer.

## scoring

weighted facet overlap over features and axes, as a weighted cosine: each
shared facet contributes weight times left intensity times right intensity
to the dot product, and weight times intensity squared to the squared
norm. with all weights at 1.0 (the v0.1 default) this reproduces the
reference cosine pass over the style file: brutalist and biker at 0.62
mutual top, art_deco's only real neighbor egyptian_revival at 0.28, the
georgian/victorian/art_nouveau/edwardian antique cluster on top.

every knob lives in versioned config, never in a code constant:

- `facet_class_weights`: the feature-vs-axis weighting
- per-field weights inside `facet_sources`: fine-grained tuning on top of
  the class weight
- `facet_sources`: the crosswalk, which record fields become facets per
  vocabulary kind
- `top_k`, `min_score`, `score_rounding_decimals`

changing any value is a config version bump and changes the output hash.

## explanation objects

every neighbor carries its explanation: the shared facets, each side's
intensity, class and weight, the contribution, and both norms. the score
is recomputable from the explanation object alone, so "why this surfaced"
is a citable artifact that feeds the hash-chained ranking decision logs
directly, per spec section 4. the check script re-verifies this
recomputation for every published neighbor on every run.

## the confusable cross-check

`confusable_with` in a vocabulary record is an authored affinity edge. the
build cross-checks every authored edge against the computed ranking: an
edge whose target lands in the term's top-k is `confirmed`; anything else
is reported as glossary drift with the computed neighbors named, never
silently accepted. the check doubles as a vocabulary validator: a
confusable pointing at a term that does not exist fails the check, and
drift findings are for the owner to resolve by authoring vocabulary or
corpus edges.

v0.1 drift findings, as first committed, and their resolution (2026-10-07):

- celestial -> gothic: fixed, now confirmed (rank 5). the authored edge
  was dismissed as a mood adjacency ("dark romantic", "witchy" vs
  "cosmic"), but it is a real sold crossover category ("celestial goth",
  "witchy celestial jewelry" per etsy and shieldmaidenjewelry: crescent
  moons rendered in oxidized dark metal). added a shared
  `dark_celestial_motif` feature to both records, sourced and weighted
  below each style's dominant features so celestial still reads as
  star/moon/sun first and gothic still reads as cross/dagger/skull first.
- celestial -> art_deco: still drift, now on sourced grounds instead of
  a hunch. "sunburst" and "sun" are the same core motif at different
  stylization levels (louymagroos and awedeco both sell this literally as
  "art deco sun jewelry"), so a shared `sun_motif` facet was added to
  both records. it moved celestial's art_deco score from zero shared
  facets to rank 12 (0.0517), but celestial's real structural neighbors
  are still the symbol layer by a wide margin (metal_silver, sign_cancer,
  metal_gold, sign_leo, all 0.20-0.32 via moon/sun), and gothic's new
  confirmed edge (0.096) still edges out art_deco for the 5th slot.
  pushing art_deco past that would mean weighting a secondary motif-echo
  above celestial's dominant identity, which is padding, not a fix.
- retro -> mid_century_modernist: still drift, same shape. the authored
  edge is a real, sourced era adjacency (versani and langantiques both
  place mid-century jewelry as the direct successor to 1940s retro,
  "the generation right after wwii"), so a shared `postwar_era` axis was
  added to both records. it raised the score from one weak sphere
  feature (0.09) to 0.136, but retro's vocabulary (already flagged
  weak-evidence, pending its own dedicated dealer/scholarship source) is
  currently thinner on retro-specific facets than on the shared
  ornate/antique axes it happens to carry, so georgian, edwardian,
  victorian, biker and art_nouveau all still outscore mid_century_modernist
  in retro's ranking. closing this one for real needs the retro
  vocabulary pass retro's own notes already call for, not another
  crosswalk nudge.

thin neighborhoods for distinctive styles (and the empty wear-context
rows) are honest, not a bug. nothing is padded.

## determinism record

the table pins the engine version, config version and sha256, the three
vocabulary file sha256s and per-record version summaries, plus two hashes:

- `determinism.input_hash`: sha256 over the engine version, config sha256
  and each vocabulary key, path and sha256 in config input order.
- `determinism.output_hash`: sha256 over the table serialized canonically
  (json, two-space indent, trailing newline) with `output_hash` itself
  set to null, so the artifact carries a self-verifiable hash.

the check script rebuilds the table from the files on disk and requires
the rebuild to be byte-identical, so any vocabulary or config edit without
a rebuild fails the staleness checks. corpus version is pinned as null:
the corpus is an open spec item and v0.1 is the structural prior only.

## running it

```text
node platform/discoverability/affinity-map/build-affinity-table.mjs
node platform/discoverability/affinity-map/check-affinity-table.mjs
```

the build prints the determinism record and any drift; the check prints
the confusable cross-check, the full top-neighbors map and the check
counts, and exits nonzero on any failure. neither script touches the
package.json validate chain, live storage, or any other leg's branches.

## scope boundaries for v0.1

- no corpus profiles: this seeds the authored affinity corpus but authors
  nothing in it.
- no decay semantics: the structural prior has no time component, so the
  spec's decay-window decision stays open.
- no creator affinity: out of scope per the brief.
- no co-occurrence blending yet: the prior answers cold start; real counts
  arrive with signal volume.
- nothing goes to live storage, and nothing touches the security leg.
