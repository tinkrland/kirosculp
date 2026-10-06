#!/usr/bin/env node
// check-creator-condition.mjs - debug creator profile condition

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole } from './test-helpers.mjs';

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  console.log('🔍 debugging creator profile condition for eve...');
  
  // check all creator profiles
  console.log('\n1. all creator profiles:');
  const profiles = await queryAsRole(db, TEST_USERS.admin.id, 
    'SELECT user_id, username FROM public.creator_profiles ORDER BY username;');
  console.table(profiles.rows);
  
  // check commission requests with their creator_handle
  console.log('\n2. commission requests with creator_handle:');
  const requests = await queryAsRole(db, TEST_USERS.admin.id, 
    'SELECT id, creator_handle, commissioner_user_id FROM public.commission_requests ORDER BY id;');
  console.table(requests.rows);
  
  // check eve's user_id against creator profiles
  console.log('\n3. eve user id check:');
  console.log(`eve user_id: ${TEST_USERS.unrelated_eve.id}`);
  
  // test the creator profile condition for eve explicitly
  console.log('\n4. creator condition test for eve:');
  const creatorTest = await queryAsRole(db, TEST_USERS.unrelated_eve.id, `
    SELECT 
      cr.id,
      cr.creator_handle,
      EXISTS (
        SELECT 1 FROM public.creator_profiles cp
        WHERE cp.username = cr.creator_handle
          AND cp.user_id = auth.uid()
      ) as eve_is_creator_for_this_request
    FROM public.commission_requests cr;
  `);
  console.table(creatorTest.rows);
  
  // check if there's a permissions issue with SELECT itself
  console.log('\n5. checking if eve has basic table access:');
  
  // test with a simple query bypassing rls (as admin)
  console.log('   admin can see:', 
    (await queryAsRole(db, TEST_USERS.admin.id, 'SELECT COUNT(*) FROM public.commission_requests;')).rows[0].count);
    
  // test if eve can see anything at all
  try {
    const eveCount = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT COUNT(*) FROM public.commission_requests;');
    console.log('   eve can count:', eveCount.rows[0].count);
  } catch (error) {
    console.log('   eve count failed:', error.message);
  }
  
} catch (error) {
  console.error('❌ creator condition check failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}