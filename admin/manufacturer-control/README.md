# Admin: manufacturer control

Partner activation, credential references, adapter health, capability review state, and operational suspension. Secrets never live in manufacturer reference data.

## Audited implementation reference

**Status: shell**

### Existing source evidence

- `sculptura.dev/src/pages/admin/AdminManufacturers.jsx`
- Manufacturer migration

### What exists now

- Operators can edit manufacturer metadata and a default flag. No adapter health, credential test, capability approval, or production connection exists.

### Required changes

- Connect controls to manufacturer onboarding, evidence review, secret references, adapter tests, health, suspension, and versioned capabilities.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
