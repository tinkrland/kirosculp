# migrating sculptura to a standalone supabase project

this guide takes you from an empty supabase project to a fully working sculptura backend. follow it in order.

## 1. create the project

create a new supabase project. note the project url, anon key, and service role key. set them as the env vars in port.md.

## 2. run the schema

copy the sql below into the supabase sql editor and run it. it sets up every table, policy, trigger, and storage bucket the app needs. (this is the same migration the lovable cloud version uses.)

### enums and helpers

```sql
create type public.app_role as enum ('admin', 'member');

create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
```

### profiles

```sql
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

create policy "profiles read own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);

create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, is_demo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,''), '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'is_demo')::boolean, false)
  ) on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
```

### user_roles

```sql
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;

create policy "user_roles read own" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "user_roles admin manage" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
```

### artifacts, creator_profiles, market_accounts, orders

the full schema lives in `supabase/migrations/` in this repo. each file is plain sql you can copy into the editor. the four tables and their policies match the entity field names exactly so the db facade can pass payloads through verbatim.

key points to remember when running them:

- enable row level security on every table you create
- `artifacts.created_by` and `creator_profiles.user_id` reference `auth.users(id)`
- `orders.user_id` references `auth.users(id)` and the insert policy requires it match `auth.uid()`
- `market_accounts` is anon-readable and only updatable by admins or the store-update edge function under the service role

### storage

```sql
insert into storage.buckets (id, name, public) values
  ('artifacts','artifacts', true),
  ('avatars','avatars', true),
  ('stores','stores', true)
on conflict (id) do nothing;

create policy "storage public read" on storage.objects for select using (bucket_id in ('artifacts','avatars','stores'));
create policy "storage authenticated upload" on storage.objects for insert to authenticated with check (bucket_id in ('artifacts','avatars','stores'));
```

## 3. enable auth providers

in the supabase dashboard under authentication -> providers:

- enable email auth (confirm email is fine; demo mode will not work unless you disable it, which is your call)
- enable google. the redirect url should be `https://your-project.supabase.co/auth/v1/callback` and your authorized origin is `https://yourapp.com`

## 4. deploy edge functions

two functions live in `supabase/functions/`:

- `place-order`: validates the cart against canonical artifact pricing and inserts orders attributed to the caller
- `store-update`: verifies the access key hash and updates market_accounts under the service role

deploy them with:

```
supabase functions deploy place-order
supabase functions deploy store-update
```

both use the supabase service role key from the function environment automatically.

## 5. set the frontend env

point `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at your project. `npm run dev` and you should see live data.

## map of original backend dependencies

| original                                | supabase replacement                                           |
| --------------------------------------- | -------------------------------------------------------------- |
| db.auth.me / logout / redirectToLogin   | supabase.auth.getUser / signOut / custom /auth route           |
| db.entities.Artifact.* (and others)     | supabase.from('artifacts').* etc., behind src/lib/db.js facade |
| db.integrations.Core.UploadFile         | supabase.storage.from('artifacts').upload                      |
| platform-managed token storage          | supabase-js manages session in localStorage                    |
| platform-managed file urls              | supabase.storage.getPublicUrl                                  |

## differences and limitations

- supabase returns `{ data, error }` instead of throwing on query errors. the facade unwraps that for you.
- the `access_key_hash` flow is custom. there is no provider for it; it works because the keys are sha256 hashes and the key check happens in the store-update edge function.
- realtime subscriptions are not used today. when you need them, set them up with `supabase.channel(...).on('postgres_changes', ...)` and remember to enable realtime on the table.
- supabase auth requires email confirmation by default. demo mode bypasses this only if you disable email confirmation, otherwise users can still sign up by email but must confirm.
