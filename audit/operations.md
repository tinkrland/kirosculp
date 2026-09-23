# finance, manufacturing, and operations source state

## what exists

- two-way pricing ideas and creator pricing settings exist in `src/lib/pricing.js`, `SettingsPricing.jsx`, and checkout/publish ui. they are not a single authoritative server equation using real route quotes.
- `sculptura.dev` has order rows and `place-order` server intake, but no real payment capture. `sculptura` has earlier overlapping checkout/order components that belong on the platform side.
- `manufacturers` and `platform_settings` tables, along with admin manufacturer/routing pages, hold records and controls. they are not a factory connection or route selector.
- the foundation defines design-release, shipping-market, manufacturing-capability, and creator-payout contracts. these are documentation/data, not deployed integrations.

## partial or missing

- **payment:** no proven provider authorization, capture, webhook verification, refund/reversal, idempotency, connected accounts, creator transfers, or reconciliation. for a pre-stripe spike use spree with localstripe for payment behavior and/or fetchsandbox where its endpoints actually support the needed scenario. stripe is intended only later for production integration. logical payout allocations are bookkeeping, not escrow or transfers.
- **settlement:** no double-entry journal of record, liability buckets, processing-cost accounting, risk reserve, or reliable payout release. evaluate formance ledger later; it must have an explicit role relative to supabase, the operational backend. the supabase + falkordb backend pairing is not a payments stack.
- **routing:** no partner capability enforcement, current quote and route reservation, tariff/hallmarking-aware route decision, or adapter that places a tracked production order. partner research is not proof of a connected manufacturer.
- **fulfillment:** no end-to-end manufacturing acceptance, cancellation, retry, production milestone, insured delivery, return, claim, or carrier reconciliation.
- **reporting:** buyer/creator dashboards include shells or estimates. apache superset is planned before v1 on a permissioned read-only reporting feed, not as a payment ledger.

## acceptance condition

an eligible buyer order binds to a trusted release and quote, goes through an idempotent verified payment state, produces balanced postings and a single approved production order, and reconciles partner, buyer, and creator states through delivery, claims, refunds, and payout. route rejection cannot be bypassed by a storefront or client amount.
