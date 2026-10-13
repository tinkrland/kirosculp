# sculptura fee policy: how margin and platform fee get decided

status: draft design for the dynamic margin and platform fee policy. not a ruling; every number marked hypothesis is unfrozen only by the owner. drafted 2026-10-12 from a full read of this repo and sculptura, grounded with comparable platform fee data, stress-tested with four independent frontier-model passes (opus 4.6: economics, architecture, adversarial; sonnet 4.6 as skeptical operator) plus independent arithmetic verification of every worked example.

---

## 1. verdict: what "dynamic" should mean here

dynamic must mean **governed policy release, not per-order computation**. the fee is a versioned data object (`fee_policy`) that a human publishes on an effective date; the server pricing service looks up the applicable cell and computes deterministically. nothing about an individual creator (trust, tenure, geography, volume history) ever enters the fee math at runtime.

three reasons this is the right reading of "decoupled":

- the standing constraints already forbid the inputs an algorithmic fee would want: trust-tiered, geography-tiered and volume-tiered pricing are all ruled out. what remains as legitimate fee inputs (subscription state, channel, product type) are static lookups, not computed signals.
- launch volumes are far too low to fit a dynamic pricing model, and a per-order algorithm is one step from telling creators what to charge, which the positioning docs explicitly forbid (marketing/positioning/creator/commission-pricing.md).
- the order snapshot contract (every order stores the exact policy version used at checkout) already requires versioned policy as data. this design just makes that object real.

so: **fee_policy (versioned json, superadmin-published) -> pricing_service (pure deterministic compute, no judgment) -> price_snapshot (signed, immutable, stored with the order)**. rates live only in fee_policy. this is the printify model (a rate schedule keyed to subscription state), not the uber model (a real-time algorithm).

## 2. adjudication: hidden-in-manufacturing-cost loses, explicit fee wins

the legacy faq (what-exists/base44/src/pages/faq.jsx) says sculptura "builds its margin into the manufacturing cost. there is no additional fee on top of the creator's earnings." every current doc (operations/financial/pricing/README.md, settlement/README.md, explain/platform/overview.md) instead puts platform fee in the equation as its own term. this contradiction has to be resolved before any creator sees pricing, and all four model passes independently ruled the same way: **explicit fee, retire the faq language**.

the decisive arguments:

1. two-way pricing is unverifiable with a hidden fee. in lock-retail mode a padded "manufacturing cost" silently underreports the creator's true earnings; in lock-earnings mode it inflates retail with no visible cause.
2. the subscription lever the owner wants (lower per-sale fee for paid subscribers) is unimplementable against a hidden fee: you cannot discount a fee that officially does not exist, and you cannot pretend a partner quote went down.
3. the promo lane rule needs a visible platform_fee ledger line to attribute platform-funded discounts to.
4. merchant-of-record accounting needs fee revenue separated from manufacturing pass-through.
5. every comparable creators already expect states its take explicitly (etsy, vgen 5%, gumroad 10%). hidden margin is the pod-factory pattern (redbubble base price + markup) that sculptura's two-way pricing deliberately rejects.

replacement faq language: "sculptura charges an explicit platform fee on each sale. you always see the exact manufacturing cost, the exact fee, and the exact amount that lands in your balance. no hidden markups."

## 3. the equation and the fee object

all amounts integer cents, one settlement currency per order. terms solved in this order:

```
insurance  = max(policy.insurance_min, retail * insurance_bps)
reserve    = retail * reserve_bps (value-banded; launch: 3%, 5% above $300)  [see 8: reserve is a hold, not a deduction]
fee_base   = retail - shipping - insurance - tax        (fee never applies to shipping, insurance or tax)
fee        = max(floor, fee_base * fee_bps/10000 + fee_fixed_cents)
payment    = retail * (domestic_bps + intl_bps? + fx_bps?)/10000 + fixed
net        = retail - manufacturing - shipping - insurance - tax - fee - payment
```

