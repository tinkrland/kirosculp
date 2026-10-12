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
- **ruling 2026-10-12: studio and platform are integrated.** there is
  ONE paid creator subscription covering both the studio side and
  the platform side - not separate studio and platform tiers. the
  free tier stands. studio credits (compiles) and platform
  allowances (listings) stay separate meters on their respective
  sides of the boundary inside the one subscription. price and
  fee-discount rate of the integrated tier are not yet ruled; the
  old two-tier table (studio ~$15 / platform ~$39) in fee-policy.md
  section 5 is superseded.
- **trust levels are never tiers** (admin/creator-trust/README.md):
  private, in-house, never creator-facing, never fee-bearing; the
  subscription tiers above are the only creator-facing levels.

## inputs (hypotheses)

- structure (ruled): free tier + ONE integrated studio+platform
  subscription; candidate price/rate cells modeled as alternatives:
  $15 at 7%, $25 at 7%, $25 at 5%, $39 at 5% (all + $0.50 fixed,
  $2 floor, fee on fee_base).
- orders per subscriber per month: 2. subscriber order share: 15%.
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

## result 2: the launch waterfall per candidate cell (85/15 mix)

retro $21,200 cleared, at 50 / 100 / 200 orders/mo:

| cell | 50/mo | 100/mo | 200/mo |
|---|---|---|---|
| $15 7% | 79 mo (6.6y) | 29 mo (2.4y) | 13 mo (1.1y) |
| $25 7% | 69 mo (5.8y) | 26 mo (2.2y) | 12 mo (1.0y) |
| $25 5% | 78 mo (6.5y) | 29 mo (2.4y) | 13 mo (1.0y) |
| $39 5% | 65 mo (5.4y) | 25 mo (2.1y) | 11 mo (0.9y) |

every cell keeps the platform waterfall-positive from day one; the
cells differ by only a few months of retro horizon. the honest
launch story: 50/mo is sustainable and slow, 100/mo clears the retro
inside ~2.5 years at any cell, 200/mo inside about a year.

## result 3: where each rate is underwater without sub revenue

requirement vs fee alone, 100 orders/mo:

| retail | req | 10% | 7% | 5% |
|---|---|---|---|---|
| $60 | $11.25 | under | under | under |
| $120 | $12.88 | under | under | under |
| $200 | $15.06 | ok | under | under |
| $250 | $16.42 | ok | ok | under |
| $650 | $27.30 | ok | ok | ok |

rough coverage thresholds at launch volume (without sub revenue):
free 10% needs ~$150+ aov, 7% needs ~$250+, 5% needs ~$500+. below
$150 aov every tier is underwater ex-retro and the floor/refusal
economics own the problem - the same cheap-order finding as
fee-balance-analysis.md, now per-tier.

## findings

1. every candidate cell keeps the waterfall positive at any launch
   volume; the integration ruling removes the two-tier risk entirely.
2. the deepest discount (5%) is safe on the integrated tier because
   the price carries it; it should never exist as a standalone rate.
3. $25 at 5% is the balanced cell: same 2.2 orders/sub/mo fee
   break-even as $15 at 7%, deeper creator-facing discount, +$1.00
   order surplus over $15 7% at 100/mo. $39 5% maximizes waterfall
   but is the hardest sell pre-launch.
4. retro payback: 0.9-6.6 years across cells and 50-200 orders/mo.
5. cheap orders (<$150 aov) remain structurally subsidized at every
   tier; the floor and refusal economics stay the instrument there.

## to measure before freezing

1. which price/rate cell to freeze (owner ruling).
2. real subscriber share and orders-per-subscriber (moves break-even line).
2. real aov (moves every threshold).
3. support cost per order (moves the requirement itself).
4. subscriber conversion (fee-policy.md section 11 item 10).
5. byok adoption share (moves platform-borne inference).
6. wallet recovery share (moves the metered-compile cost).
7. a price ruling on the explicit commercial-license purchase
   (ip-licensing.md) - currently an unpriced revenue line that would
   only shorten the retro horizon.
