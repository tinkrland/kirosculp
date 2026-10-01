# security-containment tasks

## task dependencies

```
task-01 → task-02 → task-03 → task-04 → task-05 → task-06
                                          ↓
                                        task-07 (if gaps found)
                                          ↓
                                        task-04 (re-run)
```

## task-01: create schema builder script

**depends on**: none

**requirement**: req-1 (reproducible cumulative schema replay)

**acceptance test**: script runs without error, produces pglite instance with all tables from lovable + foundation migrations

**implementation**:
1. create `scripts/build-security-test-db.mjs`
2. import `@electric-sql/pglite`
3. read migration files from `what-exists/lovable/supabase/migrations/` (sorted by filename)
4. read migration files from `migrations/0001-0010.sql` (in numeric order)
5. create new pglite instance (in-memory or temp file)
6. execute each migration sql against the instance
7. log each migration application (filename, success/error)
8. export async function `buildTestDatabase()` that returns initialized db instance

**files created**:
- `scripts/build-security-test-db.mjs`

**verification command**:
```bash
node scripts/build-security-test-db.mjs
```

**expected output**:
```
applied 20260429121931_9c9604ec-b6a3-42b5-9f02-c438b5ab8101.sql
applied 20260429122004_f718597b-59ba-4308-923e-fd9aec0b81d3.sql
...
applied migrations/0009_private_creator_trust.sql
applied migrations/0010_private_buyer_trust.sql
schema build complete: 26 migrations applied
```

**manual verification after task-01**:
```javascript
import { buildTestDatabase } from './scripts/build-security-test-db.mjs';
const db = await buildTestDatabase();
const tables = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;');
console.log('tables:', tables.rows.map(r => r.table_name));
// expect: admin_ideas, artifacts, collections, commission_requests, creator_docs_notes, creator_follows, creator_list_items, creator_lists, creator_profiles, escrow_holds, ledger_entries, manufacturers, market_accounts, orders, platform_settings, profiles, user_roles
```

---

## task-02: create test data seeder script

**depends on**: task-01 (requires db instance)

**requirement**: req-2 (seeded test roles and identities)

**acceptance test**: seeder inserts 6 users, 6 profiles, 1 admin role, 2 creator_profiles, 2 market_accounts, 3 artifacts, 2 orders, 2 commission_requests without error

**implementation**:
1. create `scripts/seed-security-test-data.mjs`
2. define `TEST_USERS` constant with fixed uuids for guest, admin, alice, bob, carol, dave, eve
3. define `TEST_ENTITIES` constant with fixed ids for artifacts, orders, commissions
4. export async function `seedTestData(db)` that:
   - inserts 6 users into auth.users (id, email, raw_user_meta_data with display_name)
   - inserts 6 profiles (trigger may handle this, or insert directly)
   - inserts 1 user_role (admin)
   - inserts 2 creator_profiles (alice, bob with user_id and username)
   - inserts 2 market_accounts (alice, bob with handle, access_key_hash, payout_details, email, status='active')
   - inserts 3 artifacts (2 for alice, 1 for bob; created_by, creator_handle, status='published' or 'draft')
   - inserts 2 orders (carol bought from alice, eve bought from alice; user_id, artifact_id, customer_email, shipping_address)
   - inserts 2 commission_requests (dave to alice, carol to bob; commissioner_user_id, creator_handle, status='new')
   - returns `{ users: TEST_USERS, entities: TEST_ENTITIES }`

**files created**:
- `scripts/seed-security-test-data.mjs`

**verification command**:
```bash
node -e "import('./scripts/build-security-test-db.mjs').then(m => m.buildTestDatabase()).then(db => import('./scripts/seed-security-test-data.mjs').then(s => s.seedTestData(db))).then(() => console.log('seed complete'));"
```

**expected output**:
```
seed complete
```

**manual verification after task-02**:
```javascript
const db = await buildTestDatabase();
await seedTestData(db);
const userCount = await db.query('SELECT COUNT(*) FROM auth.users;');
console.log('users:', userCount.rows[0].count); // expect: 6
const adminCount = await db.query('SELECT COUNT(*) FROM public.user_roles WHERE role = \'admin\';');
console.log('admins:', adminCount.rows[0].count); // expect: 1
```

---

## task-03: create rls context helper

**depends on**: task-01 (requires db instance)

**requirement**: req-3 (executable test harness with role context)

**acceptance test**: helper function sets auth.uid() context, query returns correct result based on rls policy

**implementation**:
1. create `scripts/test-helpers.mjs`
2. export async function `queryAsRole(db, userId, sql)`:
   - if userId is null, run as guest (no auth context)
   - if userId is set, use pglite transaction with `SET LOCAL` to set jwt claims
   - execute sql query within transaction
   - return query result
3. test with smoke test: insert commission_request as dave, query as dave (should see), query as eve (should not see)

**files created**:
- `scripts/test-helpers.mjs`

**verification command**: smoke test within task-03 implementation

