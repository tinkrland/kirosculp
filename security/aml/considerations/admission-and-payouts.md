# admission, verification and payout rails

## separate gates

keep human creator admission, invitation, publication eligibility, private
compliance review, provider capabilities, payment eligibility and actual payout
execution separate. preserve verified phone/email publication requirements and
provider-handled payout identity verification. no blanket upfront government-id
collection is introduced here; legal/provider requirements still take priority
where a required gate cannot lawfully wait until an arbitrary earnings threshold.

record private jurisdiction evidence for policy/compliance without publishing
creator location, timezone, nationality or internal risk labels. define the
artist-country eligibility specification before activating any country block.

## coverage fallback is not compliance fallback

retain payoneer as a proposed alternative for otherwise eligible artists outside
supported stripe payout corridors. stripe platform domicile support and connect
recipient/payout support are different checks. confirm the actual stripe product,
account/cross-border capabilities and whether payoneer approves sculptura's
precious-metal marketplace/funds flow, recipient jurisdiction, currency and payee.

payoneer's [coverage information](https://www.payoneer.com/resources/tools/global-payment-capabilities/)
is a lead, not a production contract or universal corridor guarantee. no
payoneer integration or production stripe payout implementation is claimed here.

classify failures: unsupported corridor, transient operational failure,
beneficiary verification failure, compliance rejection and mandatory restriction.
only otherwise permitted failures can justify approved rerouting. an ambiguous
compliance result must not be downgraded into a coverage failure.

## changes and execution

sensitive payout changes need step-up authentication, authorization, trusted
provider verification and recorded reasons; determine proportional re-review
requirements rather than inventing a universal waiting period. recheck eligibility
against the exact beneficiary immediately before payout, using concurrency-safe
controls and provider idempotency/reconciliation. reconcile an uncertain provider
result before retrying or selecting a second rail.

see [proxy accounts](../scenarios/account-farming-and-proxies.md),
[rerouting](../scenarios/sanctions-and-rerouting.md), and [considerations](README.md).
