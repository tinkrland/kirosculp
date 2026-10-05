# creator payout rails by market

creator-side payout routing maps each creator market to a payout rail at
payout-account verification time. it is an output of routing, not a signup
input. the product gate stays rail-agnostic: a creator needs a "verified
payout account", and the mechanics are handled by rail-specific adapters.

this pass covers the first creator-market cohort: the intended buyer
cohort markets, the launch-creator geography signal from the dashboard
language variants, the artist pools used throughout policy discussion
(bd, in, pk, ng), and tr, which already has a confirmed rail outcome.

terminology: market codes are iso 3166-1 alpha-2. rails are the payout
providers under evaluation, not buyer-side payment methods.

## relationship to other policies

- creator admission is invitation-gated and separate from payout routing.
  the tentative eaeu artist-admission exclusion is an admission policy
  question and is not encoded in this matrix.
- this matrix is private provider and legal data. it never surfaces
  publicly and never becomes a creator location signal, consistent with
  the geographic-ambiguity decision.
- the runtime must query current provider capability data before
  assigning a rail. this document is dated research evidence, not a
  frozen source of truth. the per-market legal constraints recorded here
  (licensing regimes, cross-border-only limitations) go stale much
  slower than provider coverage lists, which do change.

## rails under evaluation

- stripe connect (express): primary intended rail wherever the creator
  market is a supported connected-account country and the platform can
  create express accounts.
- paypal payouts: candidate secondary rail where its payouts feature is
  supported for receiving accounts.
- payoneer: the gap-filling rail. it is the only viable rail for several
  markets in scope, and the consistent fallback elsewhere.

## matrix, researched 2026-10-05

stripe column reflects the countries where stripe accounts can be
created (stripe.com/global self-serve list, plus its preview and
extended-network tiers). paypal column reflects the paypal payouts
supported-features table for receiving accounts. payoneer reports
coverage across 190+ markets; every market in this cohort is covered.

| market | stripe connect | paypal payouts | payoneer | assigned primary rail |
|---|---|---|---|---|
| US | available | available | available | stripe connect |
| CA | available | available | available | stripe connect |
| GB | available | available | available | stripe connect |
| IE | available | available (send, receive, withdraw) | available | stripe connect |
| DE | available | available | available | stripe connect |
| AT | available | available | available | stripe connect |
| CH | available | available | available | stripe connect |
| FR | available | available | available | stripe connect |
| BE | available | available | available | stripe connect |
| NL | available | available | available | stripe connect |
| IT | available | available | available | stripe connect |
| PT | available | available | available | stripe connect |
| ES | available | available | available | stripe connect |
| MX | available | available (receive and withdraw) | available | stripe connect |
| BR | available | available (in-country balance constraint) | available | stripe connect |
| AU | available | available | available | stripe connect |
| NZ | available | available | available | stripe connect |
| TR | unavailable | unavailable (stale-doc conflict, see notes) | available | payoneer |
| IN | preview (contact sales, not self-serve) | available (receive and withdraw) | available | payoneer |
| PK | unavailable | unavailable | available | payoneer |
| BD | unavailable | unavailable | available | payoneer |
| PH | unavailable | available (local-currency withdrawal) | available | payoneer |
| NG | extended network only (paystack, not connect) | unavailable for payouts | available | payoneer |
| AR | unavailable | available | available | payoneer |
| CO | unavailable | available (cross-border payouts only) | available | payoneer |
| CL | unavailable | available | available | payoneer |

machine-readable copy: [`creator-payout-rails.json`](creator-payout-rails.json),
validated by [`creator-payout-rails.schema.json`](creator-payout-rails.schema.json).

## per-market notes

### TR: payoneer-only, confirmed

turkish law 6493 (payment and securities settlement systems, payment
services and electronic money institutions) restricts cross-border
payment processing to licensed providers. paypal has operated no
send/receive service in tr since its 2016 exit after the banking
regulator refused its license over local-it-system requirements, and
has not returned. payoneer is the viable rail and handles its own kyc
for tr. commercial income requires the creator to hold an appropriate
business registration (sole proprietorship or entity). this matches the
earlier tr deep-dive decision.

doc-conflict flag: paypal's developer payouts supported-features table
currently lists TR as "fully localized". every independent source
confirms paypal does not process payments in tr. the stale row is
treated as a documentation error and tr is deny-by-default for paypal
until paypal itself states otherwise.

### IN: payoneer primary, stripe behind a sales call

india appears on stripe's global page as a preview (contact sales)
market, so self-serve express account creation is not available there
today. paypal payouts lists india as receive-and-withdraw, but
marketplace payout flows into in carry regulatory constraints that need
their own verification pass before relying on it. payoneer is assigned
primary for now; stripe global payouts or a sales conversation are the
upgrade paths.

### PK, BD, NG: payoneer-only

paypal has no payouts support in these markets, and stripe has no
self-serve account support (ng is served through paystack as a stripe
extended-network market, which is not connect). payoneer covers all
three.

### PH, AR, CO, CL: payoneer primary

stripe has no self-serve account support in these markets. paypal
payouts is supported in each, with constraints (local-currency
withdrawal in ph, cross-border-only in co). payoneer is assigned
primary for adapter consistency across the stripe-absent markets, with
paypal as a documented fallback rail where supported.

### BR, MX, IE: constraints on the fallback rail

paypal payouts is supported but with receiving limitations (receive and
withdraw in mx and ie, in-country balance handling in br). irrelevant
while stripe connect is assigned primary, recorded so the fallback
adapter is not assumed unconstrained.

## open questions

- MA, DZ, TN and other north-african french-variant markets: deferred to
  a second pass. payout rails there are their own research problem.
- stripe global payouts (recipient-requirements based, distinct from
  connect cross-border payouts) could replace some payoneer assignments
  once out of public preview. watch it.
- verify paypal marketplace-payout feasibility for in before ever
  assigning it there.
- the eaeu artist-admission question stays in admission policy, not here.

## sources

- stripe express accounts and platform countries: https://docs.stripe.com/connect/express-accounts
- stripe supported countries: https://stripe.com/global
- stripe cross-border payouts: https://docs.stripe.com/connect/cross-border-payouts
- stripe global payouts recipient requirements: https://docs.stripe.com/global-payouts/recipient-requirements
- paypal payouts supported features: https://developer.paypal.com/payouts/supported-features
- paypal turkey exit: https://www.cnet.com/tech/services-and-software/paypal-to-close-operations-in-turkey-over-licensing-hurdle/
- paypal turkey 2026 status check: https://nomadistanbul.com/kb/does-paypal-work-in-turkey
- payoneer coverage: https://www.payoneer.com/resources/tools/global-payment-capabilities/
- payoneer marketplace payouts (190+ markets): https://www.payoneer.com/resources/business/marketplace-payout-infrastructure

researched 2026-10-05. re-verify provider coverage lists before any
rail assignment goes live; re-verify legal constraints only on
regulator change.
