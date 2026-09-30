# creator access: human-operated profiles

creator profiles belong to people. tessa is built into the studio; admission
is not an ai-assisted versus non-ai distinction. autonomous agents farming
accounts, dumping reference urls and mass-publishing dropshipping listings
are the excluded case.

vgen-style invitations gate creator privileges, not ordinary buyer access.
issuer eligibility and application/review mechanics remain open. no invitation
automatically grants publication, discovery or commission availability.

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
