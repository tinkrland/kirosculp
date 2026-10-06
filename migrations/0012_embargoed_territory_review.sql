-- embargoed-territory ip review trigger for payout fraud control (batch 8,
-- owner design addendum, 2026-10-06). requires 0011.
--
-- this is a check independent of corridor strictness: it runs at both money
-- moments regardless of the rail's market, because the check targets the ip's
-- resolved territory, not the creator's payout rail. a us-rail creator (a
-- non-strict corridor) whose observed ip resolves to an embargoed territory
-- gets the same needs_review hold a strict-corridor creator would.
--
-- the review-trigger list is named configuration, structured like
-- payout_signal_policy: it changes through reviewed migrations, revisable as
-- sanctions and embargo lists change. it must never contain a market that also
-- appears as fatf-grey-listed in operations/country-rollout/creator-payout-rails.json,
-- because a grey list is a laundering-risk signal about rail capability, not an
-- embargo or sanctions regime; folding one into the other is exactly the
-- geography-as-trust-proxy error security/aml/considerations/trust-and-geography.md
-- warns against.
--
-- a single hit is weaker evidence than a sustained pattern. this migration adds
-- no new score and no new write path for that: the pattern is read at review
-- time from the existing append-only payout_signal_decisions rows (see the view
-- below), never pre-computed or stored, and never written to a trust table.
begin;

-- -------------------------------------------------------- vocabulary growth

