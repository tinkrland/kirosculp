# migrating sculptura to supabase

this guide maps every backend dependency in sculptura to its supabase equivalent.

the data layer is isolated in three files: `src/api/db.js`, `src/api/storage.js`, and `src/api/auth.js`. migrating to supabase means replacing the bodies of those files. no page or component needs to change.

---

## current backend dependencies

sculptura uses a hosted backend platform for database, auth, and file storage. here is what each maps to in supabase.

---

## 1. authentication

**current**
- `src/api/auth.js` wraps `base44.auth.me()`, `base44.auth.isAuthenticated()`, `base44.auth.logout()`, and `base44.auth.redirectToLogin()`

**supabase equivalent**
- replace `getCurrentUser()` with `supabase.auth.getUser()`
- replace `checkIsAuthenticated()` with `!!(await supabase.auth.getSession()).data.session`
- replace `logout()` with `supabase.auth.signOut()`
- replace `redirectToLogin()` with your chosen sign-in method, e.g. `supabase.auth.signInWithOtp({ email })`

**migration steps**
1. enable email auth in the supabase dashboard under authentication > providers
2. update `src/api/auth.js` to use supabase auth methods
3. update `src/lib/AuthContext.jsx` to handle session via `supabase.auth.onAuthStateChange()`

note: `AuthContext.jsx` is partially platform-managed. only the session handling logic inside it needs updating when migrating auth.

---

## 2. database

**current**
- `src/api/db.js` calls `base44.entities.Artifact.*`, `base44.entities.Order.*`, `base44.entities.MarketAccount.*`, `base44.entities.CreatorProfile.*`

**supabase equivalent**
- replace entity method calls with `supabase.from('table').*` chain syntax
- `base44.entities.Artifact.filter({ status: 'published' })` becomes `supabase.from('artifacts').select().eq('status', 'published')`
- supabase returns `{ data, error }` objects, not raw arrays. adjust accordingly.

**required schema**

run this in the supabase sql editor:

```sql
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by text,
  name text not null,
  description text,
  image_url text,
  model_url text,
  materials text[],
  prices jsonb,
  manufacturing_costs jsonb,
  creator_earnings jsonb,
  region text check (region in ('europe', 'north_america', 'asia', 'global')),
  specs text,
  creator_handle text,
  creator_name text,
  is_featured boolean default false,
  status text check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')) default 'pending_review',
  made_to_order boolean default true,
  category text check (category in ('jewelry', 'sculpture', 'functional', 'wearable', 'decorative', 'experimental')),
  admin_reviewed boolean default false,
  review_notes text
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  artifact_id text not null,
  artifact_name text,
  artifact_image_url text,
  creator_handle text,
  customer_email text,
  customer_name text,
  material text,
  price numeric,
  manufacturing_cost numeric,
  creator_earnings numeric,
  status text check (status in ('placed', 'in_production', 'shipped', 'delivered', 'cancelled')) default 'placed',
  shipping_address text,
  tracking_number text,
  notes text,
  payout_released boolean default false
);

create table market_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  handle text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  email text not null,
  access_key_hash text not null,
  status text check (status in ('draft', 'pending_review', 'active', 'rejected')) default 'draft',
  review_notes text,
  materials text[],
  tools text[],
  commission_open boolean default false,
  hourly_rate numeric,
  turnaround_time text,
  rush_available boolean default false,
  total_revenue numeric default 0,
  total_orders integer default 0,
  pricing_margin_pct numeric default 30,
  pricing_currency text default 'USD',
  payout_method text,
  payout_details text,
  insights_time_spent numeric default 0,
  insights_tool_costs numeric default 0
);

create table creator_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_email text not null,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  materials text[],
  tools text[],
  commission_open boolean default false,
  hourly_rate numeric,
  turnaround_time text,
  rush_available boolean default false
);
```

**migration steps**
1. run the schema above in the supabase sql editor
2. update `src/api/db.js` to use `supabase.from()` calls instead of `base44.entities.*` calls
3. each method in db.js maps directly: listPublished, listAll, getById, create, update, etc.

---

## 3. file storage

**current**
- `src/api/storage.js` calls `base44.integrations.Core.UploadFile({ file })`

**supabase equivalent**
- create two storage buckets in supabase dashboard: `artifacts` and `avatars`
- set bucket policies to allow public read

```js
// replacement for uploadFile() in src/api/storage.js
export async function uploadFile(file) {
  const filename = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('artifacts')
    .upload(filename, file);

  if (error) return null;

  const { data: urlData } = supabase.storage
    .from('artifacts')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
```

---

## 4. row-level security

enable rls on all tables. example for artifacts:

```sql
alter table artifacts enable row level security;

-- public can read published artifacts
create policy "read published artifacts" on artifacts
  for select using (status = 'published');

-- authenticated users can manage their own
create policy "creators manage own artifacts" on artifacts
  for all using (auth.jwt() ->> 'email' = created_by);
```

---

## 5. access key verification for market accounts

the current system stores an access key hash on the market account and verifies it client-side. this works with any backend.

for additional security in production, you may want to verify the key server-side via a supabase edge function and return a short-lived jwt instead of passing the raw key through url params.

```ts
// supabase/functions/verify-market-key/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { handle, key } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_KEY'))

  const { data } = await supabase.from('market_accounts').select().eq('handle', handle).single()
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  const hashHex = Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2,'0')).join('')

  if (hashHex !== data?.access_key_hash) {
    return new Response(JSON.stringify({ error: 'invalid key' }), { status: 401 })
  }

  return new Response(JSON.stringify({ verified: true }))
})
```

---

## limitations and differences

- supabase realtime uses `supabase.channel('table').on('postgres_changes', ...)` instead of the current subscription pattern
- supabase requires explicit `.select()` calls to return data after insert/update
- the `@base44/sdk` package cannot be removed entirely because `AuthContext.jsx` is platform-managed and imports from it
- all other application code (pages, components) does not import from `@base44/sdk` or `base44Client.js` directly