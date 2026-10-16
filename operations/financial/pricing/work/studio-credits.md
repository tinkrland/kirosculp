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
     until month-end for their first refill. the reset lands at
     11:59 utc on the anniversary day - the day is theirs, the clock
     is the platform's; the exact minute they subscribed is never
     carried over
2. **general credits** (any usage, burned after grants, nearest
   expiry first):
   - monthly plan credits, per tier, expire 2 months after issue
     (lovable-style soft rollover) while the creator stays on a
     paid plan
   - **downgrade rules (ruled 2026-10-16)**: the runway is clipped
     by the tier change, never extended:
     - stay paid: 2 months from issue
     - downgrade to a lesser paid plan: outstanding plan credits
       expire 1 month from the downgrade date
     - downgrade to free: outstanding plan credits expire 15 days
       from the downgrade date
     - free tier: use-it-or-lose-it. free grants never roll; the
       month-end reset (last day, 11:59 utc) already wipes them
   - top-up packs bought from the creator wallet, 12-month expiry,
     unaffected by tier changes (they were paid for in cash, not
     granted)
   - auto top-up setting on paid tiers, pausable like lovable's

   two invariants make the ladder safe: expiry attaches to the
   credit (issue-based), so a tier change only ever clips the
   runway of outstanding credits, never upgrades old credits to new
   terms; and rate caps stay per current tier, so a downgrader
   burning 15-day runway credits still cannot burst past the free
   tier's caps - same principle as the byok ruling. burn order
   unchanged: grants first, then general credits nearest-expiry
   first, then wallet top-ups.

## the per-tier rate limit matrix (ideated, hypothesis)

lovable-style: each usage type gets its own monthly allowance per
tier, plus a general credit pool that covers any usage after grants.
every clock is monthly (ruling); free resets month-end, paid on the
anniversary day, both at 11:59 utc.

| tier | tessa turns/mo | compiles/mo | releases/mo | renders/mo | general credits/mo |
|---|---|---|---|---|---|
| free | 30 | 50 | 8 | 20 | 0 |
| starter | 100 | 150 | 20 | 50 | 300 |
| lite | 200 | 300 | 40 | 100 | 600 |
| standard | 350 | 500 | 75 | 175 | 1000 |
| pro | 600 | 900 | 150 | 300 | 1800 |

presentation as cfo.ai-style multipliers: starter is the 1x
baseline; lite 2x, standard 3.5x, pro 6x compute.

burn order per ruling: usage-type allowances first (each covers only
its own action), then general credits (nearest-expiry first), then
wallet top-ups. overage is a soft stop showing the honest paths:
wait for the reset, or (tessa only) byok - which bills the creator's
provider but never lifts the turn cap, per the free-tier ruling: the
cap counts turns because server-side parsing and integration happen
either way.

worst-case platform exposure if every allowance is consumed
(direct-cost basis, general credits at a blended $0.03/credit):

| tier | worst-case cost/mo | price/mo |
|---|---|---|
| free | $2.44 | $0 |
| starter | $16.60 | $12.99 |
| lite | $33.20 | $19.99 |
| standard | $56.50 | $24.90 |
| pro | $100.50 | $29.99 |

every paid tier is loss-making only at 100% allowance burn, which is
the standard saas bet: allowances are sized for typical usage, and
the design goals are (a) free creators can complete several designs
end to end, (b) paid tiers have visibly roomy capacity, (c) the
platform's per-tier downside is bounded. typical consumption is
expected in the 10-30% band of allowances.

## platform-served inference per tier (open ruling)

byok.md pins the creator-side surface completely: the probe is the
only gate, and the tested-against lanes are openai flagship
multimodal + mini (legacy gpt-4.1), anthropic sonnet/haiku, google
gemini pro/flash (flash named the budget lane), deepseek chat,
mistral flagship/pixtral, and self-hosted qwen-vl/llama vision. what
the repo does NOT pin is which lane the platform itself serves to
non-byok creators. hypothesis, in the spirit of that table:

- backtier means nano-class models: gpt-5-nano, gemini flash and
  peers - the chatgpt product pattern, where tier one and two get
  free metered access to the small models and bigger models are the
  paid perk. sculptura follows that gating shape but on monthly
  clocks (ruled), never daily:
  - free + starter: nano/flash class served (gpt-5-nano, gemini
    flash), ~$0.01-0.05/turn, matching the buildup's $0.05 cost basis
  - lite + standard: mini class served as the quiet perk
  - pro: mini or standard class, tuned with the same regression
    harness as the backtier lanes
  ~$1.50/mo worst case per free creator; exact serving model per
  tier stays an open ruling, gated by the regression harness
- paid tiers may serve the recommendation lane (flagship multimodal)
  as a quality differentiator, or stay on the budget lane uniformly
- the envelope makes any choice safe (paracraft consumes typed
  parameter state, never model output); the choice is quality and
  cost, not safety
- a mixed serving lane (free = budget, paid = flagship) must never
  change credit costs or rate limits - it changes only which model
  answers

which exact lane each tier serves is an open ruling; this section
exists so it gets made deliberately instead of by accident.

the deeper thesis (owner, 2026-10-15): the platform is only as
strong as how well the engine works with **backtier models** - the
opposite of frontier; the cheap/budget/free lanes. this is not a cost
compromise, it is the architecture: tessa emits a typed, bounded
parameter proposal parsed against the envelope before a creator ever
sees it, and paracraft consumes typed parameter state only. a weak
model can propose worse values, never unsafe ones. so the engine
must be tuned, tested and regression-run against backtier lanes as
the primary target, with frontier lanes as upside - the reverse of
most agent products, which lean on frontier intelligence and treat
budget models as degradation. sculptura's intelligence budget lives
in paracraft's deterministic rules, not in the model.

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
