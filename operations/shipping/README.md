# Shipping

Serviceability, labels, tracking, delivery events, returns, customs documents, address rules, and delivery exceptions. A carrier advertising worldwide coverage does not make every destination supported.


See [`locale.md`](locale.md) for the country clusters, EU and non-EU distinctions, CCM groupings, and route-specific rollout concerns.

## Audited implementation reference

**Status: partial address and tracking fields**

### Existing source evidence

- Checkout collects a shipping address.
- Order records include shipping address and tracking number.
- No carrier, rate, label, customs, or delivery-event integration was found.

### What exists now

- Address collection and a tracking field do not form a shipping system.

### Required changes

- Add address validation, rates, service selection, labels, customs data, tracking events, exceptions, returns, claims, and landed-cost handling.
- Use the maintained locale clusters and route rules in this folder.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
