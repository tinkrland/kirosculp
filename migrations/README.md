# remediation migrations

migrations in this foundation are proposed repairs or target-state migrations. they are not proof that the `sculptura.dev` supabase project has been changed.

## current draft

`0001_admin_roles_and_market_account_privacy.sql` addresses one public market-account exposure and documents admin-role setup. the complete audit found additional policy problems involving commission requests, guest orders, admin ideas, storage, collections, and cumulative policy state.

before deployment, replace or extend the draft with a cumulative migration and an authorization test matrix for anonymous users, buyers, commissioners, creators, admins, and service functions. see [`../security/README.md`](../security/README.md).
