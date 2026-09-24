
-- add created_by column on artifacts
alter table public.artifacts
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists artifacts_created_by_idx on public.artifacts(created_by);

-- replace broad insert policy with ownership-scoped one
drop policy if exists "artifacts authenticated insert" on public.artifacts;
create policy "artifacts owner insert"
  on public.artifacts for insert
  to authenticated
  with check (created_by = auth.uid());

-- let creators update their own drafts; admins keep full control via the
-- pre-existing admin manage policy.
create policy "artifacts owner update"
  on public.artifacts for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- creator_profiles: tie ownership to user id
alter table public.creator_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

drop policy if exists "creator_profiles authenticated insert" on public.creator_profiles;
create policy "creator_profiles owner insert"
  on public.creator_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

-- replace email-based update policy with id-based
drop policy if exists "creator_profiles owner update" on public.creator_profiles;
create policy "creator_profiles owner update"
  on public.creator_profiles for update
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- ensure trigger functions are not callable directly by clients.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
