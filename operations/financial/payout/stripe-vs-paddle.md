---
title: payouts — paddle vs stripe
summary: why stripe connect fits sculptura's payout shape and paddle's merchant-of-record model doesn't.
---

# Payouts: paddle vs Stripe

The question was whether to look at paddle before committing further to stripe. Short answer: **Stripe (specifically Stripe connect) is the right foundation, and the existing admin routing panel already assumed this** — `SettingsPayout.jsx` and `AdminRouting.jsx` both list `stripe_connect` as "planned" already, before this comparison was even asked for. Paddle doesn't fit the shape of what Sculptura actually needs to pay out.

## What paddle actually is

Paddle is a **merchant of record (mor)**. That means paddle itself is legally the seller on every transaction — it collects the money, remits sales tax/vat across 270+ jurisdictions, handles chargebacks, and pays the business a net amount after its all-in fee (currently ~5% + 50¢, positioned against Stripe's stacked-tooling cost of ~7-9%). It's built for **one business selling its own subscriptions or digital products** — saas billing, in-app purchases, software licenses. That's paddle's entire product surface: billing, checkout, subscriptions, tax compliance, dunning, metrics.

## Why that doesn't match Sculptura

Sculptura isn't one seller. It's a platform where potentially thousands of independent creators each need:
- Their own payout destination (bank, paypal, wise — already modeled in `market_accounts.payout_method`)
- Their own earnings number, computed per sale, after manufacturing cost and platform fee
- Money that has to eventually reach *them*, not just reach Sculptura

Paddle has no product for that. It's designed to have one seller of record, not to split a transaction between a platform and many independent payees with individual KYC, individual payout schedules, and individual tax situations. Using paddle would mean paddle is the seller for every creator's jewelry, which doesn't map to "the creator sets their price/earnings" or to a platform that needs to disburse a specific creator's cut to a specific bank account.

## Why Stripe connect is the actual fit

Stripe connect is purpose-built for exactly this shape: a platform, many connected accounts (creators), and a split on every transaction (platform fee + manufacturing cost pass-through + creator earnings). Concretely, it gives Sculptura:
- **Express or standard connected accounts** per creator, with Stripe handling kyc/onboarding
- **Destination charges or separate charges/transfers**, so a single checkout can route the creator's earnings to their connected account while Sculptura keeps its fee
- **Payout scheduling** per connected account, independent of platform-level payouts
- This is also what the existing `AdminRouting.jsx` payout options already anticipated (`manual` now, `stripe_connect (planned)` next) — no plan change required, just execution

## Sequencing (matches the existing "planned" state, not a new plan)

1. **Now (already shipped):** `stripe_demo` sandbox routing, manual payouts. Safe, nothing real moves.
2. **Next:** `stripe_live_manual` — real checkout charges, order routing still done by hand while manufacturer integrations firm up.
3. **Then:** connect creators as Stripe connected accounts; move `payout_mode` from `manual` to `stripe_connect`. This is the step that actually pays creators without a human wiring money by hand.
4. **Then:** `stripe_live_auto` — paid orders push straight to the default (or routed) manufacturer once that integration is live.

This doesn't block on incorporation-specific paperwork being finished first for the *sandbox and manual* steps — only live charges and live connected-account payouts need the business entity in place, which matches "Stripe comes after incorporating, yeah yeah, planned" from the standing context.

## What this means for two-way pricing

Stripe connect doesn't compute the earnings-vs-retail-price math — that's console's job (see `architecture.md`). Connect just needs the final split at the moment of charge: `retail price → platform fee + manufacturing cost pass-through + creator earnings transfer`. Whichever side the creator fixed (earnings or retail price), by the time checkout runs, console has already resolved both numbers — connect just executes the transfer with them.
