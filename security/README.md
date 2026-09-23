---
title: security remediation
summary: verified authentication, authorization, privacy, and database-policy findings from the complete sculptura.dev source audit.
---

# Security remediation

## Status

**Critical remediation is required before production use.**

This page describes the supplied source snapshots. A migration or proposed patch in this foundation is not proof that a live database has been repaired.

## Verified findings

### Client-side universal admin password

`sculptura.dev/src/components/admin/AdminLayout.jsx` contains:

```js
const ADMIN_PASSWORD = "Password";
```

The value is shipped in browser JavaScript. Successful comparison only writes `sculptura_admin_unlocked=1` to session storage. This is a visual gate, not authentication or authorization.

**Required fix:** remove the password gate. Require a Supabase session, verify the user's admin role through a backend-enforced role check, and let RLS or a privileged server operation reject every unauthorized admin read and write.

### Public market-account records expose private columns

An original migration applies public select access to `market_accounts`, whose rows include storefront fields alongside `access_key_hash`, payout details, account email, and other private configuration.

**Required fix:** expose only approved storefront fields through a public-safe view or dedicated public table. Keep authentication, payout, account, and internal configuration in private tables. No public query should be able to select an access-key hash or payout destination.

### Legacy open market-account updates

An original policy allows broad update access to `market_accounts`. A later edge function verifies an access key for controlled updates, but cumulative policy state must be verified and the open policy removed.

**Required fix:** permit owner changes only through a narrowly validated authenticated or server-side path. Status, role, payout, access, review, and policy fields require separate authorization.

### Anonymous and publicly readable commission requests

`commission_requests` was introduced with anonymous insert and public read policies. That conflicts with the product rule that commissioners must have buyer accounts, and it exposes private briefs and contact data.

**Required fix:** require `auth.uid()` for request creation, store `commissioner_user_id`, permit the commissioner, assigned creator, and authorized operators to read the request, and remove every public-read or anonymous-write policy.

### Guest-order policy and private order access

Guest checkout is a valid product requirement, but open table insertion is not the right implementation. The `place-order` edge function also creates rows without charging a payment method.

**Required fix:** allow guests to call a rate-limited, idempotent server purchase operation. Keep direct order-table insert unavailable to anonymous clients. Private reads require authenticated ownership, a securely scoped guest-order access mechanism, assigned creator access where appropriate, or an admin role. Email equality alone must not grant order access.

### Open admin idea notebook

The `admin_ideas` migration permits open read, insert, update, and delete.

**Required fix:** restrict every operation to authenticated admins. If public idea submission is ever wanted, use a separate intake endpoint and table with rate limiting and moderation.

### Permissive storage and collection policies

Several migrations contain `using (true)` or `with check (true)` policies. Some are intentional public-read surfaces, while others are too broad or operate on tables containing private fields.

**Required fix:** review cumulative policy state table by table. Public reads must use public-safe projections and explicit publication state. Writes require ownership, role checks, object-path checks, allowed-field validation, and abuse controls.

### Service-role edge functions trust too many client fields

`publish-artifact` verifies a creator access key and forces `pending_review`, but accepts client-provided manufacturing costs, creator earnings, prices, model URLs, and other production claims before inserting with the service role.

`store-update` uses a field allowlist, but the allowed set still includes payout details and sensitive operational fields.

**Required fix:** service-role functions must validate both caller authority and field provenance. Production geometry, validation, manufacturing cost, pricing, payout configuration, and release identity come from their owning trusted services, not creator browser payloads.

### No abuse, audit, or idempotency layer

Public forms and mutations do not show a complete rate-limit, bot-defense, idempotency, privileged-action audit, or replay-protection design.

**Required fix:** add server-enforced limits, request identifiers, idempotency keys, append-only admin audit events, security telemetry, and regression tests for every sensitive policy.

## Remediation artifacts in this foundation

`migrations/0001_admin_roles_and_market_account_privacy.sql` is an early draft that addresses public market-account reads and documents admin-role setup. It is incomplete. It does not repair commission requests, guest-order insertion, admin ideas, every permissive policy, service-role provenance, or the client admin component.

Before deployment, replace it with a cumulative migration tested against the complete migration history. Tests must cover anonymous, authenticated buyer, commissioner, creator, admin, and service-role behavior for every table and storage bucket.

## Required order of work

1. Remove the hardcoded admin gate and establish authenticated admin roles
2. Protect market-account private fields and payout information
3. Close anonymous commission access
4. Move guest purchases behind an idempotent server operation
5. Close open admin-idea access
6. Verify cumulative RLS and storage policies
7. Reduce service-role input trust and split sensitive data by domain
8. Add rate limits, audit events, idempotency, and automated authorization tests

## Acceptance conditions

Security remediation is complete only when:

- No password or privileged secret is embedded in client code
- Unauthorized clients cannot read or mutate private rows or fields
- Commission creation requires an authenticated commissioner
- Guest checkout works without public order-table writes
- Every admin operation is authenticated, role-authorized, and audited
- Privileged edge functions derive sensitive values from trusted services
- Policy tests prove the intended access matrix against the cumulative schema

See the [complete source audit](../docs/current-state-audit.md) for the cross-domain build order.
