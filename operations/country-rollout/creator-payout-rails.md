# creator payout rails by market

creator-side payout routing maps each creator market to a payout rail at
payout-account verification time, alongside an aml tier. rail assignment
is an output of routing, not a signup input. the product gate stays
rail-agnostic: a creator needs a "verified payout account", and the
mechanics are handled by rail-specific adapters.

this pass is organized by regional bloc, with each table split in two:
the left side is the rails side (stripe connect, paypal payouts,
payoneer, assigned primary rail), the right side is the aml side (fatf
status and the aml tier).

terminology: market codes are iso 3166-1 alpha-2. rails are the payout
providers under evaluation, not buyer-side payment methods.

## relationship to other policies

- creator admission is invitation-gated and separate from payout
  routing. the tentative eaeu artist-admission exclusion is an admission
  policy question and is not encoded in this matrix. latam explicitly
  gets no hard regional admission exclusion; its risk lives in payout
  tiers only.
- this matrix is private provider and legal data. it never surfaces
  publicly and never becomes a creator location signal, consistent with
  the geographic-ambiguity decision.
- the runtime must query current provider capability data before
  assigning a rail. this document is dated research evidence, not a
  frozen source of truth. legal constraints go stale much slower than
  provider coverage lists.

## rails under evaluation

- stripe connect (express): primary intended rail wherever the creator
  market is a supported connected-account country.
- paypal payouts: candidate secondary rail where its payouts feature is
  supported for receiving accounts.
- payoneer: the gap-filling rail, the only viable rail for several
  markets, and the consistent fallback elsewhere.

## aml tiers and the dpms stance

sculptura is a dpms ecommerce (dealer in precious metals and stones),
which raises the bar. the stance, decided october 2026:

- **grey_hold**: any market on the fatf jurisdictions-under-increased-
  monitoring list ("grey list", as of the 2026-06-19 plenary) is held:
  not admitted to payouts in the default pass. if one is ever opened, it
  gets stricter payout approval windows and enhanced review. we are not
  risking it for a dpms offering. recheck at every fatf plenary (october,
  february, june).
- **sanctions_conditional**: markets under a live sanctions regime get
  deny-by-default regardless of list status, rechecked quarterly.
- **enhanced**: off all lists, but elevated soft-risk factors; longer
  payout review where triggered.
- **standard**: off all lists, routine screening by the rail adapters.
- fatf black-list markets are flat deny; none are in scope here.

markets currently in grey_hold or sanctions_conditional in this matrix:
np, vn (east and south asia), bo, ve (latam), cm, ci, ke (africa). algeria
and namibia were removed from the grey list at the june 2026 plenary and
are recorded as standard, subject to the october recheck.

## the matrix, by bloc

each table: the left side (stripe, paypal, payoneer, primary) is the
rails side; the right side (fatf, tier) is the aml side. "not researched"
means the rail was not source-verified yet and the tier was recorded
first; it is a research gap, not an availability claim.

### core west

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| US | available | available | available | stripe connect | off | standard |
| CA | available | available | available | stripe connect | off | standard |
| GB | available | available | available | stripe connect | off | standard |
| IE | available | constrained | available | stripe connect | off | standard |
| DE | available | available | available | stripe connect | off | standard |
| AT | available | available | available | stripe connect | off | standard |
| CH | available | available | available | stripe connect | off | standard |
| FR | available | available | available | stripe connect | off | standard |
| BE | available | available | available | stripe connect | off | standard |
| NL | available | available | available | stripe connect | off | standard |
| IT | available | available | available | stripe connect | off | standard |
| PT | available | available | available | stripe connect | off | standard |
| ES | available | available | available | stripe connect | off | standard |
| AU | available | available | available | stripe connect | off | standard |
| NZ | available | available | available | stripe connect | off | standard |

stripe connect primary across the cohort, payoneer fallback
everywhere. paypal receiving constraints in ie are recorded but
irrelevant while stripe is primary.

### mena: tr and north africa

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| TR | unavailable | unavailable (stale-doc conflict) | available | payoneer | off | standard |
| MA | unavailable | available | available | payoneer | off | standard |
| DZ | unavailable | unavailable | available | payoneer | removed 2026-06 | standard |
| TN | unavailable | unavailable | unverified | not assigned | off | standard |
| EG | unavailable | unavailable | available | payoneer | off | standard |

tn is research-only: paypal payouts is unsupported there and payoneer
coverage is unconfirmed, so no rail is source-verified yet.

### south asia

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| IN | preview | constrained | available | payoneer | off | standard |
| PK | unavailable | unavailable | available | payoneer | off | standard |
| BD | unavailable | unavailable | available | payoneer | off | standard |
| NP | not researched | unavailable | not researched | not assigned | grey | grey_hold |

np is grey-listed (2026-06 plenary): held under the dpms stance.
lk, mv are not yet examined; they sit in this bloc for the next pass.

### east and southeast asia

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| MY | available | constrained | available | stripe connect | off | standard |
| ID | preview | available | available | payoneer | off | standard |
| PH | unavailable | constrained | available | payoneer | off | standard |
| VN | unavailable | available | available | not assigned | grey | grey_hold |

