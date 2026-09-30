# axis two: customs territories, import tax and landed charges

researched 2026-09-30. references resolve through the
[source index](sources.json).
this is not a live tariff table or an approval for any dispatch corridor.

## europe is not one import zone

| grouping | relevance to goods routing | what it does not establish |
|---|---|---|
| eu customs territory | goods released into free circulation can move within that territory under applicable rules | uniform destination vat, uniform hallmarking law, or inclusion of every territory attached to an eu country |
| eea | market arrangements include norway, iceland and liechtenstein with eu states | membership of the eu customs union or eu common trade policy |
| efta | norway, iceland, liechtenstein and switzerland have relevant trade arrangements | one shared eu customs/vat territory or automatic zero duty on every shipment |
| switzerland/liechtenstein arrangements | a specific customs relationship needing its own territory mapping | that switzerland is in the eea, or that all efta states share that relationship |
| united kingdom | great britain and northern ireland need distinct goods processes | an eu-to-uk shipment being an internal eu movement |
| schengen | movement-of-people arrangements | customs or import-vat eligibility for jewelry |

`eea-exclusions`, `efta-origin` and `eu-preferential-origin` distinguish market
membership from customs and proof-of-origin arrangements. a preferential tariff
requires the applicable origin rule and evidence; dispatch from a partner state
is not proof that goods originate there.

`eu-vat-territory` also requires territory-level mapping: country code alone
cannot establish customs or vat treatment. neither oss nor ioss is a geographic
customs-union label.

## 2026 and other material changes

### eu low-value imports

`eu-three-euro-guidance` is european commission customs implementation guidance
for council regulation (eu) 2026/382. it describes removal of the old eur 150
duty-relief provisions and temporary eur 3 treatment from 1 july 2026 to
1 july 2028, subject to the prescribed declaration and shipment conditions.

implementation must model scope rather than adding eur 3 to every order:

- the guide defines an item by tariff classification, description and origin
  where required. the temporary duty applies per declaration line, not simply
  per physical unit or once per shopping cart.
- the intrinsic consignment value and declaration type matter.
- ioss vat collection and customs duty remain separate obligations.
- guide section 3.3.3 treats preferential/customs-union claims through the h1
  path when ioss has not been used, while its ioss treatment differs.
- restricted goods and other excluded/special cases need their own process.

we read the commission guidance and recorded the eur-lex regulation link; the
separate eur-lex retrieval did not yield usable text. before promotion, attach
the operative act/amendments and applicable customs/tariff data. the older council
press release is not a substitute for the detailed implementation guide.

### united states low-value imports

`us-de-minimis` is a federal register rule effective 24 june 2026 suspending the
usual low-value exemption for covered non-postal merchandise. international
postal treatment is handled separately. do not restore an automatic usd 800
no-duty rule, extrapolate the non-postal rule to every mode, or misdeclare a
commercial sale as a gift. actual entry method and current tariffs remain open.

### switzerland industrial tariffs

`ch-industrial-tariffs` records industrial tariff abolition from 1 january 2024
for hs chapters 25 through 97, with stated agricultural exceptions. jewelry's
exact classification still needs verification; an eligible industrial tariff
can be zero while customs declarations, import vat and carrier charges remain.

preferential origin proofs can still matter for re-export/cumulation. a caster's
swiss dispatch location must not be used as a shortcut for manufacturing origin.

## destination evidence matrix

