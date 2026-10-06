# signals-and-ip-intel results

**implementation period:** october 6, 2026
**branch:** security (batches 1-8 on origin/security through commit e3d04cf; batch 9 is the last section before test evidence)
**status:** all nine batches implemented and verified locally; no live
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
| 7 | 2615d29 | verification, results document, prose and hygiene checks |
| 8 | e3d04cf | embargoed-territory review hold, geolite2 reader, migration 0012 |
| 9 | see below | minor-creator park and parked-market hold ("not yet"), ratified settings, assigned reviewer |

batches 1 to 6 are on `origin/security` as of this writing (verified by
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

## batch 8: embargoed-territory review hold (owner addendum)

the owner addendum asked for one geography-aware rule and bounded it tightly.
what was built, and the decisions that shaped it:

- **the rule.** us rail, cu ip, everything else clean gives `needs_review` with
  reason `ip_geo_embargoed_territory` and the geo source recorded. it is
  evaluated inside `evaluateChecks` independent of `policy.mandatoryChecks`, so it
  runs in non-strict corridors too. it never yields `fail` by itself and never
  writes a trust record. a real mandatory positive configured as `fail` still can.
- **the list.** named config in `sculptura_private.embargoed_territory_review_list`,
  versioned, per-row `enabled`, admin-only. v1 seed: cu, ir, sy, kp. grey-listed
  markets cannot be added: a trigger rejects np, vn, bo, ve and ke, and
  `scripts/check-embargo-greylist-disjoint.mjs` reconciles the live list and the
  trigger against `creator-payout-rails.json`, failing on an empty list. the
  authority and effective date on each row are provenance, not a legal
  determination. the seed list is a starting point for the owner to revise.
- **geo contract change.** the port's geo shape is now
  `{ countryCode, subdivisionCode, coverage: 'full' | 'none', source }`. the old
  `available` boolean conflated "evaluated, no match" with "not evaluated" and was
  removed. `assertIpIntelligenceResult` validates geo, including a two-letter
  uppercase country code, and rejects a country beside coverage `none`.
- **missing geo.** a satellite range, an address with no record, a private address,
  an unreadable database or no geo source adds no reason and changes no outcome. a
  test asserts a clean rail and clean flags pass, and that the no-match result is
  recorded with attribution. the geo reader reads only `country`, not
  `registered_country`: a first draft fell back to registered country, which
  contradicts the ruling that a satellite range is no geo, and it was corrected
  before this commit.
- **pattern, not score.** `embargoed_territory_pattern` is a view with read-time
  counts. nothing is stored, so a one-off cannot permanently flag anyone. tests
  show a single hit and six months of hits are clearly different, that a new row
  shows up immediately, and that a hit older than any window leaves no trace in
  the next decision.
- **review outcomes.** `review-outcomes.mjs` allows `release` and
  `stranded_funds_hold`. every account action is rejected. no timer, expiry or
  clock exists in the service, gate, ports or outcomes, checked by a test, so a
  hold cannot become a fail by backlog.
- **dependency.** `maxmind@5.0.7`, pinned exact, mit, with mmdb-lib 3.0.3 (mit) and
  tiny-lru 13.0.0 (bsd-3-clause). ledger entry src-0026. no real `.mmdb` is used in
  any test; `open` is injected.
- **migration 0012.** adds the reason code to `valid_signal_reason_codes` (verified
  that `create or replace` updates existing check constraints), a `valid_geo_evidence`
  function, the `geo_evidence` column, the list table with admin-only rls, the
  grey-list trigger, the pattern view and `admin_get_embargo_pattern(uuid)`.
  `record_payout_signal_check` was dropped and recreated with a sixteenth argument,
  a deliberate breaking change.

two security findings came out of probing this in pglite, both now covered by tests:

1. a `security definer` function does not inherit the caller's rls, and a direct
   select on a plain view does not re-apply the base table's rls. the first draft
   of the pattern view would have been readable by any signed-in user. the view is
   now revoked from anon and authenticated, granted to service_role only, and the
   admin function is the only read path. a test proves anon, a non-admin creator and
   even an admin cannot select the view directly.
2. the geography invariant needed to permit a country on a decision without
   loosening it for trust tables. a table-level exemption was rejected. the checker
   now has an exact column allowlist containing only
   `payout_signal_decisions.geo_evidence`; emptying it makes the check fail.

batch 8 evidence:

```text
npm run test:signals-and-ip-intel   -> 247 passed, 0 failed (was 200)
                                       territory 37, geo-reader 9, ip 28 (one added)
npm run check:embargo-greylist      -> disjoint: 4 listed, 5 grey-listed markets all rejected by the trigger
npm run check:trust-geography       -> holds, 6 trust tables + 2 signal evidence tables
npm run check:signals-hygiene       -> clean
npm run validate:signal-sources     -> 6 signals entries valid of 26 total
npm run test:creator-trust          -> 63 passed
npm run test:buyer-trust            -> 66 passed
denial matrix via executeDenialMatrix() -> 63/63 with 0012 in the replay chain
```

batch 8 mutation checks (10 injected, all caught): territory check removed;
territory check made dependent on strict corridors; territory hold escalated to
`fail`; missing geo turned into a reason; a country on a coverage-none result still
matching; grey-list trigger removed; trigger missing ke; pattern view granted to
authenticated; review-outcome assertion disabled; invariant allowlist emptied. one
mutation first survived (a country on a coverage-none result), because the adapter
contract already forbids that shape. a direct test of `evaluateChecks` with the
malformed shape was added, and the mutation is now caught.

the minor-creator age gate and the parked-market hold flow (the faizah case) were
deliberately not built in batch 8, because the owner rulings were open. the rulings
landed afterwards and batch 9 builds them.

## batch 9: "not yet" (owner rulings, 2026-10-06)

four rulings landed after batch 8 (spec commit c3473b9). this batch builds the first
two, and records the last two.

**1. minor-creator park (jeremiah brown jr. fixture).** v1 is a pure park.
publication requires the age attestation. a minor's earnings accrue in the ledger
with no payout rail. payout onboarding returns `not_yet`, never `no`. payout unlocks
at 18 when the creator passes their own provider kyc. no parental payee, no parental
kyc, no third-party payout. the accrual is an ordinary `creator_payable` liability
with no special event type.

**2. parked-market hold (faizah aisler fixture).** a creator resident in a v2 parked
market publishes and earns, the balance accrues, and onboarding returns `not_yet`.
funds release when the market opens or the creator presents a bank rail in an
already enabled market, keyed by rail. this is roadmap state: no `needs_review`, no
trust input, no signal check.

what was built, with no migration (0012 is still the last):

- `payout-eligibility.mjs`: an evaluator with two outcomes, `proceed` and `not_yet`.
  age is checked first, so a minor is parked in every market, with or without a rail.
  then the rail market, then residence against the hold list. the rails matrix is
  read on every call, so an opened market lifts the hold with no code change.
- `parked-market-policy.mjs`: the hold list, named config, seeded with `SA` only.
- `payout-gate.mjs`: the gate now resolves the rail market, then asks the evaluator,
  and answers `not_yet` before the signal service runs. it requires two new
  dependencies, `resolveCreatorFacts` and `eligibility`, and refuses to be built
  without them, so the park cannot be skipped by omission. a rail lookup that throws
  is now a distinct hold (`market_lookup_failed`), where before it was folded into
  `market_unknown`. a creator with no rail yet is a normal state.
- `scripts/check-parked-hold-policy.mjs` (`npm run check:parked-hold`): fails on an
  empty list, a sanctions, grey-listed, out-of-scope or embargoed market, or a code the
  matrix does not know. a market that has opened is reported for cleanup and does
  not fail.

properties, each with tests:

- `not_yet` writes nothing: against the real schema and rails matrix, the counts of
  decisions, device events, trust rows and ledger entries are unchanged, even from an
  embargoed address.
- the two layers are independent: a parked-market creator who does present an enabled
  rail still gets the embargo review from a cu address, with reason
  `ip_geo_embargoed_territory`, and still writes no trust.
- the browser hears `{ status: 'not_yet' }` and nothing else. the server-side
  decision carries a cause. neither the body nor the telemetry carries an age, market,
  date, creator id or residence.
- an unreadable fact or matrix is a 503 hold, never a false `not_yet` and never a
  pass. a minor is still told `not_yet` when the matrix is unreadable, because the
  matrix is not needed to decide.
- the ledger is unchanged: the six existing accounts, no age or market column, an
  ordinary balanced group that credits `creator_payable`, and the service role still
  cannot edit an entry.

decisions i made that were not in the rulings, for the owner to confirm:

1. **the hold list is `SA` only.** the matrix parks 25 markets for very different
   reasons. ae, cr and uy are also v2 candidates. qa, bh and om are "gcc parked, no v2
   plan", where "not yet" may promise something the roadmap does not intend. tn, py, sn,
   tz, ug, bw, et, mz and na are parked for missing rails or signal. none of these were
   named, so none are on the list. a resident of an unlisted parked market gets the
   gate's existing hold (503) today, not `not_yet`. extending the list is a reviewed
   change, and the check script guards it.
2. **a missing age attestation is `not_yet`** (`age_attestation_missing`), not a
   pass and not a hold. publication requires one, so a creator without it is a data gap
   that should not pay out, and `not_yet` is the recoverable answer.
3. **a rail in a market the matrix does not enable is `not_yet`.** the matrix is deny
   by default. a sanctions or out-of-scope market is not on the hold list, so it is not
   promised a friendly park either.
4. **the attestation shape.** `{ status: 'adult' }` or `{ status: 'minor', majorityDate }`
   with the date they turn 18 as `yyyy-mm-dd`, compared in utc. a february 29 birth
   should be recorded as march 1 of the eighteenth year so the park never ends early.
   a majority date more than 18 years ahead is treated as invalid.

**3. staleness defaults are ratified.** tor 48 hours, x4bnet 14 days, ip2proxy lite
45 days and the geolite2 database 30 days are owner settings, not implementation
defaults. the readme, `feeds.mjs` and this document no longer call them defaults.
the planned real-traffic revisit is recorded in the open-items section below.

**4. the embargo-list reviewer is the owner,** quarterly and on major sanctions news
(ofac, un, eu). revisions land as reviewed migrations. recorded as assigned in the
open-items section below.

batch 9 evidence:

```text
npm run test:signals-and-ip-intel   -> 285 passed, 0 failed (was 247)
                                       eligibility 38 (new), gate 22, ip 28
npm run check:parked-hold           -> clean: 1 listed, none sanctioned, grey-listed or embargoed
npm run check:embargo-greylist      -> disjoint, unchanged
npm run check:trust-geography       -> holds, unchanged
npm run check:signals-hygiene       -> clean, includes the new script
npm run validate:signal-sources     -> 6 signals entries of 26
npm run test:creator-trust          -> 63 passed
npm run test:buyer-trust            -> 66 passed
denial matrix via executeDenialMatrix() -> 63/63
```

batch 9 mutation checks: 25 injected, all caught. they cover the age check removed,
the birthday off by one day, a minor let through with a rail, a missing or invalid
attestation passing, a rail in a disabled market proceeding, the hold applying to an
enabled rail, the hold ignoring an opened market, a matrix failure swallowed into
`proceed`, residence validation removed, `deny_by_default` not required, an
enabled-and-parked overlap allowed, the matrix cached, the gate not short-circuiting,
an outage turned into `not_yet`, the residence sent to the service as the market,
the cause leaked to the browser, a creator id in telemetry, a 403 for `not_yet`, a
failed rail lookup treated as no rail, `IR` added to the hold list, and the checker
losing each of its three rules. one mutation first survived (ignoring the enabled
check), because the loader already rejects a matrix with a market both enabled and
parked. a test with an inconsistent matrix was added, and it is now caught.

a flaky test was found and fixed along the way. `ip.test.mjs` asserted that 60,000
ranges parse in under 3 seconds. node runs test files in parallel, and that bound
failed at 3.0 to 3.1 seconds under load, three times in about eighteen runs, with correct output.
the bounds are now 20 and 15 seconds, enough to catch a quadratic parse. after the
change the full suite passed 8 of 8 serial runs.

## test evidence

figures in this section are the batch 1 to 7 record; batch 8 figures are above.

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
- **`python3` on this machine's path.** python 3.11 is installed at
  `%LOCALAPPDATA%\Programs\Python\Python311`, but that folder is not on `PATH`,
  and the only `python` and `python3` commands found are the microsoft store
  stubs in `WindowsApps`. `npm run validate` calls `python3`, so it fails here
  for an environment reason. this was first recorded as "python3 does not
  exist", which was imprecise. after batch 8, `npm run validate` was run end to
  end with a temporary `python3` shim on `PATH` for that one process, and the
  shim was deleted. the data-contract, offerings, research and jsonl
  validators passed, and the prose check reported the same 6 baseline
  violations, which make that command exit non-zero. the environment fix is to
  put the python 3.11 folder ahead of `WindowsApps` on `PATH` and give it a
  `python3.exe`.
- **`scripts/denial-matrix-executor.mjs`'s own cli entry point** does not run
  on this windows node install: its `import.meta.url === file://${process.argv[1]}`
  guard never matches because `process.argv[1]` is not url-encoded the same
  way. it was run through its exported `executeDenialMatrix()` function
  instead, which is unaffected and produced the result above. this is a
  pre-existing issue in that script, not introduced by this leg, and is noted
  here because it would otherwise look like the matrix was skipped.

## deferred

- **(built in batch 9) the minor-creator park and the parked-market hold.** the
  owner rulings landed and are implemented. what remains open is the surrounding
  product, none of which exists in the repo: capturing the age attestation at
  publication, reading residence from a creator record, wiring `resolveCreatorFacts`
  and `eligibility` into a real payout route, and the hold list beyond `SA` (owner
  decision, see batch 9). a parental-payee model is deferred to v2 pending counsel
  review, since child-earnings law varies by market.
- **a real geolite2 database run.** the reader is tested with an injected opener
  and placeholder files. it has never opened a real `.mmdb`, because that needs a
  maxmind account. the first real database should be checked with a few known
  addresses before relying on it.
- **assigned: the embargo list reviewer is the owner.** cadence is quarterly, plus
  on major sanctions news (ofac, un, eu). revisions land as reviewed migrations, as
  seeded. an automated sanctions-feed watcher may assist later; the named reviewer
  stays. the v1 seed (cu, ir, sy, kp) is unchanged. this item is assigned, not open.
- **planned revisit: the ratified ip settings.** the feed staleness limits and the
  geolite2 age limit are owner settings. they are parked for a review once real
  traffic volume exists. the revisit is expected, and it rides on the same trigger as
  the ipv6 `coverage_unavailable` revisit below.
- **(superseded by batch 8) the geolite2 reader** was deferred in batches 1 to 7
  and is now written. geo is persisted only as attribution on a decision.
- **a commercial feed integration** (maxmind anonymous ip, ipinfo privacy
  detection, or the ip2proxy commercial edition) to close the ipv6 coverage
  gap for vpn, tor and datacenter. the adapter boundary and a contract-tested
  stub exist (`stub-commercial-adapter.mjs`); no real commercial account or
  integration was created.
- **(ratified) feed staleness limits** (tor 48 hours, x4bnet 14 days, ip2proxy
  lite 45 days) are owner settings as of the 2026-10-06 ruling, no longer
  implementation defaults. the planned revisit is listed above. the limits should
  still be compared with the real feed update cadence when the first live import
  runs.
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

migrations through 0012 (batch 9 added none) are verified locally against pglite only. no
migration in this leg was applied to any live supabase project. no live ip
provider was called. no real payout, transfer, or payment occurred at any
point in this implementation or its verification. implementation, local
verification, and live operation remain three separate claims, and only the
first two are made here.
