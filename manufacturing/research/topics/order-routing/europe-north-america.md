# priority pass: europe, north america and us-origin corridors

researched 2026-09-30. scope: 13 planned european destinations and the united
states/canada. mexico is relevant to cusma conditions, not added as a shipping
market. cefta is a comparative trade/transit framework, not a rollout expansion.

this pass adds national legislation, commencement orders, import-recognition
rules and regional overlays to the [earlier matrix](countries.json). all route
reviews remain unapproved. source identifiers resolve in [sources.json](sources.json).

## keep the two axes independent

- **precious-metal axis:** domestic fineness, component and mark rules, ccm or
  another recognized assay path, sponsor/importer registration and evidence.
- **import axis:** customs territory, classification, origin, dispatch, trade
  preferences, vat/gst, importer, declaration, brokerage and landed costs.

language/consumer obligations add a destination-market overlay; they do not
convert either axis into the other. creator dashboard language and creator
location are not inputs for these legal territory determinations.

## european groupings are not interchangeable

| layer | relevance | route trap |
|---|---|---|
| eu | customs/free-circulation framework and destination vat treatment | assuming shared jewelry hallmarking rules or ignoring territory exceptions |
| eea | market relationships including non-eu countries | assuming norway belongs to the eu customs union |
| efta | country-specific trade/origin arrangements | assuming switzerland belongs to the eea or all efta states share eu customs treatment |
| cefta | separate preferential trade framework with origin and customs cooperation rules | treating transit through a party as conferring originating status or eu free circulation |
| post-brexit uk | distinct great britain/northern ireland goods and hallmarking treatment | applying equivalent eu hallmark recognition in great britain as if brexit had not occurred |
| vienna convention/ccm | recognition of qualifying independently controlled precious-metal articles | assuming every eu state participates, or that a ccm removes import vat |

of the 13 planned european markets, six are both eu and convention members:
austria, denmark, ireland, italy, netherlands and sweden. four are eu but not
convention members: belgium, france, germany and spain. uk, switzerland and
norway are convention members outside the eu. the current worldwide convention
list contains 22 states, not 22 eu states. see `convention-members`.

cefta's founding documents must not be treated as a current membership or origin
rule list. the original agreement includes historical participation and old
implementation dates. `priority-cefta-agreement` and
`priority-cefta-origin-protocol` establish the framework and origin conditions;
current amendments, party status and the applicable pem cumulation matrix still
need verification before any cefta corridor is approved. do not add a cefta
country to sculptura's shipping allowlist through this research.

## important new findings

### post-brexit hallmark recognition is not just a customs issue

`priority-uk-brexit-hallmarks` states that obligations to recognize equivalent eu
hallmarks ended in great britain on 1 january 2021, while northern ireland
continues to recognize eu hallmarks under the applicable regime. new gb stock
needs a uk hallmark or ccm, subject to statutory exemptions. older stock has a
separate transition rule.

that guidance's displayed convention-country list is old. use the separately
retrieved convention membership directory for membership, not the historic list
inside the brexit guidance. uk markings also do not automatically satisfy the
rules of every eu importing state.

### us-origin industrial imports into the eu changed in 2026

`priority-eu-us-implementation`, the european commission's current us trade
page, reports implementation of two tariff regulations and elimination of duties
on imports of us industrial goods from 1 july 2026.

for a proposed us-made jewelry route, verify the precise commodity code,
qualifying us origin, current implementing regulation, declaration and any
applicable special measures. do not substitute a us return address, us retailer,
us dispatch or american raw-metal sourcing badge for qualifying goods origin.

this is potentially relevant to us manufacturing, but zero applicable duty does
not remove vat, customs clearance, assay obligations or carrier charges. it is
also not a blanket free-trade agreement removing all product conditions.
reconcile this treatment with low-value declarations/ioss rather than assuming
all available preferences stack automatically.

### ireland's stale commencement notice is resolved

`priority-ie-commencement-order`, s.i. 439/2019, appoints 30 september 2019 as
the commencement date of the hallmarking (amendment) act 2019.
`priority-ie-assay-law` supplies the assay office's current legislation and
standards guidance. the old convention profile's pending-palladium notice must
not be read as a current pending commencement. article-specific requirements
and actual assay arrangements still need approval.

## national european checks

