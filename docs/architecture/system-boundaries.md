# system boundaries

sculptura has four product surfaces and two execution domains. folders are ownership boundaries, not merely navigation.

## product surfaces

### studio

creator-only design work. owns the agent, canonical project model, deterministic geometry, castability validation, product renders, and design-release production.

### platform

public and creator-facing offering work. owns listings, storefronts, discoverability, buyer experience, carts, checkout presentation, and future commission intake.

### console

creator and buyer operational views. shows earnings, payouts, orders, tracking, claims, refunds, support, and reporting. it reads operational records and submits commands through operations interfaces; it does not own those records.

### admin

staff control tower. owns review queues, policy editing, partner activation controls, manual intervention, and audit views. it calls domain control interfaces rather than reimplementing domain rules.

## execution domains

### manufacturing

owns supported material/process combinations, manufacturer capability truth, partner adapters, production quotes, manufacturing route eligibility, and quality history.

### operations

owns purchases, pricing, creator payouts, settlement, refunds, shipping, insurance, legal/compliance requirements, and country rollout gates.

## dependency rules

| caller | may depend on | may not do |
|---|---|---|
| studio | contracts | read carts, compute retail, select manufacturer |
| platform | contracts, operations interfaces | generate geometry, write payouts, call partner apis |
| console | operations read/command interfaces | become a second ledger or shipping database |
| admin | domain control interfaces and audit reads | copy pricing, routing, or validation logic into ui code |
| operations | contracts, manufacturing quote/route interfaces | alter geometry or manufacture directly |
| manufacturing | design-release production assets, accepted capability records | manage listings, charge buyers, pay creators |

## canonical objects

- studio project: mutable creative work, studio-only
- design release: immutable versioned handoff from studio
- listing: platform offer pointing at one design release
- manufacturing quote: partner- and route-specific, time-bounded
- price snapshot: operations result attached to listing or purchase
- purchase: immutable commercial intent plus state transitions
- production order: manufacturing request tied to paid purchase and exact release
- settlement: append-only allocation of costs, fees, refunds, and creator earnings
- market capability: country-level operational allowlist entry

## country support

availability is computed, not implied. platform asks operations whether the buyer destination is supported. operations checks the explicit country allowlist and required capabilities, then manufacturing confirms an eligible route. either side may deny checkout; neither may broaden support by assumption.
