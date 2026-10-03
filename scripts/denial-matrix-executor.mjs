#!/usr/bin/env node
// denial-matrix-executor.mjs
//
// comprehensive security denial matrix testing for sculptura rls policies.
// tests 70+ allow/deny assertions across guest, buyer, commissioner, creator, admin roles.
//
// usage: node scripts/denial-matrix-executor.mjs

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole, mutateAsRole, categorizeError } from './test-helpers.mjs';

/**
 * denial matrix test case definition
 */
class TestCase {
  constructor(id, description, role, operation, sql, expectedResult, table = null) {
    this.id = id;
    this.description = description;
    this.role = role; // guest, buyer, commissioner, creator, admin, unrelated
    this.operation = operation; // select, insert, update, delete
    this.sql = sql;
    this.expectedResult = expectedResult; // allow, deny_rls, deny_grant, constraint_violation
    this.table = table;
    this.actualResult = null;
    this.error = null;
    this.passed = false;
  }
}

/**
 * execute a single test case and record results
 */
async function executeTestCase(db, testCase) {
  const userId = getUserId(testCase.role);
  
  try {
    let result;
    if (testCase.operation === 'select') {
      result = await queryAsRole(db, userId, testCase.sql);
      testCase.rowCount = result.rows.length;
      
      // rls denies selects by filtering to zero rows, not by erroring
      if (testCase.rowCount === 0) {
        testCase.actualResult = 'rls_deny';
      } else {
        testCase.actualResult = 'allow';
      }
    } else {
      result = await mutateAsRole(db, userId, testCase.sql);
      
      // mutateAsRole returns an array, get the first result
      const mutationResult = Array.isArray(result) ? result[0] : result;
      
      // check if any rows were affected
      let affectedCount = 0;
      if (mutationResult && mutationResult.affectedRows !== undefined) {
        affectedCount = mutationResult.affectedRows;
      } else if (mutationResult && mutationResult.rowCount !== undefined) {
        affectedCount = mutationResult.rowCount;
      } else if (mutationResult && mutationResult.changes !== undefined) {
        affectedCount = mutationResult.changes;
      }
      
      // rls denies mutations by affecting zero rows, not by erroring
      if (affectedCount === 0) {
        testCase.actualResult = 'rls_deny';
        testCase.affectedRows = 0;
      } else {
        testCase.actualResult = 'allow';
        testCase.affectedRows = affectedCount;
      }
    }
    
  } catch (error) {
    const errorCategory = categorizeError(error);
    testCase.error = error.message;
    testCase.actualResult = errorCategory;
  }
  
  // evaluate pass/fail based on expected vs actual result
  if (testCase.expectedResult === 'deny') {
    // when expecting deny, accept rls_deny, grant_layer_block, or other denial categories
    testCase.passed = (testCase.actualResult === 'rls_deny' || 
                      testCase.actualResult === 'grant_layer_block' ||
                      testCase.actualResult === 'rls_with_check_deny');
  } else if (testCase.expectedResult === 'allow') {
    testCase.passed = (testCase.actualResult === 'allow');
  } else {
    // specific error expected (constraint_violation, etc)
    testCase.passed = (testCase.actualResult === testCase.expectedResult);
  }
  
  return testCase;
}

/**
 * get user id for role name
 */
function getUserId(role) {
  const roleMap = {
    'guest': null,
    'admin': TEST_USERS.admin.id,
    'creator_alice': TEST_USERS.creator_alice.id, 
    'creator_bob': TEST_USERS.creator_bob.id,
    'buyer_carol': TEST_USERS.buyer_carol.id,
    'commissioner_dave': TEST_USERS.commissioner_dave.id,
    'unrelated_eve': TEST_USERS.unrelated_eve.id
  };
  return roleMap[role];
}
/**
 * commission_requests test cases
 */
