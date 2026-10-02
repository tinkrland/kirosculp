# platform: payments

escrow and payment holding for the commission and order flows. supabase is
the authoritative financial ledger; everything else is a front for it.

## owns

- escrow holds: the platform's record that money for an order or
  commission is being held, and its state
- the append-only platform ledger: every money movement as balanced
  debit/credit entry groups
- the sandbox gateway simulation and, later, the real gateway adapter
  interface

## does not own

- pricing math (the trusted pricing service computes the split; the ledger
  only records what it is told and proves the books balance)
- storefront checkout ui (spree, when it ships) or payout execution

## the model

an escrow hold is opened when a buyer commits to an order or commission.
its terms (kind, target, amount, currency, gateway) are immutable after
creation; only its state moves, and only along legal transitions:

    awaiting_payment -> held        payment captured by the gateway
    awaiting_payment -> cancelled   backed out before payment
    held             -> released   delivered/approved; creator net,
                                   manufacturing, and platform fee paid out
    held             -> refunded   dispute or cancellation after capture

released, refunded, and cancelled are terminal. the state machine is
enforced by a database trigger, so no client bug or stray write can invent
a transition.

every money movement is a balanced group in `ledger_entries`:
debit buyer_source / credit platform_escrow on capture, then debit
platform_escrow / credit creator_payable + manufacturer_payable +
platform_fee on release (or credit refund_source on refund). entries are
append-only: update and delete are revoked even from service_role.
corrections are new entries, never edits. `ledger_group_balances` exposes
any group whose debits and credits disagree.

the accounts today are buyer_source, platform_escrow, creator_payable,
manufacturer_payable, platform_fee, and refund_source. amounts are integer
cents with a currency code; no floats.

## access

the money tables are revoked from anon and authenticated entirely, and rls
gives admins read-only visibility for support and disputes. all writes go
through the server path (service_role), which itself cannot edit or delete
ledger entries. the escrow hold terms and state guards live in the
database, not in application code.

## gateways

the recorded sequencing stands: prototype with spree commerce plus
localstripe and/or fetchsandbox before involving stripe; stripe is the
intended production provider. this module currently simulates the
sandbox gateway end to end. the adapter boundary every gateway implements
is: open hold, capture (authorize and hold), release (split payout),
refund, plus webhook/idempotency semantics when the real ones arrive.
spree, when instantiated, records its checkout results through the same
ledger; it never becomes the ledger itself.

## order flow (localstripe prototype)

the order purchase path is live as the idempotent server operation 0004
deferred to. `gateway-adapter.js` is the single money boundary: the
localstripe provider speaks the stripe-shaped api (authorize with manual
capture, capture, refund, cancel) against a real localstripe server; the
sandbox provider is the pure simulation used by the commission flow.
`order-service.js` is the service itself: purchase (idempotency-key
lookup, authorize, order insert, escrow hold, capture, ledger entries,
hold to held), deliver (release split, guarded so the split must equal
the held amount before it pays out), and refund (gateway refund plus
ledger reversal, order cancelled). no client role can write any of this;
0008 added the `client_request_key` unique anchor, and the hold's
`gateway_ref` (payment intent id) is unique so webhook replays cannot
open a second hold.

## provider-handled payout verification

creator identity verification for payout is handled through stripe/persona;
sculptura integrates trusted eligibility/status rather than collecting and
reviewing government-id documents itself. no upfront creator-admission kyc
is introduced. payout minimums, delivery/claim windows and provider-required
verification remain distinct gates. this integration is not implemented by
the existing ledger simulations.

storefront publication separately requires a verified phone number and allowed verified
email. see [creator integrity](../creator-integrity/solution.md).

## simulation

`simulate-escrow-lifecycle.js` runs the whole commission escrow flow
against a real supabase project over postgrest with the service key:
capture, release, refund, every illegal transition, immutability,
append-only enforcement, and group balance checks.

`simulate-order-purchase.js` runs the order flow end to end through a
real localstripe server (start one with `localstripe --port 4242`,
default key `sk_test_123`):

    supabase_url=... supabase_service_role_key=... \
    stripe_url=http://localhost:4242 node simulate-order-purchase.js

    supabase_url=... supabase_service_role_key=... node simulate-escrow-lifecycle.js

it creates its own test rows and cannot delete them (the ledger is
append-only for service_role); cleanup is a management-api step owned by
the caller.

### recorded run 1, 2026-09-26, foundation project clmcmckaydkbkxuhfiyf

