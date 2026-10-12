#!/usr/bin/env python3
# pricing model verification for the draft fee policy (../fee-policy.md)
#
# status: scratch work product on the feepolicy drafting branch. not a spec.
# every rate, floor and cost figure below is a hypothesis placeholder, unfrozen
# only by the owner. manufacturing costs are invented pending real partner
# quotes (manufacturing/quotes/README.md: status missing).
#
# run: python3 verify.py   (no dependencies; asserts its own balance invariants)

from dataclasses import dataclass

# ---------------------------------------------------------------- fee policy
# mirrors the fee_policy object proposed in ../fee-policy.md. all hypothesis.

POLICY = {
    "policy_id": "fee-policy-draft-v1",
    "platform_fee": {
        "rate_bps": 1000,           # 10% [HYPOTHESIS]
        "fixed_cents": 50,          # $0.50 [HYPOTHESIS]
        "floor_cents": 200,          # $2.00 minimum per order [HYPOTHESIS]
        "fee_base": "retail - shipping - insurance - tax",
    },
    "subscription_modifiers": {       # discount_bps off the rate [HYPOTHESIS]
        "free": 0,
        "studio": 300,                # 7%
        "platform": 500,              # 5%
    },
    "channel_modifiers": {           # surcharge_bps on the rate [HYPOTHESIS]
        "native": 0,
        "etsy": 350,                  # ~etsy 6.5% transaction + $0.20 listing pass-through, net of what stripe already covers
        "shopify": 150,
    },
    "payment_cost": {                 # stripe assumptions, verify against the real agreement
        "domestic_bps": 290,
        "intl_card_bps": 150,
        "fx_bps": 100,
        "fixed_cents": 30,
        "payout_bps": 25,
        "payout_fixed_cents": 25,
    },
    "reserve": {                       # hold, not a deduction: payout timing only
        "base_bps": 300,              # 3% [HYPOTHESIS]
        "high_value_bps": 500,        # 5% above threshold [HYPOTHESIS]
        "high_value_threshold_cents": 30000,
    },
    "insurance": {
        "bps": 150,                   # 1.5% of retail [HYPOTHESIS]
        "min_cents": 100,
    },
}

# ---------------------------------------------------------------- compute core

def compute(retail_c, mfg_c, ship_c, *, tier="free", channel="native",
            intl_card=False, fx=False, policy=POLICY, tax_c=0):
    """full term breakdown for a locked retail. returns dict of integer cents."""
    pf = policy["platform_fee"]
    pc = policy["payment_cost"]
    rs = policy["reserve"]
    ins = policy["insurance"]

    rate_bps = pf["rate_bps"] \
        - policy["subscription_modifiers"][tier] \
        + policy["channel_modifiers"][channel]
    assert rate_bps > 0, "negative effective fee rate"

    insurance = max(ins["min_cents"], round(retail_c * ins["bps"] / 10000))
    reserve_bps = rs["high_value_bps"] if retail_c > rs["high_value_threshold_cents"] else rs["base_bps"]
    reserve = round(retail_c * reserve_bps / 10000)
    fee_base = retail_c - ship_c - insurance - tax_c
    fee = max(pf["floor_cents"], round(fee_base * rate_bps / 10000) + pf["fixed_cents"])
    pay_bps = pc["domestic_bps"] + (pc["intl_card_bps"] if intl_card else 0) + (pc["fx_bps"] if fx else 0)
    payment = round(retail_c * pay_bps / 10000) + pc["fixed_cents"]
    net = retail_c - mfg_c - ship_c - insurance - tax_c - reserve - fee - payment

    out = dict(retail=retail_c, mfg=mfg_c, shipping=ship_c, insurance=insurance,
               tax=tax_c, reserve=reserve, fee=fee, payment=payment, net=net,
               tier=tier, channel=channel)
    assert sum(out[k] for k in ("mfg", "shipping", "insurance", "tax",
                               "reserve", "fee", "payment", "net")) == retail_c, \
        "terms do not balance to retail"
    assert out["net"] > 0, "negative creator net: block in the pricing service"
    return out


def solve_retail_for_net(net_c, mfg_c, ship_c, **kw):
    """lock-earnings mode: smallest retail (whole cents) whose net >= net_c."""
    lo, hi = 1, 100_000_00
    while lo < hi:
        mid = (lo + hi) // 2
        try:
            if compute(mid, mfg_c, ship_c, **kw)["net"] >= net_c:
                hi = mid
            else:
                lo = mid + 1
        except AssertionError:
            lo = mid + 1
    out = compute(hi, mfg_c, ship_c, **kw)
    assert out["net"] >= net_c
    return out


def payout_fee(net_c):
    pc = POLICY["payment_cost"]
    return round(net_c * pc["payout_bps"] / 10000) + pc["payout_fixed_cents"]


def dollars(c):
    return f"${c/100:.2f}"

# ------------------------------------------------- worked examples (HYPOTHESES)
# mfg costs invented pending real partner quotes. ship: $8 domestic / $18 intl.

EXAMPLES = [
    ("silver pendant 60 us domestic",        dict(retail_c=6000,  mfg_c=1800,  ship_c=800),  {}),
    ("silver pendant 60 eu buyer intl+fx",    dict(retail_c=6000,  mfg_c=1800,  ship_c=1800), dict(intl_card=True, fx=True)),
    ("14k ring 140 us domestic",               dict(retail_c=14000, mfg_c=5200,  ship_c=800),  {}),
    ("14k ring 140 studio tier",              dict(retail_c=14000, mfg_c=5200,  ship_c=800),  dict(tier="studio")),
    ("18k piece 450 intl+fx platform tier",   dict(retail_c=45000, mfg_c=16500, ship_c=1800), dict(intl_card=True, fx=True, tier="platform")),
    ("house-line charm 38 domestic",          dict(retail_c=3800,  mfg_c=1500,  ship_c=800),  {}),
    ("thin margin 60, mfg 38 domestic",       dict(retail_c=6000,  mfg_c=3800,  ship_c=800),  {}),
    ("60 domestic via etsy channel",          dict(retail_c=6000,  mfg_c=1800,  ship_c=800),  dict(channel="etsy")),
]


def run_examples():
    print(f"{'example':42} {'fee':>7} {'pay':>6} {'net':>8} {'reserve':>8}  bal")
    for name, args, kw in EXAMPLES:
        d = compute(**args, **kw)
        print(f"{name:42} {dollars(d['fee']):>7} {dollars(d['payment']):>6} "
              f"{dollars(d['net']):>8} {dollars(d['reserve']):>8}  ok")
        # lock-earnings cross-check: solving for that net reproduces the retail
        s = solve_retail_for_net(d["net"], args["mfg_c"], args["ship_c"], **kw)
        assert abs(s["retail"] - args["retail_c"]) <= 1, (name, s)
    # house line: payee collapses, platform keeps fee + net
    h = compute(retail_c=3800, mfg_c=1500, ship_c=800)
    print(f"\nhouse charm: platform keeps fee {dollars(h['fee'])} + collapsed net "
          f"{dollars(h['net'])} = {dollars(h['fee'] + h['net'])} "
          f"({100 * (h['fee'] + h['net']) / h['retail']:.0f}% of retail, before opex)")
    # subscriber break-even [HYPOTHESIS rates]
    for tier, price in (("studio", 1500), ("platform", 3900)):
        disc = POLICY["subscription_modifiers"][tier]
        savings = disc / 10000 * 12000  # cents saved per $120-aov order
        print(f"{tier} break-even at $120 aov: {price / savings:.1f} orders/month")
    print("all examples pass\n")


if __name__ == "__main__":
    run_examples()
