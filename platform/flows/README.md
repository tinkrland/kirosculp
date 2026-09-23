# Flows

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura.dev/src/pages/PublishArtifact.jsx`
- `sculptura.dev/src/pages/Checkout.jsx`
- `sculptura.dev/supabase/functions/publish-artifact/index.ts`
- `sculptura.dev/supabase/functions/place-order/index.ts`

### What exists now

- The current flow publishes an artifact-shaped payload and later creates order rows. It does not pass through a design release, current quote, payment state, or manufacturing reservation.

### Required changes

- Replace the flow with release to listing to quote to payment to production-order transitions.
- Define failure, retry, cancellation, and compensation behavior for each transition.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
