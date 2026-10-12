# checkout rate buildup: bottom-up dollars per order

status: work draft, 2026-10-12. computes what the embedded platform
amount per order must recover, from the bottom up, before any rate
schedule is chosen. model: buildup.py (deterministic, reproducible;
every table in this file is its output). all parameters marked
hypothesis are per fee-policy.md section 11 (measure first) and are
frozen only by the owner.

## the formula

the embedded amount per order is, by ruling:

```
required fee per order = direct service cost recovery
                       + target gross profit
                       + previous work recovery (retro $21,200)
                       + inference recovery (allocated)
                       + manufacturer integration (per-order + allocated)
```

## the two allocation rules

1. **inference is pooled, not order-attached.** api/inference spend on
   designs that never sell still needs recovery; counting only calls
   attached to successful orders understates costs. per-order
   recovery = (designs generated per sold order, including unsold) x
   platform-borne cost per design. grounded structure per
   studio/design-agent/byok.md: tessa turns on platform keys accrue
   only for non-byok creators (byok share hypothesis 30%; byok turns
   bill the creator's provider, never falling back to platform
   inference); compiles + paracraft validation are always platform
   compute but partially recovered via studio credits / wallet
   (hypothesis 50%). values: 10 designs per sold order x
   (0.70 x $0.05 + 0.50 x $0.01) = **$0.40/order**. sensitivity:
   4-30 designs/order, byok 10-60%, wallet 30-70%.
2. **manufacturer integration splits by shape.** a per-order
   integration fee belongs to that order's cost directly; a monthly
   integration charge is allocated across the month's orders, never
   charged in full to every order. hypothesis: $0.50/order direct +
   $200/mo combined partner charges -> $4.50/order at 50/mo, $2.50 at
   100/mo, $1.50 at 200/mo.

## the direct stack (grounded, fee-balance-analysis.md)

support $6.00, quote api $0.25, routing $0.02, failed-payment blend
$0.10, tell checks $0.01, payout coordination $0.50, chargeback tail
0.75% of retail (value-scaled).

## result 1: full embedding is unpayable at launch volume

required fee per order with everything embedded, including retro
amortized over 24 months (profit 200 bps, fixed $0.50):

| retail | 50/mo | 100/mo | 200/mo |
|---|---|---|---|
| $60 | $30.92 (60%) | $20.08 | $14.67 |
| $120 | $32.55 (29%) | $21.72 | $16.30 |
| $200 | $34.73 (18%) | $23.89 | $18.48 |
| $250 | $36.09 (15%) | $25.25 | $19.84 |
| $650 | $46.97 (7%) | $36.13 | $30.72 |

the retro allocation dominates: $17.67/order at 50/mo, $8.83 at
100/mo, $4.42 at 200/mo. embedding it per-order implies an 18.2% rate
at 50 orders/mo (blended mix) and 12.4% at 100/mo. that is a rate a
fairness-first platform cannot charge, and it would push the rate
exactly where the fee policy forbids going.

## result 2: the rate the buildup actually supports (ex-retro)

with the retro recovered from fee surplus instead of embedded
per-order (profit 200 bps of fee_base, fixed $0.50):

| retail | 50/mo | 100/mo | 200/mo |
|---|---|---|---|
| $60 | 25.0% | 21.1% | 19.1% |
| $120 | 13.1% | 11.2% | 10.3% |
| $200 | 8.8% | 7.7% | 7.2% |
| $250 | 7.5% | 6.7% | 6.3% |
| $650 | 4.6% | 4.2% | 4.1% |

at the blended launch mix (~$205 aov): **~8.8% at 50/mo, ~7.8% at
100/mo**. the current policy 10% + $0.50 (floor $2) covers direct +
inference + integration + a modest profit target at launch volumes,
with surplus left for retro paydown. at 200/mo the blended fee runs
+$3.86/order over the full requirement including retro.

the $60 row stays structurally underwater even ex-retro (19-25%):
that is the cheap-order problem again, and it stays solved by the
floor and refusal economics, not by the headline rate.

## recommendation: the waterfall, not the rate hike

the checkout rate embeds direct + inference + integration + target
gross profit. the retro is not in the rate; it is recovered from fee
surplus in a fixed order:

```
fee revenue -> direct service costs -> retro paydown ($21,200) -> profit
```

target gross profit is deferred, not abandoned: at 50/mo the surplus
goes to retro; once retro clears (or at 200/mo where surplus exceeds
the full requirement), the same rate yields real gross profit. this is
the existing ruling (fee revenue is not profit until retro is repaid)
expressed as a revenue waterfall, and it keeps the published rate at
10% + $0.50 instead of 18%.

policy v1 therefore stands: 10% + $0.50, floor $2.00, applied to
fee_base. the buildup confirms it is sufficient at the blended mix
for everything except per-order retro amortization, which no fair
rate could carry at launch volume anyway.

## what to measure before freezing any parameter

1. real attach rate (designs generated per sold order) - drives the
   inference allocation.
2. real inference cost per design (aimlapi/gmi blend) - same.
3. partner integration fees: which candidates charge per-order vs
   monthly (carrera/digifabster-class automated quoting is the
   per-order shape; legacy portals are monthly).
4. support cost per order ($6 is the biggest single assumption in
   the stack).
5. real aov mix, to re-run the blend.

## relationship to the other pricing docs

- fee-policy.md: unchanged; this doc supplies the bottom-up ground
  for the 10% + $0.50 hypothesis in section 7.
- fee-balance-analysis.md: its payback tables already treat the retro
  as a horizon question; this doc makes that explicit as the waterfall.
- hours-audit.md: retro amount ruled there (300h at $28 + 600h at $20
  + $800 tools = $21,200).
