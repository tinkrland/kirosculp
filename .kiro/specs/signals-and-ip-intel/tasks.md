# signals-and-ip-intel tasks

## execution contract

implementation starts only after requirements and design review. all product
implementation commits remain on the `security` branch of the `kirosculp`
origin repository. these spec files remain on the `agent-instructions` branch
through the `sculptura` remote.

work is local and disposable only. no live supabase migration, live provider
request, real payment, or real payout is allowed in these tasks.

prose and commit subjects remain lowercase. every batch ends with focused
positive and negative tests. a test blocked by missing tooling, credentials,
provider access, or unresolved policy is recorded as blocked, never passed.

## review gates before implementation

### gate 0.1: resolve policy decisions (closed 2026-10-06)

the owner ruled on all six questions. the rulings are recorded in
`requirements.md` (gate 0.1 rulings) and `design.md` (owner rulings).

- strict vpn/proxy positive: `needs_review`; `fail` configurable per corridor
  later.
- mandatory feed unavailable: `needs_review` with `feed_unavailable`.
- consent and collection failure: plain-language disclosure, no blocking modal;
  failed collection is `needs_review`.
- rail key: iso 3166-1 alpha-2, matching creator-payout-rails.json.
- admin visibility: decision records, reason codes, flags, attribution, stored
  features; raw payloads purged by design.
- hashing: hmac-sha256, quarterly rotation, key id per row, 12-month signal
  event purge; hash chain is a follow-up.

one consequence is open for owner confirmation: a mandatory check with no
coverage for the address (ipv6 under the free feeds) yields `needs_review` with
`coverage_unavailable`.

### gate 0.2: confirm source and dependency availability

**checks**:

- inspect `package.json` before adding any dependency.
- verify thumbmarkjs license and maintenance evidence in the source ledger.
- verify current licenses, attribution, update process, and supported fields for
  geolite2, ip2proxy lite, x4bnet lists_vpn, and published tor exit lists.
- confirm whether local postgres/supabase or pglite is the supported test path.
- confirm whether the existing product branch has payout onboarding and payout
  request call sites; if absent, define contract-level integration fixtures.

**exit evidence**: source paths and external sources are logged with boundary
notes; missing tools are recorded as prerequisites or blockers.

**results (2026-10-06)**:

- thumbmarkjs: mit, v1.12.0, published 2026-09-25 (npm registry).
- geolite2: cc by-sa 4.0 plus eula; attribution required; destroy old versions
  within 30 days of a new release.
- ip2proxy lite: free with attribution; open proxies only. vpn, tor, and
  datacenter are commercial-edition data. this corrected the first draft.
- x4bnet lists_vpn: mit, ipv4 only, use output/vpn and output/datacenter paths.
- tor bulk exit list: ipv4 only, no explicit license statement found.
- node 22.22.2, npm ci clean, pglite available. creator-trust (63) and
  buyer-trust (66) tests pass as baseline.
- python 3.11 is used with `PYTHONUTF8=1`; the validate script calls `python3`,
  which does not exist on this windows install, so its steps run individually.
  `normalize-prose.py --check` has 6 pre-existing violations outside this leg.
- no payout onboarding or payout request call sites exist in product code (only
  in what-exists snapshots), so batch 6 is contract-level.

## batch 1: source ledger and dependency baseline

**requirements**: req-1, req-4, req-5, req-10

**goal**: make external data-source claims and local dependency assumptions
reproducible before code depends on them.

**work**:

1. add source-ledger entries for thumbmarkjs, geolite2, ip2proxy lite, x4bnet
   lists_vpn, and the published tor exit-node source.
2. record license, attribution, update/version behavior, and the exact boundary
   of each source. do not commit provider databases, api keys, or secrets.
3. inspect `package.json` and add only reviewed, exact or pinned dependencies.
4. document fixture import and refresh commands without making live requests in
   tests.

**tests**:

- positive: source validation accepts complete source entries with boundary
  notes.
- negative: source validation rejects an entry without a license or boundary.
- negative: repository checks reject provider database files or secret-shaped
  fixture values.

**exit evidence**: source ledger diff, dependency diff if any, and the commands
plus observed results.

