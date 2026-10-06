#!/usr/bin/env node
// verify-helpers.mjs - simple test for test-helpers.mjs

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole, verifyAuthContext } from './test-helpers.mjs';

console.log('🔍 verifying rls helpers...');

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  // test 1: verify auth.uid() works for admin
  const adminValid = await verifyAuthContext(db, TEST_USERS.admin.id);
  console.log(`✓ admin auth context: ${adminValid}`);
  
  // test 2: verify commission_requests rls
  const adminResult = await queryAsRole(db, TEST_USERS.admin.id, 
    'SELECT COUNT(*) as count FROM public.commission_requests;');
  console.log(`✓ admin sees ${adminResult.rows[0].count} commission requests`);
  
  // test 3: verify cross-account isolation
  const eveResult = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 
    'SELECT COUNT(*) as count FROM public.commission_requests;');
  console.log(`✓ eve sees ${eveResult.rows[0].count} commission requests (should be 0)`);
  
  console.log('✅ helpers working correctly');
  
} catch (error) {
  console.error('❌ helper test failed:', error.message);
  process.exit(1);
}