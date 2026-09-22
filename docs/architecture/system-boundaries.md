# system boundaries

sculptura has four product surfaces and two execution domains. folders are ownership boundaries, not merely navigation.

## product surfaces

### studio

creator-only design work. owns creator projects, Tessa's constrained intent-to-parameter relay, the canonical project model, ParaCraft's deterministic OpenSCAD compilation, physical design rules, browser WebGL rendering of compiled models, manufacturability validation, product renders, and design-release production.

Tessa is not a geometry subsystem. ParaCraft is the only geometric truth. the WebGL renderer displays ParaCraft output and may not become a separate production geometry source.

### platform

public and creator-facing offering work. owns listings, storefronts, discoverability, buyer experience, carts, checkout presentation, and commission relationships.

ordinary listings are the default offering path. a creator may later toggle commissions on or off independently. creator signup never opens commissions automatically.

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
| Tessa | Studio project schema and approved parameter vocabulary | generate OpenSCAD, meshes, validation, prices, or production files |
| ParaCraft | accepted Studio parameters and versioned physical rules | manage listings, prices, orders, or manufacturer routing |
| WebGL renderer | compiled ParaCraft model and render metadata | create an independent production model |
| Studio | contracts | read carts, compute retail, select manufacturer |
| Platform | contracts, Operations interfaces | generate geometry, write payouts, call partner APIs |
| Console | Operations read/command interfaces | become a second ledger or shipping database |
| Admin | domain control interfaces and audit reads | copy pricing, routing, or validation logic into UI code |
| Operations | contracts, Manufacturing quote/route interfaces | alter geometry or manufacture directly |
| Manufacturing | design-release production assets, accepted capability records | manage listings, charge buyers, pay creators |

## canonical objects

- Studio project: mutable creative work, Studio-only
- Tessa proposal: versioned, constrained parameter operations awaiting creator judgment
- ParaCraft build: deterministic OpenSCAD source, compiled geometry, physical-rule result, and hashes
- design release: immutable versioned handoff from Studio
- listing: Platform offer pointing at one design release
- manufacturing quote: partner- and route-specific, time-bounded
- price snapshot: Operations result attached to listing or purchase
- purchase: immutable commercial intent plus state transitions
- production order: Manufacturing request tied to paid purchase and exact release
- settlement: append-only allocation of costs, fees, refunds, and creator earnings
- market capability: country-level operational allowlist entry

## material boundary

sculptura is permanently metal-only. it does not supply or fulfill stones. a possible future empty bezel or prepared setting for a buyer-provided stone remains an explicitly provisional schema extension rather than a current capability or promised roadmap item.

## country support

availability is computed, not implied. Platform asks Operations whether the buyer destination is supported. Operations checks the explicit country allowlist and required capabilities, then Manufacturing confirms an eligible route. either side may deny checkout; neither may broaden support by assumption.