function getCommissionRequestsTests() {
  return [
    // SELECT tests - cross-account isolation
    new TestCase('cr01', 'guest cannot read commission_requests', 
      'guest', 'select', 'SELECT * FROM public.commission_requests;', 'deny', 'commission_requests'),
    
    new TestCase('cr02', 'unrelated user cannot read commission_requests', 
      'unrelated_eve', 'select', 'SELECT * FROM public.commission_requests;', 'deny', 'commission_requests'),
    
    new TestCase('cr03', 'commissioner can read own requests', 
      'commissioner_dave', 'select', 'SELECT * FROM public.commission_requests WHERE commissioner_user_id = auth.uid();', 'allow', 'commission_requests'),
    
    new TestCase('cr04', 'commissioner cannot read other requests', 
      'commissioner_dave', 'select', 'SELECT * FROM public.commission_requests WHERE commissioner_user_id != auth.uid();', 'deny', 'commission_requests'),
    
    new TestCase('cr05', 'alice (creator) can read requests addressed to her', 
      'creator_alice', 'select', "SELECT * FROM public.commission_requests WHERE creator_handle = 'alice123';", 'allow', 'commission_requests'),
    
    new TestCase('cr06', 'alice cannot read requests addressed to bob', 
      'creator_alice', 'select', "SELECT * FROM public.commission_requests WHERE creator_handle = 'bob456';", 'deny', 'commission_requests'),
    
    new TestCase('cr07', 'admin can read all commission_requests', 
      'admin', 'select', 'SELECT * FROM public.commission_requests;', 'allow', 'commission_requests'),
    
    // INSERT tests - authenticated commissioners only
    new TestCase('cr08', 'guest cannot create commission_requests', 
      'guest', 'insert', "INSERT INTO public.commission_requests (creator_handle, customer_name, customer_email, description, commissioner_user_id) VALUES ('alice123', 'Guest', 'guest@test.com', 'test request', NULL);", 'deny', 'commission_requests'),
    
    new TestCase('cr09', 'authenticated user can create with correct commissioner_user_id', 
      'buyer_carol', 'insert', "INSERT INTO public.commission_requests (creator_handle, customer_name, customer_email, description, commissioner_user_id) VALUES ('alice123', 'Carol', 'carol@test.local', 'commissioned piece', auth.uid());", 'allow', 'commission_requests'),
    
    new TestCase('cr10', 'authenticated user cannot forge commissioner_user_id', 
      'buyer_carol', 'insert', `INSERT INTO public.commission_requests (creator_handle, customer_name, customer_email, description, commissioner_user_id) VALUES ('alice123', 'Forged', 'forged@test.com', 'forged request', '${TEST_USERS.unrelated_eve.id}');`, 'deny', 'commission_requests'),
    
    // UPDATE tests - commissioners and creators
    new TestCase('cr11', 'guest cannot update commission_requests', 
      'guest', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE id = '30000000-0000-0000-0000-000000000001';", 'deny', 'commission_requests'),
    
    new TestCase('cr12', 'commissioner can update own request while new', 
      'commissioner_dave', 'update', "UPDATE public.commission_requests SET budget = 150 WHERE commissioner_user_id = auth.uid() AND status = 'new';", 'allow', 'commission_requests'),
    
    new TestCase('cr13', 'commissioner cannot update other requests', 
      'commissioner_dave', 'update', "UPDATE public.commission_requests SET budget = 150 WHERE commissioner_user_id != auth.uid();", 'deny', 'commission_requests'),
    
    new TestCase('cr14', 'alice (creator) can update requests to her', 
      'creator_alice', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE creator_handle = 'alice123';", 'allow', 'commission_requests'),
    
    new TestCase('cr15', 'alice cannot update requests to bob', 
      'creator_alice', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE creator_handle = 'bob456';", 'deny', 'commission_requests'),
      
    new TestCase('cr16', 'admin can update all commission_requests', 
      'admin', 'update', "UPDATE public.commission_requests SET status = 'under_review';", 'allow', 'commission_requests'),
  ];
}
/**
 * admin_ideas test cases
 */
function getAdminIdeasTests() {
  return [
    new TestCase('ai01', 'guest cannot read admin_ideas', 
      'guest', 'select', 'SELECT * FROM public.admin_ideas;', 'deny', 'admin_ideas'),
    
    new TestCase('ai02', 'buyer cannot read admin_ideas', 
      'buyer_carol', 'select', 'SELECT * FROM public.admin_ideas;', 'deny', 'admin_ideas'),
    
    new TestCase('ai03', 'creator cannot read admin_ideas', 
      'creator_alice', 'select', 'SELECT * FROM public.admin_ideas;', 'deny', 'admin_ideas'),
    
    new TestCase('ai04', 'commissioner cannot read admin_ideas', 
      'commissioner_dave', 'select', 'SELECT * FROM public.admin_ideas;', 'deny', 'admin_ideas'),
    
    new TestCase('ai05', 'unrelated user cannot read admin_ideas', 
      'unrelated_eve', 'select', 'SELECT * FROM public.admin_ideas;', 'deny', 'admin_ideas'),
    
    new TestCase('ai06', 'admin can read admin_ideas', 
      'admin', 'select', 'SELECT * FROM public.admin_ideas;', 'allow', 'admin_ideas'),
    
    new TestCase('ai07', 'guest cannot insert admin_ideas', 
      'guest', 'insert', "INSERT INTO public.admin_ideas (title, content) VALUES ('Test', 'Test idea');", 'deny', 'admin_ideas'),
    
    new TestCase('ai08', 'buyer cannot insert admin_ideas', 
      'buyer_carol', 'insert', "INSERT INTO public.admin_ideas (title, content) VALUES ('Test', 'Test');", 'deny', 'admin_ideas'),
    
    new TestCase('ai09', 'creator cannot insert admin_ideas', 
      'creator_alice', 'insert', "INSERT INTO public.admin_ideas (title, content) VALUES ('Test', 'Test');", 'deny', 'admin_ideas'),
    
    new TestCase('ai10', 'admin can insert admin_ideas', 
      'admin', 'insert', "INSERT INTO public.admin_ideas (title, content) VALUES ('Admin Test', 'Admin test idea');", 'allow', 'admin_ideas'),
    
    new TestCase('ai11', 'non-admin cannot update admin_ideas', 
      'creator_alice', 'update', "UPDATE public.admin_ideas SET title = 'Modified';", 'deny', 'admin_ideas'),
    
    new TestCase('ai12', 'admin can update admin_ideas', 
      'admin', 'update', "UPDATE public.admin_ideas SET title = 'Updated by Admin';", 'allow', 'admin_ideas'),
  ];
}
/**
 * orders test cases (private customer data)
 */
function getOrdersTests() {
  return [
    new TestCase('or01', 'guest cannot read orders', 
      'guest', 'select', 'SELECT * FROM public.orders;', 'deny', 'orders'),
    
    new TestCase('or02', 'unrelated user can read own orders only', 
      'unrelated_eve', 'select', 'SELECT * FROM public.orders WHERE user_id = auth.uid();', 'allow', 'orders'),
    
    new TestCase('or02b', 'unrelated user cannot read other user orders', 
      'unrelated_eve', 'select', 'SELECT * FROM public.orders WHERE user_id != auth.uid();', 'deny', 'orders'),
    
    new TestCase('or03', 'buyer can read own orders', 
      'buyer_carol', 'select', 'SELECT * FROM public.orders WHERE user_id = auth.uid();', 'allow', 'orders'),
    
    new TestCase('or04', 'buyer cannot read other orders', 
      'buyer_carol', 'select', 'SELECT * FROM public.orders WHERE user_id != auth.uid();', 'deny', 'orders'),
    
    new TestCase('or05', 'alice (creator) can read orders for her artifacts', 
      'creator_alice', 'select', `SELECT o.* FROM public.orders o 
                                  JOIN public.artifacts a ON o.artifact_id = a.id 
                                  WHERE a.creator_handle = 'alice123';`, 'allow', 'orders'),
    
    new TestCase('or06', 'alice cannot read orders for bob artifacts', 
      'creator_alice', 'select', `SELECT o.* FROM public.orders o 
                                  JOIN public.artifacts a ON o.artifact_id = a.id 
                                  WHERE a.creator_handle = 'bob456';`, 'deny', 'orders'),
    
    new TestCase('or07', 'admin can read all orders', 
      'admin', 'select', 'SELECT * FROM public.orders;', 'allow', 'orders'),
    
    new TestCase('or08', 'guest cannot create orders', 
      'guest', 'insert', "INSERT INTO public.orders (artifact_id, user_id, customer_email, customer_name, price) VALUES ('10000000-0000-0000-0000-000000000001', NULL, 'guest@test.com', 'Guest', 100);", 'deny', 'orders'),
    
    new TestCase('or09', 'authenticated user can create order with correct user_id', 
      'buyer_carol', 'insert', "INSERT INTO public.orders (artifact_id, user_id, customer_email, customer_name, price) VALUES ('10000000-0000-0000-0000-000000000001', auth.uid(), 'carol@test.local', 'Carol', 150);", 'allow', 'orders'),
    
    new TestCase('or10', 'buyer cannot forge user_id', 
      'buyer_carol', 'insert', `INSERT INTO public.orders (artifact_id, user_id, customer_email, customer_name, price) VALUES ('10000000-0000-0000-0000-000000000001', '${TEST_USERS.unrelated_eve.id}', 'forged@test.com', 'Forged', 200);`, 'deny', 'orders'),
  ];
}
/**
 * market_accounts test cases (private creator data)  
 */
function getMarketAccountsTests() {
  return [
    new TestCase('ma01', 'guest cannot read market_accounts base table', 
      'guest', 'select', 'SELECT * FROM public.market_accounts;', 'deny', 'market_accounts'),
    
    new TestCase('ma02', 'unrelated user cannot read market_accounts base table', 
      'unrelated_eve', 'select', 'SELECT * FROM public.market_accounts;', 'deny', 'market_accounts'),
    
    new TestCase('ma03', 'alice cannot read market_accounts base table', 
      'creator_alice', 'select', 'SELECT * FROM public.market_accounts;', 'deny', 'market_accounts'),
    
    new TestCase('ma04', 'buyer cannot read market_accounts base table', 
      'buyer_carol', 'select', 'SELECT * FROM public.market_accounts;', 'deny', 'market_accounts'),
    
    new TestCase('ma05', 'buyer can read public view only', 
      'buyer_carol', 'select', 'SELECT * FROM public.market_accounts_public;', 'allow', 'market_accounts_public'),
    
    new TestCase('ma06', 'guest can read public view', 
      'guest', 'select', 'SELECT * FROM public.market_accounts_public;', 'allow', 'market_accounts_public'),
    
    new TestCase('ma07', 'admin can read all market_accounts base table', 
      'admin', 'select', 'SELECT * FROM public.market_accounts;', 'allow', 'market_accounts'),
    
    new TestCase('ma08', 'guest cannot create market_accounts', 
      'guest', 'insert', "INSERT INTO public.market_accounts (handle, email, access_key_hash, status) VALUES ('test123', 'test@test.com', 'hash123', 'draft');", 'deny', 'market_accounts'),
    
    new TestCase('ma09', 'creator cannot create market_account for handle they do not own', 
      'creator_alice', 'insert', "INSERT INTO public.market_accounts (handle, email, access_key_hash, status) VALUES ('alice999', 'alice@test.com', 'hash456', 'draft');", 'deny', 'market_accounts'),
    
    new TestCase('ma10', 'authenticated user cannot create market_account in active status', 
      'creator_alice', 'insert', "INSERT INTO public.market_accounts (handle, email, access_key_hash, status) VALUES ('alice789', 'alice2@test.com', 'hash789', 'active');", 'deny', 'market_accounts'),
  ];
}
/**
 * escrow_holds test cases (grant layer revokes all client access)
 */
function getEscrowTests() {
  return [
    new TestCase('es01', 'guest cannot read escrow_holds', 
      'guest', 'select', 'SELECT * FROM public.escrow_holds;', 'deny', 'escrow_holds'),
    
    new TestCase('es02', 'buyer cannot read escrow_holds', 
      'buyer_carol', 'select', 'SELECT * FROM public.escrow_holds;', 'deny', 'escrow_holds'),
    
    new TestCase('es03', 'creator cannot read escrow_holds', 
      'creator_alice', 'select', 'SELECT * FROM public.escrow_holds;', 'deny', 'escrow_holds'),
    
    new TestCase('es04', 'admin cannot read escrow_holds from client', 
      'admin', 'select', 'SELECT * FROM public.escrow_holds;', 'deny', 'escrow_holds'),
    
    new TestCase('es05', 'buyer cannot insert escrow_holds', 
      'buyer_carol', 'insert', "INSERT INTO public.escrow_holds (kind, amount_cents) VALUES ('order', 5000);", 'deny', 'escrow_holds'),
    
    new TestCase('es06', 'creator cannot insert escrow_holds', 
      'creator_alice', 'insert', "INSERT INTO public.escrow_holds (kind, amount_cents) VALUES ('commission', 3000);", 'deny', 'escrow_holds'),
    
    new TestCase('es07', 'admin cannot insert escrow_holds from client', 
      'admin', 'insert', "INSERT INTO public.escrow_holds (kind, amount_cents) VALUES ('order', 2500);", 'deny', 'escrow_holds'),
  ];
}
/**
 * ledger_entries test cases (grant layer revokes all client access, append-only even for service_role)
 */
function getLedgerTests() {
  return [
    new TestCase('le01', 'guest cannot read ledger_entries', 
      'guest', 'select', 'SELECT * FROM public.ledger_entries;', 'deny', 'ledger_entries'),
    
    new TestCase('le02', 'buyer cannot read ledger_entries', 
      'buyer_carol', 'select', 'SELECT * FROM public.ledger_entries;', 'deny', 'ledger_entries'),
    
    new TestCase('le03', 'creator cannot read ledger_entries', 
      'creator_alice', 'select', 'SELECT * FROM public.ledger_entries;', 'deny', 'ledger_entries'),
    
    new TestCase('le04', 'admin cannot read ledger_entries from client', 
      'admin', 'select', 'SELECT * FROM public.ledger_entries;', 'deny', 'ledger_entries'),
    
    new TestCase('le05', 'buyer cannot insert ledger_entries', 
      'buyer_carol', 'insert', "INSERT INTO public.ledger_entries (group_id, account, direction, amount_cents) VALUES (gen_random_uuid(), 'buyer_source', 'debit', 1000);", 'deny', 'ledger_entries'),
    
    new TestCase('le06', 'creator cannot insert ledger_entries', 
      'creator_alice', 'insert', "INSERT INTO public.ledger_entries (group_id, account, direction, amount_cents) VALUES (gen_random_uuid(), 'creator_payable', 'credit', 500);", 'deny', 'ledger_entries'),
    
    new TestCase('le07', 'admin cannot insert ledger_entries from client', 
      'admin', 'insert', "INSERT INTO public.ledger_entries (group_id, account, direction, amount_cents) VALUES (gen_random_uuid(), 'platform_fee', 'credit', 750);", 'deny', 'ledger_entries'),
  ];
}

/**
 * artifacts test cases (authenticated role access control)
 */
function getArtifactsTests() {
  return [
    new TestCase('ar01', 'guest can read published artifacts only', 
      'guest', 'select', "SELECT * FROM public.artifacts WHERE status = 'published';", 'allow', 'artifacts'),
    
    new TestCase('ar02', 'guest cannot read draft artifacts', 
      'guest', 'select', "SELECT * FROM public.artifacts WHERE status = 'draft';", 'deny', 'artifacts'),
    
    new TestCase('ar03', 'buyer can read published artifacts', 
      'buyer_carol', 'select', "SELECT * FROM public.artifacts WHERE status = 'published';", 'allow', 'artifacts'),
    
    new TestCase('ar04', 'buyer cannot read draft artifacts', 
      'buyer_carol', 'select', "SELECT * FROM public.artifacts WHERE status = 'draft';", 'deny', 'artifacts'),
    
    new TestCase('ar05', 'alice can read own draft artifacts', 
      'creator_alice', 'select', "SELECT * FROM public.artifacts WHERE created_by = auth.uid() AND status = 'draft';", 'allow', 'artifacts'),
    
    new TestCase('ar06', 'alice cannot read bob draft artifacts', 
      'creator_alice', 'select', "SELECT * FROM public.artifacts WHERE created_by != auth.uid() AND status = 'draft';", 'deny', 'artifacts'),
    
    new TestCase('ar07', 'admin can read all artifacts including drafts', 
      'admin', 'select', "SELECT * FROM public.artifacts;", 'allow', 'artifacts'),
    
    new TestCase('ar08', 'guest cannot insert artifacts', 
      'guest', 'insert', "INSERT INTO public.artifacts (name, description, status, created_by) VALUES ('Test', 'Test artifact', 'draft', NULL);", 'deny', 'artifacts'),
    
    new TestCase('ar09', 'buyer cannot insert artifacts', 
      'buyer_carol', 'insert', "INSERT INTO public.artifacts (name, description, status, created_by) VALUES ('Test', 'Test', 'draft', auth.uid());", 'deny', 'artifacts'),
    
    new TestCase('ar10', 'creator can insert artifacts with own created_by', 
      'creator_alice', 'insert', "INSERT INTO public.artifacts (name, description, status, created_by, creator_handle) VALUES ('New Ring', 'Test', 'draft', auth.uid(), 'alice123');", 'allow', 'artifacts'),
    
    new TestCase('ar11', 'alice can update own artifacts', 
      'creator_alice', 'update', "UPDATE public.artifacts SET description = 'Updated' WHERE created_by = auth.uid();", 'allow', 'artifacts'),
    
    new TestCase('ar12', 'alice cannot update bob artifacts', 
      'creator_alice', 'update', "UPDATE public.artifacts SET description = 'Hijacked' WHERE created_by != auth.uid();", 'deny', 'artifacts'),
    
    new TestCase('ar13', 'admin can update all artifacts', 
      'admin', 'update', "UPDATE public.artifacts SET status = 'published';", 'allow', 'artifacts'),
  ];
}

/**
 * creator_profiles test cases (authenticated role access control)
 */
function getCreatorProfilesTests() {
  return [
    new TestCase('cp01', 'guest can read all creator_profiles', 
      'guest', 'select', 'SELECT * FROM public.creator_profiles;', 'allow', 'creator_profiles'),
    
    new TestCase('cp02', 'buyer can read all creator_profiles', 
      'buyer_carol', 'select', 'SELECT * FROM public.creator_profiles;', 'allow', 'creator_profiles'),
    
    new TestCase('cp03', 'creator can read all creator_profiles', 
      'creator_alice', 'select', 'SELECT * FROM public.creator_profiles;', 'allow', 'creator_profiles'),
    
    new TestCase('cp04', 'admin can read all creator_profiles', 
      'admin', 'select', 'SELECT * FROM public.creator_profiles;', 'allow', 'creator_profiles'),
    
    new TestCase('cp05', 'guest cannot insert creator_profiles', 
      'guest', 'insert', "INSERT INTO public.creator_profiles (user_id, username, display_name) VALUES (NULL, 'guest123', 'Guest');", 'deny', 'creator_profiles'),
    
    new TestCase('cp06', 'buyer cannot insert creator_profiles', 
      'buyer_carol', 'insert', "INSERT INTO public.creator_profiles (user_id, username, display_name) VALUES (auth.uid(), 'carol123', 'Carol');", 'deny', 'creator_profiles'),
    
    new TestCase('cp07', 'creator can insert own creator_profile', 
      'creator_bob', 'insert', "INSERT INTO public.creator_profiles (user_id, username, display_name, user_email) VALUES (auth.uid(), 'bob_new', 'Bob New', 'bob_new@test.local');", 'allow', 'creator_profiles'),
    
    new TestCase('cp08', 'alice can update own creator_profile', 
      'creator_alice', 'update', "UPDATE public.creator_profiles SET bio = 'Updated bio' WHERE user_id = auth.uid();", 'allow', 'creator_profiles'),
    
    new TestCase('cp09', 'alice cannot update bob creator_profile', 
      'creator_alice', 'update', "UPDATE public.creator_profiles SET bio = 'Hijacked' WHERE user_id != auth.uid();", 'deny', 'creator_profiles'),
    
    new TestCase('cp10', 'buyer cannot update creator_profiles', 
      'buyer_carol', 'update', "UPDATE public.creator_profiles SET commission_open = false;", 'deny', 'creator_profiles'),
    
    new TestCase('cp11', 'admin can update all creator_profiles', 
      'admin', 'update', "UPDATE public.creator_profiles SET commission_open = true;", 'allow', 'creator_profiles'),
  ];
}

/**
 * profiles test cases (authenticated role access control)
 */
function getProfilesTests() {
  return [
    new TestCase('pr01', 'guest can read all profiles', 
      'guest', 'select', 'SELECT * FROM public.profiles;', 'allow', 'profiles'),
    
    new TestCase('pr02', 'buyer can read all profiles', 
      'buyer_carol', 'select', 'SELECT * FROM public.profiles;', 'allow', 'profiles'),
    
    new TestCase('pr03', 'creator can read all profiles', 
      'creator_alice', 'select', 'SELECT * FROM public.profiles;', 'allow', 'profiles'),
    
    new TestCase('pr04', 'admin can read all profiles', 
      'admin', 'select', 'SELECT * FROM public.profiles;', 'allow', 'profiles'),
    
    new TestCase('pr05', 'guest cannot insert profiles', 
      'guest', 'insert', "INSERT INTO public.profiles (id, email, display_name) VALUES (gen_random_uuid(), 'guest@test.com', 'Guest');", 'deny', 'profiles'),
    
    new TestCase('pr06', 'buyer can insert own profile', 
      'buyer_carol', 'insert', "INSERT INTO public.profiles (id, email, display_name) VALUES (auth.uid(), 'carol_new@test.local', 'Carol New');", 'allow', 'profiles'),
    
    new TestCase('pr07', 'buyer can update own profile', 
      'buyer_carol', 'update', "UPDATE public.profiles SET display_name = 'Carol Updated' WHERE id = auth.uid();", 'allow', 'profiles'),
    
    new TestCase('pr08', 'buyer cannot update other profiles', 
      'buyer_carol', 'update', "UPDATE public.profiles SET display_name = 'Hijacked' WHERE id != auth.uid();", 'deny', 'profiles'),
    
    new TestCase('pr09', 'creator can update own profile', 
      'creator_alice', 'update', "UPDATE public.profiles SET display_name = 'Alice Updated' WHERE id = auth.uid();", 'allow', 'profiles'),
    
    new TestCase('pr10', 'admin can update all profiles', 
      'admin', 'update', "UPDATE public.profiles SET display_name = display_name || ' (verified)';", 'allow', 'profiles'),
  ];
}

/**
 * user_roles test cases (admin management only)
 */
function getUserRolesTests() {
  return [
    new TestCase('ur01', 'guest cannot read user_roles', 
      'guest', 'select', 'SELECT * FROM public.user_roles;', 'deny', 'user_roles'),
    
    new TestCase('ur02', 'buyer cannot read user_roles', 
      'buyer_carol', 'select', 'SELECT * FROM public.user_roles;', 'deny', 'user_roles'),
    
    new TestCase('ur03', 'creator cannot read user_roles', 
      'creator_alice', 'select', 'SELECT * FROM public.user_roles;', 'deny', 'user_roles'),
    
    new TestCase('ur04', 'admin can read user_roles', 
      'admin', 'select', 'SELECT * FROM public.user_roles;', 'allow', 'user_roles'),
    
    new TestCase('ur05', 'guest cannot insert user_roles', 
      'guest', 'insert', "INSERT INTO public.user_roles (user_id, role) VALUES (gen_random_uuid(), 'admin');", 'deny', 'user_roles'),
    
    new TestCase('ur06', 'buyer cannot self-promote to admin', 
      'buyer_carol', 'insert', "INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');", 'deny', 'user_roles'),
    
    new TestCase('ur07', 'creator cannot self-promote to admin', 
      'creator_alice', 'insert', "INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');", 'deny', 'user_roles'),
    
    new TestCase('ur08', 'admin can insert user_roles', 
      'admin', 'insert', `INSERT INTO public.user_roles (user_id, role) VALUES ('${TEST_USERS.buyer_carol.id}', 'admin');`, 'allow', 'user_roles'),
    
    new TestCase('ur09', 'buyer cannot update user_roles', 
      'buyer_carol', 'update', "UPDATE public.user_roles SET role = 'admin';", 'deny', 'user_roles'),
    
    new TestCase('ur10', 'admin can update user_roles', 
      'admin', 'update', "UPDATE public.user_roles SET role = 'member' WHERE role = 'admin';", 'allow', 'user_roles'),
    
    new TestCase('ur11', 'buyer cannot delete user_roles', 
      'buyer_carol', 'delete', "DELETE FROM public.user_roles WHERE user_id = auth.uid();", 'deny', 'user_roles'),
    
    new TestCase('ur12', 'admin can delete user_roles', 
      'admin', 'delete', "DELETE FROM public.user_roles WHERE role = 'member';", 'allow', 'user_roles'),
  ];
}
/**
 * main execution function
 */
export async function executeDenialMatrix() {
  console.log('executing security denial matrix...\n');
  
  try {
    // build database and seed data
    const db = await buildTestDatabase();
    await seedTestData(db);
    
    // collect all test cases
    const testSuites = [
      { name: 'Commission Requests', tests: getCommissionRequestsTests() },
      { name: 'Admin Ideas', tests: getAdminIdeasTests() },
      { name: 'Orders', tests: getOrdersTests() },
      { name: 'Market Accounts', tests: getMarketAccountsTests() },
      { name: 'Escrow Holds', tests: getEscrowTests() },
      { name: 'Ledger Entries', tests: getLedgerTests() },
      { name: 'Artifacts', tests: getArtifactsTests() },
      { name: 'Creator Profiles', tests: getCreatorProfilesTests() },
      { name: 'Profiles', tests: getProfilesTests() },
      { name: 'User Roles', tests: getUserRolesTests() }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    const results = [];
    
    // execute each test suite
    for (const suite of testSuites) {
      console.log(`\n${suite.name} (${suite.tests.length} tests):`);
      
      for (const testCase of suite.tests) {
        totalTests++;
        await executeTestCase(db, testCase);
        
        const status = testCase.passed ? 'pass' : 'FAIL';
        let resultText;
        if (testCase.actualResult === 'allow') {
          if (testCase.rowCount !== undefined) {
            resultText = `ALLOW (${testCase.rowCount} rows)`;
          } else if (testCase.affectedRows !== undefined) {
            resultText = `ALLOW (${testCase.affectedRows} affected)`;
          } else {
            resultText = 'ALLOW';
          }
        } else {
          resultText = testCase.actualResult.toUpperCase().replace(/_/g, ' ');
        }
        
        console.log(`  ${status} ${testCase.id}: ${testCase.description}`);
        console.log(`     expected: ${testCase.expectedResult.toUpperCase()}, got: ${resultText}`);
        
        if (!testCase.passed && testCase.error) {
          console.log(`     error: ${testCase.error.substring(0, 80)}...`);
        }
        
        if (testCase.passed) {
          passedTests++;
        } else {
          failedTests++;
        }
        
        results.push({
          suite: suite.name,
          id: testCase.id,
          description: testCase.description,
          role: testCase.role,
          table: testCase.table,
          operation: testCase.operation,
          expected: testCase.expectedResult,
          actual: testCase.actualResult,
          passed: testCase.passed,
          error: testCase.error || null,
          rowCount: testCase.rowCount !== undefined ? testCase.rowCount : null,
          affectedRows: testCase.affectedRows !== undefined ? testCase.affectedRows : null
        });
      }
    }
    
    // summary
    console.log(`\ndenial matrix results:`);
    console.log(`   total tests: ${totalTests}`);
    console.log(`   passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`   failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    
    if (failedTests === 0) {
      console.log('\nall tests passed. rls policies and grant layer working correctly.');
    } else {
      console.log(`\n${failedTests} test(s) failed. review results for details.`);
    }
    
    // write detailed results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `security/denial-test-results-${timestamp}.json`;
    
    const detailedResults = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate: Math.round(passedTests/totalTests*100)
      },
      environment: {
        database: 'pglite',
        note: 'grant layer correctly blocks client access to money tables (escrow_holds, ledger_entries). admin reads those tables server-side via service_role, not from client.'
      },
      testSuites: testSuites.map(suite => ({
        name: suite.name,
        testCount: suite.tests.length
      })),
      results: results
    };
    
    const fs = await import('fs');
    await fs.promises.writeFile(resultsFile, JSON.stringify(detailedResults, null, 2));
    console.log(`\ndetailed results written to: ${resultsFile}`);
    
    return {
      totalTests,
      passedTests, 
      failedTests,
      results: detailedResults
    };
    
  } catch (error) {
    console.error('denial matrix execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// run matrix if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  executeDenialMatrix();
}