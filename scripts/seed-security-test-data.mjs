#!/usr/bin/env node
// seed-security-test-data.mjs
//
// seeds test roles and entities for security denial matrix testing.
// creates 6 users, cross-account isolation entities, and private data.
//
// usage:
//   import { seedTestData } from './scripts/seed-security-test-data.mjs';
//   const { users, entities } = await seedTestData(db);

// fixed uuids for deterministic seeding and test assertions
export const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@test.local',
    display_name: 'test admin',
    role: 'admin',
  },
  creator_alice: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'alice@test.local',
    display_name: 'alice creator',
    handle: 'alice123',
  },
  creator_bob: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'bob@test.local',
    display_name: 'bob creator',
    handle: 'bob456',
  },
  buyer_carol: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'carol@test.local',
    display_name: 'carol buyer',
  },
  commissioner_dave: {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'dave@test.local',
    display_name: 'dave commissioner',
  },
  unrelated_eve: {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'eve@test.local',
    display_name: 'eve unrelated',
  },
};

export const TEST_ENTITIES = {
  artifact_alice_published: '10000000-0000-0000-0000-000000000001',
  artifact_alice_draft: '10000000-0000-0000-0000-000000000002',
  artifact_bob_published: '10000000-0000-0000-0000-000000000003',
  order_carol_from_alice: '20000000-0000-0000-0000-000000000001',
  order_eve_from_alice: '20000000-0000-0000-0000-000000000002',
  commission_dave_to_alice: '30000000-0000-0000-0000-000000000001',
  commission_carol_to_bob: '30000000-0000-0000-0000-000000000002',
  admin_idea_test: '40000000-0000-0000-0000-000000000001',
};

