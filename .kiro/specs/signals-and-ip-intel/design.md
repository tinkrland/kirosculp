# signals-and-ip-intel design

## overview

this feature adds a narrow, server-owned signal and check layer around creator
payout controls. it has four boundaries:

1. the browser collects a thumbmarkjs device payload only when a creator enters
   payout onboarding or submits a payout request.
2. a server-side processor hashes the payload, extracts a bounded feature set,
   deletes the raw input before the request ends, and persists only derived
   evidence.
3. an ip intelligence adapter composes v1 free data sources behind one typed
   interface. callers do not know whether the result came from geolite2,
   ip2proxy, community lists, or a later commercial feed.
4. a money-moment policy selects checks and records a reviewable decision. the
   decision is not a trust level, a regional score, an aml clearance, or an
   automatic account action.

all durable records live in the private operational schema and use explicit
server-side write paths. creator trust and buyer trust remain unchanged. no
client route, public view, or creator-facing response projects these records.

## policy resolutions and owner rulings

### resolution 1: trust remains behavior-only

`sculptura_private.creator_trust` and `sculptura_private.buyer_trust` are not
extended. device and ip evidence is event-scoped and stored separately. the
check decision may contain a corridor-selected check identifier for auditability,
but it must not write that corridor into a trust record or use it to calculate a
trust level.

### resolution 2: corridor is runtime configuration, not person data

strictness is represented by a versioned check-policy configuration keyed by
iso 3166-1 alpha-2 market codes that match `markets[].market` in the payout
rails matrix (resolution 3). the runtime reads the configuration while
processing a money moment and records the selected policy version in the check
evidence. it does not persist a geography-derived creator attribute. the
configuration may identify `in`, `pk`, and `bd` as strict for v1 because that is
the user-specified policy and the existing trust-and-geography position.

this is a check-selection fact about the payout rail. it is not a trust input.
when rail capability changes, operators can revise the configuration without
changing callers or trust records.

### resolution 3: the payout rails matrix is the cited source (ruling 4)

the security branch carries `operations/country-rollout/creator-payout-rails.json`
with its md and schema. the check-policy configuration is keyed by iso 3166-1
alpha-2 codes matching `markets[].market` in that file. the earlier path
mismatch is resolved and no reconciliation flag remains. the matrix is dated
research evidence (as_of 2026-10-05) and says the runtime must query current
provider capability data, so the strict-market set is revisited whenever the
matrix changes. in, pk, and bd each show payoneer as primary rail and aml tier
standard in that copy. the market value comes from server-side payout account
verification, never from the client or the request ip.

### owner rulings from gate 0.1 (2026-10-06)

1. strict vpn/proxy positive: `needs_review`. lite-grade feeds produce false
   positives, and failing a first payout on a misclassified carrier is the wrong
   default. `positive_outcome` stays a per-market policy column so `fail` can be
   configured later, once false-positive rates are measured.
2. mandatory feed unavailable: `needs_review` with reason `feed_unavailable`.
   never a silent pass, never a hard fail for our own outage.
3. collection and consent: plain-language disclosure in the payout flow, no
   blocking modal. a failed collection is `needs_review` with reason
   `collection_unavailable`.
4. rail key: resolution 3.
5. admin visibility: admins read decision records (reason codes, flags, source
   attribution) and stored features under the 0009/0010 admin-only pattern. raw
   payloads are purged by design.
6. hashing and retention: hmac-sha256 with a server-held key, quarterly
   rotation, a key id on each hash row. signal events purge after 12 months.
   decision records are append-only evidence. hash-chain treatment is a
   follow-up and is not implemented here.

### gate 0.2 correction: what the free feeds can and cannot flag

ip2proxy lite lists open proxies only. vpn, tor exit, and datacenter data are
commercial-edition fields. the first draft of this design wrongly assigned
proxy, vpn, and tor to lite. v1 flag sources are:

| flag | v1 source | ipv4 | ipv6 |
|---|---|---|---|
| proxy | ip2proxy lite (open proxies) | full | full |
| vpn | x4bnet output/vpn/ipv4.txt | full | none |
| datacenter | x4bnet output/datacenter/ipv4.txt | full | none |
| tor | tor bulk exit list | full | none |

