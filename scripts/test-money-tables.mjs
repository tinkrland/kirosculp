#!/usr/bin/env node
// test-money-tables.mjs - verify grant layer blocks client access to money tables

import { buildTestDatabase } from './build-security-test-db.mjs';
import { seedTestData, TEST_USERS } from './seed-security-test-data.mjs';
import { queryAsRole, mutateAsRole, categorizeError } from './test-helpers.mjs';

console.log('testing money tables (escrow_holds, ledger_entries)...\n');

try {
  const db = await buildTestDatabase();
  await seedTestData(db);
  
  let passed = 0;
  let failed = 0;
  
  console.log('escrow_holds tests:');
  
  // guest select
  try {
    await queryAsRole(db, null, 'SELECT * FROM public.escrow_holds;');
    console.log('  FAIL es01: guest can read escrow_holds');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass es01: guest denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL es01: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // buyer select
  try {
    await queryAsRole(db, TEST_USERS.buyer_carol.id, 'SELECT * FROM public.escrow_holds;');
    console.log('  FAIL es02: buyer can read escrow_holds');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass es02: buyer denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL es02: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // admin select (should also be denied from client)
  try {
    await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.escrow_holds;');
    console.log('  FAIL es04: admin can read escrow_holds from client');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass es04: admin denied at grant layer (correct: server-side only)');
      passed++;
    } else {
      console.log(`  FAIL es04: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // buyer insert
  try {
    await mutateAsRole(db, TEST_USERS.buyer_carol.id, "INSERT INTO public.escrow_holds (kind, amount_cents) VALUES ('order', 5000);");
    console.log('  FAIL es05: buyer can insert escrow_holds');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass es05: buyer insert denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL es05: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  console.log('\nledger_entries tests:');
  
  // guest select
  try {
    await queryAsRole(db, null, 'SELECT * FROM public.ledger_entries;');
    console.log('  FAIL le01: guest can read ledger_entries');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass le01: guest denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL le01: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // creator select
  try {
    await queryAsRole(db, TEST_USERS.creator_alice.id, 'SELECT * FROM public.ledger_entries;');
    console.log('  FAIL le03: creator can read ledger_entries');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass le03: creator denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL le03: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // admin select (should also be denied from client)
  try {
    await queryAsRole(db, TEST_USERS.admin.id, 'SELECT * FROM public.ledger_entries;');
    console.log('  FAIL le04: admin can read ledger_entries from client');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass le04: admin denied at grant layer (correct: server-side only)');
      passed++;
    } else {
      console.log(`  FAIL le04: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  // creator insert
  try {
    await mutateAsRole(db, TEST_USERS.creator_alice.id, "INSERT INTO public.ledger_entries (group_id, account, direction, amount_cents) VALUES (gen_random_uuid(), 'creator_payable', 'credit', 500);");
    console.log('  FAIL le06: creator can insert ledger_entries');
    failed++;
  } catch (error) {
    const cat = categorizeError(error);
    if (cat === 'grant_layer_block') {
      console.log('  pass le06: creator insert denied at grant layer');
      passed++;
    } else {
      console.log(`  FAIL le06: wrong denial type (${cat})`);
      failed++;
    }
  }
  
  const total = passed + failed;
  const passRate = Math.round((passed / total) * 100);
  
  console.log(`\nresults:`);
  console.log(`   total: ${total}`);
  console.log(`   passed: ${passed} (${passRate}%)`);
  console.log(`   failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\nall money table tests passed. grant layer correctly blocks client access.');
  } else {
    console.log('\nsome tests failed.');
  }
  
} catch (error) {
  console.error('\ntest failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}