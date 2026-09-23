# Shipping locales and regional clusters

This file groups Sculptura's intended shipping markets for route planning. A cluster is not a promise that goods can move freely inside it. Every manufacturing-origin and buyer-destination pair still needs an approved route.

Status terms:

- **First cohort**: intended for the first shipping rollout, but disabled until operational approval
- **Research hold**: not enabled until a suitable regional casting route and destination rules are established
- **V3 candidate**: a possible later product release target, not a live-market commitment

## North america cluster

### United states

- Rollout: first cohort
- Preferred direction: domestic united states casting and dispatch where capability and quality permit
- Route concerns: state sales-tax handling, precious-metal carrier restrictions, insurance limits, remote destinations, and returns
- Canada-to-united-states or other cross-border routes are separate routes, not domestic alternatives

### Canada

- Rollout: first cohort
- Priority: higher-ppp market
- Preferred direction: canadian casting where suitable regional capacity exists; otherwise use only a pre-cleared cross-border route
- Route concerns: import tax and duty treatment, customs brokerage, carrier collection fees, bilingual or provincial consumer requirements where applicable, insurance, and returns
- Do not treat a united states facility as local merely because both countries are in north america

## Europe cluster

EU membership and Vienna Convention membership are different classifications. The EU affects customs, VAT, and market treatment. The Convention and CCM concern independent precious-metal control and marking. One never substitutes for the other.

### European union

#### EU and Vienna Convention / CCM contracting states

- Austria: first cohort
- Denmark: first cohort, higher-ppp priority
- Ireland: first cohort
- Italy: first cohort
- Netherlands: first cohort
- Sweden: first cohort, higher-ppp priority

These countries are both EU members and current Contracting States of the Convention. A qualifying article carrying the CCM may receive Convention treatment, but only when it was controlled and marked through an authorized assay office and meets the destination's legal fineness and article requirements.

EU status can reduce customs friction for goods moving from an EU production facility to an EU buyer. It does not remove the need to determine destination VAT, hallmarking, carrier, insurance, return, and consumer obligations. OSS is a VAT reporting mechanism, not a customs-zone label for a caster.

#### EU but not Vienna Convention / CCM contracting states

- Belgium: first cohort
- France: first cohort
- Germany: first cohort
- Spain: first cohort

These countries are not on the Convention's current list of 22 Contracting States. Do not assume that a CCM route receives Convention treatment there. Research domestic precious-metal rules, recognized marks, fineness standards, exemptions, importer responsibilities, and whether additional control or marking is required.

This is the principal **non-Vienna Convention / CCM European subcluster** in the current rollout.

### Non-eu europe

#### United kingdom

- Rollout: first cohort
- Convention status: Contracting State
- EU status: non-EU

Post-Brexit routing needs explicit landed-cost treatment. Goods sent between an EU facility and Great Britain can trigger import VAT, customs declarations, carrier handling charges, and possibly customs duty depending on value, classification, and origin. Tariff preference does not automatically remove VAT or administrative charges.

Sculptura should be especially wary of charges appearing at delivery after checkout. Before approving an EU-to-UK route, determine:

- Whether the seller or customer is importer of record
- Whether the route is delivered-duty-paid or delivered-at-place
- Where VAT is collected for the consignment value and sales channel
- Whether preferential origin can actually be documented
- Likely carrier brokerage or advancement fees
- Whether the displayed checkout total includes every expected charge
- Whether the address is in Great Britain or Northern Ireland, because the rules are not identical

Prefer a suitable UK casting and dispatch route when it meets the design, quality, capacity, and price requirements. An EU route may still be used when its complete landed result is approved and the customer will not receive an unexplained bill.

#### Switzerland

- Rollout: first cohort
- Priority: higher-ppp market
- Convention status: Contracting State
- EU status: non-EU and outside the EEA

Switzerland requires its own customs, import-tax, carrier, insurance, and returns route. CCM participation may help qualifying hallmarking treatment, but it does not turn the shipment into an EU movement or remove customs handling.

#### Norway