"none" means not evaluated, not clean. the adapter reports per-flag coverage so
the policy can tell the difference (component 5). a mandatory check with
coverage `none` yields `needs_review` with reason `coverage_unavailable`. that is
a consequence of ruling 2 and is open for owner confirmation, because it may send
a large share of strict-corridor requests to review.

## architecture

### component 1: client money-moment collector

**purpose**: collect the minimum browser signal at the two approved surfaces.

**location**: platform payout onboarding and payout request client surfaces,
not global application initialization.

**implementation shape**:

```typescript
export type MoneyMoment = 'payout_onboarding' | 'payout_request';

export type DeviceCollectionRequest = {
  moment: MoneyMoment;
  submissionId: string;
};

export type RawThumbmarkPayload = Record<string, unknown>;

export interface DeviceSignalCollector {
  collect(request: DeviceCollectionRequest): Promise<RawThumbmarkPayload>;
}
```

`ThumbmarkDeviceSignalCollector` is the only client implementation. it invokes
thumbmarkjs when the money-moment component is mounted or submitted, after a
plain-language disclosure in the payout flow (no blocking modal). it sends the payload
to the server endpoint over the authenticated payout flow. it does not calculate
trust, risk, geography, or an enforcement outcome.

collection must have an allowlist or an explicit sanitizer before submission so
biometric, camera, microphone, skin, body, and other body-adjacent values cannot
enter the payload. if thumbmarkjs changes its output, an unknown attribute is
rejected or dropped rather than automatically persisted.

**failure behavior**: if collection fails, the server receives a typed
`collection_unavailable` state, not a fabricated empty fingerprint. the decision
is `needs_review` with that reason (ruling 3), never a silent pass and never a
client-side fallback.

### component 2: server device processor

**purpose**: transform the transient raw payload into durable derived evidence.

**implementation shape**:

```typescript
export type DeviceFeatureSet = {
  schemaVersion: string;
  componentCoverage: number;
  automationIndicators: string[];
  inconsistencyIndicators: string[];
  collectionStatus: 'complete' | 'partial' | 'unavailable';
};

export type ProcessedDeviceSignal = {
  deviceHash: string; // hmac-sha256, hex
  hashKeyId: string;
  features: DeviceFeatureSet;
  processorVersion: string;
};

export interface DeviceSignalProcessor {
  process(raw: RawThumbmarkPayload): ProcessedDeviceSignal;
}
```

processing steps:

1. validate the authenticated caller and money-moment submission id.
2. validate the payload against the collection allowlist and size limits.
3. canonicalize permitted input fields in a deterministic order.
4. compute hmac-sha256 over the canonical form with the active server-held key.
   key material is never returned to the client or stored in a row. the key id
   is stored on the hash row.
5. derive a bounded feature set. features are categorical/count indicators,
   not a numeric fraud or trust score.
6. persist the hash, feature set, processor version, and event metadata through
   the server write path.
7. clear the raw payload from request-scoped memory and ensure it is absent from
   logs, thrown errors, tracing attributes, and durable retry payloads.

**hash choice (ruling 6)**: hmac-sha256 with a server-held key, rotated
quarterly. every hash row records the key id, so rows made under a retired key
stay attributable. the hash is server-side and keyed, not an unsalted browser
hash, because the purpose is controlled repeat comparison without exposing a
reusable identifier. comparing hashes across a rotation needs both keys, so a
retired key is kept until the rows it produced have purged (12 months). key
storage and distribution are an operations concern and no key is committed.

**retention**: the database schema must not include a raw payload column. a
queue or retry mechanism must carry only the processed representation. failure
logging stores an error class and request id, never the raw object.

### component 3: provider-agnostic ip intelligence port

**purpose**: decouple enforcement callers from data vendors and feed formats.

**port**:

