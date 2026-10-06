# signals-and-ip-intel results

**implementation period:** october 6, 2026
**branch:** security (origin/security, pushed through commit 2aab55d)
**status:** all seven batches implemented and verified locally; no live
provider, no live supabase mutation, no real payout.

## objective

add creator identity and network signals for payout fraud control at exactly
two money moments (payout onboarding, payout request), under the owner's six
gate 0.1 rulings, without letting geography enter trust computation at any
layer. the spec and its rulings live on the `agent-instructions` branch at
`.kiro/specs/signals-and-ip-intel/`.

## gate 0.1 rulings (owner, 2026-10-06), as implemented

1. strict-corridor vpn/proxy positive: `needs_review`, seeded in
   `payout_signal_policy.positive_outcome`. `fail` is per-market configurable
   and was exercised in a test but not enabled in the v1 seed.
2. mandatory feed unavailable: `needs_review` with reason `feed_unavailable`.
   implemented in `evaluateChecks` (payout-signal-check.mjs); never a silent
   pass, never a hard fail for the service's own outage.
3. thumbmark consent and collection failure: plain-language, non-blocking
   disclosure text in `collector.mjs` (`DISCLOSURE`); a failed or missing
   collection is `needs_review` with reason `collection_unavailable`.
4. rail key: the check-policy configuration is keyed by iso 3166-1 alpha-2,
   matching `markets[].market` in `operations/country-rollout/creator-payout-rails.json`.
   a test cross-checks every policy market against that file.
5. admin visibility: `admin_get_payout_signals` returns decisions (reason
   codes, flags, source attribution) and stored device features, admin-only,
   following the 0009/0010 pattern. raw payloads are purged by design, not by
   redaction.
6. hashing and retention: hmac-sha256 with a server-held key, a key id on every
   hash row (`key-ring.mjs`), 12-month purge of signal events via a
   service-only function. decision records are append-only and are not purged.
   hash-chain treatment is a recorded follow-up, not implemented here.

## gate 0.2 correction (recorded before implementation, carried through code)

the first spec draft assigned proxy, vpn and tor flags to ip2proxy lite. the
lite edition lists open proxies only; vpn, tor exit and datacenter data are
commercial-edition fields. the corrected v1 mapping, implemented in
`ip-intelligence.mjs` and `feeds.mjs`:

| flag | v1 source | ipv4 | ipv6 |
|---|---|---|---|
| proxy | ip2proxy lite (open proxies) | full | full |
| vpn | x4bnet `output/vpn/ipv4.txt` | full | none |
| datacenter | x4bnet `output/datacenter/ipv4.txt` | full | none |
| tor | tor bulk exit list | full | none |

a flag with coverage `none` is stored as `value: false, coverage: 'none'` and
is never treated as evidence of a clean address. a mandatory check with no
coverage for the address resolves to `needs_review` with reason
`coverage_unavailable` (consequence of ruling 2, flagged for owner
confirmation in the spec; implemented as specified, not independently
resolved).

## what was built, by batch

| batch | commit | contents |
|---|---|---|
| 1 | aacf3fd | source ledger entries (src-0021..0025), `check-signals-hygiene.mjs`, `validate-signal-sources.mjs` |
| 2 | f2fc7c6 | migration 0011 (3 private tables, 1 write function, 1 purge function, 1 admin rpc), `check-trust-schema-invariant.mjs` |
| 3 | 38b5474 | `key-ring.mjs`, `device-processor.mjs`, `collector.mjs` |
| 4 | 3e58bc7 | `ip-intelligence.mjs`, `feeds.mjs`, `import-feeds.mjs`, `scripts/import-ip-feeds.mjs` |
| 5 | ab960fa | `payout-signal-check.mjs`, `db-ports.mjs` |
| 6 | 2aab55d | `payout-gate.mjs` |

all six are on `origin/security` as of this writing (verified by
`git ls-remote origin security` matching local `HEAD`).

### private schema (migration 0011)

three tables in `sculptura_private`, none with a market, country, region or
corridor column:

- `creator_signal_events`: keyed device hash, keyed ip digest, key id,
  collection status, bounded device features. purged after 12 months by
  `sculptura_private.purge_expired_signal_events()` (service_role only).
- `payout_signal_decisions`: append-only. outcome, reason codes, selected
  checks, network flags with source attribution, adapter version, policy
  version. no raw payload, no plaintext ip, not purged.
- `payout_signal_policy`: the one table that carries a market code, as
  check-selection configuration. seeded `v1`: `DEFAULT` with no mandatory
  checks; `IN`, `PK`, `BD` with `proxy` and `vpn` mandatory, `positive_outcome
  = needs_review`.

writes go through `public.record_payout_signal_check` (service_role only,
atomic, idempotent per submission id). reads go through
`public.admin_get_payout_signals` (admin role required) or direct admin-only
rls policies.

### geography invariant