-- create or replace is safe here: a check constraint calls the function by
-- name at write time, not a frozen binding, so existing rows are unaffected
-- and the new reason code becomes valid going forward.
create or replace function sculptura_private.valid_signal_reason_codes(codes jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(codes) = 'array' then
    pg_catalog.jsonb_array_length(codes) <= 8 and not exists (
      select 1 from pg_catalog.jsonb_array_elements(codes) as x(e)
      where not coalesce(
        pg_catalog.jsonb_typeof(e) = 'string'
        and (e #>> '{}') in (
          'proxy_detected', 'vpn_detected', 'tor_detected', 'datacenter_detected',
          'feed_unavailable', 'coverage_unavailable', 'collection_unavailable',
          'ip_geo_embargoed_territory'), false)
    ) else false end;
$$;

-- geo attribution, parallel to valid_network_flags: coverage none means not
-- evaluated (no source, non-public address, source error) and can never carry
-- a country code. coverage full requires source attribution, same as a
-- network flag, whether or not a country was actually found: "evaluated, no
-- match" (an anonymous network, a satellite range) is full coverage with a
-- null country, never confused with "not evaluated".
create function sculptura_private.valid_geo_evidence(geo jsonb)
returns boolean language sql immutable set search_path = '' as $$
  select case when pg_catalog.jsonb_typeof(geo) = 'object' then
    (select pg_catalog.array_agg(key order by key) from pg_catalog.jsonb_object_keys(geo) as key)
      = array['country_code', 'coverage', 'dataset_version', 'source_id']::text[]
    and (geo ->> 'coverage') in ('full', 'none')
    and pg_catalog.jsonb_typeof(geo -> 'country_code') in ('string', 'null')
    and (
      ((geo ->> 'coverage') = 'none'
        and (geo -> 'country_code') = 'null'::jsonb
        and pg_catalog.jsonb_typeof(geo -> 'source_id') = 'null'
        and pg_catalog.jsonb_typeof(geo -> 'dataset_version') = 'null')
      or ((geo ->> 'coverage') = 'full'
        and pg_catalog.jsonb_typeof(geo -> 'source_id') = 'string'
        and pg_catalog.jsonb_typeof(geo -> 'dataset_version') = 'string'
        and pg_catalog.char_length(geo ->> 'source_id') between 1 and 64
        and pg_catalog.char_length(geo ->> 'dataset_version') between 1 and 64
        and (geo ->> 'country_code' is null or geo ->> 'country_code' ~ '^[A-Z]{2}$'))
    )
  else false end;
$$;

revoke all on function sculptura_private.valid_geo_evidence(jsonb) from public, anon, authenticated, service_role;

-- the decision record gains geo attribution, following the existing
-- network_flags pattern. append-only tables take new nullable columns with a
-- default rather than a destructive rewrite; existing rows backfill to the
-- "not evaluated" shape, which is accurate: they were decided before this
-- check existed.
alter table sculptura_private.payout_signal_decisions
  add column geo_evidence jsonb not null default
    '{"country_code":null,"coverage":"none","source_id":null,"dataset_version":null}'::jsonb
  check (sculptura_private.valid_geo_evidence(geo_evidence));

-- ----------------------------------------------------- review-trigger list

-- named, versioned configuration: which territory codes hold a money moment
-- for human review, and why. revisable as sanctions/embargo lists change.
-- enabled is per-row so a territory can be retired without deleting history.
create table sculptura_private.embargoed_territory_review_list (
  list_version text not null check (list_version ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  territory_code text not null check (territory_code ~ '^[A-Z]{2}$'),
  authority text not null check (char_length(btrim(authority)) between 1 and 200),
  effective_date date not null,
  enabled boolean not null default true,
  primary key (list_version, territory_code)
);

-- disjointness from the fatf grey list is a schema-review invariant, not a
-- one-time check: a trigger enforces it on every insert and update, so a
-- future migration cannot reintroduce the error either. the grey-listed set
-- is maintained in code (scripts/check-embargo-greylist-disjoint.mjs) against
-- operations/country-rollout/creator-payout-rails.json, because that file is
-- dated research evidence outside the database, not a table this schema owns.
-- this trigger instead enforces the narrower, always-true half of the rule
-- directly in sql: a territory_code column value is syntactically a market
-- code and nothing stops it colliding with a known grey entry by name alone,
-- so the trigger blocks the five grey-listed codes recorded as of the
-- 2026-06-19 fatf plenary (security/aml/considerations/trust-and-geography.md
-- "corridor strictness tracks rail maturity"; the rails matrix is the source
-- of truth and the application-level check reconciles against it on every
-- schema build).
create function sculptura_private.reject_greylisted_embargo_entry()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.territory_code in ('NP', 'VN', 'BO', 'VE', 'KE') then
    raise exception
      'territory % is fatf grey-listed, not embargoed or sanctioned; grey-list status is a rail-capability signal, never a trust or review-trigger input',
      new.territory_code
      using errcode = '22023';
  end if;
  return new;
end;
$$;
revoke all on function sculptura_private.reject_greylisted_embargo_entry() from public, anon, authenticated, service_role;
create trigger embargo_list_reject_greylisted before insert or update
  on sculptura_private.embargoed_territory_review_list for each row
  execute function sculptura_private.reject_greylisted_embargo_entry();

-- v1 seed: a starting embargo/sanctions list. authority and effective_date are
-- descriptive provenance, not a legal determination made by this schema; the
-- actual list content is an operations/legal decision this migration records,
-- not originates.
insert into sculptura_private.embargoed_territory_review_list
  (list_version, territory_code, authority, effective_date)
values
  ('v1', 'CU', 'ofac comprehensive sanctions program', '2026-01-01'),
  ('v1', 'IR', 'ofac comprehensive sanctions program', '2026-01-01'),
  ('v1', 'SY', 'ofac comprehensive sanctions program', '2026-01-01'),
  ('v1', 'KP', 'ofac comprehensive sanctions program', '2026-01-01');

revoke all on sculptura_private.embargoed_territory_review_list from public, anon, authenticated, service_role;
grant select on sculptura_private.embargoed_territory_review_list to authenticated, service_role;
alter table sculptura_private.embargoed_territory_review_list enable row level security;
create policy "admins read embargo review list" on sculptura_private.embargoed_territory_review_list
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- -------------------------------------------------------------- write path

-- extend the write function: one additional parameter for geo evidence. the
-- function signature changes, so existing callers must pass the new argument;
-- this is intentional; a silent default would let a caller skip attribution.
drop function if exists public.record_payout_signal_check(uuid,text,uuid,text,text,text,text,jsonb,text,text,jsonb,text,jsonb,jsonb,text);

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
  p_adapter_version text,
  p_geo_evidence jsonb
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
    'adapter_version', p_adapter_version, 'geo_evidence', p_geo_evidence);
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
     selected_checks, outcome, reason_codes, network_flags, adapter_version, geo_evidence)
  values (p_creator_profile_id, p_moment, p_submission_id, v_digest, p_policy_version,
          p_selected_checks, p_outcome, p_reason_codes, p_network_flags, p_adapter_version,
          coalesce(p_geo_evidence,
            '{"country_code":null,"coverage":"none","source_id":null,"dataset_version":null}'::jsonb));

  return pg_catalog.jsonb_build_object(
    'submission_id', p_submission_id, 'outcome', p_outcome, 'reason_codes', p_reason_codes,
    'policy_version', p_policy_version, 'selected_checks', p_selected_checks,
    'replayed', false);