```typescript
export type IpAddress = string;

export type IpLookupContext = {
  moment: MoneyMoment;
  observedAt: string;
};

export type IntelligenceSource = {
  id: string;
  datasetVersion: string;
  observedAt: string;
};

export type IpFlag = {
  value: boolean;
  source: IntelligenceSource;
  confidence: 'low' | 'medium' | 'high';
};

export type Coverage = 'full' | 'partial' | 'none';

export type IpIntelligenceResult = {
  adapterVersion: string;
  ipVersion: 4 | 6;
  // none means not evaluated, never clean
  coverage: Record<'proxy' | 'vpn' | 'tor' | 'datacenter', Coverage>;
  geo: {
    countryCode: string | null;
    subdivisionCode: string | null;
  };
  flags: {
    proxy: IpFlag;
    vpn: IpFlag;
    tor: IpFlag;
    datacenter: IpFlag;
  };
  sources: IntelligenceSource[];
};

export interface IpIntelligenceAdapter {
  lookup(ip: IpAddress, context: IpLookupContext): Promise<IpIntelligenceResult>;
}
```

`PayoutSignalCheckService` receives only the port. it never imports a vendor
client, reads a vendor-specific response, or branches on a feed name. a
configuration-selected adapter is injected at startup.

### component 4: v1 free-source adapter

`FreeIpIntelligenceAdapter` composes four source readers:

```typescript
interface GeoSource {
  lookup(ip: IpAddress): GeoLookup;
}

interface NetworkClassificationSource {
  lookup(ip: IpAddress): NetworkLookup;
}

interface RangeListSource {
  contains(ip: IpAddress): RangeMatch | null;
}
```

source responsibilities:

- `MaxMindGeoLite2Source`: country/subdivision geo only.
- `Ip2ProxyLiteSource`: the proxy flag only (open proxies, ipv4 and ipv6).
- `X4bnetVpnRangeSource`: vpn flag from output/vpn/ipv4.txt and datacenter flag
  from output/datacenter/ipv4.txt. ipv4 only.
- `TorExitNodeSource`: tor flag from the published bulk exit list. ipv4 only.

community-list entries must be normalized into a versioned local range format.
feeds are updated out of band by a reproducible local data import script; the
repo contains fixtures and checksums or metadata, not provider databases or
secrets. the source registry records the feed url, license, attribution,
retrieval date, and the boundary of what the feed supports.

### component 5: source precedence and conflict resolution

v1 uses conservative boolean flag composition:

- a flag is `true` if any trusted source positively identifies that class.
- a positive from a more specific list does not get erased by a negative from a
  less specific or stale source.
- source attribution contains every positive source, not only the winning one.
- `tor` is true when the address is in the published tor bulk exit list.
- `vpn` is true when the address is in x4bnet's vpn list.
- `datacenter` is true when the address is in x4bnet's datacenter list.
- `proxy` is true when ip2proxy lite lists the address as an open proxy.
- a flag's `coverage` is `none` when no configured source can evaluate it for
  that address family (vpn, datacenter, tor on ipv6). such a flag has
  `value: false` but is not evidence of a clean address, and downstream code
  must read `coverage` before treating `false` as a negative.
- conflicting geo values do not produce a trust or enforcement score. the result
  carries a `geo_conflict` diagnostic for operational review, subject to the
  final result contract.
- a feed error is represented as source-unavailable metadata. it is not
  converted to a clean result.

an unavailable mandatory source yields `needs_review` with reason
`feed_unavailable` (ruling 2). the adapter itself reports availability and
coverage; it does not enforce.

### component 6: commercial adapter substitution

`CommercialIpIntelligenceAdapter` implements the same port. the first supported
configuration targets either maxmind anonymous ip or ipinfo privacy detection,
with geo supplied by the selected commercial contract where licensed. no
commercial dependency is required for the v1 local implementation.

substitution is proven with contract tests:

```typescript
const adapters = [
  new FreeIpIntelligenceAdapter(fixtureSources),
  new StubCommercialAdapter(stubResult),
];

for (const adapter of adapters) {
  const service = new PayoutSignalCheckService({ ipAdapter: adapter });
  await service.check(input);
}
```

contract tests assert that callers consume only the typed result, source
attribution, and availability state. they do not assert vendor-specific fields.

### component 7: private persistence model

the migration is numbered 0011, after 0010. the tables below are the planned
shape. the first draft listed four tables; a separate `ip_intelligence_events`
table is dropped because network flags and source attribution must survive the
12-month purge on the decision record (ruling 5), which would leave that table
holding only an ip digest. the digest moves onto the signal event instead.

