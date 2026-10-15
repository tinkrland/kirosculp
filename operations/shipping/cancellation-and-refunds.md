# cancellation and refunds

buyer-side money rules for catalog buy-now orders. terminology is policy
here, not preference: a **cancellation** voids an order that never produced
anything; a **refund** reverses money for something that was produced. the
two are never conflated in records, reason codes, or support language.

the ledger treats both as first-class money operations under the operations
ledger rules: append-only entries, the refund liability account, compensating
balanced postings, idempotent lifecycle transitions.

## cancellation (before production)

- **submitted, not yet accepted**: full void. nothing has been committed, no
  fee is charged, the whole payment returns.
- **accepted, production not started**: cancellation. the payment returns
  **minus payment processing fees actually incurred**. the processor fee is
  sunk on our side the moment the card is charged, and a buyer-initiated
  cancellation does not eat it. the platform's own fee is waived entirely:
  nothing was sold, so nothing is owed to us.
- **production started**: no cancellation. the recorded manufacturer intake
  event (the glue-api order-card acceptance state) is the hard, provable
  boundary, not a judgment call. from that event the order stands and only
  the damage rules below apply.

the returned amount is shown to the buyer before they confirm the
cancellation, so consent happens before money moves.

## refunds (damage only)

house ruling (october 2026): **no refunds on catalog buy-now orders unless
the item arrives damaged.** no buyer's-remorse refunds, no returns on
standard-size pieces beyond the legal minimum.

- the legal floor stays underneath the house policy per market: distance
  selling law (notably eu and uk withdrawal windows) may reach standard-size
  catalog pieces because the custom-goods exemption is narrower than
  commonly assumed. the policy is the house rule everywhere law permits;
  per-market review decides where it does not.
- **damaged in transit** (carrier fault): the insurance claim path pays;
  the buyer is made whole including fees, replace or refund at the buyer's
  choice.
- **damaged in production or wrong piece made** (manufacturer or creator
  fault): the platform refunds or replaces and still pays the creator, who
  shipped correct work.
- **unverifiable buyer-side damage claims** are decided on the evidence pack:
  dispatch photos from the release chain and studiogram capture provenance,
  sealed weight at handover, signature records. a physical return of precious
  material is not a refund until it comes back sealed, insured, and
  weight-checked against the dispatch record (dpms swap risk).
- refunds go back on the original payment rail to the original account.
  never to a different account, never to a different rail. requests to
  redirect are needs_review at best, never a routine option.

## commissions are separate

commission orders keep their own escrow dispute state machine (see
[buildplan/platform/commissions.md](../../buildplan/platform/commissions.md)).
the damage-only ruling does not reach commission money; commission
cancellation fees, if any, are commission-leg questions.

## chargebacks

a chargeback is a dispute over the payment, not our refund decision. the
deterministic records (release chain, dispatch photos, signed delivery)
are the evidence we submit. a lost chargeback unwinds the money through the
same compensating postings; it never bypasses the ledger.

## open items

- per-market legal floor review (which markets force withdrawal windows on
  standard-size pieces, and for how long the refund liability account must
  hold for them).
- replace-vs-refund default if the buyer does not choose.
- whether the cancellation processing-fee deduction is itemized to the
  buyer by reason code, and what the reason codes are.
- post-payout unwind: a confirmed refund after a payout ran drives the
  creator ledger negative and accrues against future earnings, same pattern
  as stranded funds, no auto-debit. exact ledger entries pending the
  payoutrails leg.
