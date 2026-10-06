-- private payout signal evidence for creator payout fraud control.
-- requires 0009 (sculptura_private schema), creator_profiles, has_role and app_role.
-- apply as postgres after 0010; do not expose sculptura_private through postgrest.
--
-- geography never feeds trust. none of these tables is a trust record, none
-- references creator_trust or buyer_trust, and only payout_signal_policy carries
-- a market code, as check-selection configuration keyed by iso 3166-1 alpha-2
-- codes from operations/country-rollout/creator-payout-rails.json.
--
-- raw fingerprint payloads and plaintext ip addresses have no column here.
-- writes go through one service_role-only function. clients have no write path.
begin;

-- ---------------------------------------------------------------- validators

create function sculptura_private.valid_signal_check_names(names jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(names) = 'array' then
    pg_catalog.jsonb_array_length(names) <= 4 and not exists (
      select 1 from pg_catalog.jsonb_array_elements(names) as x(e)
      where not coalesce(
        pg_catalog.jsonb_typeof(e) = 'string'
        and (e #>> '{}') in ('proxy', 'vpn', 'tor', 'datacenter'), false)
    ) else false end;
$$;

create function sculptura_private.valid_signal_reason_codes(codes jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(codes) = 'array' then
    pg_catalog.jsonb_array_length(codes) <= 8 and not exists (
      select 1 from pg_catalog.jsonb_array_elements(codes) as x(e)
      where not coalesce(
        pg_catalog.jsonb_typeof(e) = 'string'
        and (e #>> '{}') in (
          'proxy_detected', 'vpn_detected', 'tor_detected', 'datacenter_detected',
          'feed_unavailable', 'coverage_unavailable', 'collection_unavailable'), false)
    ) else false end;
$$;

-- a flag with coverage none was not evaluated, so it can never be true.
-- a flag that was evaluated must say which source and dataset version decided it.
create function sculptura_private.valid_network_flags(flags jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(flags) = 'object' then not exists (
    select 1 from pg_catalog.jsonb_each(flags) as f(k, v)
    where not coalesce(
      f.k in ('proxy', 'vpn', 'tor', 'datacenter')
      and pg_catalog.jsonb_typeof(f.v) = 'object'
      and (select pg_catalog.array_agg(key order by key)
             from pg_catalog.jsonb_object_keys(f.v) as key)
          = array['coverage', 'dataset_version', 'source_id', 'value']::text[]
      and pg_catalog.jsonb_typeof(f.v -> 'value') = 'boolean'
      and (f.v ->> 'coverage') in ('full', 'partial', 'none')
      and (
        ((f.v ->> 'coverage') = 'none'
          and (f.v ->> 'value') = 'false'
          and pg_catalog.jsonb_typeof(f.v -> 'source_id') in ('string', 'null')
          and pg_catalog.jsonb_typeof(f.v -> 'dataset_version') in ('string', 'null'))
        or ((f.v ->> 'coverage') <> 'none'
          and pg_catalog.jsonb_typeof(f.v -> 'source_id') = 'string'
          and pg_catalog.jsonb_typeof(f.v -> 'dataset_version') = 'string'
          and pg_catalog.char_length(f.v ->> 'source_id') between 1 and 64
          and pg_catalog.char_length(f.v ->> 'dataset_version') between 1 and 64)
      ), false)
  ) else false end;
$$;

-- stored device features are a small closed shape so a raw payload cannot be
-- smuggled into the column. every key is named, every value is bounded.
create function sculptura_private.valid_device_features(features jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(features) = 'object' then
    pg_catalog.pg_column_size(features) <= 2048
    and not exists (
      select 1 from pg_catalog.jsonb_object_keys(features) as k
      where k not in ('schema_version', 'component_coverage',
                      'automation_indicators', 'inconsistency_indicators'))
    and (not features ? 'schema_version'
         or (pg_catalog.jsonb_typeof(features -> 'schema_version') = 'string'
             and pg_catalog.char_length(features ->> 'schema_version') between 1 and 32))
    and (not features ? 'component_coverage'
         or (pg_catalog.jsonb_typeof(features -> 'component_coverage') = 'number'
             and (features ->> 'component_coverage')::numeric between 0 and 1))
    and (not features ? 'automation_indicators'
         or (pg_catalog.jsonb_typeof(features -> 'automation_indicators') = 'array'
             and pg_catalog.jsonb_array_length(features -> 'automation_indicators') <= 16
             and not exists (
               select 1 from pg_catalog.jsonb_array_elements(features -> 'automation_indicators') as x(e)
               where not coalesce(pg_catalog.jsonb_typeof(e) = 'string'
                 and pg_catalog.char_length(e #>> '{}') between 1 and 64
                 and (e #>> '{}') ~ '^[a-z][a-z0-9_]*$', false))))
    and (not features ? 'inconsistency_indicators'
         or (pg_catalog.jsonb_typeof(features -> 'inconsistency_indicators') = 'array'
             and pg_catalog.jsonb_array_length(features -> 'inconsistency_indicators') <= 16
             and not exists (
               select 1 from pg_catalog.jsonb_array_elements(features -> 'inconsistency_indicators') as x(e)
               where not coalesce(pg_catalog.jsonb_typeof(e) = 'string'
                 and pg_catalog.char_length(e #>> '{}') between 1 and 64
                 and (e #>> '{}') ~ '^[a-z][a-z0-9_]*$', false))))
  else false end;
$$;

revoke all on function sculptura_private.valid_signal_check_names(jsonb),
  sculptura_private.valid_signal_reason_codes(jsonb),
  sculptura_private.valid_network_flags(jsonb),
  sculptura_private.valid_device_features(jsonb)
  from public, anon, authenticated, service_role;

-- ------------------------------------------------------------------- policy

-- check-selection configuration. this is the only table here with a market code.
-- rows change through reviewed migrations, like the trust level taxonomy in 0009.
create table sculptura_private.payout_signal_policy (
  policy_version text not null check (policy_version ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  market text not null check (market = 'DEFAULT' or market ~ '^[A-Z]{2}$'),
  mandatory_checks text[] not null default '{}'
    check (mandatory_checks <@ array['proxy', 'vpn', 'tor', 'datacenter']::text[]),
  positive_outcome text not null default 'needs_review'
    check (positive_outcome in ('needs_review', 'fail')),
  enabled boolean not null default true,
  primary key (policy_version, market)
);

-- v1: strict markets make proxy and vpn mandatory and send a positive to review.
-- `fail` can be configured per market later, once false-positive rates are measured.
insert into sculptura_private.payout_signal_policy (policy_version, market, mandatory_checks)
values ('v1', 'DEFAULT', '{}'),
       ('v1', 'IN', array['proxy', 'vpn']),
       ('v1', 'PK', array['proxy', 'vpn']),
       ('v1', 'BD', array['proxy', 'vpn']);

-- ------------------------------------------------------------------- events

-- one row per processed money-moment attempt. holds hashes and bounded features
-- only. rows older than 12 months are removed by the purge function below.
create table sculptura_private.creator_signal_events (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles(id) on delete restrict,
  moment text not null check (moment in ('payout_onboarding', 'payout_request')),
  submission_id uuid not null unique,
  device_hash text check (device_hash is null or device_hash ~ '^[0-9a-f]{64}$'),
  ip_digest text not null check (ip_digest ~ '^[0-9a-f]{64}$'),
  hash_key_id text not null check (hash_key_id ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  collection_status text not null check (collection_status in ('complete', 'partial', 'unavailable')),
  device_features jsonb not null default '{}'
    check (sculptura_private.valid_device_features(device_features)),
  processor_version text not null check (char_length(processor_version) between 1 and 64),
  occurred_at timestamptz not null default now(),
  check ((collection_status = 'unavailable') = (device_hash is null))
);
create index creator_signal_events_profile_idx
  on sculptura_private.creator_signal_events (creator_profile_id, occurred_at desc);
create index creator_signal_events_occurred_idx
  on sculptura_private.creator_signal_events (occurred_at);

-- ---------------------------------------------------------------- decisions

-- append-only evidence of what was decided and why. it carries flags and source
-- attribution so it stays explainable after the event row has purged. it has no
-- market, country or corridor column and no foreign key to the event.
create table sculptura_private.payout_signal_decisions (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles(id) on delete restrict,
  moment text not null check (moment in ('payout_onboarding', 'payout_request')),
  submission_id uuid not null unique,
  request_digest text not null check (request_digest ~ '^[0-9a-f]{64}$'),
  policy_version text not null check (policy_version ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  selected_checks jsonb not null check (sculptura_private.valid_signal_check_names(selected_checks)),
  outcome text not null check (outcome in ('pass', 'needs_review', 'fail')),
  reason_codes jsonb not null check (sculptura_private.valid_signal_reason_codes(reason_codes)),
  network_flags jsonb not null check (sculptura_private.valid_network_flags(network_flags)),
  adapter_version text not null check (char_length(adapter_version) between 1 and 64),
  occurred_at timestamptz not null default now(),
  -- a pass carries no reason, every other outcome carries at least one.
  check ((outcome = 'pass') = (jsonb_array_length(reason_codes) = 0))
);
create index payout_signal_decisions_profile_idx
  on sculptura_private.payout_signal_decisions (creator_profile_id, occurred_at desc);

-- ---------------------------------------------------------------------- acl

-- explicit acl repair: never inherit the broad public-schema grants in 0006.
revoke all on sculptura_private.payout_signal_policy,
  sculptura_private.creator_signal_events,
  sculptura_private.payout_signal_decisions
  from public, anon, authenticated, service_role;
grant select on sculptura_private.payout_signal_policy,
  sculptura_private.creator_signal_events,
  sculptura_private.payout_signal_decisions
  to authenticated, service_role;

alter table sculptura_private.payout_signal_policy enable row level security;
alter table sculptura_private.creator_signal_events enable row level security;
alter table sculptura_private.payout_signal_decisions enable row level security;

create policy "admins read signal policy" on sculptura_private.payout_signal_policy
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "admins read signal events" on sculptura_private.creator_signal_events
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));
create policy "admins read signal decisions" on sculptura_private.payout_signal_decisions
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- --------------------------------------------------------------- immutability

create function sculptura_private.reject_signal_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'payout signal evidence is append-only' using errcode = '42501';
end;
$$;

-- events: never updated. deleted only by the purge function, which sets a
-- transaction-local flag. clients hold no delete privilege in the first place.
create function sculptura_private.guard_signal_event_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if pg_catalog.current_setting('sculptura.signal_purge', true) is distinct from 'on' then
    raise exception 'signal events are removed only by the purge function' using errcode = '42501';
  end if;
  return old;
end;
$$;

revoke all on function sculptura_private.reject_signal_mutation(),
  sculptura_private.guard_signal_event_delete()
  from public, anon, authenticated, service_role;

create trigger signal_events_no_update before update
  on sculptura_private.creator_signal_events for each row
  execute function sculptura_private.reject_signal_mutation();
create trigger signal_events_guard_delete before delete
  on sculptura_private.creator_signal_events for each row
  execute function sculptura_private.guard_signal_event_delete();
create trigger signal_events_no_truncate before truncate
  on sculptura_private.creator_signal_events for each statement
  execute function sculptura_private.reject_signal_mutation();

create trigger signal_decisions_no_edit before update or delete
  on sculptura_private.payout_signal_decisions for each row
  execute function sculptura_private.reject_signal_mutation();
create trigger signal_decisions_no_truncate before truncate
  on sculptura_private.payout_signal_decisions for each statement
  execute function sculptura_private.reject_signal_mutation();

-- ---------------------------------------------------------------- write path

-- the only write path. service_role only. the node service computes the hashes
-- and the outcome; this function validates shape through the table constraints,
-- makes the write atomic and makes a replay of the same submission idempotent.
create function public.record_payout_signal_check(
  p_creator_profile_id uuid,
  p_moment text,
  p_submission_id uuid,
  p_device_hash text,
  p_ip_digest text,
  p_hash_key_id text,
  p_collection_status text,
  p_device_features jsonb,
  p_processor_version text,
  p_policy_version text,
  p_selected_checks jsonb,
  p_outcome text,
  p_reason_codes jsonb,
  p_network_flags jsonb,
  p_adapter_version text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_payload jsonb;
  v_digest text;
  v_existing sculptura_private.payout_signal_decisions%rowtype;
begin
  if p_creator_profile_id is null or p_submission_id is null or p_moment is null then
    raise exception 'creator, submission id and moment required' using errcode = '22023';
  end if;

  v_payload := pg_catalog.jsonb_build_object(
    'creator_profile_id', p_creator_profile_id, 'moment', p_moment,
    'submission_id', p_submission_id, 'device_hash', p_device_hash,
    'ip_digest', p_ip_digest, 'hash_key_id', p_hash_key_id,
    'collection_status', p_collection_status, 'device_features', p_device_features,
    'processor_version', p_processor_version, 'policy_version', p_policy_version,
    'selected_checks', p_selected_checks, 'outcome', p_outcome,
    'reason_codes', p_reason_codes, 'network_flags', p_network_flags,
    'adapter_version', p_adapter_version);
  v_digest := pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_payload::text, 'UTF8')), 'hex');

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_submission_id::text, 4));

  select * into v_existing from sculptura_private.payout_signal_decisions
    where submission_id = p_submission_id;
  if found then
    if v_existing.request_digest <> v_digest then
      raise exception 'submission id reused with different input' using errcode = '22023';
    end if;
    return pg_catalog.jsonb_build_object(
      'submission_id', v_existing.submission_id, 'outcome', v_existing.outcome,
      'reason_codes', v_existing.reason_codes, 'policy_version', v_existing.policy_version,
      'selected_checks', v_existing.selected_checks, 'replayed', true);
  end if;

  insert into sculptura_private.creator_signal_events
    (creator_profile_id, moment, submission_id, device_hash, ip_digest, hash_key_id,
     collection_status, device_features, processor_version)
  values (p_creator_profile_id, p_moment, p_submission_id, p_device_hash, p_ip_digest,
          p_hash_key_id, p_collection_status, coalesce(p_device_features, '{}'::jsonb),
          p_processor_version);

  insert into sculptura_private.payout_signal_decisions
    (creator_profile_id, moment, submission_id, request_digest, policy_version,
     selected_checks, outcome, reason_codes, network_flags, adapter_version)
  values (p_creator_profile_id, p_moment, p_submission_id, v_digest, p_policy_version,
          p_selected_checks, p_outcome, p_reason_codes, p_network_flags, p_adapter_version);

  return pg_catalog.jsonb_build_object(
    'submission_id', p_submission_id, 'outcome', p_outcome, 'reason_codes', p_reason_codes,
    'policy_version', p_policy_version, 'selected_checks', p_selected_checks,
    'replayed', false);
end;
$$;

-- retention: signal events older than 12 months are removed. decisions are not.
-- no timestamp parameter, so a caller cannot ask for a wider purge than 12 months.
create function sculptura_private.purge_expired_signal_events()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  perform pg_catalog.set_config('sculptura.signal_purge', 'on', true);
  delete from sculptura_private.creator_signal_events
    where occurred_at < pg_catalog.now() - interval '12 months';
  get diagnostics v_count = row_count;
  perform pg_catalog.set_config('sculptura.signal_purge', 'off', true);
  return v_count;
end;
$$;

-- admin read path. authentication is checked before the creator is looked up,
-- so there is no existence oracle. returns decisions, flags, attribution and
-- stored features. raw payloads never existed to return.
create function public.admin_get_payout_signals(
  p_creator_profile_id uuid,
  p_limit integer default 50
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_limit integer; v_result jsonb;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 50), 1), 200);
  select pg_catalog.jsonb_build_object(
    'decisions', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(d) - 'request_digest' order by d.occurred_at desc)
        from (select * from sculptura_private.payout_signal_decisions
               where creator_profile_id = p_creator_profile_id
               order by occurred_at desc limit v_limit) d), '[]'::jsonb),
    'events', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(e) order by e.occurred_at desc)
        from (select * from sculptura_private.creator_signal_events
               where creator_profile_id = p_creator_profile_id
               order by occurred_at desc limit v_limit) e), '[]'::jsonb))
  into v_result;
  return v_result;
end;
$$;

revoke all on function public.record_payout_signal_check(uuid,text,uuid,text,text,text,text,jsonb,text,text,jsonb,text,jsonb,jsonb,text),
  sculptura_private.purge_expired_signal_events(),
  public.admin_get_payout_signals(uuid,integer)
  from public, anon, authenticated, service_role;
grant execute on function public.record_payout_signal_check(uuid,text,uuid,text,text,text,text,jsonb,text,text,jsonb,text,jsonb,jsonb,text) to service_role;
grant execute on function sculptura_private.purge_expired_signal_events() to service_role;
grant execute on function public.admin_get_payout_signals(uuid,integer) to authenticated;

commit;
