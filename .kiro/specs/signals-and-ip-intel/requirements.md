# signals-and-ip-intel requirements

## goal

add creator identity and network signals for payout fraud control. collect
browser device signals and ip intelligence, process them into stored features
server side, and enforce checks only at the money moments (payout onboarding
and payout requests). strict-mode corridors (in, pk, bd) make vpn/proxy checks
mandatory at those moments. geography never enters trust computation; corridor
strictness only selects which checks run.

this is a security-leg feature. it builds on the private trust foundation from
migrations 0009 and 0010 and the aml considerations, without turning the aml
documentation into a deployed program.

## gate 0.1 rulings (owner, 2026-10-06)

these rulings close the open decisions from the first draft. they bind design
and implementation.

1. strict-corridor vpn/proxy positive: `needs_review`, not `fail`. lite-grade
   feeds have false positives, and hard-failing a first payout on a
   misclassified carrier is the wrong default. `fail` may be configured per
   corridor later, once false-positive rates are measured.
2. mandatory feed unavailable: `needs_review` with an explicit
   `feed_unavailable` reason. never a silent pass, never a hard user fail for
   our own outage.
3. thumbmark consent and collection failure: plain-language disclosure in the
   payout flow, no blocking modal. a failed collection is `needs_review`, never
   a silent pass.
4. rail key: the security branch carries the payout rails matrix at
   operations/country-rollout/creator-payout-rails.json. the check-policy
   configuration is keyed by iso 3166-1 alpha-2 codes matching that file. the
   earlier path-mismatch open item is resolved and the matrix is cited directly.
5. admin visibility: admins see decision records with reason codes, flags, and
   source attribution, per the 0009/0010 admin-only pattern. raw payloads are
   purged by design; stored features are admin-only.
6. hashing and retention: hmac-sha256 with a server-held key, quarterly
   rotation, a key id on each hash row. signal events purge after 12 months.
   decision records are append-only evidence. a hash-chain treatment (already
   ruled for dispute evidence) is a follow-up and is not implemented here.

## gate 0.2 finding (2026-10-06): what the free feeds can flag

the first draft assumed ip2proxy lite supplies proxy, vpn, and tor flags. that
was wrong. the lite edition lists open proxies (pub) only; vpn, tor exits, and
datacenter ranges are commercial-edition data. the corrected v1 flag sources are
in req-5. the corrected mapping also leaves ipv6 uncovered for vpn, datacenter,
and tor, because x4bnet and the tor bulk exit list are ipv4 only. this is a
known limitation, recorded in req-5 and req-7, not a silent gap.

## source evidence baseline

this spec operates against the security branch of origin (kirosculp). spec
documents are maintained on the agent-instructions branch via the sculptura
remote; implementation commits land on the security branch.

source files read:
- AGENTS.md, .kiro/steering/conventions.md, .kiro/steering/security-execution.md
- README.md, repo.md, buildplan/scoping.md, buildplan/security/README.md
- security/README.md, security/implementation-summary.md
- security/denial-test-matrix.md, security/denial-test-results.md
- security/aml/README.md
- security/aml/considerations/trust-and-geography.md
- security/aml/considerations/admission-and-payouts.md
- migrations/0009_private_creator_trust.sql
- migrations/0010_private_buyer_trust.sql
- scripts/build-security-test-db.mjs (cumulative migration replay harness)
- scripts/seed-security-test-data.mjs, scripts/test-helpers.mjs
- scripts/denial-matrix-executor.mjs
- operations/country-rollout/creator-payout-rails.json, .md, and .schema.json
- research/sources/sources.jsonl (source ledger)

## the invariant that governs everything here

**source**: security/aml/considerations/trust-and-geography.md

the controlling design position, stated verbatim at the top of that page:
"trust levels are behavior-only. no market, geography, or corridor field may
enter the trust computation or its schema. any geography-derived input in the
trust function is a defect, not a tuning choice."

three consequences this spec must honor at every layer:

1. the trust tables from 0009 and 0010 (sculptura_private.creator_trust,
   sculptura_private.buyer_trust) must not gain any market, geography, or
   corridor column. signal features and ip-derived values are stored in their
   own tables, never folded into the trust schema.
