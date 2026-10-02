# security denial matrix test results

**test date:** october 1, 2026 (corrected matrix cases)
**database:** pglite (local testing)
**schema version:** 26 migrations applied (16 lovable + 10 foundation)
**test data:** 6 users, cross-account isolation scenarios
**rls enforcement:** working correctly with set role

## summary

| metric | value |
|--------|-------|
| total test cases | 63 (corrected matrix) |
| passed | 63 (100%) |
| failed | 0 (0%) |
| rls policies | 42 policies across 17 tables |
| test users | 6 (admin, alice, bob, carol, dave, eve) |
| **status** | **security leg complete, full matrix green** |

## key findings

### corrected denial evaluation and schema issues

**denial evaluation logic fixed:**
- select queries: rls blocks by returning 0 rows (not errors)
- mutation queries: rls blocks by affecting 0 rows (not errors)
- grant layer blocks: permission errors before rls evaluation
- executor now properly evaluates all denial mechanisms

**schema corrections applied:**
- ledger_entries uses group_id (not user_id as imagined)
- market_accounts access via handle + creator_profile ownership (migration 0005)
- commission_requests insert requires not null columns (customer_name, customer_email, description)
- orders policy allows buyers to read own orders (user_id = auth.uid())

### grant layer working correctly

**money tables access control verified:**
- migration 0007 explicitly revokes all on escrow_holds, ledger_entries from client roles
- grant layer blocks client access before rls evaluation (stronger than policies alone)
- admin reads money tables server-side via service_role only, not from client sessions
- all 14 money table test cases passing (7 escrow_holds + 7 ledger_entries)

### complete matrix results by table

**commission_requests (16 tests): 16/16 passing**
- cross-account isolation enforced
- commissioner/creator ownership verified
- insert/update authorization working

**admin_ideas (12 tests): 12/12 passing**
- admin-only access enforced
- all non-admin roles properly denied

**orders (11 tests): 11/11 passing**
- buyer ownership verified
- creator artifact access working
- cross-account isolation confirmed

**market_accounts (10 tests): 10/10 passing**
- private financial data protected
- public view accessible
- creator_profile ownership enforcement

**escrow_holds (7 tests): 7/7 passing**
- grant layer blocks all client access
- admin properly blocked from client context

**ledger_entries (7 tests): 7/7 passing**
- grant layer blocks all client access
- append-only even for service_role (out of scope for client tests)

## recorded test evidence

### full matrix execution (october 1, 2026)

method: local pglite with full migration replay, cross-account test data, set role auth context

```
Commission Requests (16 tests): 16/16 passing
Admin Ideas (12 tests): 12/12 passing  
Orders (11 tests): 11/11 passing
Market Accounts (10 tests): 10/10 passing
Escrow Holds (7 tests): 7/7 passing
Ledger Entries (7 tests): 7/7 passing

denial matrix results:
   total tests: 63
   passed: 63 (100%)
   failed: 0 (0%)

all tests passed. rls policies and grant layer working correctly.
```

### policy inventory confirmed

**42 rls policies across 17 tables:**
- admin_ideas: 4 policies (admin-only access)
- artifacts: 4 policies (creator + public read)
- collections: 2 policies
- commission_requests: 5 policies (participant access only)
- creator_docs_notes: 2 policies
- creator_follows: 3 policies
- creator_list_items: 2 policies
- creator_lists: 2 policies
- creator_profiles: 3 policies
- escrow_holds: 1 policy (admin read only, grant layer blocks clients)
- ledger_entries: 1 policy (admin read only, grant layer blocks clients)
- manufacturers: 1 policy
- market_accounts: 3 policies (admin base table, public view)
- orders: 3 policies (buyer/creator/admin access)
- platform_settings: 1 policy
- profiles: 3 policies
- user_roles: 2 policies (admin management)

## security boundaries verified

**grant + rls layered security model:**
- grant layer: controls table-level access permissions
- rls layer: controls row-level visibility within allowed tables
- money tables: grant layer revokes client access entirely
- application tables: grant layer allows, rls policies filter rows
- both layers working correctly and enforcing as designed

**cross-account isolation confirmed:**
- commissioners see only own commission requests
- creators see requests addressed to them only
- buyers see only own orders
- unrelated users denied sensitive data access
- admin role properly elevated access

**private data protection verified:**
- order customer details restricted to participants
- creator financial data protected in market_accounts base table
- money tables (escrow_holds, ledger_entries) completely blocked from client access
- admin_ideas restricted to admin role only

## reproducible test commands

```bash
# build schema, seed test data, then run full corrected matrix (63 tests)
# executor imports build-security-test-db.mjs, seed-security-test-data.mjs, test-helpers.mjs
node scripts/denial-matrix-executor.mjs

# count rls policies in the built database
node scripts/count-policies.mjs
```

## findings summary

**original issues corrected:**
- matrix cases were written against imagined schema, not actual migrations
- denial evaluation logic was incorrectly treating 0-row results as success
- market_accounts ownership model changed in migration 0005 but tests not updated

**corrected implementation:**
- rls policies working correctly in pglite with set role mechanism
- grant layer correctly blocks client access to money tables
- 63 test cases covering all roles and access patterns now passing
- proper evaluation of rls filtering (0 rows) vs grant blocking (errors)

**security leg status: complete**
- full matrix green: 63/63 test cases passing
- 42 rls policies enforcing cross-account isolation and data protection
- grant layer + rls security model verified working
- money table protection and application data access controls confirmed
- comprehensive test evidence recorded for deployment confidence

---

*denial matrix corrected against actual schema, evaluation logic fixed, full 63-case run green. security-containment leg complete with verified grant layer + rls protection.*