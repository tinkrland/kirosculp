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
| starter | $12.99 (ruled) | 10 (hyp) | 15% + $0.50 (hyp) |
| lite | $19.99 (ruled) | 20 (hyp) | 12% + $0.50 (hyp) |
| standard | $24.69 (ruled; 24.99 recommended, see below) | 30 (hyp) | 10% + $0.50 (hyp) |
| pro | $29.99 (ruled) | 40 (hyp) | 8% + $0.50 (hyp) |

open rulings: fee % per paid tier, listing counts for paid tiers,
compile-credit counts per tier (the studio-side meter).

## why the prices are sound: the constant-$250 break-even

at the hypothesis fee ladder (15/12/10/8), each subscription pays for
itself at almost the same monthly gmv:

| tier | discount vs free | break-even gmv/mo |
|---|---|---|
| starter | 5 pts | $259.80 |
| lite | 8 pts | $249.87 |
| standard | 10 pts | $246.90 (at $24.69; $249.90 at $24.99) |
| pro | 12 pts | $249.92 |

this is the cleanest possible subscription story: "once your designs
sell about $250/month, any tier pays for itself; pick by catalog
size." the prices are effectively calibrated to a constant
break-even, whether by design or instinct. **$24.99 beats $24.69**:
it completes the .99 charm pattern AND lands the break-even at
$249.90, aligned with pro's $249.92; $24.69 is the one rung that
breaks both.

## the 20% free tier: positioning check

the earlier fairness analysis called 15% exorbitant for a marketplace
toll (fair band 8-10%). the tier ladder resolves that tension
structurally instead: free 20% is percentage-instead-of-subscription
for the full creation stack (the artifact-vs-idea model: the platform
replaces $5,995 matrixgold and $125-179/mo cad saas), and committed
creators buy down to exactly the fair band (10% at standard, 8% at
pro). benchmarks: etsy effective ~13.5% incl. payment; vgen 5% plus
its sub. 20% free is above marketplace norms, but sculptura is not
charging a marketplace toll on someone else's finished product - it
is the toolchain's revenue line. the honest risk: a creator comparing
headline rates only (vs etsy) misreads the product; the pricing page
must lead with what the fee pays for, not the rate.

## result 1: every tier clears the requirement, widely

at 100 orders/mo the ex-retro requirement is $16.18/order (blended
mix aov $205, profit 200 bps):

| tier | fee | sub rev/order | waterfall surplus |
|---|---|---|---|
| free 20% | $46.43 | - | +$30.24 |
| starter 15% | $34.94 | $6.50 | +$25.26 |
| lite 12% | $28.06 | $9.99 | +$21.87 |
| standard 10% | $23.46 | $12.35 | +$19.63 |
| pro 8% | $18.87 | $14.99 | +$17.68 |

## result 2: the launch waterfall (75/12/8/3/2 mix)

| orders/mo | surplus/mo | retro $21,200 cleared |
|---|---|---|
| 50 | $1,320 | 16 months (1.3y) |
| 100 | $2,841 | 7 months (0.6y) |
| 200 | $5,881 | 4 months (0.3y) |

the 20% free tier is the retro engine: free creators alone carry the
paydown, and the platform reaches real gross profit (beyond the 200
bps embedded target) quickly at any launch volume.

## result 3: coverage thresholds without sub revenue

at 100 orders/mo, fee alone vs ex-retro requirement: free 20% covers
$120+ aov, starter 15% $120+, lite 12% $120+, standard 10% $200+,
pro 8% $200+. at $60 aov every tier including free 20% is underwater
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

1. the fee % per paid tier (hypothesis 15/12/10/8, the constant-$250
   ladder).
2. standard's price: 24.99 recommended over 24.69.
3. listing counts for paid tiers (hypothesis 10/20/30/40).
4. compile-credit counts per tier (studio-side meter).
5. real tier mix, aov, and support cost (move the requirement itself).
