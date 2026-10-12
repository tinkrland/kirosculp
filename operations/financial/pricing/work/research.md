# fee policy: research register and considerations

status: scratch work product on the feepolicy drafting branch. the evidence
base under [fee-policy.md](../fee-policy.md). figures are anchors gathered
2026-10-12, not gospel; treat as directional until checked against primary
sources. every hypothesis number in the spec is listed in the assumption
register at the bottom with what must replace it.

---

## comparable platform fees

| platform | take / structure | notes for sculptura |
|---|---|---|
| etsy | 6.5% transaction (on total incl. shipping) + $0.20 listing + ~3% + $0.25 processing; ~10-13% all-in typical us | etsy plus ($10/mo) does not reduce transaction fees; creators resent this. a subscription that lowers the fee is a real differentiator. etsy applies its fee to shipping; we deliberately do not |
| redbubble | artist markup over opaque base price, 20% default | the hidden-margin pattern; exactly what the explicit-fee adjudication rejects. their "base price" is what our transparent manufacturing quote replaces |
| society6 | ~10% fixed royalty on most goods, artist-set markup on prints | fixed-royalty ceiling punishes premium work; percentage-of-price scales with aov, which suits jewelry |
| vgen | 5% service fee on commissions (+ processor) | nearest comp for the commission labor component. 5% is the low anchor for commission-only marketplaces |
| gumroad | 10% + $0.50 flat, merchant of record since jan 2025, discover feed takes 30% | shows an explicit flat fee landing at 10% with a fixed component; also shows mor-in-the-fee economics |
| fourthwall | 2.9% on transactions, 7.9% on memberships (older reported figures) | storefront-plus-merch model; different shape, but shows low take rates are possible when the platform monetizes elsewhere |
| spring/teespring | creator coupons, tiered creator margin | the coupon-lane model promotions.md already borrows |
| printify | premium $39/mo for up to ~33% off product cost (raised from $29) | the manufacturing-discount subscription lever we rejected for now: they control production cost, we do not |
| printful | growth $24.99/mo, up to ~33% off pricing, becomes free above $12k/yr sales | same lever, with a volume-forgiveness twist (we never-vary on volume) |

read-across: marketplaces charging explicit fees cluster at 5-10% + processor
pass-through; all-in 10-13% is the creator tolerance zone. the 10% + $0.50
hypothesis in the spec sits inside it, and the subscription lever discounts to
7%/5% rather than hiding margin.

## payment rails

- stripe us domestic: 2.9% + $0.30. international card: +1.5% (by card
  issuing country). currency conversion: +1%. a cross-border sale can reach
  ~5.4% + $0.30.
- stripe connect: express/custom ~$2 per active connected account per month,
  0.25% + $0.25 per payout. destination charges, separate charges and
  transfers, and direct charges differ in who is merchant of record: separate
  charges and transfers makes the platform mor (owns refunds, chargebacks,
  tax). the mor decision is the rank-1 open question.
- paddle: 5% + $0.50 as mor, but excludes physical-delivery products, so it is
  out for jewelry checkout and payout (already ruled in
  [payout/stripe-vs-paddle.md](../../payout/stripe-vs-paddle.md)); the spec also
  recommends dropping it for subscription billing to avoid a second billing
  system.
- payout thresholds and the 15th schedule are ruled; the stale 20/20 in
  creator-payout-policy.json and creator-onboarding.md needs fixing (50 first
  payout, 25 after).

## risk anchors

- e-commerce chargeback benchmark: 0.5-1% typical; healthy target under 0.5%.
  no jewelry-specific figure found; high-ticket goods skew higher. the
  platform's internal risk pool exists for this tail, not per-creator reserves.
- jewelry e-commerce return rates: reported 8-15% for custom pieces, rings
  resizing-heavy (weak evidence, wide ranges). this is why product-category
  reserve steps (rings vs pendants) are the acceptable future refinement, and
  why the claim-window hold exists.

sources (retrieved 2026-10-12, secondary aggregations; verify against
primaries before external use): craftybase.com and printify.com etsy-fee
guides, help.etsy.com etsy plus, help.redbubble.com payment calculation,
lavaritte.com and stablecommerce.ai redbubble analyses, feebite.com and
fourthwall.com society6 pages, vgen.co for-artists, swell.is and creem.io
gumroad pricing pages, businessinsider.com fourthwall coverage,
dodropshipping.com printful-vs-printify, printify.com/pricing, stripe.com
pricing pages (stripe.com/connect/pricing, docs.stripe.com/connect/charges),
checkoutpage.io stripe international fees, flexprice.io stripe breakdown,
chargeflow.io paddle-vs-stripe, bestforecommerce.com and paykings.com
chargeback benchmarks, loopreturns.com and branvas.com jewelry return-rate
pieces.

## considerations register (from the four independent passes)

the spec was stress-tested with four frontier-model passes (opus 4.6:
economics, architecture, adversarial risk; sonnet 4.6 as a skeptical operator)
over the full repo bundle plus the anchors above. where they disagreed, the
spec adjudicated as follows:

- **order-value fee tiers**: sonnet wanted tiered rates on order value; the
  adversarial pass argued tiers invite order-splitting games and a flat rate +
  fixed floor already covers low-ticket loss-making. spec went flat at launch;
  revisit with data.
- **free-tier rate**: hypotheses ranged 10-12%. spec froze 10% + $0.50 as the
  single placeholder, mid-band against etsy all-in and below it.
- **reserve**: all passes converged on flat, value-banded, hold-not-deduction;
  per-creator reserve rates were ruled out as trust-tiered in effect (they
  change when a creator can access money). the adversarial pass flagged the
  open ruling: does the trust ban cover reserve duration? the spec reads it as
  yes.
- **chargeback liability**: assuming platform-as-mor (fraud chargebacks on the
  platform, remorse refunds claw back creator earnings, defects on the
  manufacturer). everything here re-opens if the mor decision goes direct
  charges.
- **metal volatility**: quote expiry with a drift threshold; a locked-retail
  listing never silently reprices, checkout blocks when net would fall below
  the threshold and the creator confirms new numbers. threshold is a
  hypothesis to set from measured spot volatility.
- **the legacy faq**: all four passes ruled the hidden-margin language
  unimplementable against two-way pricing and the subscription lever; the spec
  retires it in favor of the explicit-fee statement.

## assumption register

| assumption | value | replaced by |
|---|---|---|
| silver pendant mfg | $18 | real partner quotes |
| 14k ring mfg | $52 | real partner quotes |
| 18k piece mfg | $165 | real partner quotes |
| house charm mfg | $15 | real partner quotes |
| shipping domestic / intl | $8 / $18 | carrier rate integration |
| insurance | 1.5% min $1 | insurance provider quotes |
| reserve | 3% / 5% > $300 | realized claim rates after first claim windows |
| fee | 10% + $0.50, floor $2 | owner ruling + first 100 orders |
| tier discounts | studio -300 bps, platform -500 bps | owner ruling |
| channel surcharges | etsy +350 bps, shopify +150 bps | actual channel fee contracts |
| quote validity | 72h for precious metal | measured spot volatility |
| stripe rates | list rates above | the actual stripe agreement |
| tax | $0 (tax-exclusive in examples) | tax engine + mor decision |

see [verify.py](verify.py) for the runnable model: it computes both lock modes,
enforces balance-to-the-cent and the positive-net block, and reproduces every
worked example in the spec.
