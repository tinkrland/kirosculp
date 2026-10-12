# tier rate schedule vs the waterfall

status: work draft, updated 2026-10-12 (owner revision: free at 20%,
starter/lite/standard/pro ladder). what each tier's checkout fee
leaves in the revenue waterfall. model: tier-schedule.py
(deterministic, reproducible; every table here is its output).

## the ladder (owner ruling 2026-10-12, revised)

five tiers, each an integrated studio+platform subscription: one sub
covers both sides; the fee percentage is the checkout expression
(free creators pay the higher rate, subscribers lower). allowances
cap distinct active listings, never sales volume: a free creator's
5 listings can each sell unlimited units and the fee applies to every
sale. there is no sales cap at any tier.

| tier | price/mo | listings/mo | fee |
|---|---|---|---|
| free | $0 | 5 (ruled) | 20% + $0.50 (ruled) |
| starter | $12.99 (ruled) | 10 (hyp) | 16% + $0.50 (hyp) |
| lite | $19.99 (ruled) | 20 (hyp) | 14% + $0.50 (hyp) |
| standard | $24.69 (ruled; 24.99 recommended, see below) | 30 (hyp) | 12% + $0.50 (hyp) |
| pro | $29.99 (ruled) | 40 (hyp) | 10% + $0.50 (hyp) |

open rulings: fee % per paid tier, listing counts for paid tiers,
compile-credit counts per tier (the studio-side meter).

## why the prices are sound: the constant ~$300 break-even

the fee ladder is anchored to full-stack value, not to marketplace
tolls (owner direction: sculptura is not just etsy - the fee pays for
the free design studio, the storefront, routing, compliance; deep
discount cells like 5-8% undersell the stack). at the hypothesis
ladder (16/14/12/10), each subscription pays for itself at almost
the same monthly gmv:

| tier | discount vs free | break-even gmv/mo |
|---|---|---|
| starter | 4 pts | $324.75 |
| lite | 6 pts | $333.17 |
| standard | 8 pts | $308.62 (at $24.69) |
| pro | 10 pts | $299.90 |

the subscription story stays clean: "once your designs sell about
$300/month, any tier pays for itself; pick by catalog size." the
stack-value anchoring moves the constant break-even up from ~$250 to
~$300-330, which is also the more honest number given the sub buys
studio capacity plus storefront, not just a fee discount.
**$24.99 beats $24.69**: it completes the .99 charm pattern, and at
a 12% standard rate the break-even lands at $312.38, right in the
ladder's band; $24.69 is the one rung that breaks the pattern.

## the 20% free tier: positioning check

the earlier fairness analysis (8-10% "fair band") was framed as an
across-the-board toll. the owner correction: sculptura is not just
etsy. the fee pays for the free design studio (admitted artists get
the studio at no cost - the creation stack is free to start), the
storefront, routing and compliance. the replacement-stack comparison
is the honest benchmark: matrixgold $5,995 + rhino ~$995, or ai-cad
saas $125-179/mo, PLUS etsy-effective ~13.5% on top if they still
want a marketplace. against that, free 20% and paid 10-16% all read
as cheap: the stack is included, not billed separately. the paid
ladder never dips below 10% - the floor of the old fair band - so
committed creators buy down to fair-band pricing at most, never
into toll territory. pricing pages must lead with what the fee
pays for (studio + storefront + manufacturing compliance), not the
headline rate.

## result 1: every tier clears the requirement, widely

at 100 orders/mo the ex-retro requirement is $16.18/order (blended
mix aov $205, profit 200 bps):

| tier | fee | sub rev/order | waterfall surplus |
|---|---|---|---|
| free 20% | $46.43 | - | +$30.24 |
| starter 16% | $37.24 | $6.50 | +$27.55 |
| lite 14% | $32.65 | $9.99 | +$26.46 |
| standard 12% | $28.06 | $12.35 | +$24.22 |
| pro 10% | $23.46 | $14.99 | +$22.28 |

## result 2: the launch waterfall (75/12/8/3/2 mix)

| orders/mo | surplus/mo | retro $21,200 cleared |
|---|---|---|
| 50 | $1,364 | 16 months (1.3y) |
| 100 | $2,928 | 7 months (0.6y) |
| 200 | $6,056 | 4 months (0.3y) |

the 20% free tier is the retro engine: free creators alone carry the
paydown, and the platform reaches real gross profit (beyond the 200
bps embedded target) quickly at any launch volume.

## result 3: coverage thresholds without sub revenue

at 100 orders/mo, fee alone vs ex-retro requirement: free 20%,
starter 16%, lite 14% and standard 12% cover $120+ aov; pro 10%
covers $200+. at $60 aov every tier including free 20% is underwater
($10.70 fee vs $11.25 requirement) - the cheap-order problem stays
owned by the floor and refusal economics (fee-balance-analysis.md).

## the catalog-cap rule (ruling)

allowances cap distinct active listings, never sales. a free creator
with 5 strong listings selling 50 units/mo stays free forever and
sculptura earns 20% of every sale: fair game, by design. the upgrade
pressure is variety (more distinct designs live), not volume - so the
ladder monetizes catalog breadth and leaves unit sales to the fee,
which is exactly where the platform's value sits.

## to measure / rule before freezing

1. the fee % per paid tier (hypothesis 16/14/12/10, the
   stack-value-anchored constant ~$300 ladder; never below 10%).
2. standard's price: 24.99 recommended over 24.69.
3. listing counts for paid tiers (hypothesis 10/20/30/40).
4. compile-credit counts per tier (studio-side meter).
5. real tier mix, aov, and support cost (move the requirement itself).
