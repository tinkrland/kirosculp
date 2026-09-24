
-- harden function search_path
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user already had search_path set. recreate to be explicit and
-- ensure SECURITY DEFINER is the minimum needed.
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

-- has_role is meant for internal RLS use only. revoke client execute.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;

-- replace the wide-open market_accounts update policy with admin-only.
-- store dashboards now go through the store-update edge function, which
-- runs as the service role after verifying the access key hash.
drop policy if exists "market_accounts open update" on public.market_accounts;

-- tighten orders insert: a signed-in caller must own the row they create.
drop policy if exists "orders authenticated insert" on public.orders;
create policy "orders authenticated insert"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());
