#!/usr/bin/env node
// build-security-test-db.mjs
//
// builds a local pglite database with the full cumulative migration history:
// 16 lovable migrations + 12 foundation corrective migrations.
//
// usage:
//   import { buildTestDatabase } from './scripts/build-security-test-db.mjs';
//   const db = await buildTestDatabase();

import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// lovable migrations in timestamp order
const LOVABLE_MIGRATIONS = [
  '20260429121931_9c9604ec-b6a3-42b5-9f02-c438b5ab8101.sql',
  '20260429122004_f718597b-59ba-4308-923e-fd9aec0b81d3.sql',
  '20260429122035_5bcf1110-f37c-4ac9-88ec-dd77a38e15cb.sql',
  '20260502195128_c448ec38-5bd9-4fef-a633-0082e51cfec7.sql',
  '20260502200217_38ecd397-62c4-47c7-a19e-4917a8d5d17e.sql',
  '20260503125015_541284ac-cbd2-43eb-bd92-efe6d386c144.sql',
  '20260503130507_352d9fe0-7d51-4a9f-893d-0d6939d02417.sql',
  '20260504202012_4b47f7e1-7216-4f9b-904f-494900b11321.sql',
  '20260504212857_43abbc24-c9d3-4769-b406-847f89ab210a.sql',
  '20260505064442_b304de80-4f93-4c0b-8944-8e19c269f04b.sql',
  '20260505235720_f99baeeb-dad2-49cf-bf0f-2a8b496c9e06.sql',
  '20260507203814_a97e9138-63d7-456b-865d-fb23e0cd1f9d.sql',
  '20260508223346_8a3e80b6-f227-4551-915f-5bd9c6bd63b7.sql',
  '20260510225657_c756adde-18f0-4515-b5e1-2cbb60b51349.sql',
  '20260511214818_436a49d3-d410-4bab-a5ac-e13598c8ac4c.sql',
  '20260512235827_aeefe298-c713-460c-b532-c88f90d6ffd3.sql',
];

// foundation corrective migrations in numeric order
const FOUNDATION_MIGRATIONS = [
  '0001_admin_roles_and_market_account_privacy.sql',
  '0002_commission_requests_identity.sql',
  '0003_admin_ideas_lockdown.sql',
  '0004_orders_purchase_path.sql',
  '0005_market_accounts_intake.sql',
  '0006_public_schema_grants.sql',
  '0007_escrow_and_ledger.sql',
  '0008_order_purchase_idempotency.sql',
  '0009_private_creator_trust.sql',
  '0010_private_buyer_trust.sql',
  '0011_payout_signal_evidence.sql',
  '0012_embargoed_territory_review.sql',
];

