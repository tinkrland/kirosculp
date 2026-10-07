#!/usr/bin/env node
// seed the demo roster accounts into a supabase project.
// reads platform/creators/fixtures/demo-roster.json and creates, per artist:
// an auth user, a creator_profiles row (cin-bearing profile), and a
// market_accounts shop where a shop handle exists. buyers get auth users
// only; buyer-side profile tables do not exist yet.
//
// usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_ADMIN_KEY=<service_role key of the target project> \
//   node scripts/seed-demo-roster.mjs
//
// idempotent: existing users are matched by email, profile and shop rows
// are upserted on their unique keys. passwords are deterministic fixture
// values (demo-only, disposable project; never reuse this scheme for
// real accounts).

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(here, '..', 'platform', 'creators', 'fixtures', 'demo-roster.json');

const url = process.env.SUPABASE_URL;
const adminKey = process.env.SUPABASE_ADMIN_KEY;
if (!url || !adminKey) {
  console.error('need SUPABASE_URL and SUPABASE_ADMIN_KEY env vars');
  process.exit(1);
}

const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
const domain = fixtures.domain;

const authHeaders = { apikey: adminKey, Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' };
const restHeaders = { ...authHeaders, Prefer: 'resolution=merge-duplicates' };

const emailFor = (name) =>
  `${name.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '.')}@${domain}`;
const passwordFor = (username) =>
  `fixtures-${username}-demo`;

async function existingUsers() {
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=100&page=${page}`, { headers: authHeaders });
    if (!res.ok) throw new Error(`admin user list failed: ${res.status} ${await res.text()}`);
    const body = await res.json();
    for (const u of body.users ?? []) map.set(u.email, u.id);
    if (page >= body.total_pages) break;
    page += 1;
  }
  return map;
}

async function createUser(entry) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: emailFor(entry.name),
      password: passwordFor(entry.username),
      email_confirm: true,
      user_metadata: { fixture: true, region: entry.region, roster_note: entry.fixture },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    // already registered: fall back to the email->id map
    if (res.status === 422) return null;
    throw new Error(`user create failed for ${entry.name}: ${res.status} ${text}`);
  }
  const body = await res.json();
  return body.id;
}

async function upsert(table, onConflict, row) {
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: restHeaders,
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`${table} upsert failed: ${res.status} ${await res.text()}`);
}

const summary = { artists: [], buyers: [] };
const users = await existingUsers();
let created = 0, reused = 0;

for (const artist of fixtures.artists) {
  const email = emailFor(artist.name);
  let userId = users.get(email);
  if (!userId) {
    userId = await createUser(artist);
    if (userId) { created++; users.set(email, userId); } 
  } else reused++;
  if (!userId) { console.error(`skipping ${artist.name}: user exists but id unknown`); continue; }

  await upsert('creator_profiles', 'username', {
    user_email: email,
    username: artist.username,
    display_name: artist.name,
    user_id: userId,
  });

  let shopId = null;
  if (artist.shop_handle) {
    const accessKeyHash = crypto
      .createHash('sha256')
      .update(`fixtures:${artist.shop_handle}`)
      .digest('hex');
    await upsert('market_accounts', 'handle', {
      handle: artist.shop_handle,
      display_name: artist.name,
      email,
      access_key_hash: accessKeyHash,
      status: 'active',
    });
  }
  summary.artists.push({ name: artist.name, email, user_id: userId, shop: artist.shop_handle, region: artist.region });
}

for (const buyer of fixtures.buyers) {
  const email = emailFor(buyer.name);
  let userId = users.get(email);
  if (!userId) {
    userId = await createUser(buyer);
    if (userId) { created++; users.set(email, userId); } 
  } else reused++;
  if (!userId) { console.error(`skipping ${buyer.name}: user exists but id unknown`); continue; }
  summary.buyers.push({ name: buyer.name, email, user_id: userId, region: buyer.region });
}

fs.writeFileSync(path.join(here, '..', 'platform', 'creators', 'fixtures', 'seed-report.json'),
  JSON.stringify(summary, null, 2));

console.log(`seeded: ${summary.artists.length} artists (${summary.artists.filter(a => a.shop).length} shops), ${summary.buyers.length} buyers. users created: ${created}, reused: ${reused}.`);
console.log('report written to platform/creators/fixtures/seed-report.json (cin/sin are the profile and shop row ids; fetch them via rest when needed).');
