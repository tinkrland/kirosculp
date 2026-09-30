# solution: human creator admission and accountable publication

this is a target policy and implementation specification, not a claim that
these controls are already implemented. addresses [the problem](problem.md).

## creator admission

use vgen-style invitation-based creator admission. the gate concerns who
operates the profile, not whether their work uses ai. tessa is built in.

- buyer registration remains separate from creator privileges.
- an invitation admits an accountable person into the creator flow.
- invitations do not grant publication, discovery or commission availability.
- invite issuance and the application/review route remain to be specified.

## storefront publication: contact gate

before publishing a storefront, require both:

- a phone number on file in private account configuration.
- an email address whose ownership has been verified.

enforce this server-side on every storefront publication path, including
hosted and white-label activation. a browser flag cannot satisfy the gate.
these contacts must not leak through public creator/storefront projections.

phone ownership verification is not a settled requirement: the current rule
is a phone number on file, not an invented sms or government-id requirement.
contact-change handling and rechecking an already published store need design.

## payout: provider-handled kyc

no upfront government-id verification is required for creator admission or
storefront publication. when the creator takes a payout, identity verification
is handled through stripe/persona, not by sculptura collecting and reviewing
identity documents. this is not a promise that payouts need no kyc.

sculptura integrates the provider flow and checks trusted eligibility/status
before executing payout; it does not build its own document-verification service.
keep provider identifiers and necessary status records private, with no raw
identity documents in the creator profile. the exact stripe/persona integration
and provider-required timing remain implementation work. existing payout
minimums and delivery/claim windows remain separate eligibility conditions;
provider/legal requirements may require earlier verification.

see [payments](../payments/README.md) and
[operations payout sequencing](../../buildplan/operations/README.md).

## human direction

the person directs the project, reviews the design and approves its release
and publication. tessa proposes parameter changes; paracraft owns geometry
and validation. an autonomous agent cannot hold a creator profile or run an
independent reference-to-listing pipeline. automated approval clicks alone
are not evidence of human operation.

## invitation and abuse controls

- issue opaque high-entropy invite tokens server-side; store digests, support
  expiry/revocation and enforce recipient binding when applicable.
- redeem once, atomically, under authenticated identity; retries cannot create
  additional creators or duplicate grants.
- scope issuer authority and record the accepted creator-policy version.
- enforce account, inference, compile and publication limits server-side.
- extra invites, accounts or changed keys cannot multiply promotional allowances.
- use account-farming and publication signals to trigger review, not to judge
  artistic quality automatically. shared networks alone are not proof of abuse.
- provide review for false positives; established autonomous operation may
  restrict or revoke creator privileges under the defined enforcement policy.

invitations, contact verification and rate limits are complementary controls,
not a guarantee of a bot-proof marketplace. byok does not bypass them.

## separate gates and ownership

creator admission, storefront contact eligibility, design validation,
publication, discovery, commission opt-in and payout verification are separate.
platform owns admission, publication controls and abuse review. studio owns
projects, geometry and validation. payout providers own identity verification.

## acceptance criteria

- redemption races, expired/revoked invites and recipient mismatch are tested.
- changing keys or redeeming another invite cannot reset a free allocation.
- storefront publication fails without a phone on file or verified email.
- neither contact field appears in public account/storefront projections.
- missing provider-required verification blocks payout, not creator admission.
- a pending/failed provider status cannot be overridden by a browser payload.
- human use of tessa is allowed; false-positive cases have a review path.
- skipped or deferred controls are not reported as implemented.

## open decisions

invite issuers, application requirements, abuse-review thresholds, appeals,
contact-change handling and the stripe/persona integration contract need design.

see [creator access](../creator-access.md),
[creator surfaces](../../buildplan/platform/creator-surfaces.md), and
[storefront analytics](../storefronts/analytics.md).
