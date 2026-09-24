# flows

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/PublishArtifact.jsx`](../../what-exists/lovable/src/pages/PublishArtifact.jsx)
- [`sculptura.dev/src/pages/Checkout.jsx`](../../what-exists/lovable/src/pages/Checkout.jsx)
- [`sculptura.dev/supabase/functions/publish-artifact/index.ts`](../../what-exists/lovable/supabase/functions/publish-artifact/index.ts)
- [`sculptura.dev/supabase/functions/place-order/index.ts`](../../what-exists/lovable/supabase/functions/place-order/index.ts)

### what exists now

- the current flow publishes an artifact-shaped payload and later creates order rows. it does not pass through a design release, current quote, payment state, or manufacturing reservation.

### required changes

- replace the flow with release to listing to quote to payment to production-order transitions.
- define failure, retry, cancellation, and compensation behavior for each transition.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
