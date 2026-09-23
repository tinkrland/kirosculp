# Manufacturing routing

Filters partners by accepted capability, alloy, process, dimensions, destination, adapter health, and onboarding state. Eligible routes are scored by landed cost, customs exposure, turnaround, reliability, shipping, and claim risk. Nearest and cheapest are inputs, not automatic winners.

## Audited implementation reference

**Status: missing engine**

### Existing source evidence

- `sculptura.dev/src/pages/admin/AdminRouting.jsx` is configuration UI only.
- `manufacturing/routing/regional-routing.md` in this foundation describes the intended decision model.

### What exists now

- There is no executable filter, rank, reserve, or explain path.

### Required changes

- Implement deny-by-default eligibility, route scoring, quote comparison, reservation, reason codes, policy versions, and fallback behavior.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
