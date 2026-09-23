# end-to-end flow

```mermaid
sequenceDiagram
    actor Creator
    actor Buyer
    participant Tessa
    participant ParaCraft
    participant WebGL
    participant StudioServer as Studio server validation worker
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
    Creator->>StudioServer: approve exact project revision for release
    StudioServer->>ParaCraft: independently compile pinned revision in isolated worker
    ParaCraft-->>StudioServer: production mesh and source hashes
    StudioServer->>StudioServer: measure mesh, enforce physical rules, verify approval
    StudioServer-->>Platform: immutable validated design release
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
2. the creator develops private studio projects
3. passing work becomes design releases
4. the creator publishes ordinary made-to-order listings
5. the creator may later toggle commissions on
6. authenticated commissioners submit briefs to that creator
7. the creator remains the only person operating tessa and paracraft
8. the commission uses the same release, pricing, payment-protection, manufacturing, and fulfillment boundaries
9. the creator may pause new commissions without removing ordinary listings

platform owns the authenticated conversation surface. operations owns payment or milestone protection (not automatically legal escrow), acceptance, cancellation, and dispute state. studio still emits the exact release.
