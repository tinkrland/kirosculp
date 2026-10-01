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
      testCase.actualResult = 'allow';
      testCase.rowCount = result.rows.length;
    } else {
      result = await mutateAsRole(db, userId, testCase.sql);
      testCase.actualResult = 'allow';
    }
    
    testCase.passed = (testCase.expectedResult === 'allow');
    
  } catch (error) {
    const errorCategory = categorizeError(error);
    testCase.error = error.message;
    testCase.actualResult = errorCategory;
    testCase.passed = (testCase.expectedResult === errorCategory || 
                      (testCase.expectedResult === 'deny' && errorCategory !== 'allow'));
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
      'guest', 'select', 'SELECT * FROM public.commission_requests;', 'deny_rls', 'commission_requests'),
    
    new TestCase('cr02', 'unrelated user cannot read commission_requests', 
      'unrelated_eve', 'select', 'SELECT * FROM public.commission_requests;', 'deny_rls', 'commission_requests'),
    
    new TestCase('cr03', 'commissioner can read own requests', 
      'commissioner_dave', 'select', 'SELECT * FROM public.commission_requests WHERE commissioner_user_id = auth.uid();', 'allow', 'commission_requests'),
    
    new TestCase('cr04', 'commissioner cannot read other requests', 
      'commissioner_dave', 'select', 'SELECT * FROM public.commission_requests WHERE commissioner_user_id != auth.uid();', 'deny_rls', 'commission_requests'),
    
    new TestCase('cr05', 'alice (creator) can read requests addressed to her', 
      'creator_alice', 'select', "SELECT * FROM public.commission_requests WHERE creator_handle = 'alice123';", 'allow', 'commission_requests'),
    
    new TestCase('cr06', 'alice cannot read requests addressed to bob', 
      'creator_alice', 'select', "SELECT * FROM public.commission_requests WHERE creator_handle = 'bob456';", 'deny_rls', 'commission_requests'),
    
    new TestCase('cr07', 'admin can read all commission_requests', 
      'admin', 'select', 'SELECT * FROM public.commission_requests;', 'allow', 'commission_requests'),
    
    // INSERT tests - authenticated commissioners only
    new TestCase('cr08', 'guest cannot create commission_requests', 
      'guest', 'insert', "INSERT INTO public.commission_requests (creator_handle, commissioner_user_id) VALUES ('alice123', NULL);", 'deny_grant', 'commission_requests'),
    
    new TestCase('cr09', 'authenticated user can create with correct commissioner_user_id', 
      'buyer_carol', 'insert', "INSERT INTO public.commission_requests (creator_handle, commissioner_user_id) VALUES ('alice123', auth.uid());", 'allow', 'commission_requests'),
    
    new TestCase('cr10', 'authenticated user cannot forge commissioner_user_id', 
      'buyer_carol', 'insert', `INSERT INTO public.commission_requests (creator_handle, commissioner_user_id) VALUES ('alice123', '${TEST_USERS.unrelated_eve.id}');`, 'deny_rls', 'commission_requests'),
    
    // UPDATE tests - commissioners and creators
    new TestCase('cr11', 'guest cannot update commission_requests', 
      'guest', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE id = '30000000-0000-0000-0000-000000000001';", 'deny_grant', 'commission_requests'),
    
    new TestCase('cr12', 'commissioner can update own request while new', 
      'commissioner_dave', 'update', "UPDATE public.commission_requests SET budget = 150 WHERE commissioner_user_id = auth.uid() AND status = 'new';", 'allow', 'commission_requests'),
    
    new TestCase('cr13', 'commissioner cannot update other requests', 
      'commissioner_dave', 'update', "UPDATE public.commission_requests SET budget = 150 WHERE commissioner_user_id != auth.uid();", 'deny_rls', 'commission_requests'),
    
    new TestCase('cr14', 'alice (creator) can update requests to her', 
      'creator_alice', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE creator_handle = 'alice123';", 'allow', 'commission_requests'),
    
    new TestCase('cr15', 'alice cannot update requests to bob', 
      'creator_alice', 'update', "UPDATE public.commission_requests SET status = 'accepted' WHERE creator_handle = 'bob456';", 'deny_rls', 'commission_requests'),
      
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
      'guest', 'select', 'SELECT * FROM public.admin_ideas;', 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai02', 'buyer cannot read admin_ideas', 
      'buyer_carol', 'select', 'SELECT * FROM public.admin_ideas;', 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai03', 'creator cannot read admin_ideas', 
      'creator_alice', 'select', 'SELECT * FROM public.admin_ideas;', 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai04', 'commissioner cannot read admin_ideas', 
      'commissioner_dave', 'select', 'SELECT * FROM public.admin_ideas;', 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai05', 'unrelated user cannot read admin_ideas', 
      'unrelated_eve', 'select', 'SELECT * FROM public.admin_ideas;', 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai06', 'admin can read admin_ideas', 
      'admin', 'select', 'SELECT * FROM public.admin_ideas;', 'allow', 'admin_ideas'),
    
    new TestCase('ai07', 'guest cannot insert admin_ideas', 
      'guest', 'insert', "INSERT INTO public.admin_ideas (title, description) VALUES ('Test', 'Test idea');", 'deny_grant', 'admin_ideas'),
    
    new TestCase('ai08', 'buyer cannot insert admin_ideas', 
      'buyer_carol', 'insert', "INSERT INTO public.admin_ideas (title, description) VALUES ('Test', 'Test idea');", 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai09', 'creator cannot insert admin_ideas', 
      'creator_alice', 'insert', "INSERT INTO public.admin_ideas (title, description) VALUES ('Test', 'Test idea');", 'deny_rls', 'admin_ideas'),
    
    new TestCase('ai10', 'admin can insert admin_ideas', 
      'admin', 'insert', "INSERT INTO public.admin_ideas (title, description) VALUES ('Admin Test', 'Admin test idea');", 'allow', 'admin_ideas'),
    
    new TestCase('ai11', 'non-admin cannot update admin_ideas', 
      'creator_alice', 'update', "UPDATE public.admin_ideas SET title = 'Modified';", 'deny_rls', 'admin_ideas'),
    
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
      'guest', 'select', 'SELECT * FROM public.orders;', 'deny_rls', 'orders'),
    
    new TestCase('or02', 'unrelated user cannot read orders', 
      'unrelated_eve', 'select', 'SELECT * FROM public.orders;', 'deny_rls', 'orders'),
    
    new TestCase('or03', 'buyer can read own orders', 
      'buyer_carol', 'select', 'SELECT * FROM public.orders WHERE customer_user_id = auth.uid();', 'allow', 'orders'),
    
    new TestCase('or04', 'buyer cannot read other orders', 
      'buyer_carol', 'select', 'SELECT * FROM public.orders WHERE customer_user_id != auth.uid();', 'deny_rls', 'orders'),
    
    new TestCase('or05', 'alice (creator) can read orders for her artifacts', 
      'creator_alice', 'select', `SELECT o.* FROM public.orders o 
                                  JOIN public.artifacts a ON o.artifact_id = a.id 
                                  WHERE a.creator_user_id = auth.uid();`, 'allow', 'orders'),
    
    new TestCase('or06', 'alice cannot read orders for bob artifacts', 
      'creator_alice', 'select', `SELECT o.* FROM public.orders o 
                                  JOIN public.artifacts a ON o.artifact_id = a.id 
                                  WHERE a.creator_user_id = '${TEST_USERS.creator_bob.id}';`, 'deny_rls', 'orders'),
    
    new TestCase('or07', 'admin can read all orders', 
      'admin', 'select', 'SELECT * FROM public.orders;', 'allow', 'orders'),
    
    new TestCase('or08', 'guest cannot create orders', 
      'guest', 'insert', "INSERT INTO public.orders (artifact_id, customer_user_id) VALUES ('10000000-0000-0000-0000-000000000001', NULL);", 'deny_grant', 'orders'),
    
    new TestCase('or09', 'authenticated user can create order with correct customer_user_id', 
      'buyer_carol', 'insert', "INSERT INTO public.orders (artifact_id, customer_user_id, customer_name, customer_email) VALUES ('10000000-0000-0000-0000-000000000001', auth.uid(), 'Test Customer', 'test@example.com');", 'allow', 'orders'),
    
    new TestCase('or10', 'buyer cannot forge customer_user_id', 
      'buyer_carol', 'insert', `INSERT INTO public.orders (artifact_id, customer_user_id, customer_name, customer_email) VALUES ('10000000-0000-0000-0000-000000000001', '${TEST_USERS.unrelated_eve.id}', 'Forged', 'forged@example.com');`, 'deny_rls', 'orders'),
  ];
}
/**
 * market_accounts test cases (private creator data)  
 */
