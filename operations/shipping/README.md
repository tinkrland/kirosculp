# shipping

serviceability, labels, tracking, delivery events, returns, customs documents, address rules, and delivery exceptions. a carrier advertising worldwide coverage does not make every destination supported.

## address rules

- po boxes are not accepted as delivery addresses. a physical street address is required at checkout, reason-coded at submit time. this is an anti-abuse rule (from the payout-side anti-fraud intuition list: no p.o.-box shipping) and a practical one: carriers require deliverable street addresses for our parcel classes, and proof-of-delivery is part of the dispute-evidence chain.
- this applies to the buyer delivery address side only. manufacturer and foundry addresses (pattern-print broker to foundry routing, see onthehorizon.md) are internal logistics, not checkout addresses.


see [`locale.md`](locale.md) for the country clusters, eu and non-eu distinctions, ccm groupings, and route-specific rollout concerns.

## audited implementation reference

**status: partial address and tracking fields**

### existing source evidence

- checkout collects a shipping address.
- order records include shipping address and tracking number.
- no carrier, rate, label, customs, or delivery-event integration was found.

### what exists now

- address collection and a tracking field do not form a shipping system.

### required changes

- add address validation, rates, service selection, labels, customs data, tracking events, exceptions, returns, claims, and landed-cost handling.
- use the maintained locale clusters and route rules in this folder.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