- Rollout: regional casting research hold
- Priority: higher-ppp market
- Convention status: Contracting State
- EU status: non-EU; participates in the EEA, but the EEA does not include the EU customs union or EU direct and indirect taxation

Norway must not be placed in the EU customs pool. A future route needs Norwegian import VAT, customs, carrier, insurance, returns, and precious-metal requirements modeled separately. A Scandinavian or Nordic casting zone may make it operationally attractive, especially if it can also serve Sweden and Denmark without pretending all three destinations share the same tax treatment.

### European cluster rule

Route labels should describe facts, for example:

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

Never store `SCHENGEN` as evidence of customs eligibility. Schengen concerns border controls for people, not whether jewelry moves without customs treatment.

## Middle east cluster

### United arab emirates

- Rollout: regional casting research hold
- Current role: first Middle East market under consideration
- Convention status: not on the current list of Contracting States
- Activation dependency: a suitable regional casting zone plus verified customs, tax, precious-metal, carrier, insurance, returns, and consumer handling

Research should consider whether production is regional or imported, which emirate receives the goods, required documentation and marking, high-value shipment handling, and practical return routes.

### Israel

- Rollout: possible v3 candidate
- Convention status: Contracting State
- Activation dependency: separate regional-casting, security, carrier, customs, tax, insurance, returns, and consumer review

Convention membership makes Israel relevant to the CCM research, but it does not by itself justify launch. Israel remains disabled unless it receives its own approved production and delivery route.

## Asia-pacific cluster

### First cohort

#### Australia

- Priority: higher-ppp market
- Preferred direction: Australian casting and dispatch when a qualified facility exists
- Fallback: only a pre-cleared import route with landed charges, carrier coverage, insurance, returns, and precious-metal requirements resolved

#### New zealand

- Preferred direction: New Zealand or approved Australia-to-New-Zealand regional route
- Route concerns: import treatment, remote delivery, precious-metal insurance limits, returns, and whether Australian production actually improves the complete landed outcome

### Regional casting research hold

#### Singapore

- Possible role: Southeast Asian casting and logistics node
- Activation dependency: confirmed precious-metal casting capability, hallmarking treatment, tax and customs handling, insured delivery, and returns

#### Japan

- Possible role: Northeast Asian buyer and production market
- Activation dependency: domestic or regional casting zone plus Japanese precious-metal, customs, tax, carrier, insurance, returns, and consumer research

#### South korea

- Possible role: Northeast Asian buyer and production market
- Activation dependency: domestic or regional casting zone plus Korean precious-metal, customs, tax, carrier, insurance, returns, and consumer research

Australia and New Zealand should not automatically be grouped with Singapore, Japan, or South Korea for tax or customs. “Asia-Pacific” is a planning cluster, not a shared regulatory zone.

## Route activation requirements

No cluster enables checkout by itself. Each country needs:

1. At least one accepted manufacturing facility and exact material/process match
2. An approved origin-to-destination customs and tax route
3. Verified hallmarking and fineness treatment
4. A current manufacturing quote path
5. Tracked shipping that permits precious-metal jewelry
6. Sufficient insured-value coverage
7. Known importer-of-record and landed-charge treatment
8. A workable return, loss, damage, remake, and refund process
9. Destination consumer terms and required disclosures
10. A dated approval with the rule and evidence versions used

## Official reference points

Checked 2026-09-22:

- Hallmarking Convention, Contracting States: https://hallmarkingconvention.org/en/members
- Hallmarking Convention, how the CCM works: https://hallmarkingconvention.org/en/about-how-is-the-convention-working
- UK government, VAT and overseas goods sold directly to UK customers: https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk
- UK government, post-Brexit consumer import-charge warning: https://www.gov.uk/government/news/hmrc-urges-shoppers-to-be-aware-of-post-brexit-changes-before-key-christmas-shopping-dates
- European Commission, UK customs relationship and online-shopping charges: https://taxation-customs.ec.europa.eu/customs/international-affairs/united-kingdom_en
- European External Action Service, EU-Norway relationship and EEA exclusions: https://www.eeas.europa.eu/norway/european-union-and-norway_en

These sources establish broad classifications. They do not replace route-specific tax, customs, hallmarking, or legal review.