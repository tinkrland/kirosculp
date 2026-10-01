# aml and financial-abuse threat model

version: 0.1, drafted 2026-09-30. these pages describe plausible scenarios,
proposed safeguards and unresolved legal questions. they are not a deployed aml
program, proof of compliance, accusations against artists or production controls.

## structure

- [scenarios](scenarios/README.md): how marketplace/payment abuse could affect
  sculptura, including legitimate lookalikes and considerations against it.
- [considerations](considerations/README.md): shared legal, admission, sourcing,
  transaction, payout, review and evidence requirements.

## ownership and boundaries

platform/operations own financial-risk decisions, provider integrations and
restricted compliance records. studio owns geometry and server-side headless
openscad validation before issuing a versioned design release. a valid mesh
neither clears a payment nor proves lawful metal sourcing. tessa does not set
creator commission rates or judge earnings against local wages.

existing [ledger primitives](../../migrations/0007_escrow_and_ledger.sql) and
[sandbox/localstripe adapter](../../platform/payments/gateway-adapter.js) do not
implement these controls. ledger balance and idempotency are useful foundations,
not an aml clearance. no risk threshold, account freeze, country ban, provider
integration or reporting workflow is activated by this documentation.

## operating principles

- assess buyers, creators, suppliers, payment beneficiaries and transactions;
  country exclusions alone cannot prevent abuse in permitted jurisdictions.
- distinguish fraud, laundering, sanctions, chargebacks and provider de-risking.
- distinguish accrued earnings, payable release and an actual external payout.
- high prices, strong artist margins and overseas bank accounts are not proof
  of wrongdoing. preserve artist pricing autonomy and protect private creator geography.
- express suspicion as reviewable evidence, not a declaration of criminal guilt.
- follow mandatory legal/provider restrictions independently of optional risk policy.

see [legal scope](considerations/legal-scope.md),
[review and tests](considerations/review-audit-and-tests.md), and the
[parent security findings](../README.md).

## private creator classifications

[admin/creator-trust](../../admin/creator-trust/README.md) supplies a separate
admin-only confidence schema. its level is not a finding of fraud or aml risk,
not public progression, and not an automatic hold or compliance clearance.