| destination | stronger evidence in this pass | consequence / remaining work |
|---|---|---|
| austria | previous consolidated `at-full-law` retained | use national act, not the old profile; confirm article category, exact exemption boundary and supplier responsibility |
| belgium | previous official `be-marking-faq` retained | two required marks are not automatically compulsory independent state assay; confirm registration and foreign-mark conditions |
| denmark | `priority-dk-order`, implementing order 934/2020 | registration, foreign eu/eea stamp notification and control obligations need distinct predicates; confirm current authority/amendments |
| france | `priority-fr-introduction` | recognition of qualifying eu/eea/swiss/turkish marks has conditions; geographic membership alone does not satisfy equivalence |
| germany | previous `de-fineness` retained | apply jewelry section 5, imported nonconforming-description treatment and seller liability; no treaty entitlement inferred from eu status |
| ireland | `priority-ie-commencement-order`, `priority-ie-assay-law` | replace pending-commencement assumption with the actual 2019 date; verify current article/metal service path |
| italy | previous `it-metrology` retained; import-regulation discovery added | identification/fineness stamps remain distinct from optional independent control; current import and equivalent-mark interpretation remains open |
| netherlands | `priority-nl-law`, current consolidated statute | use current act instead of profile's old legislative-transition notice; verify exemptions, recognition and current office appointment |
| spain | `priority-es-current-act`, consolidated regulation | distinguish manufacturer/importer identification, official guarantee and recognized foreign-mark exceptions; exact article case still required |
| sweden | `priority-se-law`, `priority-se-order` | gold/platinum fineness and name-mark duties have control-mark alternatives and small-item exceptions; avoid demanding independent assay for every item |
| united kingdom | `priority-gb-current-act`, `priority-uk-brexit-hallmarks` | gb/ni hallmark treatment differs separately from gb/ni customs treatment; keep those two decisions independent |
| switzerland | `priority-ch-recognition`, `priority-ch-control-guidelines` | bilateral recognition is article-specific; watch-case recognition must not be applied indiscriminately to jewelry |
| norway | `priority-no-current` | separate non-ccm responsibility-mark registration/eea notification from ccm recognition; eea is not an import-vat waiver |

national sources are evidence for conditions, not a guarantee that the selected
facility is registered, the piece bears lawful marks or the chosen carrier will
accept it. no source age is reset by retrieving it today.

## north america is not one customs bloc

### us quality marking and customs are separate

`priority-us-stamping-code` adds the federal gold/silver stamping provisions,
15 usc chapter 8, alongside the ftc jewelry guides. false government-assay
representations, claimed fineness and identifying marks need their own review;
marketing guidance alone does not replace the stamping statute or state rules.

`priority-us-postal-final` adds the postal rule alongside the earlier non-postal
rule. the postal rule's effective date is 24 july 2026, except amendatory
instruction 4 concerning 19 cfr 145.31, effective 24 june 2026. do not retain an
automatic usd 800 exemption or assume mail avoids the suspension. postal and
courier entry, declarations, bonds, special measures and duty calculations still
differ. apply the current rules for the actual import date and goods.

### canadian courier remission is not proof of cusma origin

`priority-ca-courier-remission`, memorandum d8-2-16, distinguishes:

- eligible courier shipments from the us/mexico: up to cad 150 duty remission
  and up to cad 40 tax remission, under the stated conditions.
- other eligible courier shipments: the lower cad 20 threshold.
- mail, excluded transactions, split shipments and other special cases: separate
  rules, not interchangeable with the courier concession.

paragraphs 11 and 12 are particularly important: goods need not originate in a
cusma party to qualify for the higher courier thresholds, but must have entered
commerce in the us/mexico before shipment to canada. mere transshipment does not
qualify. a us-manufactured item dispatched from another non-qualifying country
also cannot inherit the higher threshold just from its manufacturing origin.

that is a **different test** from a preferential tariff claim under cusma.
`priority-ca-cusma-overview` addresses origin and certification for that claim.
`priority-ca-origin-marking` addresses country-of-origin marking, another
purpose-specific determination. do not reuse a result from one test as proof
for all the others or treat a certification waiver as an origin waiver.

canada's federal precious-metal quality-mark rules remain conditional and have
specific foreign-mark exceptions. nothing here invents a universal canadian
compulsory assay rule. provincial overlays are additional checks, not a new
national customs territory.

## us-origin corridor cases to work through

| physical route | precious-metal question | independent import question |
|---|---|---|
| us facility to germany | german jewelry/description rules; no automatic ccm treaty right | whether the article qualifies under the 2026 us-industrial tariff treatment, plus vat/declaration |
| us facility to france | third-country import guarantee/responsibility or lawful exemption/recognition path | same us-origin tariff question does not remove french import vat or paperwork |
| us facility via a designated assay office to a convention destination | office service, full ccm mark set, fineness and domestic article acceptance | every border/assay detour, goods status and actual origin treatment |
| us facility to great britain | qualifying uk/ccm path or statutory exemption; not general eu-equivalence assumption | uk tariff code, any applicable us-specific measure, importer and consignment tax process |
| us facility to northern ireland | applicable ni recognized-mark path | distinct ni goods rules; gb-to-ni parcel guidance is not an external us-import clearance |
| us facility to switzerland/norway | exact ccm or national recognized-mark path | independent swiss industrial tariff/vat or norwegian customs/voec treatment |
| us-made or third-country piece transiting a cefta party to the eu | destination marking law remains necessary | transit does not confer cefta/pem origin or eu free circulation; verify actual processing and origin rule |
| us retailer/facility to canada, including quebec | federal quality/mark rules, plus applicable provincial market obligations | courier-commerce/remission test, separate cusma origin claim and provincial tax handling |

all examples remain unapproved. see [quebec](quebec.md) and the
[route evidence contract](route-evidence-contract.md).
