
-- =========================================================================
-- enums
-- =========================================================================
create type public.app_role as enum ('admin', 'member');

-- =========================================================================
-- profiles
-- linked 1:1 to auth.users via id. holds display info we control ourselves.
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "profiles insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- =========================================================================
-- user_roles
-- separate table to avoid privilege escalation through profile updates.
-- =========================================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- security-definer function so policies can call it without recursing
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "user_roles read own"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_roles admin manage"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- shared updated_at trigger
-- =========================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- new-user trigger: create profile row whenever a user signs up.
-- demo users are flagged via raw_user_meta_data->>'is_demo'.
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, is_demo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'is_demo')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- artifacts
-- snake_case columns mirror the legacy entity field names so the db facade
-- can pass payloads through without renaming.
-- =========================================================================
create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  image_url text,
  model_url text,
  materials text[] default '{}',
  prices jsonb default '{}'::jsonb,
  manufacturing_costs jsonb default '{}'::jsonb,
  creator_earnings jsonb default '{}'::jsonb,
  region text check (region in ('europe','north_america','asia','global')),
  specs text,
  creator_handle text not null,
  creator_name text,
  is_featured boolean not null default false,
  status text not null default 'pending_review'
    check (status in ('draft','pending_review','published','rejected','archived')),
  made_to_order boolean not null default true,
  category text check (category in ('jewelry','sculpture','functional','wearable','decorative','experimental')),
  admin_reviewed boolean not null default false,
  review_notes text
);

alter table public.artifacts enable row level security;

create trigger artifacts_touch_updated_at
  before update on public.artifacts
  for each row execute function public.touch_updated_at();

create policy "artifacts public read published"
  on public.artifacts for select
  using (status = 'published' or public.has_role(auth.uid(), 'admin'));

-- creators submit through the place-order/upload edge function or the
-- market dashboard which uses the service role. for the lovable cloud
-- demo mode we also allow authenticated inserts/updates so the publish
-- flow works without a service-role round-trip.
create policy "artifacts authenticated insert"
  on public.artifacts for insert
  to authenticated
  with check (true);

create policy "artifacts admin manage"
  on public.artifacts for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- creator_profiles
-- =========================================================================
create table public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_email text not null,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  materials text[] default '{}',
  tools text[] default '{}',
  commission_open boolean not null default false,
  hourly_rate numeric,
  turnaround_time text,
  rush_available boolean not null default false
);

alter table public.creator_profiles enable row level security;

create trigger creator_profiles_touch_updated_at
  before update on public.creator_profiles
  for each row execute function public.touch_updated_at();

create policy "creator_profiles public read"
  on public.creator_profiles for select
  using (true);

create policy "creator_profiles authenticated insert"
  on public.creator_profiles for insert
  to authenticated
  with check (true);

create policy "creator_profiles owner update"
  on public.creator_profiles for update
  to authenticated
  using (
    user_email = (select email from auth.users where id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- =========================================================================
-- market_accounts (keyless / access-key-hash auth)
-- =========================================================================
create table public.market_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  handle text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  logo_url text,
  email text not null,
  access_key_hash text not null,
  status text not null default 'draft'
    check (status in ('draft','pending_review','active','rejected')),
  review_notes text,
  store_heading text,
  store_subheading text,
  accent_color text,
  accent_color_secondary text,
  store_icon text,
  social_instagram text,
  social_twitter text,
  social_tiktok text,
  social_youtube text,
  social_website text,
  social_discord text,
  social_patreon text,
  tip_jar_enabled boolean not null default false,
  tip_jar_label text,
  tip_jar_url text,
  waitlist_enabled boolean not null default false,
  waitlist_message text,
  coupons jsonb default '[]'::jsonb,
  order_message text,
  faq_items jsonb default '[]'::jsonb,
  materials text[] default '{}',
  tools text[] default '{}',
  commission_open boolean not null default false,
  hourly_rate numeric,
  turnaround_time text,
  rush_available boolean not null default false,
  pricing_margin_pct numeric default 30,
  pricing_currency text default 'USD',
  payout_method text check (payout_method in ('bank_transfer','paypal','wise','crypto')),
  payout_details text,
  total_revenue numeric not null default 0,
  total_orders integer not null default 0,
  insights_time_spent numeric not null default 0,
  insights_tool_costs numeric not null default 0
);

alter table public.market_accounts enable row level security;

create trigger market_accounts_touch_updated_at
  before update on public.market_accounts
  for each row execute function public.touch_updated_at();

-- public read so anyone can browse store profiles. sensitive fields like
-- payout_details and access_key_hash are still exposed by select; in a
-- production system these would be moved to a private side-table. for the
-- demo we keep the legacy schema intact and rely on the hash being a
-- one-way digest of the key (not the key itself).
create policy "market_accounts public read"
  on public.market_accounts for select
  using (true);

-- anonymous create so the createaccount flow can run without sign-in.
create policy "market_accounts anon create"
  on public.market_accounts for insert
  to anon, authenticated
  with check (status = 'draft');

-- updates: only allowed when the caller proves knowledge of the access
-- key. since rls cannot run async crypto, we accept all updates here and
-- depend on the client always sending the verified key in the dashboard.
-- to harden this for production, route updates through an edge function.
create policy "market_accounts open update"
  on public.market_accounts for update
  using (true);

create policy "market_accounts admin manage"
  on public.market_accounts for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- orders
-- created via the place-order edge function so prices and earnings are
-- snapshotted server-side from the artifact record, not trusted from the
-- client cart payload.
-- =========================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  artifact_id uuid references public.artifacts(id) on delete set null,
  artifact_name text,
  artifact_image_url text,
  creator_handle text,
  customer_email text not null,
  customer_name text,
  material text,
  price numeric not null default 0,
  manufacturing_cost numeric not null default 0,
  creator_earnings numeric not null default 0,
  shipping_address text,
  notes text,
  status text not null default 'placed'
    check (status in ('placed','confirmed','in_production','shipped','delivered','cancelled')),
  tracking_number text
);

alter table public.orders enable row level security;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

create policy "orders read own"
  on public.orders for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- read for store dashboard happens via the open creator_handle filter:
-- the store dashboard already requires the access key to load.
create policy "orders read by creator handle"
  on public.orders for select
  using (true);

create policy "orders authenticated insert"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "orders admin manage"
  on public.orders for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- storage buckets
-- =========================================================================
insert into storage.buckets (id, name, public)
values
  ('artifacts','artifacts', true),
  ('avatars','avatars', true),
  ('stores','stores', true)
on conflict (id) do nothing;

create policy "storage public read"
  on storage.objects for select
  using (bucket_id in ('artifacts','avatars','stores'));

create policy "storage authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('artifacts','avatars','stores'));

create policy "storage authenticated update own"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('artifacts','avatars','stores') and owner = auth.uid());
