# search facets: the filter layer of discovery

companion to [discovery.md](../discovery.md). the intent model
answers "what does the buyer mean"; facets answer "what hard
constraints do they want applied". this page defines the filter
taxonomy, where every facet value comes from, and how facets compose
with latent similarity. no query-time llm rule unchanged.

## how filters and intent compose

a query is resolved **once** into a search intent (style scores,
contexts, symbols, families). filters are hard constraints applied to
the candidate set; intent is the soft ranking inside that set. they
never re-trigger resolution: filtering "swirly gold rings" to
silver does not make the buyer have typed a different query.

natural language carries filters too: "swirly gold rings under
$200" resolves the latent part (swirly) and lifts the facet part
(gold -> metal, rings -> family, under $200 -> price band) out of the
same parse. explicit facet clicks are just the same constraints
arriving from the ui instead of the query box.

## the facet taxonomy, with sources

every facet is a closed vocabulary or a computed range. no free-text
facets ever.

### from the design release (immutable, studio-derived)

- **family:** the offerings taxonomy (rings, earrings, bracelets,
  pendants, chains, ...). set by the template/base the release was
  compiled from; a buyer can filter it, a creator cannot retype it.
- **backing type:** earring hardware from the findings catalog
  (post, hoop mechanism, rubber-back swap option, ...), release-bound
  to the validated interface.
- **validated metals:** the alloy set that passed paracraft
  validation for this release (sterling silver, 14k/18k gold colors,
  ...). derived facets: metal family (silver/gold), gold color
  (rose/yellow/white) where the parameter exists.
- **size range:** the validated size envelope (ring sizes; chain
  lengths; bracelet lengths). filtering by ring size 7 means only
  releases whose validated range includes 7.
- **engraving availability:** yes/no plus bounded character count,
  from the template's bounded letter engraving capability.
- **estimated weight band:** from paracraft volume x alloy density
  (computed, never creator-declared).

### from trusted pricing (server-computed, never client-supplied)

- **price band:** the retail price via the normal two-way pricing
  path (creator fixed net or retail, platform computes the other
  side). buyers filter on retail only; the creator-facing side is
  invisible here. band edges (under $100, $100-250, ...) are platform
  constants, and a piece sits in its band server-side at listing
  time. facet counts recompute when trusted pricing changes.

### from the listing (creator-authored within vocabularies)

- **style tags:** chosen from the style vocabulary, never free text;
  these are the edges the latent layer traverses.
- **wear-context tags:** stacks, everyday, statement, bridal, ...;
  same rule: vocabulary-only, and this is where the stacking
  merchandising from the trend research becomes a filter.
- **symbols:** the vocabulary's symbol layer (heart, initial,
  zodiac, ...).
- **availability:** made-to-order is the default state and always
  buyable; limited-series scarcity is deliberately out of this spec
  until drop scarcity rules exist ([drops](../discovery.md)).

### from the creator object

- **commission-open:** only creators with the commissions toggle on;
  on the creators tab this facet is primary.
- **ships-to / lead time band:** from routing estimates
  ([routing](../../../manufacturing/routing/)), platform-computed
  per destination region, never creator-claimed.

### sorts (not filters, but they share the layer)

relevance (intent score, exact > track 1 > track 2), newest,
price asc/desc, and later trending, which is earned-engagement
derived and behind its own anti-gaming rules when it exists.

## latent similarity: the four entry points

the "duh" part, but concretely, where similarity surfaces:

1. **similar pieces (product page):** "more like this" runs the
   current piece's style profile (its style tags, symbols,
   wear-context) plus its render/text embeddings against the index:
   track 1 graph neighbors first, track 2 knn as fallback, merged
   under the same confidence ordering.
2. **complete this stack:** the stacking-specific similarity mode.
   candidates are pieces tagged with stack wear-context in a
   compatible family, and paracraft profile data (band width,
   height, curvature) gates geometric stackability: flush stacks,
   no impossible overlaps. the stacking formulas from the trend
   research (one focal, mixed texture, same metal tone) can appear
   later as guided completions.
3. **style neighborhoods (browse):** from any style node, its graph
   neighbors and confusable edges ("art nouveau" sits near
   "arts and crafts", deliberately distinct from "baroque"):
   explainable, deterministic, the buyer wanders the vocabulary.
4. **creator style profile match:** pieces matched to a creator's
   aggregate profile (already defined in
   [discovery.md](../discovery.md)), so "shops that feel like this"
   works from the same index.

all similarity runs are pre-filtered by active facets: knn and graph
traversals respect the hard constraints (family, price, metal,
size), which is exactly the property the search store must provide
([search-store-alternatives.md](search-store-alternatives.md):
pgvector pre-filtering vs falkordb hybrid query is part of the same
deciding experiment).

## creator free tags: the redbubble layer

facets are closed-vocabulary by rule, and that stands: it is what
keeps filters deterministic and counts honest. but redbubble's
model shows what a closed vocabulary alone loses: sellers add dozens
of freeform tags per listing ("gift for mom", "y2k", "coquette",
"unisex"), and buyers find pieces through phrases no curated taxonomy
would ever anticipate. that layer is worth having, additively:

- **what it is:** a bounded list of creator-authored free-text tags
  per listing (redbubble allows up to ~50; sculptura's cap is a
  console-configured constant, not specified here). tags are plain
  words or short phrases, not chosen from a vocabulary.
- **what it feeds:** the exact/fts layer (a tag is indexed text,
  matched like any other listing text) and, at index time, phrase
  embeddings for the track 2 vector layer, since an unanticipated tag
  is exactly the fuzzy-fallback case track 2 exists for. a popular
  free tag that keeps clustering near an existing style node is a
  live signal for the next vocabulary expansion pass (the v0.3.0-style
  research cycle already used for style corroboration).
- **what it never becomes:** a filter facet. free tags are not
  clickable filter chips and never gate a facet count; that would
  reopen the free-text-facet problem the closed vocabulary exists to
  avoid (inconsistent spelling, spam, unenforceable counts). they are
  search-matchable text and similarity fodder, nothing structural.
- **moderation:** free tags are the one part of a listing that is not
  vocabulary-bounded, so they are the one part that needs spam/abuse
  filtering (banned terms, length caps, no competitor-brand terms) at
  publish time.

the layer is deliberately small in scope: it improves recall for
phrases the vocabulary hasn't caught up to yet, and it is a feeder
for vocabulary growth, not a parallel taxonomy.

## boundaries

- facets are deterministic and closed-vocabulary; facet counts are
  server-computed.
- no facet ever requires creator self-description beyond choosing
  from platform vocabularies; earned-discovery rules stand
  ([scoping](../../scoping.md)).
- buyer-supplied data (lists, wishlists) is never a facet.
- filters never re-run resolution; intent is cached per query.
- the studio never knows facets exist: release-derived values flow
  through the release record, and the facet layer is pure platform.
