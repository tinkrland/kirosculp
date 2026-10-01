-- private, internal creator confidence classifications; not public progression.
-- requires the existing creator_profiles, app_role and has_role definitions.
-- taxonomy beyond unassessed remains a separately reviewed policy decision.
-- apply as postgres; do not expose sculptura_private through postgrest.
begin;

create schema if not exists sculptura_private;
revoke all on schema sculptura_private from public, anon, authenticated, service_role;
grant usage on schema sculptura_private to authenticated, service_role;

create function sculptura_private.valid_trust_evidence(refs jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(refs) = 'array' then
    pg_catalog.jsonb_array_length(refs) <= 32 and not exists (
      select 1 from pg_catalog.jsonb_array_elements(refs) as x(e)
      where not coalesce(
        pg_catalog.jsonb_typeof(e) = 'object'
        and e = pg_catalog.jsonb_build_object('kind', e->'kind', 'id', e->'id')
        and pg_catalog.jsonb_typeof(e->'kind') = 'string'
        and e->>'kind' in ('case', 'order', 'commission', 'provider_event', 'audit_event')
        and pg_catalog.jsonb_typeof(e->'id') = 'string'
        and e->>'id' ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$', false)
    ) else false end;
$$;
revoke all on function sculptura_private.valid_trust_evidence(jsonb) from public, anon, authenticated, service_role;

create table sculptura_private.creator_trust_levels (
  level_key text primary key check (level_key ~ '^[a-z][a-z0-9_]{0,63}$'),
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  enabled boolean not null default true
);
insert into sculptura_private.creator_trust_levels (level_key, description)
values ('unassessed', 'insufficient assessed history; not a finding of wrongdoing');

create table sculptura_private.creator_trust (
  creator_profile_id uuid primary key references public.creator_profiles(id) on delete restrict,
  level_key text not null references sculptura_private.creator_trust_levels(level_key),
  review_state text not null check (review_state in ('none', 'context_requested', 'in_review')),
  policy_version text not null check (char_length(btrim(policy_version)) between 1 and 128 and policy_version ~ '[^[:space:]]'),
  decision_reason text not null check (char_length(btrim(decision_reason)) between 1 and 2000 and decision_reason ~ '[^[:space:]]'),
  evidence_refs jsonb not null default '[]' check (sculptura_private.valid_trust_evidence(evidence_refs)),
  revision integer not null check (revision > 0),
  assessed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sculptura_private.creator_trust_events (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles(id) on delete restrict,
  revision integer not null check (revision > 0),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  request_id uuid not null unique,
  request_payload jsonb not null check (jsonb_typeof(request_payload) = 'object'),
  before_state jsonb check (before_state is null or jsonb_typeof(before_state) = 'object'),
  after_state jsonb not null check (jsonb_typeof(after_state) = 'object'),
  occurred_at timestamptz not null default now(),
  unique (creator_profile_id, revision)
);

-- explicit acl repair: never inherit the broad public-schema grants in 0006.
revoke all on sculptura_private.creator_trust_levels,
  sculptura_private.creator_trust, sculptura_private.creator_trust_events
  from public, anon, authenticated, service_role;
grant select on sculptura_private.creator_trust_levels,
  sculptura_private.creator_trust, sculptura_private.creator_trust_events
  to authenticated, service_role;
alter table sculptura_private.creator_trust_levels enable row level security;
alter table sculptura_private.creator_trust enable row level security;
alter table sculptura_private.creator_trust_events enable row level security;
create policy "admins read trust levels" on sculptura_private.creator_trust_levels
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "admins read creator trust" on sculptura_private.creator_trust
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "admins read trust history" on sculptura_private.creator_trust_events
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));

create function sculptura_private.reject_trust_history_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'creator trust history is append-only' using errcode = '42501';
end;
$$;
revoke all on function sculptura_private.reject_trust_history_mutation() from public, anon, authenticated, service_role;
create trigger trust_history_no_edit before update or delete
  on sculptura_private.creator_trust_events for each row
  execute function sculptura_private.reject_trust_history_mutation();
create trigger trust_history_no_truncate before truncate
  on sculptura_private.creator_trust_events for each statement
  execute function sculptura_private.reject_trust_history_mutation();

-- admin-only rpc, safe even though its name is discoverable in public.
-- authentication is checked before creator lookup; no existence oracle.
create function public.admin_get_creator_trust(p_creator_profile_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;
  select pg_catalog.to_jsonb(t) into v_result
    from sculptura_private.creator_trust t where t.creator_profile_id = p_creator_profile_id;
  return v_result;
end;
$$;

create function public.admin_set_creator_trust(
  p_creator_profile_id uuid,
  p_level_key text,
  p_review_state text,
  p_policy_version text,
  p_decision_reason text,
  p_evidence_refs jsonb,
  p_expected_revision integer,
  p_request_id uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid;
  v_before jsonb;
  v_after jsonb;
  v_payload jsonb;
  v_replay sculptura_private.creator_trust_events%rowtype;
  v_revision integer;
begin
  v_actor := auth.uid();
  if v_actor is null or not public.has_role(v_actor, 'admin'::public.app_role) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;
  if p_creator_profile_id is null or p_request_id is null
     or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'creator, request id and nonnegative revision required' using errcode = '22023';
  end if;
  if p_level_key is null or p_review_state is null
     or p_review_state not in ('none', 'context_requested', 'in_review')
     or p_policy_version is null or char_length(btrim(p_policy_version)) not between 1 and 128
     or p_decision_reason is null or char_length(btrim(p_decision_reason)) not between 1 and 2000
     or p_decision_reason !~ '[^[:space:]]' or p_policy_version !~ '[^[:space:]]'
     or p_evidence_refs is null or not sculptura_private.valid_trust_evidence(p_evidence_refs) then
    raise exception 'invalid trust assessment' using errcode = '22023';
  end if;
  v_payload := pg_catalog.jsonb_build_object(
    'creator_profile_id', p_creator_profile_id, 'level_key', p_level_key,
    'review_state', p_review_state, 'policy_version', btrim(p_policy_version),
    'decision_reason', btrim(p_decision_reason), 'evidence_refs', p_evidence_refs,
    'expected_revision', p_expected_revision);

  -- lock request then creator; serialize retries and initial-row creation.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request_id::text, 0));
  select * into v_replay from sculptura_private.creator_trust_events where request_id = p_request_id;
  if found then
    if v_replay.actor_user_id <> v_actor or v_replay.request_payload <> v_payload then
      raise exception 'request id reused with a different actor or payload' using errcode = '22023';
    end if;
    return v_replay.after_state;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_creator_profile_id::text, 1));
  if not exists (select 1 from sculptura_private.creator_trust_levels
                 where level_key = p_level_key and enabled) then
    raise exception 'unknown or disabled trust level' using errcode = '22023';
  end if;
  select pg_catalog.to_jsonb(t), t.revision into v_before, v_revision
    from sculptura_private.creator_trust t where t.creator_profile_id = p_creator_profile_id for update;
  v_revision := coalesce(v_revision, 0);
  if v_revision <> p_expected_revision then
    raise exception 'stale creator trust revision' using errcode = '40001';
  end if;
  insert into sculptura_private.creator_trust as t
    (creator_profile_id, level_key, review_state, policy_version, decision_reason,
     evidence_refs, revision, assessed_by)
  values (p_creator_profile_id, p_level_key, p_review_state, btrim(p_policy_version),
          btrim(p_decision_reason), p_evidence_refs, v_revision + 1, v_actor)
  on conflict (creator_profile_id) do update set
    level_key = excluded.level_key, review_state = excluded.review_state,
    policy_version = excluded.policy_version, decision_reason = excluded.decision_reason,
    evidence_refs = excluded.evidence_refs, revision = excluded.revision,
    assessed_by = excluded.assessed_by, updated_at = now()
  returning pg_catalog.to_jsonb(t) into v_after;
  insert into sculptura_private.creator_trust_events
    (creator_profile_id, revision, actor_user_id, request_id, request_payload, before_state, after_state)
  values (p_creator_profile_id, v_revision + 1, v_actor, p_request_id, v_payload, v_before, v_after);
  return v_after;
end;
$$;

revoke all on function public.admin_get_creator_trust(uuid) from public, anon, authenticated, service_role;
revoke all on function public.admin_set_creator_trust(uuid,text,text,text,text,jsonb,integer,uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.admin_get_creator_trust(uuid) to authenticated;
grant execute on function public.admin_set_creator_trust(uuid,text,text,text,text,jsonb,integer,uuid) to authenticated;
commit;
