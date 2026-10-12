# fee balance analysis: fair rate, retro payback, exorbitance line

status: analysis, 2026-10-12. every number below computed and verified in
local python from the model inputs (fee-model-snapshot.md, fee-policy.md).
inputs are the repo-grounded assumptions; the measure-first list in
fee-policy.md section 11 still governs what stays fiction.

## inputs (all from the model tables, repo-grounded)

- retro: $5,600 ($4,800 founder labor + $800 tools). the model rounds the
  retro line to $6,000 for amortization; this analysis uses $5,600 as the
  repayment target.
- per-order direct cost stack: support $6.00, quote api $0.25, routing
  compute $0.02, failed payment blend $0.10, tell checks $0.01, chargeback
  tail 0.75% of retail, payout coordination $0.50.
- ongoing fixed: infra $60/mo; per-creator fixed $10/mo + kyc $0.50.
- fee shape: rate + $0.50 fixed, $2.00 floor, applied to fee_base
  (retail minus shipping minus insurance; shipping $8 domestic,
  insurance 1.5% min $1).
- launch metal mix (model): sterling 60% at $140, 14k 15% at $650,
  bronze 25% at $95 -> blended aov $205.


## 1a. what the fee actually funds: the creation stack (the framing that matters)

the comparable-band framing in section 4 understates the product.
vgen/etsy require the creator to bring the artifact: finished artwork,
ready to list. sculptura requires an idea. that is the whole
difference. etsy, redbubble and the pod marketplaces charge for a
listing surface and distribute work that already exists; sculptura's
fee funds the entire creation stack that turns the idea into the
artifact:

- **paracraft**: the geometry compiler and deterministic validation
  engine. creators do not bring manufacturable files; the platform does
  the engineering (openscad compilation, castability validation,
  manufacturing-route parameters).
- **tessa**: the studio assistant that turns a person with ideas into
  someone who can produce a sellable object.
- the artist-to-creator progression itself: admission, studio,
  listing publication, buyer portal, manufacturing routing and
  hallmark compliance.

two differentiators sharpen the runway further:

- **parametric, not diffusion.** the engine is not an outsourced
  image-to-mesh diffusion service (tripo-class): outputs are
  deterministic, parametric openscad that is castable and validated
  against manufacturing routes. a diffusion mesh is a picture of
  jewelry; a parametric model is jewelry that can be manufactured,
  resized, re-alloyed and hallmarked. this is the platform's core
  determinism ruling expressed as a product moat: no competitor gets
  castable-parametric for free.
- **free inference and listings.** the free tier already includes a
  monthly inference allowance plus listing publication. the paid
  comparables charge for cad seats and listing slots separately;
  sculptura bundles them into the fee instead of the subscription.

the fee is not a marketplace toll on someone else's finished product;
it is the only revenue line for the machine that makes the product
possible. what that stack would cost a creator to buy instead
(retrieved 2026-10-12):

- matrixgold (jewelry cad standard): $5,995 license from may 2026, on
  top of a required rhino license (~$995), or a subscription around
  $200-300/month.
- ruby kinglet studio (the newest ai-jewelry-cad saas comparable):
  $179/month, $125/month billed annually.
- sculptura's studio tier: $15/month ($180/yr); the free tier: $0.

so at 10% + $0.50, sculptura prices the full creation-plus-compliance
stack at marketplace-toll level. the earlier "we match etsy effective"
reading was the wrong frame: same headline number, materially more
product. that is the "runway": the fee carries the engine, not just the
order.

the break-even target question: the repo hours audit (work/hours-audit.md,
rev 2, 2026-10-12) counted the committed work across the five current
repos plus the deprecated kqrla prototype repos after dropping
duplicates: 631 commits, **111 hours** (85-140 range). at the ruled
$24/hr + $800 tools that is **~$3,472**; at defensible market rates
($30-50/hr replacement-cost band, anchored in the audit) it is
$4,140-$6,367. the ruled retro ($5,600) sits inside that band, so it
stands as the valuation of committed work plus the founder time the
repos cannot show (direction, review, research, setup). no restatement
needed; an internal-rate change is an owner ruling, and the audit's
rate table prices the options. separately, the rev-3 content audit
values the built corpus (778k words of prose, 218k LOC, 107k data
lines, content-deduped) at ~6,200 human-equivalent hours: ~$149k
replacement cost at the ruled $24/hr, $250k-$311k at market rates.
that valuation is not the retro target; it is the fee's value basis:
the fee amortizes a six-figure-to-reproduce platform across the
platform's life.

## 1. cost recovery: the fee's honest floor

what rate just covers the per-order stack (no retro, no infra, no profit):

| aov | direct stack | stack as % of retail | cost-recovery rate |
|---|---|---|---|
| $60 | $7.33 | 12.2% | 13.4% |
| $95 | $7.59 | 8.0% | 8.3% |
| $120 | $7.78 | 6.5% | 6.6% |
| $200 | $8.38 | 4.2% | 4.2% |
| $250 | $8.75 | 3.5% | 3.5% |
| $400 | $9.88 | 2.5% | 2.4% |
| $650 | $11.75 | 1.8% | 1.8% |

