# regional manufacturing routing

routing is not “pick the closest caster.” it is a sequence of hard eligibility checks followed by a scored choice among the routes that remain.

## order intake

shopify, a sculptura storefront, or another channel may submit the sale, but channel metadata is not manufacturing truth.

before routing:

- verify the channel signature and account
- process the event idempotently
- resolve the channel item to sculptura's listing and immutable design release
- fetch alloy, size, finish, and production assets from trusted sculptura data
- confirm the destination is enabled for checkout and delivery
- confirm payment has reached the state required by operations policy

## tier 1: market and regulatory eligibility

calculate the exact origin-to-destination route. do not treat geographic labels as proof of legal or tax treatment.

check:

- origin and destination customs territories
- vat, sales-tax, duty, and import handling
- importer-of-record and incoterm requirements
- precious-metal hallmarking and fineness rules
- common control mark eligibility where verified
- authorized assay-office and responsibility-mark arrangements
- sanctions and export restrictions
- carrier restrictions for precious metals
- insurance and declared-value limits
- required customs and production documents
- returns and failed-delivery handling

oss is a vat-reporting mechanism, not a reason to label a route customs-free. schengen is not a goods or customs zone. canada and the united states remain distinct customs destinations. switzerland, the united kingdom, norway, and other non-eu destinations require their own approved route treatment.

an order may cross a customs border when the route is approved and produces a better complete outcome. local-first is a preference, not a rule that overrides capability, quality, cost, or compliance.

## two independently approved regulatory axes

[the dated research pack](../research/topics/order-routing/README.md) distinguishes
finished-article fineness/mark/assay eligibility from physical-route customs and
import treatment. country or convention membership never grants both approvals.

store manufacturing origin, assay detours, dispatch, destination territory,
customs territory, vat territory, origin proof and goods status independently.
an approved route is defined in [route-approval.md](route-approval.md).
use the [route evidence contract](../research/topics/order-routing/route-evidence-contract.md)
before promoting research into versioned route predicates. the country research
matrix remains unapproved and cannot activate checkout.

## tier 2: technical manufacturing eligibility

filter by:

- accepted manufacturer and facility record
- exact alloy and fineness, not only a broad name such as “18k gold”
- required casting process
- wall, feature, tolerance, dimension, and mass limits
- accepted file and unit requirements
- geometry-specific production constraints
- required finish and post-processing
- hallmarking path
- healthy adapter, credentials, and onboarding state

## tier 3: finish, quality, capacity, and service

creator requirements should be measurable production specifications rather than subjective labels such as standard, premium, or master artisan.

examples include:

- polish or surface-finish specification
- plating metal and thickness
- hand-finishing requirement
- engraving-preservation requirement
- inspection level
- visible-layer tolerance
- packaging requirement
- maximum promised production time

facility qualification should use sourced capability plus observed evidence such as defect rate, remake rate, on-time rate, completed-order count, and recent suspensions.

capacity should be represented by process/material availability, next available date, and quoted lead time. active order count alone is not meaningful because orders consume very different amounts of work.

## tier 4: quote and route scoring

only eligible routes are scored. inputs include:

- quoted manufacturing cost
- shipping and insurance cost
- estimated vat, duty, tariff, and customs cost
- expected delivery time
- manufacturer reliability
- quote confidence and expiry
- currency exposure
- claim and remake risk
- physical distance

proximity is evaluated last. the selected route is the best expected compliant and landed outcome, not automatically the nearest facility or cheapest part quote.

## decision record

every selection stores:

- design-release version
- destination and chosen facility
- regulatory and manufacturing ruleset versions
- alternatives rejected and hard-filter reasons
- scored candidates and scoring inputs
- quote and currency snapshot
- expected taxes, duties, shipping, and insurance
- hallmarking route
- whether a human overrode the result, who did it, and why

this record is immutable. later rule or price changes do not rewrite why an earlier order was routed as it was.

## no eligible route

if no route passes every hard requirement, do not silently weaken a constraint. place the order into a reviewable exception state, preserve the payment according to operations policy, and explain the blocking requirement to staff and the customer where appropriate.
