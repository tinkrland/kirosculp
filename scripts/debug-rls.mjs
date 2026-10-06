#!/usr/bin/env node
// debug-rls.mjs - debug commission_requests RLS policy

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole } from './test-helpers.mjs';

console.log('🔍 debugging commission_requests rls policy...');

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  // check what's in commission_requests
  console.log('\n1. commission_requests table contents:');
  const allRequests = await queryAsRole(db, TEST_USERS.admin.id, 
    'SELECT id, commissioner_user_id, creator_handle FROM public.commission_requests ORDER BY id;');
  console.table(allRequests.rows);
  
  // check eve's user_id
  console.log('\n2. eve user info:');
  console.log(`eve user_id: ${TEST_USERS.unrelated_eve.id}`);
  
  // check if eve has admin role
  console.log('\n3. eve role check:');
  const eveRole = await queryAsRole(db, TEST_USERS.admin.id,
    `SELECT public.has_role('${TEST_USERS.unrelated_eve.id}', 'admin'::app_role) as is_admin;`);
  console.log(`eve has admin role: ${eveRole.rows[0].is_admin}`);
  
  // check auth.uid() when querying as eve
  console.log('\n4. auth.uid() as eve:');
  const eveUid = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT auth.uid() as current_uid;');
  console.log(`auth.uid() when querying as eve: ${eveUid.rows[0].current_uid}`);
  
  // check the policy condition step by step
  console.log('\n5. policy condition breakdown for eve:');
  const breakdown = await queryAsRole(db, TEST_USERS.unrelated_eve.id, `
    SELECT 
      cr.id,
      cr.commissioner_user_id,
      cr.creator_handle,
      (cr.commissioner_user_id = auth.uid()) as owns_commission,
      public.has_role(auth.uid(), 'admin'::app_role) as is_admin,
      exists (
        select 1 from public.creator_profiles cp
        where cp.username = cr.creator_handle
          and cp.user_id = auth.uid()
      ) as is_creator
    FROM public.commission_requests cr;
  `);
  console.table(breakdown.rows);
  
  // check what eve actually sees
  console.log('\n6. what eve sees with rls:');
  const eveVisible = await queryAsRole(db, TEST_USERS.unrelated_eve.id,
    'SELECT id, commissioner_user_id, creator_handle FROM public.commission_requests;');
  console.log(`eve sees ${eveVisible.rows.length} rows:`);
  console.table(eveVisible.rows);
  
  // verify rls is enabled
  console.log('\n7. rls status:');
  const rlsStatus = await queryAsRole(db, TEST_USERS.admin.id,
    `SELECT schemaname, tablename, rowsecurity, rowsecurity as rls_enabled 
     FROM pg_tables 
     WHERE tablename = 'commission_requests' AND schemaname = 'public';`);
  console.table(rlsStatus.rows);
  
} catch (error) {
  console.error('❌ debug failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}