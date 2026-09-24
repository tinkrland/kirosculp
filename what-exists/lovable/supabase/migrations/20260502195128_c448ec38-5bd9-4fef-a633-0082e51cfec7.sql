-- collections table
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  creator_handle text not null,
  slug text not null,
  name text not null,
  description text,
  cover_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists collections_handle_slug_uniq
  on public.collections(creator_handle, slug);

create index if not exists collections_handle_idx
  on public.collections(creator_handle);

alter table public.collections enable row level security;

-- public can read collections (storefronts are public)
create policy "collections public read"
  on public.collections for select
  to public
  using (true);

-- ownership check: a creator owns the handle if a market_accounts row with that
-- handle exists. since market_account auth is via access-key (not auth.uid),
-- we mirror the artifacts-style approach: allow authenticated users to manage
-- collections for handles that belong to a creator_profile they own, OR allow
-- admins. demo/anon edits will go through a server-side path later if needed.
create policy "collections owner manage by creator_profile"
  on public.collections for all
  to authenticated
  using (
    exists (
      select 1 from public.creator_profiles cp
      where cp.username = collections.creator_handle
        and cp.user_id = auth.uid()
    )
    or has_role(auth.uid(), 'admin'::app_role)
  )
  with check (
    exists (
      select 1 from public.creator_profiles cp
      where cp.username = collections.creator_handle
        and cp.user_id = auth.uid()
    )
    or has_role(auth.uid(), 'admin'::app_role)
  );

-- updated_at trigger
create trigger collections_touch_updated_at
  before update on public.collections
  for each row execute function public.touch_updated_at();

-- artifacts: seo + slug + tags + collection link
alter table public.artifacts
  add column if not exists slug text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists keywords text[] default '{}'::text[],
  add column if not exists tags text[] default '{}'::text[],
  add column if not exists collection_id uuid references public.collections(id) on delete set null;

create unique index if not exists artifacts_handle_slug_uniq
  on public.artifacts(creator_handle, slug)
  where slug is not null;

create index if not exists artifacts_collection_id_idx
  on public.artifacts(collection_id);

-- market_accounts: default margin + newsletter
alter table public.market_accounts
  add column if not exists default_margin_pct numeric default 30,
  add column if not exists newsletter_enabled boolean not null default false,
  add column if not exists newsletter_label text,
  add column if not exists newsletter_signups jsonb not null default '[]'::jsonb;