#### `sculptura_private.creator_signal_events`

one event per processed device signal and money moment. candidate fields:

- `id`
- `creator_profile_id` referencing `public.creator_profiles(id)`
- `moment` constrained to `payout_onboarding` or `payout_request`
- `submission_id` unique within the money-moment request space
- `device_hash` (hmac-sha256 hex, null when collection failed)
- `ip_digest` (hmac-sha256 hex of the observed ip, never the plaintext ip)
- `hash_key_id` (key id used for both hashes)
- `collection_status` (`complete`, `partial`, `unavailable`)
- `device_features` jsonb with strict object validation
- `processor_version`
- `occurred_at`

update is always rejected. rows older than 12 months are removed only by a
service-only purge function (ruling 6). decision records reference the event by
`submission_id` with no foreign key, so the purge never orphans or edits them.

this table contains no raw thumbmark payload. it contains no country, market,
region, corridor, or geography field.

plaintext ip addresses are not persisted. geo returned by the adapter is not
persisted in v1: nothing in the enforcement path needs it, and keeping it out of
the schema is the safest reading of the geography invariant. a later leg that
needs geo for routing or compliance records must add it deliberately.

#### `sculptura_private.payout_signal_decisions`

one immutable, append-only decision per money-moment attempt. fields:

- `id`
- `creator_profile_id`
- `moment`
- `submission_id` unique for idempotency
- `request_digest` (sha256 of the canonical decision payload, for replay checks)
- `policy_version`
- `selected_checks` jsonb
- `outcome` constrained to `pass` or `needs_review` or `fail`
- `reason_codes` jsonb (for example `vpn_detected`, `proxy_detected`,
  `feed_unavailable`, `coverage_unavailable`, `collection_unavailable`)
- `network_flags` jsonb: per flag the value, coverage, source id, and dataset
  version
- `adapter_version`
- `occurred_at`

the record carries no market, country, or corridor field. it refers to the
policy by `policy_version`, which names a reviewed policy set, not a person's
market.

this is evidence of a decision, not a trust record. it may include the
policy version and check names needed to explain why a check ran, but no
geography-derived value may be copied into creator trust or buyer trust.

#### `sculptura_private.payout_signal_policy`

versioned operator configuration for check selection. candidate fields:

- `policy_version`
- `market` (iso 3166-1 alpha-2, or `DEFAULT`), primary key with `policy_version`
- `mandatory_checks` text array drawn from `proxy`, `vpn`, `tor`, `datacenter`
- `positive_outcome` constrained to `needs_review` or `fail`, seeded as
  `needs_review` (ruling 1)
- `enabled`

the v1 seed is `DEFAULT` with no mandatory checks, plus `IN`, `PK`, and `BD`
with `proxy` and `vpn` mandatory. rows change only through reviewed
migrations, like the trust level taxonomy in 0009. this is the one place a
market code lives. it is configuration that selects checks, never a subject
record, and a test cross-checks every policy market against the rails matrix.

all three tables use the `sculptura_private` pattern from 0009/0010:

- no postgrest exposure
- no anon or authenticated direct writes
- authenticated admin read under rls, if human review requires it
- server-side restricted writes through a controlled function or service path
- append-only event and decision history where records explain enforcement
- explicit grants rather than inherited public-schema defaults

admins read decision records, reason codes, flags, source attribution, and
stored features (ruling 5). no public or creator-facing surface shows them.
server writes go through one `service_role`-only function; clients have no
direct write path.

### component 8: money-moment orchestration service

**port**:

```typescript
export type PayoutSignalInput = {
  creatorProfileId: string;
  moment: MoneyMoment;
  submissionId: string;
  observedIp: IpAddress;
  rawDevicePayload: RawThumbmarkPayload | null;
  // iso 3166-1 alpha-2, from server-side payout account verification
  market: string;
};

export type PayoutSignalDecision = {
  outcome: 'pass' | 'fail' | 'needs_review';
  reasonCodes: string[];
  policyVersion: string;
  selectedChecks: string[];
};

export interface PayoutSignalCheckService {
  check(input: PayoutSignalInput): Promise<PayoutSignalDecision>;
}
```

