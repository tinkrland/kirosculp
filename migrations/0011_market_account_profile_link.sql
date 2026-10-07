-- 0011_market_account_profile_link.sql
--
-- explicit cin-to-sin link. the one-shop-per-creator rule was previously
-- expressed implicitly by 0005's intake policy (creator_profiles.username =
-- market_accounts.handle), which couples the two handle namespaces the
-- owner has ruled independent: shop handle and artist handle are two
-- different handles on two different surfaces. an explicit, unique
-- creator_profile_id expresses the 1-sin-per-cin rule directly, without
-- requiring the shop handle to equal the artist username.
--
-- review before running. this repo does not apply migrations automatically.

alter table public.market_accounts
  add column if not exists creator_profile_id uuid
    references public.creator_profiles(id) on delete set null;

-- backfill from the fixture convention: shop email matches the creator
-- profile email. unlinked shops keep null until their creator is known.
update public.market_accounts ma
  set creator_profile_id = cp.id
  from public.creator_profiles cp
  where cp.user_email = ma.email
    and ma.creator_profile_id is null;

-- the unique index is the 1-sin-per-cin rule itself: at most one shop
-- row per creator profile. partial so unlinked rows stay allowed.
create unique index if not exists market_accounts_creator_profile_uniq
  on public.market_accounts (creator_profile_id)
  where creator_profile_id is not null;

-- intake now proves ownership through the explicit link instead of handle
-- equality with the profile username.
drop policy if exists "market_accounts owner create" on public.market_accounts;
create policy "market_accounts owner create"
  on public.market_accounts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = market_accounts.creator_profile_id
        and cp.user_id = auth.uid()
    )
  );
