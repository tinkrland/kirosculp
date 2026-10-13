#!/usr/bin/env python3
"""tier rate schedule vs the waterfall: what each tier's fee leaves.

owner ladder 2026-10-12 (revised): free / starter / lite / standard /
pro, each an integrated studio+platform subscription (one sub covers
both sides; the fee percentage is the checkout expression - free
creators pay the higher rate, subscribers lower).

ruled: prices ($0 / $12.99 / $19.99 / $24.69 / $29.99), free at 20%,
free's 5 listings, and the CATALOG-CAP RULE: allowances cap distinct
active listings, never sales volume. a free creator's 5 listings can
each sell unlimited units; the fee applies to every sale.

open (owner): fee % per paid tier (hypothesis ladder 16/14/12/8 (pro 8% ruled 2026-10-13),
anchored to full-stack value: the fee pays for the free design
studio, storefront, routing and compliance - sculptura is not just
etsy, so deep-discount cells like 5-8% undersell the stack),
listing counts for paid tiers (hypothesis 10/20/30/40),
compile-credit counts per tier.

deterministic and reproducible: python3 tier-schedule.py
"""

from buildup import (stack, inference_alloc, mfg_alloc, retro_alloc,
                     fee_base, RETRO)

# ---------------------------------------------------------------- params
# bps, fixed, monthly price, listings/mo (catalog cap, never sales cap)
TIERS = {
    "free 22%":     (2200, 0.50, 0.0,   5),
    "starter 16%":  (1600, 0.50, 12.99, 10),
    "lite 14%":     (1400, 0.50, 19.99, 20),
    "standard 12%": (1200, 0.50, 24.90, 30),
    "pro 8%":       (800,  0.50, 29.99, 40),
}
FLOOR = 2.00
PROFIT_BPS = 200
ORDERS_PER_SUB = 2.0      # hypothesis
TIER_SHARES = {"free 22%": 0.75, "starter 16%": 0.12,
               "lite 14%": 0.08, "standard 12%": 0.03,
               "pro 8%": 0.02}   # hypothesis
BLEND = {200: 60, 650: 15, 95: 25}   # launch metal mix
VOLUMES = [50, 100, 200]


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
    print("=== the ladder (ruled prices; free 20% ruled; fee % hyp) ===")
    for tier, (bps, fixed, price, listings) in TIERS.items():
        print(f"  {tier:12} ${price:>5.2f}/mo, {listings:>2} listings/mo, "
              f"fee {bps/100:.0f}% + ${fixed:.2f}")

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

    print("\n=== launch waterfall: 75/12/8/3/2 tier mix, retro $21,200 ===")
    for v in VOLUMES:
        tot = sum(BLEND.values())
        monthly_surplus = 0.0
        for tier, share in TIER_SHARES.items():
            for r, n in BLEND.items():
                monthly_surplus += (share * v) * (n / tot) * (
                    fee(tier, r) + sub_rev_per_order(tier) - exretro_req(r, v))
        months = RETRO / monthly_surplus if monthly_surplus > 0 else float("inf")
        print(f"{v:>3}/mo: surplus ${monthly_surplus:7.2f}/mo -> retro "
              f"cleared in {months:4.0f} months ({months/12:.1f}y)")

    print("\n=== constant break-even check: gmv where each sub pays for itself ===")
    for tier in TIERS:
        if tier == "free 20%": continue
        disc_points = (2000 - TIERS[tier][0]) / 10000
        price = TIERS[tier][2]
        print(f"  {tier:12} discount {disc_points*100:.0f} pts on fee_base -> "
              f"break-even gmv ${price / disc_points:6.2f}/mo")

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

    print("\n=== allowances cap catalog, never sales (ruling) ===")
    for tier, (_, _, price, listings) in TIERS.items():
        note = ("  5 strong listings selling 50 units/mo stay free: "
                "20% on every sale, fair game" if not price else
                f"  ${price:.2f}/mo buys {listings} distinct active listings")
        print(f"  {tier:12} {listings:>2} distinct active listings; "
              f"unlimited units per listing - {note}")
