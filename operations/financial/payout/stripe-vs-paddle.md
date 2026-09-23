---
title: payouts: paddle vs stripe
summary: why stripe connect fits sculptura's payout shape and paddle's merchant-of-record model doesn't.
---

# payouts: paddle vs stripe

the question was whether to look at paddle before committing further to stripe. short answer: **stripe (specifically stripe connect) is the right foundation, and the existing admin routing panel already assumed this**: `SettingsPayout.jsx` and `AdminRouting.jsx` both list `stripe_connect` as "planned" already, before this comparison was even asked for. paddle doesn't fit the shape of what sculptura actually needs to pay out.

## what paddle actually is

paddle is a **merchant of record (mor)**. that means paddle itself is legally the seller on every transaction: it collects the money, remits sales tax/vat across 270+ jurisdictions, handles chargebacks, and pays the business a net amount after its all-in fee (currently ~5% + 50¢, positioned against stripe's stacked-tooling cost of ~7-9%). it's built for **one business selling its own subscriptions or digital products**: saas billing, in-app purchases, software licenses. that's paddle's entire product surface: billing, checkout, subscriptions, tax compliance, dunning, metrics.

## why that doesn't match sculptura

sculptura isn't one seller. it's a platform where potentially thousands of independent creators each need:
- their own payout destination (bank, paypal, wise: already modeled in `market_accounts.payout_method`)
- their own earnings number, computed per sale, after manufacturing cost and platform fee
- money that has to eventually reach *them*, not just reach sculptura

paddle has no product for that. it's designed to have one seller of record, not to split a transaction between a platform and many independent payees with individual kyc, individual payout schedules, and individual tax situations. using paddle would mean paddle is the seller for every creator's jewelry, which doesn't map to "the creator sets their price/earnings" or to a platform that needs to disburse a specific creator's cut to a specific bank account.

## why stripe connect is the actual fit

stripe connect is purpose-built for exactly this shape: a platform, many connected accounts (creators), and a split on every transaction (platform fee + manufacturing cost pass-through + creator earnings). concretely, it gives sculptura:
- **express or standard connected accounts** per creator, with stripe handling kyc/onboarding
- **destination charges or separate charges/transfers**, so a single checkout can route the creator's earnings to their connected account while sculptura keeps its fee
- **payout scheduling** per connected account, independent of platform-level payouts
- this is also what the existing `AdminRouting.jsx` payout options already anticipated (`manual` now, `stripe_connect (planned)` next): no plan change required, just execution

## sequencing (matches the existing "planned" state, not a new plan)

1. **now (already shipped):** `stripe_demo` sandbox routing, manual payouts. safe, nothing real moves.
2. **next:** `stripe_live_manual`: real checkout charges, order routing still done by hand while manufacturer integrations firm up.
3. **then:** connect creators as stripe connected accounts; move `payout_mode` from `manual` to `stripe_connect`. this is the step that actually pays creators without a human wiring money by hand.
4. **then:** `stripe_live_auto`: paid orders push straight to the default (or routed) manufacturer once that integration is live.

this doesn't block on incorporation-specific paperwork being finished first for the *sandbox and manual* steps: only live charges and live connected-account payouts need the business entity in place, which matches "stripe comes after incorporating, yeah yeah, planned" from the standing context.

## what this means for two-way pricing

stripe connect doesn't compute the earnings-vs-retail-price math: that's console's job (see `architecture.md`). connect just needs the final split at the moment of charge: `retail price → platform fee + manufacturing cost pass-through + creator earnings transfer`. whichever side the creator fixed (earnings or retail price), by the time checkout runs, console has already resolved both numbers: connect just executes the transfer with them.
