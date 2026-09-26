-- 0005_market_accounts_intake.sql
--
-- corrective migration for market-account creation. the live database
-- (verified against the 2026-09-26 backup) allows anonymous inserts of
-- draft market-account rows. account creation must be an authenticated,
-- ownership-proven act tied to an existing creator profile, not an open
-- table write.
--
-- review before running. this repo does not apply migrations automatically.

drop policy if exists "market_accounts anon create" on public.market_accounts;

-- a signed-in creator may open their own storefront account, for a handle
-- they already own through their creator profile.
create policy "market_accounts owner create"
  on public.market_accounts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.username = market_accounts.handle
        and cp.user_id = auth.uid()
    )
  );

-- anonymous storefront creation is a server-side flow if it is ever offered;
-- it is never a direct table write.
