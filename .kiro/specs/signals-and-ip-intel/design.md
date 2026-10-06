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

## policy resolutions and open decisions

### resolution 1: trust remains behavior-only

`sculptura_private.creator_trust` and `sculptura_private.buyer_trust` are not
extended. device and ip evidence is event-scoped and stored separately. the
check decision may contain a corridor-selected check identifier for auditability,
but it must not write that corridor into a trust record or use it to calculate a
trust level.

### resolution 2: corridor is runtime configuration, not person data

strictness is represented by a versioned check-policy configuration keyed by the
payout rail or execution corridor. the runtime reads the configuration while
processing a money moment and records the selected policy version in the check
evidence. it does not persist a geography-derived creator attribute. the
configuration may identify `in`, `pk`, and `bd` as strict for v1 because that is
the user-specified policy and the existing trust-and-geography position.

this is a check-selection fact about the payout rail. it is not a trust input.
when rail capability changes, operators can revise the configuration without
changing callers or trust records.

### resolution 3: payout policy path mismatch is recorded, not silently fixed

`security/aml/considerations/trust-and-geography.md` links to
`operations/country-rollout/creator-payout-rails.md`, but that file is not in
the current snapshot. the available policy file is
`operations/country-rollout/creator-payout-policy.json`. this design uses a new
signals check-policy configuration rather than pretending the absent matrix
exists. reconciling the payout-rail source of truth is a prerequisite for live
activation and remains an explicit review item.

### open decision: final outcome policy for a strict vpn/proxy positive

the user brief requires vpn/proxy checks to be mandatory in strict corridors,
but does not choose between `fail` and `needs_review` for a positive. the
implementation must not silently choose. the policy configuration therefore
contains an explicit `positive_outcome` value, and the spec review must select
`fail` or `needs_review` before implementation. until then, the local fixture
suite may assert that the check is mandatory and produces the configured
non-pass outcome, but may not claim the final product policy is settled.

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
thumbmarkjs when the money-moment component is mounted or submitted, subject to
the product's user-consent and failure behavior decision. it sends the payload
to the server endpoint over the authenticated payout flow. it does not calculate
trust, risk, geography, or an enforcement outcome.

collection must have an allowlist or an explicit sanitizer before submission so
biometric, camera, microphone, skin, body, and other body-adjacent values cannot
enter the payload. if thumbmarkjs changes its output, an unknown attribute is
rejected or dropped rather than automatically persisted.

**failure behavior**: if collection fails, the server receives a typed
`collection_unavailable` state, not a fabricated empty fingerprint. whether an
unavailable signal blocks onboarding or creates a review decision is part of
the reviewed money-moment policy, not a client-side fallback.

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
  deviceHash: string;
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
4. compute a server-side keyed hash using a secret held by the server runtime.
   the key is not returned to the client or stored in the row.
5. derive a bounded feature set. features are categorical/count indicators,
   not a numeric fraud or trust score.
6. persist the hash, feature set, processor version, and event metadata through
   the server write path.
7. clear the raw payload from request-scoped memory and ensure it is absent from
   logs, thrown errors, tracing attributes, and durable retry payloads.

**hash choice**: the exact keyed-hash algorithm and key-rotation procedure are
an implementation decision that must be recorded before coding. the design
requires a keyed server-side hash, not an unsalted browser hash, because the
purpose is controlled repeat comparison without exposing a reusable identifier.

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

