# creator payout rails by market

creator-side payout routing maps each creator market to a payout rail at
payout-account verification time, alongside an aml tier. rail assignment
is an output of routing, not a signup input. the product gate stays
rail-agnostic: a creator needs a "verified payout account", and the
mechanics are handled by rail-specific adapters.

this is the creator acceptance side, not the shipping side. markets
appear here because we see creator-community signal for them (the
etsy and instagram creator patterns we scoped), not because a rail
exists. we are not blanket-opening markets: where the signal is absent,
the market goes to the parked appendix, and where the aml picture says
stop, it gets held.

the pass is organized by regional bloc, with each table split in two:
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
  gets stricter payout approval windows and enhanced review. recheck at
  every fatf plenary (october, february, june).
- **sanctions_conditional**: markets under a live sanctions regime get
  deny-by-default regardless of list status, rechecked quarterly.
- **enhanced**: off all lists, but elevated soft-risk factors; longer
  payout review where triggered.
- **standard**: off all lists, routine screening by the rail adapters.
- fatf black-list markets are flat deny; none are in scope here.

fatf movement worth recording: the october 2025 plenary removed ng, za,
bf, ml, mz and tz from the grey list, and the june 2026 plenary removed
dz and na while adding iq and ba. markets in grey_hold or
sanctions_conditional here: np, vn, bo, ve, cm, ci, ke (ke holds despite
full rails; ng and za do not hold, they were delisted october 2025).

## the matrix, by bloc

each table: the left side (stripe, paypal, payoneer, primary) is the
rails side; the right side (fatf, tier) is the aml side.

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
| CY | available | constrained | available | stripe connect | off | standard |

stripe connect primary across the cohort, payoneer fallback
everywhere. cy is routed here rather than west asia: it is an eu
market with full stripe support and no west-asia creator-scene signal.

### west asia

most of the region is out of scope (sanctions or grey-listed: ir, iq,
sy, lb, ye, ps) or parked by decision (the gcc markets). what remains
is a small bloc, and small is correct here: the bloc's real story is
that most of the region is parked or ineligible.

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| TR | unavailable | unavailable (stale-doc conflict) | available | payoneer | off | standard |
| IL | unavailable | available | available | payoneer | off | enhanced |
| JO | unavailable | available | available | payoneer | off | standard |
| EG | unavailable | unavailable | available | payoneer | off | standard |
| MA | unavailable | available | available | payoneer | off | standard |

- **TR**: payoneer-only, confirmed. see the per-market notes below.
- **IL**: the sleeper. paypal fully localized, payoneer fine, off the
  grey list since late 2022. enhanced (not hold) because il is a global
  diamond-trade hub, so dpms-typology scrutiny is unusually present
  there; individual creators are fine, it earns a watch.
- **JO**: clean rails, small scene, a maybe-tier market.
- **EG**: "if permits" is the right framing: payoneer is the default
  receive rail for egyptian freelancers, and the central bank fx rules
  hit outbound card spending, not inbound receipts. the cost is egp
  conversion spread.
- **MA**: quietly the cleanest market in the mediterranean rim. off the
  grey list since february 2023, paypal send/receive/withdraw supported,
  payoneer available, deep silversmithing tradition. it sits in this
  bloc via its strong european market ties: it is the exact market the
  north african french dashboard variant exists for.

### south asia

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| IN | preview | constrained | available | payoneer | off | standard |
| PK | unavailable | unavailable | available | payoneer | off | standard |
| BD | unavailable | unavailable | available | payoneer | off | standard |
| NP | not researched | unavailable | not researched | not assigned | grey | grey_hold |

np is grey-listed: held under the dpms stance. lk and mv are not yet
examined; they sit in this bloc for a later pass.

### east and southeast asia

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| MY | available | constrained | available | stripe connect | off | standard |
| ID | preview | available | available | payoneer | off | standard |
| PH | unavailable | constrained | available | payoneer | off | standard |
| VN | unavailable | available | available | not assigned | grey | grey_hold |

my is the one full-stripe market in the bloc, riding the standard
stripe connect flow. id mirrors in: stripe preview, payoneer primary.
vn is grey-listed: held, regardless of rails. jp, sg, th, hk, kr are
rail-capable (stripe full support for jp, sg, th, hk) but are not in
the creator cohort yet; they need their own aml rows before any
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
| BO | unavailable | unavailable | available | not assigned | grey since 2023-10 | grey_hold |
| VE | unavailable | unavailable | available | not assigned | grey | sanctions_conditional |

