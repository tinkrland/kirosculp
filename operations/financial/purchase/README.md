# Purchase

Payment authorization, capture, order creation, taxes and duties inputs, and idempotent purchase state. Purchase uses server-side listing and quote snapshots, never browser totals.

## Audited implementation reference

**Status: partial order intake, missing payment**

### Existing source evidence

- `sculptura.dev/src/pages/Checkout.jsx`
- `sculptura.dev/supabase/functions/place-order/index.ts`
- Orders table

### What exists now

- The system can create order rows for guests or users. No actual payment authorization or capture is present.

### Required changes

- Create a purchase state machine with payment intents, idempotency, webhooks, fraud and failure handling, route reservation, and immutable order events.

See the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
