-- 0012_buyer_profiles.sql
-- the bin-bearing buyer profile, mirroring what creator_profiles does for
-- the cin. buyers have no public handle or profile in v1 (identity-model),
-- so unlike creator_profiles this table is not publicly readable: it holds
-- the bin, the signup email, and a display name, nothing else.
-- minted bins are internal join keys: never rendered publicly, readable by
-- the buyer themselves (dashboard settings, discord-style) and admins.
-- apply after 0011; runs as postgres through the sql editor on projects
-- where the management token cannot reach the database/query endpoint.

begin;

create table if not exists public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_email text unique not null,
  display_name text,
  user_id uuid unique references auth.users(id) on delete set null
);

comment on table public.buyer_profiles is
  'buyer account profile; the row id is the bin (buyer id number). '
  'internal join key per the identity model: no public handle, no public read.';

alter table public.buyer_profiles enable row level security;

create trigger buyer_profiles_touch_updated_at
  before update on public.buyer_profiles
  for each row execute function public.touch_updated_at();

drop policy if exists "buyer_profiles self read" on public.buyer_profiles;
create policy "buyer_profiles self read" on public.buyer_profiles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "buyer_profiles self insert" on public.buyer_profiles;
create policy "buyer_profiles self insert" on public.buyer_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "buyer_profiles self update" on public.buyer_profiles;
create policy "buyer_profiles self update" on public.buyer_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- no delete policy: rows are never removed by client roles.
-- explicit grants, because postgres-role default privileges on this
-- project do not reach client roles (see 0006): anon gets nothing here,
-- unlike creator_profiles there is no public surface to serve.
grant select, insert, update on public.buyer_profiles to authenticated;

commit;
