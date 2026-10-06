# signals and ip intelligence

creator identity and network signals for payout fraud control. this module
collects a browser device signal and an ip check at exactly two money moments,
payout onboarding and payout request, and records a reviewable decision. it does
not move funds, freeze accounts, or score people.

the governing rule is in
[trust and geography](../../security/aml/considerations/trust-and-geography.md):
geography never feeds trust. the market only selects which checks run.

status: local implementation and tests only. nothing here is applied to a live
database, calls a live provider, or executes a payout. the spec lives on the
`agent-instructions` branch under `.kiro/specs/signals-and-ip-intel/`.

## sources

every outside claim is logged in
[`research/sources/sources.jsonl`](../../research/sources/sources.jsonl)
(src-0021 to src-0025) with license, update terms, and a boundary stating what
the source does and does not support.

| flag or role | v1 source | coverage |
|---|---|---|
| device signal | thumbmarkjs (mit) | browser |
| geo | maxmind geolite2 (cc by-sa 4.0 plus eula) | ipv4, ipv6, not persisted in v1 |
| proxy | ip2proxy lite, open proxies only | ipv4, ipv6 |
| vpn | x4bnet `output/vpn/ipv4.txt` (mit) | ipv4 only |
| datacenter | x4bnet `output/datacenter/ipv4.txt` (mit) | ipv4 only |
| tor | tor bulk exit list | ipv4 only |

ip2proxy lite does not list vpn, tor exit, or datacenter addresses. those are
commercial-edition data. a flag with coverage `none` means not evaluated, never
clean.

## what is never committed

- provider databases (`*.mmdb`, `IP2PROXY-*`, `GeoLite2-*`) and refreshed feed
  data under `platform/signals/data/`. all are gitignored.
- api keys, hmac keys, or any secret-shaped value.

`npm run check:signals-hygiene` fails if either appears in the signals paths.

## device signal

[`collector.mjs`](collector.mjs) is the client contract. it takes the thumbmarkjs
constructor by injection, so this repo takes no browser dependency and tests never
load the library. the platform payout client installs
`@thumbmarkjs/thumbmarkjs@1.12.0` with an exact version when that surface exists.

read from the published 1.12.0 package, and enforced in code:

- telemetry is forced off. by default the library samples runs to
  `api.thumbmarkjs.com` and may fetch a script from `experimental.thumbmarkjs.com`.
  the collector sets `logging: false` and `collect_beacon: false` and never sets an
  `api_key`. the options object is frozen.
- `permissions` (camera, microphone, geolocation states), `locales` (timezone,
  language) and `speech` (voice list) are excluded on the client and again on the
  server. the first is sensor-adjacent and the other two are geography proxies.
- the server allowlists ten components, ignores the library's own hash and any
  client-sent trust field, drops any component with a biometric or body-adjacent
  key, and drops a `webrtc` component that contains an ip address. a reduced
  chrome user agent such as `Chrome/120.0.0.0` is not mistaken for one.
- a failed or missing collection is `collection_unavailable`, never a fabricated
  fingerprint. the payout flow shows a plain-language, non-blocking disclosure.

[`device-processor.mjs`](device-processor.mjs) canonicalizes the allowlisted
components and hashes them with hmac-sha256 under a server-held key
([`key-ring.mjs`](key-ring.mjs)). every hash carries a key id, keys rotate
quarterly, and a retired key stays loaded until the rows it produced have purged.
no key is committed. configure a server with:

```text
SIGNALS_HMAC_ACTIVE_KEY_ID=k-2026-q4
SIGNALS_HMAC_KEYS=k-2026-q3:<base64 32 bytes>,k-2026-q4:<base64 32 bytes>
```

the raw payload is never stored, logged, or echoed in an error. the processor
returns counts and fixed reason codes only.

## ip intelligence

[`ip-intelligence.mjs`](ip-intelligence.mjs) defines the port. callers get one
result shape and never a vendor field name, so a commercial feed replaces the free
one by writing another adapter. the service validates every result with
`assertIpIntelligenceResult`, so an adapter cannot slip an unattributed positive or
a "clean" unevaluated flag past the policy.

rules the adapter enforces:

- a flag with coverage `none` was not evaluated. it is stored as `false` with
  coverage `none` and is never a pass signal. ipv6 is `none` for vpn, datacenter
  and tor under the free feeds.
- a source that errors is `unavailable`, never a negative.
- a positive from any source raises the flag, and a negative cannot erase it.
- an ipv4 client on a dual-stack socket (`::ffff:a.b.c.d`) is looked up as ipv4.
- private, loopback, link-local, multicast and reserved addresses are never judged
  clean. every flag reports coverage `none`.