my is the pleasant surprise: full stripe support, so it rides the
standard stripe connect flow with payoneer fallback. id mirrors in:
stripe is preview/contact-sales, so payoneer primary. vn is
grey-listed: held, regardless of rails. jp, sg, th, hk, kr are
rail-capable (stripe full support for jp, sg, th, hk) but are not in
the creator cohort yet; they need their own aml row before any
assignment.

### latam

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| MX | available | constrained | available | stripe connect | off | standard |
| BR | available | constrained | available | stripe connect | off | standard |
| AR | unavailable | available | available | payoneer | off | enhanced |
| CL | unavailable | available | available | payoneer | off | standard |
| CO | unavailable | constrained | available | payoneer | off | standard |
| PE | unavailable | unavailable | available | payoneer | off | standard |
| UY | not researched | unavailable | not researched | not assigned | off | standard |
| PY | not researched | unavailable | not researched | not assigned | off | enhanced |
| BO | unavailable | unavailable | available | not assigned | grey since 2023-10 | grey_hold |
| VE | unavailable | unavailable | available | not assigned | grey | sanctions_conditional |

latam gets no hard admission exclusion. bo (grey since october 2023)
and ve are held under the dpms stance; ve additionally carries the
live OFAC regime. ar is enhanced only: the cepo cambiario lifted in
april 2025, so payouts work, but conversion spread, payout fee and
limit noise, and the card-fraud environment (mostly a buyer-side
concern) earn it longer review windows, nothing harder. py is enhanced
for the legacy ciudad del este cash-economy reputation, formally low
risk. uy and py rails are not yet source-verified; tier recorded first.

### africa, dissected

africa is not one bloc. it splits into sub-regions with very different
risk and rail pictures.

#### west africa

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| NG | extended network only | unavailable | available | payoneer | off | standard |
| GH | unavailable | unavailable | available | payoneer | off | standard |
| SN | unavailable | available | unverified | paypal payouts | off | standard |
| CM | not researched | unavailable | available | not assigned | grey | grey_hold |
| CI | not researched | unavailable | not researched | not assigned | grey | grey_hold |

ng rides payoneer (stripe serves ng only through paystack, its
extended network, which is not connect). sn is the odd one: paypal
payouts supported, payoneer unconfirmed, so it is the one market
provisionally assigned to paypal while the payoneer side is verified.

#### east africa

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| KE | unavailable | available | available | not assigned | grey | grey_hold |
| TZ | unavailable | unavailable | available | payoneer | off | standard |
| UG | unavailable | unavailable | available | payoneer | off | standard |
| ET | not researched | not researched | not researched | not assigned | off | standard |

ke is grey-listed, held under the dpms stance despite full rails. tz
and ug are payoneer-only and standard. et is tier-recorded only.

#### southern africa

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| ZA | unavailable | available | available | payoneer | off | standard |
| BW | unavailable | available | available | payoneer | off | standard |
| NA | not researched | unavailable | not researched | not assigned | removed 2026-06 | standard |
| MZ | not researched | not researched | not researched | not assigned | off | standard |

za and bw are clean, payoneer primary with paypal fallback. na was
removed from the grey list at the june 2026 plenary; rails not yet
researched, so tier recorded first with an october recheck note.

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
business registration (sole proprietorship or entity).

doc-conflict flag: paypal's developer payouts supported-features table
currently lists TR as "fully localized". every independent source
confirms paypal does not process payments in tr. the stale row is
treated as a documentation error and tr is deny-by-default for paypal
until paypal itself states otherwise.

### IN and ID: same shape, same answer

both are stripe preview (contact sales) markets with no self-serve
express account creation. paypal payouts lists in as receive-and-
withdraw (marketplace feasibility unverified); id is supported.
payoneer is assigned primary in both. stripe global payouts or a sales
conversation are the upgrade paths.

### MY: stripe country

malaysia is the only new-market addition with full stripe support, so
it joins the stripe connect cohort rather than the payoneer gap-fill
group. the paypal myr constraint is recorded for the fallback adapter.

## open questions

- source-verify the remaining "not researched" and "unverified" cells:
  tn (no rail confirmed), np, uy, py, et, mz, na rails, sn payoneer.
- jp, sg, th, hk, kr: rail-capable but need aml rows before any
  creator-cohort decision.
- lk and mv: south asia follow-up.
- stripe global payouts (recipient-requirements based) could replace
  some payoneer assignments once out of public preview. watch it.
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
- payoneer per-market coverage (third-party, used where official list absent): https://supportedcountries.com/payoneer
- fatf jurisdictions under increased monitoring, 2026-06-19: https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/Increased-monitoring-june-2026.html
- fatf june 2026 plenary changes (algeria and namibia removed, bosnia and iraq added): https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/Increased-monitoring-june-2026.html
- ofac venezuela general licenses 2026: https://www.kingandspalding.com/en/about-us/newsroom/ofac-eases-sanctions-on-financial-services-and-commercial-related-transactions-in-venezuela-april14-2026
- argentina cepo cambiario lifted april 2025, managed float: https://www.xe.com/currencyencyclopedia/argentina-eliminates-capital-controls-and-payment-timelines-2025
- etsy seller concentration by market: https://marketplacepulse.com/etsy-shops-from-nearly-every-country-in-the-world-us-makes-up-75

researched 2026-10-05, aml tiers as of the fatf 2026-06-19 plenary.
re-verify provider coverage lists before any rail assignment goes
live; re-verify tiers at each fatf plenary.
