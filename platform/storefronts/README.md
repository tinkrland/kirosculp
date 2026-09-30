# platform: storefronts

sculptura-hosted and white-label storefront presentation, including collections, profile content, brand settings, and connected sales channels. sculptura remains the source of truth for design releases and fulfillment state.

## publication and analytics policy

publishing a hosted or white-label storefront requires a private phone number
on file and verified email. this is separate from invitation-based creator
admission and provider-handled payout kyc; see
[creator integrity](../creator-integrity/solution.md).

[umami is the primary telemetry and default creator analytics](analytics.md).
creators may optionally connect their own google analytics configuration for
their storefront, without replacing platform telemetry or injecting arbitrary
scripts into protected surfaces. these requirements are specified, not implemented.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/ShopProfile.jsx`](../../what-exists/lovable/src/pages/ShopProfile.jsx)
- [`ShopArtifactBySlug.jsx`](../../what-exists/lovable/src/pages/ShopArtifactBySlug.jsx)
- [`sculptura.dev/src/components/shop/*`](../../what-exists/lovable/src/components/shop)
- [`sculptura.dev/src/components/market/mystore/*`](../../what-exists/lovable/src/components/market/mystore)
- [`sculptura.dev/src/components/market/sections/CollectionsSection.jsx`](../../what-exists/lovable/src/components/market/sections/CollectionsSection.jsx)

### what exists now

- public shops, product routes, collections, appearance, content, social links, newsletters, promo-code display, waitlists, and tips have ui or partial persistence.

### required changes

- separate public fields from private account configuration.
- add channel and white-label contracts.
- validate promo, newsletter, waitlist, and tip behaviors server-side before treating them as operational features.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