the stack is nearly flat in dollars (support $6 dominates) but collapses as
a percentage: cheap orders are structurally expensive to serve. this is the
quantified core of the cheap-order problem flagged in the model: at $60
retail the platform cannot cover its costs at any fee a buyer would accept.
the correct instrument is the floor plus honest refusal economics, not a
higher headline rate.

## 2. contribution per order at candidate rates (before infra/creator fixed)

| aov | 6% | 8% | 10% | 12% | 15% |
|---|---|---|---|---|---|
| $95 | -$1.96 | -$0.25 | +$1.47 | +$3.18 | +$5.74 |
| $120 | -$0.67 | +$1.54 | +$3.74 | +$5.94 | +$9.25 |
| $200 | +$3.46 | +$7.24 | +$11.02 | +$14.80 | +$20.47 |
| $250 | +$6.04 | +$10.80 | +$15.57 | +$20.34 | +$27.48 |
| $400 | +$13.78 | +$21.50 | +$29.22 | +$36.94 | +$48.52 |
| $650 | +$26.68 | +$39.33 | +$51.97 | +$64.61 | +$83.58 |

## 3. retro payback: months to repay $5,600 at 10% + $0.50

includes infra $60/mo and 20 active creators at $10.50/mo:

| orders/mo | aov $120 | aov $200 | aov $250 |
|---|---|---|---|
| 25 | never (below operating break-even) | ~85 years | 47 months |
| 50 | never | 20 months | 11 months |
| 100 | 54 months | 7 months | 4.4 months |
| 200 | 12 months | 2.9 months | 2 months |

reading (retro ruled 2026-10-12): the owner ruled the retro at
300h x $28 + 600h x $20 + $800 tools = $21,200. payback at the
launch metal mix: ~7-38 months across 50-200 orders/mo (aov $200-250).
the retro target never enters the fee rate; it sets the payback
horizon the plan carries. payback is bound by
volume and aov, not by the headline rate: moving 10% -> 12% shortens
payback by a third or more (20 -> 11 months at $200 aov, 50 orders/mo)
while pushing the fee outside the fair band (section 4). the retro is a
one-time $5,600; it does not justify a permanent rate increase, only
patience or a subscriber mix shift.

## 4. the fair band and the exorbitance line

anchors (fee-policy.md section 2 comparables):

- vgen: 5% on labor, the pro-artist anchor.
- gumroad: 10%.
- etsy effective: ~13.2% (10% fee + payment + $0.20 listing), plus its
  offsite-ads surcharge can push 15%+.

sculptura's total buyer-side friction at 10% + $0.50 fee plus payment
pass-through is ~13.2-13.5%, matching etsy's effective level while
adding the creation stack (section 1a): the engine that makes the
creator, manufacturing routing, hallmark compliance and two-way
pricing transparency etsy does not offer. verdict:

- **below ~6.5% at launch aov mix**: below cost recovery; the platform pays
  to serve orders. not generous, just underwater.
- **8-10% + $0.50**: the fair band. covers the stack with modest margin,
  matches the comparable set, funds the risk pool.
- **12%**: above every creator-comparable in the set except etsy's
  offsite-ads worst case. the creation-stack argument gives it more
  headroom than a pure marketplace would have (the fee funds a
  $2-7k-replacement toolchain), so it is defensible later with a visible
  value story, but not at launch: a platform that charges creators for
  the engine before the engine has public proof is selling software on
  spec. channel surcharges stay pass-throughs, not rate.
- **15%**: exorbitant for a pro-artist positioning; this is the number the
  placeholder launch-era P&L used as a take rate and it should be retired
  from every document.

the subscription ladder is the release valve: 7% (studio) and 5%
(platform tier) converge to the vgen anchor for committed creators,
satisfying the pro-artist direction without touching the ruled-out
trust/volume/geography levers.

## 5. what actually moves the balance (the delicate part)

1. **support cost per order ($6) is the single biggest assumption in the
   stack** - bigger than the fee-fixed and the retro combined at low aov.
   a $4 support cost moves the cost-recovery rate at $120 from 6.6% to
   4.9%. measure it before touching the rate.
2. **aov mix**: blended aov $205 makes 10% comfortable; a bronze-heavy mix
   drags it toward the cheap-order problem. the house line and 14k+ pieces
   are the margin protectors.
3. **volume**: operating break-even at $200 aov is ~25-30 orders/mo
   (against infra + creator fixed). below that, the platform loses money
   at any fair rate; that is a launch runway fact, not a fee decision.
4. **subscriber share**: each studio subscriber adds $15/mo plus
   (displacement of fee revenue - 3 points on their gmv). at ~$500/mo
   gmv a studio subscriber nets the platform roughly the same as the
   discount costs; above that the platform trades fee for stickiness.

## 6. recommendation (still a hypothesis until measure-first completes)

hold 10% + $0.50 with the $2 floor as policy v1. do not amortize the
retro into the rate (it is a one-time cost; a permanent rate increase to
cover it is exactly the hidden-margin pattern the policy rejects). the
creation-stack story belongs in the pricing page, not the rate: creators
should see what the fee funds (the engine, the routing, the compliance) and
what the same toolchain costs to buy outright. the retro is ruled: 300h at $28 + 600h at $20 + $800 tools = $21,200
(hours-audit.md); it sets the payback horizon the plan carries, not
the fee. revisit the rate only with
the first 100 real orders, per fee-policy.md section 11.
