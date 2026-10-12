#!/usr/bin/env python3
"""tier rate schedule vs the waterfall: what each tier's fee leaves.

owner ladder 2026-10-12: free + starter + standard + pro, each an
integrated studio+platform subscription (one sub covers both sides;
studio and platform are not separate tier products). compares each
tier's checkout fee against the ex-retro requirement from buildup.py,
then runs the revenue waterfall:
fee + subscription revenue -> direct+inference+mfg -> retro -> profit.

ruled: prices and listing allowances.
open (owner): fee % per paid tier (hypothesis ladder below), pro's
listing count, compile-credit counts per tier.

deterministic and reproducible: python3 tier-schedule.py
"""

from buildup import (stack, inference_alloc, mfg_alloc, retro_alloc,
                     fee_base, RETRO)

# ---------------------------------------------------------------- params
# bps, fixed, monthly price, listings/month
TIERS = {
    "free 10%":     (1000, 0.50, 0.0,   5),    # ruled: 5 listings, higher fee
    "starter 8%":   (800,  0.50, 12.99, 10),    # ruled price/allowance; 8% hypothesis
    "standard 7%":  (700,  0.50, 19.99, 20),    # ruled price/allowance; 7% hypothesis
    "pro 5%":       (500,  0.50, 27.49, 40),    # ruled price; listings + 5% hypothesis
}
FLOOR = 2.00
PROFIT_BPS = 200
ORDERS_PER_SUB = 2.0      # hypothesis
TIER_SHARES = {"free 10%": 0.80, "starter 8%": 0.10,
               "standard 7%": 0.07, "pro 5%": 0.03}  # hypothesis
BLEND = {200: 60, 650: 15, 95: 25}   # launch metal mix
VOLUMES = [50, 100, 200]
SALES_PER_LISTING_PER_2MO = 1.0      # hypothesis: 1 sale per listing per 2mo


def fee(tier, retail):
    bps, fixed, price, listings = TIERS[tier]
    return max(FLOOR, fee_base(retail) * bps / 10000 + fixed)


def sub_rev_per_order(tier):
    price = TIERS[tier][2]
    return price / ORDERS_PER_SUB if price else 0.0


def exretro_req(retail, monthly_orders):
    return (stack(retail) + inference_alloc() + mfg_alloc(monthly_orders)
            + PROFIT_BPS / 10000 * fee_base(retail))


def blend_avg(fn):
    tot = sum(BLEND.values())
    return sum(n * fn(r) for r, n in BLEND.items()) / tot


if __name__ == "__main__":
    print("=== the ladder (ruled prices/allowances, fee % hypothesis) ===")
    for tier, (bps, fixed, price, listings) in TIERS.items():
        ruled = "ruled" if price else "ruled: $0"
        print(f"  {tier:12} ${price:>5.2f}/mo, {listings:>2} listings/mo, "
              f"fee {bps/100:.0f}% + ${fixed:.2f} ({ruled}; "
              f"{'fee % hypothesis' if tier != 'free 10%' else 'fee % = the free higher fee'})")

    print("\n=== per-tier fee vs ex-retro requirement (blended mix aov $205) ===")
    for v in VOLUMES:
        req = blend_avg(lambda r: exretro_req(r, v))
        print(f"\nat {v} orders/mo, requirement (ex-retro, profit 200 bps): "
              f"${req:.2f}/order")
        for tier in TIERS:
            f = blend_avg(lambda r: fee(tier, r))
            s = sub_rev_per_order(tier)
            net = f + s - req
            print(f"  {tier:12} fee ${f:5.2f} + sub ${s:4.2f} -> "
                  f"waterfall {'+' if net >= 0 else ''}${net:.2f}/order")

    print("\n=== launch waterfall: 80/10/7/3 tier mix, retro $21,200 ===")
    for v in VOLUMES:
        tot = sum(BLEND.values())
        monthly_surplus = 0.0
        for tier, share in TIER_SHARES.items():
            for r, n in BLEND.items():
                monthly_surplus += (share * v) * (n / tot) * (
                    fee(tier, r) + sub_rev_per_order(tier) - exretro_req(r, v))
        months = RETRO / monthly_surplus if monthly_surplus > 0 else float("inf")
        print(f"{v:>3}/mo: surplus ${monthly_surplus:6.2f}/mo -> retro "
              f"cleared in {months:4.0f} months ({months/12:.1f}y)")

    print("\n=== where each rate is underwater without sub revenue ===")
    print("(fee alone vs ex-retro requirement, per aov, 100 orders/mo)")
    for r in [60, 120, 200, 250, 650]:
        req = exretro_req(r, 100)
        cells = []
        for tier in TIERS:
            f = fee(tier, r)
            mark = "ok" if f >= req else "under"
            cells.append(f"{tier} ${f:5.2f} {mark}")
        print(f"  ${r:>4} req ${req:5.2f} | " + " | ".join(cells))

    print("\n=== subscriber break-even per paid tier (2 orders/sub/mo) ===")
    for tier in TIERS:
        if tier == "free 10%": continue
        gap = blend_avg(lambda r: (fee("free 10%", r) - fee(tier, r)))
        price = TIERS[tier][2]
        need = price / gap if gap else float("inf")
        print(f"  {tier:12} discount ${gap:.2f}/order, price ${price:.2f}/mo "
              f"-> fee-only break-even {need:.1f} orders/sub/mo")

    print("\n=== who the allowances serve (allowance as capacity price) ===")
    for tier, (_, _, price, listings) in TIERS.items():
        if tier == "free 10%":
            print(f"  free: 5 listings/mo caps the active catalog at 5; "
                  f"a creator selling more than ~{5 * SALES_PER_LISTING_PER_2MO / 2:.1f} "
                  f"orders/mo must upgrade")
        else:
            cap = listings * SALES_PER_LISTING_PER_2MO / 2
            print(f"  {tier:12} {listings:>2} listings supports ~{cap:>4.1f} "
                  f"orders/mo at 1 sale/listing/2mo")
