# future creator-made storefront flexibility

later-version direction: give creators substantial freedom over their own
sculptura storefront presentation, with the flexibility the user associates
with showkit for shopify as a design reference.

the planning horizon is v3/v5, not a locked release milestone. this is a
product ambition, not an implemented editor or a claim of verified feature
parity with another service.

## build our storefront capability, not a showkit integration

the reference concerns the freedom to make a creator-owned storefront feel
like their own site rather than every shop having the same rigid presentation.
showkit itself is not the integration target, dependency or required account.
shopify is the commerce reference.

editor mechanics, exact layout controls, themes, extension mechanisms and
feature-parity criteria remain to be specified. the reference does not by
itself authorize arbitrary creator javascript or a separate commerce backend.

[native sales channels](../../offerings/nativity/README.md) are a separate
platform concern. external commerce connections and an expressive sculptura
storefront editor must not be treated as the same feature.

## private workspace and public shop remain independent

[dashboard language, variant, currency, units and tone](../../console/creators/dashboard-preferences.md)
are private working preferences, not a public storefront preset. a creator can
work in an african french dashboard while choosing an english storefront.

future visual freedom does not automatically publish those private preferences,
reveal a creator's geographic location, or let a private tone setting rewrite
the public site.

## presentation freedom does not replace product authority

platform owns storefronts, listings, sales and commission presentation. studio
alone owns geometry generation and validation, and a versioned design release
crosses that boundary only after authoritative server-side headless openscad
validation. a storefront builder must consume that release-bound offering,
not become another design engine.

custom presentation cannot override trusted pricing, manufacture eligibility,
commission terms of record, payment protection, or order/fulfillment state.
the ordinary listing's fixed-net/fixed-retail model remains unchanged.

creator-owned analytics retain the [existing scoped analytics contract](analytics.md):
optional google analytics supplements umami and does not grant script access
to checkout, studio, console, private buyer data or other creators' storefronts.

see [storefront overview](README.md), [creator tools](../creators/README.md), and
[creator dashboard preferences](../../console/creators/dashboard-preferences.md).

## candidate editor: nordcraft (candidate, not commitment)

nordcraft (github.com/nordcraftengine/nordcraft, apache 2.0 framework
and runtime, self-hostable) is the current candidate for the
storefront editor mechanics this page leaves unspecified. it is a
visual website builder for creative studios: component-based, full
css control, git-like versioning with branches and previews, ships
with an ai agent, deploys anywhere. apache 2.0 keeps the direction
portable: self-host, fork if the vendor pivots.

if adopted, the standing rules apply to it unchanged:

- a freedom ladder, not a single mode: most creators pick themes and
  tweak tokens (color, type, layout blocks); the full editor is for
  the ambitious few, and never required to have a storefront.
- the editor styles the storefront surface only. checkout and purchase
  requests are built and validated server-side at submit time; the
  deny-by-default market files and route validation are never
  rendered or influenced by creator-controlled code. this stays
  within the existing rule that this page authorizes no arbitrary
  creator javascript in the money path.
- the editor binds to the shop object (one nordcraft project per
  storefront, per sin), never to the artist account, preserving the
  multi-storefront shape.
