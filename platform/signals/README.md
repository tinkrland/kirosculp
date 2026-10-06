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

## commands

```text
npm run validate:signal-sources     # source ledger has license, terms, boundary
npm run check:signals-hygiene       # no provider databases, no secret-shaped values
npm run test:signals-and-ip-intel   # all signals tests, offline, fixtures only
```

tests never make a network request. feed refresh is an out-of-band step and is
not part of any test.
