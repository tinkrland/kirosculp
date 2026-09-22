# admin

admin is the control tower. it operates the system without quietly becoming the system.

## owns

- design-release review and exceptions
- manufacturer capability records and credential references
- adapter health and partner status
- regional routing policy
- order intervention and audit trails
- global platform settings

## does not own

- creator geometry generation
- storefront presentation
- creator pricing calculations

manufacturers integrate outward through adapters and apis. there is no manufacturer-facing sculptura portal. routing considers destination, capability, landed manufacturing cost, vat/import exposure, tariffs, turnaround, and partner reliability. geographic proximity is an input, not the whole decision.

only manufacturer records with `review_status: "accepted"` may be used for automatic routing. `drafted` means researched but not yet human-approved.
