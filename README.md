# sculptura

> ai-assisted jewelry cadding, offering, production, and delivery without making creators become cad operators, manufacturers, or logistics teams.

## the shape of the system

sculptura has four product surfaces and two execution domains.

### product surfaces

- **studio** is where creators turn intent into validated geometry
- **platform** is where designs become discoverable and buyable
- **console** is where creators and buyers see money, orders, delivery, and support
- **admin** is the control tower for review, policy, routing, and intervention

### execution domains

- **manufacturing** knows what can be made, by whom, from which materials, under which constraints
- **operations** owns purchase, payout, pricing, settlement, refunds, insurance, shipping, legal, compliance, and country availability

console is not the financial engine. it is a product surface over operations. admin does not contain manufacturing. it configures and supervises it.

```mermaid
flowchart LR
    creator[creator] --> studio

    subgraph studio[studio]
      direction TB
      agent[design agent]
      project[canonical project model]
      geometry[openscad + mesh]
      validation[castability validation]
      agent --> project --> geometry --> validation
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
      rules[legal + compliance + country rollout]
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

## creator-to-customer flow

```text
idea
  ↓
studio project
  ↓
validated design release
  ↓
platform listing
  ↓
country eligibility + trusted price
  ↓
purchase and settlement record
  ↓
regional manufacturing route
  ↓
cast, finish, insure, and ship
```

buyers do not operate the design agent. creators do. ordinary listings support guest checkout. commissions later require buyer authentication, a creator conversation, escrow, acceptance rules, and dispute handling before they can become real.

## repository map

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
```

## boundaries that do not bend

- only studio generates and validates geometry
- only platform manages listings, discovery, storefronts, carts, and buyer-facing checkout
- only operations computes prices, moves money, manages delivery protection, and decides whether a destination is currently supported
- only manufacturing owns material capability truth, manufacturer adapters, quotes, and route eligibility
- console presents operational state but does not become the source of truth for it
- admin changes policy and handles exceptions but does not duplicate domain logic
- platform and manufacturing communicate through versioned contracts, never shared mutable studio state

## country rollout

country support is deny-by-default. a country is not available merely because a carrier can print a label or a manufacturer says it ships worldwide.

rollout happens in phases:

1. sandbox with no live delivery
2. one explicitly approved launch market
3. a small customs-compatible region served by confirmed partners
4. selected additional country pairs after landed-cost, tax, returns, insurance, and carrier checks
5. broader coverage only after operational evidence supports it

exact countries stay out of the allowlist until they are deliberately approved. see [`operations/country-rollout`](operations/country-rollout/README.md).

## current line in the sand

- metal-only jewelry at launch, with no supplied stones
- immutable design releases between studio and platform
- two-way pricing: fix creator earnings or fix retail price
- manufacturer research stays `drafted` until checked and accepted
- commissions remain muted until the whole escrow lifecycle exists
- no unsupported country silently reaches checkout
