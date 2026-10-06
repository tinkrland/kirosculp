#!/usr/bin/env node
// test-policy-components.mjs - test each part of the RLS policy

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole } from './test-helpers.mjs';

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  console.log('🧪 testing individual policy components for eve...');
  
  // test 1: auth.uid() 
  console.log('\n1. auth.uid() test:');
  const uidTest = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT auth.uid() as current_uid;');
  console.log(`eve auth.uid(): ${uidTest.rows[0].current_uid}`);
  
  // test 2: has_role function
  console.log('\n2. has_role function test:');
  const roleTest = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
    `SELECT public.has_role(auth.uid(), 'admin'::app_role) as is_admin;`);
  console.log(`eve has admin role: ${roleTest.rows[0].is_admin}`);
  
  // test 3: directly test the policy condition
  console.log('\n3. testing exact policy condition:');
  const policyCondition = `
    SELECT 
      cr.*,
      (
        commissioner_user_id = auth.uid()
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (
          SELECT 1 FROM creator_profiles cp
          WHERE cp.username = cr.creator_handle
            AND cp.user_id = auth.uid()
        )
      ) as should_be_visible
    FROM public.commission_requests cr;
  `;
  
  const conditionResult = await queryAsRole(db, TEST_USERS.unrelated_eve.id, policyCondition);
  console.table(conditionResult.rows.map(r => ({
    id: r.id,
    creator_handle: r.creator_handle, 
    should_be_visible: r.should_be_visible
  })));
  
  // test 4: try disabling rls temporarily to see if that's the issue
  console.log('\n4. testing with rls disabled (admin query):');
  await queryAsRole(db, TEST_USERS.admin.id, 'ALTER TABLE public.commission_requests DISABLE ROW LEVEL SECURITY;');
  
  const withoutRls = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
    'SELECT COUNT(*) as count FROM public.commission_requests;');
  console.log(`eve sees without rls: ${withoutRls.rows[0].count} rows`);
  
  // re-enable rls
  await queryAsRole(db, TEST_USERS.admin.id, 'ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;');
  
  const withRls = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
    'SELECT COUNT(*) as count FROM public.commission_requests;');
  console.log(`eve sees with rls re-enabled: ${withRls.rows[0].count} rows`);
  
  // test 5: check if the issue is with SELECT vs other operations
  console.log('\n5. testing other operations:');
  
  try {
    await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
      "INSERT INTO public.commission_requests (creator_handle, commissioner_user_id) VALUES ('test', auth.uid());");
    console.log('eve can insert: YES');
  } catch (error) {
    console.log('eve can insert: NO -', error.message.substring(0, 50) + '...');
  }
  
  try {
    await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
      "UPDATE public.commission_requests SET status = 'new' WHERE id = '30000000-0000-0000-0000-000000000001';");
    console.log('eve can update: YES');
  } catch (error) {
    console.log('eve can update: NO -', error.message.substring(0, 50) + '...');
  }
  
} catch (error) {
  console.error('❌ policy component test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}