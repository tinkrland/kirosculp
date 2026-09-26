-- 0007_escrow_and_ledger.sql
--
-- escrow and payment holding for the commission and order flows. this is
-- the database primitive the platform leg builds on: money a buyer pays is
-- held by the platform and only released to creator, manufacturer, and
-- platform fee accounts when the flow says so, with every movement
-- recorded in an append-only ledger.
--
-- supabase is the authoritative financial ledger for this platform. spree
-- (the eventual storefront and checkout engine) and the payment gateways
-- (localstripe/fetchsandbox now, stripe later) plug in around this, they
-- never replace it. see platform/payments/README.md.
--
-- apply in order after 0006.

-- ---------------------------------------------------------------- escrow

create table public.escrow_holds (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('order', 'commission')),
  order_id uuid references public.orders on delete set null,
  commission_request_id uuid references public.commission_requests on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  currency char(3) not null default 'usd',
  state text not null default 'awaiting_payment'
    check (state in ('awaiting_payment', 'held', 'released', 'refunded', 'cancelled')),
  gateway text not null default 'sandbox',
  gateway_ref text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'order' and order_id is not null and commission_request_id is null)
    or
    (kind = 'commission' and commission_request_id is not null and order_id is null)
  )
);

create trigger touch_updated_at_escrow_holds
  before update on public.escrow_holds
  for each row execute function public.touch_updated_at();

-- the state machine. legal transitions only:
--   awaiting_payment -> held      (payment captured by the gateway)
--   awaiting_payment -> cancelled (buyer or creator backs out before pay)
--   held             -> released  (delivery/approval: creator, manufacturer, fee paid out)
--   held             -> refunded  (dispute or cancellation after capture)
-- everything else is rejected, and terminal states never reopen.
-- creation terms (kind, target, amount, currency, gateway) are immutable.

create function public.escrow_hold_guard() returns trigger as $$
begin
  if new.id <> old.id then
    raise exception 'escrow hold id is immutable';
  end if;
  if new.kind <> old.kind or new.order_id is distinct from old.order_id
     or new.commission_request_id is distinct from old.commission_request_id
     or new.amount_cents <> old.amount_cents or new.currency <> old.currency
     or new.gateway <> old.gateway then
    raise exception 'escrow hold terms are immutable after creation';
  end if;
  if new.state = old.state then
    return new;
  end if;
  if not (
       (old.state = 'awaiting_payment' and new.state in ('held', 'cancelled'))
    or (old.state = 'held' and new.state in ('released', 'refunded'))
  ) then
    raise exception 'illegal escrow transition: % -> %', old.state, new.state;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger escrow_hold_state_machine
  before update on public.escrow_holds
  for each row execute function public.escrow_hold_guard();

-- --------------------------------------------------------------- ledger

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null,
  escrow_hold_id uuid references public.escrow_holds on delete set null,
  account text not null check (account in (
    'buyer_source', 'platform_escrow', 'creator_payable',
    'manufacturer_payable', 'platform_fee', 'refund_source'
  )),
  direction text not null check (direction in ('debit', 'credit')),
  amount_cents integer not null check (amount_cents > 0),
  currency char(3) not null default 'usd',
  memo text,
  created_at timestamptz not null default now()
);

create index ledger_entries_group_idx on public.ledger_entries (group_id);
create index ledger_entries_hold_idx on public.ledger_entries (escrow_hold_id);

-- a group is balanced when its debits equal its credits. this view is the
-- audit surface; unbalanced rows mean a writer misused the ledger.
create view public.ledger_group_balances as
select
  group_id,
  currency,
  sum(case when direction = 'debit' then amount_cents else -amount_cents end) as net_cents,
  count(*) as entry_count
from public.ledger_entries
group by group_id, currency;

-- ------------------------------------------------------------ access

-- these tables are platform money. no client role may touch them, and no
-- policy set could make that safe to relax casually. 0006's default
-- privileges would have granted anon/authenticated access automatically,
-- so revoke explicitly.

revoke all on public.escrow_holds from anon, authenticated;
revoke all on public.ledger_entries from anon, authenticated;
revoke all on public.ledger_group_balances from anon, authenticated;

-- the ledger is append-only even for the server: entries record what
-- happened, they are never edited or deleted. corrections are new entries.
revoke update, delete on public.ledger_entries from service_role;

-- rls as the second layer: admins may read for support and dispute
-- review; writes stay with the server path.
alter table public.escrow_holds enable row level security;
alter table public.ledger_entries enable row level security;

create policy "escrow admin read" on public.escrow_holds
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "ledger admin read" on public.ledger_entries
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));
