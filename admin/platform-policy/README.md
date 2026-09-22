# admin: platform policy

global settings and controlled overrides for publication, fees, payout timing, returns, claims, rollout phases, and feature availability.

## audited implementation reference

**status: shell**

### existing source evidence

- `sculptura.dev/src/pages/admin/AdminSettings.jsx`
- platform settings migration

### what exists now

- Generic platform settings can be edited, but policy schemas, validation, effective dates, approval, rollback, and audit are absent.

### required changes

- Define typed policy objects with role checks, change reasons, effective windows, versioning, validation, and rollback.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
