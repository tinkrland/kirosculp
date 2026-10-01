# security-containment design

## overview

this leg builds a local reproducible security verification system: a pglite database seeded with the cumulative lovable + foundation migration history, test roles and entities, and an executable denial matrix that proves rls policies prevent unauthorized access across guest, buyer, commissioner, creator, and admin roles.

the system runs entirely locally without touching live supabase projects. it produces recorded evidence of which policies work, which fail, and what gaps require corrective migrations.

## policy conflict resolutions

### resolution 1: authenticated order self-insert is temporary

**conflict**: 0004 allows authenticated self-insert as "temporary path" but 0008 adds idempotency without revoking it.

**resolution**: document authenticated self-insert as temporary. it remains in place during this security leg because the idempotent server purchase operation does not exist yet (platform leg owns it). the denial matrix tests it as present. when the platform leg implements the server operation, it will revoke the self-insert policy and update the matrix to expect deny for direct authenticated inserts.

**implication for testing**: req-6 tests authenticated buyer insert as allow (current state). matrix cell is marked "temporary: revoke when server purchase operation ships."

### resolution 2: commissioner insert model confirmed

**conflict**: clarify whether commissioner_user_id = auth.uid() means forging prevention or ownership model.

**resolution**: correct model confirmed. when an authenticated user inserts a commission_request:
- they set commissioner_user_id to their own auth.uid()
- they address the request to a creator via creator_handle
- the policy `with check (commissioner_user_id = auth.uid())` prevents them from setting commissioner_user_id to someone else's uuid
- they create their own request, not forge another buyer's identity

**implication for testing**: req-4 commissioner insert test asserts commissioner_user_id = test user's uid. attempting to set a different commissioner_user_id must fail the with check.

### resolution 3: escrow/ledger/trust in scope for testing

**conflict**: 0007-0010 are drafts. should they be tested or deferred?

**resolution**: include 0007-0010 in the cumulative schema build and test their rls policies:
- 0007 escrow_holds and ledger_entries: admin-only reads, no client access
- 0009 creator_trust: admin-only reads via admin_get_creator_trust rpc
- 0010 buyer_trust: admin-only reads via admin_get_buyer_trust rpc

these tables contain financial and trust data. proving they are admin-only is within this leg's rls scope. testing the escrow state machine logic and ledger balance integrity is deferred to operations leg.

**implication for testing**: add matrix cells for escrow_holds, ledger_entries, sculptura_private.creator_trust, sculptura_private.buyer_trust: guest/buyer/creator deny, admin allow.

## architecture

### component 1: schema builder

**purpose**: apply full migration history to produce cumulative schema.

