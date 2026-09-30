# creator access: people, with ai assistance

owner direction, 2026-09-30: creators must be people. autonomous agents
must not create or farm creator accounts to consume free platform inference.
this is a target policy and onboarding specification, not an implemented gate.

## the identity boundary

a creator account has an accountable human operator. tessa, byok models and
other tools may assist that person; they are not the account holder. using ai
does not disqualify a creator, and this policy makes no claim that their work
must be entirely handmade or free of ai assistance.

prohibited behavior includes autonomous creator signup, fabricated creator
identities, automated invite redemption and account multiplication to evade
inference or compile quotas. permitted automation for an existing human-owned
account, if offered, uses scoped authorization and the same quotas; it cannot
create additional identities, mint invites or enlarge the free allowance.

## invite explanation: ready-to-use copy

> this invitation is for you, the person making the work. ai tools can help
> you design, but creator accounts must be operated by people. automated
> signup, bot-run accounts and creating extra accounts to collect free studio
> allowances are not allowed. an invitation gives you access to onboarding,
> not automatic publication, marketplace placement or commission availability.

## invitation mechanics, if invitations are used

invitations are an onboarding control, not proof of personhood. universal
invite-only signup, open registration and invite-issuer eligibility remain
undecided; do not silently turn this policy into a closed marketplace.

- mint invitations server-side with opaque, high-entropy tokens; store token
  digests rather than plaintext tokens. support expiry and revocation.
- bind redemption to an authenticated account with verified contact ownership;
  recipient-bound invitations must also match the intended recipient.
- enforce one-time redemption atomically. repeated requests return the existing
  outcome instead of creating another creator or granting another allowance.
- acceptance records the human-operator policy version and timestamp. an
  unchecked browser checkbox is not a server authorization boundary.
- rate-limit issue, redemption and creator activation. scope issuer powers;
  owning a creator account does not automatically authorize unlimited invites.
- an invitation never grants admin rights, commissions, discovery eligibility
  or an extra free-inference allocation. creator activation is distinct from
  published listings and the optional commissions toggle.

## enforcement beyond an invitation

verified email, an attestation or a bot challenge alone cannot establish that
an account is human-operated. combine server-enforced quotas and activation
controls with account-farming signals and targeted review. do not promise a
bot-proof system or treat shared devices/networks as conclusive abuse.

free allocations are issued once under the eligible creator identity and
configured allowance period, never once per invite or api credential. exact
identity deduplication, thresholds and challenge/review provider are open
implementation decisions. byok does not exempt callers from platform compute
quotas, identity rules or abuse controls.

suspected automation may pause activation or promotional allowances pending
review. provide an accessible review route for legitimate creators, and
record review decisions without exposing private identity evidence publicly.
this policy does not mandate government-id collection or move payout kyc to
signup; existing provider and legal obligations remain separate.

## implementation acceptance

- concurrent redemption cannot create two creators or duplicate a grant.
- expired, revoked and recipient-mismatched invites are rejected.
- changing a key or redeeming another invite cannot reset an allowance.
- protected onboarding and quota endpoints enforce policy server-side.
- a human can use tessa or byok without being labeled an autonomous creator.
- false-positive cases have a review path; missing controls are not called done.

see [creator flow](../studio/creators/README.md),
[creator surfaces](../buildplan/platform/creator-surfaces.md), and
[byok](../studio/design-agent/byok.md). platform owns account admission;
studio consumes authorized creator identity and owns geometry.
