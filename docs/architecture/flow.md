# end-to-end flow

```mermaid
sequenceDiagram
    actor Creator
    actor Buyer
    participant Tessa
    participant ParaCraft
    participant WebGL
    participant Platform
    participant Operations
    participant Manufacturing
    participant Admin
    participant Console
    participant Partner as Casting partner

    Creator->>Tessa: intent, language, and references
    Tessa-->>Creator: bounded parameter proposal
    Creator->>ParaCraft: accept or adjust parameters
    ParaCraft->>ParaCraft: compile OpenSCAD and enforce physical rules
    ParaCraft-->>WebGL: deterministic compiled model
    WebGL-->>Creator: interactive browser render
    Creator->>ParaCraft: approve release candidate
    ParaCraft->>ParaCraft: validate and create immutable release
    ParaCraft-->>Platform: immutable design release
    Creator->>Platform: publish ordinary listing
    Platform->>Operations: request destination eligibility and price
    Operations->>Manufacturing: request eligible route and quote
    Manufacturing-->>Operations: normalized route quote
    Operations-->>Platform: trusted retail and earnings snapshot
    Buyer->>Platform: purchase metal, size, and destination
    Platform->>Operations: create purchase from trusted snapshot
    Operations->>Manufacturing: release eligible paid production order
    Manufacturing->>Partner: upload exact release asset and production spec
    Partner-->>Manufacturing: production, shipment, and tracking events
    Manufacturing-->>Operations: normalized fulfillment events
    Operations-->>Console: payout, delivery, claim, and refund state
    Console-->>Creator: earnings and order view
    Console-->>Buyer: receipt, tracking, and support view
    Admin-->>Operations: approved policy or manual intervention
    Admin-->>Manufacturing: partner activation or route intervention
```

## optional commission progression

commissioning is not the entry point and is never enabled by creator signup.

1. a person becomes a creator
2. the creator develops private Studio projects
3. passing work becomes design releases
4. the creator publishes ordinary made-to-order listings
5. the creator may later toggle commissions on
6. authenticated commissioners submit briefs to that creator
7. the creator remains the only person operating Tessa and ParaCraft
8. the commission uses the same release, pricing, payment-protection, manufacturing, and fulfillment boundaries
9. the creator may pause new commissions without removing ordinary listings

Platform owns the authenticated conversation surface. Operations owns escrow or milestone protection, acceptance, cancellation, and dispute state. Studio still emits the exact release.