**implementation**:
- use `@electric-sql/pglite` (already in devDependencies)
- create `scripts/build-security-test-db.mjs`
- reads migrations from what-exists/lovable/supabase/migrations/*.sql (sorted by filename timestamp)
- reads migrations from migrations/0001-0010.sql (in order)
- executes each migration sql against pglite instance
- handles dependencies: storage buckets created before storage policies, auth.users before profiles trigger, etc.
- exports pglite instance for seeding and testing

**alternative considered**: use supabase cli with local postgres. rejected because pglite is already a dependency for test:creator-trust script, requires no separate postgres install, and runs in-process.

**migration application order**:
1. lovable migrations in filename order (20260429121931_*.sql through 20260512235827_*.sql)
2. foundation migrations 0001 through 0010 in numeric order

**error handling**: if any migration fails, log the failing sql and exit. do not proceed to seeding or testing with partial schema.

### component 2: identity and entity seeder

**purpose**: create auth.users, profiles, creator_profiles, market_accounts, orders, commission_requests, and other entities to represent test roles.

**implementation**:
- create `scripts/seed-security-test-data.mjs`
- takes pglite instance from schema builder
- inserts test users into auth.users with known uuids (hardcoded or generated deterministically)
- inserts corresponding profiles, user_roles, creator_profiles, market_accounts, etc.
- returns map of role names to uuids and entity ids for test assertions

**seeded identities**:

```javascript
const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@test.local',
    role: 'admin',
  },
  creator_alice: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'alice@test.local',
    handle: 'alice',
  },
  creator_bob: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'bob@test.local',
    handle: 'bob',
  },
  buyer_carol: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'carol@test.local',
  },
  commissioner_dave: {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'dave@test.local',
  },
  unrelated_eve: {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'eve@test.local',
  },
};
```

**seeded entities**:
- admin: insert into user_roles (user_id=admin, role='admin')
- alice: creator_profile (user_id=alice, username='alice'), market_account (handle='alice'), 2 artifacts (created_by=alice, creator_handle='alice', one published, one draft)
- bob: creator_profile (user_id=bob, username='bob'), market_account (handle='bob'), 1 artifact (published)
- carol: order (user_id=carol, artifact_id=alice's artifact, customer_email='carol@test.local')
- dave: commission_request (commissioner_user_id=dave, creator_handle='alice', status='new')
- eve: profile only, no creator_profile, no orders, no commissions (unrelated user for cross-account denial tests)

**cross-account isolation entities**:
- order_alice_to_bob: order (user_id=alice, artifact_id=bob's artifact) (alice bought from bob)
- order_unrelated: order (user_id=unrelated_eve, artifact_id=alice's artifact) (eve bought from alice)
- commission_to_bob: commission_request (commissioner_user_id=carol, creator_handle='bob') (carol commissioned bob)

**private data for leakage tests**:
- market_account for alice: access_key_hash='test_hash_alice', payout_details='{"account":"alice_bank"}', email='alice_payout@test.local'
- order for carol: shipping_address='123 test st', customer_email='carol@test.local'

### component 3: rls context setter

**purpose**: execute sql queries with `auth.uid()` set to specific test user, simulating authenticated role.

**implementation**:
- pglite supports `SET LOCAL` within transactions
- create helper function:

```javascript
async function queryAsRole(db, userId, sql) {
  return db.transaction(async (tx) => {
    if (userId) {
      await tx.exec(`SET LOCAL request.jwt.claims = '{"sub":"${userId}"}';`);
      await tx.exec(`SET LOCAL request.jwt.claim.sub = '${userId}';`);
      // supabase uses auth.uid() which reads from these settings
    }
    return tx.query(sql);
  });
}
```

**note**: pglite may not perfectly replicate supabase's auth.uid() implementation. if auth.uid() returns null in pglite, fall back to directly mocking the jwt claims format that has_role and rls policies expect, or use a test-specific role-setting function.

**alternative**: create test-only plpgsql function `set_test_auth_uid(uuid)` that sets session variables rls policies read.

### component 4: denial matrix test executor

**purpose**: run every cell in security/denial-test-matrix.md and assert expected outcome.

**implementation**:
- create `scripts/run-denial-matrix-tests.mjs`
- imports schema builder, seeder, rls context setter
- defines matrix as data structure (array of test cases)
- each test case:
  - role: 'guest' | 'buyer_carol' | 'commissioner_dave' | 'creator_alice' | 'admin' | 'unrelated_eve'
  - operation: 'select' | 'insert' | 'update' | 'delete'
  - table: 'commission_requests' | 'admin_ideas' | 'orders' | 'market_accounts' | ...
  - expected: 'allow' | 'deny' | 'allow_own' | 'deny_cross_account'
  - assertion: sql query and result check

**test case example**:

```javascript
{
  id: 'cr-01',
  description: 'guest cannot select commission_requests',
  role: 'guest',
  operation: 'select',
  table: 'commission_requests',
  sql: 'SELECT * FROM public.commission_requests;',
  expected: 'deny',
  assertion: (result) => result.rows.length === 0,
}
```

**positive control example**:

```javascript
{
  id: 'cr-02-positive',
  description: 'commissioner can select own commission_request (positive control)',
  role: 'commissioner_dave',
  operation: 'select',
  table: 'commission_requests',
  sql: `SELECT * FROM public.commission_requests WHERE commissioner_user_id = '${TEST_USERS.commissioner_dave.id}';`,
  expected: 'allow',
  assertion: (result) => result.rows.length === 1 && result.rows[0].commissioner_user_id === TEST_USERS.commissioner_dave.id,
}
```

**private column leakage test example**:

```javascript
{
  id: 'ma-01-leakage',
  description: 'guest cannot see access_key_hash via public view',
  role: 'guest',
  operation: 'select',
  table: 'market_accounts_public',
  sql: 'SELECT * FROM public.market_accounts_public WHERE handle = \'alice\';',
  expected: 'allow', // view is public
  assertion: (result) => {
    if (result.rows.length === 0) return false; // should see alice's public data
    const row = result.rows[0];
    return row.access_key_hash === undefined && row.payout_details === undefined && row.email === undefined;
  },
}
```

**grant vs rls distinction**:

```javascript
function categorizeError(error) {
  if (error.message.includes('permission denied for table')) {
    return 'grant_layer_block';
  }
  if (error.message.includes('row-level security')) {
    return 'rls_deny';
  }
  if (error.message.includes('check constraint')) {
    return 'rls_with_check_deny';
  }
  return 'unknown_error';
}
```

**output format**:
- total tests run
- passed: count and list
- failed: count, list with expected vs actual
- grant layer blocks: count and list (flag as potential setup error)
- summary table matching denial-test-matrix.md format with pass/fail annotations

### component 5: new migration drafter

**purpose**: if tests discover gaps, create corrective migration files.

**implementation**:
- manual process during development
- if test fails and root cause is missing policy or incorrect policy, create migrations/0011_*.sql with fix
- re-run schema builder with 0011 included
- re-run denial matrix tests
- iterate until all cells pass

**gap discovery criteria**:
- test expects deny but gets allow: policy too permissive
- test expects allow but gets deny: policy too restrictive or missing grant
- test expects allow but gets grant-layer block: missing grant in 0006 or table-specific revoke

## data flow

1. developer runs `npm run test:security-containment`
2. script calls schema builder: pglite instance with cumulative schema
3. script calls seeder: pglite now has test users and entities
4. script calls denial matrix executor: runs all test cases, records results
5. script outputs results to console and writes security/denial-test-results.md
6. if failures exist, developer analyzes, drafts corrective migration, re-runs from step 2

## migration application details

### lovable migrations in order

1. 20260429121931: initial schema (profiles, user_roles, artifacts, creator_profiles, market_accounts, orders, storage)
2. 20260429122004: harden search_path, revoke has_role execute, drop open market_accounts update, tighten orders insert
3. 20260429122035: add created_by to artifacts, user_id to creator_profiles, owner-scoped policies
4. 20260502195128: add collections table, seo fields to artifacts
5. 20260502200217: add commission_requests with anon insert and public read (vulnerable)
6. 20260503125015: (need to check content, likely features)
7. 20260503130507: (need to check content)
8. 20260504202012: (need to check content)
9. 20260504212857: (need to check content)
10. 20260505064442: (need to check content)
11. 20260505235720: (need to check content)
12. 20260507203814: creator_follows, creator_lists, creator_list_items
13. 20260508223346: (need to check content)
14. 20260510225657: creator_docs_notes
15. 20260511214818: manufacturers, platform_settings
16. 20260512235827: admin_ideas with open policies (vulnerable)

### foundation migrations in order

1. 0001: market_accounts_public view, admin-only base table read, admin role setup note
2. 0002: commissioner_user_id column, authenticated insert, participant read
3. 0003: admin_ideas admin-only policies
4. 0004: orders remove anon insert and email-equality read, add authenticated self-insert (temporary), add owner/creator/admin read
5. 0005: market_accounts remove anon insert, add owner create via creator_profile
6. 0006: grant usage and select/insert/update/delete to anon/authenticated on public schema
7. 0007: escrow_holds and ledger_entries, admin-only reads
8. 0008: orders.client_request_key column and unique index
9. 0009: sculptura_private.creator_trust tables, admin rpcs
10. 0010: sculptura_private.buyer_trust tables, admin rpcs

### dependencies

- auth.users must exist before profiles trigger (lovable 1)
- has_role function must exist before policies use it (lovable 1)
- market_accounts must exist before 0001 creates view over it (lovable 1)
- commission_requests must exist before 0002 alters it (lovable 5)
- admin_ideas must exist before 0003 alters policies (lovable 16)
- orders must exist before 0004, 0008 alter it (lovable 1)
- escrow_holds must exist before 0008 references it in comments (0007 before 0008)
- creator_trust_levels must exist before creator_trust references it (within 0009)
- creator_trust evidence validator must exist before buyer_trust uses it (0009 before 0010)

## test matrix cells

### commission_requests (req-4)

| operation | guest | commissioner (own) | other commissioner | addressed creator | admin |
|---|---|---|---|---|---|
| insert | deny | allow (uid set) | deny | deny | allow |
| select | deny | allow (own) | deny | allow (own handle) | allow (all) |
| update status=new | deny | allow (own) | deny | allow (own handle) | allow |
| update after acceptance | deny | deny | deny | allow (own handle) | allow |

**test cases**: 16 cells (4 operations × 5 roles, minus 1 duplicate)

### admin_ideas (req-5)

| operation | guest | buyer | creator | admin |
|---|---|---|---|---|
| select | deny | deny | deny | allow |
| insert | deny | deny | deny | allow |
| update | deny | deny | deny | allow |
| delete | deny | deny | deny | allow |

**test cases**: 16 cells (4 operations × 4 roles)

### orders (req-6)

| operation | guest | buyer (own) | other buyer | addressed creator | admin |
|---|---|---|---|---|---|
| insert | deny | allow (temp) | deny | deny | deny (server only) |
| select own/assigned | deny | allow | deny | allow (handle) | allow (all) |
| select email match only | deny | deny | deny | deny | n/a (policy removed) |

**test cases**: 14 cells (3 operation types × 5 roles, minus overlaps)

### market_accounts (req-7)

| operation | guest | owner (via key) | buyer | admin |
|---|---|---|---|---|
| select base table | deny | via service role | deny | allow |
| select public view | allow | allow | allow | allow |
| private columns leak | none | n/a | none | n/a (intentional) |

**test cases**: 8 cells (2 operations × 4 roles) + 3 leakage tests

### escrow_holds, ledger_entries (resolution 3)

| operation | guest | buyer | creator | admin |
|---|---|---|---|---|
| select | deny | deny | deny | allow |
| insert | deny | deny | deny | deny (service role only) |

**test cases**: 8 cells (2 tables × 2 operations × 2 roles, guest and admin only for brevity)

### sculptura_private trust models (resolution 3)

| operation | guest | buyer | creator | admin |
|---|---|---|---|---|
| select creator_trust | deny | deny | deny | allow (via rpc) |
| select buyer_trust | deny | deny | deny | allow (via rpc) |

**test cases**: 8 cells (2 tables × 4 roles)

**total test cases**: approximately 70 cells covering all req-4 through req-7 tables.

## file outputs

### scripts/build-security-test-db.mjs

exports `buildTestDatabase()` async function that returns pglite instance with full schema.

### scripts/seed-security-test-data.mjs

exports `seedTestData(db)` async function that inserts test users and entities, returns `TEST_USERS` and `TEST_ENTITIES` maps.

### scripts/run-denial-matrix-tests.mjs

main executable. calls buildTestDatabase, seedTestData, runs all matrix cells, outputs results.

### security/denial-test-results.md

generated output file. markdown table matching denial-test-matrix.md structure with pass/fail annotations, failure details, grant-layer block warnings, summary.

format:
```markdown
# denial test results

**test run**: 2026-10-01 (local pglite)
**migrations applied**: lovable 1-16, foundation 0001-0010
**total tests**: 70
**passed**: 68
**failed**: 2
**grant layer blocks**: 0

## commission_requests

| operation | guest | commissioner (own) | other commissioner | addressed creator | admin |
|---|---|---|---|---|---|
| insert | ✓ deny | ✓ allow | ✓ deny | ✓ deny | ✓ allow |
| select | ✓ deny | ✓ allow | ✓ deny | ✗ deny (expected allow) | ✓ allow |
...

## failures

### cr-select-creator
- **expected**: allow (addressed creator sees own requests)
- **actual**: deny (zero rows)
- **diagnosis**: missing join or incorrect handle comparison in policy
- **corrective action**: draft 0011 to fix creator clause

...
```

## testing strategy

### phase 1: schema build verification

run builder alone, verify:
- all 26 migrations apply without error
- tables exist: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- policies exist: `SELECT tablename, policyname FROM pg_policies;`
- grants exist: `SELECT grantee, privilege_type FROM information_schema.table_privileges WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');`

### phase 2: seed verification

run seeder, verify:
- 6 users in auth.users
- 6 profiles
- 1 admin role in user_roles
- 2 creator_profiles
- 2 market_accounts
- 3 artifacts
- 2 orders
- 2 commission_requests

### phase 3: single-cell smoke test

manually test one matrix cell (e.g., guest select commission_requests) to verify rls context setting works.

### phase 4: full matrix execution

run all 70 cells, record pass/fail.

### phase 5: gap correction iteration

for each failure:
- analyze root cause (missing policy, wrong condition, grant issue)
- draft corrective migration
- re-run from phase 1

## risk mitigation

### risk: pglite auth.uid() incompatibility

**mitigation**: if auth.uid() doesn't work in pglite, create test-specific function:

```sql
CREATE OR REPLACE FUNCTION public.test_set_auth_uid(p_uid uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_uid::text, true);
END;
$$;

-- modify has_role and policies to read from this config if auth.uid() is null
```

### risk: storage bucket policies untestable in pglite

**mitigation**: document storage policies as "deferred to platform rebuild" per policy-inventory.md. do not fail the security-containment leg on storage gaps.

### risk: discovered gaps require schema changes that conflict with deployed state

**mitigation**: corrective migrations are cumulative and additive. they do not drop existing data or break deployed apps. if a live supabase project is running on lovable migrations only, applying foundation 0001-0010 tightens security without data loss.

### risk: time budget expires before all cells pass

**mitigation**: record partial results. mark which cells passed, which failed, which were not run. handoff document states "X of 70 cells verified, Y failures documented with proposed fixes in draft migrations 0011-00N."

## handoff deliverables

1. `scripts/build-security-test-db.mjs` (schema builder)
2. `scripts/seed-security-test-data.mjs` (seeder)
3. `scripts/run-denial-matrix-tests.mjs` (test executor)
4. `security/denial-test-results.md` (recorded evidence)
5. `migrations/0011-00N.sql` (corrective migrations for discovered gaps, if any)
6. `security/deployment-state.md` (which migrations applied where, deployment authorization status)
7. updated `package.json` with `"test:security-containment": "node scripts/run-denial-matrix-tests.mjs"`

## next leg dependencies

**platform leg needs**:
- verified rls policies (this leg provides)
- decision on when to revoke authenticated order self-insert (conflict resolution 1)
- client admin password removal safe after 0003 applied (this leg verifies 0003)

**operations leg needs**:
- escrow/ledger state machine verification (this leg only proves admin-only access)
- idempotent purchase operation implementation (0008 provides the key, operations builds the operation)
