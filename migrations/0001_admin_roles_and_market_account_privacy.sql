-- 0001_admin_roles_and_market_account_privacy.sql
--
-- fixes the two vulnerabilities documented in docs/security-fixes.md.
-- additive only: does not touch existing insert policies, the access-key
-- hash scheme, or admin-manage policies that already gate on has_role().
--
-- review before running. run against the sculptura.dev supabase project
-- (not applied automatically by this repo).

-- =========================================================================
-- 1. market_accounts: stop exposing payout_details / access_key_hash
--    to public select. replace the blanket public-read policy with a
--    public-safe view for storefronts, and a narrower table policy.
-- =========================================================================

drop policy if exists "market_accounts public read" on public.market_accounts;

-- storefront-safe view: everything a public shop page legitimately needs,
-- nothing financial or auth-related.
create or replace view public.market_accounts_public as
select
  id,
  handle,
  display_name,
  bio,
  avatar_url,
  banner_url,
  logo_url,
  status,
  store_heading,
  store_subheading,
  accent_color,
  accent_color_secondary,
  store_icon,
  social_instagram,
  social_twitter,
  social_tiktok,
  social_youtube,
  social_website,
  social_discord,
  social_patreon,
  tip_jar_enabled,
  tip_jar_label,
  tip_jar_url,
  waitlist_enabled,
  waitlist_message,
  faq_items,
  materials,
  tools,
  commission_open,
  hourly_rate,
  turnaround_time,
  rush_available,
  pricing_currency,
  created_at,
  updated_at
from public.market_accounts
where status = 'active';

grant select on public.market_accounts_public to anon, authenticated;

-- the base table: only the owner (proven via the access-key flow, which
-- runs through the store-update edge function using the service role and
-- therefore bypasses rls entirely) or an admin should read the full row
-- directly. this policy covers any authenticated-context read attempt;
-- anonymous storefront rendering should go through market_accounts_public.
create policy "market_accounts admin read"
  on public.market_accounts for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- 2. admin gate: no schema change needed — user_roles and has_role()
--    already exist from the initial migration. this just documents the
--    one manual step required once the frontend password gate is removed.
--
--    to grant yourself admin (run once, manually, with your own user id):
--
--    insert into public.user_roles (user_id, role)
--    values ('<your-auth-user-id>', 'admin');
--
--    do not expose this as a self-service ui action.
-- =========================================================================