**expected behavior**:
```javascript
const db = await buildTestDatabase();
await seedTestData(db);
const daveResult = await queryAsRole(db, TEST_USERS.commissioner_dave.id, 'SELECT * FROM public.commission_requests;');
console.log('dave sees:', daveResult.rows.length); // expect: 1 (own request)
const eveResult = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT * FROM public.commission_requests;');
console.log('eve sees:', eveResult.rows.length); // expect: 0 (cross-account deny)
```

---

## task-04: create denial matrix test executor

**depends on**: task-01, task-02, task-03 (requires schema, seed data, rls context)

**requirement**: req-3, req-4, req-5, req-6, req-7, req-8 (all matrix cells)

**acceptance test**: executor runs all 70+ test cases, outputs pass/fail for each cell, distinguishes grant vs rls errors

**implementation**:
1. create `scripts/run-denial-matrix-tests.mjs`
2. import buildTestDatabase, seedTestData, queryAsRole
3. define MATRIX_TESTS array with all test cases:
   - commission_requests: 16 cells
   - admin_ideas: 16 cells
   - orders: 14 cells
   - market_accounts: 8 cells + 3 leakage tests
   - escrow_holds, ledger_entries: 8 cells
   - creator_trust, buyer_trust: 8 cells
4. for each test case:
   - run sql query as specified role
   - assert expected outcome (allow: rows returned or mutation succeeds; deny: zero rows or error)
   - categorize errors (grant_layer_block vs rls_deny vs rls_with_check_deny)
   - record pass/fail
5. output results to console (summary table)
6. write results to `security/denial-test-results.md` (detailed markdown)
7. exit with code 0 if all pass, code 1 if any failures

**files created**:
- `scripts/run-denial-matrix-tests.mjs`
- `security/denial-test-results.md` (generated output)

**verification command**:
```bash
node scripts/run-denial-matrix-tests.mjs
```

**expected output** (if all pass):
```
running 70 denial matrix tests...
✓ cr-01: guest cannot select commission_requests
✓ cr-02: commissioner can select own commission_request
...
✓ bt-08: admin can call admin_get_buyer_trust

summary:
  total: 70
  passed: 70
  failed: 0
  grant blocks: 0

all tests passed
```

**expected output** (if failures):
```
running 70 denial matrix tests...
✓ cr-01: guest cannot select commission_requests
✗ cr-03: addressed creator can select commission_requests
  expected: allow (1 row)
  actual: deny (0 rows)
  diagnosis: policy condition incorrect
...

summary:
  total: 70
  passed: 68
  failed: 2
  grant blocks: 0

failures require corrective migrations
```

**update package.json**:
```json
{
  "scripts": {
    "test:security-containment": "node scripts/run-denial-matrix-tests.mjs"
  }
}
```

---

## task-05: run initial test pass and record results

**depends on**: task-04 (requires test executor)

**requirement**: req-12 (recorded evidence)

**acceptance test**: denial-test-results.md exists with pass/fail counts, failure details, deployment state

**implementation**:
1. run `npm run test:security-containment`
2. review output
3. if all pass: proceed to task-06
4. if failures: proceed to task-07

**files created/updated**:
- `security/denial-test-results.md` (auto-generated by task-04 script)

