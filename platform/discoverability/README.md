# platform: discoverability

discovery is earned by published listings and explicit eligibility or curation rules. creating a creator account alone never places someone on the homepage or in search promotion.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/Home.jsx`](../../what-exists/lovable/src/pages/Home.jsx)
- [`Explore.jsx`](../../what-exists/lovable/src/pages/Explore.jsx)
- [`CollectionPage.jsx`](../../what-exists/lovable/src/pages/CollectionPage.jsx)
- [`sculptura.dev/src/components/home/FeaturedArtifacts.jsx`](../../what-exists/lovable/src/components/home/FeaturedArtifacts.jsx)
- [`sculptura.dev/src/components/explore/StoreGrid.jsx`](../../what-exists/lovable/src/components/explore/StoreGrid.jsx)
- follow and list components

### what exists now

- browse, featured, collection, creator-follow, and recommendation surfaces exist. some rankings and recommendations are static or simple database reads.

### required changes

- define explicit eligibility, ranking, moderation, curation, and search signals.
- ensure account creation alone never grants homepage or marketplace prominence.
- record why an item was eligible and ranked.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
