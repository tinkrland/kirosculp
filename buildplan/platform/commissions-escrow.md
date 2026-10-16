# commissions escrow: the money mechanics

companion to [commissions.md](commissions.md), which owns the
lifecycle and terms. this doc owns the money: how escrow funds,
holds, releases, refunds, and pays out for commissions. the
[payments model](../../platform/payments/README.md) holds unchanged:
append-only balanced ledger entries, integer cents, escrow hold
terms immutable after creation, only legal state transitions.

## where the money actually lives

correction to the older phrasing ("the supabase ledger holds the
commission value"): the ledger records; it never holds money.
the money is captured by the gateway (stripe) and sits in the
platform's stripe balance until release. the ledger is the
authoritative *record* of every movement; stripe is the custodian.
the bank (mercury) never holds commission escrow - company funds
only, per the banking ruling.

## funding models (creator terms select, platform enforces)

- **full-upfront (default)**: the buyer is charged the entire
  commission value at acceptance. milestones gate *release*, not
  funding. simplest protection: the money exists before work
  starts; the creator can never finish a milestone owed money.
- **deposit + balance (creator opt-in in their terms)**: deposit
  charged at acceptance; balance charged at a milestone named in the
  terms (e.g. design approval). if the balance charge fails, the
  cancellation ladder runs from the funded state. this model exists
  for buyers who balk at fronting large sums, but it shifts
  nonpayment risk onto the creator, which is why it is opt-in and
  the default is full-upfront.

the escrow hold: commission-scoped, terms immutable, opened at
acceptance. amounts split at opening into components from the
accepted terms: design fee, piece price (if the piece is
included), and the platform fee computed at acceptance.

## milestone releases (the core difference from listing orders)

listing orders release once (delivered/approved). commissions
release in stages, each its own balanced ledger group:

| milestone | releases | entry group |
|---|---|---|
| design approval | the design-fee component (creator labor) | escrow -> creator_payable + platform_fee |
| manufacture start | piece costs to the manufacturer path | escrow -> manufacturer_payable (+ platform fee on the piece per the fee split) |
| delivery + acceptance | the remaining piece component | escrow -> creator_payable + platform_fee |

- the state machine gains partial release: `held -> releasing ->
  released`, where `releasing` simply means some components have
  moved. every release is a separate balanced group; the hold is
  `released` when its balance drains to zero.
- **acceptance window (hypothesis, 7 days)**: after delivery
  tracking confirms, the buyer has the window to accept explicitly
  or raise a revision/dispute; silence auto-accepts and releases.
  revision requests pause the acceptance clock per the terms'
  revision policy.
- all releases land in the creator wallet's available balance;
  the physical payout follows the standing 15th schedule, never
  instant.

## fee treatment

- the platform fee is **computed and locked at acceptance** from
  the creator's tier at that moment; a tier change mid-commission
  never re-prices an in-flight commission (fee invariance extended
  to time).
- fee is collected proportionally at each release (design-fee fee
  at design approval, piece fee at the piece milestones), per the
  standard ladder and the two-way pricing model: fee applies to the
  labor component as a service and to the piece component per the
  trusted-pricing split.
- on cancellation, the platform fee on unreleased components is
  waived per the cancellation-and-refunds ruling; gateway
  processing costs are sunk.

## cancellation ladder (per cancellation-and-refunds.md)

- before design approval: refund everything captured minus sunk
  gateway processing costs.
- after design approval, before manufacture start: design fee is
  earned (released); piece refundable in full.
- after manufacture start: piece costs are sunk (metal bought,
  caster committed); refund rules follow the cancellation doc's
  manufactured-goods lines.
- refunds return to the original payment method, with the
  buyer-wallet exception path already ruled in the aml scenarios.
  every refund is a balanced ledger group; nothing is unwritten.

## disputes and chargebacks (why escrow exists)

- while a commission is in `disputed`, all pending releases freeze;
  only the dispute flow (state machine per commissions.md,
  platform-mediated over the retained record) moves money.
- card chargebacks mid-commission: the held, unreleased balance is
  the buffer. released components are the platform's chargeback
  exposure, bounded per commission by the milestone schedule - the
  design fee releases before the piece exists, so the exposure
  grows only as work demonstrably progresses.
- off-platform settlement offers no protection (standing rule); the
  escrow terms only govern money that moved through the hold.

## boundaries

- commission escrow holds are per-commission ledger objects,
  never commingled with listing-order segments even though both
  sit in the same stripe balance; reconciliation is per hold.
- no release without a completed milestone or a dispute resolution;
  no partial out-of-band settlement.
- buyer never funds a creator directly; all money moves through
  the hold. creators never see raw payment instruments.

## open rulings needed

1. acceptance window length (7 days hypothesized)
2. default funding model confirmed as full-upfront
3. fee lock at acceptance confirmed (vs fee at each release from
   the then-current tier)
