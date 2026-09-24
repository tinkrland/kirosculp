# platform: checkout

checkout accepts buyer selections and destination, asks operations for country eligibility and a trusted price, and creates the purchase through a server-side path. browser-supplied prices are never authoritative.

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
