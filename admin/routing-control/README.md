# Admin: routing control

Routing policy, weighting, route inspection, manual reassignment, and incident intervention. The actual eligibility and scoring logic belongs to manufacturing/routing.

## Audited implementation reference

**Status: shell**

### Existing source evidence

- `sculptura.dev/src/pages/admin/AdminRouting.jsx`
- Platform settings and manufacturer tables

### What exists now

- The UI stores routing mode and default-manufacturer configuration. There is no route eligibility, ranking, quote comparison, reservation, or explanation engine behind it.

### Required changes

- Build routing in Manufacturing and Operations, then let Admin change versioned policy and inspect decisions.
- Never place route logic directly in the page.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
