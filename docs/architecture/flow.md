# end-to-end flow

```mermaid
sequenceDiagram
    actor Creator
    actor Buyer
    participant Studio
    participant Platform
    participant Operations
    participant Manufacturing
    participant Admin
    participant Console
    participant Partner as Casting partner

    Creator->>Studio: describe and refine piece
    Studio->>Studio: generate geometry and validate
    Studio-->>Platform: immutable design release
    Creator->>Platform: publish release
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

## commissions later

commissioning adds an authenticated brief and an escrow lifecycle before release, but keeps the same ownership. the commissioner gives requirements to a creator. the creator uses studio. studio emits the release. platform owns the conversation surface; operations owns escrow, acceptance, cancellation, and dispute state.
