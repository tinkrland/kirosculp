#!/usr/bin/env node
// count-policies.mjs - count actual rls policies in database

import { buildTestDatabase } from './build-security-test-db.mjs';

try {
  const db = await buildTestDatabase();
  
  const result = await db.query(`
    SELECT 
      tablename,
      COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename;
  `);
  
  console.log('rls policies by table:\n');
  let total = 0;
  for (const row of result.rows) {
    console.log(`  ${row.tablename}: ${row.policy_count} policies`);
    total += parseInt(row.policy_count);
  }
  
  console.log(`\ntotal: ${total} rls policies across ${result.rows.length} tables`);
  
} catch (error) {
  console.error('failed:', error.message);
  process.exit(1);
}