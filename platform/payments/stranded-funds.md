# stranded funds policy (zombie wallets)

a stranded fund is a creator balance we hold but cannot legally pay
out, because the creator never completed or failed payout verification
(kyc). the money still belongs to the creator. this is a custodial
liability problem, not a revenue opportunity, and this document sets
the posture for it.

## wallet currency model

working assumption (confirm before implementation): creator wallets are
held in a base currency set, usd and eur, not in every native currency.
native-currency delivery happens at payout time through the rail
adapters: the rail converts from the base wallet at its spread, or pays
out in usd/eur where the rail and the creator's bank support it.

creators in volatile-currency markets (tr is the canonical example)
can prefer being paid in usd or eur. payoneer natively supports holding
usd/eur balances and converting at a moment of the creator's choosing,
which fits this without us building try (or any native) wallets. a
creator-chosen payout currency preference rides on the payout-account
profile; the wallet side stays in the base set.

this also keeps the accounting and escheatment story tractable: a small
number of liability currencies to consolidate and file, and the formance
ledger decision already gives us the place to model wallets as
liability accounts.

## why zombies exist

listing is intentionally allowed before payout verification: admission
and publication gates (verified email, verified phone) are cheaper than
kyc, so creators can build a shop and make sales before proving payout
identity. that design choice guarantees some creators will fail or
abandon verification while holding a balance. we cannot pay them
without id (that is the point of the gate), and we cannot keep the money
as ours. it is theirs, stranded.

## prevention

- prompt payout onboarding at the first sale, not only when the balance
  crosses the configured threshold. the earlier the prompt, the shorter
  the dwell time between earning and verifying, and the fewer zombies.
  the threshold prompt stays as the escalation step.
- reminders at escalating intervals once a balance is unpayable.
- conversion of the onboarding flow itself matters as much as policy:
  most zombies come from people who never intended to finish kyc.

## classification

- **micro-balance abandoned**: below the configured threshold, creator
  inactive. track as liability, remind, eventually escheat.
- **kyc-failed, live creator**: re-attempt prompts, extended hold. the
  creator can still fix it; this is an onboarding recovery case first.
- **fraud-flagged**: held outside the normal dormancy flow while under
  investigation. flagged balances often shrink on their own via
  chargebacks and order reversals. never escheat a balance that is
  under an open dispute or investigation.

## dormancy, outreach, and escheatment

- dormancy clock starts from the creator's last activity (login,
  action, or contact attempt response), not from the balance date.
- outreach cadence, working proposal: reminders at 6 and 12 months,
  final notice at 24 months, filing after the market's legal dormancy
  period. us state unclaimed-property law runs roughly 3 to 7 years of
  dormancy depending on the state, and the periods differ per market.
- the ToS can set communications and re-prompt mechanics, but no
  abandonment clause overrides escheatment law. we never quietly
  convert stranded funds to revenue.
- the immutable release chain and tune-log streams are the evidence
  trail for a filing: no-record-edited-since-anchor-time claims apply.

## accounting and audit

- stranded balances are custodial liabilities, never revenue, never
  income recognition events.
- periodic review of the stranded-balance liability as part of normal
  financial ops, with counts and amounts by classification and market
  (internal only; never a public metric).

## open questions

- threshold value resolved october 2026: first payout usd 50 /
  eur 50, subsequent payouts usd 25 / eur 25. parameterize the prompts
  on the two-level rule.
- per-market dormancy tables: a legal pass per active market, later.
- de minimis handling: whether a below-de-minimis balance can be
  waived or donated with consent, state by state. counsel question,
  parked.
- whether fraud-flagged balances ever expire: currently indefinite
  hold pending investigation; revisit with the dispute-evidence
  hash-chain design.
