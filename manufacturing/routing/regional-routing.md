# Regional manufacturing routing

Routing is not “pick the closest caster.” it is a sequence of hard eligibility checks followed by a scored choice among the routes that remain.

## Order intake

Shopify, a Sculptura storefront, or another channel may submit the sale, but channel metadata is not manufacturing truth.

Before routing:

- Verify the channel signature and account
- Process the event idempotently
- Resolve the channel item to Sculptura's listing and immutable design release
- Fetch alloy, size, finish, and production assets from trusted Sculptura data
- Confirm the destination is enabled for checkout and delivery
- Confirm payment has reached the state required by operations policy

## Tier 1: market and regulatory eligibility

Calculate the exact origin-to-destination route. Do not treat geographic labels as proof of legal or tax treatment.

Check:

- Origin and destination customs territories
- VAT, sales-tax, duty, and import handling
- Importer-of-record and incoterm requirements
- Precious-metal hallmarking and fineness rules
- Common control mark eligibility where verified
- Authorized assay-office and responsibility-mark arrangements
- Sanctions and export restrictions
- Carrier restrictions for precious metals
- Insurance and declared-value limits
- Required customs and production documents
- Returns and failed-delivery handling

OSS is a vat-reporting mechanism, not a reason to label a route customs-free. Schengen is not a goods or customs zone. Canada and the united states remain distinct customs destinations. Switzerland, the united kingdom, norway, and other non-eu destinations require their own approved route treatment.

An order may cross a customs border when the route is approved and produces a better complete outcome. Local-first is a preference, not a rule that overrides capability, quality, cost, or compliance.

## Tier 2: technical manufacturing eligibility

Filter by:

- Accepted manufacturer and facility record
- Exact alloy and fineness, not only a broad name such as “18k gold”
- Required casting process
- Wall, feature, tolerance, dimension, and mass limits
- Accepted file and unit requirements
- Geometry-specific production constraints
- Required finish and post-processing
- Hallmarking path
- Healthy adapter, credentials, and onboarding state

## Tier 3: finish, quality, capacity, and service

Creator requirements should be measurable production specifications rather than subjective labels such as standard, premium, or master artisan.

Examples include:

- Polish or surface-finish specification
- Plating metal and thickness
- Hand-finishing requirement
- Engraving-preservation requirement
- Inspection level
- Visible-layer tolerance
- Packaging requirement
- Maximum promised production time

Facility qualification should use sourced capability plus observed evidence such as defect rate, remake rate, on-time rate, completed-order count, and recent suspensions.

Capacity should be represented by process/material availability, next available date, and quoted lead time. Active order count alone is not meaningful because orders consume very different amounts of work.

## Tier 4: quote and route scoring

Only eligible routes are scored. Inputs include:

- Quoted manufacturing cost
- Shipping and insurance cost
- Estimated VAT, duty, tariff, and customs cost
- Expected delivery time
- Manufacturer reliability
- Quote confidence and expiry
- Currency exposure
- Claim and remake risk
- Physical distance

Proximity is evaluated last. The selected route is the best expected compliant and landed outcome, not automatically the nearest facility or cheapest part quote.

## Decision record

Every selection stores:

- Design-release version
- Destination and chosen facility
- Regulatory and manufacturing ruleset versions
- Alternatives rejected and hard-filter reasons
- Scored candidates and scoring inputs
- Quote and currency snapshot
- Expected taxes, duties, shipping, and insurance
- Hallmarking route
- Whether a human overrode the result, who did it, and why

This record is immutable. Later rule or price changes do not rewrite why an earlier order was routed as it was.

## No eligible route

If no route passes every hard requirement, do not silently weaken a constraint. Place the order into a reviewable exception state, preserve the payment according to operations policy, and explain the blocking requirement to staff and the customer where appropriate.
