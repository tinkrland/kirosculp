# shipping locales and regional clusters

this file groups sculptura's intended shipping markets for route planning. a cluster is not a promise that goods can move freely inside it. every manufacturing-origin and buyer-destination pair still needs an approved route.

status terms:

- **first cohort**: intended for the first shipping rollout, but disabled until operational approval
- **research hold**: not enabled until a suitable regional casting route and destination rules are established
- **v3 candidate**: a possible later product release target, not a live-market commitment

## north america cluster

### united states

- rollout: first cohort
- preferred direction: domestic united states casting and dispatch where capability and quality permit
- route concerns: state sales-tax handling, precious-metal carrier restrictions, insurance limits, remote destinations, and returns
- canada-to-united-states or other cross-border routes are separate routes, not domestic alternatives

### canada

- rollout: first cohort
- priority: higher-ppp market
- preferred direction: canadian casting where suitable regional capacity exists; otherwise use only a pre-cleared cross-border route
- route concerns: import tax and duty treatment, customs brokerage, carrier collection fees, bilingual or provincial consumer requirements where applicable, insurance, and returns
- do not treat a united states facility as local merely because both countries are in north america

## europe cluster

EU membership and Vienna Convention membership are different classifications. the EU affects customs, VAT, and market treatment. the Convention and CCM concern independent precious-metal control and marking. one never substitutes for the other.

### european union

#### eu and Vienna Convention / CCM contracting states

- austria: first cohort
- denmark: first cohort, higher-ppp priority
- ireland: first cohort
- italy: first cohort
- netherlands: first cohort
- sweden: first cohort, higher-ppp priority

these countries are both EU members and current Contracting States of the Convention. a qualifying article carrying the CCM may receive Convention treatment, but only when it was controlled and marked through an authorized assay office and meets the destination's legal fineness and article requirements.

EU status can reduce customs friction for goods moving from an EU production facility to an EU buyer. it does not remove the need to determine destination VAT, hallmarking, carrier, insurance, return, and consumer obligations. OSS is a VAT reporting mechanism, not a customs-zone label for a caster.

#### eu but not Vienna Convention / CCM contracting states

- belgium: first cohort
- france: first cohort
- germany: first cohort
- spain: first cohort

these countries are not on the Convention's current list of 22 Contracting States. do not assume that a CCM route receives Convention treatment there. research domestic precious-metal rules, recognized marks, fineness standards, exemptions, importer responsibilities, and whether additional control or marking is required.

this is the principal **non-Vienna Convention / CCM European subcluster** in the current rollout.

### non-eu europe

#### united kingdom

- rollout: first cohort
- convention status: Contracting State
- EU status: non-EU

post-Brexit routing needs explicit landed-cost treatment. goods sent between an EU facility and Great Britain can trigger import VAT, customs declarations, carrier handling charges, and possibly customs duty depending on value, classification, and origin. tariff preference does not automatically remove VAT or administrative charges.

sculptura should be especially wary of charges appearing at delivery after checkout. before approving an EU-to-UK route, determine:

- whether the seller or customer is importer of record
- whether the route is delivered-duty-paid or delivered-at-place
- where VAT is collected for the consignment value and sales channel
- whether preferential origin can actually be documented
- likely carrier brokerage or advancement fees
- whether the displayed checkout total includes every expected charge
- whether the address is in Great Britain or Northern Ireland, because the rules are not identical

prefer a suitable UK casting and dispatch route when it meets the design, quality, capacity, and price requirements. an EU route may still be used when its complete landed result is approved and the customer will not receive an unexplained bill.

#### switzerland

- rollout: first cohort
- priority: higher-ppp market
- convention status: Contracting State
- EU status: non-EU and outside the EEA

switzerland requires its own customs, import-tax, carrier, insurance, and returns route. CCM participation may help qualifying hallmarking treatment, but it does not turn the shipment into an EU movement or remove customs handling.

#### norway

- rollout: regional casting research hold
- priority: higher-ppp market
- convention status: Contracting State
- EU status: non-EU; participates in the EEA, but the EEA does not include the EU customs union or EU direct and indirect taxation

