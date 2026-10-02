#!/usr/bin/env node
// test-helpers.mjs
//
// helper functions for security denial matrix testing.
// provides role-based query execution with auth.uid() context.
//
// usage:
//   import { queryAsRole } from './scripts/test-helpers.mjs';
//   const result = await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM admin_ideas;');

/**
 * execute a sql query with auth.uid() set to a specific user id.
 * simulates authenticated role access for rls policy testing.
 * 
 * uses SET ROLE to switch to anon (guest) or authenticated role,
 * then sets local request.jwt.claim.sub for auth.uid() to read.
 * 
 * @param {Object} db - pglite database instance
 * @param {string|null} userId - user uuid for auth.uid(), or null for guest
 * @param {string} sql - sql query to execute
 * @returns {Promise<Object>} query result with rows array
 */
export async function queryAsRole(db, userId, sql) {
  return await db.transaction(async (tx) => {
    if (userId) {
      // switch to authenticated role and set auth.uid()
      await tx.exec(`SET LOCAL ROLE authenticated;`);
      await tx.exec(`SET LOCAL request.jwt.claims = '{"sub":"${userId}","role":"authenticated"}';`);
      await tx.exec(`SET LOCAL request.jwt.claim.sub = '${userId}';`);
    } else {
      // guest: switch to anon role, clear auth context
      await tx.exec(`SET LOCAL ROLE anon;`);
      await tx.exec(`SET LOCAL request.jwt.claims = '{}';`);
      await tx.exec(`SET LOCAL request.jwt.claim.sub = '';`);
    }
    
    return await tx.query(sql);
  });
}

/**
 * execute a sql mutation (insert/update/delete) with auth.uid() context.
 * 
 * uses SET ROLE to switch to anon or authenticated, then sets auth.uid().
 * 
 * @param {Object} db - pglite database instance  
 * @param {string|null} userId - user uuid for auth.uid(), or null for guest
 * @param {string} sql - sql mutation to execute
 * @returns {Promise<Object>} exec result
 */
export async function mutateAsRole(db, userId, sql) {
  return await db.transaction(async (tx) => {
    if (userId) {
      // switch to authenticated role and set auth.uid()
      await tx.exec(`SET LOCAL ROLE authenticated;`);
      await tx.exec(`SET LOCAL request.jwt.claims = '{"sub":"${userId}","role":"authenticated"}';`);
      await tx.exec(`SET LOCAL request.jwt.claim.sub = '${userId}';`);
    } else {
      // guest: switch to anon role, clear auth context
      await tx.exec(`SET LOCAL ROLE anon;`);
      await tx.exec(`SET LOCAL request.jwt.claims = '{}';`);
      await tx.exec(`SET LOCAL request.jwt.claim.sub = '';`);
    }
    
    return await tx.exec(sql);
  });
}

/**
 * categorize database errors for grant vs rls distinction.
 * 
 * @param {Error} error - database error from query/mutation
 * @returns {string} error category: grant_layer_block, rls_deny, rls_with_check_deny, unknown_error
 */
export function categorizeError(error) {
  if (!error || !error.message) {
    return 'unknown_error';
  }
  
  const msg = error.message.toLowerCase();
  
  if (msg.includes('permission denied for table') || msg.includes('permission denied for relation')) {
    return 'grant_layer_block';
  }
  
  if (msg.includes('row-level security') || msg.includes('rls')) {
    return 'rls_deny';
  }
  
  if (msg.includes('check constraint') || msg.includes('with check') || msg.includes('violates check constraint')) {
    return 'rls_with_check_deny';
  }
  
  if (msg.includes('violates not-null constraint') || msg.includes('violates unique constraint')) {
    return 'constraint_violation';
  }
  
  if (msg.includes('new row violates row-level security policy')) {
    return 'rls_with_check_deny';  
  }
  
  if (msg.includes('insert or update on table') && msg.includes('violates row-level security policy')) {
    return 'rls_with_check_deny';
  }
  
  return 'unknown_error';
}

/**
 * test auth.uid() context is working by querying current session state.
 * 
 * @param {Object} db - pglite database instance
 * @param {string|null} userId - expected user id
 * @returns {Promise<boolean>} true if auth.uid() matches expected userId
 */
