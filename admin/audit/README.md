# Admin: audit

Append-only evidence of policy changes, manual interventions, routing decisions, financial adjustments, and security-sensitive actions.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- No append-only operator audit-event system was found.

### What exists now

- Database timestamps and page state are not an audit trail.

### Required changes

- Record authenticated actor, action, target, before/after references, reason, request correlation, timestamp, and result for every privileged change.
- Make audit events append-only and independently queryable.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
