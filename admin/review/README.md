# admin: review

queues and evidence for listing, release, and exception review. an override is explicit, attributable, and auditable; it never mutates the original studio validation result.

## audited implementation reference

**status: partial and insecure**

### existing source evidence

- `sculptura.dev/src/pages/AdminReview.jsx`
- `sculptura/src/pages/AdminReview.jsx`
- artifact status and review fields in the database

### what exists now

- A review queue can inspect artifact records and update review state. It reviews client-submitted artifact data rather than a verified release. Admin access is not securely established.

### required changes

- Require backend-enforced admin roles.
- Review immutable release evidence separately from listing content.
- Record reviewer, reason, before/after state, and appeal or re-review actions.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
