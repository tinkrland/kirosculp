# platform: checkout

checkout accepts buyer selections and destination, asks operations for country eligibility and a trusted price, and creates the purchase through a server-side path. browser-supplied prices are never authoritative.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura.dev/src/pages/Checkout.jsx`
- `sculptura.dev/src/lib/cartStore.js`
- `sculptura.dev/supabase/functions/place-order/index.ts`
- orders migrations

### what exists now

- Guest cart and checkout UI exist. The edge function re-reads published artifacts and inserts order rows, but no payment is authorized or captured.
- Shipping, tax, insurance, live currency, current manufacturing quote, route reservation, and idempotency are absent.

### required changes

- Consume a design release and trusted route quote.
- Add payment authorization, capture, webhooks, idempotency, immutable price snapshots, and append-only order events.
- Do not label an inserted row as a paid order.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