## batch 2: private schema and geography invariant

**requirements**: req-3, req-8, req-10

**goal**: establish private append-only evidence tables and prove trust schema
separation before adding signal processing.

**work**:

1. create the next sequential migration after 0010 for private signal event,
   ip intelligence event, payout decision, and versioned check-policy tables.
2. extend `scripts/build-security-test-db.mjs` migration order.
3. add explicit grants, revokes, rls, and server-write boundaries using the
   0009/0010 private schema pattern.
4. add constraints for allowed money moments, decision outcomes, immutable
   event identity, and request/submission idempotency.
5. add a schema-invariant checker that inspects all trust tables and fails on
   market, geography, region, or corridor-like columns.
6. admin read access is decided (ruling 5): decision records, reason codes,
   flags, attribution, and stored features, admin-only. no redaction layer.
7. add a service-only purge function for signal events older than 12 months
   (ruling 6) and a policy table keyed by iso alpha-2 market, seeded from
   reviewed values.

**tests**:

- positive: cumulative schema replay applies all migrations in order.
- positive: admin can read the approved private evidence surface.
- negative: anon and authenticated non-admin roles cannot read private evidence.
- negative: anon/authenticated direct insert, update, and delete are denied.
- positive: trust tables contain no geography-like column.
- negative: the invariant checker fails against a throwaway trust table with a
  `corridor` column.
- negative: invalid money moment and invalid outcome values fail constraints.

**exit evidence**: migration replay output, schema-invariant output, focused
role matrix output, and changed migration paths.

## batch 3: deterministic device processing

**requirements**: req-1, req-2, req-3, req-9

**goal**: collect and process thumbmark-compatible input without persisting raw
fingerprint attributes or creating a trust score.

**work**:

1. define the browser collection allowlist and reject biometric, skin, body,
   camera, microphone, and unknown attributes.
2. implement the server-side canonicalizer, hmac-sha256 keyed hash with a key id
   (quarterly rotation), and bounded feature extractor.
3. implement request-scoped raw-input disposal and redacted error/log handling.
4. persist only the processed hash, features, processor version, and money-
   moment metadata.
5. create contract fixtures that contain no real browser identity or sensitive
   user data.
6. expose a client collector contract that can be wired to thumbmarkjs at the
   two money-moment surfaces without collecting site-wide.

**tests**:

- positive: the same approved fixture gives the same derived hash and features.
- positive: partial but valid input produces a bounded `partial` feature result.
- negative: biometric/body-adjacent and unknown attributes are rejected or
  dropped according to the reviewed allowlist policy.
- negative: oversized or malformed payloads do not reach persistence.
- negative: database rows, logs, and error metadata contain no raw payload.
- negative: no client collector call occurs during signup, browse, listing
  creation, or ordinary buyer checkout fixtures.
- negative: a client-provided trust level or score is ignored.

**exit evidence**: unit-test output, persistence inspection, and a documented
raw-data purge check.

## batch 4: ip intelligence port and fixture adapter

**requirements**: req-4, req-5, req-9, req-10

**goal**: make ip intelligence source-independent and locally testable with
fixture data.

**work**:

1. implement the typed `IpIntelligenceAdapter` port and result contract.
2. implement fixture-backed source readers for geo, ip2proxy lite open proxies
   (proxy flag), x4bnet vpn and datacenter ranges, and tor exit ranges, with
   per-flag coverage (ipv6 coverage is `none` for vpn, datacenter, and tor).
3. implement `FreeIpIntelligenceAdapter` composition, source attribution, feed
   version metadata, and explicit precedence.
4. store only a keyed ip digest and bounded result evidence; never persist the
   plaintext ip.
5. define unavailable-feed and conflicting-source result states.
6. add adapter contract tests and a swapped stub commercial adapter without
   importing vendor-specific shapes into the caller.

**tests**:

- positive: a residential fixture returns the expected clean network flags.
- positive: vpn, proxy, tor, and datacenter fixtures raise the expected flags.
- positive: every positive flag contains source id and dataset version.
- positive: tor and vpn flags combine evidence from multiple sources.
- negative: a conflicting negative cannot erase a trusted positive flag.
- negative: a source error is not converted into a clean result.
- negative: malformed ip input is rejected without persistence.
- negative: an ipv6 address reports coverage `none` for vpn, datacenter, and
  tor, and is never reported as clean for those flags.
