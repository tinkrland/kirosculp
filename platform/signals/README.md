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