export type IpIntelligenceResult = {
  adapterVersion: string;
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
- `Ip2ProxyLiteSource`: proxy, vpn, tor, and provider-supplied network
  classification fields supported by the installed dataset.
- `X4bnetVpnRangeSource`: community vpn/datacenter range membership.
- `TorExitNodeSource`: published tor exit range membership.

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
- `tor` is true when ip2proxy identifies tor or the address is in the published
  tor exit list.
- `vpn` or `proxy` is true when ip2proxy identifies it or the community vpn
  list contains it.
- `datacenter` is true when a supported source identifies hosting/datacenter or
  the configured community range identifies it.
- conflicting geo values do not produce a trust or enforcement score. the result
  carries a `geo_conflict` diagnostic for operational review, subject to the
  final result contract.
- a feed error is represented as source-unavailable metadata. it is not
  converted to a clean result.

whether an unavailable mandatory source causes `needs_review` or blocks the
money moment is a policy decision that must be settled with the strict-positive
outcome above. the adapter itself reports availability; it does not enforce.

### component 6: commercial adapter substitution

`CommercialIpIntelligenceAdapter` implements the same port. the first supported
configuration targets either MaxMind Anonymous IP or ipinfo privacy detection,
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

new migrations are numbered after 0010. proposed tables are below; exact names
and columns remain subject to requirements review before implementation.

#### `sculptura_private.creator_signal_events`

one event per processed device signal and money moment. candidate fields:

- `id`
- `creator_profile_id` referencing `public.creator_profiles(id)`
- `moment` constrained to `payout_onboarding` or `payout_request`
- `submission_id` unique within the money-moment request space
- `device_hash`
- `device_features` jsonb with strict object validation
- `processor_version`
- `occurred_at`
- `retention_state` or processed status if needed for operational cleanup

this table contains no raw thumbmark payload. it contains no country, market,
region, corridor, or geography field.

#### `sculptura_private.ip_intelligence_events`

one per ip lookup attached to the money-moment event. candidate fields:

- `id`
- `signal_event_id` referencing the creator signal event
- `ip_digest` as a server-side keyed digest, never plaintext ip
- `adapter_version`
- `geo_evidence` jsonb, limited to routing/compliance evidence
- `network_flags` jsonb with typed source attribution
- `sources` jsonb
- `lookup_status`
- `occurred_at`

plaintext ip addresses are not persisted. the table does not join into trust
calculation and carries no trust level.

#### `sculptura_private.payout_signal_decisions`

one immutable decision per money-moment attempt. candidate fields:

- `id`
- `creator_profile_id`
- `moment`
- `submission_id` unique for idempotency
- `selected_checks` jsonb
- `device_signal_event_id`
- `ip_intelligence_event_id`
- `outcome` constrained to `pass`, `fail`, or `needs_review`
- `reason_codes` jsonb
- `policy_version`
- `occurred_at`

this is evidence of a decision, not a trust record. it may include the
policy version and check names needed to explain why a check ran, but no
geography-derived value may be copied into creator trust or buyer trust.

#### `sculptura_private.payout_signal_policy`

versioned operator configuration for check selection. candidate fields:

- `policy_version`
- `rail_key` or an equivalent payout capability key
- `strict_vpn_proxy_required`
- `strict_tor_required` if separately approved
- `positive_outcome` pending review
- `enabled`
- `effective_from`
- `created_by`

if a corridor or country key is needed to select a payout rail, it belongs in
this policy/configuration boundary, not in a subject trust table. the exact
key must be reconciled with the missing payout-rail matrix before implementation.

all four tables use the `sculptura_private` pattern from 0009/0010:

- no postgrest exposure
- no anon or authenticated direct writes
- authenticated admin read under rls, if human review requires it
- server-side restricted writes through a controlled function or service path
- append-only event and decision history where records explain enforcement
- explicit grants rather than inherited public-schema defaults

whether admin humans should view raw network evidence or only redacted reason
codes is an open privacy review item. no public or creator-facing surface may
show the records by default.

### component 8: money-moment orchestration service

**port**:

```typescript
export type PayoutSignalInput = {
  creatorProfileId: string;
  moment: MoneyMoment;
  submissionId: string;
  observedIp: IpAddress;
  rawDevicePayload: RawThumbmarkPayload | null;
  railKey: string;
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
3. load the payout policy by rail key and policy version.
4. process the raw device payload if present; do not persist raw input.
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
  money moments. a positive must produce the reviewed `positive_outcome` rather
  than `pass`.
- tor and datacenter flags are evidence and may be selected as checks by policy;
  the user brief only makes vpn/proxy mandatory in strict corridors.
- no signal result writes a trust level.
- no geo result changes a trust level.
- no outcome automatically declares fraud, aml suspicion, or criminality.

if policy or provider data is unavailable, the service returns an explicit
unavailable reason. it must not fail open silently in a strict mandatory check
path. the final unavailable behavior is a review decision and must be encoded in
policy before implementation.

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
        +--> observed ip -> IpIntelligenceAdapter -> typed flags + geo evidence
                                           |
                                           +--> ip_intelligence_events
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
is retained only as bounded routing/compliance evidence when the reviewed
retention policy allows it. neither becomes a trust field.

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
- a provider adapter failure is not treated as a clean positive result.

## deployment and verification boundaries

local pglite tests prove migration replay, schema invariants, fixture behavior,
and local grant/rls behavior only. they do not prove live supabase exposure,
actual provider feed quality, legal applicability, concurrent production
requests, or payout provider behavior.

before live activation, separately verify:

1. the payout rail and corridor source of truth, including the missing
   `creator-payout-rails.md` reconciliation.
2. licensed data acquisition, updates, attribution, and retention for each
   selected feed.
3. the final policy for strict vpn/proxy positives and unavailable mandatory
   feeds.
4. real supabase role and rls behavior for all new private tables.
5. provider contract, privacy notice, retention, and jurisdiction review.
6. payout workflow integration and idempotent external provider behavior.

no live deployment, real payment, or real payout is part of this design leg.