end;
$$;

revoke all on function public.record_payout_signal_check(uuid,text,uuid,text,text,text,text,jsonb,text,text,jsonb,text,jsonb,jsonb,text,jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.record_payout_signal_check(uuid,text,uuid,text,text,text,text,jsonb,text,text,jsonb,text,jsonb,jsonb,text,jsonb)
  to service_role;

-- -------------------------------------------------------------- admin read

-- extend the admin read to include geo_evidence, same admin-only shape.
create or replace function public.admin_get_payout_signals(
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

-- -------------------------------------------------- pattern read for review

-- a read-time view, not a stored score. counts embargoed-territory hits per
-- creator from existing decision rows. the review surface reads this to tell
-- "a single cu ip at one money moment" apart from "cu ips across every money
-- moment for six months" (owner addendum). no row here is written outside the
-- append-only decisions table itself; this view has no backing table and
-- nothing writes to it. a one-off creator with one hit six months ago shows
-- distinctly from a creator with six consecutive months of hits; the review
-- surface, not this schema, decides what pattern counts as "sustained".
create view sculptura_private.embargoed_territory_pattern as
select
  d.creator_profile_id,
  count(*) filter (where d.reason_codes @> '["ip_geo_embargoed_territory"]'::jsonb) as embargo_hit_count,
  min(d.occurred_at) filter (where d.reason_codes @> '["ip_geo_embargoed_territory"]'::jsonb) as first_hit_at,
  max(d.occurred_at) filter (where d.reason_codes @> '["ip_geo_embargoed_territory"]'::jsonb) as last_hit_at,
  count(distinct d.moment) filter (where d.reason_codes @> '["ip_geo_embargoed_territory"]'::jsonb) as distinct_moments_hit,
  count(*) as total_decisions
from sculptura_private.payout_signal_decisions d
group by d.creator_profile_id;

-- a plain view runs with its owning role's privileges, not the querying
-- role's rls, and the base table's row policies are not re-applied to a
-- direct select against the view (verified against pglite's actual behavior,
-- not assumed): a bare grant here would hand every authenticated user every
-- creator's pattern, admin or not. the view is therefore reachable only
-- through the explicitly admin-checked function below. service_role keeps
-- select for server-side use that performs its own authorization.
revoke all on sculptura_private.embargoed_territory_pattern from public, anon, authenticated;
grant select on sculptura_private.embargoed_territory_pattern to service_role;

-- the only read path for this view. authorization is this function's own
-- has_role check, not inherited row security, because none is inherited.
create function public.admin_get_embargo_pattern(p_creator_profile_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;
  select pg_catalog.to_jsonb(p) into v_result
    from sculptura_private.embargoed_territory_pattern p
    where p.creator_profile_id = p_creator_profile_id;
  return v_result;
end;
$$;
revoke all on function public.admin_get_embargo_pattern(uuid) from public, anon, authenticated, service_role;
grant execute on function public.admin_get_embargo_pattern(uuid) to authenticated;

commit;
