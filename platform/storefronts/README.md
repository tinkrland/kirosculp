# platform: storefronts

sculptura-hosted and white-label storefront presentation, including collections, profile content, brand settings, and connected sales channels. sculptura remains the source of truth for design releases and fulfillment state.

## public surfaces and the placeholder domain

sculptura does not have its final tld yet. `sculptura.dev` is the
placeholder used across docs for whichever tld is acquired; every
`*.sculptura.dev` subdomain below inherits that placeholder.

| surface | lives at | belongs to |
|---|---|---|
| storefront | `sculptura.dev/@shopname` | the shop handle (e.g. mahika's shop is `@divajewels`) |
| artist profile | `artists.sculptura.dev/@artistname` | the artist's name handle (e.g. `artists.sculptura.dev/@mahika`) |
| artist login | `artists.sculptura.dev/login` | the artist account |
| buyer surface | `customer.sculptura.dev` | the buyer account |

the artist name and the shop handle are two different handles in two
independent namespaces on two different surfaces: changing one never
changes the other, and neither is derived from the immutable backend
ids. the artist account and the shop are separate objects, currently
connected; see
[creator access](../creator-access.md) and the
[identity model](../identity-model.md).

## publication and analytics policy

publishing a hosted or white-label storefront requires a private verified phone number
and allowed verified email. this is separate from invitation-based creator
admission and provider-handled payout kyc; see
[creator integrity](../creator-integrity/solution.md).

[umami is the primary telemetry and default creator analytics](analytics.md).
creators may optionally connect their own google analytics configuration for
their storefront, without replacing platform telemetry or injecting arbitrary
scripts into protected surfaces. these requirements are specified, not implemented.

## public language and later creative flexibility

storefront language and content are independent of the creator's
[private dashboard preferences](../../console/creators/dashboard-preferences.md).
a french dashboard does not require a french storefront or expose the
creator's regional dashboard selector to customers.

[creator-made storefront flexibility](creative-flexibility.md) is a later
v3/v5 direction, using showkit-for-shopify flexibility as a reference rather
than integrating showkit itself. editor architecture and exact capabilities
remain to be specified.

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
