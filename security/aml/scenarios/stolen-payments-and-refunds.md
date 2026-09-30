# stolen payments and refund diversion

## scenario

an apparently completed sale can later prove unauthorized. releasing proceeds
before relevant fraud/provider checks can leave sculptura with chargebacks after
an artist payout. a request to refund a different account can also divert money.
card fraud, laundering and contractual refund disputes are distinct diagnoses.

## signals and legitimate lookalikes

provider fraud alerts, account takeover indications, clustered payment failures
and destination changes are relevant evidence. overseas buyers, gifts and billing/
shipping differences are common legitimate cases and are not automatic guilt.

## considerations against it

verify provider events, signatures and state before recording capture, reversal
or payout completion. implement idempotent reconciliation and enforce available
funds; an authorization is not a settled payout. use provider-supported returns
to the original payment method, with a separately approved exception path where
necessary. do not let a creator select a buyer's refund beneficiary.

after an external payout, a refund or dispute needs a reviewed loss/recovery
allocation and compensating entries, not a silent ledger edit. preserve the
fixed-net/fixed-retail promise without pretending quoted net eliminates all
later chargeback exposure.

see [transaction controls](../considerations/transaction-and-release-controls.md),
[review and tests](../considerations/review-audit-and-tests.md), and
[scenario index](README.md).
