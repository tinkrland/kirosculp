# creator fixtures

the demo roster as seeded accounts, not just roster rows. the fixture
data lives in [demo-roster.json](demo-roster.json) (58 artists, 6
buyers, matching [the roster doc](../demo-roster.md) and its oct 7
2026 sheet). usernames are generated fixture values; shop handles are
the owner's sheet values; emails use the `fixtures.sculptura.dev`
placeholder domain.

## seeding a disposable project

the owner-approved approach (oct 7 2026) is a fresh, disposable
supabase project, not the foundation project and not the original
sculptura.dev project:

1. create the project in the supabase dashboard (free plan is fine).
2. apply the full schema with [apply-migrations.mjs](../../scripts/apply-migrations.mjs):
   `SUPABASE_MGMT_TOKEN=<sbp token> SUPABASE_PROJECT_REF=<ref> node scripts/apply-migrations.mjs`
3. seed with [seed-demo-roster.mjs](../../scripts/seed-demo-roster.mjs):
   `SUPABASE_URL=https://<ref>.supabase.co SUPABASE_ADMIN_KEY=<service_role key> node scripts/seed-demo-roster.mjs`

what gets created per artist: an auth user (email confirmed, fixture
metadata), a `creator_profiles` row carrying the cin-bearing profile,
and a `market_accounts` shop where the roster has a shop handle (5 so
far). buyers get auth users only; buyer profile tables do not exist
yet. `seed-report.json` is the run output (not committed).

the id model follows [the identity model](../../identity-model.md):
cin is the creator profile identity, sin the shop row, bin the buyer
auth user. passwords are deterministic demo values, safe only because
the project is disposable; never reuse the scheme for real accounts.
