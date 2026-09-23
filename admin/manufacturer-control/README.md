# admin: manufacturer control

partner activation, credential references, adapter health, capability review state, and operational suspension. secrets never live in manufacturer reference data.

## audited implementation reference

**status: shell**

### existing source evidence

- `sculptura.dev/src/pages/admin/AdminManufacturers.jsx`
- manufacturer migration

### what exists now

- operators can edit manufacturer metadata and a default flag. no adapter health, credential test, capability approval, or production connection exists.

### required changes

- connect controls to manufacturer onboarding, evidence review, secret references, adapter tests, health, suspension, and versioned capabilities.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
