# Sculptura

> A path from a jewelry idea to a manufacturable, sellable, made-to-order piece, without requiring a workshop, inventory, or years of CAD training.

## The problem

Many people already have strong creative instincts. They save references, build Pinterest boards, notice forms and details, and can describe the piece they wish existed. What often never occurs to them is that they could become the creator.

Traditional jewelry design makes that leap feel out of scope. The person is expected to learn difficult and expensive CAD software, understand manufacturing constraints, source metal and specialist suppliers, fund prototypes, hold inventory, arrange photography and sales, and solve fulfillment before the first piece has even found a buyer.

That filters out people with taste and ideas long before their work can become real. Sculptura exists to patch that gap.

## What Sculptura changes

Sculptura connects four stages that are normally fragmented:

1. Shape an idea into precise, editable jewelry parameters
2. Turn those parameters into deterministic geometry and validate whether it can be made
3. Publish the approved design as an offer without requiring inventory
4. Route each paid order to an eligible manufacturing partner for casting, finishing, and delivery

The creator remains the author. Sculptura removes technical and operational barriers around that authorship.

## How creative assistance works

Creators can work directly with the studio controls, but they do not have to master conventional CAD software first.

**Tessa** is the studio's intuitive middle layer and operator for **ParaCraft**. She looks at references, listens to the creator's description, and translates natural human language into proposed values for predefined dimensions, profiles, repetitions, relationships, and other allowed controls.

Tessa does not generate geometry, meshes, OpenSCAD, or production files. She runs the middle leg of a relay: creator intent enters, constrained numeric parameters leave, and ParaCraft takes the baton. ParaCraft is the deterministic compiler framework, built on OpenSCAD, that constructs the model and enforces the unyielding physical rules such as wall thickness, shrinkage, clearances, and process limits. Tessa can turn approved knobs; she cannot invent new ones or cross a safety line.

Creators see the resulting OpenSCAD model in the browser through the WebGL rendering layer. The rendered view is an interface to deterministic geometry, not a separate model guessed by the assistant.

## The shape of the system

Sculptura has four product surfaces and two execution domains.

### Product surfaces

- **Studio** is where creators shape intent, operate ParaCraft, validate geometry, and issue design releases
- **Platform** is where released designs become listings, storefront products, commissions, and purchases
- **Console** is where creators and buyers see orders, money, delivery, support, and account state
- **Admin** is the control tower for review, policy, routing, partner control, and intervention

### Execution domains

- **Manufacturing** knows what can be made, by whom, from which materials, under which constraints
- **Operations** owns purchase, payout, pricing, settlement, refunds, insurance, shipping, legal, compliance, and market availability

Console is not the financial engine. It is a product surface over operations. Admin does not contain manufacturing. It configures and supervises it.

```mermaid
flowchart LR
    creator[creator] --> studio

    subgraph studio[studio]
      direction TB
      tessa[tessa: intent to allowed parameters]
      project[canonical project model]
      paracraft[paracraft: openscad compiler + physical rules]
      validation[castability validation]
      tessa --> project --> paracraft --> validation
    end

    validation -->|immutable design release| platform

    subgraph platform[platform]
      direction TB
      creators[creator offering tools]
      discovery[discoverability]
      buyers[buyer experience]
      checkout[checkout]
      creators --> discovery --> buyers --> checkout
    end

    checkout -->|purchase request| operations

    subgraph operations[operations]
      direction TB
      financial[purchase + pricing + payout]
      delivery[shipping + insurance]
      rules[legal + compliance + rollout]
      financial --> delivery
      rules --> financial
      rules --> delivery
    end

    operations -->|eligible paid order| manufacturing

    subgraph manufacturing[manufacturing]
      direction TB
      materials[materials supported]
      partner[manufacturer layer]
      route[regional routing]
      materials --> route
      partner --> route
    end

    route --> maker[casting partner]
    maker --> customer[customer]

    operations --> console[console]
    console --> creator
    console --> customer

    admin[admin] -. policy + intervention .-> platform
    admin -. policy + intervention .-> operations
    admin -. partner control .-> manufacturing
```

## Creator-to-customer flow

```text
idea and references
  ↓
studio project with explicit parameters
  ↓
paracraft geometry and manufacturing validation
  ↓
versioned design release
  ↓
platform listing
  ↓
route eligibility and trusted price
  ↓
purchase and settlement record
  ↓
regional manufacturing route
  ↓
cast, finish, insure, and ship
```

Buyers do not operate Tessa or paracraft. Creators do. Ordinary listings support guest checkout. Commissioners require accounts because a commission involves a creator relationship, conversation history, revisions, approval, payment protection, cancellation, and disputes.

## Repository map

```text
studio/
  creators/
  design-agent/
  project-model/
  geometry/
  validation/
  releases/
  virtual-studio/

platform/
  creators/
  buyers/
  discoverability/
  storefronts/
  commissions/
  checkout/

console/
  creators/
  buyers/
  support/
  reporting/

admin/
  review/
  manufacturer-control/
  routing-control/
  platform-policy/
  audit/

manufacturing/
  materials-supported/
  routing/
  manufacturer-layer/
  quotes/
  quality/
  reference/
  research/
  schemas/
  tasks/

operations/
  financial/
    purchase/
    payout/
    pricing/
    settlement/
    refunds/
  insurance/
  shipping/
  legal/
  compliance/
  country-rollout/

contracts/
  design-release.md
  design-release.schema.json

venture/
  thesis/
  product/
  architecture/
  moat/
  economics/
  go-to-market/
  risks/
```

## Venture thesis

[`venture/`](venture/README.md) explains the problem, five participant perspectives, asset-light operating model, digital-glue architecture, defensibility, creator flywheel, and the claims that still need proof. It keeps investor language separate from implementation truth while grounding both in the same system boundaries.

## Boundaries that do not bend

- Only studio generates and validates geometry
- Tessa may interpret intent and propose constrained parameters, but never generates production geometry
- Only ParaCraft turns approved parameters into OpenSCAD geometry and enforces physical design rules
- Only platform manages listings, discovery, storefronts, carts, and buyer-facing checkout
- Only operations computes trusted prices, moves money, manages delivery protection, and decides whether a route is available
- Only manufacturing owns material capability truth, manufacturer adapters, quotes, and route eligibility
- Console presents operational state but does not become its source of truth
- Admin changes policy and handles exceptions but does not duplicate domain logic
- Studio and platform communicate through immutable, versioned design releases rather than shared mutable project state

## Rollout detail

Market availability, creator onboarding, shipping clusters, hallmarking, customs, and route activation are operational concerns. They live under [`operations/country-rollout`](operations/country-rollout/README.md) and [`operations/shipping`](operations/shipping/README.md), not in this introduction.

## Current line in the sand

- Metal-only jewelry is permanent scope, with no supplied stones
- Empty bezels or prepared settings for a buyer-provided future stone are intentionally undecided, not promised architecture
- Immutable design releases between studio and platform
- Two-way pricing: fix creator earnings or fix retail price
- Manufacturer evidence remains drafted until checked and accepted
- Commissions remain muted until authentication, conversation, escrow, approval, cancellation, and disputes work together
- No unsupported route silently reaches checkout
- No client-provided price, manufacturing cost, earnings value, or validation claim is trusted

## Implementation audit

[`docs/current-state-audit.md`](docs/current-state-audit.md) maps both existing source repositories to this target architecture and distinguishes what already exists from what must move, be rewritten, or be built.
