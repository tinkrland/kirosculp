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

the 1.1.0 line_existence axis is adapter-only: the numbering plan says
what a range is for, never whether a specific number has a subscriber,
so the offline core always reports unknown and only a carrier adapter
moves it. the gate's reading: a disconfirmed line is a correction
question (the number cannot receive the otp anyway), and a stale
existence report is skipped with its limitation, never trusted; number
reassignment means no permanent verdicts. existence is an earlier-
friction signal, not a second gate, because otp delivery is itself the
check.

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

the 0.3.0 address_existence axis is adapter-only: no local pattern
engine has a delivery-point registry, so existence is a distinct
finding from format validity and from every shape class, and the
offline core always reports unknown. the gate's reading: a delivery
point the validation source does not recognize (the unit-f case:
format-valid, shape-clean, disconfirmed) blocks at submit time on
deliverability and evidence-chain grounds, not aml suspicion, with
the finding's staleness and coverage limitations carried on the
record. unknown stays unknown: no adapter means existence was never
checked, never a street-address confirmation. the usps dpv cmra
indicator, when wired, is the strongest counter to street-style cmra
addresses, which local patterns provably cannot catch; until then the
honest non-coverage line in the shipping rules stands.

## adapters to build

the existence axes and the cmra counter are why adapters get built at
all. the tells' own contracts set the constraint: external
intelligence declares its data exposure, and adapters wanting more
than the minimum do not get wired in. themailtell is domain_only,
thephonetell is number_only, thelocaletell is address_only: no
recipient names, no usage history, no full addresses shipped to third
parties beyond the validation call itself.

- **themailtell: no paid adapter for v1.** mx resolution is
  dns-over-https (cloudflare, keyless), disposable and relay lists
  are community or published data, and the two-route eligibility rule
  does not need mailbox pings. full-address mailbox-existence
  checkers exist but leak the entire address and stay out.
- **thephonetell carrier adapter.** twilio lookup v2 line type
  intelligence (docs verified by the tell, 2026-10-08): line types
  including fixed and non-fixed voip, number-only exposure, feeding
  the declared-comparison and the line-type signals. the
  line_existence axis needs a live/in-service check (an hlr-class
  product): verify the chosen provider's exact product at wiring
  time, and treat numverify/numlookup free tiers as research aids,
  never production adapters. keys: one carrier-lookup credential,
  per-lookup priced.
- **thelocaletell delivery-point adapter, per-market rollout.** us
  first: a cass-certified chain with dpv confirmation, the dpv cmra
  indicator and the business/residential indicator (smarty, melissa
  and lob are candidates; smarty has a usable free tier). google
  address validation covers many markets unit-level and is the
  global fallback. national postal apis (royal mail paf, canada
  post address complete, australia post, postnl, swiss post) join as
  their markets go live per the shipping locale cohorts. keys: a us
  validation credential, a google maps platform key, postal api keys
  as markets activate.
- **dev and demo mode runs adapterless.** every gate accepts the
  honest unknowns: missing adapters degrade to unknown, never to
  pretend coverage, and gate behavior on unknown is specified above.
  production wiring is a market-by-market decision, not a launch
  blocker.

## maturity line

all three tells are reference implementations: unverified seed rows
produce only suggestive signals, and the fixture corpora are not
authorized production evidence. that is acceptable for demo-mode and
gate development, because the boundary keeps the consequences local:
conservative handling of suggestive evidence, human review instead of
automated punishment, and no coverage claim the tables cannot back.
production gating waits on verified tables, not on new architecture.
