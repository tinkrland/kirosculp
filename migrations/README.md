# Remediation migrations

Migrations in this foundation are proposed repairs or target-state migrations. They are not proof that the `sculptura.dev` Supabase project has been changed.

## Current draft

`0001_admin_roles_and_market_account_privacy.sql` addresses one public market-account exposure and documents admin-role setup. The complete audit found additional policy problems involving commission requests, guest orders, admin ideas, storage, collections, and cumulative policy state.

Before deployment, replace or extend the draft with a cumulative migration and an authorization test matrix for anonymous users, buyers, commissioners, creators, admins, and service functions. See [`../security/README.md`](../security/README.md).
