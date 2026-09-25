# denial test matrix: prove the intended access, not the absence of bugs

a fix without a denial test is not done. this matrix is the acceptance test for the corrective migrations ([0001](../migrations/0001_admin_roles_and_market_account_privacy.sql) through [0004](../migrations/0004_orders_purchase_path.sql)). each cell is the outcome the cumulative policy state must produce: **allow** or **deny**. anything else is a failing test.

roles: guest (anon), buyer (authenticated, no profile), commissioner (authenticated, owns a commission request), creator (authenticated, owns a creator_profile with handle), admin (authenticated with the admin role). service-role code bypasses rls by design and is out of matrix scope; it gets its own provenance tests.

## commission_requests (after 0002)

| operation | guest | commissioner (own) | other commissioner | addressed creator | admin |
|---|---|---|---|---|---|
| insert | deny | allow (uid set) | deny | deny | allow |
| select | deny | allow (own) | deny | allow (own handle) | allow (all) |
| update while status = new | deny | allow (own) | deny | allow (own handle) | allow |
| update after acceptance | deny | deny | deny | allow (own handle) | allow |

## admin_ideas (after 0003)

| operation | guest | buyer | creator | admin |
|---|---|---|---|---|
| select / insert / update / delete | deny | deny | deny | allow |

## orders (after 0004)

| operation | guest | buyer (own order) | other buyer | addressed creator | admin |
|---|---|---|---|---|---|
| insert | deny | allow (user_id = uid) | deny | deny | deny (server operation only) |
| select own/assigned | deny | allow | deny | allow (own handle) | allow (all) |
| select by email match only | deny | deny | deny | deny | n/a (policy no longer exists) |

the "select by email match only" row is the regression test for the removed email-equality policy: a buyer who registered with an email that appears on someone's order must not see that order.

## market_accounts (after 0001)

| operation | guest | owner via access key | buyer | admin |
|---|---|---|---|---|
| select base table | deny | via service role (bypass) | deny | allow |
| select market_accounts_public view | allow | allow | allow | allow |

## how to run it

each cell maps to one assertion in a supabase test harness (or one manual psql session per role) against a database with the full migration history plus 0001 through 0004 applied. seed one row per role relationship, run the operation, assert the outcome. the test harness is a security-leg deliverable; until it exists, this matrix is the manual review script, and no cell may be marked verified without a recorded run.

## priorities

1. commission_requests public read (was live pii exposure)
2. admin_ideas all operations (was admin-functionality exposure)
3. orders email-equality read and anon insert
4. market_accounts private columns

results are recorded here as dated entries when runs happen; until then, **no cell is verified**.
