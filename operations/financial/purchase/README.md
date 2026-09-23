# purchase

payment authorization, capture, order creation, taxes and duties inputs, and idempotent purchase state. purchase uses server-side listing and quote snapshots, never browser totals.

## audited implementation reference

**status: partial order intake, missing payment**

### existing source evidence

- `sculptura.dev/src/pages/Checkout.jsx`
- `sculptura.dev/supabase/functions/place-order/index.ts`
- orders table

### what exists now

- the system can create order rows for guests or users. no actual payment authorization or capture is present.

### required changes

- create a purchase state machine with payment intents, idempotency, webhooks, fraud and failure handling, route reservation, and immutable order events.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
