
create table if not exists public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  capabilities text[] not null default '{}',
  supported_materials text[] not null default '{}',
  status text not null default 'inactive',
  contact_email text,
  notes text,
  api_endpoint text,
  credential_ref text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.manufacturers enable row level security;

create policy "manufacturers admin manage"
on public.manufacturers for all to authenticated
using (has_role(auth.uid(), 'admin'))
with check (has_role(auth.uid(), 'admin'));

create trigger manufacturers_touch_updated_at
before update on public.manufacturers
for each row execute function public.touch_updated_at();

create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  sales_routing_mode text not null default 'stripe_demo',
  default_manufacturer_id uuid references public.manufacturers(id) on delete set null,
  payout_mode text not null default 'manual',
  maintenance_mode boolean not null default false,
  support_email text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

create policy "platform_settings admin manage"
on public.platform_settings for all to authenticated
using (has_role(auth.uid(), 'admin'))
with check (has_role(auth.uid(), 'admin'));

create trigger platform_settings_touch_updated_at
before update on public.platform_settings
for each row execute function public.touch_updated_at();

insert into public.platform_settings (singleton) values (true)
on conflict (singleton) do nothing;
