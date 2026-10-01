# remediation migrations

migrations in this foundation are proposed repairs or target-state migrations. they are not proof that the `sculptura.dev` supabase project has been changed.

## current drafts

- `0001_admin_roles_and_market_account_privacy.sql`: public market-account exposure (public-safe view, admin-only table read, admin-role setup note)
- `0002_commission_requests_identity.sql`: authenticated commissioner intake, participant-only reads, commissioner edit-before-acceptance
- `0003_admin_ideas_lockdown.sql`: every admin_ideas operation becomes authenticated and admin-role checked
- `0004_orders_purchase_path.sql`: guest inserts removed in favor of the future idempotent server purchase operation; email-equality reads removed

- `0004_orders_purchase_path.sql` now also drops the dump-discovered second public orders read ("orders read by creator handle")

the full policy state, per-policy verdicts, and the storage gaps deferred to the platform leg are enumerated in [`../security/policy-inventory.md`](../security/policy-inventory.md). the acceptance tests are [`../security/denial-test-matrix.md`](../security/denial-test-matrix.md): no policy fix counts as done until its cells pass with recorded evidence. apply in order 0001 through 0007 against the full migration history; storage stays as inventoried until the platform rebuild owns uploads.

- `0005_market_accounts_intake.sql`: anonymous market-account inserts removed in favor of ownership-proven authenticated creation (the 2026-09-26 live backup exposed this policy as live despite being invisible in the snapshot history)
- `0006_public_schema_grants.sql`: grant-layer repair for replay through non-lovable paths; postgres-role default privileges on this project withheld all data-plane access from client roles
- `0007_escrow_and_ledger.sql`: escrow holds and the append-only platform ledger backing commission and order payment holding (see [`../platform/payments/README.md`](../platform/payments/README.md))

application note: migrations 0001 through 0005 plus the full lovable history
were applied in order to the fresh foundation project `clmcmckaydkbkxuhfiyf`
on 2026-09-26 over the supabase management api, and 0006 became necessary
because that path runs as postgres rather than lovable's pipeline role.
the original `sculptura.dev` lovable project remains untouched. apply new
migrations in order.

## private creator trust

- `0008_order_purchase_idempotency.sql`: the order purchase replay key.
- [0009_private_creator_trust.sql](0009_private_creator_trust.sql): admin-only
  private confidence assessments, separate review state and atomic audit history.
  migration written and tested locally; not applied to live supabase by this change.

apply 0009 after 0008; keep sculptura_private out of postgrest exposed schemas.
see [the schema contract and access requirements](../admin/creator-trust/README.md).