export async function verifyAuthContext(db, userId) {
  try {
    const result = await queryAsRole(db, userId, 'SELECT auth.uid() as current_uid;');
    const currentUid = result.rows[0]?.current_uid;
    
    if (userId === null) {
      return currentUid === null || currentUid === undefined;
    } else {
      return currentUid === userId;
    }
  } catch (error) {
    console.error('failed to verify auth context:', error.message);
    return false;
  }
}

// smoke test: verify rls context setting works
if (import.meta.url === `file://${process.argv[1]}`) {
  const { buildTestDatabase } = await import('./build-security-test-db.mjs');
  const { seedTestData, TEST_USERS } = await import('./seed-security-test-data.mjs');
  
  console.log('running rls context smoke test...\n');
  
  try {
    const db = await buildTestDatabase();
    const { users } = await seedTestData(db);
    
    console.log('testing auth.uid() context setting:');
    
    // test guest context (should return null)
    console.log('  guest context...');
    const guestValid = await verifyAuthContext(db, null);
    console.log(`    auth.uid() = null: ${guestValid ? '✓' : '✗'}`);
    
    // test admin context 
    console.log('  admin context...');
    const adminValid = await verifyAuthContext(db, TEST_USERS.admin.id);
    console.log(`    auth.uid() = ${TEST_USERS.admin.id}: ${adminValid ? '✓' : '✗'}`);
    
    // test actual rls policy with commission_requests
    console.log('\ntesting rls policy enforcement:');
    
    // dave should see his own commission request
    console.log('  dave (commissioner) queries commission_requests...');
    const daveResult = await queryAsRole(db, TEST_USERS.commissioner_dave.id, 
      'SELECT id, commissioner_user_id, creator_handle FROM public.commission_requests;');
    const daveCanSee = daveResult.rows.length === 1 && 
                       daveResult.rows[0].commissioner_user_id === TEST_USERS.commissioner_dave.id;
    console.log(`    sees own request: ${daveCanSee ? '✓' : '✗'} (${daveResult.rows.length} rows)`);
    
    // eve (unrelated) should see no commission requests
    console.log('  eve (unrelated) queries commission_requests...');
    const eveResult = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
      'SELECT id FROM public.commission_requests;');
    const eveDenied = eveResult.rows.length === 0;
    console.log(`    cross-account denied: ${eveDenied ? '✓' : '✗'} (${eveResult.rows.length} rows)`);
    
    // guest should see no commission requests
    console.log('  guest queries commission_requests...');
    const guestResult = await queryAsRole(db, null, 
      'SELECT id FROM public.commission_requests;');
    const guestDenied = guestResult.rows.length === 0;
    console.log(`    anonymous denied: ${guestDenied ? '✓' : '✗'} (${guestResult.rows.length} rows)`);
    
    // admin should see all commission requests
    console.log('  admin queries commission_requests...');
    const adminResult = await queryAsRole(db, TEST_USERS.admin.id, 
      'SELECT id FROM public.commission_requests;');
    const adminCanSeeAll = adminResult.rows.length === 2;
    console.log(`    admin sees all: ${adminCanSeeAll ? '✓' : '✗'} (${adminResult.rows.length} rows)`);
    
    // test error categorization
    console.log('\ntesting error categorization:');
    try {
      // try to access a table that doesn't exist (should be unknown_error)
      await queryAsRole(db, null, 'SELECT * FROM nonexistent_table;');
    } catch (error) {
      const category = categorizeError(error);
      console.log(`  nonexistent table error: ${category}`);
    }
    
    const allTestsPassed = guestValid && adminValid && daveCanSee && eveDenied && guestDenied && adminCanSeeAll;
    
    if (allTestsPassed) {
      console.log('\n✓ rls context smoke test passed');
      console.log('  auth.uid() context setting works');
      console.log('  commission_requests rls policies enforce correctly');
      console.log('  cross-account isolation confirmed');
      process.exit(0);
    } else {
      console.log('\n✗ rls context smoke test failed');
      console.log('  check pglite auth.uid() compatibility or policy syntax');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\nsmoke test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}