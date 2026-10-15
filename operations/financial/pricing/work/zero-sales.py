"""zero-sales breakeven: subscription revenue only, no orders ever.

scenario: the platform runs, creators subscribe and use the studio,
but nobody buys anything. no fee revenue, no per-order costs. what
keeps the lights on: infra, per-creator fixed overhead, and the
studio compute creators consume. question: how many creators at
what free:paid mix does subscription revenue need?

grounding: infra and the $10/mo per-creator fixed come from
fee-balance-analysis.md (its assumption - but that line is support
overhead for SELLING creators, and this scenario has none). the
lights-on reading: no stripe, no manufacturer api, no support load;
only hosting, storage, db, bandwidth and allowance compute
($1/mo for a non-selling creator: storage + account admin, support
being order-driven) is the sensitivity case. studio compute from the
rate-limit matrix in studio-credits.md at hypothesis utilization.
"""

INFRA = 60
# lights-on marginal per creator (hypothesis, decomposed):
#   storage $0.05 (parametric states kb-scale; meshes+renders
#     ~100-500 mb per active creator at object-storage rates)
#   db rows $0.05 (account, designs, ledger lines)
#   bandwidth $0.15 (studio webgl sessions, previews)
#   admin/tooling amortization $0.25
#   = $0.50/mo, plus allowance consumption at utilization.00          # usd/mo, fee-balance-analysis.md
FIXED_CONSERVATIVE = 10.00  # the analysis's per-creator fixed, usd/mo
FIXED_LIGHTS_ON = 0.50      # marginal non-selling creator, usd/mo
UTIL = 0.20            # hypothesis: typical allowance consumption

# worst-case monthly studio cost per tier (from the rate-limit matrix)
WORST = {"free": 2.44, "starter": 16.60, "lite": 33.20,
         "standard": 56.50, "pro": 100.50}
PRICE = {"free": 0.0, "starter": 12.99, "lite": 19.99,
         "standard": 24.90, "pro": 29.99}
# launch mix hypothesis (share of all creators)
MIX = {"free": 0.75, "starter": 0.12, "lite": 0.08,
       "standard": 0.03, "pro": 0.02}


def tier_net(tier, fixed):
    """subscription net per creator per month, zero sales."""
    compute = WORST[tier] * UTIL
    return PRICE[tier] - fixed - compute


def scenario(fixed, label):
    free_cost = fixed + WORST["free"] * UTIL
    paid_net = sum(MIX[t] * tier_net(t, fixed) for t in MIX if t != "free")
    paid_share = sum(v for k, v in MIX.items() if k != "free")
    per_paid = paid_net / paid_share
    ratio_ok = per_paid / free_cost  # max free per paid sub
    net_per_creator = sum(MIX[t] * tier_net(t, fixed) for t in MIX)
    be_creators = INFRA / net_per_creator if net_per_creator > 0 else None
    print(f"=== {label} (util {UTIL:.0%}, fixed ${fixed:.0f}/mo/creator) ===")
    for t in ["free", "starter", "lite", "standard", "pro"]:
        n = tier_net(t, fixed)
        print(f"  {t:9} net/sub ${n:7.2f}/mo")
    print(f"  free creator cost: ${free_cost:.2f}/mo")
    print(f"  paid blended net: ${per_paid:.2f}/sub/mo")
    print(f"  mix net/creator: ${net_per_creator:+.2f} -> "
          f"{'breakeven at ' + f'{be_creators:,.0f} creators' if be_creators else 'no breakeven at any scale'}")
    print(f"  max free:paid ratio: {ratio_ok:.1f}:1\n")


if __name__ == "__main__":
    scenario(FIXED_CONSERVATIVE, "conservative: analysis's $10/creator fixed")
    scenario(FIXED_LIGHTS_ON, "lights-on: hosting/storage/db/bandwidth only")
