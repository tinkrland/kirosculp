import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const db = new PGlite();
const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  creator: '00000000-0000-4000-8000-000000000002',
  buyer: '00000000-0000-4000-8000-000000000010',
  admin2: '00000000-0000-4000-8000-000000000004',
  profile: '00000000-0000-4000-8000-000000000010',
  missing: '00000000-0000-4000-8000-000000000099',
};
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const eq = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };
async function denied(fn, code) {
  await assert.rejects(fn, error => error.code === code);
  checks++;
}
async function as(role, uid, fn) {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid || '']);
  try { return await fn(); }
  finally { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub', '', false)"); }
}
const req = n => `00000000-0000-4000-8000-${String(100 + n).padStart(12, '0')}`;
const payload = (n, revision = 0, overrides = {}) => ({
  buyerUser: ids.profile, level: 'unassessed', review: 'none', policy: 'draft-v1',
  reason: 'initial context, not a finding of wrongdoing', evidence: [], revision, request: req(n), ...overrides,
});
async function set(p) {
  return (await db.query('select public.admin_set_buyer_trust($1,$2,$3,$4,$5,$6::jsonb,$7,$8) as result',
    [p.buyerUser,p.level,p.review,p.policy,p.reason,JSON.stringify(p.evidence),p.revision,p.request])).rows[0].result;
}
async function get(profile = ids.profile) {
  return (await db.query('select public.admin_get_buyer_trust($1) as result', [profile])).rows[0].result;
}
const count = async () => (await db.query('select count(*)::int as n from sculptura_private.buyer_trust_events')).rows[0].n;

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to authenticated, service_role;
    create type public.app_role as enum ('admin', 'member');
    create table public.user_roles (user_id uuid references auth.users, role public.app_role);
    create table public.creator_profiles (id uuid primary key, user_email text);
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant select,insert,update,delete on tables to anon,authenticated,service_role;
  `);
  // use the actual existing role helper, not a stub that always grants admin.
  const source = fs.readFileSync('what-exists/lovable/supabase/migrations/20260429121931_9c9604ec-b6a3-42b5-9f02-c438b5ab8101.sql', 'utf8');
  const helper = source.match(/create or replace function public\.has_role\([\s\S]*?\$\$;/)?.[0];
  assert.ok(helper);
  await db.exec(helper);
  for (const id of [ids.admin,ids.admin2,ids.creator,ids.buyer]) await db.query('insert into auth.users values ($1)', [id]);
  for (const id of [ids.admin,ids.admin2]) await db.query("insert into public.user_roles values ($1, 'admin')", [id]);
  await db.query('insert into public.creator_profiles values ($1,$2)', [ids.profile,'creator@example.test']);
  await db.exec(fs.readFileSync('migrations/0009_private_creator_trust.sql','utf8'));
  await db.exec(fs.readFileSync('migrations/0010_private_buyer_trust.sql','utf8'));
  // only test fixtures define extra levels; the migration does not finalize taxonomy.
  await db.exec("insert into sculptura_private.buyer_trust_levels values ('fixture_trusted','test fixture only',true),('fixture_disabled','test fixture only',false)");

  await as('anon', null, async () => {
    await denied(() => get(), '42501');
    await denied(() => set(payload(1)), '42501');
    await denied(() => db.query('select * from sculptura_private.buyer_trust'), '42501');
  });
  await as('authenticated', null, async () => { await denied(() => get(), '42501'); });
  await as('authenticated', ids.admin, async () => {
    eq(await get(), null, 'no implicit assessment');
    const first = await set(payload(1));
    eq(first.revision, 1, 'first revision');
    eq(first.assessed_by, ids.admin, 'actor derived from auth');
    eq(await count(), 1, 'atomic history entry');
    eq(await set(payload(1)), first, 'idempotent exact replay');
    eq(await count(), 1, 'replay has no duplicate history');
    await denied(() => set(payload(1,0,{reason:'changed payload'})), '22023');
    await denied(() => set(payload(2,0)), '40001');
    const second = await set(payload(2,1,{level:'fixture_trusted',review:'in_review', evidence:[{kind:'order',id:ids.profile}]}));
    eq(second.revision, 2, 'revision increments');
    eq(second.level_key, 'fixture_trusted', 'review separate from trust');
    eq(second.review_state, 'in_review', 'trusted fixture can be under review');
    eq(await set(payload(1)), first, 'old replay returns original result without overwriting current state');
    eq((await get()).revision, 2, 'current row remains newest');
    eq(await count(), 2, 'two decisions, two events');
    await denied(() => set(payload(3,2,{level:'unknown'})), '22023');
    await denied(() => set(payload(3,2,{level:'fixture_disabled'})), '22023');
    await denied(() => set(payload(3,2,{review:'blocked'})), '22023');
    await denied(() => set(payload(3,2,{reason:''})), '22023');
    await denied(() => set(payload(3,2,{reason:'\t\n'})), '22023');
    await denied(() => set(payload(3,2,{policy:'\t\n'})), '22023');
    await denied(() => set(payload(3,2,{evidence:[{kind:'order',id:ids.profile,raw_biometric:'not permitted'}]})), '22023');
    await denied(() => set(payload(3,2,{evidence:['not a reference']})), '22023');
    await denied(() => set(payload(3,2,{evidence:Array(33).fill({kind:'order',id:ids.profile})})), '22023');
    await denied(() => set(payload(3,0,{buyerUser:ids.missing})), '23503');
    eq(await count(), 2, 'invalid writes do not create events');
    await denied(() => db.query("update sculptura_private.buyer_trust set review_state='none'"), '42501');
    await denied(() => db.query('delete from sculptura_private.buyer_trust_events'), '42501');
    await denied(() => db.query('truncate sculptura_private.buyer_trust_events'), '42501');
  });
  for (const uid of [ids.creator, ids.buyer]) await as('authenticated',uid,async () => {
    await denied(() => get(), '42501');
    await denied(() => get(ids.missing), '42501');
    await denied(() => set(payload(4,2)), '42501');
    for (const table of ['buyer_trust','buyer_trust_levels','buyer_trust_events']) {
      eq((await db.query(`select * from sculptura_private.${table}`)).rows,[],`non-admin cannot read ${table}`);
    }
    await denied(() => db.query("insert into sculptura_private.buyer_trust_levels values ('self_upgrade','no',true)"), '42501');
  });
  await as('authenticated',ids.admin2,async () => { await denied(() => set(payload(1)), '22023'); });
  await as('service_role',null,async () => {
    eq(await count(), 2, 'trusted backend read only');
    await denied(() => set(payload(4,2)), '42501');
    await denied(() => db.query("update sculptura_private.buyer_trust set level_key='fixture_trusted'"), '42501');
    await denied(() => db.query('delete from sculptura_private.buyer_trust_events'), '42501');
  });
  await denied(() => db.query('update sculptura_private.buyer_trust_events set revision=99'), '42501');
  await denied(() => db.query('delete from sculptura_private.buyer_trust_events'), '42501');
  await denied(() => db.query('truncate sculptura_private.buyer_trust_events'), '42501');

  await db.exec(`create function sculptura_private.test_fail_event() returns trigger language plpgsql as $$
    begin raise exception 'simulated audit insert failure'; end; $$;
    create trigger test_fail_event before insert on sculptura_private.buyer_trust_events for each row execute function sculptura_private.test_fail_event();`);
  await as('authenticated',ids.admin,async () => {
    await denied(() => set(payload(5,2)), 'P0001');
    eq((await get()).revision, 2, 'audit failure rolls back state');
    eq(await count(), 2, 'audit failure adds no event');
  });
  await db.exec('drop trigger test_fail_event on sculptura_private.buyer_trust_events; drop function sculptura_private.test_fail_event()');
  await db.query('delete from public.user_roles where user_id=$1',[ids.admin]);
  await as('authenticated',ids.admin,async () => { await denied(() => get(), '42501'); await denied(() => set(payload(6,2)), '42501'); });

  const ajv = new Ajv({allErrors:true}); addFormats(ajv);
  const validate = ajv.compile(JSON.parse(fs.readFileSync('contracts/buyer-trust.schema.json','utf8')));
  const snapshot = (await db.query('select to_jsonb(t) as value from sculptura_private.buyer_trust t')).rows[0].value;
  ok(validate(snapshot), JSON.stringify(validate.errors));
  ok(!validate({...snapshot,public_badge:'trusted'}),'public progression field rejected');
  ok(!validate({...snapshot,relationship_status:'not part of this model'}),'relationship inference field rejected');
  ok(!validate({...snapshot,cheating_probability:0}),'cheating score rejected');
  const columns=(await db.query("select column_name from information_schema.columns where table_schema='auth' and table_name='users'")).rows;
  ok(!columns.some(x=>x.column_name.includes('trust')),'no trust field on base user record');
  eq((await db.query('select before_state,after_state from sculptura_private.buyer_trust_events order by revision')).rows[1].before_state.revision,1,'audit stores previous snapshot');
  eq((await db.query('select count(*)::int as n from sculptura_private.creator_trust')).rows[0].n,0,'buyer assessment does not create creator trust');
  console.log(`private buyer trust: ${checks} checks passed (local pglite; not live supabase/postgrest)`);
} finally { await db.close(); }
