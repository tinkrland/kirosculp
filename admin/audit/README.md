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

## scoped creator-trust audit implementation

[0009](../../migrations/0009_private_creator_trust.sql) supplies an append-only
audit for [private creator classifications](../creator-trust/README.md), with
authenticated actor, request id and before/after snapshots. this is a local
schema implementation, not the missing general-purpose production audit service.
