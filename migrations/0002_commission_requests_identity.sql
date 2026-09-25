-- 0002_commission_requests_identity.sql
--
-- corrective migration for the commission-request vulnerabilities: anonymous
-- intake and public read. the product rule is that commissioners must be
-- signed in, so intake requires an authenticated identity and reads are
-- limited to the commissioner, the addressed creator, and admins.
--
-- cumulative and additive: named policies are dropped and replaced, the one
-- schema change is a nullable identity column, so existing rows stay legible
-- to admins while they are re-identified or closed.
--
-- review before running. this repo does not apply migrations automatically.

-- 1. commissioner identity
alter table public.commission_requests
  add column if not exists commissioner_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_commission_requests_commissioner
  on public.commission_requests(commissioner_user_id);

-- 2. intake: authenticated commissioners only. the policy forces
-- commissioner_user_id to the caller's uid; a null or forged value is
-- rejected by the with check.
drop policy if exists "commission_requests anon insert" on public.commission_requests;

create policy "commission_requests commissioner insert"
  on public.commission_requests for insert
  to authenticated
  with check (commissioner_user_id = auth.uid());

-- 3. reads: participants only. the previous public read exposed every
-- buyer's name, email, budget, and private brief to anyone.
drop policy if exists "commission_requests public read" on public.commission_requests;

create policy "commission_requests participant read"
  on public.commission_requests for select
  to authenticated
  using (
    commissioner_user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin'::app_role)
    or exists (
      select 1 from public.creator_profiles cp
      where cp.username = commission_requests.creator_handle
        and cp.user_id = auth.uid()
    )
  );

-- 4. commissioners may revise their own brief only before the creator acts
-- on it; the status guard blocks re-editing after acceptance.
create policy "commission_requests commissioner update while new"
  on public.commission_requests for update
  to authenticated
  using (commissioner_user_id = auth.uid() and status = 'new')
  with check (commissioner_user_id = auth.uid() and status = 'new');

-- 5. the existing "commission_requests admin manage" (admin-only, all
-- operations) and "commission_requests owner update" (creator by handle
-- via creator_profiles) policies remain in force unchanged.
--
-- legacy rows created before this migration carry no commissioner identity
-- and are therefore visible to admins only until re-identified or closed.
