-- 0006_public_schema_grants.sql
--
-- the migrations in this repo were originally authored for lovable cloud's
-- pipeline, which applies them as supabase_admin - a role whose default acl
-- on schema public already grants full table access to anon/authenticated,
-- so rls alone appeared to be the access boundary.
--
-- replaying the same ddl through the supabase management api (or any
-- non-lovable path) runs as the plain postgres role instead. on this
-- project, postgres's default acl for schema public grants anon and
-- authenticated only truncate/references/trigger/maintain - no select,
-- insert, update, or delete. every table came back "permission denied"
-- during the denial-test matrix, which is over-restrictive (zero access)
-- rather than the intended rls-gated access.
--
-- the correct supabase security model is grant + rls together: grant
-- decides whether the role may touch the table at all, rls decides which
-- rows. this migration puts the intended access model in place, matching
-- what supabase_admin's default acl already provided on the original
-- lovable-provisioned database.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;

-- keep this true for every table created after this migration, regardless
-- of which role runs future migrations.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- service_role already bypasses rls and should retain full access
-- regardless of this project's default acl; make it explicit rather than
-- relying on implicit superuser-like behavior.
grant select, insert, update, delete on all tables in schema public to service_role;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;
