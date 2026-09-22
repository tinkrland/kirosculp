---
title: security fixes
summary: the two concrete vulnerabilities found in sculptura.dev, read line by line, with the exact fix for each.
---

# security fixes

these are the two real, verified issues — not general advice. both were confirmed by reading the actual files and the actual supabase migrations, not inferred.

## 1. hardcoded admin password, shipped in the client bundle

**file:** `sculptura.dev/src/components/admin/AdminLayout.jsx`

```js
const ADMIN_PASSWORD = "Password";
```

this string ships inside the client javascript bundle. anyone who opens devtools or views the bundled `dist/assets/*.js` can read it directly — it's not a secret on the server, it's plaintext in code the browser downloads. the gate is `sessionStorage`-based with no server-side check at all: unlock the ui once, and every `/admin/*` page and every supabase call the admin pages make runs with whatever permissions the anon key already has, password or not.

the fix doesn't require inventing anything new. migration `20260429121931` already built exactly the infrastructure needed and it's sitting unused:

- `public.user_roles` table (`user_id`, `role` — `admin` or `member`)
- `public.has_role(_user_id, _role)` — a `security definer` function existing policies already call

**the fix:** replace the password gate with a real auth check.
1. admin pages require a logged-in supabase session (reuse the same `Auth.jsx` sign-in already built for buyers/creators).
2. `AdminLayout` checks `has_role(auth.uid(), 'admin')` (via a supabase rpc call) instead of comparing a typed string to a hardcoded constant.
3. every admin-only table policy (`artifacts admin manage`, `market_accounts` admin update, `manufacturers`, `platform_settings`) already gates on `has_role(..., 'admin')` — so once the ui requires a real session, the backend enforcement is already correct. the password gate was ui-only theater on top of policies that were already checking the right thing.
4. granting the first admin is a one-time manual insert into `user_roles` for your own account — not a ui flow, on purpose, so admin grants aren't self-service.

see `migrations/0001_admin_roles_and_market_account_privacy.sql` for the policy-side half of this (the table policies are already right; this fix is almost entirely a frontend change plus one manual role grant).

## 2. `market_accounts` select policy exposes payout details and the access-key hash to anyone

**file:** `sculptura.dev/supabase/migrations/20260429121931_..._9c9604ec.sql`

```sql
-- public read so anyone can browse store profiles. sensitive fields like
-- payout_details and access_key_hash are still exposed by select; in a
-- production system these would be moved to a private side-table. for the
-- demo we keep the legacy schema intact and rely on the hash being a
-- one-way digest of the key (not the key itself).
create policy "market_accounts public read"
  on public.market_accounts for select
  using (true);
```

the comment already correctly diagnoses the problem — this note is what confirmed it needs fixing now, not later. `using (true)` means every column on every row is readable by anyone, including:
- `payout_details` (bank/paypal/wise/crypto destination — a creator's actual payout info)
- `access_key_hash` (a sha-256 digest, so not directly usable to log in, but still not something that belongs in a public response — hashes of low-entropy or reused keys are crackable, and there's no reason to expose it at all)

storefronts genuinely do need public reads (`handle`, `display_name`, `bio`, `avatar_url`, socials, store customization, commission terms) — that part of the policy comment is right. the fix is to stop reading the whole row publicly and instead expose a **public-safe view** with only the columns a storefront actually needs, while the real table stays locked down to the owner (verified via the existing access-key-hash flow, server-side, through `store-update`) and to admins.

**the fix:** see `migrations/0001_admin_roles_and_market_account_privacy.sql` — it:
1. drops the `market_accounts public read` blanket policy
2. creates `public.market_accounts_public` (a view exposing only storefront-safe columns)
3. adds a narrow `market_accounts owner or admin read` policy on the base table for authenticated flows that legitimately need the full row (the store-update edge function already uses the service-role client, so it's unaffected)
4. leaves every other existing policy (insert, admin manage) untouched — this is additive, not a rewrite

## what this fix intentionally does not touch

it does not change the market-account access-key model itself (a hashed key instead of full supabase auth for creators). that's a legitimate lightweight-auth pattern for a pilot, and store-update already re-verifies the key server-side on every write. the two fixes above are specifically the "plaintext password" and "overly permissive rls" issues that were flagged — not a request to redesign creator auth.