- **lock earnings**: solve retail algebraically. with reserve r, fee f, payment p as fractions and s+i+t the pass-through costs: retail = (mfg + (s+i+t)(1 - f) + fee_fixed + pay_fixed + net) / (1 - f - r - p). if the percentage fee lands below the floor, re-solve with fee = floor and take the higher retail. round retail up, then recompute every term from the rounded retail so the snapshot balances to the cent; any residual cent is absorbed into fee.
- **lock retail**: net = retail - mfg - shipping - insurance - tax - reserve - fee - payment. if net <= 0, refuse the snapshot and show the creator the minimum viable retail (lock-earnings solve with net = 1 cent). this block must include subscriber discounts and both promo lanes (floor revalidated after coupons), per the promotions lane rule.
- snapshot stores: policy_id + version, quote_id + expiry, lock mode, currency, every term in cents, channel, subscription tier, house-line flag, coupon/promo amounts and funding side, integrity hash. no client amount is ever trusted (platform/VERIFICATION-zero-client-amounts.md).
- basis points everywhere in the schema (rate_bps), so no float math in the ledger.

## 4. vary / never-vary (this is the heart of the question)

| dimension | verdict | why |
|---|---|---|
| policy version / effective date | vary (the only true dynamic) | governed releases with simulation + notice; orders pin their version forever |
| creator subscription state | vary | the owner's intended lever; uniform per tier, visible before subscribing |
| channel (native/shopify/etsy/whitelabel) | vary as transparent surcharge | etsy charges sculptura ~6.5% + listing; without pass-through every etsy order is negative. creator sees the effective rate before enabling a channel |
| product type: commission labor vs listing piece | architecturally separate, same rate at launch | commissions.md says "standard fee structure"; a different rate is a later policy decision |
| payment cost (domestic/intl card, fx) | computed, not policy | a factual stripe cost, an input not a lever |
| promo funding | rule, not rate | creator coupons eat creator net, platform promos eat fee; stacking per promotions.md |
| house line | never vary | identical fee logic, payee collapses (native-line.md is explicit) |
| order value | never vary fee rate at launch | tiers invite gaming (split orders) and add complexity a flat rate + fixed floor already handles; revisit only with data |
| metal/alloy | never vary fee rate | manufacturing cost already scales with metal; a metal surcharge pushes creators away from premium materials, which is an anti-artist price signal |
| manufacturing cost share | never vary | penalizes thin-margin creators; perverse incentive against low earnings |
| destination territory | never vary fee | shipping, tax, insurance, intl card costs already vary by destination as pass-throughs. a territory fee is geography-tiered pricing (constraint collision) |
| creator volume / tenure | never vary | a volume discount is a de facto trust tier visible through its economics; rich-get-richer. subscriptions are the correct volume reward |
| private trust level | never, hard | in-house, invisible, never fee-bearing, per the trust rulings |

## 5. subscriptions: levers a + b, not c

- **(a) lower per-sale fee**: works only because the fee is explicit (see 2). correct primary financial lever.
- **(b) larger allowances**: preferred owner direction; near-zero marginal cost; drives adoption among low-volume creators who subscribe for capacity, not fee savings. keep studio credits (compiles) and platform allowances (listings) as separate meters on separate sides of the studio/platform boundary.
- **(c) printify-style manufacturing discount**: rejected for now. sculptura does not control the quote; the discount would be either a lie about a partner price or a subsidy from platform margin, which is just (a) done less transparently. revisit when real volume discounts are negotiated with casting partners.

owner ladder 2026-10-12 (revised): five tiers, each an integrated
studio+platform subscription (one sub covers both sides; the fee
percentage is the checkout expression - free creators pay the higher
rate, subscribers lower). allowances cap distinct active listings,
never sales volume.

| | free | starter | lite | standard | pro |
|---|---|---|---|---|---|
| price/mo | $0 | $12.99 | $19.99 | $24.90 (24.99 recommended) | $29.99 |
| listings/mo | 5 (ruled) | 10 (hyp) | 20 (hyp) | 30 (hyp) | 40 (hyp) |
| fee rate | 20% + $0.50 (ruled) | open (hyp 16%) | open (hyp 14%) | open (hyp 12%) | open (hyp 10%) |

the two meters stay separate per the boundary rule: compile credits
price compiles (studio side), listing allowances price listings
(platform side), both inside each subscription. the hypothesis fee
ladder 16/14/12/8 is stack-value-anchored (the fee pays for the
free studio, storefront, routing and compliance - sculptura is not
just etsy, so the ladder never dips below 10%) and forms a near-
constant break-even ladder (~$300-330/mo gmv). per-tier waterfall math:
work/tier-schedule-comparison.md.
| commission slots | 3 | 10 | unlimited |
| channels | native | +2 | all |