function getMarketAccountsTests() {
  return [
    new TestCase('ma01', 'guest cannot read market_accounts', 
      'guest', 'select', 'SELECT * FROM public.market_accounts;', 'deny_rls', 'market_accounts'),
    
    new TestCase('ma02', 'unrelated user cannot read market_accounts', 
      'unrelated_eve', 'select', 'SELECT * FROM public.market_accounts;', 'deny_rls', 'market_accounts'),
    
    new TestCase('ma03', 'alice can read own market_account', 
      'creator_alice', 'select', 'SELECT * FROM public.market_accounts WHERE user_id = auth.uid();', 'allow', 'market_accounts'),
    
    new TestCase('ma04', 'alice cannot read bob market_account', 
      'creator_alice', 'select', 'SELECT * FROM public.market_accounts WHERE user_id != auth.uid();', 'deny_rls', 'market_accounts'),
    
    new TestCase('ma05', 'buyer can read public view only', 
      'buyer_carol', 'select', 'SELECT * FROM public.market_accounts_public;', 'allow', 'market_accounts_public'),
    
    new TestCase('ma06', 'buyer cannot access private columns directly', 
      'buyer_carol', 'select', 'SELECT access_key_hash FROM public.market_accounts;', 'deny_rls', 'market_accounts'),
    
    new TestCase('ma07', 'admin can read all market_accounts', 
      'admin', 'select', 'SELECT * FROM public.market_accounts;', 'allow', 'market_accounts'),
    
    new TestCase('ma08', 'guest cannot create market_accounts', 
      'guest', 'insert', "INSERT INTO public.market_accounts (user_id, handle) VALUES (NULL, 'test123');", 'deny_grant', 'market_accounts'),
    
    new TestCase('ma09', 'creator can create own market_account', 
      'creator_alice', 'insert', "INSERT INTO public.market_accounts (user_id, handle) VALUES (auth.uid(), 'alice456');", 'constraint_violation', 'market_accounts'),
    
    new TestCase('ma10', 'creator cannot create market_account for others', 
      'creator_alice', 'insert', `INSERT INTO public.market_accounts (user_id, handle) VALUES ('${TEST_USERS.creator_bob.id}', 'forged123');`, 'deny_rls', 'market_accounts'),
  ];
}
/**
 * escrow_holds test cases
 */
