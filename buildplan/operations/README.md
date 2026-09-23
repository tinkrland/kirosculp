# operations leg

this leg prototypes the money flow locally before any real payment provider is involved, per the drafted [mock finance flow](../../operations/financial/mock-finance-flow.md).

## steps

1. **server quote:** a trusted price for a release-bound purchase request: manufacturing cost from partner quotes, platform fees, taxes, shipping, and the two-way pricing equation. the platform never computes this.
2. **local commerce spike:** spree commerce as the local storefront/order engine with fetchsandbox (a stripe connect-capable mock) for payment behavior. validate fetchsandbox's actual api coverage against the flow before trusting it; localstripe remains the fallback mock if a needed endpoint is missing.
3. **ledger allocations:** supabase as the authoritative record: order, processing costs, creator earnings, reserve, refund liability as append-only journal entries with balanced postings. formance ledger is a later evaluation, never a second source of truth.
4. **lifecycle states:** paid, in production, delivered, refunded, disputed: each state a recorded event with money implications, idempotent transitions.
5. **reversals and reconciliation:** refund and chargeback flows that produce compensating journal entries, and a reconciliation check that balances against the mock provider.
6. **payout gating:** creator earnings released only after the applicable delivery/claim window, with kyc deferred until the $20/€20 payout threshold per the existing product decision.

stripe is the intended production provider, but only after this local prototype proves the state machine and the legal/payment model.

## waiting on

release-bound purchase requests from the [platform leg](../platform/README.md); real partner quotes from [manufacturing](../../manufacturing/README.md) research for trustworthy cost inputs (mock quotes stand in until then, explicitly labeled).

## hands over

eligible paid orders to [manufacturing](../../manufacturing/README.md) routing, and the superset analytics feed (pre-v1) for reporting.
