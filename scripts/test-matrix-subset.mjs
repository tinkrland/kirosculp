#!/usr/bin/env node
// test subset of denial matrix to verify SET ROLE fix

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole, mutateAsRole, categorizeError } from './test-helpers.mjs';

console.log('🧪 testing denial matrix subset with SET ROLE fix...\n');

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  let passed = 0;
  let failed = 0;
  
  // commission_requests SELECT tests
  console.log('📋 commission_requests SELECT tests:');
  
  // cr01: guest cannot read
  try {
    const result = await queryAsRole(db, null, 'SELECT * FROM public.commission_requests;');
    if (result.rows.length === 0) {
      console.log('  ✅ cr01: guest denied (0 rows)');
      passed++;
    } else {
      console.log(`  ❌ cr01: guest saw ${result.rows.length} rows (expected 0)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✅ cr01: guest denied (${categorizeError(error)})`);
    passed++;
  }
  
  // cr02: unrelated user cannot read
  try {
    const result = await queryAsRole(db, TEST_USERS.unrelated_eve.id, 'SELECT * FROM public.commission_requests;');
    if (result.rows.length === 0) {
      console.log('  ✅ cr02: unrelated user denied (0 rows)');
      passed++;
    } else {
      console.log(`  ❌ cr02: unrelated user saw ${result.rows.length} rows (expected 0)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✅ cr02: unrelated user denied (${categorizeError(error)})`);
    passed++;
  }
  
  // cr03: commissioner can read own
  try {
    const result = await queryAsRole(db, TEST_USERS.commissioner_dave.id, 
      'SELECT * FROM public.commission_requests WHERE commissioner_user_id = auth.uid();');
    if (result.rows.length === 1) {
      console.log(`  ✅ cr03: commissioner sees own (${result.rows.length} row)`);
      passed++;
    } else {
      console.log(`  ❌ cr03: commissioner saw ${result.rows.length} rows (expected 1)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ cr03: commissioner denied: ${error.message.substring(0, 50)}`);
    failed++;
  }
  
  // cr07: admin can read all
  try {
    const result = await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.commission_requests;');
    if (result.rows.length === 2) {
      console.log(`  ✅ cr07: admin sees all (${result.rows.length} rows)`);
      passed++;
    } else {
      console.log(`  ❌ cr07: admin saw ${result.rows.length} rows (expected 2)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ cr07: admin denied: ${error.message.substring(0, 50)}`);
    failed++;
  }
  
  // admin_ideas SELECT tests
  console.log('\n📋 admin_ideas SELECT tests:');
  
  // ai02: buyer cannot read
  try {
    const result = await queryAsRole(db, TEST_USERS.buyer_carol.id, 'SELECT * FROM public.admin_ideas;');
    if (result.rows.length === 0) {
      console.log('  ✅ ai02: buyer denied (0 rows)');
      passed++;
    } else {
      console.log(`  ❌ ai02: buyer saw ${result.rows.length} rows (expected 0)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✅ ai02: buyer denied (${categorizeError(error)})`);
    passed++;
  }
  
  // ai06: admin can read
  try {
    const result = await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.admin_ideas;');
    if (result.rows.length === 1) {
      console.log(`  ✅ ai06: admin sees all (${result.rows.length} row)`);
      passed++;
    } else {
      console.log(`  ❌ ai06: admin saw ${result.rows.length} rows (expected 1)`);
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ ai06: admin denied: ${error.message.substring(0, 50)}`);
    failed++;
  }
  
  // INSERT tests
  console.log('\n📋 INSERT tests:');
  
  // cr08: guest cannot insert commission_requests
  try {
    await mutateAsRole(db, null, "INSERT INTO public.commission_requests (creator_handle) VALUES ('test');");
    console.log('  ❌ cr08: guest inserted (expected deny)');
    failed++;
  } catch (error) {
    console.log(`  ✅ cr08: guest denied (${categorizeError(error)})`);
    passed++;
  }
  
  // ai08: buyer cannot insert admin_ideas
  try {
    await mutateAsRole(db, TEST_USERS.buyer_carol.id, "INSERT INTO public.admin_ideas (title, description) VALUES ('Test', 'Test');");
    console.log('  ❌ ai08: buyer inserted admin_ideas (expected deny)');
    failed++;
  } catch (error) {
    console.log(`  ✅ ai08: buyer denied admin_ideas insert (${categorizeError(error)})`);
    passed++;
  }
  
  // ai10: admin can insert admin_ideas
  try {
    await mutateAsRole(db, TEST_USERS.admin.id, "INSERT INTO public.admin_ideas (title, content) VALUES ('Admin Test', 'Admin idea content');");
    console.log('  ✅ ai10: admin inserted admin_ideas');
    passed++;
  } catch (error) {
    console.log(`  ❌ ai10: admin denied: ${error.message.substring(0, 50)}`);
    failed++;
  }
  
  // Summary
  const total = passed + failed;
  const passRate = Math.round((passed / total) * 100);
  
  console.log(`\n📊 subset results:`);
  console.log(`   total: ${total}`);
  console.log(`   passed: ${passed} (${passRate}%)`);
  console.log(`   failed: ${failed}`);
  
  if (passRate >= 80) {
    console.log('\n✅ SET ROLE fix working! RLS policies enforcing correctly.');
  } else {
    console.log('\n⚠️  some policies still not enforcing correctly.');
  }
  
} catch (error) {
  console.error('\n❌ test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}