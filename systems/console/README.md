# console

console is the financial, protection, and delivery surface behind a creator's business.

## owns

- manufacturer-cost snapshots used for sale calculations
- two-way pricing: lock creator earnings or lock retail price
- platform fees and payment-processing costs
- connected payout accounts and payout schedules
- coupons and discounts
- shipping labels, tracking, insurance, claims, refunds, and chargebacks
- immutable settlement records for every order

## does not own

- cad, meshes, geometry, or castability
- listings and storefront presentation
- manufacturer capability truth or routing policy

## pricing invariant

one mode locks creator earnings and solves for retail. the other locks retail and solves for creator earnings. both use the same underlying equation and regional manufacturing quote; there are not two independent pricing implementations.

```text
retail = manufacturing + payment costs + platform fee + creator earnings
```

console writes the resolved snapshot to the listing/order. checkout reads it and never trusts a price supplied by the browser.