`check-trust-schema-invariant.mjs` inspects the built schema and fails if any
trust table or signal evidence table has a geography-like column, or if a
foreign key links a trust table to a signal table. it is exercised by tests
that inject a throwaway `corridor` column and a throwaway foreign key and
confirm the check catches both, then confirm it is clean again after cleanup.

### device signal

`collector.mjs` takes the thumbmarkjs constructor by injection; this repo
takes no browser dependency. reading the published `@thumbmarkjs/thumbmarkjs`
1.12.0 package (not just its typings) surfaced three things the original brief
did not anticipate:

- by default the library samples 0.01% of runs to `api.thumbmarkjs.com` and
  may fetch a script from `experimental.thumbmarkjs.com`. the collector forces
  `logging: false` and `collect_beacon: false` and sets no `api_key`.
- its `permissions`, `locales` and `speech` components read camera/microphone/
  geolocation permission state, timezone/language, and the installed voice
  list. all three are excluded on the client and again on the server
  (`device-processor.mjs`), because they are sensor-adjacent or geography
  proxies, not because the brief listed them.
- its `webrtc` component in this version reads codec and extension lines only
  and leaks no ip address; the processor still drops any `webrtc` component
  that contains one, as a defensive measure, and distinguishes that from a
  reduced chrome user agent (`Chrome/120.0.0.0`), which is not an ip address.

`device-processor.mjs` allowlists ten components, canonicalizes them, hashes
with hmac-sha256 under a server-held key (`key-ring.mjs`, key id recorded,
quarterly rotation helper), and extracts a closed-vocabulary feature set
(automation and inconsistency indicators). the raw payload is disposed after
processing and is never logged or echoed in an error.

### ip intelligence

`ip-intelligence.mjs` defines the port and the free adapter. callers never see
a vendor field name; `assertIpIntelligenceResult` rejects any adapter result
that is unattributed or claims a positive with coverage `none`. `feeds.mjs`
loads feed files from a gitignored directory, validated by a manifest
(sha-256, retrieval date); a missing, tampered, truncated, garbage, future-
dated or stale feed loads as unavailable, never as clean. `import-feeds.mjs`
stages, validates with the same loader the service uses, and swaps only on
success, so a bad download never replaces a working feed set.

list formats were checked against the live x4bnet files on 2026-10-06 (one
ipv4 cidr per line; 11,271 vpn ranges, 44,365 datacenter ranges). the ip2proxy
lite csv layout came from its documented field table, not a downloaded file,
because that database needs a free account.

### decision service and gate

`payout-signal-check.mjs` runs only at the two money moments, rejects any
input field it does not recognize (so a caller cannot supply an outcome, trust
value, policy, geography, or provider result), and is idempotent: a repeat of
a known submission returns the stored decision without recomputing, even if a
feed's state changed between the two calls. `payout-gate.mjs` is the http-
shaped contract: it derives the creator from the session, the market from the
creator's verified payout record (never the request body), and the client
address from a trusted-proxy-hop rule (never the leftmost, client-controlled
`x-forwarded-for` entry). it tells the browser only `continue` or `review`,
never a reason, flag, source or market.

## test evidence

```text
npm run test:signals-and-ip-intel   -> 200 passed, 0 failed
npm run validate:signal-sources     -> 5 signals entries valid of 25 total
npm run check:signals-hygiene       -> clean, no provider database files or secret-shaped values
npm run check:trust-geography       -> holds, 6 trust tables + 2 signal evidence tables, 0 violations
npm run test:creator-trust          -> 63 checks passed (unaffected by this leg)
npm run test:buyer-trust            -> 66 checks passed (unaffected by this leg)
node scripts/denial-matrix-executor.mjs (via its exported function)
                                     -> 63/63 denial-matrix cells pass with 0011 in the replay chain
node scripts/validate-data-contracts.mjs, validate-offerings.mjs, validate-research.mjs
                                     -> all pass
python scripts/validate-jsonl.py    -> all jsonl files valid, including the extended source ledger
python scripts/normalize-prose.py --check
                                     -> 6 violations, unchanged from before this leg (not introduced by it)
```

test breakdown by file (200 total):

| file | tests |
|---|---|
| sources.test.mjs | 12 |
| schema.test.mjs | 29 |
| device.test.mjs | 26 |
| collector.test.mjs | 11 |
| device-persistence.test.mjs | 7 |
| ip.test.mjs | 27 |
| import.test.mjs | 12 |
| service.test.mjs | 37 |
| service-db.test.mjs | 17 |
| gate.test.mjs | 22 |

every file has both positive and negative cases. the exhaustive sweep in
`service.test.mjs` checks 600 combinations of coverage, availability, value,
collection status and policy outcome and confirms the single invariant: no
unevaluated or positive mandatory check ever resolves to `pass`.

### mutation checks

beyond the committed tests, deliberate single-line bugs were injected into
throwaway copies of the two most safety-critical modules and run against
copies of their real test files, to confirm the tests actually fail when the
behavior they claim to check is broken:

