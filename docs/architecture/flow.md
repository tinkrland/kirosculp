# End-to-end flow

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

## Optional commission progression

Commissioning is not the entry point and is never enabled by creator signup.

1. A person becomes a creator
2. The creator develops private Studio projects
3. Passing work becomes design releases
4. The creator publishes ordinary made-to-order listings
5. The creator may later toggle commissions on
6. Authenticated commissioners submit briefs to that creator
7. The creator remains the only person operating Tessa and ParaCraft
8. The commission uses the same release, pricing, payment-protection, manufacturing, and fulfillment boundaries
9. The creator may pause new commissions without removing ordinary listings

Platform owns the authenticated conversation surface. Operations owns payment or milestone protection (not automatically legal escrow), acceptance, cancellation, and dispute state. Studio still emits the exact release.
