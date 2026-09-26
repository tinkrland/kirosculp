-- 0008_order_purchase_idempotency.sql
--
-- the idempotency anchor for the server-side purchase operation. 0004
-- removed client-side order inserts in favor of an idempotent server
-- path; this gives that path its key. a client supplies one
-- client_request_key per purchase attempt. the service looks the key up
-- first: if an order exists for it, the attempt is a retry and returns
-- the original order instead of double-charging. the unique constraint
-- is the backstop if two attempts race.

alter table public.orders
  add column if not exists client_request_key text;

create unique index if not exists orders_client_request_key_uidx
  on public.orders (client_request_key)
  where client_request_key is not null;

-- the gateway_ref on escrow_holds (payment intent id, unique) provides
-- the same replay protection for webhook-driven hold creation; no second
-- hold can ever be opened for one payment intent.