break-even (subscriber's view, integrated sub at 2 orders/month): a 7% cell pays for itself at ~$500/month gmv; a 5% cell at ~$780/month. below that, allowances must carry the value. the negative-net block includes the discounted fee, and the $2 floor still binds: subscribers cannot discount below the floor.

note on paddle: consider dropping it even for subscription billing. running paddle for subscriptions plus stripe for jewelry means two billing systems, two tax surfaces, two refund flows. stripe billing does subscriptions fine. the repo itself (operations/financial/payout/stripe-vs-paddle.md) already rejected paddle for the money path.

## 6. worked examples (assumptions, not data: no real quotes exist)

assumptions: stripe 2.9%+$0.30 domestic, +1.5% intl card, +1% fx, payout 0.25%+$0.25; shipping $8 domestic / $18 intl; insurance 1.5% min $1; reserve 3% (5% >$300); fee 10%+$0.50, floor $2; mfg costs invented pending partner quotes.

| order | retail | mfg | fee | payment | creator net |
|---|---|---|---|---|---|
| silver pendant, domestic | $60 | $18 | $5.60 | $2.04 | $23.56 |
| same pendant, eu buyer (intl card, fx, $18 ship) | $60 | $18 | $4.60 | $3.54 | $13.06 |
| 14k ring, domestic | $140 | $52 | $13.49 | $4.36 | $55.85 |
| 18k piece, intl+fx, studio 7% | $450 | $165 | $30.16 | $24.60 | $158.99 |
| house charm $38 | $38 | $15 | $3.40 | $1.40 | $8.06 (to sculptura) |

every row balances to the cent (independently verified). the interesting readings:

- the eu pendant row shows the real cost of cross-border pass-throughs: the creator loses ~$10.50 to shipping+intl card+fx, none of it platform margin. worth showing creators plainly at pricing time.
- house line: fee $3.40 + collapsed net $8.06 = $11.46 contribution on a $38 charm (~30%), before opex. the house line is genuinely high margin, which matches native-line.md's intent.
- lock-earnings sanity check: $50 net on the 14k ring prices at $132.92 retail.
- 14k ring mfg of $52 is itself an assumption; if real quotes come back higher, the fee percentages do not change, only the solved retail does. that is the design working as intended.

## 7. floor economics: percentage + fixed floor

fixed unavoidable per-order costs: stripe fixed $0.30, connect payout ~$0.25 + 0.25%, a slice of the $2/month connected-account fee, support and exception handling time, insurance admin. a pure percentage fee goes to zero with order value; a pure fixed fee is regressive on big orders. so: **percent + fixed, with a hard minimum**. recommended launch: 10% + $0.50 with a $2.00 floor per order. the floor only binds below roughly $25 retail, where the sale is barely viable anyway (net goes thin before the floor ever caps it). revisit both numbers with the first 100 real orders.

## 8. reserve and who bears what, without trust or geography

the honest tension: risk-pricing reserves per creator would use exactly the inputs the trust rulings forbid (a per-creator reserve rate is fee-like: it changes when creators can access their money). the resolution all passes converged on:

- **reserve is a hold, not a deduction**: creator payable accrues fully; the claim-window hold (pending -> eligible, already in the repo's flow) is the reserve. nothing is deducted from net at checkout; the reserve line in the equation is the amount whose release is deferred, sized by value band only (3% / 5% >$300).
- product-category reserve steps (rings resize more than pendants) are acceptable later: they key on the product, not the person.
- allowed sizing inputs: order value band, product category, metal (via mfg cost), portfolio-level realized claim rates. never: creator history, geography, corridor, trust level.
- allocation when bad things happen (policy, needs counsel): fraud chargeback = platform (as mor, why the platform keeps an internal risk pool from its own fee); buyer-remorse refund post-production = creator earnings returned from the hold, manufacturer already paid, fee refunded by platform; defect = manufacturer remake at their cost; design error that passed validation = shared, platform loses its fee, creator loses the earnings, manufacturer paid for the work done.
- stripe's 120-day chargeback window vs a ~30-day claim-window release leaves a tail; cover it with a portfolio-level pool, not longer holds (long holds hurt every good creator to chase a rare tail).

## 9. metal and fx volatility vs locked retail

quotes are time-bounded snapshots (manufacturing/quotes/README.md already specifies expiry). recommended policy:

1. at publication, the listing records the quote and the computed net at that quote.
2. at checkout the pricing service uses a fresh (or within-validity) quote. 72-hour quote validity for precious-metal pieces is the hypothesis; measure real volatility first.
3. if the fresh quote has moved so the listing's net would drop below a drift threshold (hypothesis: below 0 or below 70% of published net), the checkout is blocked from auto-proceeding: the creator gets a console notification with the new solved numbers and a one-click accept/reprice. never silently reprice a locked-retail listing, and never let net go negative (the block catches it anyway).
4. the fx buffer starts at zero (stripe conversion passes through); add a policy fx_markup only if reconciliation shows real drift.

## 10. governance

- fee_policies table: append-only (update/delete revoked even from service_role, same pattern as ledger_entries), rows created by admin or superadmin, published by **superadmin only**; every row records created_by, created_by_role (per the distinct-roles audit ruling), change note, simulation_run_id.
- publish requires a simulation run first: recompute net for all active listings under the draft, flag any that go negative, and show the distribution of changes on recent orders.
- 14-day advance notice to creators for any fee increase, enforced by the system (effective_at >= created_at + 14d), email plus console notification, with a pricing-calculator link. decreases can be immediate.
- soft guardrail: warn on any single-release change over 2 percentage points; hard ceiling on rate_bps in the schema.
- kill switch: superadmin reverts to the previous version instantly; reverts are logged and do not need the 14-day notice.
- grandfathering: none for listings (new checkouts use the new policy), absolute for captured orders (snapshot immutable forever).

## 11. measure first (replaces every assumption above)

1. real manufacturing quotes for 4 representative pieces from at least 2 candidate partners (the single biggest unknown; everything numeric above is fiction until this exists)
2. metal spot volatility over 30/60/90 days for the launch alloys (sets quote expiry)
3. insured parcel costs, domestic us, us-eu, intra-eu, $50-$500 declared value
4. actual stripe connect pricing for the chosen charge model (express vs custom, separate charges vs destination)
5. real aov from the first 50-100 orders (house line plus early creators)
6. intl-card and fx share of checkouts (how often the eu-pendant row happens)
7. claim/return/remake rates by product category after the first claim windows close
8. chargeback rate (target under 0.5%; the 0.5-1% ecommerce band is the alarm zone)
9. support time per order (drives the floor)
10. subscriber conversion and break-even gmv if the tiers ship

staged rollout, tied to the repo's own build order: (1) implement fee_policy + pricing service against the existing mock finance flow (spree + localstripe), with the negative-net and floor guards as tests; (2) ship policy v1 as data with placeholder rates frozen, wire the 14-day-notice and simulation tooling before the first real rate change; (3) stripe connect after incorporation, with reserve/hold timing re-verified against real stripe behavior; (4) subscriptions and the fee-discount lever only after real aov data exists.

## 12. open questions, ranked by design impact

1. **merchant of record.** every allocation in 8 assumes sculptura-as-mor via separate charges and transfers. if direct charges win, chargeback and tax bearing move and the reserve model changes shape. counsel question, highest impact.
2. **fee on shipping or not.** recommendation: fee never applies to shipping, insurance or tax (etsy does apply theirs to shipping; we deliberately do not). revenue decision.
3. **commission labor fee rate**: same as listings at launch, but vgen charges 5% on labor and commissions carry higher dispute cost. revisit with data.
4. **paddle for subscriptions at all**, or stripe billing only.
5. **stale docs to fix regardless**: operations/country-rollout/creator-payout-policy.json and creator-onboarding.md still say 20/20 minimums (ruling is 50 first, 25 after); the 60/30/10 split in the escrow sims is a test fixture, not a rate decision (it coincidentally matches a 10% take on $120; make sure no one quotes it as policy); buildplan/operations/README.md also still cites $20/$20.
6. **whether reserve duration counts as fee-bearing** for the trust ruling: i read it as yes (time value of creator money), which forecloses trust-influenced hold durations. if the founder disagrees, the trust ruling needs an explicit carve-out. needs a ruling either way.
7. **chargeback window vs release timing**: 120-day stripe window vs ~30-day claim release; the portfolio pool covers the tail, but counsel should confirm platform liability as mor.
8. **who absorbs the payout fee** (0.25% + $0.25 per payout): creator or platform. on a $50 payout it is ~$0.38; small but it is a positioning choice.
