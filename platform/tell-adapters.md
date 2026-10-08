# platform: consuming the tells

themailtell, thephonetell and thelocaletell are decoupled add-ons
living in [tinkrland/addsculp](https://github.com/tinkrland/addsculp),
one orphan branch each, standalone-extractable like paracraft. this
document is the boundary: how the platform consumes them without
letting them become gatekeepers.

the shared skeleton matters as much as the individual tells: all three
report evidence, never verdicts. signals carry strength (recognized,
suggestive, unresolved), provenance and coverage; unknown and
no-evidence-found are first-class results, never silently converted
into clean verdicts. the tells classify; sculptura decides.

## boundary rules

- **server-side only.** every tell call happens inside the platform's
  own validation chains (signup, publication gate, checkout submit).
  storefront javascript is untrusted per the nordcraft ruling, and
  no tell result is ever computed or trusted client-side.
- **one pattern, three consumers.** each integration is the same
  shape: input in, signals out, platform-owned verdict written to the
  gate record with the tell version, signal strengths and evidence
  refs attached, so gate decisions stay auditable when tell tables
  change.
- **strength thresholds are gate-owned.** recognized acts as
  gate-grade evidence. suggestive is never a silent clean pass and
  never an unexplained fail: it either blocks under an explicit
  aml-conservative rule, feeds needs_review, or asks the user a
  question, per gate below. unresolved and unknown are treated as
  unknown, never as confirmation.
- **no tell writes trust, identity or money state.** tell outputs are
  inputs to gates and queues. they never touch the trust computation
  (behavior-only, geography-free per the trust rulings) and never
  appear in payout or corridor records except as ordinary evidence
  refs in a needs_review.

## per-gate wiring

### themailtell: creator email eligibility

the two-route eligibility ruling stands: a verified dedicated inbox,
or apple oauth where the masked relay is acceptable. themailtell's
signals feed route selection: dedicated-mailbox evidence supports the
inbox route; disposable, forwarding-only and masked-relay evidence
routes the applicant to the apple oauth path or a human question.
unknown does not reject: address-level inbox classification is not
universally established, so unknown means the evidence is not yet
established, nothing more.

### thephonetell: phone publication gate

voip is allowed; the rule is honest declaration via the voip toggle.
thephonetell's declared-comparison (agree / disagree / unknown)
cross-checks the creator's declaration against line-type evidence.
agree: done. disagree: the creator is asked to correct the declaration;
never an auto-fail, never a trust input, never a fraud finding, since
voip use is legitimate privacy behavior. unknown: the declaration
stands as a declaration; the verification itself (otp) is the gate's
own step and stays the consumer's job.

### thelocaletell: checkout address gate

the dpms aml ruling bans three address-shape classes from buyer
delivery: po box equivalents, cmra and virtual-mailbox addresses, and
reshipping facilities. the ban is enforced at submit time with
machine-readable reason codes, aml-conservative on suggestive-or-better
evidence, with parcel lockers and carrier pickup points deliberately
not in the banned classes. the full rule lives in
[operations/shipping](../../operations/shipping/README.md). address
classes are not markets: this gate is destination-independent and
feeds no market or corridor decision.

## maturity line

all three tells are reference implementations: unverified seed rows
produce only suggestive signals, and the fixture corpora are not
authorized production evidence. that is acceptable for demo-mode and
gate development, because the boundary keeps the consequences local:
conservative handling of suggestive evidence, human review instead of
automated punishment, and no coverage claim the tables cannot back.
production gating waits on verified tables, not on new architecture.
