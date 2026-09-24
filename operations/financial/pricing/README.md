# pricing

one reversible equation supports both creator choices: lock net earnings and solve retail, or lock retail and solve earnings. inputs include current manufacturing quote, payment cost, platform fee, delivery policy, tax presentation, and required reserves.

## audited implementation reference

**status: partial preview only**

### existing source evidence

- [`sculptura/src/lib/pricing.js`](../../../what-exists/base44/src/lib/pricing.js) and identical [`sculptura.dev/src/lib/pricing.js`](../../../what-exists/lovable/src/lib/pricing.js)
- `SettingsPricing.jsx`
- publish forms
- `place-order` edge function

### what exists now

- client helpers expose margin-style calculations and stored price maps. the full two-way pricing model is not authoritative or route-aware on the server.

### required changes

- implement fixed-net and fixed-retail modes in one server pricing service.
- use current quote, fees, shipping, insurance, tax treatment, currency, and risk policy.
- return a signed or integrity-bound snapshot for checkout.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