- negative: plaintext ip is absent from rows, logs, and fixtures after lookup.
- positive: the same caller contract works with the stub commercial adapter.
- negative: caller code fails review/test if it imports a vendor-specific field.

**exit evidence**: adapter contract output, precedence cases, swapped-adapter
output, and fixture inventory.

## batch 5: money-moment policy and decision service

**requirements**: req-6, req-7, req-9

**goal**: select and execute checks only for payout onboarding and payout
requests, with strict-corridor behavior isolated to policy configuration.

**work**:

1. implement versioned payout signal policy loading by iso alpha-2 market, with
   a `DEFAULT` row for markets without a specific policy.
2. implement `PayoutSignalCheckService` orchestration over device processor,
   ip adapter, and persistence ports.
3. enforce the two allowed money moments at the service boundary.
4. select mandatory vpn/proxy checks for strict `in`, `pk`, and `bd` policy
   entries without copying corridor data into trust records.
5. encode the reviewed strict-positive and unavailable-feed outcomes.
6. write one immutable, idempotent decision per submission id.
7. return only the payout workflow decision and reason codes, not raw payload,
   plaintext ip, or provider response data.

**tests**:

- positive: payout onboarding invokes the checks and writes one decision.
- positive: payout request invokes the checks and writes one decision.
- negative: signup, browse, listing creation, and ordinary checkout cannot invoke
  the decision service.
- positive: strict `in`, `pk`, and `bd` select mandatory vpn/proxy checks.
- negative: strict corridor plus vpn/proxy positive cannot return `pass`.
- positive: non-strict configuration does not enforce the strict-only check.
- negative: a strict-mode execution writes no corridor/geography value to trust.
- positive: identical submission replay returns the original decision.
- negative: changed replay payload or policy version is rejected and does not
  overwrite the original decision.
- negative: unavailable mandatory feed follows the reviewed non-pass behavior.

**exit evidence**: policy matrix, decision-service test output, replay output,
and trust-schema inspection.

## batch 6: payout surface integration contracts

**requirements**: req-1, req-6, req-7, req-11

**goal**: connect the service to real product call sites without expanding the
collection surface or moving money.

**work**:

1. identify the payout onboarding and payout request server entry points.
2. pass server-authorized creator identity, submission id, market, observed ip,
   and transient device payload into the check service.
3. ensure callers cannot provide policy outcome, trust level, geography score,
   or provider-derived result fields.
4. make payout continuation consume only the service's typed decision.
5. add explicit telemetry that records event ids and reason codes without raw
   signal data.
6. if call sites do not exist in the security branch, add contract fixtures and
   record integration as deferred to the platform/operations payout leg rather
   than creating a duplicate payout flow.

**tests**:

- positive: authorized creator can invoke each supported money-moment contract.
- negative: another creator's profile id is rejected.
- negative: unauthenticated and non-creator callers are rejected.
- negative: client-supplied policy, trust, geo, or provider result fields are
  ignored or rejected.
- negative: ordinary non-money-moment endpoints cannot route into the service.
- positive: returned decision contains only approved outcome and reason fields.

**exit evidence**: call-site inventory, integration contract tests, and any
explicit deferred handoff.

## batch 7: full local verification and evidence record

**requirements**: req-10, req-11, req-12

**goal**: prove the feature locally without overstating live readiness.

**work**:

1. extend the cumulative replay harness and deterministic seeder with signal
   fixtures for clean, vpn, proxy, tor, datacenter, unavailable, and malformed
   cases.
2. add the new signal tests to a dedicated executable command, for example
   `npm run test:signals-and-ip-intel`.
3. run focused positive and negative tests after every preceding batch.
4. run repository checks relevant to changed files, including the lowercase
   prose and source-ledger checks.
5. produce a results document with verified-local, blocked, and deferred
   sections.
6. state explicitly that no live migration, live provider lookup, real payment,
   or real payout occurred.

**tests and commands**:

```text
npm run test:signals-and-ip-intel
npm run test:creator-trust
npm run test:buyer-trust
npm run validate
```

