# Admin

Admin is the control tower. It sees across domains and provides controlled intervention without absorbing their logic.

## Contains

- `review/`: release, listing, and exception queues
- `manufacturer-control/`: partner activation, credential references, and adapter health
- `routing-control/`: route inspection and manual intervention
- `platform-policy/`: fees, rollout, feature, and operational policy controls
- `audit/`: append-only evidence of changes and interventions

Manufacturer capability truth and route scoring live in `manufacturing/`. Purchases, payouts, shipping, insurance, and country eligibility live in `operations/`. Admin edits policy and invokes their control interfaces.

## Current implementation

See the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
