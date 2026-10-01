# security-containment requirements

## goal

make security containment reproducible and prove cross-role denial before building further product flows. demonstrate that rls policies, grant layer, and server-side authorization prevent unauthorized data access and mutations across guest, buyer, commissioner, creator, and admin roles.

## source evidence baseline

this spec operates against the current main branch. historical baseline from handoff: c76881a plus instruction-removal commits through 8a9173f, but current head may differ.

source files read:
- README.md, repo.md, buildplan/scoping.md
- buildplan/security/README.md, audit/security.md
- security/README.md, security/policy-inventory.md, security/denial-test-matrix.md
- migrations/0001-0010 (foundation corrective migrations)
- what-exists/lovable/supabase/migrations/* (16 original migrations)
- what-exists/lovable/supabase/functions/* (place-order, publish-artifact, store-update)
- what-exists/lovable/src/components/admin/AdminLayout.jsx
- contracts/*.schema.json (design-release, creator-trust, buyer-trust)
- scripts/validate-data-contracts.mjs, package.json

## existing evidence, not a blank slate

migrations 0001-0006 were applied to fresh foundation project clmcmckaydkbkxuhfiyf on 2026-09-26. guest-role denial matrix cells were verified against that project after 0006 corrected grant layer. authenticated-role cells (buyer, commissioner, creator, admin) remain unverified.

migrations 0007-0010 (escrow/ledger, idempotency, private trust models) exist as drafts. deployment state unknown.

historical snapshot findings:
- client admin password "Password" in AdminLayout.jsx gates all /admin/* routes via sessionStorage only
- market_accounts public read exposed access_key_hash and payout_details before 0001
- commission_requests allowed anonymous insert and public read before 0002
- orders allowed email-equality reads and using(true) creator_handle reads before 0004
- admin_ideas allowed fully open crud before 0003
- market_accounts allowed anonymous insert before 0005
- grant layer blocked all anon/authenticated access before 0006 grant repair
- edge functions trust client-provided prices, manufacturing_costs, creator_earnings, model_url fields

## known policy conflicts requiring explicit resolution

### conflict 1: order intake path

**source**: migrations/0004_orders_purchase_path.sql line 12-15

0004 removes anonymous order inserts but adds authenticated self-insert as temporary:
```sql
create policy "orders authenticated self insert"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());
```

comment states "guest checkout stays a product requirement, but direct anonymous inserts... stop being the mechanism: guest purchases move to the idempotent server purchase operation (platform leg)".

0008 adds client_request_key for idempotency but does not revoke the authenticated self-insert policy.

**decision required**: is authenticated buyer self-insert permanent or temporary? if temporary, when does it get revoked? if permanent, how does it coexist with the server purchase operation? does the idempotent operation replace or supplement direct inserts?

### conflict 2: commission ownership vs authenticated insert wording

**source**: migrations/0002_commission_requests_identity.sql line 18-20, security-execution.md line 17-20

0002 policy:
```sql
create policy "commission_requests commissioner insert"
  on public.commission_requests for insert
  to authenticated
  with check (commissioner_user_id = auth.uid());
```

steering clarifies: "an unrelated authenticated user can create their own request, not forge another commissioner's uid."

**decision required**: confirm this is correct behavior. a commissioner inserts their own request (commissioner_user_id = their uid), addressed to a creator_handle. the policy prevents forging someone else's commissioner_user_id. is that the intended model?

### conflict 3: escrow/ledger and trust models deployment

**source**: migrations/README.md, migrations/0007-0010

0007-0010 exist as foundation drafts. README states "locally tested only" for 0009/0010. no claim that they've been applied to any supabase project.

**decision required**: should this security-containment leg apply 0007-0010 to the test database, or defer them to platform/operations legs? are they in scope for proving rls and authorization, or are they financial primitives outside the denial matrix?

## requirements

### req-1: reproducible cumulative schema replay

**source**: handoff line 28-34, security-execution.md line 4-6

**requirement**: create a local database build script that applies the full lovable migration history (16 migrations) plus foundation corrections (0001-0010) in dependency order, producing a cumulative schema state identical to what the live supabase project would have after all corrections are deployed.

**acceptance**: script runs without error, produces a seeded schema with all tables, policies, functions, storage buckets, and grants. script is re-runnable (drops and recreates or uses a fresh disposable database each time).

**source file references**:
- what-exists/lovable/supabase/migrations/*.sql (16 files)
- migrations/0001-0010.sql
- migrations/README.md (application order and dependencies)

### req-2: seeded test roles and identities

**source**: handoff line 28-34, denial-test-matrix.md role definitions

**requirement**: seed the cumulative schema with real auth.users rows and related entity rows to represent:
- guest (anonymous, no session)
- buyer (authenticated user, no creator_profile, owns orders)
- commissioner (authenticated user, owns commission_request)
- creator (authenticated user, owns creator_profile with handle, owns artifacts)
- admin (authenticated user with admin role in user_roles)
- unrelated user (authenticated user, no relationship to seeded entities)

include cross-account isolation test data: order owned by buyer A must not be visible to buyer B; commission addressed to creator C must not be visible to creator D.

**acceptance**: seed script creates users and entities. each role has at least one identity. unrelated-user probes can demonstrate denial without owning target entities.

**source file references**:
- what-exists/lovable/supabase/migrations/20260429121931_*.sql (profiles, user_roles, has_role function)
- migrations/0002*.sql (commissioner_user_id)

### req-3: positive and negative authorization test harness

**source**: handoff line 28-34, handoff line 59-60, security-execution.md line 4-9, denial-test-matrix.md

**requirement**: create executable test suite that:
- runs real sql queries against the cumulative schema
- authenticates as each seeded role (setting auth.uid() context for rls)
- asserts allow (rows returned, mutation succeeds) or deny (zero rows, permission denied) per the denial matrix
- includes positive controls: a role that should see a row must see it (proves rls is filtering, not blanket-denying)
- includes private-column assertions: if a table exposes a public-safe view, verify base table columns (access_key_hash, payout_details, customer_email, shipping_address) are not visible to unauthorized roles

**acceptance**: test suite runs all matrix cells. failures report expected vs actual outcome. zero rows means rls filtered correctly. "permission denied for table" means grant layer blocked (distinguish from rls deny). positive controls pass (proving rls works). private columns never leak to public queries.

**source file references**:
- security/denial-test-matrix.md (full matrix)
- security/policy-inventory.md (per-table policies and verdicts)
- migrations/0001*.sql (market_accounts_public view)
- migrations/0002*.sql (commission_requests participant read)
- migrations/0003*.sql (admin_ideas admin-only)
- migrations/0004*.sql (orders owner read, no email equality)

### req-4: matrix cells for commission_requests

**source**: denial-test-matrix.md lines 21-26, migrations/0002*.sql

**requirement**: prove commission_requests policies after 0002:
- guest insert: deny
- commissioner insert (own uid): allow, commissioner_user_id set to auth.uid()
- commissioner select (own): allow (own row visible)
- other commissioner select: deny (cross-account isolation)
- addressed creator select: allow (creator with matching handle sees request)
- admin select: allow (all requests)
- commissioner update while status=new: allow (own request)
- commissioner update after acceptance: deny
- creator update: allow (via existing owner update policy using handle match)
- admin update: allow

**acceptance**: all cells match expected outcomes. guest sees zero rows. commissioner sees only their own requests. creator sees only requests addressed to their handle. admin sees all. cross-account isolation verified.

**source file references**:
- what-exists/lovable/supabase/migrations/20260502200217_*.sql (original vulnerable policies)
- migrations/0002_commission_requests_identity.sql (corrective policies)

### req-5: matrix cells for admin_ideas

**source**: denial-test-matrix.md lines 28-31, migrations/0003*.sql

**requirement**: prove admin_ideas policies after 0003:
- guest/buyer/creator select/insert/update/delete: deny
- admin select/insert/update/delete: allow

**acceptance**: non-admin roles get zero rows or permission denied. admin can crud all rows.

**source file references**:
- what-exists/lovable/supabase/migrations/20260512235827_*.sql (original open policies)
- migrations/0003_admin_ideas_lockdown.sql (admin-only policies)

### req-6: matrix cells for orders

**source**: denial-test-matrix.md lines 33-38, migrations/0004*.sql

**requirement**: prove orders policies after 0004:
- guest insert: deny
- authenticated buyer insert (user_id = own uid): allow (temporary path per conflict 1)
- buyer select (own order): allow
- other buyer select: deny (cross-account isolation)
- addressed creator select: allow (creator with matching handle sees orders addressed to them)
- admin select: allow (all orders)
- email-equality select regression test: buyer who registered with email matching an order's customer_email must not see that order unless they own it by user_id

**acceptance**: guest cannot insert. authenticated self-insert works (resolving conflict 1 with "temporary but present"). cross-account isolation holds. email-equality policy no longer exists (regression test confirms it's gone). creator sees assigned orders. admin sees all.

**source file references**:
- what-exists/lovable/supabase/migrations/20260429121931_*.sql (original email-equality and using(true) creator read)
- migrations/0004_orders_purchase_path.sql (corrective policies)

### req-7: matrix cells for market_accounts

**source**: denial-test-matrix.md lines 40-44, migrations/0001*.sql

**requirement**: prove market_accounts policies after 0001:
- guest select base table: deny or zero rows (admin-only policy)
- authenticated non-admin select base table: deny or zero rows
- admin select base table: allow (all rows, including access_key_hash and payout_details)
- guest select market_accounts_public view: allow (public-safe columns only)
- authenticated select market_accounts_public view: allow
- private columns (access_key_hash, payout_details, payout_method, email) never appear in public view results

**acceptance**: base table is admin-only. public view is accessible to all but excludes private columns. private-column assertion passes.

**source file references**:
- what-exists/lovable/supabase/migrations/20260429121931_*.sql (original public read on base table)
- migrations/0001_admin_roles_and_market_account_privacy.sql (view creation, admin-only base table policy)

### req-8: grant layer vs rls distinction

**source**: security-execution.md line 4-9, denial-test-matrix.md recorded runs note

**requirement**: test harness must distinguish:
- grant-layer block: "permission denied for table" (role lacks select/insert/update/delete grant on the table entirely)
- rls deny: query succeeds but returns zero rows, or insert/update fails with rls check violation

a test that returns "permission denied for table" when it expected zero rows is a grant-layer misconfiguration, not an rls pass. the 2026-09-26 run discovered this: postgres role default acl withheld all access before 0006.

**acceptance**: test output labels each failure as grant-layer or rls. grant failures on tables that should be accessible (with rls filtering) are flagged as setup errors.

**source file references**:
- migrations/0006_public_schema_grants.sql (grant repair)
- security/denial-test-matrix.md lines 57-64 (recorded grant-layer failure)

### req-9: service-role bypass is not client rls proof

**source**: handoff line 51-52, security-execution.md line 10-12, security/README.md lines 100-104

**requirement**: acknowledge that edge functions (place-order, publish-artifact, store-update) use service_role and bypass rls entirely after access-key verification. service-role successes do not prove client rls works. service-role operations require separate caller authorization, ownership, and field-provenance tests.

this requirement is documentation and scoping, not a test.

**acceptance**: requirements document states clearly: "service-role bypass is out of the denial matrix scope. proving client rls does not prove service-role paths are secure. service-role input validation is a separate workstream (security/README.md item 7)."

**source file references**:
- what-exists/lovable/supabase/functions/*/index.ts (all use service_role after access-key check)
- security/README.md lines 100-107 (service-role input provenance required fix)

