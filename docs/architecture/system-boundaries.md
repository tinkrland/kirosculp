# System boundaries

Sculptura has four product surfaces and two execution domains. Folders are ownership boundaries, not merely navigation.

## Product surfaces

### Studio

Creator-only design work. Owns creator projects, Tessa's constrained intent-to-parameter relay, the canonical project model, ParaCraft's deterministic OpenSCAD compilation, physical design rules, browser WebGL rendering of compiled models, manufacturability validation, product renders, and design-release production.

Tessa is not a geometry subsystem. ParaCraft is the only geometric truth. The WebGL renderer displays a ParaCraft preview and may not become a separate production geometry source. The Studio server independently compiles and validates the approved revision in an isolated worker before issuing a release.

### Platform

Public and creator-facing offering work. Owns listings, storefronts, discoverability, buyer experience, carts, checkout presentation, and commission relationships.

Ordinary listings are the default offering path. A creator may later toggle commissions on or off independently. Creator signup never opens commissions automatically.

### Console

Creator and buyer operational views. Shows earnings, payouts, orders, tracking, claims, refunds, support, and reporting. It reads operational records and submits commands through operations interfaces; it does not own those records.

### Admin

Staff control tower. Owns review queues, policy editing, partner activation controls, manual intervention, and audit views. It calls domain control interfaces rather than reimplementing domain rules.

## Execution domains

### Manufacturing

Owns supported material/process combinations, manufacturer capability truth, partner adapters, production quotes, manufacturing route eligibility, and quality history.

### Operations

Owns purchases, pricing, creator payouts, settlement, refunds, shipping, insurance, legal/compliance requirements, and country rollout gates.

## Dependency rules

| Caller | may depend on | may not do |
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

## Canonical objects

- Studio project: mutable creative work, Studio-only
- Tessa proposal: versioned, constrained parameter operations awaiting creator judgment
- ParaCraft build: deterministic OpenSCAD source, compiled geometry, physical-rule result, and hashes
- Design release: immutable versioned handoff from Studio
- Listing: Platform offer pointing at one design release
- Manufacturing quote: partner- and route-specific, time-bounded
- Price snapshot: Operations result attached to listing or purchase
- Purchase: immutable commercial intent plus state transitions
- Production order: Manufacturing request tied to paid purchase and exact release
- Settlement: append-only allocation of costs, fees, refunds, and creator earnings
- Market capability: country-level operational allowlist entry

## Material boundary

Sculptura is permanently metal-only. It does not supply or fulfill stones. A possible future empty bezel or prepared setting for a buyer-provided stone remains an explicitly provisional schema extension rather than a current capability or promised roadmap item.

## Country support

Availability is computed, not implied. Platform asks Operations whether the buyer destination is supported. Operations checks the explicit country allowlist and required capabilities, then Manufacturing confirms an eligible route. Either side may deny checkout; neither may broaden support by assumption.
