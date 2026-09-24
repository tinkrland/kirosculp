# security blockers found in source

these are source findings, not claims that a running production system is currently compromised or that the proposed repair has been deployed.

| evidence | finding | required repair |
|---|---|---|
| [`sculptura.dev/src/components/admin/AdminLayout.jsx`](../what-exists/lovable/src/components/admin/AdminLayout.jsx) | a universal plaintext client-side password gates the admin display through session storage | remove the client secret; use authenticated named admins and server-enforced role checks on every protected action |
| [`sculptura.dev/supabase/migrations/20260512235827_aeefe298-c713-460c-b532-c88f90d6ffd3.sql`](../what-exists/lovable/supabase/migrations/20260512235827_aeefe298-c713-460c-b532-c88f90d6ffd3.sql) | `admin_ideas` permits unrestricted read and modification | apply restrictive cumulative row policies and service-side authorization |
| [`sculptura.dev/supabase/migrations/20260502200217_38ecd397-62c4-47c7-a19e-4917a8d5d17e.sql`](../what-exists/lovable/supabase/migrations/20260502200217_38ecd397-62c4-47c7-a19e-4917a8d5d17e.sql) | commission request policies allow anonymous insert and broad visibility | block unauthorized intake/read; require authenticated commissioner identity and participant/admin access |
| [`sculptura.dev/supabase/migrations/20260429121931_9c9604ec-b6a3-42b5-9f02-c438b5ab8101.sql`](../what-exists/lovable/supabase/migrations/20260429121931_9c9604ec-b6a3-42b5-9f02-c438b5ab8101.sql) plus later migrations | initial roles, market accounts, and order policies require cumulative review; permissive policies can override intended protections | enumerate every effective policy, test guest, creator, buyer, and admin cross-tenant access, and deploy corrective migrations |
| [`sculptura.dev/supabase/functions/place-order/index.ts`](../what-exists/lovable/supabase/functions/place-order/index.ts) and `publish-artifact/index.ts` | server intake exists but checkout is unpaid and publishing still accepts financial values from the client | enforce release/quote-derived server values, ownership, idempotency, and verified provider state |

`sculptura-foundation/migrations/0001_admin_roles_and_market_account_privacy.sql` is a proposed corrective migration in the foundation. it does **not** prove that it has been applied to the live database. keep explicit test evidence and deployment status before marking this blocker fixed. credentials in source snapshot environment files are omitted from the public file ledger.
