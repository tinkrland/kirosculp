#!/usr/bin/env python3
"""tier rate schedule vs the waterfall: what each tier's fee leaves.

compares free 10% / studio 7% / platform 5% (all + $0.50 fixed, $2
floor, fee-policy.md section 5 hypotheses) against the ex-retro
requirement from buildup.py, then runs the revenue waterfall:
fee + subscription revenue -> direct+inference+mfg -> retro -> profit.

deterministic and reproducible: python3 tier-schedule.py
"""

from buildup import (stack, inference_alloc, mfg_alloc, retro_alloc,
                     fee_base, RETRO)

# ---------------------------------------------------------------- params
# ruling 2026-10-12: studio and platform are INTEGRATED - one paid
# subscription covering both sides. candidate price/rate cells below
# are hypotheses pending the owner's pick; meters stay split (compile
# credits on the studio side, listing allowances on the platform side).
TIERS = {                      # bps, fixed, monthly sub price (hypothesis)
    "free 10%":          (1000, 0.50, 0.0),
    "integrated $15 7%": (700,  0.50, 15.0),
    "integrated $25 7%": (700,  0.50, 25.0),
    "integrated $25 5%": (500,  0.50, 25.0),
    "integrated $39 5%": (500,  0.50, 39.0),
}
FLOOR = 2.00
PROFIT_BPS = 200
ORDERS_PER_SUB = {k: 2.0 for k in TIERS if k != "free 10%"}  # hypothesis
SUB_SHARE = 0.15            # hypothesis: share of orders from subscribers
BLEND = {200: 60, 650: 15, 95: 25}   # launch metal mix
VOLUMES = [50, 100, 200]


def fee(tier, retail):
    bps, fixed, _ = TIERS[tier]
    return max(FLOOR, fee_base(retail) * bps / 10000 + fixed)


def sub_rev_per_order(tier):
    price = TIERS[tier][2]
    return price / ORDERS_PER_SUB[tier] if price else 0.0


def exretro_req(retail, monthly_orders):
    return (stack(retail) + inference_alloc() + mfg_alloc(monthly_orders)
            + PROFIT_BPS / 10000 * fee_base(retail))


def blend_avg(fn):
    tot = sum(BLEND.values())
    return sum(n * fn(r) for r, n in BLEND.items()) / tot


if __name__ == "__main__":
    print("=== per-tier fee vs ex-retro requirement (blended mix aov $205) ===")
    for v in VOLUMES:
        req = blend_avg(lambda r: exretro_req(r, v))
        print(f"\nat {v} orders/mo, requirement (ex-retro, profit 200 bps): "
              f"${req:.2f}/order")
        for tier in TIERS:
            f = blend_avg(lambda r: fee(tier, r))
            s = sub_rev_per_order(tier)
            net = f + s - req
            print(f"  {tier:18} fee ${f:5.2f} + sub ${s:4.2f} -> "
                  f"waterfall {'+' if net >= 0 else ''}${net:.2f}/order")

    print("\n=== launch waterfall per candidate cell (85/15 free/sub mix) ===")
    for cell in [k for k in TIERS if k != "free 10%"]:
        print(f"\n  {cell}:")
        for v in VOLUMES:
            tot = sum(BLEND.values())
            monthly_surplus = 0.0
            for tier, share in (("free 10%", 1 - SUB_SHARE), (cell, SUB_SHARE)):
                for r, n in BLEND.items():
                    monthly_surplus += (share * v) * (n / tot) * (
                        fee(tier, r) + sub_rev_per_order(tier) - exretro_req(r, v))
            months = RETRO / monthly_surplus if monthly_surplus > 0 else float("inf")
            print(f"    {v:>3}/mo: surplus ${monthly_surplus:6.2f}/mo -> retro "
                  f"cleared in {months:4.0f} months ({months/12:.1f}y)")

    print("\n=== where the discounts go underwater without sub revenue ===")
    print("(fee alone vs ex-retro requirement, per aov, 100 orders/mo)")
    for r in [60, 120, 200, 250, 650]:
        req = exretro_req(r, 100)
        cells = []
        for tier in TIERS:
            f = fee(tier, r)
            mark = "ok" if f >= req else "under"
            cells.append(f"{tier.replace('integrated ','')} ${f:5.2f} {mark}")
        print(f"  ${r:>4} req ${req:5.2f} | " + " | ".join(cells))

    print("\n=== subscriber break-even per candidate cell (2 orders/sub/mo) ===")
    for tier in TIERS:
        if tier == "free 10%": continue
        gap = blend_avg(lambda r: (fee("free 10%", r) - fee(tier, r)))
        price = TIERS[tier][2]
        need = price / gap if gap else float("inf")
        print(f"  {tier:18} discount ${gap:.2f}/order, price ${price:.0f}/mo "
              f"-> fee-only break-even {need:.1f} orders/sub/mo "
              f"{'(capacity carries below)' if need > 2 else '(fee-positive at 2)'}")