**manual review checklist**:
- [ ] guest-role cells match 2026-09-26 recorded results (commission_requests deny, admin_ideas deny, orders deny, market_accounts public view allow)
- [ ] authenticated-role cells (buyer, commissioner, creator, admin) now have results (previously unverified)
- [ ] cross-account isolation cells pass (buyer A cannot see buyer B's order)
- [ ] private-column leakage tests pass (access_key_hash not visible via public view)
- [ ] grant-layer blocks are zero or minimal (no blanket permission denied where rls should apply)

---

## task-06: document final deployment state and handoff

**depends on**: task-05 (requires test results)

**requirement**: req-12 (deployment state and unresolved decisions)

**acceptance test**: deployment-state.md exists, lists migrations applied locally, deployment authorization status, unresolved conflicts, next-leg dependencies

**implementation**:
1. create `security/deployment-state.md`
2. document:
   - migrations applied to local test database (lovable 1-16, foundation 0001-0010, plus any from task-07)
   - migrations known to be applied to live supabase projects (0001-0006 to clmcmckaydkbkxuhfiyf per 2026-09-26, 0007-0010 unknown)
   - unresolved policy conflicts (from requirements.md conflict 1-3, with resolutions documented in design.md)
   - remaining risks (storage policies deferred, service-role input validation deferred, rate limits/audit deferred)
   - deployment authorization: "no live deployment performed by this session. applying 0001-0010 to sculptura.dev supabase project requires separate authorization."
   - next-leg handoff: platform leg can safely remove client admin password (0003 verified), operations leg owns idempotent purchase operation (0004/0008 provide foundation)

**files created**:
- `security/deployment-state.md`

**verification**: manual review of deployment-state.md for completeness

---

## task-07: draft corrective migrations for failures (conditional)

**depends on**: task-05 (requires test results showing failures)

**requirement**: req-10 (corrective migrations for demonstrated gaps)

**acceptance test**: new migrations 0011-00N exist, re-running tests after applying them shows failures resolved

**implementation** (only if task-05 shows failures):
1. analyze each failure from denial-test-results.md
2. identify root cause:
   - missing policy: draft policy creation sql
   - incorrect policy condition: draft policy replacement sql
   - missing grant: add grant statement to 0006 or new migration
   - schema gap: add column, constraint, or function
3. create migrations/0011_*.sql (and 0012, 0013... as needed) with corrective sql
4. update scripts/build-security-test-db.mjs to include new migrations
5. re-run task-04 (test executor)
6. repeat until all tests pass or time budget expires

**files created** (examples, actual depend on failures):
- `migrations/0011_commission_creator_read_fix.sql` (if creator cannot see addressed requests)
- `migrations/0012_orders_guest_access_token.sql` (if guest order access mechanism needed)

**iteration loop**:
```
draft migration → update builder → re-run tests → review results → repeat if needed
```

**stop condition**: all tests pass, or time budget expires (record partial progress in deployment-state.md)

---

## task-08: commit and push to agent-instructions branch

**depends on**: task-06 (requires complete deliverables)

**requirement**: handoff line 77-80 (keep .kiro/specs on agent-instructions, implementation on main-based branch)

**acceptance test**: .kiro/specs/security-containment/* committed to agent-instructions branch, scripts/* and migrations/* committed to kiro/security-containment branch

**implementation**:
1. from .kiro-instructions worktree:
   ```bash
   cd .kiro-instructions
   git add .kiro/specs/security-containment/
   git commit -m "security: add security-containment spec

   requirements: 12 traced requirements with policy conflict resolutions
   design: pglite-based local test system, 70+ matrix cells, gap correction flow
   tasks: 8 dependency-ordered implementation tasks"
   git push origin agent-instructions
   ```

2. from main repository (kiro/security-containment branch):
   ```bash
   git add scripts/build-security-test-db.mjs
   git add scripts/seed-security-test-data.mjs
   git add scripts/test-helpers.mjs
   git add scripts/run-denial-matrix-tests.mjs
   git add security/denial-test-results.md
   git add security/deployment-state.md
   git add migrations/0011-*.sql  # if created in task-07
   git add package.json  # for test:security-containment script
   git commit -m "security: implement denial matrix test harness

   build reproducible cumulative schema from 16 lovable + 10 foundation migrations.
   seed test roles: guest, buyer, commissioner, creator, admin, unrelated.
   run 70+ matrix cells proving rls policies prevent unauthorized access.
   
   results: X of 70 cells passed. [failures | all passed].
   corrective migrations: [none needed | 0011-00N applied].
   
   see security/denial-test-results.md for detailed evidence.
   see security/deployment-state.md for deployment status and next-leg handoff."
   git push origin kiro/security-containment
   ```

**files committed**:
- agent-instructions branch: `.kiro/specs/security-containment/*.md`
- kiro/security-containment branch: `scripts/*.mjs`, `security/*.md`, `migrations/0011-*.sql` (if any), `package.json`

**verification**: both branches pushed to origin, commits visible in github/gitlab

---

## summary of deliverables

after all tasks complete:

**on agent-instructions branch**:
- `.kiro/specs/security-containment/requirements.md` (12 requirements, policy conflicts, source evidence)
- `.kiro/specs/security-containment/design.md` (architecture, conflict resolutions, 70+ test cases)
- `.kiro/specs/security-containment/tasks.md` (this file, 8 dependency-ordered tasks)

**on kiro/security-containment branch**:
- `scripts/build-security-test-db.mjs` (schema builder)
- `scripts/seed-security-test-data.mjs` (test data seeder)
- `scripts/test-helpers.mjs` (rls context setter)
- `scripts/run-denial-matrix-tests.mjs` (matrix executor)
- `security/denial-test-results.md` (recorded evidence)
- `security/deployment-state.md` (deployment status, handoff)
- `migrations/0011-00N.sql` (corrective migrations, if any)
- `package.json` (updated with test:security-containment script)

**reproducible commands**:
```bash
# setup
npm install

# run full test suite
npm run test:security-containment

# verify existing validation still passes
npm run validate
```

**time estimate**:
- task-01: 2-3 hours (migration file handling, pglite setup, edge cases)
- task-02: 2-3 hours (test data design, cross-account isolation entities, private data)
- task-03: 1-2 hours (rls context setting, pglite auth.uid() compatibility)
- task-04: 4-6 hours (70+ test cases, assertion logic, error categorization, output formatting)
- task-05: 1 hour (run tests, review results)
- task-06: 1-2 hours (deployment state documentation, handoff writing)
- task-07: 2-8 hours (depends on number of gaps found, iteration cycles)
- task-08: 1 hour (commit, push, verification)

**total estimated time**: 14-26 hours, well within 24-hour working window. if time budget is tight, task-07 iteration can be time-boxed: record partial progress, mark remaining failures as "requires corrective migration 0011 (drafted but not verified)" in deployment-state.md.
