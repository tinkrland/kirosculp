# platform: storefronts

sculptura-hosted and white-label storefront presentation, including collections, profile content, brand settings, and connected sales channels. sculptura remains the source of truth for design releases and fulfillment state.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura.dev/src/pages/ShopProfile.jsx`
- `ShopArtifactBySlug.jsx`
- `sculptura.dev/src/components/shop/*`
- `sculptura.dev/src/components/market/mystore/*`
- `sculptura.dev/src/components/market/sections/CollectionsSection.jsx`

### what exists now

- Public shops, product routes, collections, appearance, content, social links, newsletters, promo-code display, waitlists, and tips have UI or partial persistence.

### required changes

- Separate public fields from private account configuration.
- Add channel and white-label contracts.
- Validate promo, newsletter, waitlist, and tip behaviors server-side before treating them as operational features.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
