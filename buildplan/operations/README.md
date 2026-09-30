# operations leg

this leg prototypes the money flow locally before any real payment provider is involved, per the drafted [mock finance flow](../../operations/financial/mock-finance-flow.md).

## steps

1. **server quote:** a trusted price for a release-bound purchase request: manufacturing cost from partner quotes, platform fees, taxes, shipping, and the two-way pricing equation. the platform never computes this.
2. **local commerce spike:** spree commerce as the local storefront/order engine with fetchsandbox (a stripe connect-capable mock) for payment behavior. validate fetchsandbox's actual api coverage against the flow before trusting it; localstripe remains the fallback mock if a needed endpoint is missing.
3. **ledger allocations:** supabase as the authoritative record: order, processing costs, creator earnings, reserve, refund liability as append-only journal entries with balanced postings. formance ledger is a later evaluation, never a second source of truth.
4. **lifecycle states:** paid, in production, delivered, refunded, disputed: each state a recorded event with money implications, idempotent transitions.
5. **reversals and reconciliation:** refund and chargeback flows that produce compensating journal entries, and a reconciliation check that balances against the mock provider.
6. **payout gating:** creator earnings released only after the applicable delivery/claim window, with identity verification handled through stripe/persona when the creator takes a payout, not by sculptura collecting identity documents. the existing $20/€20 payout minimum remains a separate condition. provider/legal requirements may force earlier verification; creator admission and storefront publication do not impose upfront kyc. see [the gate separation](../../platform/creator-integrity/solution.md).

## banking consideration (still deciding)

the business banking layer under the commerce prototype has two candidates, and nothing is decided yet:

- **mercury.com + waveapps.com:** mercury as the business banking account, wave for accounting. plaid would sync both with the spree commerce setup's money records.
- **getholdings.com:** one connected account combining banking, invoicing, and books, positioned as runnable by an ai assistant; also reachable through plaid.

either way, plaid is the sync bridge into the local spree prototype, and the supabase journal remains the authoritative ledger regardless of which banking provider is chosen. mercury also now ships its own built-in accounting (mercury books), which is a third shape of the same question and gets evaluated alongside the two candidates. selection criteria: plaid coverage, multi-entity friendliness, payout rail compatibility with the eventual stripe connect flow, fee structure at low volume, and how cleanly transaction data maps onto the ledger's allocation buckets.

stripe is the intended production provider, but only after this local prototype proves the state machine and the legal/payment model.

## waiting on

release-bound purchase requests from the [platform leg](../platform/README.md); real partner quotes from [manufacturing](../../manufacturing/README.md) research for trustworthy cost inputs (mock quotes stand in until then, explicitly labeled).

## hands over

eligible paid orders to [manufacturing](../../manufacturing/README.md) routing, and the superset analytics feed (pre-v1) for reporting.
