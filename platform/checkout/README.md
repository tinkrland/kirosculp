# platform: checkout

checkout accepts buyer selections and destination, asks operations for country eligibility and a trusted price, and creates the purchase through a server-side path. browser-supplied prices are never authoritative.

## buyer payment policy

no buy-now-pay-later services, including afterpay or klarna, and no buyer
payment installments are offered in the current release or near-future plan.
configure the allowed method list on the server and at the provider; hiding
buttons alone is not enforcement. this does not change commission escrow or
creator payout scheduling, which are separate financial concerns.

## allowed buyer payment methods (ruled 2026-10-16)

- **card** (stripe; link enabled for fast checkout)
- **paypal**, **venmo**, **cash app pay** (all via stripe)
- **apple pay** (stripe)
- **google pay** (stripe)
- **buyer wallet credit** (gift cards dissolve into the wallet at
  redemption; wallet balances pay at checkout, expiry-first)

architectural constraint: the multi-store escrow model is one
charge now, then per-creator-segment transfers held in the stripe
balance until the 15th payout. every buyer payment method must
therefore settle into the **stripe balance**. all methods above do,
because they are stripe payment methods at checkout. **amazon pay
does not**: it settles to the bank account outside stripe, which
would break the escrow-per-segment flow (the platform would have
to fund escrow from its own reserves, adding float risk and
mismatched refund mechanics). amazon pay is out unless that changes;
it is also a separate integration with declining usage, so it fails
the cost test too.

explicitly out, in addition to bnpl: crypto (escrow/refund/
compliance mismatch, mercury-adjacent risk stance), buyer-side ach
transfer (slow returns risk for high-aov orders), and
international wallets (ideal, sepa, bancontact, alipay) until the
market expansion makes them relevant. click-to-pay arrives free
with the card rails.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/Checkout.jsx`](../../what-exists/lovable/src/pages/Checkout.jsx)
- [`sculptura.dev/src/lib/cartStore.js`](../../what-exists/lovable/src/lib/cartStore.js)
- [`sculptura.dev/supabase/functions/place-order/index.ts`](../../what-exists/lovable/supabase/functions/place-order/index.ts)
- orders migrations

### what exists now

- guest cart and checkout ui exist. the edge function re-reads published artifacts and inserts order rows, but no payment is authorized or captured.
- shipping, tax, insurance, live currency, current manufacturing quote, route reservation, and idempotency are absent.

### required changes

- consume a design release and trusted route quote.
- add payment authorization, capture, webhooks, idempotency, immutable price snapshots, and append-only order events.
- do not label an inserted row as a paid order.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
