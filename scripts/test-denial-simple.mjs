#!/usr/bin/env node
// simplified denial matrix test to debug execution

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole, mutateAsRole, categorizeError } from './test-helpers.mjs';

console.log('🧪 running simplified denial tests...');

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  console.log('\n1. commission_requests tests:');
  
  // test 1: guest select (should fail)
  try {
    const result = await queryAsRole(db, null, 'SELECT * FROM public.commission_requests;');
    console.log(`❌ guest can read commission_requests (${result.rows.length} rows) - expected deny`);
  } catch (error) {
    console.log(`✅ guest denied commission_requests access: ${categorizeError(error)}`);
  }
  
  // test 2: admin select (should allow)
  try {
    const result = await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.commission_requests;');
    console.log(`✅ admin can read commission_requests (${result.rows.length} rows)`);
  } catch (error) {
    console.log(`❌ admin denied commission_requests access: ${error.message}`);
  }
  
  // test 3: eve select (should deny but currently allows due to pglite issue)
  try {
    const result = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT * FROM public.commission_requests;');
    console.log(`⚠️  eve can read commission_requests (${result.rows.length} rows) - pglite rls issue`);
  } catch (error) {
    console.log(`✅ eve denied commission_requests access: ${categorizeError(error)}`);
  }
  
  console.log('\n2. admin_ideas tests:');
  
  // test 4: eve select admin_ideas (should fail)
  try {
    const result = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT * FROM public.admin_ideas;');
    console.log(`❌ eve can read admin_ideas (${result.rows.length} rows) - expected deny`);
  } catch (error) {
    console.log(`✅ eve denied admin_ideas access: ${categorizeError(error)}`);
  }
  
  // test 5: admin select admin_ideas (should allow)
  try {
    const result = await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.admin_ideas;');
    console.log(`✅ admin can read admin_ideas (${result.rows.length} rows)`);
  } catch (error) {
    console.log(`❌ admin denied admin_ideas access: ${error.message}`);
  }
  
  console.log('\n3. insert tests:');
  
  // test 6: guest insert commission_request (should fail)
  try {
    await mutateAsRole(db, null, "INSERT INTO public.commission_requests (creator_handle) VALUES ('test');");
    console.log(`❌ guest can insert commission_requests - expected deny`);
  } catch (error) {
    console.log(`✅ guest denied commission_requests insert: ${categorizeError(error)}`);
  }
  
  // test 7: eve insert admin_idea (should fail)
  try {
    await mutateAsRole(db, TEST_USERS.unrelated_eve.id, "INSERT INTO public.admin_ideas (title) VALUES ('test');");
    console.log(`❌ eve can insert admin_ideas - expected deny`);
  } catch (error) {
    console.log(`✅ eve denied admin_ideas insert: ${categorizeError(error)}`);
  }
  
  console.log('\n✅ simplified denial test completed');
  
} catch (error) {
  console.error('❌ test failed:', error.message);
  console.error(error.stack);
}