# Platform: discoverability

Discovery is earned by published listings and explicit eligibility or curation rules. Creating a creator account alone never places someone on the homepage or in search promotion.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura.dev/src/pages/Home.jsx`
- `Explore.jsx`
- `CollectionPage.jsx`
- `sculptura.dev/src/components/home/FeaturedArtifacts.jsx`
- `sculptura.dev/src/components/explore/StoreGrid.jsx`
- Follow and list components

### What exists now

- Browse, featured, collection, creator-follow, and recommendation surfaces exist. Some rankings and recommendations are static or simple database reads.

### Required changes

- Define explicit eligibility, ranking, moderation, curation, and search signals.
- Ensure account creation alone never grants homepage or marketplace prominence.
- Record why an item was eligible and ranked.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
