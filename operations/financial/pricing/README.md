# Pricing

One reversible equation supports both creator choices: lock net earnings and solve retail, or lock retail and solve earnings. Inputs include current manufacturing quote, payment cost, platform fee, delivery policy, tax presentation, and required reserves.

## Audited implementation reference

**Status: partial preview only**

### Existing source evidence

- `sculptura/src/lib/pricing.js` and identical `sculptura.dev/src/lib/pricing.js`
- `SettingsPricing.jsx`
- Publish forms
- `place-order` edge function

### What exists now

- Client helpers expose margin-style calculations and stored price maps. The full two-way pricing model is not authoritative or route-aware on the server.

### Required changes

- Implement fixed-net and fixed-retail modes in one server pricing service.
- Use current quote, fees, shipping, insurance, tax treatment, currency, and risk policy.
- Return a signed or integrity-bound snapshot for checkout.

See the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