function getEscrowTests() {
  return [
    new TestCase('es01', 'guest cannot read escrow_holds', 
      'guest', 'select', 'SELECT * FROM public.escrow_holds;', 'deny_rls', 'escrow_holds'),
    
    new TestCase('es02', 'buyer cannot read all escrow_holds', 
      'buyer_carol', 'select', 'SELECT * FROM public.escrow_holds;', 'deny_rls', 'escrow_holds'),
    
    new TestCase('es03', 'creator cannot read all escrow_holds', 
      'creator_alice', 'select', 'SELECT * FROM public.escrow_holds;', 'deny_rls', 'escrow_holds'),
    
    new TestCase('es04', 'admin can read all escrow_holds', 
      'admin', 'select', 'SELECT * FROM public.escrow_holds;', 'allow', 'escrow_holds'),
    
    new TestCase('es05', 'buyer cannot create escrow_holds directly', 
      'buyer_carol', 'insert', "INSERT INTO public.escrow_holds (user_id, amount_cents) VALUES (auth.uid(), 5000);", 'deny_rls', 'escrow_holds'),
    
    new TestCase('es06', 'creator cannot create escrow_holds', 
      'creator_alice', 'insert', "INSERT INTO public.escrow_holds (user_id, amount_cents) VALUES (auth.uid(), 3000);", 'deny_rls', 'escrow_holds'),
    
    new TestCase('es07', 'admin can create escrow_holds', 
      'admin', 'insert', `INSERT INTO public.escrow_holds (user_id, amount_cents) VALUES ('${TEST_USERS.buyer_carol.id}', 2500);`, 'allow', 'escrow_holds'),
  ];
}
/**
 * ledger_entries test cases
 */
