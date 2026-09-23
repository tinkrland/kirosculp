# mock finance flow: draft before integration

**status:** architecture and test plan, not an installed stack or live payment capability. Documented 2026-09-23.

## decision and caveat

Pair Spree Commerce with a Stripe-compatible local mock for checkout experiments, while retaining Supabase/Postgres as Sculptura's operational source of truth. Represent buyer, platform, creator, manufacturer, tax, shipping, reserves, and payment-processor positions as **logical accounts in an internal balanced ledger**. A fake Stripe API object is not a regulated bank balance or a provider-backed connected account.

- **Spree:** trial commerce façade for cart, checkout, order and seller features. Adapt its product/order model to reference immutable design release IDs, selected alloy/size, and trusted route/price snapshots. Do not assume installing Spree replaces the existing Platform or Supabase; run a narrow spike first. Spree 6 documentation currently describes open-source seller order splits, a payout ledger, and Stripe Connect transfers. Validate the exact version, packaging, interfaces, and licensing before adopting those features.
- **FetchSandbox:** first candidate for stateful Stripe-like HTTP responses and failure scenarios. It advertises Accounts, Transfers, PaymentIntents, refunds, disputes, and webhooks, but the public feature listing does **not** prove end-to-end Connect semantics, payout accounting, Stripe Elements compatibility, or parity with the exact Spree integration. Test the required endpoints and payloads rather than inferring them from the resource list.
- **localstripe:** useful for standalone local Payments and some webhook tests, but its README explicitly says **no Stripe Connect support**. It cannot by itself model the requested artist and manufacturer transfer buckets.
- **Adapter/fake ledger:** a small server-side payment port calls the selected mock. The authoritative logical buckets and their transitions live in Supabase, not in either mock provider. No real keys or cards are used. If the Spree gateway hardcodes Stripe URLs, use a configurable SDK/API base URL or a narrow gateway adapter; avoid a global network reroute. Browser-side Elements/Checkout calls need separate testing, since rerouting server requests alone will not intercept browser traffic.

## ownership and event boundaries

```mermaid
flowchart LR
  Buyer --> Spree[Spree checkout spike]
  Spree --> Ops[Sculptura operations API]
  Ops --> DB[(Supabase Postgres: purchases, ledger, outbox)]
  Ops --> Pay[Payment adapter]
  Pay --> Mock[FetchSandbox or localstripe]
  Mock --> Hook[Webhook inbox]
  Hook --> Ops
  Ops --> Mfg[Manufacturing route and order adapter]
  DB -. sanitized read projection .-> Graph[(FalkorDB)]
  DB -. read-only reporting .-> BI[Apache Superset before v1]
```

Spree owns the prototype cart and checkout surface. The Sculptura operations API validates the exact design release, eligible material/size, destination, route, quote expiry, pricing mode, tax and fee policy, and creator before creating the canonical purchase. Spree order ID is an external commerce reference, not a second authoritative settlement record. No platform-controlled browser field can assert payment success or change the net earnings.

## mock state machine

1. **Quote:** route-aware, expiry-bound snapshot computes one of two modes: fixed creator net implies calculated retail, or fixed retail implies calculated creator net. Snapshot includes exact release hash, currency, tax presentation, manufacturer quote, shipping, processor assumptions, policy versions, and allocation amounts.
2. **Order intent:** Spree sends a checkout request with a stable idempotency key; Operations creates pending purchase and ledger correlation IDs in Supabase. A retry returns the same purchase.
3. **Authorization:** payment adapter asks the mock to authorize the buyer charge. Record provider intent ID. **Authorization is not captured money and does not credit a payable bucket.** Test declines, 3DS, timeouts, duplicate replies, and expiry.
4. **Capture:** only after server-side quote and availability recheck, capture via the adapter; settle purchase state from authenticated, deduplicated provider webhook or verified provider read, never browser redirect alone. Post balanced ledger entries transactionally with an outbox record. This is the moment simulated funds enter the platform clearing position.
5. **Allocate:** assign the captured amount to creator payable pending, manufacturer payable, taxes payable, delivery/insurance payable, platform contribution, and explicit reserves/processing expenses according to the immutable snapshot. These are **bookkeeping allocations**, not automatic Stripe Connect transfers.
6. **Manufacture:** create one idempotent production order for the exact release and accepted route. Approve any mock manufacturer disbursement only against a real order/quote reference and a configured milestone; do not send actual virtual cards in this prototype.
7. **Fulfill and release:** ingest production and shipment events; after the configured delivery, acceptance, and claim policy, move creator payable from pending to eligible, then record provider transfer/payout results if that adapter can model them. Use a separate test of actual Connect semantics later.
8. **Exceptions:** authorization failure returns to payment pending; capture failure never dispatches production. Handle quote expiry, partner rejection, refunds before/after manufacturing, partial refunds, disputes, payout failure, duplicate/out-of-order webhooks, reversals, and reconciliation mismatches with compensating entries, not ledger edits.
9. **Reconcile:** compare Spree order reference, provider intent/charge/refund IDs, canonical purchase, ledger sums, partner charge, creator liability and outbox status. Alert on unmapped or duplicated events.

### illustrative balanced capture (not pricing policy)

For a hypothetical **120 unit** buyer charge, a debit of 120 to mock processor clearing is balanced by credits of 50 to creator payable pending, 40 to manufacturer payable, 10 to tax payable, 10 to delivery payable, and 10 to platform gross contribution. Each side totals 120. In reality, processor fees, insurance, reserves, refunds, tax treatment, seller-of-record duties, and timing change these entries. The buyer is an external counterparty, not an internal wallet with spendable fake funds.

## first spike and exit criteria

- Pin versions and licenses of Spree, its Stripe extension, and the chosen mock.
- Trace the exact HTTP calls made by the Spree payment integration, including browser-side flows, webhook signature handling, and Connect account/transfer calls. Exercise those against FetchSandbox; use localstripe only for Payments cases it demonstrably supports.
- Implement one narrow order: listed metal-only release, eligible route, server-computed two-way price snapshot, mock authorization/capture, webhook, balanced allocation, fake manufacturer milestone, and creator payout eligibility.
- Assert invariants: all entries balance per currency, one capture creates at most one settled purchase, no production before verified capture, no paid payout from an authorization, no negative creator earnings, release ID/hash never change, refund/reversal entries reconcile.
- Exercise declined, expired, duplicated, out-of-order, refunded, disputed, and partner-failure cases. If the mock does not support the required semantics, substitute a purpose-built test adapter rather than distorting the production payment design to fit it.

**Not escrow:** internally holding or delaying a creator payable is not legal escrow. Money movement, merchant of record, Connect charge type, reserves, payouts, consumer rights, and any actual escrow arrangement require separate provider and legal review before live transactions.

## source checks

- Spree marketplace guide: https://spreecommerce.org/docs/use-case/marketplace/capabilities
- Spree Stripe integration: https://github.com/spree/spree_stripe
- FetchSandbox Stripe feature listing: https://fetchsandbox.com/stripe
- localstripe limitation: https://github.com/adrienverge/localstripe
