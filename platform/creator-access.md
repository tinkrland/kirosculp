# creator access: human-operated profiles

creator profiles belong to people. tessa is built into the studio; admission
is not an ai-assisted versus non-ai distinction. autonomous agents farming
accounts, dumping reference urls and mass-publishing dropshipping listings
are the excluded case.

vgen-style invitations gate creator privileges, not ordinary buyer access.
admission has two paths: an invite code, or signing up and waiting for
manual review. issuer eligibility and application/review mechanics
remain open. no invitation automatically grants publication, discovery
or commission availability.

invite codes are five alphanumeric characters, randomly generated and
single-use, redeemable by exactly one artist. the code itself encodes
nothing about the issuer or the redeemer: admission lineage (who was
authorized to issue each invite, who redeemed it, whom the admitted
creator goes on to invite) lives in the issuance record server-side,
never in the code. internal meaning, proposed and not yet ratified:
one cohort character encoding the issuance year-quarter (at-a-glance
vintage and stale-code spotting), three random characters from a
confusable-free alphabet (no 0/o, 1/i/l), and one trailing checksum
character over the first four, so a mistyped code fails before it
touches the redemption store and the endpoint can rate-limit on
checksum validity rather than database hits.

## the artist account and its scope

artist signup requires more than the buyer flow: an invite code, plus
the gates below. the two words are not synonyms: an artist is the
person with the ideas; a creator is the artist with marketplace
entry. sculptura makes artists into creators: the invite (or manual
review) admits an artist, and the gates below are what turn that
artist into a creator. the artist account is not the shop: the shop
is a separate handle and storefront object, currently connected to
the artist. the account has entry to:

- their studio (the design engine, releases) and inspo collection
  (artist-account feature, separate from buyer lists, which belong
  to buyer accounts) from admission onward
- their console (marketplace management: listings, orders,
  payouts) only once they are a creator

the creator state is a step, not a badge: the next stage in the
artist-to-creator progression, earned by clearing the gates. it
carries capability weight (console access), which keeps it
distinct from the cosmetic verification badges (verified email,
verified phone), which are earned markers only and never gate
anything.


## the separate gates

| gate | requirement |
|---|---|
| creator admission | accountable human operator, invitation-based access |
| storefront publication | verified phone number and allowed verified email |
| design release | creator approval and authoritative studio validation |
| discovery and commissions | their separate eligibility and opt-in rules |
| payout | provider-handled identity verification through stripe/persona, plus applicable payout conditions |

sculptura does not handle government-id verification itself. no upfront kyc
is imposed by this creator-admission policy; payout kyc is not removed.
voip numbers are allowed with an explicit voip toggle and successful verification.

## creator-facing explanation

> creator profiles are for people. tessa is your built-in design tool, not an
> autonomous account operator. creator access is by invitation. to publish
> your storefront, verify your phone number and email. declare voip numbers
> using the voip toggle. identity checks
> for payout are handled through our payout/verification providers, not by
> sculptura collecting government-id documents at signup.

## implementation reference

this is specified policy, not proof of implementation. the rationale and
controls live in [creator integrity: problem](creator-integrity/problem.md)
and [creator integrity: solution](creator-integrity/solution.md).

see [creator flow](../studio/creators/README.md),
[creator surfaces](../buildplan/platform/creator-surfaces.md),
[storefronts](storefronts/README.md), [analytics](storefronts/analytics.md), and
[byok](../studio/design-agent/byok.md). platform owns admission; studio
consumes authorized creator identity and owns geometry.