2. strict mode is a check surface, not a trust input. corridor membership
   (in, pk, bd) selects which checks execute at a money moment. the corridor
   value is never written into a trust record and never weights a trust level.
3. the signal that matters is observed behavior at the money moment. ip and
   device values are inputs to a check decision (pass, fail, needs-review) at
   that moment, not durable character scores attached to a person.

a reviewer must be able to grep the trust schema and find no geography. a
reviewer must be able to trace every enforcement decision to a money moment
and a corridor-selected check set, not to a stored regional risk value.

## scope boundary with the aml workstream

**source**: security/aml/README.md, buildplan/security/README.md financial-abuse workstream

the aml pages are documentation of plausible scenarios and proposed controls.
their legal applicability, operating ownership, and provider funds-flow approval
are open. this spec does not activate an aml program, does not freeze accounts,
does not ban countries, and does not report to any authority. it adds signal
collection and a check-decision surface at payout moments. the decision output
is reviewable evidence (a check result with reason), consistent with the aml
principle "express suspicion as reviewable evidence, not a declaration of
criminal guilt."

## retention rule for raw signal inputs

**source**: user brief ("purge raw fingerprint inputs after processing per the
session retention rule"); security/aml/considerations/sourcing-and-privacy.md
(private evidence separated from public surfaces)

raw device fingerprint inputs (the full thumbmark payload and its component
attributes) are transient. they are received server side, hashed and reduced to
stored features, and the raw payload is purged after processing within the
request/session boundary. only the derived hash and the extracted feature set
persist. no raw fingerprint attribute vector is written to durable storage.

## licensing constraints on data sources

**source**: user brief; conventions.md ("every claim about the outside world
needs a logged source with a boundary column saying what the source actually
supports")

- thumbmarkjs: mit license, v1.12.0, last published 2026-09-25 (npm registry).
  permitted for browser signal collection.
- maxmind geolite2: used for geo only. license is creative commons
  attribution-sharealike 4.0 plus the maxmind geolite eula. attribution is
  required. the eula requires prompt use of updated databases and destruction
  of old versions within 30 days of a new release. no geolite2 data is
  redistributed in the repo.
- ip2proxy lite: free for commercial use with attribution; terms at
  https://lite.ip2location.com/data-license. open proxies (pub) only. used for
  the proxy flag and nothing else.
- x4bnet lists_vpn: mit license, ipv4 only. the adapter reads
  output/vpn/ipv4.txt (vpn flag) and output/datacenter/ipv4.txt (datacenter
  flag). the legacy ipv4.txt path is slated for removal in 2026 and is not used.
- tor bulk exit list (check.torproject.org/torbulkexitlist): ipv4 only. no
  explicit license statement was found on the list or on the tor metrics pages,
  so the ledger records that gap and does not assume a license.

no provider database file, api key, or secret is committed. the source ledger
(research/sources/sources.jsonl) records what each feed actually supports in a
boundary field. the adapter boundary (req-4) exists so a commercial feed can
replace these without caller changes.

## requirements

### req-1: browser device signal collection via thumbmarkjs

**source**: user brief; security/aml/README.md (assess creators at money moments)

**requirement**: integrate thumbmarkjs on the client to collect a browser
device signal at payout onboarding and payout request. the client sends the
thumbmark output to a server endpoint. the client never computes or sends a
trust value, and never receives one back. no biometric, skin, body, or
camera/microphone-derived signal is collected; only the standard thumbmarkjs
browser attributes.

**acceptance**:
- client collects a thumbmark only on the two money-moment surfaces, not
  site-wide.
- the collected payload contains no biometric or body-adjacent attribute.
- the client submission carries the raw thumbmark payload to the server
  endpoint and nothing is persisted client side beyond what thumbmarkjs needs
  to compute.
- negative: a client that submits a fabricated trust score or level is ignored;
  the server derives everything.
- the payout flow shows a plain-language disclosure of the device check. there
  is no blocking modal (ruling 3).
- negative: a failed or unavailable collection produces `needs_review` with a
  `collection_unavailable` reason, never a silent pass.

**source file references**:
- security/aml/considerations/trust-and-geography.md (strict mode is a check
  surface at the money moments: payout onboarding and payout requests)

### req-2: server-side signal processing and raw-input purge

**source**: user brief (hash and extract features server side; purge raw
fingerprint inputs after processing per the session retention rule)

**requirement**: the server receives the raw thumbmark payload, computes a
stable device hash, extracts a bounded feature set (for example: component
coverage, headless/automation indicators, known-inconsistency flags), and
stores only the hash and features. the raw payload is purged after processing
within the same request/session boundary and is never written to durable
storage or logs.

**acceptance**:
- stored record contains the device hash and extracted features only.
- no raw fingerprint attribute vector appears in any table, log, or fixture.
- processing is deterministic: the same raw payload yields the same hash and
  features.
- negative: a test that inspects durable storage and logs after processing
  finds no raw payload.
- the device hash is hmac-sha256 with a server-held key. every hash row carries
  the key id. keys rotate quarterly (ruling 6).
- signal events purge after 12 months through a service-only purge function.
  decision records are not purged by that rule.
- negative: a purge run removes events older than 12 months and keeps newer
  ones, and the purge path cannot be used to edit a row.

**source file references**:
- security/aml/considerations/sourcing-and-privacy.md (private evidence kept
  separate; no body-adjacent collection)
- migrations/0009_private_creator_trust.sql (sculptura_private schema pattern,
  admin-only grants, append-only event history)

### req-3: device signal storage keyed to the money moment, not the trust record

**source**: trust-and-geography.md (behavior-only trust; no proxy fields in
trust schema)

**requirement**: device signals are stored in their own table in the
sculptura_private schema, keyed to the creator (and the money-moment event),
not merged into creator_trust or buyer_trust. the device signal table carries
no market, geography, or corridor column. access is admin-only and server-side,
following the 0009/0010 grant and rls pattern.

**acceptance**:
- device signal table exists in sculptura_private with admin-only read and
  server-side writes, matching the 0009/0010 acl repair pattern.
- the table has no geography/market/corridor column.
- creator_trust and buyer_trust gain no new signal, geography, or corridor
  column.
- admins can read decision records with reason codes, flags, and source
  attribution, plus stored device features, under the 0009/0010 admin-only
  pattern (ruling 5). raw payloads never exist to be read.
- negative: a migration review that adds a corridor column to any trust table
  is rejected (documented as a review invariant).

**source file references**:
- migrations/0009_private_creator_trust.sql (schema, grants, rls, append-only)
- migrations/0010_private_buyer_trust.sql (buyer-side pattern)

### req-4: provider-agnostic ip intelligence adapter

**source**: user brief (provider-agnostic adapter; swap in commercial feed later
without touching callers)

**requirement**: define a provider-agnostic ip intelligence interface. callers
(the enforcement surface) depend only on this interface, which returns a typed
result: geo fields (for routing/compliance records, not trust) and network
flags (proxy, vpn, tor, datacenter/hosting). the v1 implementation composes
free sources: maxmind geolite2 for geo, ip2proxy lite for the proxy flag, x4bnet
lists_vpn for the vpn and datacenter flags, and the published tor bulk exit list
for the tor flag. a commercial feed (maxmind anonymous ip, ipinfo privacy detection)
must be substitutable by implementing the same interface, with zero changes to
callers.

**acceptance**:
- a single interface defines the lookup contract and the typed result.
- the free-source implementation satisfies the interface.
- a second (stub or commercial) implementation can be injected via
  configuration; callers are unchanged. a test proves caller code runs against
  a swapped implementation.
- geo fields from the adapter are usable for routing/compliance records only
  and are never passed into any trust computation.
- negative: a caller that reaches past the interface into a specific provider's
  data shape fails review.

**source file references**:
- security/aml/considerations/admission-and-payouts.md (provider capabilities
  and payout rails are a corridor-and-machine fact, kept separate from human
  evaluation)
- security/aml/considerations/trust-and-geography.md (geography legitimately
  remains in payout rails/compliance and routing/logistics only)

### req-5: network flag derivation with explicit precedence

**source**: user brief (ip2proxy lite flags plus community lists)

**requirement**: the adapter derives network flags (is_proxy, is_vpn, is_tor,
is_datacenter) from the composed sources with a documented precedence and a
confidence/source label per flag, so a reviewer can see which source raised a
flag. tor exit membership and known vpn/datacenter ranges are explicit flags.
the result records which source produced each flag for auditability.

**acceptance**:
- each flag carries its source attribution and the dataset version/date used.
- precedence is documented: when sources disagree, the rule for the final flag
  is explicit and tested.
- negative: a flag with no source attribution is a defect.
- flag sources in v1: proxy from ip2proxy lite; vpn and datacenter from
  x4bnet; tor from the tor bulk exit list. no other source raises these flags.
- each result carries per-flag `coverage` (`full`, `partial`, `none`). the free
  adapter reports `none` for vpn, datacenter, and tor on ipv6 addresses because
  x4bnet and the tor list are ipv4 only.
- negative: a flag whose coverage is `none` is not evidence of a clean address.
  it is treated as not evaluated and never counted as a pass signal.

**source file references**:
- security/aml/README.md (express suspicion as reviewable evidence)
- conventions.md (every external claim needs a logged source with a boundary)

### req-6: enforcement only at money moments

**source**: user brief (enforcement at money moments only: payout onboarding and
payout requests); trust-and-geography.md (strict mode changes which checks run
at the money moments)

**requirement**: signal collection and ip/network checks run only at payout
onboarding and payout request. no site-wide tracking, no checks at signup,
browse, listing, or ordinary checkout. the enforcement surface takes the device
signal result and the ip intelligence result and produces a check decision
(pass, fail, needs-review) with a recorded reason, stored as reviewable evidence.

**acceptance**:
- checks execute at exactly the two money moments and nowhere else.
- each decision is stored with its reason and the inputs' source attributions.
- the decision is evidence, not an automatic account action; it does not freeze,
  ban, or report.
- negative: a test confirms no check fires on signup, browse, listing create,
  or standard buyer checkout.

**source file references**:
- buildplan/scoping.md (payout onboarding triggered at the payout threshold)
- security/aml/considerations/admission-and-payouts.md (recheck eligibility
  against the exact beneficiary immediately before payout; sensitive payout
  changes need step-up)

### req-7: corridor strictness selects checks, never trust

**source**: trust-and-geography.md (strict-mode markets in, pk, bd change which
ip/device checks run at the money moments; that is all they change)

**requirement**: a corridor configuration marks in, pk, bd as strict. at a money
moment, if the corridor is strict, vpn/proxy checks are mandatory: a vpn/proxy
positive produces `needs_review` (ruling 1); `fail` can be configured per
corridor later. in non-strict corridors the
same checks may run but are not mandatory gates. the corridor value selects the
check set only. it is never stored in a trust record, never weights a trust
level, and never becomes a durable attribute of the person.

**acceptance**:
- strict corridors (in, pk, bd) enforce mandatory vpn/proxy checks at both money
  moments.
- the corridor-to-strictness map is configuration, revisable as rails change
  (per trust-and-geography.md: strictness tracks rail maturity).
- the configuration is keyed by iso 3166-1 alpha-2 codes that match
  `markets[].market` in operations/country-rollout/creator-payout-rails.json. a
  test fails if a policy market is absent from that file. the market comes from
  the server-side payout account verification, never from the client or from the
  request ip.
- a strict-corridor vpn/proxy positive yields `needs_review`, never `pass` and,
  by default, never `fail`.
- a mandatory check whose feed is unavailable yields `needs_review` with reason
  `feed_unavailable`. a mandatory check whose coverage is `none` for the address
  (ipv6 in the free adapter) yields `needs_review` with reason
  `coverage_unavailable`. this follows ruling 2 (never a silent pass) but may
  route a large share of strict-corridor requests to review. flagged for owner
  confirmation; measure before relying on it.
- no trust table row gains a corridor/market/geography field as a result of a
  strict-mode check.
- negative: a test asserts that running a strict-mode check does not write any
  corridor value into creator_trust or buyer_trust.

**source file references**:
- security/aml/considerations/trust-and-geography.md (corridor strictness tracks
  rail maturity and is revisited when rails change; in/pk/bd named there)
- operations/country-rollout/creator-payout-rails.json (schema v3, as_of
  2026-10-05): in, pk, and bd each list payoneer as primary rail with aml tier
  standard. the matrix is dated research evidence and says the runtime must query
  current provider capability data, so strictness is revisited when it changes.
- operations/country-rollout/creator-payout-rails.md and
  creator-payout-rails.schema.json (same sync)

### req-8: no geography in trust, verified as a schema invariant

**source**: trust-and-geography.md (behavior-only rule is a design invariant for
schema review; review rejects any pull request that adds a market/geography/
corridor field to trust records)

**requirement**: provide an automated check that fails if any trust table
(sculptura_private.creator_trust, creator_trust_events, buyer_trust,
buyer_trust_events) contains a column whose name implies market, geography, or
corridor. this makes the invariant enforceable in ci rather than only in human
review.

**acceptance**:
- a script inspects the built test database schema and asserts the trust tables
  carry no market/geography/corridor-named column.
- the check runs as part of the test suite and fails loudly if violated.
- negative: a deliberately added corridor column (in a throwaway test) causes
  the check to fail.

**source file references**:
- migrations/0009_private_creator_trust.sql, migrations/0010_private_buyer_trust.sql
- scripts/count-policies.mjs, scripts/check-policies.mjs (reference for schema
  inspection pattern)

### req-9: adapter result never reused as a stored risk score

**source**: trust-and-geography.md (geography is a proxy, not a signal; no
regional risk value stored as character)

**requirement**: ip geo and network flags inform the check decision at the money
moment and are retained as evidence of that specific decision, with their source
attribution and timestamp. they are not aggregated into a durable per-person
regional risk score, and they are not fed back into trust-level computation.

**acceptance**:
- the stored artifact of an ip check is a decision record tied to one money
  moment, not a rolling regional score.
- no job or query aggregates ip flags into a trust level.
- negative: a test confirms there is no code path from an ip flag to a
  creator_trust/buyer_trust level write.

**source file references**:
- security/aml/considerations/trust-and-geography.md (the feedback machine;
  attacker economics, not character)

### req-10: reproducible local verification against the cumulative schema

**source**: security-execution.md (reproduce against the cumulative schema;
no result labeled passed when skipped or mocked); implementation-summary.md
(pglite cumulative replay harness exists)

**requirement**: all new schema (device signals table, ip check decision table,
corridor config) applies as sequentially numbered migrations (0011+) on top of
the existing 0001-0010 cumulative replay. the existing build-security-test-db.mjs
harness replays them. tests run locally with no live supabase and no network
calls to ip providers (provider lookups are stubbed with fixture datasets).

**acceptance**:
- new migrations numbered 0011+ apply cleanly in the existing replay harness.
- the test suite builds the cumulative schema, seeds identities, and runs the
  new positive and negative tests offline.
- ip provider lookups in tests use committed fixture data, not live feeds, and
  no secret or provider database file is committed.
- negative: a test that would require a live provider or live supabase is marked
  blocked, not passed.

**source file references**:
- scripts/build-security-test-db.mjs (`FOUNDATION_MIGRATIONS` list extends to 0011+)
- scripts/seed-security-test-data.mjs (6 seeded identities incl. creator_alice)
- scripts/test-helpers.mjs (`queryAsRole`, `mutateAsRole`, auth.uid context)

### req-11: positive and negative tests for every check path

**source**: AGENTS.md (focused positive and negative tests after each batch);
security-execution.md (zero rows means denied; positive controls required)

**requirement**: each enforcement path has both a positive and a negative test:
- device signal: a clean signal passes; a headless/automation-flagged signal is
  recorded for review.
- ip proxy/vpn/tor: a residential ip passes; a tor exit / known vpn / datacenter
  ip raises the flag.
- strict corridor: in/pk/bd with a vpn positive is `needs_review`; a non-strict
  corridor with the same positive is not a gate.
- unavailable inputs: a failed device collection, an unavailable mandatory feed,
  and a mandatory check with no coverage each give `needs_review` with their own
  reason code, and none gives `pass`.
- adapter swap: the same caller test passes against the free implementation and
  a swapped stub implementation.
- schema invariant: trust tables carry no geography column (passes); a throwaway
  corridor column fails the invariant check.
- admin-only access: non-admin cannot read device signals or ip decision records
  (deny); admin can (allow, positive control).

**acceptance**:
- every path above has a named positive and negative assertion.
- admin-only access on the new tables is proven with a non-admin deny and an
  admin allow, matching the denial-matrix method.
- no assertion is skipped, mocked away, or passed via service-role bypass; the
  grant-vs-rls distinction from the existing harness is preserved.

**source file references**:
- security/denial-test-matrix.md (allow/deny method, positive controls)
- security/denial-test-results.md (grant layer vs rls distinction)
- scripts/denial-matrix-executor.mjs (test case structure to extend)

### req-12: recorded evidence, blocked and deferred items

**source**: AGENTS.md (report files changed, commands executed, observed results,
unresolved gaps and deployment state); user brief (report verified, blocked and
deferred separately)

**requirement**: on completion, record which tests passed locally, which items
are blocked (anything needing a live provider feed, live supabase, or owner
authorization), and which are deferred to later legs (platform payout surface
wiring, commercial feed procurement, legal aml sign-off). implementation, local
verification, and live operation are three separate claims.

**acceptance**:
- a results document lists verified-local, blocked, and deferred items
  separately.
- deployment state is explicit: migrations verified locally only; no live
  supabase mutation; no live provider integration; no real payout executed.
- the aml legal/ownership questions remain flagged as open, not resolved by this
  leg.

**source file references**:
- security/implementation-summary.md (template: verified vs blocked vs deferred)
- security/denial-test-matrix.md recorded runs (dated local evidence pattern)

## non-requirements (explicitly out of scope)

1. **live provider integration**: no live calls to maxmind, ipinfo, ip2proxy, or
   any api during this leg. fixture datasets only. commercial feed procurement
   is deferred.

2. **real payouts or payments**: no stripe/payoneer payout is executed. the
   money moments are the hooks where checks run; actual fund movement belongs to
   the operations/platform legs. no real charging, per security-execution.md.

3. **live supabase deployment**: no migration applied to any live project.
   local pglite cumulative replay only.

4. **an activated aml program**: no account freeze, country ban, sanctions
   screening, or regulatory reporting. legal applicability and operating
   ownership stay open per security/aml/README.md.

5. **buyer-side enforcement**: this leg targets creator payout fraud control.
   buyer trust (0010) is referenced for the schema pattern and the
   no-geography invariant, but buyer money-moment enforcement is not built here.

6. **biometric or body-adjacent signals**: explicitly excluded from collection,
   per the user brief.

7. **geography-based trust fields**: forbidden anywhere in the schema, per
   trust-and-geography.md. this is an invariant, not a deferred feature.

8. **site-wide device tracking or analytics**: signals are collected only at the
   two money moments, never for general analytics or cross-site tracking.

9. **hash-chain evidence**: decision records are append-only evidence and are a
   candidate for the hash-chain treatment already ruled for dispute evidence.
   not implemented in this spec; recorded as a follow-up (ruling 6).

10. **ipv6 coverage for vpn, datacenter, and tor**: the free feeds cannot flag
    these on ipv6. closing the gap needs a commercial feed or another source and
    is deferred behind the adapter boundary.

## success criteria

signals-and-ip-intel requirements are satisfied when:
1. device signals are collected at money moments via thumbmarkjs with no
   biometric/body-adjacent attribute (req-1)
2. raw inputs are hashed, reduced to features, and purged after processing
   (req-2)
3. device signals are stored admin-only with no geography column (req-3)
4. a provider-agnostic ip adapter exists with a swappable implementation (req-4)
5. network flags carry source attribution and documented precedence (req-5)
6. enforcement runs only at payout onboarding and payout request (req-6)
7. strict corridors (in/pk/bd) make vpn/proxy checks mandatory, selecting checks
   without writing corridor into trust (req-7)
8. a ci-enforceable invariant proves trust tables carry no geography (req-8)
9. ip results are per-moment evidence, never a durable regional risk score (req-9)
10. everything applies and verifies locally on the cumulative replay harness,
    offline (req-10)
11. every check path has positive and negative tests, with admin-only access
    proven (req-11)
12. verified-local, blocked, and deferred items are recorded separately (req-12)

no check may be labeled verified when it is skipped, mocked away, blocked by a
missing live provider, or dependent on a live supabase project.