| destination(s) | baseline and specific evidence | remaining route work |
|---|---|---|
| austria, belgium, denmark, france, germany, ireland, italy, netherlands, spain, sweden | eu free-circulation and territory rules, destination vat, origin arrangements and the 2026 low-value guidance: `eu-free-circulation`, `eu-vat-territory`, `eu-three-euro-guidance` | exact destination territory, goods status, vat/channel role and commodity/origin-specific duty |
| united kingdom | direct imported-sales vat guidance treats the gbp 135 consignment boundary; northern ireland parcel processes differ: `uk-import-vat`, `gb-ni-parcels` | gb/ni distinction, marketplace versus direct seller, importer and carrier process; gb-to-ni guidance is not permission for every foreign-to-ni route |
| switzerland | industrial tariff abolition with customs/vat duties retained: `ch-industrial-tariffs` | classification, import-vat collection, assaying steps, return/re-export evidence and carrier fees |
| norway | eea excludes the customs union; voec applies only under its stated conditions: `eea-exclusions`, `no-imports` | item value, voec eligibility/registration, excluded goods, declaration identifiers and charges outside that scheme |
| united states | current covered non-postal de minimis suspension: `us-de-minimis` | postal rules, entry method, actual tariff and additional trade measures, origin and importer |
| canada | postal duty/tax and collection guidance: `ca-imports` | separate courier/commercial process, origin preference, province, fees and actual jewelry classification |
| australia | official import guidance distinguishes qualifying investment metals from jewelry: `au-imports` | actual jewelry tariff, gst, declaration/value treatment and low-value seller obligations |
| new zealand | border collection and overseas-supplier gst are distinct: `nz-imports`, `nz-supplier-gst` | supplier/marketplace registration role, customs value, gst charged at checkout and border reconciliation |
| japan | tariff and import procedure guidance: `jp-imports` | exact jewelry classification, tax base, available preference and importer/carrier procedure |
| south korea | customs agency overseas-purchase guides: `kr-online-guide`, `kr-online-guide-alt` | current version, personal-use limits versus commercial import, clearance identifiers and jewelry-specific classification |
| singapore | imported-goods gst and separate investment-metal criteria: `sg-imports`, `sg-investment` | jewelry must not inherit bullion relief; confirm seller/importer role, low-value rules and permit handling |
| united arab emirates | dubai customs procedures plus federal metal law: `ae-customs-filtered-1`, `ae-law-firecrawl` | relevant emirate/entry point, exact duty/vat treatment, foreign-hallmark recognition and documentation |
| israel | official personal-import jewelry and silver-jewelry conditions: `il-customs-filtered-1`, `il-customs-filtered-2` | complete current tax treatment, actual commodity code, personal versus commercial importer and carrier process |

## do not transplant allowances from unrelated imports

traveler jewelry allowances are not mail-order thresholds. relocation-household
allowances are not ordinary ecommerce clearance. investment bars are not jewelry.
a duty waiver is not a vat waiver. a border collection threshold is not permission
for a registered overseas seller to omit vat/gst at checkout.

new zealand is an explicit example: the revenue department guidance requires
applicable registered overseas suppliers to charge gst on low-value consumer
sales even though border collection has its own threshold. canada's postal
examples cannot automatically be applied to courier shipments. switzerland's
traveler allowance does not set the threshold for commercial parcels.

## corridor families, not approved routes

| proposed corridor | hallmarking axis | import axis |
|---|---|---|
| italy to netherlands | both convention members; still prove the article's valid marks/fineness | prove eu goods status/free circulation and destination tax treatment |
| italy to germany | german jewelry-marking rules, not automatic treaty recognition | eu movement does not replace those domestic product rules |
| italy to switzerland | possible ccm recognition if the article qualifies | external import, declarations and vat; industrial tariff abolition does not eliminate these |
| switzerland to france | french recognized-mark/import procedures, not automatic convention rights | non-eu dispatch requires approved customs, origin and vat treatment |
| norway to sweden | possible ccm path | eea participation does not make this an internal eu customs movement |
| eu facility to great britain | possible ccm path | post-brexit import treatment, consignment value and seller/channel role |
| great britain to northern ireland | exact mark/article rules still apply | windsor-framework parcel process depends on recipient, risk and authorisation; distinguish from external import |
| third-country caster via an eu assay office to an eu buyer | confirm the designated office can lawfully apply the needed marks | account for entry into the eu, customs procedure, assay detour and subsequent goods status |

all examples remain unapproved until [the evidence contract](route-evidence-contract.md)
is satisfied. see [hallmarking](hallmarking.md) and [the overview](README.md).

## regional follow-up

[the priority pass](europe-north-america.md) adds the european commission's
reported us-industrial tariff implementation from 1 july 2026, the separately
sourced us postal rule, canadian courier-commerce conditions and
[quebec's provincial overlay](quebec.md). these findings refine this baseline;
no blanket no-duty or no-tax assumption should survive them.
