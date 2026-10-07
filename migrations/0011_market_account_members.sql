-- 0011_market_account_members.sql
--
-- cin-to-sin membership model. cin (creator profile) and sin (storefront
-- account) are separate identities by design: the owner has kept them
-- separate precisely because the cardinality is a product decision that
-- will expand - two creators sharing one storefront (two sisters running
-- one shop with adjusted margins) or one creator running several
-- storefronts or workspaces under the same payout kyc.
--
-- so the link is a membership table, not a hard column on either side:
--
--   market_account_members (cin, sin, role, margin_pct)
--
-- the current rule "one sin per cin" is expressed as an index that can be
-- dropped later, not as a structural constraint. the roles and the
-- margin_pct column exist now so the expansion needs no identity
-- restructuring.
--
-- note on kyc: payout onboarding is per person at the provider, so several
-- storefronts under one creator inherit the same rail with no change on
-- the payout side.
--
-- review before running. this repo does not apply migrations automatically.
-- a earlier draft of this migration used a direct creator_profile_id column
-- on market_accounts with a unique index; if that draft was applied, this
-- migration folds its data into the membership model and drops the column.

create table if not exists public.market_account_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  creator_profile_id uuid not null
    references public.creator_profiles(id) on delete cascade,
  market_account_id uuid not null
    references public.market_accounts(id) on delete cascade,
  -- owner runs the storefront; co_runner is a shared-storefront member.
  -- membership management flows (invites, removal) are a later server-side
  -- flow, never a direct table write.
  role text not null default 'owner'
    check (role in ('owner', 'co_runner')),
  -- the member's adjusted margin share for shared storefronts. null means
  -- the storefront default applies. exact semantics (share of storefront
  -- earnings vs per-item margin override) are an owner decision to make
  -- before the shared-storefront expansion ships.
  margin_pct numeric
    check (margin_pct is null or (margin_pct >= 0 and margin_pct <= 100)),
  unique (creator_profile_id, market_account_id)
);

-- backfill from the fixture convention: shop email matches the creator
-- profile email. idempotent; folds in any links from the earlier draft.
insert into public.market_account_members (creator_profile_id, market_account_id, role)
select distinct cp.id, ma.id, 'owner'
from public.creator_profiles cp
join public.market_accounts ma on ma.email = cp.user_email
on conflict do nothing;

-- v1 rule: one storefront per creator. this index is the rule; dropping it
-- later is the whole "one cin, many storefronts" expansion.
create unique index if not exists market_account_members_one_sin_per_cin
  on public.market_account_members (creator_profile_id);

-- one owner per storefront; co_runners can be added without touching this.
create unique index if not exists market_account_members_one_owner_per_sin
  on public.market_account_members (market_account_id)
  where role = 'owner';

-- the earlier draft of this migration (and 0005 before it) expressed the
-- link differently; drop the draft's column, superseded by memberships.
alter table public.market_accounts
  drop column if exists creator_profile_id;

alter table public.market_account_members enable row level security;

-- who runs a storefront is public storefront-page information.
create policy "market_account_members public read"
  on public.market_account_members for select
  to anon, authenticated
  using (true);

-- a creator links only their own profile, and may only claim a storefront
-- that has no members yet: the first membership row is the claim. joining
-- an existing storefront (the sisters case) is a future invite flow, not a
-- direct write.
create policy "market_account_members owner create"
  on public.market_account_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id and cp.user_id = auth.uid()
    )
    and not exists (
      select 1 from public.market_account_members m
      where m.market_account_id = market_account_id
    )
  );

-- members manage their own membership row (margin override later); managing
-- other members is a future owner flow.
create policy "market_account_members owner update"
  on public.market_account_members for update
  to authenticated
  using (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id and cp.user_id = auth.uid()
    )
  );

create policy "market_account_members owner delete"
  on public.market_account_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.creator_profiles cp
      where cp.id = creator_profile_id and cp.user_id = auth.uid()
    )
  );

-- storefront intake: replace 0005's handle-equality check (shop handle =
-- artist username), which couples the two handle namespaces the owner has
-- ruled independent, with the v1 one-storefront rule: an admitted creator
-- with no existing membership may open a storefront. the membership claim
-- completes the link, and the one_sin_per_cin index backstops it.
drop policy if exists "market_accounts owner create" on public.market_accounts;
create policy "market_accounts owner create"
  on public.market_accounts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.user_id = auth.uid()
    )
    and not exists (
      select 1 from public.market_account_members m
      join public.creator_profiles cp on cp.id = m.creator_profile_id
      where cp.user_id = auth.uid()
    )
  );