if a command cannot run because required tooling is missing, record the exact
command, observed error, and blocked status. do not replace it with a mocked
pass.

**exit evidence**:

- total focused tests, passed, failed, and blocked
- grant-layer versus rls results for private tables
- schema-invariant result
- adapter and source fixture result
- strict/non-strict policy result
- unresolved policy choices
- verified-local, blocked, and deferred lists
- deployment and payment state

## dependency order

```text
gate 0.1 + gate 0.2
        |
        v
batch 1: source and dependency baseline
        |
        v
batch 2: private schema and geography invariant
        |
        +--> batch 3: device processing
        |
        +--> batch 4: ip adapter
                    |
                    v
          batch 5: money-moment policy service
                    |
                    v
          batch 6: payout integration contracts
                    |
                    v
          batch 7: full local verification and evidence
```

batches 3 and 4 may be developed in parallel after batch 2, but batch 5 waits
for both. batch 6 waits for the final reviewed decision contract. batch 7 is
not complete until every executable local test has a recorded result.

## file plan

### agent-instructions branch

- `.kiro/specs/signals-and-ip-intel/requirements.md`
- `.kiro/specs/signals-and-ip-intel/design.md`
- `.kiro/specs/signals-and-ip-intel/tasks.md`

### security branch implementation candidates

- `migrations/0011_*.sql` and later sequential migrations
- `scripts/build-security-test-db.mjs`
- `scripts/seed-security-test-data.mjs`
- `scripts/test-signals-and-ip-intel.mjs`
- `scripts/check-trust-schema-invariant.mjs`
- provider adapter and processor source files under the approved production
  TypeScript/node location after repository structure review
- `security/signals-and-ip-intel-results.md`
- `research/sources.md` or the repository's actual source-ledger path after
  verification
- `package.json` only if reviewed dependencies and executable scripts are
  approved

no implementation file is created by the spec-only phase.

## follow-ups (not in this spec)

- hash-chain treatment for decision records, as already ruled for dispute
  evidence.
- commercial feed decision (ip2proxy commercial, maxmind anonymous ip, or ipinfo
  privacy detection) to close the ipv6 and vpn/tor/datacenter coverage gap.
- measure false-positive rates before configuring `fail` for any corridor.
- owner confirmation of the `coverage_unavailable` consequence for ipv6.

## handoff criteria

this spec leg is ready for implementation review when:

- requirements trace to existing security, aml, trust, and harness evidence.
- design separates device processing, ip adapter, policy selection, and payout
  workflow boundaries.
- strict corridors cannot enter trust computation or trust schema.
- raw fingerprint inputs and plaintext ip have no durable storage path.
- every implementation batch has positive and negative executable tests.
- unresolved policy choices are visible and assigned to review.
- spec files are committed to `sculptura/agent-instructions`; no spec file is
  committed to the product `security` branch.

## implementation record (2026-10-06)

batches 1-7 are complete. commits on `security` (pushed to `origin/security`):

```text
aacf3fd  add signals source ledger and hygiene guards            (batch 1)
f2fc7c6  add payout signal evidence schema and geography invariant (batch 2)
38b5474  add device signal collector, processor and key ring       (batch 3)
3e58bc7  add ip intelligence port, free adapter and feed importer  (batch 4)
ab960fa  add payout signal decision service                        (batch 5)
2aab55d  add payout gate contract for the two money moments        (batch 6)
2615d29  add signals-and-ip-intel results and verification record  (batch 7)
```

(`2615d29` is `b9d64ba` after a rebase onto an unrelated upstream commit;
content is unchanged.)

verification: 200 signals tests, denial matrix 63/63 with no regression,
geography invariant holds and was proven non-vacuous, creator-trust (63) and
buyer-trust (66) unaffected, hygiene and source-ledger checks clean, 13
injected mutations across the two most safety-critical modules all caught.
full breakdown in `security/signals-and-ip-intel-results.md`.

batch 6 shipped `payout-gate.mjs`, an http-shaped entry contract not called
out as a separate component in the original design. it was added because the
decision service alone has no transport boundary, and a reviewer needs
something to point a real payout route at. it is documented in design.md's
implementation record above.

