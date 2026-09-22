# admin: routing control

routing policy, weighting, route inspection, manual reassignment, and incident intervention. the actual eligibility and scoring logic belongs to manufacturing/routing.

## audited implementation reference

**status: shell**

### existing source evidence

- `sculptura.dev/src/pages/admin/AdminRouting.jsx`
- platform settings and manufacturer tables

### what exists now

- The UI stores routing mode and default-manufacturer configuration. There is no route eligibility, ranking, quote comparison, reservation, or explanation engine behind it.

### required changes

- Build routing in Manufacturing and Operations, then let Admin change versioned policy and inspect decisions.
- Never place route logic directly in the page.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
