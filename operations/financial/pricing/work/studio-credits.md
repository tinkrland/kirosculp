# studio credits: one unified meter for platform compute

status: work draft, 2026-10-13. external patterns (lovable, cfo.ai) are
references only, never repo evidence. all allowance numbers are
hypothesis until the owner rules them.

## what the meter prices

one unified credit currency covers every platform-compute action in
the studio, mirroring how lovable unifies chat, build, cloud and AI
gateway usage under credits, and how cfo.ai bundles "standard AI
usage" per plan with tier multipliers (growth = 4x startup).

for sculptura the metered actions are:

| action | credit cost | platform dollar basis |
|---|---|---|
| tessa turn (vision + proposal) | 1 | ~$0.05 inference |
| paracraft preview compile | 1 | ~$0.01 compute (12-53 ms) |
| paracraft export (release recompile) | 2 | ~$0.01-0.05 (108 ms - 18.7 s worst case) |
| studiogram render shot | 1 | ~$0.01 |

costs are fixed per action type, not per complexity. lovable prices
build complexity judgmentally ("about 0.50 credits for a tweak");
sculptura stays deterministic: the same action always costs the same
credit, the same paracraft inputs always compile to the same verdict.
no per-creator judgment enters the meter, same rule as the fee.

## where credits come from (lovable's division, adopted)

1. **usage-specific grants** (burn first, restricted to one usage
   type, monthly for every tier - ruled 2026-10-13, no daily clocks
   anywhere):
   - monthly tessa allowance, every creator
   - monthly compile allowance, every creator
   - paid tiers carry larger monthly grants
   - **reset clocks (ruled 2026-10-13)**: the free tier resets on the
     last day of the month at 11:59 utc (one platform-wide boundary,
     clean for capacity planning). paid tiers reset on the
     subscription's own anniversary day - anchored to when the
     subscription started, so a mid-month subscriber never waits
     until month-end for their first refill
2. **general credits** (any usage, burned after grants, nearest
   expiry first):
   - monthly plan credits, per tier, expire 2 months after issue
     (lovable-style soft rollover)
   - top-up packs bought from the creator wallet, 12-month expiry
   - auto top-up setting on paid tiers, pausable like lovable's

hypothesis allowance ladder (general credits/mo): free 0, starter
300, standard 600, pro 1200. monthly grants (hypothesis): free 30
tessa + 30 compiles/mo; paid tiers larger.

## byok interaction (ruled: zero markup, acceptable everywhere)

byok moves the tessa-turn cost to the creator's own key: a byok turn
costs 0 platform credits, bills their provider, never silently falls
back (byok.md). **the markup is zero**: the litellm gateway passes the
creator's provider rate through untouched - no platform margin, no
credit surcharge, no rounding in our favor. and byok is acceptable on
every tier including free: it is a first-class lane, not a hack. the
capability-probe gate stands (a key must prove it serves the models
tessa uses before it is accepted). compiles and release recompiles
are always platform compute and always metered, byok or not. so:

- free tier hitting the tessa grant has two honest paths: bring a
  key, or slow down. buying top-up tessa credits as a free creator
  is deliberately NOT the first prompt - byok is.
- paid tiers hitting grants burn general credits, then top-ups.

## byok never buys allowances, and free-tier limits stand (ruled
2026-10-13)

byok changes who pays the provider, never the envelope: it does not
increase the listing count, does not raise grants, and does not lift
the tessa turn rate limit. on the free tier the rate limit stands
even with a key attached, because every turn - byok or not - still
parses, validates and integrates server-side: the cap protects
platform capacity, not the inference bill. paid tiers carry higher
limits; same principle.

## overage behavior

soft stop at zero credits, never silent debt: the studio says which
grant ran out and shows the three paths (wait for reset, byok,
upgrade/top-up). the release gate is untouched - a creator with an
allowance can always finish and validate a design they already
started if it was started within allowance; the gate itself never
consumes credits.

## presentation (cfo.ai pattern)

marketing states allowances as tier multipliers where possible
("pro includes 4x starter compute"), pricing page shows the credit
cost of each action type next to the actions themselves, and the
wallet ledger (append-only, no double transaction fees,
creator-services.md) records every grant, burn, and top-up.

## open for ruling

- general credit counts per tier (300/600/1200 hypothesis)
- daily grant counts (3+3 free, 5+5 paid hypothesis)
- monthly tessa grant on paid tiers (30 hypothesis)
- top-up pack pricing ($ per 100 credits) and whether free tier
  can buy compile top-ups (recommended yes) vs tessa top-ups
  (recommended no, byok first)
- render shot pricing once studiogram export is real