three corrections were made during implementation; see requirements.md's
implementation record for what and why. none required a scope change, a
dropped requirement, or a different architecture: all three sharpened the
original design in response to something read from a source, not a reason to
revisit the plan.

one spec review item was closed by the owner, mid-session, after batch 7:
the ipv6 `coverage_unavailable` consequence in strict markets is accepted for
v1, revisit when real traffic numbers exist. implementation already matched
this ruling; no code change was needed.

## batch 8: embargoed-territory ip hold (addendum, 2026-10-06)

owner-authored design addendum, recorded here before implementation per the
spec-first workflow. this batch starts after batch 7's results are recorded,
not before, per the owner's explicit sequencing.

### scope

at a money moment, if the ip geo result places the request in a named
embargoed or sanctioned territory, hold for human review. the payout rail
being `us` and the corridor being non-strict changes nothing: this check is
independent of the strict-corridor mandatory-check mechanism built in batches
1-7, and runs regardless of market strictness.

**requirement**: a money-moment request whose ip geo resolves to a
configured embargoed-territory code produces `needs_review` with reason
`ip_geo_embargoed_territory`, carrying the geo source's attribution the same
way a network flag does. never `fail` automatically. never a trust-table
write of any kind. the corridor's own strictness is unaffected: a non-strict
rail (`us`) with an embargoed-territory ip is still just `needs_review` on
this one ground, not escalated by the rail.

**requirement**: the review-trigger list is named configuration, structured
like the existing `payout_signal_policy` market-keyed table: a list of
territory codes, each with the sanctions/embargo authority and date that
justifies its presence, revisable as sanctions lists change. grey-listed
markets (fatf grey list, distinct from an embargo or sanctions regime) must
never appear on this list: a schema check enforces the two lists stay
disjoint, mirroring the geography-invariant pattern already in the codebase.

**requirement**: review severity may weigh pattern. a single embargoed-
territory ip at one money moment is weaker evidence than the same territory
appearing across every money moment for six months. the decision record
already stores enough (creator, moment, timestamp, reason codes) to compute
this without a new table; the review surface reads history, it does not
change what gets written per-event. a one-off never permanently flags a
creator: there is still no trust write, and the aggregation is a read-time
view for the reviewer, not a stored score.

**requirement**: the review outcome itself is release or a stranded-funds
hold, never an account action (no ban, no permanent flag, no automatic
rejection). this matches the existing instruction that a decision is
evidence, not an action, and extends it to say what the two possible human
outcomes are.

**requirement**: missing or unusable geo at a money moment (no geo source
configured, satellite ip range, a private address already handled by the
non-public rule in `ip-intelligence.mjs`) is a normal condition. no
embargoed-territory check fires, and the decision records the geo
unavailability as attribution (so an admin can see why), not as a reason
code that drives the outcome. a request with a clean rail and clean network
flags still passes when geo could not be resolved.

**explicit failure mode to avoid**: a `needs_review` queue so overloaded by
volume that it becomes auto-fail by backlog. this batch does not implement
queue management or an sla; it is recorded here so the queue design (owned by
whichever leg builds the review surface) inherits the constraint instead of
rediscovering it.

### why this needs the geo reader now

batches 1-7 deferred a geolite2 reader because nothing in the money-moment
enforcement path used geo (design.md, deferred items). this addendum is the
first requirement that reads geo as part of a decision, so the deferral ends
here, scoped to exactly this check. the ip intelligence port already returns
a `geo` field (currently unused downstream); this batch is the first caller.

### work

1. a geolite2 country-db reader satisfying the port's existing `geo.lookup(ip)`
   shape. mmdb parsing needs a dependency; use the smallest actively
   maintained one available, pinned exact. the reader participates in the
   feed-manifest validation pattern (`feeds.mjs`) so a missing or stale
   geolite2 database is unavailable, not silently wrong, consistent with
   every other feed in this leg. the eula's 30-day update-and-destroy
   obligation (already logged in the source ledger, src-0022) applies.
