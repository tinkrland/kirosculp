// parked-market-policy.mjs
//
// the named list of markets where a creator who is resident there, and has no
// verified bank rail in an enabled market, is told "not yet" at payout
// onboarding (owner ruling 2026-10-06, the faizah aisler case).
//
// this is roadmap state: the market is parked for a later version in
// operations/country-rollout/creator-payout-rails.json. it is not fraud, not a
// legal event, and not a trust input. only markets that are parked for roadmap
// reasons belong here. a sanctions regime, an fatf grey-list hold or an
// out-of-scope market must never be on this list, because "not yet" promises a
// future that those markets are not on track for. scripts/check-parked-hold-policy.mjs
// enforces that against the rails matrix and the embargo list.
//
// the list is revisable config, like the strict-corridor map and the embargo list:
// extend it through a reviewed change. a market that opens (moves from
// parked_markets to markets in the rails matrix) stops holding at once, with no
// change here, because eligibility reads the matrix at runtime. the stale entry
// can then be removed at leisure.
//
// seeded with sa only, the one market the owner named. ae, cr and uy are also
// v2 candidates in the matrix. they are not included because the owner has not
// ruled on them, and qa, bh and om are "no v2 plan", where "not yet" may promise
// something the roadmap does not intend. both are recorded as owner decisions.

export const PARKED_MARKET_HOLD = Object.freeze({
  listVersion: 'v1',
  markets: Object.freeze([
    Object.freeze({
      market: 'SA',
      ruling: 'owner ruling 2026-10-06, faizah aisler case',
      basis: 'gcc v2 candidate, parked in the rails matrix',
    }),
  ]),
});

/** @param {typeof PARKED_MARKET_HOLD} policy */
export const holdMarketCodes = (policy = PARKED_MARKET_HOLD) => new Set(policy.markets.map((m) => m.market));