norway must not be placed in the EU customs pool. a future route needs Norwegian import VAT, customs, carrier, insurance, returns, and precious-metal requirements modeled separately. a Scandinavian or Nordic casting zone may make it operationally attractive, especially if it can also serve Sweden and Denmark without pretending all three destinations share the same tax treatment.

### european cluster rule

route labels should describe facts, for example:

```text
origin country: IT
destination country: GB
origin customs territory: EU
destination customs territory: UK
ccm route verified: true or false
vat treatment version: uk-import-v1
importer of record: sculptura, partner, or customer
landed charges collected before dispatch: true or false
```

never store `SCHENGEN` as evidence of customs eligibility. Schengen concerns border controls for people, not whether jewelry moves without customs treatment.

## middle east cluster

### united arab emirates

- rollout: regional casting research hold
- current role: first Middle East market under consideration
- convention status: not on the current list of Contracting States
- activation dependency: a suitable regional casting zone plus verified customs, tax, precious-metal, carrier, insurance, returns, and consumer handling

research should consider whether production is regional or imported, which emirate receives the goods, required documentation and marking, high-value shipment handling, and practical return routes.

### israel

- rollout: possible v3 candidate
- convention status: Contracting State
- activation dependency: separate regional-casting, security, carrier, customs, tax, insurance, returns, and consumer review

Convention membership makes Israel relevant to the CCM research, but it does not by itself justify launch. Israel remains disabled unless it receives its own approved production and delivery route.

## asia-pacific cluster

### first cohort

#### australia

- priority: higher-ppp market
- preferred direction: Australian casting and dispatch when a qualified facility exists
- fallback: only a pre-cleared import route with landed charges, carrier coverage, insurance, returns, and precious-metal requirements resolved

#### new zealand

- preferred direction: New Zealand or approved Australia-to-New-Zealand regional route
- route concerns: import treatment, remote delivery, precious-metal insurance limits, returns, and whether Australian production actually improves the complete landed outcome

### regional casting research hold

#### singapore

- possible role: Southeast Asian casting and logistics node
- activation dependency: confirmed precious-metal casting capability, hallmarking treatment, tax and customs handling, insured delivery, and returns

#### japan

- possible role: Northeast Asian buyer and production market
- activation dependency: domestic or regional casting zone plus Japanese precious-metal, customs, tax, carrier, insurance, returns, and consumer research

#### south korea

- possible role: Northeast Asian buyer and production market
- activation dependency: domestic or regional casting zone plus Korean precious-metal, customs, tax, carrier, insurance, returns, and consumer research

Australia and New Zealand should not automatically be grouped with Singapore, Japan, or South Korea for tax or customs. “Asia-Pacific” is a planning cluster, not a shared regulatory zone.

## route activation requirements

no cluster enables checkout by itself. each country needs:

1. at least one accepted manufacturing facility and exact material/process match
2. an approved origin-to-destination customs and tax route
3. verified hallmarking and fineness treatment
4. a current manufacturing quote path
5. tracked shipping that permits precious-metal jewelry
6. sufficient insured-value coverage
7. known importer-of-record and landed-charge treatment
8. a workable return, loss, damage, remake, and refund process
9. destination consumer terms and required disclosures
10. a dated approval with the rule and evidence versions used

## official reference points

checked 2026-09-22:

- Hallmarking Convention, Contracting States: https://hallmarkingconvention.org/en/members
- Hallmarking Convention, how the CCM works: https://hallmarkingconvention.org/en/about-how-is-the-convention-working
- UK government, VAT and overseas goods sold directly to UK customers: https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk
- UK government, post-Brexit consumer import-charge warning: https://www.gov.uk/government/news/hmrc-urges-shoppers-to-be-aware-of-post-brexit-changes-before-key-christmas-shopping-dates
- European Commission, UK customs relationship and online-shopping charges: https://taxation-customs.ec.europa.eu/customs/international-affairs/united-kingdom_en
- European External Action Service, EU-Norway relationship and EEA exclusions: https://www.eeas.europa.eu/norway/european-union-and-norway_en

these sources establish broad classifications. they do not replace route-specific tax, customs, hallmarking, or legal review.