execution flow:

1. authenticate the creator and authorize the payout action.
2. assert the moment is `payout_onboarding` or `payout_request`.
3. load the active policy row for the market, falling back to `DEFAULT`.
4. process the raw device payload; do not persist raw input. a missing or failed
   payload becomes `collection_unavailable`.
5. resolve the observed ip through the injected adapter.
6. select mandatory checks from policy configuration.
7. evaluate the selected checks against derived device and network results.
8. write immutable signal evidence and one idempotent decision record.
9. return only the decision needed by the payout workflow, without raw
   fingerprint data, plaintext ip, geo details, or internal source payloads.
10. allow the payout workflow to proceed only according to the reviewed
    decision policy. this feature does not move funds.

**idempotency**: `submission_id` is generated by the server-authorized payout
flow and is unique per money-moment attempt. a replay with identical input
returns the original decision. a replay with changed signal input or policy
version is rejected and audited rather than overwriting the original event.

### component 9: enforcement policy

policy evaluation is deliberately small and explicit:

- non-strict corridor: run configured signals; a positive can produce the
  configured outcome, but vpn/proxy is not mandatory solely because the corridor
  is non-strict.
- strict corridor: vpn/proxy checks must be selected and evaluated at both
  money moments. a positive produces the policy's `positive_outcome`, which is
  `needs_review` in the v1 seed (ruling 1), never `pass`.
- a failed device collection is `needs_review` in every market
  (`collection_unavailable`, ruling 3).
- tor and datacenter flags are evidence and may be selected as checks by policy;
  the user brief only makes vpn/proxy mandatory in strict corridors.
- no signal result writes a trust level.
- no geo result changes a trust level.
- no outcome automatically declares fraud, aml suspicion, or criminality.

evaluation order for the outcome, first match wins:

1. a mandatory check whose feed errored: `needs_review`, `feed_unavailable`.
2. a mandatory check whose coverage is `none` for the address:
   `needs_review`, `coverage_unavailable`.
3. a mandatory check that is positive: the policy `positive_outcome` with the
   matching `*_detected` reason.
4. a failed or missing device collection: `needs_review`,
   `collection_unavailable`.
5. otherwise `pass`.

several reasons can apply at once, and all of them are recorded in
`reason_codes`. the strongest outcome wins (`fail` over `needs_review` over
`pass`). unavailable data never resolves to `pass`, and an outage on our side is
never a hard user fail (ruling 2).

## data flow

```text
payout onboarding or payout request
        |
        v
authenticated server endpoint
        |
        +--> thumbmarkjs payload -> allowlist -> keyed hash + bounded features
        |                                  |
        |                                  +--> creator_signal_events
        |
        +--> observed ip -> IpIntelligenceAdapter -> typed flags + coverage
                                           |
                                           +--> ip digest -> creator_signal_events
        |
        v
versioned payout signal policy
        |
        v
PayoutSignalCheckService
        |
        +--> payout_signal_decisions (append-only, idempotent)
        |
        v
payout workflow receives pass/fail/needs_review
```

raw device payload and plaintext ip terminate at the processing boundary. geo
is not persisted in v1. network flags and source attribution stay on the
decision record. none of it becomes a trust field.

## security and privacy controls

- server authenticates and authorizes the creator before processing signals.
- request ids and submission ids prevent replay and support audit correlation.
- raw thumbmark payloads are excluded from logs, traces, error metadata, queues,
  and database columns.
- plaintext ip addresses are not persisted; only a keyed digest is retained.
- signal tables are private and admin-readable only through an explicit policy.
- service-role access is not evidence of client rls; new private-table tests
  must exercise grants and rls separately, following the existing harness.
- all external feed versions and sources are recorded as metadata, not as
  opaque unexplained flags.
- no secrets, provider credentials, commercial databases, or live customer
  data enter fixtures or commits.
- the feature does not collect biometric, skin, body, camera, or microphone
  signals.

## test architecture

### unit and contract tests

- canonicalization and keyed hash determinism
- feature extraction allowlist and payload size limits
- raw-payload omission from persistence and logs
- ip adapter contract against free fixture sources
- adapter swap against a stub commercial result
- source precedence and attribution
- malformed ip and unavailable-feed behavior
- policy selection for strict and non-strict rail configurations