### req-10: corrective migrations for demonstrated gaps

**source**: handoff line 34, security/README.md required order of work

**requirement**: if denial tests discover gaps not covered by 0001-0010, draft corrective migrations numbered sequentially (0011, 0012, ...). re-run the matrix after applying new migrations. no gap may be marked "verified" without a passing test after its correction.

**acceptance**: if gaps found, new migrations exist in migrations/ directory. updated matrix shows passing cells after corrections. if no new gaps found, document that 0001-0010 are sufficient for the tested scope.

**source file references**:
- migrations/README.md (application order, cumulative corrections)
- security/policy-inventory.md (verdicts: keep/corrected/monitor/replace in platform rebuild)

### req-11: repeatable setup and run commands

**source**: handoff line 35-37

**requirement**: document exact commands to:
1. install dependencies (node, pglite, python)
2. build cumulative schema from migrations
3. seed test identities
4. run denial matrix tests
5. interpret results
6. apply additional migrations if needed
7. re-run tests

commands must be reproducible on a clean local machine without access to live supabase projects.

**acceptance**: README or run script with step-by-step commands. another developer can clone the repo and execute the full test suite without prior knowledge.

**source file references**:
- package.json (existing test scripts for creator-trust, buyer-trust using pglite)
- scripts/test-private-creator-trust.mjs (reference for pglite-based test pattern)

