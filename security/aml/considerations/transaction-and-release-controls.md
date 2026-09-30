# transaction evidence, release gates and reconciliation

## proposed controls

- correlate permitted buyer/creator/beneficiary and order signals. distinguish
  repeated related-party activity from one shared network or delivery address.
- assess velocity and transaction patterns across relevant accounts/events,
  not creator geography or a western wage baseline. threshold/window values
  need calibration and false-positive testing; no screenshot number is law.
- retain provider fraud/sanctions outcomes and trusted authenticated webhooks;
  do not let browser fields certify capture, fulfillment or compliance.
- establish an explicit financial review/eligibility state and authorized
  decisions separately from existing escrow terminal states.
- check the current decision, beneficiary version, available amount and provider
  capability atomically where possible immediately before dispatching a payout.
- support idempotent payout requests and reconciliation of late, duplicated,
  out-of-order and uncertain provider results before another external transfer.
- distinguish refundable/held funds, accrued creator earnings, withdrawable
  amounts and completed external payouts. preserve balanced compensating entries.

## actual baseline and gaps

[0007](../../../migrations/0007_escrow_and_ledger.sql) provides guarded escrow
transitions and append-only ledger records. the
[gateway adapter](../../../platform/payments/gateway-adapter.js) implements
sandbox/localstripe intent, capture, refund and cancellation, not a production
payout-risk engine. neither is an implemented sanctions registry or review queue.

[studio release validation](../../../studio/validation/server-release-gate.md)
is proposed geometry validation, not persona idv, bank-geography checking or
money-release eligibility. identity evidence belongs in restricted platform/
operations services, not the geometry compiler.

risk restrictions must preserve previously recorded facts and obligations. do
not rewrite a released transaction as never released, erase liability, or
confiscate balances under a generic risk-score rule. mandatory blocked-property
treatment is distinct from an ordinary support hold/refund.

see [self-dealing](../scenarios/self-dealing-sales.md),
[commission manipulation](../scenarios/commission-and-delivery.md), and
[review](review-audit-and-tests.md).