latam gets no hard admission exclusion. bo and ve are held under the
dpms stance; ve additionally carries the live, thawing OFAC regime,
rechecked quarterly. ar is enhanced only: the cepo cambiario lifted in
april 2025, payouts work, but conversion spread, payout fee and limit
noise, and the card-fraud environment (mostly a buyer-side concern)
earn it longer review windows, nothing harder. uy and py moved to the
parked appendix pending rail research.

### africa

africa is not one bloc and is not blanket-opened. the acceptance roster
is small on purpose: za, ng, gh, with ke held.

| market | stripe connect | paypal payouts | payoneer | primary rail | fatf 2026-06 | aml tier |
|---|---|---|---|---|---|---|
| ZA | unavailable | available | available | payoneer | off (delisted 2025-10) | standard |
| NG | extended network only | unavailable | available | payoneer | off (delisted 2025-10) | standard |
| GH | unavailable | unavailable | available | payoneer | off | standard |
| KE | unavailable | available | available | not assigned | grey | grey_hold |

- **ZA**: removed from the grey list at the october 2025 plenary;
  the region's biggest formal creative economy. payoneer primary,
  paypal fallback.
- **NG**: also delisted october 2025, and arguably the strongest
  creator-side market in the region: payoneer is the default receive
  rail for nigerian freelancers. stripe serves ng only through
  paystack, its extended network, which is not connect.
- **KE**: still grey-listed as of the june 2026 plenary, so it holds
  despite full rails (paypal and payoneer both work).
- **GH**: payoneer-only, standard, kept on the roster as a regional
  maybe.

the rest of the continent (tn, sn, tz, ug, bw, et, mz, na, cm, ci)
is in the parked appendix, each with its one-line reason. cm and ci
are grey-listed holds with no creator-cohort signal.

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

malaysia is the one new-market addition with full stripe support, so
it joins the stripe connect cohort rather than the payoneer gap-fill
group. the paypal myr constraint is recorded for the fallback adapter.

## parked appendix

not blanket-opened; each parked market carries its one-line reason in
the json. current parked set:

- rails unresolved or unverified: TN (no source-verified rail, no
  visible creator-market signal yet; later-version candidate if
  payoneer coverage verifies), SN (paypal yes, payoneer unverified),
  UY, PY, ET (rails not yet researched)
- no creator-cohort signal yet despite workable rails: TZ, UG, BW
- recently delisted, rails not yet researched: MZ (october 2025), NA
  (june 2026)
- grey-listed, held, no signal: CM, CI
- gcc parked by decision: SA, AE (despite full stripe support), QA,
  KW (also grey-listed), BH, OM
- out of scope, sanctions: IR, SY
- out of scope, fatf grey list: IQ, LB (since october 2024), YE
- out of scope, no viable payout rail: PS

## open questions

- source-verify the unverified cells: tn payoneer coverage, sn
  payoneer, uy and py rails.
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
- payoneer egypt freelancer usage: https://www.startglobal.com/blog/payoneer-vs-us-llc-in-egypt
- fatf jurisdictions under increased monitoring, 2026-06-19: https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/Increased-monitoring-june-2026.html
- fatf october 2025 plenary, ng, za, bf, ml, mz, tz delisted: https://www.alukooyebode.com/fatf-removes-nigeria-from-grey-list
- ofac venezuela general licenses 2026: https://www.kingandspalding.com/en/about-us/newsroom/ofac-eases-sanctions-on-financial-services-and-commercial-related-transactions-in-venezuela-april14-2026
- argentina cepo cambiario lifted april 2025, managed float: https://www.xe.com/currencyencyclopedia/argentina-eliminates-capital-controls-and-payment-timelines-2025
- etsy seller concentration by market: https://marketplacepulse.com/etsy-shops-from-nearly-every-country-in-the-world-us-makes-up-75

researched 2026-10-05, aml tiers as of the fatf 2026-06-19 plenary.
re-verify provider coverage lists before any rail assignment goes
live; re-verify tiers at each fatf plenary.