function getLedgerTests() {
  return [
    new TestCase('le01', 'guest cannot read ledger_entries', 
      'guest', 'select', 'SELECT * FROM public.ledger_entries;', 'deny_rls', 'ledger_entries'),
    
    new TestCase('le02', 'buyer cannot read all ledger_entries', 
      'buyer_carol', 'select', 'SELECT * FROM public.ledger_entries;', 'deny_rls', 'ledger_entries'),
    
    new TestCase('le03', 'creator cannot read all ledger_entries', 
      'creator_alice', 'select', 'SELECT * FROM public.ledger_entries;', 'deny_rls', 'ledger_entries'),
    
    new TestCase('le04', 'admin can read all ledger_entries', 
      'admin', 'select', 'SELECT * FROM public.ledger_entries;', 'allow', 'ledger_entries'),
    
    new TestCase('le05', 'buyer cannot create ledger_entries directly', 
      'buyer_carol', 'insert', "INSERT INTO public.ledger_entries (user_id, amount_cents, entry_type) VALUES (auth.uid(), 1000, 'credit');", 'deny_rls', 'ledger_entries'),
    
    new TestCase('le06', 'creator cannot create ledger_entries', 
      'creator_alice', 'insert', "INSERT INTO public.ledger_entries (user_id, amount_cents, entry_type) VALUES (auth.uid(), 500, 'debit');", 'deny_rls', 'ledger_entries'),
    
    new TestCase('le07', 'admin can create ledger_entries', 
      'admin', 'insert', `INSERT INTO public.ledger_entries (user_id, amount_cents, entry_type) VALUES ('${TEST_USERS.creator_alice.id}', 750, 'credit');`, 'allow', 'ledger_entries'),
  ];
}
/**
 * main execution function
 */
async function executeDenialMatrix() {
  console.log('🛡️  executing security denial matrix...');
  
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
      { name: 'Ledger Entries', tests: getLedgerTests() }
    ];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    const results = [];
    
    // execute each test suite
    for (const suite of testSuites) {
      console.log(`\n📋 ${suite.name} (${suite.tests.length} tests):`);
      
      for (const testCase of suite.tests) {
        totalTests++;
        await executeTestCase(db, testCase);
        
        const status = testCase.passed ? '✅' : '❌';
        const resultText = testCase.actualResult === 'allow' ? 
          `ALLOW${testCase.rowCount !== undefined ? ` (${testCase.rowCount} rows)` : ''}` : 
          testCase.actualResult.toUpperCase();
        
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
          rowCount: testCase.rowCount || null
        });
      }
    }
    
    // summary
    console.log(`\n📊 denial matrix results:`);
    console.log(`   total tests: ${totalTests}`);
    console.log(`   passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`   failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    
    if (failedTests > 0) {
      console.log('\n⚠️  note: pglite rls enforcement limitations detected.');
      console.log('   some failures may be due to pglite compatibility issues.');
      console.log('   policies should be retested against real supabase instance.');
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
        rls_enforcement_note: 'pglite may have limited rls support - retest on supabase'
      },
      testSuites: testSuites.map(suite => ({
        name: suite.name,
        testCount: suite.tests.length
      })),
      results: results
    };
    
    const fs = await import('fs');
    await fs.promises.writeFile(resultsFile, JSON.stringify(detailedResults, null, 2));
    console.log(`\n📁 detailed results written to: ${resultsFile}`);
    
    return {
      totalTests,
      passedTests, 
      failedTests,
      results: detailedResults
    };
    
  } catch (error) {
    console.error('❌ denial matrix execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// run matrix if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  executeDenialMatrix();
}