# discovery: search, collections, lists, and drops

search on sculptura is one query box with resolved intent behind it, not
several separate searches. a buyer types "swirly gold rings for everyday",
the query is resolved once, and every tab (pieces, creators, collections)
renders from the same resolved intent against a different node type.

## the two retrieval layers

- **semantic (exact) layer, supabase fts:** names and identifiers.
  creator names, listing titles, collection titles, product families,
  metals. "jweel-style exact match" lives here. exact hits float above
  latent hits.
- **latent (concept) layer, falkordb:** the vocabulary graph from
  [offerings/styles](../../offerings/styles/README.md). phrase ->
  concept -> style traversal, plus wear-context and symbol layers.
  "swirly" resolves to whiplash_curve + scrollwork, that resolves to art
  nouveau with a score, and the buyer never needs to know the word.

the latent layer is really two tracks, both in falkordb (which supports
knn vector similarity over vector node properties, cosine/euclidean, as
a native hybrid with graph and keyword):

- **track 1, the curated graph (deterministic):** the style vocabulary
  is the graph itself. phrases, concepts, styles, confusable edges, and
  feature weights (the 0.0-1.0 scores in style-vocabulary.jsonl) become
  nodes and weighted edges. every traversal is explainable: which
  phrases matched, which concepts, which styles, with what scores.
  the v0.3.0 evidence pass directly hardens this track: richer
  features and phrases per style mean better resolution, and
  confusable edges handle near-misses (gothic vs biker vs brutalist).
- **track 2, vector similarity (the fuzzy side):** embedding vectors
  stored as node properties, for similarity that the curated vocabulary
  cannot name yet: never-seen phrases (vocabulary-build-time phrase
  embeddings as fuzzy fallback), listing text/image embeddings for
  "feels like this" similarity, and semantic neighbors the graph
  misses. knn over vector indexes, merged into the same intent with
  lower confidence than track 1 hits.

the resolved object is a **search intent**: style scores, contexts,
symbols, families, and sort/filter params, with track 1 hits ranked
above track 2 fuzzy hits, both below exact layer hits. it is
deterministic and explainable where the graph speaks, and
similarity-scored where only vectors do. never an llm call at query
time; embeddings are computed at build time.

alternatives to falkordb for this model (postgres-only is the real
challenger) are assessed in
[discovery/search-store-alternatives.md](discovery/search-store-alternatives.md);
decision deferred to the prototype leg. the filter layer that composes
with the resolved intent (facet taxonomy, sources, and the four
similarity entry points) is specified in
[discovery/search-facets.md](search-facets.md).

## one intent, three tabs

- **pieces:** listings whose style/context/symbol edges match the
  intent. style tags on a listing come from the creator's tag choice
  within the vocabulary, never free text.
- **creators:** creators whose published catalog matches the intent. a
  creator carries an aggregate **style profile** derived from their
  published listings (weighted, with recency), so a creator is
  findable by aesthetic without self-describing as anything. searching
  "swirls and flowers" surfaces art nouveau pieces and the creators
  whose catalogs lean art nouveau, from the same graph query.
- **collections:** collections whose tags or members match the intent.

tab switches preserve the intent; they never re-run resolution.

## collections vs lists: two different objects

- **collections** are creator-owned, public, curated groups of the
  creator's own pieces (title, cover, order, optional narrative), like
  a shop's lookbooks. they appear on the creator page (overview strip
  and a collections view), can be tagged within the vocabulary, and
  are marketing objects: they reference listings, never raw releases.
- **lists** are non-creator objects, like etsy lists: a buyer account
  (never a marketing object) curates pieces
  from any creators into named, ordered lists ("gift ideas", "stack
  goals", "moody gold"), with **public or private visibility**. public
  lists are shareable and viewable by anyone with the link; private
  ones are personal. lists are buyer-account-scoped: creator and
  buyer accounts are entirely separate, with separate lists, even
  when the same person uses one email for both. a creator who wants
  lists switches to buyer mode, where the account carries its own
  buyer identifier number (bin). v1 keeps them out of the search tabs;
  surfacing them (e.g. "featured in lists" on a product page) is a
  later call.
- **wishlists** are separate from lists: the flat save tool, private
  from other buyers and never shareable, but creator-visible with the
  buyer's identity redacted by default: the save name plus the saved
  product is the signal, not who saved. a wishlist is both
  purchase-intent and direction signal; the creator reads it, the
  platform never interprets it. full model in
  [engagement.md](../../platform/buyers/engagement.md).

## drops: scheduled release with a preclock

a creator can schedule a listing's publication:

- the listing exists in a **locked** state with a
  `scheduled_publish_at` timestamp: title, cover, and countdown are
  visible; buyability is not. unlock is server-enforced, never
  client-side.
- a **notify me** list accompanies the preclock: buyers (logged in,
  since it is user-scoped) opt in and are notified at drop time.
- the drop is a listing state, not a release state: the design release
  behind it is already validated and immutable; only the listing's
  public availability is gated in time.
- limited mint counts are deliberately out of this spec; they pair
  naturally with drops later and need their own scarcity rules first.

## boundaries

- search resolution is deterministic and explainable; no query-time
  llm, ever.
- creator style profiles are earned from published listings, matching
  the earned-discovery rule; nothing about signup entitles a creator to
  surface in any search tab.
- collections and lists reference listings only; neither is geometry,
  and neither can promise availability.
- locked drop listings are previews, not offers: no price display
  games, no fake countdowns, and the notify list is the only
  buyer-facing commitment.
