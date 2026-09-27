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

the resolved object is a **search intent**: style scores, contexts,
symbols, families, and sort/filter params. it is deterministic and
explainable (we can always answer "why did this piece show up for that
search": which phrases matched, which concepts, which styles). never an
llm call at query time. offline phrase embeddings are an optional fuzzy
fallback for never-seen phrases only, computed at vocabulary build time.

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
- **lists** are buyer-owned, private by default (shareable), like
  spotify playlists: a buyer categorizes pieces from any creators into
  named lists ("gift ideas", "wedding inspo", "stack goals"). lists are
  user-scoped persistence, so they require login, the same rule as
  commissions. a list is an organization tool, not a storefront
  surface, and never alters pricing or availability.

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
