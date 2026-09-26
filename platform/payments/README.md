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

## simulation

`simulate-escrow-lifecycle.js` runs the whole flow against a real supabase
project over postgrest with the service key: capture, release, refund,
every illegal transition, immutability, append-only enforcement, and
group balance checks.

    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node simulate-escrow-lifecycle.js

it creates its own test rows and cannot delete them (the ledger is
append-only for service_role); cleanup is a management-api step owned by
the caller.

### recorded run, 2026-09-26, foundation project clmcmckaydkbkxuhfiyf

18/18 checks passed against the live project: hold creation, terms
immutability, illegal transitions rejected (awaiting_payment -> released,
terminal reopen), capture, release split, refund, append-only rejected for
service_role (403), all four entry groups balanced. sim rows were removed
afterward via the management api; the ledger sits at zero entries.

## next

- adapter interface formalized as a typed contract when spree is
  instantiated
- authenticated-role matrix cells once the platform rebuild owns a test
  harness with real users
- webhook and idempotency design before any stripe involvement
