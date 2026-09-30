# contact verification: policy and detection limits

specified policy, not an implemented integration. phone and email gates apply
to creator storefront publication, not guest buyer checkout.

## verified phone, including declared voip

verify control of the number through a supported otp channel. voip is allowed,
but requires the creator's explicit voip toggle; the toggle is not verification.
compare declaration with available line-type intelligence and offer a review
path for stale, unknown or contradictory carrier data.

candidate: twilio verify for verification plus lookup line type intelligence
for mobile, landline, fixed voip and non-fixed voip classification. channel
coverage and anti-abuse settings must be tested so declared voip is not rejected
by a default risk rule. no provider has been selected or connected here.

## allowed email policy

reject known temporary/disposable services, cloaked/masked addresses, explicit
plus-address aliases such as `person+shop@example.com`, and forwarding-only
relay addresses without their own inbox. require ownership verification too.

an ordinary proton mail inbox is allowed; proton pass/simplelogin masking is
the prohibited category. do not block an entire mailbox provider to catch its
separate masking service. a creator-owned domain is not itself evidence of abuse.

## what existing services can establish

ipqualityscore and verifalia provide email-validation apis with disposable-mail
signals and deliverability information. evaluate them using a labeled corpus,
not marketing accuracy claims. neither source establishes comprehensive
classification of every custom-domain alias or relay.

- explicit plus addressing can be rejected locally without an api call.
- maintained domain intelligence can identify known disposable and relay services.
- email delivery, mx records and a successful verification link do not prove
  a dedicated inbox. custom-domain forwarding and opaque aliases may be hidden.
- do not strip plus suffixes or gmail dots globally to infer identity; addressing
  semantics differ by provider. reject the prohibited input rather than rewriting it.
- unknown classifications need a defined review/correction route. do not claim
  complete relay detection or label an uncertain inbox fraudulent.

the proposed stack is local syntax policy + disposable/relay domain intelligence
+ a validation api + ownership verification. strict universal no-alias enforcement
is not technically demonstrated and cannot be promised from public email data.

## evidence and boundaries, 2026-09-30

| source | supports | boundary |
|---|---|---|
| https://www.twilio.com/docs/lookup/quickstart | lookup line-type classification includes fixed and non-fixed voip | classification is not ownership verification; package is paid |
| https://www.twilio.com/docs/verify/api | provider verification api | channel/voip coverage and risk controls require integration tests |
| https://www.ipqualityscore.com/documentation/email-validation-api/overview | deliverability and disposable-email signals | no established exhaustive alias/relay classification |
| https://verifalia.com/developers | email-validation api and integration model | not proof of a distinct inbox behind every address |
| https://simplelogin.io/email-relay | forwarding aliases, multiple destination inboxes and custom domains | shows why service-domain lists cannot identify every relay |

see [creator-integrity solution](solution.md) and [creator access](../creator-access.md).
