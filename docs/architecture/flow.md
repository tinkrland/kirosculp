# end-to-end flow

```mermaid
sequenceDiagram
    actor Creator
    participant Studio
    participant Platform
    participant Console
    participant Admin
    participant Manufacturer
    actor Buyer

    Creator->>Studio: describe and refine the piece
    Studio->>Studio: generate geometry and validate castability
    Studio-->>Platform: immutable design release
    Creator->>Platform: publish release as listing
    Platform->>Console: request regional prices
    Console-->>Platform: retail and earnings snapshots
    Buyer->>Platform: purchase metal + size
    Platform->>Console: authorize payment from trusted server price
    Console-->>Admin: paid production order
    Admin->>Admin: filter and score eligible regional routes
    Admin->>Manufacturer: submit design release asset + production spec
    Manufacturer-->>Admin: status + tracking
    Admin-->>Console: shipping and delivery events
    Console-->>Creator: release creator payout per policy
    Console-->>Buyer: tracking, protection, refund/claim state
```

## commissions later

commissioning adds a second pre-release conversation, but it does not change the core boundary. the commissioner gives references and requirements to a creator. the creator uses studio. studio still emits the release. escrow and acceptance belong to console/platform, not studio.
