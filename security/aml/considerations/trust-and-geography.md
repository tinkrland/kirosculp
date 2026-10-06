# trust and geography: proxy versus signal

position: trust levels are behavior-only. no market, geography, or
corridor field may enter the trust computation or its schema. any
geography-derived input in the trust function is a defect, not a
tuning choice.

this page records why, so the reasoning survives contact with
implementation and future readers (including any vcs reviewer) can see
the design intent, not just the rule.

## proxy versus signal

geography is a proxy. observed behavior is the signal. when the direct
signal exists, injecting a noisy proxy adds variance that belongs to
the corridor's attacker economics into a function whose job is to
measure one account's conduct. that is worse modeling before any ethics
question is raised. the ethics and the engineering agree here.

## the feedback machine

geography-weighted trust self-manufactures its own evidence:

stricter checks in a region -> more false positives recorded there ->
false positives counted as confirmed fraud events -> the regional
stat "confirms" the region was risky -> stricter checks.

an observed regional fraud-rate difference is therefore not evidence
of resident character. it is an artifact of this loop plus attacker
economics (below). a modeler who notices the loop kills it for
accuracy reasons alone.

## attacker economics, not character

fraud follows the payoff landscape. a small fraudulent payoff is worth
more hours of a person's time where the local wage baseline is lower;
density and economic opportunity shape observed rates. the same
rational-actor calculus that makes a bangladeshi artist choosing
eur 90/hour legitimate explains the incentive gradient an attacker
faces. threat modeling models the incentive gradient and the target
surface, never the people who happen to live near it. assessing
creators or buyers against a western wage baseline, in either
direction, is out of bounds everywhere in the corpus (pricing,
earnings reporting, and trust alike).

## strict mode is a check surface, not a trust input

strict-mode markets (in, pk, bd) change which ip/device checks run at
the money moments: payout onboarding and payout requests. that is all
they change.

the reason strictness attaches to these corridors is a fact about
rails, not residents: payoneer-only corridors with thinner recourse
make the corridor a more attractive target to any rational bad actor
anywhere in the world. the target is the corridor, not the people in
it. two consequences:

- corridor strictness tracks rail maturity and is revisited when rails
  change. if a corridor's rails gain self-serve maturity or better
  recourse, its strictness relaxes with it, or it calcifies into
  exactly the de facto geography judgment this page prohibits.
- the [payout rails matrix](../../../operations/country-rollout/creator-payout-rails.md)
  carries aml tiers and holds per market; nothing in it is a trust
  input. it is compliance and routing data between the platform,
  providers and regulators.

## where geography legitimately remains

- payout rails and compliance records: provider capability, sanctions
  screening, aml tiers. a corridor-and-machine fact, not a human
  evaluation.
- routing and logistics: manufacturer assignment per order, shipping
  serviceability, customs territory. see
  [transaction and release controls](transaction-and-release-controls.md)
  for the control side and the operations shipping and rollout docs
  for the routing side.

nowhere a person is being scored may geography appear. public
surfaces already hide creator geography (the geographic-ambiguity and
anti-labor-arbitrage decisions); this page extends the same principle
to internal scoring. one principle, two surfaces: people are not
their geography.

## coherence with the rest of the corpus

- the anti-abuse hold ladder (first-payment hold, early-account
  high-profit hold, direct-url review windows) already triggers on
  account age and behavior, never market.
- [sourcing and privacy](sourcing-and-privacy.md) and
  [artist admission and payouts](admission-and-payouts.md) keep
  provider/legal location records separate from public creator
  surfaces, consistent with this position.
- the behavior-only rule is a design invariant for schema review:
  trust records must not carry market, geography or corridor fields,
  and review rejects any pull request that adds one.

back to [considerations](README.md).
