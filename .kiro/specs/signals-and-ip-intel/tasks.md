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