### req-12: recorded evidence and deployment state

**source**: handoff line 38, handoff line 84-87

**requirement**: after completing all tests, record:
- which matrix cells passed/failed
- which migrations were applied to the local test database
- which migrations are known to be applied to live supabase projects (if any)
- unresolved policy conflicts (from conflict 1-3 above)
- remaining risks (storage policies deferred to platform rebuild, service-role input validation deferred)
- deployment state handoff: "migrations 0001-0010 verified locally. deployment to sculptura.dev supabase project not performed by this session. deployment authorization required separately."

**acceptance**: markdown file with results, pass/fail counts, unresolved decisions, deployment status, next-leg handoff.

**source file references**:
- security/denial-test-matrix.md (template for recorded runs)
- migrations/README.md (application notes)

## non-requirements (explicitly out of scope)

1. **live database mutations**: no migration may be applied to sculptura.dev supabase project during this session. local test only.

2. **real payment capture**: place-order function does not capture payments. proving order intake authorization does not prove payment flows are secure.

3. **storage bucket private geometry**: policy-inventory.md lists storage policies as "replace in platform rebuild" with recorded reasons. model files in artifacts bucket moving behind signed urls is a platform-leg task.

4. **service-role field provenance**: publish-artifact and store-update accept client-provided manufacturing_costs, prices, earnings, model_url, payout_details. proving those fields require server-side trusted sources is security/README.md item 7, not this leg's denial matrix.

