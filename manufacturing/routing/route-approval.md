# route approval: what approved means

the definition a route predicate must satisfy to count as approved, and the rule the submit-time checkout gate (and the future router) binds to. companion to [regional-routing.md](regional-routing.md); the research-side evidence requirements live in the [route evidence contract](../research/topics/order-routing/route-evidence-contract.md).

## predicate lifecycle

a route predicate record (one manufacturer profile joined to one enabled destination) moves through:

- **draft:** evidence assembled, no reviewer signoff. never usable.
- **reviewed:** contradictions resolved against primary sources, conditions scoped. not yet usable.
- **approved:** a named reviewer signed a versioned record. the only usable state.
- **expired:** past its review date. deny until re-reviewed; expired is not silently still approved.
- **superseded:** replaced by a newer version. kept for orders already accepted, never for new routing.

## what an approved version must carry

- version id and scope (manufacturer profile, destination)
- effective interval (from, to) and a review date that arrives before the facts go stale
- exclusions and conditions, explicit, not implied by silence
- source ids into the dated research pack; no permanent country rates copied from snippets
- `approved_by`, `approved_at` (utc)
- per-axis findings recorded independently

## two independent approvals on one record

axis one (finished-article market eligibility) and axis two (physical route and landed treatment) are approved separately. both must be approved for the route to count; neither carries the other. a ccm-accepted but customs-blocked route stays blocked, and so does the reverse. membership facts may be established while the route itself remains unresolved.

## minimum evidence per axis

**axis one:** current legal source with effective interval for the article type; applicable fineness and marking requirements; ccm entitlement evidence (designated assay office, valid mark set, responsibility registration, domestic acceptance) or a national/bilateral recognized-mark path; actual assay capability with fees, turnaround, and custody where marking is required.

**axis two:** customs procedure and commodity classification; goods status and valuation basis; preferential-origin rule and proof where claimed; vat role, registration, and low-value scheme eligibility where applicable; importer of record and incoterm; carrier acceptance for precious metals with declared-value and insurance caps; the document set for the border.

every item is dated and sourced. unknown, stale, expired, or contradicted required evidence blocks automatic routing.

## binding rule

- a destination is approved for checkout only while at least one predicate for it is in approved state, unexpired, with both axes approved, and not eliminated by listing constraints.
- the submit-time gate and the future router bind to approved versions only. rejected submits carry the reason codes defined in [contracts/checkout-intake.md](../../contracts/checkout-intake.md).
- re-approval on rule change creates a new version; orders already accepted keep their bound version and its evidence.

## approval is a human act

the validator may confirm a record is structurally approvable. only a named reviewer can approve. no automated process may set `approved_by`.

## status

definition document, not an implemented service. `countries.json` and the shipping-markets file remain unapproved until predicate records exist and pass this definition. when the router is built, its acceptance tests must include the ccm-accepted/customs-blocked and customs-cleared/mark-ineligible cases from the evidence contract.