- a malformed address throws before any source is called.

geo is returned by the port and is not persisted. the geolite2 reader is not
written in v1 because reading its `.mmdb` format needs a parser dependency, and
nothing in the enforcement path uses geo.

### feeds

the free adapter reads feed files from `platform/signals/data/` (gitignored),
described by a `manifest.json` with a sha-256 and a retrieval date per file.
[`feeds.mjs`](feeds.mjs) loads them. a feed that is missing, tampered with, mostly
garbage, truncated, future-dated or stale loads as an unavailable source, which the
policy turns into `feed_unavailable` and `needs_review`.

the staleness limits (tor 48 hours, x4bnet 14 days, ip2proxy lite 45 days) are
operational defaults chosen in this leg. they are not owner rulings and need review.

```text
node scripts/import-ip-feeds.mjs --fetch                 # public lists only, needs no key
node scripts/import-ip-feeds.mjs --from-dir <dir>        # local files, including ip2proxy lite
```

[`import-feeds.mjs`](import-feeds.mjs) stages new files, validates them with the
same loader the service uses, and swaps the directory only if every feed is ok. a
bad download never replaces a working set. the two ip2proxy lite files need a free
account and the ip2location lite terms, including the attribution acknowledgment,
so they are only ever read from disk.

## decision service

[`payout-signal-check.mjs`](payout-signal-check.mjs) runs at payout onboarding and
payout request and nowhere else. it records one reviewable decision per submission
id. the decision is evidence, not an account action. the market only selects which
checks are mandatory: it is read for the policy and then discarded, and is not
stored, returned, or passed to a lookup.

| situation | outcome | reason code |
|---|---|---|
| mandatory check positive (strict market) | `needs_review` | `proxy_detected`, `vpn_detected`, ... |
| mandatory feed unavailable or adapter down | `needs_review` | `feed_unavailable` |
| mandatory check not evaluated (ipv6, private address) | `needs_review` | `coverage_unavailable` |
| device collection failed or missing, any market | `needs_review` | `collection_unavailable` |
| everything evaluated and clean | `pass` | none |

`fail` is produced only where a policy row sets `positive_outcome = 'fail'`, and
only for a real positive. an outage is never a fail. a positive outside the
mandatory set, in a non-strict market for example, is recorded as evidence and does
not gate.

what the payout workflow must do with the result:

- `pass`: continue.
- `needs_review`: hold the payout step for a person. this is not a rejection.
- `fail`: not produced by the v1 seed. if a policy ever enables it, treat it as a
  stronger hold, not an automatic ban.
- a thrown `PolicyUnavailableError` or `CheckNotRecordedError`: nothing was
  decided. hold and retry with the same submission id. never treat it as a pass and
  never as a user failure, because it is our outage.

the service rejects any input field it does not know, so a caller cannot supply an
outcome, a trust value, a policy, geography, or a provider result. a repeat of a
known submission returns the stored decision without recomputing, so a retry is
safe even if a feed changed state in between. the same submission id with a
different device, address, creator or moment is refused.

[`db-ports.mjs`](db-ports.mjs) implements the policy store and recorder over any
`query(sql, params)` function. it imports no driver and uses only parameterized sql.

## storage

[migration 0011](../../migrations/0011_payout_signal_evidence.sql) adds three
tables in the private `sculptura_private` schema.

| table | holds | lifetime |
|---|---|---|
| `creator_signal_events` | keyed device hash, keyed ip digest, key id, bounded features | purged after 12 months |
| `payout_signal_decisions` | outcome, reason codes, flags, source attribution | append-only, kept |
| `payout_signal_policy` | per-market mandatory checks, keyed by iso alpha-2 | reviewed migrations only |

there is no column for a raw fingerprint, a plaintext ip, a country, or a
corridor on the evidence tables. stored features are a closed shape enforced by
a check constraint. the policy table is check-selection configuration, not a
subject record. `npm run check:trust-geography` fails if a trust table or a
signal evidence table gains a geography-like column, or if a foreign key links
trust and signals.

clients have no write path. the server records a check through
`record_payout_signal_check`, executable by `service_role` only, which is atomic
and idempotent per submission id. admins read through
`admin_get_payout_signals` or the admin-only rls policies.

## commands

```text
npm run validate:signal-sources     # source ledger has license, terms, boundary
npm run check:signals-hygiene       # no provider databases, no secret-shaped values
npm run check:trust-geography       # no geography in trust or signal evidence schema
npm run test:signals-and-ip-intel   # all signals tests, offline, fixtures only
```

tests never make a network request. feed refresh is an out-of-band step and is
not part of any test.
