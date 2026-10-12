#!/usr/bin/env python3
"""checkout-rate buildup: bottom-up dollars per order.

embedded fee requirement per order =
  direct service cost recovery
+ inference recovery (all designs, incl. never-sold)
+ manufacturer integration (per-order direct, monthly allocated)
+ previous work recovery (retro, allocated over horizon)
+ target gross profit

all parameters are hypotheses per fee-policy.md section 11 (measure
first); none are policy until the owner freezes them. every number
here is reproducible: python3 buildup.py
"""

# ---------------------------------------------------------------- params
# direct per-order service stack (fee-balance-analysis.md, grounded)
SUPPORT = 6.00          # $/order, biggest assumption, measure first
QUOTE_API = 0.25        # live price-quote revalidation per order
ROUTING = 0.02          # route compute checks
FAILED_PAY = 0.10       # failed-payment retry blend
TELLS = 0.01            # tell-adapter checks (email/phone/address)
PAYOUT_COORD = 0.50     # payout coordination per order
TAIL_BPS = 75           # chargeback tail, value-scaled (0.75% of retail)

# inference allocation (hypothesis)
COST_PER_DESIGN = 0.05  # deterministic parametric generation per design
DESIGNS_PER_SOLD_ORDER = 10  # attach rate 10%: 90% of designs never sell

# manufacturer integration (hypothesis, pending partner quotes)
MFG_PER_ORDER = 0.50    # per-order integration fee: that order's cost, direct
MFG_MONTHLY = 200.0     # monthly integration charges, all partners combined

# previous work recovery (ruled 2026-10-12)
RETRO = 300 * 28 + 600 * 20 + 800  # = 21200
RETRO_HORIZON_MONTHS = 24

# profit target (policy input; shown at several levels)
PROFIT_BPS_OPTIONS = [0, 200, 300]  # of fee_base

# order shape (fee-policy.md section 6 assumptions)
SHIPPING = 8.00        # domestic hypothesis
INS_BPS = 150          # 1.5%
INS_MIN = 1.00
FEE_FIXED = 0.50       # current policy fixed
FEE_FLOOR = 2.00
LAUNCH_BPS = 1000      # current policy: 10%

AOVS = [60, 120, 200, 250, 650]
VOLUMES = [50, 100, 200]
BLEND = {200: 60, 650: 15, 95: 25}  # launch metal mix -> aov ~205


def stack(retail):
    """direct service cost per order, dollars."""
    return (TAIL_BPS / 10000) * retail + SUPPORT + QUOTE_API + ROUTING \
        + FAILED_PAY + TELLS + PAYOUT_COORD


def inference_alloc():
    """all design-generation spend recovered from sold orders only."""
    return COST_PER_DESIGN * DESIGNS_PER_SOLD_ORDER


def mfg_alloc(monthly_orders):
    """per-order fee direct; monthly charges allocated, never per-order."""
    return MFG_PER_ORDER + MFG_MONTHLY / monthly_orders


def retro_alloc(monthly_orders):
    return RETRO / (monthly_orders * RETRO_HORIZON_MONTHS)


def fee_base(retail):
    insurance = max(INS_MIN, retail * INS_BPS / 10000)
    return retail - SHIPPING - insurance


def required_fee(retail, monthly_orders, profit_bps):
    return (stack(retail) + inference_alloc() + mfg_alloc(monthly_orders)
            + retro_alloc(monthly_orders) + profit_bps / 10000 * fee_base(retail))


def required_bps(retail, monthly_orders, profit_bps):
    """rate (bps of fee_base, with fixed $0.50) that covers the buildup."""
    req = required_fee(retail, monthly_orders, profit_bps)
    return (req - FEE_FIXED) / fee_base(retail) * 10000


def required_fee_exretro(retail, monthly_orders, profit_bps):
    """embedded requirement with retro recovered from surplus, not per-order."""
    return (stack(retail) + inference_alloc() + mfg_alloc(monthly_orders)
            + profit_bps / 10000 * fee_base(retail))


