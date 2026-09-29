# manufacturing routing

filters partners by accepted capability, alloy, process, dimensions, destination, adapter health, and onboarding state. eligible routes are scored by landed cost, customs exposure, turnaround, reliability, shipping, and claim risk. nearest and cheapest are inputs, not automatic winners.

values-based routing is part of the same model: partner provenance profiles (recycled content, refiner chain, site country, certifications, evidence or nothing) plus creator-set listing constraints (recycled only, made-in-country, chain-of-custody) that become honest search facets because routing enforces them. see [provenance-metadata.md](provenance-metadata.md).

## audited implementation reference

**status: missing engine**

### existing source evidence

- [`sculptura.dev/src/pages/admin/AdminRouting.jsx`](../../what-exists/lovable/src/pages/admin/AdminRouting.jsx) is configuration ui only.
- `manufacturing/routing/regional-routing.md` in this foundation describes the intended decision model.

### what exists now

- there is no executable filter, rank, reserve, or explain path.

### required changes

- implement deny-by-default eligibility, route scoring, quote comparison, reservation, reason codes, policy versions, and fallback behavior.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
