# remediation migrations

migrations in this foundation are proposed repairs or target-state migrations. they are not proof that the `sculptura.dev` supabase project has been changed.

## current drafts

- `0001_admin_roles_and_market_account_privacy.sql`: public market-account exposure (public-safe view, admin-only table read, admin-role setup note)
- `0002_commission_requests_identity.sql`: authenticated commissioner intake, participant-only reads, commissioner edit-before-acceptance
- `0003_admin_ideas_lockdown.sql`: every admin_ideas operation becomes authenticated and admin-role checked
- `0004_orders_purchase_path.sql`: guest inserts removed in favor of the future idempotent server purchase operation; email-equality reads removed

the full policy state, per-policy verdicts, and the storage gaps deferred to the platform leg are enumerated in [`../security/policy-inventory.md`](../security/policy-inventory.md). the acceptance tests are [`../security/denial-test-matrix.md`](../security/denial-test-matrix.md): no policy fix counts as done until its cells pass with recorded evidence. apply in order 0001 through 0004 against the full migration history; storage stays as inventoried until the platform rebuild owns uploads.
