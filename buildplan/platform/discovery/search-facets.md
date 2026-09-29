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