async function applyMigration(db, filepath, name) {
  try {
    const sql = fs.readFileSync(filepath, 'utf8');
    // execute entire migration as single block (pglite handles statement separation)
    await db.exec(sql);
    
    console.log(`✓ applied ${name}`);
    return { success: true, name };
  } catch (error) {
    console.error(`✗ failed to apply ${name}`);
    console.error(`  error: ${error.message}`);
    console.error(`  filepath: ${filepath}`);
    if (error.stack) {
      console.error(`  stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    return { success: false, name, error: error.message };
  }
}

export async function buildTestDatabase() {
  console.log('building security test database...\n');
  
  // create in-memory pglite instance
  console.log('initializing pglite...');
  const db = await PGlite.create();
  console.log('pglite initialized ✓\n');
  
  // create supabase-specific schemas and roles that migrations expect
  console.log('setting up supabase infrastructure...');
  try {
    await db.exec(`
      -- pglite doesn't have pgcrypto, so provide gen_random_bytes function
      CREATE OR REPLACE FUNCTION gen_random_bytes(byte_length integer)
      RETURNS bytea
      LANGUAGE sql
      AS $$
        SELECT decode(
          substring(
            md5(random()::text || clock_timestamp()::text || random()::text) ||
            md5(random()::text || clock_timestamp()::text || random()::text),
            1, 
            byte_length * 2
          ), 
          'hex'
        );
      $$;
      
      -- create auth schema for supabase auth tables
      CREATE SCHEMA IF NOT EXISTS auth;
      
      -- create storage schema for supabase storage
      CREATE SCHEMA IF NOT EXISTS storage;
      
      -- create supabase roles (pglite may not have these by default)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role NOLOGIN BYPASSRLS;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
          CREATE ROLE postgres SUPERUSER;
        END IF;
      END
      $$;
      
      -- create auth.users table (required by lovable migrations that reference it)
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text,
        encrypted_password text,
        email_confirmed_at timestamptz,
        invited_at timestamptz,
        confirmation_token text,
        confirmation_sent_at timestamptz,
        recovery_token text,
        recovery_sent_at timestamptz,
        email_change_token_new text,
        email_change text,
        email_change_sent_at timestamptz,
        last_sign_in_at timestamptz,
        raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
        raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
        is_super_admin boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        phone text,
        phone_confirmed_at timestamptz,
        phone_change text,
        phone_change_token text,
        phone_change_sent_at timestamptz,
        confirmed_at timestamptz,
        email_change_token_current text,
        email_change_confirm_status smallint,
        banned_until timestamptz,
        reauthentication_token text,
        reauthentication_sent_at timestamptz,
        is_sso_user boolean DEFAULT false,
        deleted_at timestamptz
      );
      
      -- create auth.uid() function that rls policies use
      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS uuid
      LANGUAGE sql
      STABLE
      AS $$
        SELECT COALESCE(
          current_setting('request.jwt.claim.sub', true),
          (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        )::uuid;
      $$;
      
      -- create auth.jwt() function that returns full jwt claims
      CREATE OR REPLACE FUNCTION auth.jwt()
      RETURNS jsonb
      LANGUAGE sql
      STABLE
      AS $$
        SELECT COALESCE(
          current_setting('request.jwt.claims', true)::jsonb,
          '{}'::jsonb
        );
      $$;
      
      -- create storage.buckets and storage.objects tables
      CREATE TABLE IF NOT EXISTS storage.buckets (
        id text PRIMARY KEY,
        name text NOT NULL,
        owner uuid REFERENCES auth.users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        public boolean DEFAULT false,
        avif_autodetection boolean DEFAULT false,
        file_size_limit bigint,
        allowed_mime_types text[]
      );
      
      CREATE TABLE IF NOT EXISTS storage.objects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id text REFERENCES storage.buckets(id),
        name text,
        owner uuid REFERENCES auth.users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        last_accessed_at timestamptz DEFAULT now(),
        metadata jsonb,
        path_tokens text[],
        version text,
        UNIQUE(bucket_id, name)
      );
      
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      
      -- grant auth schema access to anon and authenticated roles
      GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated, service_role;
      
      -- grant public schema access
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
    `);
    console.log('supabase infrastructure ready ✓\n');
  } catch (error) {
    console.error('failed to set up supabase infrastructure:', error.message);
    throw error;
  }
  
  const results = [];
  
  // apply lovable migrations
  console.log('applying lovable migrations (16 files)...');
  const lovablePath = path.join(root, 'what-exists/lovable/supabase/migrations');
  
  for (const filename of LOVABLE_MIGRATIONS) {
    const filepath = path.join(lovablePath, filename);
    if (!fs.existsSync(filepath)) {
      console.error(`✗ missing migration file: ${filename}`);
      throw new Error(`migration file not found: ${filepath}`);
    }
    const result = await applyMigration(db, filepath, `lovable/${filename}`);
    results.push(result);
    if (!result.success) {
      throw new Error(`migration failed: ${result.name}`);
    }
  }
  
  // apply foundation migrations
  console.log(`\napplying foundation migrations (${FOUNDATION_MIGRATIONS.length} files)...`);
  const foundationPath = path.join(root, 'migrations');
  
  for (const filename of FOUNDATION_MIGRATIONS) {
    const filepath = path.join(foundationPath, filename);
    if (!fs.existsSync(filepath)) {
      console.error(`✗ missing migration file: ${filename}`);
      throw new Error(`migration file not found: ${filepath}`);
    }
    const result = await applyMigration(db, filepath, `foundation/${filename}`);
    results.push(result);
    if (!result.success) {
      throw new Error(`migration failed: ${result.name}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\nschema build complete: ${successCount}/${totalCount} migrations applied`);
  
  // verify key tables exist
  const tables = await db.query(
    `SELECT table_name FROM information_schema.tables 
     WHERE table_schema = 'public' 
     ORDER BY table_name;`
  );
  
  console.log(`\nverification: ${tables.rows.length} tables in public schema`);
  console.log('tables:', tables.rows.map(r => r.table_name).join(', '));
  
  return db;
}

// if run directly (not imported), build and verify
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  try {
    const db = await buildTestDatabase();
    
    // additional verification queries
    console.log('\nverification checks:');
    
    const policies = await db.query(
      `SELECT COUNT(*) as count FROM pg_policies;`
    );
    console.log(`  ${policies.rows[0].count} rls policies`);
    
    const functions = await db.query(
      `SELECT COUNT(*) as count FROM pg_proc 
       WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');`
    );
    console.log(`  ${functions.rows[0].count} public functions`);
    
    const roles = await db.query(
      `SELECT COUNT(*) as count FROM pg_roles 
       WHERE rolname IN ('anon', 'authenticated', 'service_role');`
    );
    console.log(`  ${roles.rows[0].count} supabase roles (expected 3)`);
    
    console.log('\nschema build successful ✓');
    process.exit(0);
  } catch (error) {
    console.error('\nschema build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