- `payout-signal-check.mjs`: 6 mutations (removing the coverage-unavailable
  reason, letting an outage configure `fail`, removing the money-moment gate,
  accepting unknown input fields, ignoring a feed outage, skipping the replay
  comparison). all 6 caught.
- `payout-gate.mjs`: 7 mutations (trusting the leftmost `x-forwarded-for`
  entry, accepting a creator id from the body, leaking reason codes to the
  browser, guessing a market, loosening route matching to a prefix, turning a
  service failure into `continue`, skipping authentication). all 7 caught.

these scripts and their generated files were temporary and are not part of
the committed change.

## verified locally

- all 200 signals tests pass, including role-based access tests run as
  `anon`, `authenticated` (non-admin and admin), and `service_role` against the
  real cumulative pglite schema.
- the 63-cell denial matrix from the security-containment leg still passes
  with migration 0011 added to the replay chain: no regression.
- the geography invariant holds and is proven to actually detect a violation
  (not a vacuous pass), both for a corridor column and for a trust-signal
  foreign key.
- no raw device payload, plaintext ip address, or vendor-specific field name
  was found anywhere in the database after exercising every code path,
  confirmed by a full-schema text scan with a positive control.
- 13 injected mutations across the two most sensitive modules were all caught
  by the existing test suite.
- the source ledger documents license, update terms and a boundary for every
  external data source actually used (thumbmarkjs, geolite2, ip2proxy lite,
  x4bnet, the tor bulk exit list), and a script enforces that shape going
  forward.
- no provider database file or secret-shaped value exists anywhere in the
  repository, enforced by a script.
- all six implementation commits are on `origin/security` (verified against
  the remote, not assumed from a local push exit code).

## blocked

- **live supabase deployment of migration 0011.** not performed by this
  session. local pglite replay only, per the security-containment leg's
  established boundary.
- **live provider lookups** (a real geolite2, ip2proxy, or tor connectivity
  check from this environment). not performed; all tests use committed
  fixtures and a loopback http server for the importer's network-handling
  tests.
- **a real payout.** no payment, transfer, or payout provider call exists in
  this leg. `payout-gate.mjs` is a contract for the leg that owns the actual
  payout surface.
- **python's `validate` entry point** (`npm run validate`) calls `python3`,
  which does not exist on this windows installation (only `python`, pointing
  at 3.11.1, and a separate incompatible `C:\Python27`). the individual
  python scripts were run directly with `PYTHONUTF8=1` instead; the aggregate
  `npm run validate` command itself was not exercised end to end.
- **`scripts/denial-matrix-executor.mjs`'s own cli entry point** does not run
  on this windows node install: its `import.meta.url === file://${process.argv[1]}`
  guard never matches because `process.argv[1]` is not url-encoded the same
  way. it was run through its exported `executeDenialMatrix()` function
  instead, which is unaffected and produced the result above. this is a
  pre-existing issue in that script, not introduced by this leg, and is noted
  here because it would otherwise look like the matrix was skipped.

## deferred

- **the geolite2 reader.** the port accepts a geo source, but no reader was
  written: parsing `.mmdb` needs an additional dependency, and nothing in the
  enforcement path at payout onboarding or payout request uses geo. geo is not
  persisted in v1 at all (resolution 7 in design.md), which is a stricter
  reading of the geography invariant than strictly required but was judged
  the safer default.
- **a commercial feed integration** (maxmind anonymous ip, ipinfo privacy
  detection, or the ip2proxy commercial edition) to close the ipv6 coverage
  gap for vpn, tor and datacenter. the adapter boundary and a contract-tested
  stub exist (`stub-commercial-adapter.mjs`); no real commercial account or
  integration was created.
- **feed staleness limits** (tor 48 hours, x4bnet 14 days, ip2proxy lite 45
  days) are operational defaults chosen during implementation, not owner
  rulings. they should be reviewed against real feed update cadence before
  live use.
- **the `coverage_unavailable` consequence for ipv6 traffic in a strict
  market.** implemented exactly as the spec's open item describes
  (`needs_review`), but the spec itself flags this as needing owner
  confirmation once real traffic volume is known, since it may route a
  nontrivial share of strict-market ipv6 requests to manual review.
- **the hash-chain treatment for decision records**, already ruled for
  dispute evidence elsewhere, is recorded as a follow-up and not implemented
  here.
- **actual wiring into a platform payout endpoint.** no payout onboarding or
  payout request route exists yet in product code (only in the `what-exists`
  legacy snapshots). `payout-gate.mjs` is the contract; the platform/operations
  leg that owns the real payout surface must call it.
- **a typescript port.** production target is typescript/node, but this repo
  has no typescript toolchain configured. the implementation is es modules
  with jsdoc types; the exported shapes are the contract for a future port.

## deployment and payment state

migrations through 0011 are verified locally against pglite only. no
migration in this leg was applied to any live supabase project. no live ip
provider was called. no real payout, transfer, or payment occurred at any
point in this implementation or its verification. implementation, local
verification, and live operation remain three separate claims, and only the
first two are made here.
