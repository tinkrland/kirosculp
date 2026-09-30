# storefront analytics: umami first, creator-owned analytics optional

owner decision: umami is sculptura's primary product telemetry and the default
analytics offered to creators. creators may also bring their own google
analytics configuration, in a redbubble-like storefront analytics model.
this is a specification, not an installed or verified integration.

## default: umami

- platform-managed umami powers primary traffic and engagement telemetry.
- creator reporting exposes a tenant-scoped view of that creator's storefront
  data, not access to other creators or platform-wide analytics.
- analytics views are separate from financial reporting: orders, settlement,
  refunds and earnings remain authoritative in their domain records/ledger.
- umami does not replace security audit events or operational failure logs.

## optional: bring your own google analytics

- creators can configure their own google analytics destination for their
  storefront; it supplements umami rather than replacing platform telemetry.
- use a validated configuration field, not arbitrary javascript/html injection.
- scope the integration to the owning creator's public storefront routes and
  explicitly associated listing routes, not checkout, studio, console, admin,
  other storefronts or private buyer/commission pages.
- changing or disconnecting the creator destination cannot alter orders,
  creator admission, storefront publication eligibility or primary telemetry.
- consent, disclosure and regional tracking rules must be designed for both
  integrations; no assumption that either vendor automatically makes the flow
  compliant or that optional google analytics can bypass visitor choices.

## event and data boundaries

use allowlisted event names and properties. do not send phone numbers, email,
commission briefs, invite tokens, identity documents or payout data to either
analytics service. sanitize page urls, query strings and referrers before
recording events; secret-bearing links are not analytics input.

checkout conversions, if provided, need a separate sanitized event contract,
not creator script access to checkout or trusted financial calculations.

## acceptance and open work

- no custom destination configured: creator still receives umami reporting.
- configured destination: only the owner's allowed storefront events route to it.
- one creator cannot read another creator's analytics or modify their destination.
- invalid configuration and arbitrary scripts are rejected.
- sensitive event fields and secret-bearing urls are stripped/rejected.
- disabling google analytics leaves platform-managed umami configuration intact,
  subject to visitor consent and applicable tracking rules.

exact event catalog, deployment model, api/reporting integration, retention,
consent behavior and conversion reporting remain implementation decisions.

see [storefronts](README.md), [creator integrity](../creator-integrity/solution.md)
and [creator reporting](../../console/reporting/README.md).
