# admin: audit

append-only evidence of policy changes, manual interventions, routing decisions, financial adjustments, and security-sensitive actions.

## audited implementation reference

**status: missing**

### existing source evidence

- no append-only operator audit-event system was found.

### what exists now

- database timestamps and page state are not an audit trail.

### required changes

- record authenticated actor, action, target, before/after references, reason, request correlation, timestamp, and result for every privileged change.
- make audit events append-only and independently queryable.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
