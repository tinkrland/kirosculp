# Financial operations

One coherent ledger and state model for:

- Purchase authorization and capture
- Two-way price calculation
- Creator earnings and payout
- Settlement allocation
- Refunds, reversals, and chargebacks

Current settings never rewrite historical orders. Every purchase stores the exact design release, quote, fee, earnings, currency, and policy versions used at checkout.

## Prototype plan

[`mock-finance-flow.md`](mock-finance-flow.md) specifies the Spree checkout spike, local Stripe-compatible payment mock, Supabase ledger buckets, state transitions, reconciliation, and failure tests. It is a design, not an installed or production-ready integration.

## Audited application state

Checkout can insert order rows, client pricing helpers exist, and creator payout settings have UI. Payment capture, route-aware authoritative pricing, settlement ledger, refunds, chargebacks, provider payouts, and reconciliation are not implemented. See the [complete source audit](../../docs/current-state-audit.md) and each financial subfolder for exact source references.
