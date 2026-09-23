# operating the service

## rollout and geography

creator signup availability, payout-provider coverage, customer delivery, customs, hallmarking, tax, carrier service, insurance, and returns are separate questions.

market lists and rollout status change as routes are researched and approved, so they do not belong in this project explanation. the maintained source of truth is under [`operations/country-rollout`](../../operations/country-rollout/README.md), with locale and cross-border concerns under [`operations/shipping`](../../operations/shipping/README.md).

shipping remains deny-by-default. appearing in a planning cohort does not make a destination live until the complete route is approved.

---

## payments, payouts, and protection

creator exploration and design work should not require payout verification merely to begin. identity and connected-account requirements are enforced when the relevant provider and payout state require them.

creator earnings are not released simply because a card authorization occurred. settlement must account for payment capture, manufacturing acceptance, cancellation, refund exposure, chargebacks, delivery, and the applicable claim window.

shipping, insurance, refunds, and claims are first-class operational records. corrections are append-only adjustments rather than edits that erase the original transaction.

---

## the operational control tower

private admin tools supervise the real platform, manufacturing, and operations services. they do not maintain separate copies of business rules.

operators need to be able to:

- review design-release and listing exceptions
- approve, suspend, and inspect manufacturing partners
- see connection and capability health
- inspect why a route was selected
- intervene in failed purchases, production, delivery, refund, and payout states
- manage rollout and operational policy
- review audit history for consequential changes

admin access must use authenticated, role-based authorization enforced by the backend. a universal password in client code is not authentication.
