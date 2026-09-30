# financial operations

one coherent ledger and state model for:

- purchase authorization and capture
- two-way price calculation
- creator earnings and payout
- settlement allocation
- refunds, reversals, and chargebacks

current settings never rewrite historical orders. every purchase stores the exact design release, quote, fee, earnings, currency, and policy versions used at checkout.

## withdrawal and merchant research

[the payout and merchant model](payout-and-merchant-model.md) distinguishes
accrued wallet earnings from withdrawable provider funds, individual creators
from incorporated entities, and payment processing from merchant responsibility.
paddle is unsuitable for physical jewelry checkout; stripe connect remains the
intended production provider, subject to the existing prototype sequencing.

## prototype plan

[`mock-finance-flow.md`](mock-finance-flow.md) specifies the spree checkout spike, local stripe-compatible payment mock, supabase ledger buckets, state transitions, reconciliation, and failure tests. it is a design, not an installed or production-ready integration.

## audited application state

checkout can insert order rows, client pricing helpers exist, and creator payout settings have ui. payment capture, route-aware authoritative pricing, settlement ledger, refunds, chargebacks, provider payouts, and reconciliation are not implemented. see the [complete source audit](../../docs/current-state-audit.md) and each financial subfolder for exact source references.
