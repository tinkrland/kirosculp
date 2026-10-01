# admin

admin is the control tower. it sees across domains and provides controlled intervention without absorbing their logic.

## contains

- `review/`: release, listing, and exception queues
- `manufacturer-control/`: partner activation, credential references, and adapter health
- `routing-control/`: route inspection and manual intervention
- `platform-policy/`: fees, rollout, feature, and operational policy controls
- `audit/`: append-only evidence of changes and interventions

manufacturer capability truth and route scoring live in `manufacturing/`. purchases, payouts, shipping, insurance, and country eligibility live in `operations/`. admin edits policy and invokes their control interfaces.

## current implementation

see the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.

## private creator confidence

[creator-trust/](creator-trust/README.md) defines the admin-only internal
classification schema and audited mutation boundary. it is separate from
public creator progression and does not automatically change payout rules.

[buyer-trust/](buyer-trust/README.md) adds the separate registered-buyer
classification schema with the same admin-only boundary. neither model
implements relationship judgments or treats unusual purchases as automatic guilt.
