# tier rate schedule vs the waterfall

status: work draft, updated 2026-10-12 with the owner's ruled ladder.
what each tier's checkout fee leaves in the revenue waterfall.
model: tier-schedule.py (deterministic, reproducible; every table
here is its output).

## the ladder (owner ruling 2026-10-12)

each tier is an integrated studio+platform subscription: one sub
covers both sides; studio and platform are not separate products.
the integration expresses at checkout as the fee percentage: free
creators pay the higher sculptura fee, subscribers pay lower.

| tier | price | listings/mo | fee (hypothesis %) | status |
|---|---|---|---|---|
| free | $0 | 5 (ruled) | 10% + $0.50 | ruled (the higher fee) |
| starter | $12.99 (ruled) | 10 (ruled) | 8% + $0.50 | % open |
| standard | $19.99 (ruled) | 20 (ruled) | 7% + $0.50 | % open |
| pro | $27.49 (ruled) | 40 (hypothesis) | 5% + $0.50 | both open |

open rulings: the fee % for each paid tier, pro's listing count,
compile-credit counts per tier (the studio-side meter). the old
two-tier table (studio ~$15 / platform ~$39) is superseded.

## result 1: every tier clears the requirement, with sub revenue

at 100 orders/mo the ex-retro requirement is $16.18/order
(blended mix aov $205, profit 200 bps):

| tier | fee | sub rev/order | waterfall surplus |
|---|---|---|---|
| free 10% | $23.46 | - | +$7.28 |
| starter 8% | $18.87 | $6.50 | +$9.18 |
| standard 7% | $16.57 | $9.99 | +$10.39 |
| pro 5% | $11.98 | $13.74 | +$9.54 |

standard is the strongest cell in the waterfall at the hypothesis
rates; pro pays for its deeper discount with the highest sub
revenue per order. fee-only break-evens land close together
(2.8 / 2.9 / 2.4 orders/subscriber/mo for starter / standard /
pro), which is what a coherent ladder wants: no tier is a fee
arbitrage against another. below break-even the sub is capacity
economics - the owner's direction.

## result 2: the launch waterfall (80/10/7/3 tier mix)

| orders/mo | surplus/mo | retro $21,200 cleared |
|---|---|---|
| 50 | $288 | 74 months (6.1y) |
| 100 | $776 | 27 months (2.3y) |
| 200 | $1,751 | 12 months (1.0y) |

## result 3: the allowance ladder creates the upgrade path

at the 1-sale-per-listing-per-2mo hypothesis: free caps a creator
at ~2.5 orders/mo, starter supports ~5, standard ~10, pro ~20.
a creator outgrowing their tier upgrades for capacity, not for the
fee discount - which keeps the fee split honest and the ladder
self-selling.

## result 4: coverage thresholds without sub revenue

at launch volume: 10% needs ~$150+ aov, 8% ~$150+ (squeaks by at
$200), 7% ~$250+, 5% ~$500+. below $150 aov every tier is
underwater ex-retro; the floor and refusal economics own that
problem (fee-balance-analysis.md).

## to measure / rule before freezing

1. the fee % per paid tier (hypothesis: 8/7/5).
2. pro's listing count (hypothesis: 40).
3. compile-credit counts per tier (studio-side meter).
4. real tier mix and orders-per-subscriber.
5. real aov and support cost (move the requirement itself).
