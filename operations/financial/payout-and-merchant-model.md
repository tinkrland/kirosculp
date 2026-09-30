# creator earnings, withdrawals and merchant responsibility

## wallet proposal: accrued earnings, not an independent bank account

the owner's proposed flow is that earnings accrue to the creator wallet, and
verification occurs when withdrawing to an external payment destination.
this is a reasonable user-facing model if the wallet remains a view over the
supabase ledger: held, available, withdrawal pending, paid out.

it is not a settled claim that unverified connected accounts can always receive
funds, or that funds may be held indefinitely. provider requirements can arise
before charges, transfers or payouts. observe country-specific holding limits,
refunds, reserves and disputes. distinguish an internal creator payable from
money already transferred into a provider connected-account balance.

verification is provider-hosted/handled, not government-id collection by
sculptura. persona verification is not automatically a substitute for stripe's
required connect onboarding. avoid promising verification only at the instant
of first cash-out if the selected provider requires it earlier.

wire, bank payout and paypal are proposed destination examples, not committed
supported rails. stripe bank payouts do not automatically provide paypal
payouts; each supported route needs its own provider and reconciliation contract.

## artist entity requirements

do not require creators to incorporate merely to join sculptura. stripe connect
supports individual as well as company business types. country, capabilities,
verification, tax and local registration obligations still apply. sculptura's
own company setup is distinct from whether each creator needs a company.

## merchant of record: paddle is not a jewelry checkout option

paddle's official policy excludes physical products or products requiring
physical delivery. it is not the merchant-of-record provider for sculptura's
physical jewelry orders. any separate software billing would need its own
eligibility analysis and cannot extend to jewelry sales.

stripe connect remains the intended production payment provider, after the
existing spree/localstripe/fetchsandbox prototype sequencing. it is a processor
and marketplace infrastructure, not automatic outsourced merchant responsibility.

stripe docs distinguish direct charges (connected account as merchant of record),
indirect charges with on_behalf_of (connected account), and indirect charges
without on_behalf_of (platform). sculptura-as-merchant is therefore a charge and
contract model requiring provider approval and legal/tax design, not just a
checkout vendor selection. platform merchant responsibility includes applicable
tax, consumer, refund and dispute obligations; engineering cannot settle those.

this research rejects paddle for physical orders but does not authorize a new
production provider integration, entity setup, payout rail or legal commitment.

## evidence and boundaries, 2026-09-30

| source | supports | boundary |
|---|---|---|
| https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle | physical products and physical-delivery exclusions | does not evaluate another provider's eligibility |
| https://docs.stripe.com/connect/merchant-of-record | merchant identity differs by connect charge model | provider/contract configuration must match actual seller obligations |
| https://docs.stripe.com/connect/handling-api-verification | individual/company types and requirements before enabling charges/payouts | exact requirements vary by country, capability and risk |
| https://docs.stripe.com/connect/manual-payouts | delayed manual payouts have country-specific holding limits; stripe is not legal escrow | limits must be checked for the selected country and account configuration |

see [financial operations](README.md), [payments](../../platform/payments/README.md),
[creator integrity](../../platform/creator-integrity/solution.md) and
[buyer payment restrictions](../../platform/checkout/README.md).