2. a new migration (0012) adding the review-trigger list, structured like
   `payout_signal_policy`: territory code, authority, effective date,
   enabled. a schema check (extending `check-trust-schema-invariant.mjs` or a
   sibling script) asserts no territory code on this list also appears as a
   fatf grey-listed market in the payout rails matrix.
3. extend `evaluateChecks` (`payout-signal-check.mjs`) with the
   territory-hold rule as an independent check path, not folded into the
   existing mandatory-checks loop: it does not depend on corridor strictness
   and must not be skipped because a market's `mandatoryChecks` is empty.
4. extend the stored decision shape with the geo-based reason code and its
   source attribution, following the same `network_flags`-style attribution
   object already used for proxy/vpn/tor/datacenter.
5. a read-time pattern view for the review surface (sustained vs single-event
   embargoed-territory hits per creator), built from existing decision rows.
   no new write path, no stored score, no trust-table involvement.
6. document the review outcome contract (release / stranded-funds hold) as
   the gate's second return value already supports arbitrary server-side
   payout-workflow outcomes; this is a vocabulary addition, not a new
   transport.

### tests

- positive: a us-rail request with an embargoed-territory geo result is
  `needs_review` with `ip_geo_embargoed_territory` and full attribution.
- positive: the same request's corridor strictness (non-strict, us) does not
  change the outcome or get bypassed.
- negative: a request with no geo result (satellite range, unconfigured
  reader, private address) passes cleanly when every other check is clean;
  the decision records geo-unavailable attribution but no reason code from
  it.
- negative: a grey-listed market's code cannot be added to the
  review-trigger list; the schema check rejects it.
- positive: a single embargoed-territory hit and six months of sustained
  hits are both readable from existing decision rows without a new table,
  and the read-time view distinguishes them.
- negative: no code path from this check reaches a trust-table write, proven
  the same way as the existing geography-invariant and no-trust-write tests.
- negative: an embargoed-territory hit never produces `fail` on its own.

### out of scope for this batch

the minor-creator age gate and the parked-market hold flow (`faizah aisler`
in `platform/creators/demo-roster.md`) are not implemented. the owner has
not yet ruled on either, and fixtures existing is not authorization to build
against them.

## batch 8 implementation record (2026-10-06)

batch 8 is complete. commit on `security`, pushed to `origin/security`:

```text
e3d04cf  add embargoed-territory review hold and geolite2 reader  (batch 8)
```

work items from the addendum, as built:

1. geolite2 country reader: done, `geo-reader.mjs`, `maxmind@5.0.7`. manifest
   hash, 100 kb size floor and 30 day age limit. tested with an injected opener.
2. migration 0012 and the disjointness check: done. trigger plus
   `check-embargo-greylist-disjoint.mjs` (`npm run check:embargo-greylist`),
   also added to the hygiene scan targets.
3. territory rule in `evaluateChecks`: done, independent of corridor strictness.
4. decision shape and attribution: done, `geo_evidence` column and a sixteenth
   argument on the write function.
5. read-time pattern view: done, admin function only.
6. review outcome vocabulary: done, `review-outcomes.mjs`.

tests from the addendum, all present with positive and negative cases in
`territory.test.mjs` (37) and `geo-reader.test.mjs` (9): us-rail cu hold with
attribution; non-strict corridor unchanged; no-geo pass with clean rail and
flags; grey-listed code rejected on insert and update; single hit against six
months of hits distinguishable; no trust write; never `fail` alone.

verification: 247 signals tests, creator-trust 63, buyer-trust 66, denial
matrix 63/63, geography invariant, hygiene, source ledger (6 signals entries of
26), prose check at the 6-violation baseline, 10 injected mutations all caught.

two defects were found and fixed while finishing the batch: the reader fell
back to `registered_country`, which contradicted the no-geo ruling for
satellite ranges, and the first pattern view was readable by any signed-in
user through a plain select. both are covered by tests now.

not built, per the owner: the minor-creator age gate and the parked-market
hold flow. owner rulings are open.

owner follow-ups: review the v1 embargo list (cu, ir, sy, kp) and name a
reviewer and cadence; review the 30 day geo age limit and the feed staleness
defaults; check the reader against a real geolite2 database once an account
exists. deferred unchanged: commercial feed, hash chain, platform payout route
wiring, typescript port, live deployment.
