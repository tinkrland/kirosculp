# shipping

serviceability, labels, tracking, delivery events, returns, customs documents, address rules, and delivery exceptions. a carrier advertising worldwide coverage does not make every destination supported.


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
