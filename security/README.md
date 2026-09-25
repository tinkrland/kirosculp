---
title: security remediation
summary: verified authentication, authorization, privacy, and database-policy findings from the complete sculptura.dev source audit.
---

# security remediation

## status

**critical remediation is required before production use.**

this page describes the supplied source snapshots. a migration or proposed patch in this foundation is not proof that a live database has been repaired.

## verified findings

### client-side universal admin password

[`sculptura.dev/src/components/admin/AdminLayout.jsx`](../what-exists/lovable/src/components/admin/AdminLayout.jsx) contains:

```js
const ADMIN_PASSWORD = "Password";
```

the value is shipped in browser javascript. successful comparison only writes `sculptura_admin_unlocked=1` to session storage. this is a visual gate, not authentication or authorization.

**required fix:** remove the password gate. require a supabase session, verify the user's admin role through a backend-enforced role check, and let rls or a privileged server operation reject every unauthorized admin read and write.

### public market-account records expose private columns

an original migration applies public select access to `market_accounts`, whose rows include storefront fields alongside `access_key_hash`, payout details, account email, and other private configuration.

**required fix:** expose only approved storefront fields through a public-safe view or dedicated public table. keep authentication, payout, account, and internal configuration in private tables. no public query should be able to select an access-key hash or payout destination.

### legacy open market-account updates

an original policy allows broad update access to `market_accounts`. a later edge function verifies an access key for controlled updates, but cumulative policy state must be verified and the open policy removed.

**required fix:** permit owner changes only through a narrowly validated authenticated or server-side path. status, role, payout, access, review, and policy fields require separate authorization.

### anonymous and publicly readable commission requests

`commission_requests` was introduced with anonymous insert and public read policies. that conflicts with the product rule that commissioners must have buyer accounts, and it exposes private briefs and contact data.

**required fix:** require `auth.uid()` for request creation, store `commissioner_user_id`, permit the commissioner, assigned creator, and authorized operators to read the request, and remove every public-read or anonymous-write policy.

### guest-order policy and private order access

guest checkout is a valid product requirement, but open table insertion is not the right implementation. the `place-order` edge function also creates rows without charging a payment method.

**required fix:** allow guests to call a rate-limited, idempotent server purchase operation. keep direct order-table insert unavailable to anonymous clients. private reads require authenticated ownership, a securely scoped guest-order access mechanism, assigned creator access where appropriate, or an admin role. email equality alone must not grant order access.

### open admin idea notebook

the `admin_ideas` migration permits open read, insert, update, and delete.

**required fix:** restrict every operation to authenticated admins. if public idea submission is ever wanted, use a separate intake endpoint and table with rate limiting and moderation.

### permissive storage and collection policies

several migrations contain `using (true)` or `with check (true)` policies. some are intentional public-read surfaces, while others are too broad or operate on tables containing private fields.

**required fix:** review cumulative policy state table by table. public reads must use public-safe projections and explicit publication state. writes require ownership, role checks, object-path checks, allowed-field validation, and abuse controls.

### service-role edge functions trust too many client fields

`publish-artifact` verifies a creator access key and forces `pending_review`, but accepts client-provided manufacturing costs, creator earnings, prices, model urls, and other production claims before inserting with the service role.

`store-update` uses a field allowlist, but the allowed set still includes payout details and sensitive operational fields.

**required fix:** service-role functions must validate both caller authority and field provenance. production geometry, validation, manufacturing cost, pricing, payout configuration, and release identity come from their owning trusted services, not creator browser payloads.

### no abuse, audit, or idempotency layer

public forms and mutations do not show a complete rate-limit, bot-defense, idempotency, privileged-action audit, or replay-protection design.

**required fix:** add server-enforced limits, request identifiers, idempotency keys, append-only admin audit events, security telemetry, and regression tests for every sensitive policy.

## remediation artifacts in this foundation

- [`migrations/0001_admin_roles_and_market_account_privacy.sql`](../migrations/0001_admin_roles_and_market_account_privacy.sql): market-account privacy and admin-role setup (item 2 of the order of work)
- [`migrations/0002_commission_requests_identity.sql`](../migrations/0002_commission_requests_identity.sql): anonymous commission access closed (item 3)
- [`migrations/0004_orders_purchase_path.sql`](../migrations/0004_orders_purchase_path.sql): guest-order table writes and email-equality reads removed (item 4, client side; the idempotent purchase operation itself belongs to the platform leg)
- [`migrations/0003_admin_ideas_lockdown.sql`](../migrations/0003_admin_ideas_lockdown.sql): open admin-idea access closed (item 5)
- [`policy-inventory.md`](policy-inventory.md): the cumulative policy state, every policy with a verdict (item 6, review complete; storage corrections deferred to the platform rebuild with reasons recorded)
- [`denial-test-matrix.md`](denial-test-matrix.md): the cross-role acceptance matrix (item 6, drafted; no cell is verified until runs are recorded)

still open: the client admin password component removal (item 1, platform leg owns the app code; 0003 makes the removal safe server-side), service-role input provenance (item 7), and the abuse, audit, and idempotency layer (item 8). a migration here is not proof that a live database has been repaired.

## required order of work

1. remove the hardcoded admin gate and establish authenticated admin roles
2. protect market-account private fields and payout information
3. close anonymous commission access
4. move guest purchases behind an idempotent server operation
5. close open admin-idea access
6. verify cumulative rls and storage policies
7. reduce service-role input trust and split sensitive data by domain
8. add rate limits, audit events, idempotency, and automated authorization tests

## acceptance conditions

security remediation is complete only when:

- no password or privileged secret is embedded in client code
- unauthorized clients cannot read or mutate private rows or fields
- commission creation requires an authenticated commissioner
- guest checkout works without public order-table writes
- every admin operation is authenticated, role-authorized, and audited
- privileged edge functions derive sensitive values from trusted services
- policy tests prove the intended access matrix against the cumulative schema

see the [complete source audit](../docs/current-state-audit.md) for the cross-domain build order.
