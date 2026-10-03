# engagement signals: likes, lists, wishlist, follows

the buyer engagement model, one by one. every signal here has a
defined visibility class, a defined use, and an anti-gaming note.
companion docs: [discovery](../../buildplan/platform/discovery.md),
[search facets](../../buildplan/platform/discovery/search-facets.md),
[storefront analytics](../storefronts/analytics.md), and the
[style vocabulary](../../offerings/styles/README.md), whose phrase
layer this model feeds.

## the three buyer signals

three separate signals, deliberately not one "saves" feature:

### likes

- what: redbubble-style. a like is personalization input that
  inspires the buyer's own feed. it is not a wishlist, not a
  collection, and never a shopping list.
- visibility: individual likes are private to the buyer by default.
  creators see aggregate counts only ("137 likes"), never who.
  no public like feed on buyer profiles.
- why private: a like does its whole job as a ranking input. making
  it public buys social proof and sells a like-farming incentive.
  aggregate counts give creators the signal without the gaming
  surface.
- anti-gaming: likes feed personalization per buyer and aggregate
  counts to creators; both are trust-weighted through the private
  buyer trust model before they influence cross-buyer ranking.
  a sybil account mass-liking produces nothing publicly visible.

### lists

- what: amazon-style. buyer-created, buyer-named ("romantasy
  vibe"), shareable and saveable. a public curation layer: buyers
  curate aesthetics and share them around. list names are
  buyer-authored free text by design.
- visibility: public to anyone with the link, and discoverable on
  the buyer's profile unless the buyer opts the list out of profile
  listing. a list can also be created private, but a private list is
  just a worse wishlist; the point of lists is sharing.
- signal use: list membership and list names are two different
  signals. membership ("this piece was saved to 14 lists") is a
  curation signal for ranking and creator aggregates. list names
  feed the phrase layer of the style vocabulary: names clustering
  near a style node are live evidence for the next vocabulary
  expansion pass, the same cycle as free-tag clustering.
- creator visibility: creators see aggregate list-save counts and
  which public lists contain their pieces, since public lists are
  public. private-list saves show as anonymous saves only.
- anti-gaming: a shared list is free promotion, so list creation
  and list-visibility spam are rate-limited, and list-save signals
  are trust-weighted. one coordinated shop's lists full of its own
  pieces are visible as a cluster and discountable.

### wishlist

- what: one private, unshareable list on the account. the
  closest-to-purchase signal, therefore the most sensitive and the
  most gameable.
- visibility: fully private. never shareable, never shown to
  creators with any identity, never shown on the buyer's profile.
  creators may see an anonymous aggregate count ("42 people want
  this"); whether that aggregate is exposed at all is a launch-time
  product decision, not a schema one.
- signal use: wishlist adds count toward discovery ranking as
  demand signal, even though the list itself is invisible. the
  visibility layer and the signal layer are separate: an invisible
  signal can still be a signal. trust-weighted like everything else.
- no partial visibility: no "your friend wished for this" features,
  no shared wishlists, no notifications to creators about who.

## follows

### following creators

- what: follow a creator. the subscription signal and the strongest
  creator-level input for the creator style profile match entry
  point already defined in discovery.
- visibility: a buyer's follows are visible on their profile only if
  the buyer opts in. follower counts on creator pages are aggregate,
  and raw follower counts are not a ranking input without trust
  weighting.
- signal use: feeds "shops that feel like this" and the buyer's
  feed ordering.

### following hashtags and aesthetics

- what: follow an aesthetic, not a person. the followable set is
  bound to the style vocabulary's named nodes (styles, concepts,
  aesthetic clusters). no free-text hashtag creation.
- why vocabulary-bound: free-text hashtags are how redbubble's
  taxonomy got bypassed. the pressure valve for unanticipated
  phrases already exists: the bounded free-tag layer on listings,
  with clustering as the expansion signal.
- signal use: an aesthetic follow is a behavioral vote on a style
  graph node, strengthening track 1 edges with no llm call. it also
  personalizes the buyer's feed toward that aesthetic.
- anti-gaming: follow counts per aesthetic are trust-weighted
  aggregates, same as all engagement signals.

## buyer metal preference

buyers may set which metals are "their colors": a material-taste
preference, chosen from the same validated-metal facets the search
layer uses.

- example: a "silver fan" buyer opts into silver, white gold, and
  platinum. their feed, "more like this", and browse results rank
  those metal families higher; other metals are never excluded,
  just ranked lower, and filters always remain explicit.
- the preference biases ranking and feed composition. it does not
  gate checkout, does not affect which metals a release validates
  for, and is always client-overridable per query.
- **never a skin or body feature.** there is no shade matching, no
  "which metal suits your skin tone" suggestion, and no
  photographic skin analysis anywhere in the product. metal
  preference is about the buyer's stated taste, full stop. any
  future "style quiz" must respect the same line: ask about pieces
  and materials, never about the buyer's body.
- the preference is a ranking bias on the release-derived facets
  (metal family, gold color) already defined in search facets; no
  new vocabulary is introduced here.

## creator side

### collections

- what: redbubble/youtube-style subpages on the storefront: the
  creator organizes their own listings into named collections.
- boundaries: collections reference listings only. they never
  alter the design release, never affect pricing, and never
  introduce new searchable vocabulary; collection names are
  storefront presentation.
- discoverability: collections are shareable urls, appear on the
  storefront, and each collection page runs the same search filter
  layer scoped to its members.

### creator-page search filters

- what: etsy-style faceted search scoped to one creator's listings.
- implementation note: this is the closed facet taxonomy from search
  facets with a creator scope. same vocabularies (family, validated
  metals, price band, size range), no new facets, no
  creator-authored filter options. a buyer filtering "rings, silver,
  under $200" inside a shop is the same query as global search with
  an additional creator constraint.

## signal contract shape (for later implementation)

one engagement-event contract, with a visibility class per event:

- events: like_add, like_remove, list_create, list_add, list_share,
  wishlist_add, follow_creator, follow_aesthetic, follow_remove
- visibility classes: buyer-private (like, wishlist), public
  (list), aggregate-only (creator-facing counts)
- every event carries buyer trust class at aggregation time, never
  at event emission
- no free-text event payloads except list names, which are public
  by the list's own visibility, never identity-bearing

schema work is a later kiro task once this model is stable; this
document is the design it implements.

## status

design spec, not implemented. the audited lovable build has partial
follows/lists and a local-storage wishlist; the required-changes
list in [buyers](README.md) still applies. anti-gaming and buyer
trust references live in [creator integrity](../creator-integrity/solution.md).