export async function seedTestData(db) {
  console.log('seeding test data...\n');
  
  try {
    // 1. insert auth.users
    console.log('creating test users...');
    for (const [key, user] of Object.entries(TEST_USERS)) {
      await db.exec(`
        INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
        VALUES (
          '${user.id}'::uuid,
          '${user.email}',
          '{"display_name": "${user.display_name}"}'::jsonb,
          now(),
          now(),
          now()
        )
        ON CONFLICT (id) DO NOTHING;
      `);
      console.log(`  ✓ ${key}: ${user.email}`);
    }
    
    // 2. insert profiles (may be auto-created by trigger, but ensure they exist)
    console.log('\ncreating profiles...');
    for (const [key, user] of Object.entries(TEST_USERS)) {
      await db.exec(`
        INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
        VALUES (
          '${user.id}'::uuid,
          '${user.email}',
          '${user.display_name}',
          now(),
          now()
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }
    console.log('  ✓ 6 profiles created');
    
    // 3. insert admin role
    console.log('\nassigning admin role...');
    await db.exec(`
      INSERT INTO public.user_roles (user_id, role, created_at)
      VALUES ('${TEST_USERS.admin.id}'::uuid, 'admin'::public.app_role, now())
      ON CONFLICT (user_id, role) DO NOTHING;
    `);
    console.log('  ✓ admin role assigned');
    
    // 4. insert creator_profiles
    console.log('\ncreating creator profiles...');
    await db.exec(`
      INSERT INTO public.creator_profiles (
        id, user_id, user_email, username, display_name,
        bio, materials, tools, commission_open, created_at, updated_at
      ) VALUES
      (
        '${TEST_ENTITIES.artifact_alice_published}'::uuid,
        '${TEST_USERS.creator_alice.id}'::uuid,
        '${TEST_USERS.creator_alice.email}',
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.creator_alice.display_name}',
        'alice bio for testing',
        ARRAY['silver', 'gold']::text[],
        ARRAY['openscad', 'paracraft']::text[],
        true,
        now(),
        now()
      ),
      (
        '${TEST_ENTITIES.artifact_bob_published}'::uuid,
        '${TEST_USERS.creator_bob.id}'::uuid,
        '${TEST_USERS.creator_bob.email}',
        '${TEST_USERS.creator_bob.handle}',
        '${TEST_USERS.creator_bob.display_name}',
        'bob bio for testing',
        ARRAY['brass']::text[],
        ARRAY['fusion360']::text[],
        false,
        now(),
        now()
      )
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('  ✓ alice, bob creator profiles');
    
    // 5. insert market_accounts with private data
    console.log('\ncreating market accounts (with private data)...');
    await db.exec(`
      INSERT INTO public.market_accounts (
        id, handle, slug, display_name, email, access_key_hash,
        status, bio, payout_details, payout_method,
        created_at, updated_at
      ) VALUES
      (
        gen_random_uuid(),
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.creator_alice.display_name}',
        'alice_payout@test.local',
        'test_hash_alice_secret',
        'active',
        'alice storefront bio',
        '{"account": "alice_bank_account_secret", "routing": "123456789"}',
        'bank_transfer',
        now(),
        now()
      ),
      (
        gen_random_uuid(),
        '${TEST_USERS.creator_bob.handle}',
        '${TEST_USERS.creator_bob.handle}',
        '${TEST_USERS.creator_bob.display_name}',
        'bob_payout@test.local',
        'test_hash_bob_secret',
        'active',
        'bob storefront bio',
        '{"account": "bob_paypal_secret"}',
        'paypal',
        now(),
        now()
      )
      ON CONFLICT (handle) DO UPDATE SET updated_at = now();
    `);
    console.log('  ✓ alice, bob market accounts (private: access_key_hash, payout_details, email)');
    
    // 6. insert artifacts
    console.log('\ncreating artifacts...');
    await db.exec(`
      INSERT INTO public.artifacts (
        id, created_by, creator_handle, name, description,
        status, category, materials, prices, manufacturing_costs, creator_earnings,
        made_to_order, region, created_at, updated_at
      ) VALUES
      (
        '${TEST_ENTITIES.artifact_alice_published}'::uuid,
        '${TEST_USERS.creator_alice.id}'::uuid,
        '${TEST_USERS.creator_alice.handle}',
        'alice ring published',
        'test published artifact from alice',
        'published',
        'jewelry',
        ARRAY['silver_925']::text[],
        '{"silver_925": 150.00}'::jsonb,
        '{"silver_925": 50.00}'::jsonb,
        '{"silver_925": 75.00}'::jsonb,
        true,
        'north_america',
        now(),
        now()
      ),
      (
        '${TEST_ENTITIES.artifact_alice_draft}'::uuid,
        '${TEST_USERS.creator_alice.id}'::uuid,
        '${TEST_USERS.creator_alice.handle}',
        'alice earrings draft',
        'test draft artifact from alice',
        'draft',
        'jewelry',
        ARRAY['gold_14k_yellow']::text[],
        '{"gold_14k_yellow": 500.00}'::jsonb,
        '{"gold_14k_yellow": 200.00}'::jsonb,
        '{"gold_14k_yellow": 250.00}'::jsonb,
        true,
        'europe',
        now(),
        now()
      ),
      (
        '${TEST_ENTITIES.artifact_bob_published}'::uuid,
        '${TEST_USERS.creator_bob.id}'::uuid,
        '${TEST_USERS.creator_bob.handle}',
        'bob pendant published',
        'test published artifact from bob',
        'published',
        'jewelry',
        ARRAY['brass']::text[],
        '{"brass": 80.00}'::jsonb,
        '{"brass": 30.00}'::jsonb,
        '{"brass": 40.00}'::jsonb,
        true,
        'global',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('  ✓ 3 artifacts (2 alice, 1 bob; 2 published, 1 draft)');
    
    // 7. insert orders with private data
    console.log('\ncreating orders (with private data)...');
    await db.exec(`
      INSERT INTO public.orders (
        id, user_id, artifact_id, artifact_name, artifact_image_url,
        creator_handle, customer_email, customer_name, material,
        price, manufacturing_cost, creator_earnings,
        shipping_address, notes, status, created_at, updated_at
      ) VALUES
      (
        '${TEST_ENTITIES.order_carol_from_alice}'::uuid,
        '${TEST_USERS.buyer_carol.id}'::uuid,
        '${TEST_ENTITIES.artifact_alice_published}'::uuid,
        'alice ring published',
        'https://example.com/ring.jpg',
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.buyer_carol.email}',
        '${TEST_USERS.buyer_carol.display_name}',
        'silver_925',
        150.00,
        50.00,
        75.00,
        '123 carol street, carol city, CA 90001',
        'carol notes: please gift wrap',
        'placed',
        now(),
        now()
      ),
      (
        '${TEST_ENTITIES.order_eve_from_alice}'::uuid,
        '${TEST_USERS.unrelated_eve.id}'::uuid,
        '${TEST_ENTITIES.artifact_alice_published}'::uuid,
        'alice ring published',
        'https://example.com/ring.jpg',
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.unrelated_eve.email}',
        '${TEST_USERS.unrelated_eve.display_name}',
        'silver_925',
        150.00,
        50.00,
        75.00,
        '456 eve avenue, eve town, NY 10001',
        'eve notes: rush shipping',
        'placed',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('  ✓ 2 orders (carol bought from alice, eve bought from alice)');
    console.log('    private data: customer_email, customer_name, shipping_address, notes');
    
    // 8. insert commission_requests
    console.log('\ncreating commission requests...');
    await db.exec(`
      INSERT INTO public.commission_requests (
        id, commissioner_user_id, creator_handle,
        customer_name, customer_email, budget, timeline,
        intended_use, description, status, created_at, updated_at
      ) VALUES
      (
        '${TEST_ENTITIES.commission_dave_to_alice}'::uuid,
        '${TEST_USERS.commissioner_dave.id}'::uuid,
        '${TEST_USERS.creator_alice.handle}',
        '${TEST_USERS.commissioner_dave.display_name}',
        '${TEST_USERS.commissioner_dave.email}',
        500.00,
        '2 weeks',
        'personal',
        'dave wants a custom ring from alice',
        'new',
        now(),
        now()
      ),
      (
        '${TEST_ENTITIES.commission_carol_to_bob}'::uuid,
        '${TEST_USERS.buyer_carol.id}'::uuid,
        '${TEST_USERS.creator_bob.handle}',
        '${TEST_USERS.buyer_carol.display_name}',
        '${TEST_USERS.buyer_carol.email}',
        300.00,
        '1 month',
        'gift',
        'carol wants a custom pendant from bob',
        'new',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('  ✓ 2 commission requests (dave→alice, carol→bob)');
    
    // 9. insert admin_ideas (test admin-only data)
    console.log('\ncreating admin ideas...');
    await db.exec(`
      INSERT INTO public.admin_ideas (
        id, title, content, tags, created_at, updated_at
      ) VALUES
      (
        '${TEST_ENTITIES.admin_idea_test}'::uuid,
        'test admin idea',
        'this should only be visible to admins',
        ARRAY['test', 'security']::text[],
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('  ✓ 1 admin idea (admin-only access)');
    
    console.log('\nseed complete ✓');
    console.log('\ntest data summary:');
    console.log('  users: 6 (admin, alice, bob, carol, dave, eve)');
    console.log('  creator profiles: 2 (alice, bob)');
    console.log('  market accounts: 2 (alice, bob)');
    console.log('  artifacts: 3 (2 alice, 1 bob)');
    console.log('  orders: 2 (carol→alice, eve→alice)');
    console.log('  commissions: 2 (dave→alice, carol→bob)');
    console.log('  admin ideas: 1');
    console.log('\ncross-account isolation:');
    console.log('  carol order should not be visible to eve');
    console.log('  dave commission should not be visible to carol');
    console.log('  alice artifacts should not be editable by bob');
    console.log('\nprivate data for leakage tests:');
    console.log('  market_accounts: access_key_hash, payout_details, email');
    console.log('  orders: customer_email, customer_name, shipping_address, notes');
    
    return {
      users: TEST_USERS,
      entities: TEST_ENTITIES,
    };
  } catch (error) {
    console.error('\nfailed to seed test data:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    throw error;
  }
}

// if run directly, build db and seed
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
  console.log('running seed-security-test-data as main module...\n');
  const { buildTestDatabase } = await import('./build-security-test-db.mjs');
  
  try {
    const db = await buildTestDatabase();
    await seedTestData(db);
    
    // verification queries
    console.log('\nverification queries:');
    
    const userCount = await db.query('SELECT COUNT(*) as count FROM auth.users;');
    console.log(`  users in auth.users: ${userCount.rows[0].count}`);
    
    const profileCount = await db.query('SELECT COUNT(*) as count FROM public.profiles;');
    console.log(`  profiles: ${profileCount.rows[0].count}`);
    
    const adminCount = await db.query(`SELECT COUNT(*) as count FROM public.user_roles WHERE role = 'admin';`);
    console.log(`  admins: ${adminCount.rows[0].count}`);
    
    const creatorCount = await db.query('SELECT COUNT(*) as count FROM public.creator_profiles;');
    console.log(`  creator profiles: ${creatorCount.rows[0].count}`);
    
    const artifactCount = await db.query('SELECT COUNT(*) as count FROM public.artifacts;');
    console.log(`  artifacts: ${artifactCount.rows[0].count}`);
    
    const orderCount = await db.query('SELECT COUNT(*) as count FROM public.orders;');
    console.log(`  orders: ${orderCount.rows[0].count}`);
    
    const commissionCount = await db.query('SELECT COUNT(*) as count FROM public.commission_requests;');
    console.log(`  commissions: ${commissionCount.rows[0].count}`);
    
    console.log('\nseed verification successful ✓');
    process.exit(0);
  } catch (error) {
    console.error('\nseed failed:', error.message);
    process.exit(1);
  }
}