18/18 checks passed against the live project: hold creation, terms
immutability, illegal transitions rejected (awaiting_payment -> released,
terminal reopen), capture, release split, refund, append-only rejected for
service_role (403), all four entry groups balanced. sim rows were removed
afterward via the management api; the ledger sits at zero entries.

### recorded run 2, 2026-09-26, order flow through real localstripe (v1.15.10)

10/10 checks passed: purchase (authorize to requires_capture, order
placed, hold opened with gateway_ref = payment intent id, full capture,
capture group balanced), double submit with the same idempotency key
returned the original order (exactly one row for the key), delivery
released the 60/30/10 split with the split-equals-held guard, second order
refunded through the gateway with reversal entries, terminal hold
re-release rejected, all four groups balanced. sim rows removed afterward
via the management api; ledger at zero.

## spree order sync

spree is the storefront front: it owns the cart, checkout, and the
charge (the check payment method simulates gateway capture in the
prototype). when a spree order completes, `spree-order-sync.js` mirrors
it into this ledger: an orders row, an escrow hold (gateway
'spree-check', gateway_ref = the spree payment number), the balanced
capture entries, hold flipped to held. it never captures anything; it
only records what spree already did.

idempotency is the spree order number (`client_request_key =
spree:{number}`); a replay returns the existing order and writes
nothing. splits are not invented here: spree knows the retail total,
the trusted pricing service decides the split for the release path.

run it against a live spree (local or sandbox-proxied):

    spree_url=http://localhost:3000 \
    spree_api_key=pk_... spree_token=<cart token> spree_order=ord_xxx \
    [spree_proxy_auth='bearer <token>'  # if behind the blaxel port proxy] \
    supabase_url=... supabase_service_role_key=<service_role_jwt> \
    node spree-order-sync.js

the verified guest checkout sequence the sync consumes: create cart,
add item, patch email + shipping_address, create proposed shipments,
select a delivery rate on the fulfillment, add the payment (payment
method prefix id), complete. spree api v3 prefix ids: cart, ord, var,
pm, ful (shipment), dr (rate).

### recorded run 3, 2026-09-26, spree order mirrored live

guest checkout completed on the spree prototype (order r513075727,
$110: $100 prototype ring + $10 flat shipping, check payment
completed). the sync mirrored it: order row placed, escrow hold held
at 11000 cents with gateway_ref pm8z97wn, capture group balanced
(buyer_source debit 11000 / platform_escrow credit 11000). replay
returned the existing order with no new rows. no sim rows were
removed; this is a real mirrored storefront order.

## next

- the spree prototype now runs (blaxel sandbox, see platform/spree-prototype);
  replaying completed orders on a schedule (poll or webhook) and the
  delivery release for a spree-sourced order are the open pieces
- authenticated-role matrix cells once the platform rebuild owns a test
  harness with real users
- webhook and idempotency design before any stripe involvement
- failure-path hardening in purchase(): a capture that fails after the
  order insert currently needs compensating writes; the real service
  should run purchase as a single database transaction

## withdrawal eligibility and merchant responsibility

see [the payout/merchant research](../../operations/financial/payout-and-merchant-model.md).
a creator wallet can show accrued earnings before withdrawal verification,
but provider-required account capabilities and holding limits must still be
respected. bank/wire and paypal destinations are candidates, not automatically
supported by stripe connect. no buyer bnpl or installments are offered.

## future: gift cards and the creator wallet (direction only)

not scheduled; recorded so the model stays coherent when they build.

- **gift cards are ledger liability accounts, not a vendor product.**
  purchase captures funds like any order and posts an append-only
  entry to a gift card liability account in the supabase ledger
  (formance remains the double-entry engine candidate if adopted).
  redemption is a payment method that draws that account down through
  normal order pricing, so creator net, platform fee, and escrow
  splits are unchanged. refunds post back to the account, never to a
  card. no third-party gift card saas in the prototype.
- **spree prototype path:** spree's native store credit stands in for
  gift cards (code issuance, checkout redemption) until the ledger
  version replaces it.
- **the creator wallet is a ledger view, not a separate system:** held
  (escrow) -> available -> paid out, all append-only entries over the
  same accounts. wallet-as-spendable-store-credit is a later decision.
- open questions when scheduled: cross-currency redemption, expiry
  rules per jurisdiction, and payout-provider constraints on
  stored-value balances.

## aml threat model and proposed financial controls

[security/aml](../../security/aml/README.md) records self-dealing, stolen-payment,
proxy-beneficiary, sanctions-rerouting, provenance and milestone risks. the
existing simulations do not verify these proposed controls or implement
production stripe/payoneer payout screening.
