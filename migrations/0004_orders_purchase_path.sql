-- 0004_orders_purchase_path.sql
--
-- corrective migration for order intake and visibility.
--
-- guest checkout stays a product requirement, but direct anonymous inserts
-- into the orders table stop being the mechanism: guest purchases move to
-- the idempotent server purchase operation (platform leg), which creates
-- orders with the service role after payment authorization. until that
-- operation exists, authenticated buyers self-insert and nothing else does.
--
-- email-equality reads are removed: knowing (or registering) an email
-- address is not proof of order ownership. private reads require account
-- ownership, addressed-creator access, or the admin role.
--
-- review before running. this repo does not apply migrations automatically.

-- 1. intake
drop policy if exists "orders anyone insert" on public.orders;

create policy "orders authenticated self insert"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- 2. visibility: owner, addressed creator, admin. no email equality.
drop policy if exists "orders read own or by email" on public.orders;

create policy "orders owner read" on public.orders
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin'::app_role)
    or exists (
      select 1 from public.creator_profiles cp
      where cp.username = orders.creator_handle
        and cp.user_id = auth.uid()
    )
  );

-- guest orders (user_id null) are created by the server purchase operation
-- and are admin-visible until a scoped guest-access mechanism ships with
-- that operation (a per-order access token issued at purchase time). that
-- gap is deliberate and visible, not a regression to email guessing.
--
-- order updates stay server-side (service role) today; an owner update
-- policy is added when the buyer dashboard can actually use it.
