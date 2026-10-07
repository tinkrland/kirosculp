#!/usr/bin/env node
// seed the demo roster accounts into a supabase project.
// reads platform/creators/fixtures/demo-roster.json and creates, per artist:
// an auth user, a creator_profiles row (the cin-bearing profile), and a
// market_accounts shop where a shop handle exists. buyers get auth users
// only; buyer-side profile tables do not exist yet.
//
// usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_ADMIN_KEY=<service_role key of the target project> \
//   node scripts/seed-demo-roster.mjs
//
// idempotent: existing users are matched by email, profile and shop rows
// are upserted on their unique keys (merge-duplicates), so a rerun only
// fills gaps. the run writes demo-roster-accounts.json next to the
// fixtures: every account with email, user id, cin (creator profile id),
// sin (shop id) and the full metadata columns. passwords are
// deterministic fixture values (demo-only, disposable project; never
// reuse this scheme for real accounts).

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(here, '..', 'platform', 'creators', 'fixtures');
const fixturesPath = path.join(fixturesDir, 'demo-roster.json');
const accountsPath = path.join(fixturesDir, 'demo-roster-accounts.json');

const url = process.env.SUPABASE_URL;
const adminKey = process.env.SUPABASE_ADMIN_KEY;
if (!url || !adminKey) {
  console.error('need SUPABASE_URL and SUPABASE_ADMIN_KEY env vars');
  process.exit(1);
}

const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const authHeaders = { apikey: adminKey, Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' };
const upsertHeaders = { ...authHeaders, Prefer: 'resolution=merge-duplicates,return=representation' };

const passwordFor = (username) => `fixtures-${username}-demo`;

async function existingUsers() {
  // note: this supabase build does not return total/total_pages, so the
  // loop stops on an empty or short page instead of trusting the pager.
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=100&page=${page}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`admin user list failed: ${res.status} ${await res.text()}`);
    const body = await res.json();
    const users = body.users ?? [];
    for (const u of users) map.set(u.email, u.id);
    if (users.length < 100) break;
    page += 1;
  }
  return map;
}

async function mapLimit(items, limit, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += limit) {
    out.push(...await Promise.all(items.slice(i, i + limit).map(fn)));
  }
  return out;
}

async function createUser(entry) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: entry.email,
      password: passwordFor(entry.username),
      email_confirm: true,
      user_metadata: { fixture: true, region: entry.region, roster_note: entry.fixture },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    // 422 = already registered; fall back to the email->id map
    if (res.status === 422) return null;
    throw new Error(`user create failed for ${entry.name}: ${res.status} ${text}`);
  }
  const body = await res.json();
  return body.id;
}

async function upsert(table, onConflict, row) {
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}&select=id`, {
    method: 'POST',
    headers: upsertHeaders,
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`${table} upsert failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body?.[0]?.id ?? null;
}

const users = await existingUsers();
let created = 0, reused = 0, skipped = 0;

async function ensureUser(entry) {
  let userId = users.get(entry.email);
  if (!userId) {
    userId = await createUser(entry);
    if (userId) { created++; users.set(entry.email, userId); }
  } else reused++;
  if (!userId) { skipped++; console.error(`skipping ${entry.name}: user exists but id unknown`); }
  return userId;
}

async function seedArtist(artist) {
  const userId = await ensureUser(artist);
  const record = {
    kind: 'artist',
    name: artist.name,
    preferred_name: artist.preferred_name,
    username: artist.username,
    email: artist.email,
    phone_number: artist.phone_number,
    age: artist.age,
    pronouns: artist.pronouns,
    region: artist.region,
    residence_note: artist.fixture,
    bank_country: artist.bank_country,
    classification: artist.classification,
    notes: artist.notes,
    user_id: userId,
  };
  if (userId) {
    record.cin = await upsert('creator_profiles', 'username', {
      user_email: artist.email,
      username: artist.username,
      display_name: artist.name,
      user_id: userId,
    });
    if (artist.shop_handle) {
      record.shop_handle = artist.shop_handle;
      record.sin = await upsert('market_accounts', 'handle', {
        handle: artist.shop_handle,
        display_name: artist.name,
        email: artist.email,
        access_key_hash: crypto.createHash('sha256').update(`fixtures:${artist.shop_handle}`).digest('hex'),
        // slug mirrors the handle-8char convention from migration 20260504202012,
        // derived from the handle instead of the row id so reruns stay stable.
        slug: `${artist.shop_handle}-${crypto.createHash('sha256').update(artist.shop_handle).digest('hex').slice(0, 8)}`,
        status: 'active',
      });
    } else {
      record.shop_handle = null;
      record.sin = null;
    }
  }
  return record;
}

async function seedBuyer(buyer) {
  const userId = await ensureUser(buyer);
  return {
    kind: 'buyer',
    name: buyer.name,
    preferred_name: buyer.preferred_name,
    username: buyer.username,
    email: buyer.email,
    phone_number: buyer.phone_number,
    age: buyer.age,
    pronouns: buyer.pronouns,
    region: buyer.region,
    residence_note: buyer.fixture,
    bank_country: buyer.bank_country,
    classification: buyer.classification,
    notes: buyer.notes,
    user_id: userId,
    cin: null, // buyers carry no creator profile; bin is the auth user id
    sin: null,
  };
}

process.stdout.write('seeding artists... ');
const artistRecords = await mapLimit(fixtures.artists, 8, seedArtist);
console.log('done');
process.stdout.write('seeding buyers... ');
const buyerRecords = await mapLimit(fixtures.buyers, 8, seedBuyer);
console.log('done');
const accounts = [...artistRecords, ...buyerRecords];

fs.writeFileSync(accountsPath, JSON.stringify({
  seeded_from: 'demo-roster.json',
  supabase_url: url,
  accounts,
}, null, 2));

const artists = accounts.filter(a => a.kind === 'artist');
console.log(`seeded: ${artists.length} artists (${artists.filter(a => a.sin).length} shops), ${accounts.filter(a => a.kind === 'buyer').length} buyers. users created: ${created}, reused: ${reused}, skipped: ${skipped}.`);
console.log(`accounts registry written to ${accountsPath}`);
