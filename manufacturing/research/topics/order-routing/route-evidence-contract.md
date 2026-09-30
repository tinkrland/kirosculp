# route evidence contract: approval is a separate act

version: 0.1.0 research contract, 2026-09-30. this document specifies evidence an
implemented router would need. it does not deploy a router, approve a facility,
activate checkout or provide a compliance guarantee.

## separate geography facts

store manufacturing facility/country, assay office/country, every dispatch and
transit step, buyer destination/territory, customs territory and vat territory.
store non-preferential origin, preferential-origin evidence and goods status
separately. manufacture, source of raw metal, creator residence and dispatch
are not interchangeable facts.

northern ireland needs a goods-treatment designation under the applicable
framework, not an automatic substitution of its country with `EU`. customs and
vat territory exceptions within other countries need the same care.

## axis one record: finished-article market eligibility

required evidence includes:

- immutable design-release reference, approved alloy/composition and article type.
- finished mass and component/solder/plating interpretation, including how a
  pre-production quote handles uncertainty around exemption thresholds.
- applicable fineness standards and marking requirements, with current legal
  source, effective interval and destination/article scope.
- ccm entitlement if relied on: designated assay office, valid mark set,
  applying-state responsibility registration and domestic acceptance conditions.
- an alternative national/bilateral recognized-mark path when ccm is not used.
- actual assay-service capability, mark placement/size, fees, turnaround,
  chain of custody and evidence supplied with the completed order.

independent control, fineness stamping and responsibility/sponsor marking are
separate obligations. a profile's word "voluntary" must not disable all three.
a country being a convention member is not evidence that a particular piece
has been tested, marked or accepted there.

## axis two record: physical route and landed treatment

required evidence includes:

- exact origin, destination and intermediate territories and customs procedure.
- commodity classification, goods status and customs valuation basis.
- preferential-origin rule and proof where a preference is claimed.
- duty/tariff measures and applicable effective dates, not a permanent country
  rate copied from a search snippet.
- vat/gst collection role, seller/marketplace registration, consignment value,
  low-value scheme eligibility and declaration identifiers.
- importer of record, incoterm/delivery terms and carrier brokerage/advancement
  fees; reconcile what is charged at checkout versus on arrival.
- sanctions/export restrictions, precious-metal carrier acceptance,
  declared-value and insurance coverage.
- commercial invoice, packing list, origin/assay certificates where required,
  and the carrier's required customs data.
- return, rejected delivery, repair/remake and re-import procedure. a return
  crossing the border is another customs event, not an automatic tax reversal.

a treaty-recognized hallmark can reduce assay duplication while the order still
needs import clearance. zero duty can coexist with import vat and handling
fees. multi-step assay routes must account for every relevant border crossing.

## research-to-approval lifecycle

1. collect dated evidence, distinguishing current law, government guidance,
   informational directories, search discovery and failed retrievals.
2. interpret the exact article/route conditions. resolve contradictions and
   changes against primary law and competent-authority guidance.
3. have the responsible reviewer approve a versioned, scoped record containing
   effective dates, expiry/review date, exclusions and supporting source ids.
4. bind quote/routing decisions to those approved versions. unknown, stale,
   expired or contradicted required evidence blocks automatic routing.
5. re-evaluate future orders when rules change, preserving the evidence and
   quote versions attached to orders already accepted.

these approval records do not exist as an implemented service in this pass.
[countries.json](countries.json) deliberately keeps both axis reviews unapproved
and checkout disabled. membership facts may be established while the route
itself remains unresolved.

## quote and product boundaries

studio alone generates and validates geometry. a release exists only after
server-side headless openscad validation; physical validation is not a purity,
hallmarking or customs certificate.

platform consumes the versioned release for offers, listings and orders.
operations remains the trusted source for pricing, taxes, ledger, payment and
settlement. preserve the creator's fixed-net/fixed-retail choice. known assay,
manufacturing, platform and other applicable deductions must not produce an
accepted negative-net sale. unresolved future charges require an explicit
allocation policy, not an undocumented deduction from creator earnings.

creator private location and dashboard locale must not be substituted for
manufacturing origin or exposed as routing metadata on public creator profiles.
legally required shipment evidence remains separate from that public profile.

## implementation verification still required

- prove both approvals are required independently, including ccm-accepted but
  customs-blocked and customs-cleared but mark-ineligible cases.
- distinguish great britain, northern ireland and eu territory exceptions.
- verify assay detours, conditional preferences and effective-date changes.
- verify current low-value schemes without converting bullion, traveler or
  gift allowances into commercial jewelry exemptions.
- preserve immutable decision reasons, rejected alternatives and quote versions.

these are acceptance tests for a future router, not claims of tests against an
implemented router. current checks validate the research pack's integrity only.

see [hallmarking](hallmarking.md), [imports](imports.md),
[regional routing](../../../routing/regional-routing.md), and [overview](README.md).
