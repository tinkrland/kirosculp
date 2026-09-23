# Admin: review

Queues and evidence for listing, release, and exception review. An override is explicit, attributable, and auditable; it never mutates the original studio validation result.

## Audited implementation reference

**Status: partial and insecure**

### Existing source evidence

- `sculptura.dev/src/pages/AdminReview.jsx`
- `sculptura/src/pages/AdminReview.jsx`
- Artifact status and review fields in the database

### What exists now

- A review queue can inspect artifact records and update review state. It reviews client-submitted artifact data rather than a verified release. Admin access is not securely established.

### Required changes

- Require backend-enforced admin roles.
- Review immutable release evidence separately from listing content.
- Record reviewer, reason, before/after state, and appeal or re-review actions.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