if __name__ == "__main__":
    inf, mfg50, mfg100, mfg200 = (inference_alloc(),
                                  mfg_alloc(50), mfg_alloc(100), mfg_alloc(200))
    print("=== per-order allocations (dollars) ===")
    print(f"inference (all designs, 10% attach): ${inf:.2f}")
    print(f"mfg integration at 50/100/200 orders/mo: "
          f"${mfg50:.2f} / ${mfg100:.2f} / ${mfg200:.2f}")
    for v in VOLUMES:
        print(f"retro $21,200 over 24mo at {v}/mo: ${retro_alloc(v):.2f}")

    print("\n=== required embedded fee per order ($), profit 200 bps ===")
    hdr = "retail | " + " | ".join(f"{v}/mo" for v in VOLUMES)
    print(hdr)
    for r in AOVS:
        print(f"${r:>4}  | " + " | ".join(
            f"${required_fee(r, v, 200):>6.2f}" for v in VOLUMES))

    print("\n=== required rate (bps of fee_base, fixed $0.50), profit 200 bps ===")
    print(hdr)
    for r in AOVS:
        print(f"${r:>4}  | " + " | ".join(
            f"{required_bps(r, v, 200):>6.0f}" for v in VOLUMES))

    print("\n=== current policy coverage: 10% + $0.50 (floor $2) ===")
    for r in AOVS:
        fb = fee_base(r)
        fee = max(FEE_FLOOR, fb * LAUNCH_BPS / 10000 + FEE_FIXED)
        for v in VOLUMES:
            req = required_fee(r, v, 200)
            gap = fee - req
            print(f"${r:>4} at {v:>3}/mo: fee ${fee:5.2f} vs required "
                  f"${req:6.2f} -> {'+' if gap>=0 else ''}${gap:.2f}")

    print("\n=== required rate EXCLUDING retro (direct+inference+mfg+profit)")
    print("=== retro then recovered from fee surplus (the waterfall) ===")
    for profit_bps in [0, 200]:
        print(f"profit {profit_bps} bps:")
        for r in AOVS:
            print(f"  ${r:>4} | " + " | ".join(
                f"{(required_fee_exretro(r, v, profit_bps) - FEE_FIXED) / fee_base(r) * 10000:>5.0f}"
                for v in VOLUMES) + "  bps")

    print("\n=== blended launch mix (aov ~$205), profit 200 bps ===")
    tot_orders = sum(BLEND.values())
    for v in VOLUMES:
        fee_r = sum(n * max(FEE_FLOOR, fee_base(r) * LAUNCH_BPS / 10000 + FEE_FIXED)
                    for r, n in BLEND.items())
        req_r = sum(n * required_fee(r, v, 200) for r, n in BLEND.items())
        print(f"{v:>3}/mo: blended fee ${fee_r/tot_orders:.2f} vs required "
              f"${req_r/tot_orders:.2f} -> gap "
              f"${(fee_r-req_r)/tot_orders:+.2f}/order")

    print("\n=== what closes the gap at launch (blend, 50/mo, profit 200 bps) ===")
    req50 = sum(n * required_fee(r, 50, 200) for r, n in BLEND.items()) / tot_orders
    fee50 = sum(n * max(FEE_FLOOR, fee_base(r) * LAUNCH_BPS / 10000 + FEE_FIXED)
                for r, n in BLEND.items()) / tot_orders
    gap = fee50 - req50
    print(f"gap: ${gap:.2f}/order -> rate needed: "
          f"{(req50 - FEE_FIXED)/fee_base(205)*10000:.0f} bps at $0.50 fixed")
    print(f"alternatives: extend retro horizon to 36mo -> "
          f"${RETRO/(50*36):.2f}/order retro (saves "
          f"${RETRO/1200-RETRO/1800:.2f})")
    print(f"                 trim profit to 0 bps -> saves "
          f"${200/10000*fee_base(205):.2f}")
    print(f"                 subscriptions: a studio sub at $15/mo buying "
          f"2 orders/mo adds $7.50/order equivalent revenue")