### cumulative schema and access tests

extend `scripts/build-security-test-db.mjs` with migrations 0011+ and extend
the existing local seeder with creator signal fixtures. use real role contexts
from `scripts/test-helpers.mjs` and preserve grant-vs-rls classification.

positive controls:

- an admin can read the approved private evidence surface.
- a creator's server-authorized money-moment path can create one decision.
- replaying the same submission returns the same decision without a duplicate.
- a clean residential fixture produces the expected configured outcome.

negative controls:

- anon and authenticated non-admin roles cannot read private signal tables.
- direct client inserts, updates, deletes, and trust-table writes are denied.
- a caller cannot submit another creator's profile id.
- a caller cannot invoke the service at signup, browse, listing, or ordinary
  checkout moments.
- raw payload and plaintext ip do not appear in stored rows.
- strict in/pk/bd with a vpn/proxy positive cannot produce `pass`.
- a non-strict corridor does not accidentally enforce a strict-only check.
- a trust table with a geography-like column fails the schema invariant test.
- a provider adapter failure is not treated as a clean result.
- an unavailable mandatory feed gives `needs_review` with `feed_unavailable`,
  never `pass` and never `fail`.
- an ipv6 address never reports clean for vpn, datacenter, or tor.
- every policy market exists in creator-payout-rails.json.
- events older than 12 months purge; decisions survive the purge.
- hash rows carry a key id, and a row made under a retired key stays
  attributable.

## deployment and verification boundaries

local pglite tests prove migration replay, schema invariants, fixture behavior,
and local grant/rls behavior only. they do not prove live supabase exposure,
actual provider feed quality, legal applicability, concurrent production
requests, or payout provider behavior.

before live activation, separately verify:

1. the rails matrix is dated research evidence and must be re-queried at
   runtime per its own rule; the strict-market set is re-verified whenever the
   matrix changes.
2. licensed data acquisition, updates, attribution, and retention for each
   selected feed.
3. measured false-positive rates before any per-corridor `fail` config, and
   owner confirmation of the `coverage_unavailable` consequence for ipv6.
4. real supabase role and rls behavior for all new private tables.
5. provider contract, privacy notice, retention, and jurisdiction review.
6. payout workflow integration and idempotent external provider behavior.

no live deployment, real payment, or real payout is part of this design leg.

## follow-ups

- hash-chain treatment for decision records, as already ruled for dispute
  evidence. not implemented here.
- commercial feed decision to close the ipv6 and vpn/tor/datacenter gap.
- per-corridor `fail` configuration once false-positive rates are measured.
- a typescript port of the service: production is typescript/node, but this repo
  has no typescript toolchain, so v1 is es modules with jsdoc types. the
  interfaces above are the contract for the port.

## implementation record (2026-10-06)

what shipped on the `security` branch matches this design with the
corrections below. file-for-component mapping, for a reviewer tracing design
to code:

| component | file |
|---|---|
| migration 0011 (3 tables, write fn, purge fn, admin rpc) | `migrations/0011_payout_signal_evidence.sql` |
| geography invariant checker | `scripts/check-trust-schema-invariant.mjs` |
| key ring (component 2's hash choice) | `platform/signals/key-ring.mjs` |
| client collector (component 1) | `platform/signals/collector.mjs` |
| server device processor (component 2) | `platform/signals/device-processor.mjs` |
| ip intelligence port + free adapter (components 3-5) | `platform/signals/ip-intelligence.mjs` |
| feed loader and importer (component 4 detail) | `platform/signals/feeds.mjs`, `platform/signals/import-feeds.mjs`, `scripts/import-ip-feeds.mjs` |
| money-moment service (component 8) | `platform/signals/payout-signal-check.mjs` |
| database ports | `platform/signals/db-ports.mjs` |
| http-shaped entry contract (not separately designed above) | `platform/signals/payout-gate.mjs` |

three deviations from the design as drafted, each forced by something read
from a real source during implementation rather than chosen for convenience:

1. **flag-source correction** (component 4/5): corrected before any code was
   written, at gate 0.2. see the requirements record above; design.md's
   component 4/5 text was updated in place rather than left stale, so it now
   describes the free adapter as shipped.
2. **three private tables, not four**: the first design draft proposed a
   separate `ip_intelligence_events` table. it was dropped before migration
   0011 was written, because network flags and source attribution need to
   survive the decision record's lifetime (append-only, not purged) while an
   ip-keyed event would otherwise sit on the 12-month event purge. the ip
   digest moved onto `creator_signal_events` instead. this is recorded in the
   migration's own comments and in `security/signals-and-ip-intel-results.md`.
3. **geo is not persisted at all in v1**: narrower than this design's original
   "routing/compliance records only" allowance. nothing in the two money
   moments needed it, so the port returns geo but nothing writes it to a row.
   the embargoed-territory addendum below is the first consumer, and adds its
   own storage for it rather than retroactively widening this leg's tables.

follow-ups resolved:

- the ipv6 `coverage_unavailable` question: owner ruling recorded in
  requirements.md above. closed, not deferred.
- a commercial feed decision: still open, still deferred. the adapter
  boundary and a contract-tested stub (`stub-commercial-adapter.mjs`, test-only)
  exist; no real commercial integration does.
- per-corridor `fail` configuration: still deferred pending measured
  false-positive rates. the `positive_outcome` column and a passing test for
  the configuration exist; the v1 seed uses `needs_review` everywhere.
- the typescript port: still deferred. no typescript toolchain was added.
- the hash-chain treatment for decision records: still deferred, unchanged.

see `security/signals-and-ip-intel-results.md` on the security branch for
full test counts, the mutation-testing record (13 injected bugs, all caught),
and the verified/blocked/deferred breakdown.

## batch 8 implementation record (2026-10-06)

batch 8 shipped as `e3d04cf` on `security`. file-for-component mapping:

| component | file |
|---|---|
| migration 0012 (reason code, geo evidence, list table, grey-list trigger, pattern view, admin function, 16-argument write fn) | `migrations/0012_embargoed_territory_review.sql` |
| geolite2 country reader with manifest, size floor, age limit | `platform/signals/geo-reader.mjs` |
| geo contract and adapter wiring | `platform/signals/ip-intelligence.mjs` |
| territory check inside `evaluateChecks`, territory list dependency | `platform/signals/payout-signal-check.mjs` |
| territory list store, geo evidence in the recorder | `platform/signals/db-ports.mjs` |
| review outcome vocabulary | `platform/signals/review-outcomes.mjs` |
| list and trigger reconciliation against the rails matrix | `scripts/check-embargo-greylist-disjoint.mjs` |
| exact-column geo allowlist | `scripts/check-trust-schema-invariant.mjs` |

design decisions, with the reason for each:

1. **the check is independent of `mandatoryChecks`.** it lives in
   `evaluateChecks` but outside the strict-corridor loop, so an empty mandatory
   set (every non-strict market) cannot skip it. a mutation that made it
   depend on the mandatory set is caught.
2. **a territory hold is capped at `needs_review`.** if a real mandatory
   positive is also present and the policy configures `fail`, that outcome
   still applies. the territory alone never escalates.
3. **geo has two absent states.** coverage `full` with a null country is
   "evaluated, no match". coverage `none` is "not evaluated". neither adds a
   reason. both are stored as attribution. a malformed result carrying a
   country beside coverage `none` is rejected by the contract, and
   `evaluateChecks` also ignores it as defense in depth.
4. **a list read failure is a hold.** the territory list store is a required
   service dependency. an unreadable list throws `PolicyUnavailableError`. an
   unknown list version returns an empty set, documented in `db-ports.mjs`, so
   configuration must name a real version.
5. **the pattern is a plain view plus an admin function.** probing in pglite
   showed that a security definer function does not inherit caller rls and a
   plain view does not re-apply base table rls. the view is granted to
   service_role only, and `admin_get_embargo_pattern(uuid)` checks the admin
   role itself. counts only: hits, distinct moments, first and last hit,
   total decisions. no score, trust or risk field.
6. **the grey-list guard has two halves.** a trigger holds the five codes
   from the rails matrix, because that file lives outside the database. the
   script reconciles the list and the trigger against the matrix, so drift in
   the matrix fails the check instead of silently passing.
7. **geo persistence is one column.** `payout_signal_decisions.geo_evidence`
   holds country code, coverage, source id and dataset version, validated by
   `valid_geo_evidence`. the invariant checker allows that exact column and
   nothing broader.
8. **the dependency.** `maxmind@5.0.7`, pinned exact, mit, with mmdb-lib 3.0.3
   (mit) and tiny-lru 13.0.0 (bsd-3-clause). ledger entry src-0026. the
   reader's `open` function is injected, so no real database is used in tests.

verification: 10 injected mutations (territory check removed, made dependent
on strictness, escalated to fail, missing geo turned into a reason, a country
on a coverage-none result matching, grey-list trigger removed, trigger missing
one code, pattern view granted to authenticated, review-outcome assertion
disabled, invariant allowlist emptied), all caught. one survived at first and
led to a direct test of the malformed shape.

not verified: the reader has never opened a real `.mmdb`, because that needs a
maxmind account. the first real database should be checked against a few known
addresses before anyone relies on it. nothing here is applied to a live
database.

## batch 9 implementation record (2026-10-06)

batch 9 shipped as `d912f7d` on `security`, pushed to `origin/security`. no
migration. file-for-component mapping:

| component | file |
|---|---|
| eligibility evaluator (proceed / not_yet) | `platform/signals/payout-eligibility.mjs` |
| the parked-market hold list | `platform/signals/parked-market-policy.mjs` |
| gate wiring (not_yet before the signal check) | `platform/signals/payout-gate.mjs` |
| hold-list reconciliation against the rails matrix and embargo list | `scripts/check-parked-hold-policy.mjs` |

design decisions, with the reason for each:

1. **one evaluator for two rulings.** the minor-creator park and the
   parked-market hold have the same shape: a pre-check that returns `proceed` or
   `not_yet` before any signal check. they share `payout-eligibility.mjs` rather
   than living in two places.
2. **age is checked first.** a minor is parked in every market, with or without a
   rail, so the age branch returns before the market branch is read. age alone
   never unlocks anything: at 18 the gate still holds until a verified payout
   account exists, exactly as it does for any creator without a rail.
3. **the matrix is read on every call.** the rails file declares
   `runtime_query_required`, and reading it per call means a market that moves from
   `parked_markets` to `markets` lifts the hold with no code change. the stale
   hold-list entry can then be removed at leisure, and the check script reports it.
4. **the hold list is separate from the matrix.** the matrix parks markets for
   many reasons (missing rails, no signal, sanctions, grey list). only roadmap state
   should say "not yet", so the hold list names those markets explicitly and the
   check script rejects a sanctions, grey-listed, out-of-scope or embargoed entry.
5. **not_yet is answered in the gate, before the service.** so no signal check
   runs, no device signal is collected and no decision is recorded for a creator who
   has no payout path yet. the two layers stay independent: a parked-market creator
   who does present an enabled rail still gets the embargo review.
6. **the gate requires the new dependencies.** `resolveCreatorFacts` and
   `eligibility` are mandatory, so a caller cannot wire the gate and silently skip
   the park. a rail lookup that throws became its own hold cause, separated from the
   normal no-rail state.
7. **no ledger change.** accrual for a not-yet-eligible creator is an ordinary
   `creator_payable` liability on the existing ledger. a test asserts the six
   accounts are unchanged, no age or market column was added, and the service role
   still cannot edit an entry.

these are owner-ratified settings now, recorded in the result doc and the readme:
the feed staleness limits and the geolite2 age limit, parked for a real-traffic
revisit; and the embargo-list reviewer, assigned to the owner with a
quarterly-plus-news cadence.

verification: 25 injected mutations, all caught. one first survived (ignoring the
enabled-market check in the parked-resident branch), because the matrix loader
already rejects an enabled-and-parked overlap; a test with an inconsistent matrix
closed it. a flaky timing test in `ip.test.mjs` was fixed (parallel-load timing,
not a logic bug).

not built, because no code for it exists in the repo: age-attestation capture at
publication, residence lookup from a creator record, and real payout-route wiring.
the gate takes both facts through `resolveCreatorFacts`.
