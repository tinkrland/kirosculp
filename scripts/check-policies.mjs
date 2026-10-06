#!/usr/bin/env node
// check-policies.mjs - check all policies on commission_requests

import { buildTestDatabase } from './build-security-test-db.mjs';
import { queryAsRole } from './test-helpers.mjs';

try {
  const db = await buildTestDatabase();
  
  console.log('📋 all policies on commission_requests:');
  
  const policies = await db.query(`
    SELECT 
      policyname,
      cmd,
      permissive,
      roles,
      qual,
      with_check
    FROM pg_policies 
    WHERE tablename = 'commission_requests' 
      AND schemaname = 'public'
    ORDER BY policyname;
  `);
  
  console.table(policies.rows);
  
  if (policies.rows.length === 0) {
    console.log('❌ no policies found - rls is enabled but no policies exist');
  }
  
} catch (error) {
  console.error('❌ policy check failed:', error.message);
  process.exit(1);
}