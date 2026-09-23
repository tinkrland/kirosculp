# Admin: platform policy

Global settings and controlled overrides for publication, fees, payout timing, returns, claims, rollout phases, and feature availability.

## Audited implementation reference

**Status: shell**

### Existing source evidence

- `sculptura.dev/src/pages/admin/AdminSettings.jsx`
- Platform settings migration

### What exists now

- Generic platform settings can be edited, but policy schemas, validation, effective dates, approval, rollback, and audit are absent.

### Required changes

- Define typed policy objects with role checks, change reasons, effective windows, versioning, validation, and rollback.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
