# tier rate schedule vs the waterfall

status: work draft, 2026-10-12. what the free 10% / studio 7% /
platform 5% hypothesis schedule (fee-policy.md section 5) each leave
in the revenue waterfall, per volume. model: tier-schedule.py
(deterministic, reproducible; every table here is its output). tier
rates, sub prices, orders-per-subscriber and tier mix are all
hypotheses frozen only by the owner.

## the tier structure per the repos (grounded, not guessed)

what the repos actually pin down, cited:

- **the free creator tier exists and is defined** (fee-balance-analysis.md,
  buildplan/platform/ip-licensing.md): $0/month, includes a monthly
  inference allowance plus listing publication, and carries the
  **personal-use license** by default: exported stl for the creator's
  own non-commercial use; commercial third-party manufacture from a
  personal-licensed export is a license violation.
- **the full commercial grant is earned, not bought into a plan**
  (ip-licensing.md): any sculptura-routed order (sale, channel sale,
  commission including the piece, or an **explicit commercial-license
  purchase**) converts the release to full commercial rights with a
  ledger chain of title. the explicit purchase is an unpriced revenue
  line awaiting a price ruling.
- **byok moves tessa's cost, never the gate** (studio/design-agent/byok.md):
  creators may run tessa turns on their own provider key (litellm
  gateway, capability-probe gate, no model allowlist); platform never
  pays for byok turns and never silently falls back. compiles and
  paracraft validation are always platform compute, metered via
  **studio credits / wallet**.
- **the wallet is the in-platform payment rail**
  (buildplan/platform/creator-services.md): in-platform services are
  purchasable from the creator wallet with no double transaction fees;
  wallet spend and samples are new entries in the same append-only
  ledger.
- **studio $15/mo and platform $39/mo, 7% and 5%** are hypotheses from
  fee-policy.md section 5, cross-referenced in fee-model-snapshot.md
  (platform tier price 39, discount rate 0.05, fee-savings break-even
  gmv $780: price / discount = 39 / 0.05). allowance counts (10/30/
  unlimited listings) are owner-tentative only.
- **trust levels are never tiers** (admin/creator-trust/README.md):
  private, in-house, never creator-facing, never fee-bearing; the
  subscription tiers above are the only creator-facing levels.

## inputs (hypotheses)

- tiers: free 10% + $0.50, studio 7% + $0.50 at $15/mo, platform
  5% + $0.50 at $39/mo; floor $2.00; fee on fee_base.
- orders per subscriber per month: studio 2, platform 4.
- byok share 30%, wallet recovery 50% (checkout-rate-buildup.md).
- launch tier mix: 80% free / 15% studio / 5% platform.
- blended launch mix aov ~$205; requirement = ex-retro buildup
  (direct stack + inference + integration + 200 bps profit target,
  checkout-rate-buildup.md); retro $21,200 recovered from surplus.

## result 1: every tier clears the requirement, with sub revenue

at 100 orders/mo the requirement is $16.18/order (blended):

| tier | fee | sub rev/order | waterfall surplus |
|---|---|---|---|
| free 10% | $23.46 | - | +$7.28 |
| studio 7% | $16.57 | $7.50 | +$7.89 |
| platform 5% | $11.98 | $9.75 | +$5.55 |

(the free tier's inference allowance is already inside the
requirement via the pooled allocation; byok creators move their own
tessa cost off the platform entirely.)

the subscription revenue is what carries the discounted tiers: studio
at 2 orders/subscriber/mo pays $7.50/order against a $6.89 discount
cost; platform at 4 orders/mo pays $9.75 against a $11.48 discount
cost (platform's fee-discount alone is underwater at the blend; the
price carries it). the studio tier is the razor's edge: break-even at
**2.2 orders/subscriber/month**. below that the fee discount loses
money per order and the sub must be justified by capacity economics
(allowances, near-zero marginal cost) - which matches the owner's
direction that low-volume creators subscribe for capacity, not fee
savings.

## result 2: the launch waterfall (80/15/5 mix)

| orders/mo | surplus/mo | retro $21,200 cleared |
|---|---|---|
| 50 | $264 | 80 months (6.7y) |
| 100 | $729 | 29 months (2.4y) |
| 200 | $1,657 | 13 months (1.1y) |

at 50 orders/mo the platform is waterfall-positive from day one but
the retro is a long-haul repayment; profit (the 200 bps block)
actually starts only after the retro clears. the honest launch story:
50/mo is sustainable and slow, 100/mo clears the retro inside 2.5
years, 200/mo inside a year.

## result 3: where each rate is underwater without sub revenue

requirement vs fee alone, 100 orders/mo:

| retail | req | 10% | 7% | 5% |
|---|---|---|---|---|
| $60 | $11.25 | under | under | under |
| $120 | $12.88 | under | under | under |
| $200 | $15.06 | ok | under | under |
| $250 | $16.42 | ok | ok | under |
| $650 | $27.30 | ok | ok | ok |

rough coverage thresholds at launch volume: 10% needs ~$150+ aov,
7% needs ~$250+, 5% needs ~$500+ (without sub revenue). below
$150 aov every tier is underwater ex-retro and the floor/refusal
economics own the problem - the same cheap-order finding as
fee-balance-analysis.md, now per-tier.

## findings

1. the schedule is internally consistent: no tier destroys the
   waterfall once sub revenue is counted, at any launch volume.
2. the platform tier's 5% is only safe because of its $39 price;
   it should never be offered as a standalone rate.
3. the studio tier prices almost exactly at fee break-even
   (2.2 orders/mo); its real margin is capacity economics above
   break-even volume.
4. retro payback: 1.1-6.8 years across 50-200 orders/mo. the
   waterfall absorbs this without touching the published rates.
5. cheap orders (<$150 aov) remain structurally subsidized at every
   tier; the floor and refusal economics stay the instrument there.

## to measure before freezing

1. real tier mix and orders-per-subscriber (moves break-even line).
2. real aov (moves every threshold).
3. support cost per order (moves the requirement itself).
4. subscriber conversion (fee-policy.md section 11 item 10).
5. byok adoption share (moves platform-borne inference).
6. wallet recovery share (moves the metered-compile cost).
7. a price ruling on the explicit commercial-license purchase
   (ip-licensing.md) - currently an unpriced revenue line that would
   only shorten the retro horizon.