5. **client admin password removal**: AdminLayout.jsx password gate removal is a platform-leg app code change. this leg makes removal safe server-side (0003 locks admin_ideas to has_role check), but does not modify the jsx component.

6. **rate limiting, idempotency enforcement, audit events**: security/README.md item 8. acknowledged as required but outside this leg's rls proof scope.

7. **aml and financial-abuse controls**: security/aml/ is documentation of plausible scenarios and proposed controls. legal applicability, operating ownership, and provider approval unresolved. not implemented by this leg.

## success criteria

security-containment is complete when:
1. cumulative schema build script runs without error (req-1)
2. test roles and entities are seeded (req-2)
3. denial matrix test harness executes all cells (req-3)
4. commission_requests cells pass (req-4)
5. admin_ideas cells pass (req-5)
6. orders cells pass (req-6)
7. market_accounts cells pass (req-7)
8. grant vs rls distinction is clear in output (req-8)
9. service-role bypass is documented as out-of-scope (req-9)
10. any discovered gaps have corrective migrations and passing re-tests (req-10)
11. setup and run commands are documented and reproducible (req-11)
12. results, deployment state, and unresolved decisions are recorded (req-12)

no matrix cell may be marked "verified" when it is skipped, mocked away, blocked by missing test setup, or passed only via service-role bypass.
