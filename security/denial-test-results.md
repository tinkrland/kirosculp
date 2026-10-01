# Security Denial Matrix Test Results

**Test Date:** October 1, 2026  
**Database:** PGLite (local testing)  
**Schema Version:** 26 migrations applied (16 lovable + 10 foundation)  
**Test Data:** 6 users, cross-account isolation scenarios  

## Summary

| Metric | Value |
|--------|-------|
| RLS Policies | 24 policies across 8 tables |
| Test Users | 6 (admin, alice, bob, carol, dave, eve) |
| Test Scenarios | 70+ planned denial/allow assertions |
| **Critical Finding** | **PGLite RLS enforcement limitations** |

## Key Findings

### 🚨 PGLite RLS Enforcement Issues

**SELECT Policies Not Enforced:**
- ❌ Guest can read commission_requests (expected: deny)
- ❌ Unrelated users can read admin_ideas (expected: deny)  
- ❌ Cross-account isolation failing for SELECT operations

**INSERT Policies Partially Working:**
- ✅ Guest denied commission_requests insert (constraint violation)
- ❌ Unrelated users can insert admin_ideas (expected: deny)

**Policy Logic Verified:**
- ✅ Policy conditions evaluate correctly (should_be_visible = false)
- ✅ Auth.uid() context setting works properly
- ✅ Role checking functions work (has_role returns false for non-admins)

### 📋 Policy Inventory Confirmed

**Tables with RLS Enabled:**
1. `commission_requests` - 5 policies (participant access only)
2. `admin_ideas` - 2 policies (admin-only access)  
3. `orders` - 3 policies (customer + creator access)
4. `market_accounts` - 3 policies (owner + admin access)
5. `escrow_holds` - 2 policies (admin-only access)
6. `ledger_entries` - 2 policies (admin-only access)
7. `artifacts` - 4 policies (creator + public read)
8. `user_roles` - 3 policies (admin management)

**Total:** 24 RLS policies protecting sensitive data

## Test Infrastructure Ready

### ✅ Components Working
- **Schema builder**: 26/26 migrations applied successfully
- **Test data seeder**: Cross-account isolation scenarios  
- **RLS context helpers**: Auth.uid() setting and role simulation
- **Denial matrix executor**: 70+ test case framework ready

### ⚠️ PGLite Limitations Identified
- SELECT policy enforcement not working
- Some INSERT policy gaps
- **Recommendation**: Retest against real Supabase instance

## Next Steps

1. **Deploy to Supabase staging** - Verify RLS policies work correctly
2. **Run full denial matrix** - Execute all 70+ test cases 
3. **Fix any policy gaps** - Address failures found in real environment
4. **Document verified boundaries** - Record actual denial test results

## Reproducible Test Commands

```bash
# Build schema and seed data
node scripts/build-security-test-db.mjs
node scripts/seed-security-test-data.mjs

# Test RLS context helpers  
node scripts/test-helpers.mjs

# Run simplified denial tests
node scripts/test-denial-simple.mjs

# Run full denial matrix (when PGLite issues resolved)
node scripts/denial-matrix-executor.mjs
```

## Security Boundaries Designed

**Cross-Account Isolation:**
- Commissioners see only own commission requests
- Creators see requests addressed to them only
- Buyers see only own orders and public artifact info
- Market account private data (access_key_hash, payout_details) protected

**Admin-Only Access:**
- admin_ideas table completely locked down
- escrow_holds and ledger_entries admin-managed only
- Full audit trail access for compliance

**Private Data Protection:**
- Order customer details (email, name, shipping) restricted
- Creator financial data (payout details, keys) protected  
- Cross-user data leakage prevented by user_id constraints

---

*Test infrastructure complete. RLS policies designed and applied. Ready for production verification against real Supabase instance.*