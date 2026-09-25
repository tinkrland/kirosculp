-- 0003_admin_ideas_lockdown.sql
--
-- corrective migration for admin_ideas: the table shipped with open read,
-- insert, update, and delete, with only a client-side password in front of
-- it. every operation becomes authenticated and admin-role checked on the
-- server, so removing the client password gate (platform leg) is safe: the
-- database, not the browser, decides who administers.
--
-- review before running. this repo does not apply migrations automatically.

drop policy if exists "open read admin_ideas" on public.admin_ideas;
drop policy if exists "open insert admin_ideas" on public.admin_ideas;
drop policy if exists "open update admin_ideas" on public.admin_ideas;
drop policy if exists "open delete admin_ideas" on public.admin_ideas;

create policy "admin_ideas admin read" on public.admin_ideas
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));

create policy "admin_ideas admin insert" on public.admin_ideas
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'::app_role));

create policy "admin_ideas admin update" on public.admin_ideas
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role))
  with check (public.has_role(auth.uid(), 'admin'::app_role));

create policy "admin_ideas admin delete" on public.admin_ideas
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));

-- if public idea submission is ever wanted, it gets a separate intake table
-- with rate limiting and moderation, never this table.
