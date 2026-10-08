# shipping

serviceability, labels, tracking, delivery events, returns, customs documents, address rules, and delivery exceptions. a carrier advertising worldwide coverage does not make every destination supported.

## address rules

- buyer delivery addresses must be physical street addresses. three address-shape classes are banned from checkout delivery, rejected at submit time with machine-readable reason codes keyed to the classes reported by thelocaletell (see the [tell adapter boundary](../../platform/tell-adapters.md) for how the signals are consumed):
  - **po box equivalents**: each market's own postal vocabulary (po box, postfach, boite postale, apartado, postbus, private bag, locked bag, bfpo, cedex and more).
  - **virtual mailboxes and cmra storefronts**: commercial mail receiving agencies and virtual-mailbox providers, including street-style suite addresses with no brand token in the lines.
  - **reshipping facilities**: parcel-forwarding and consolidator addresses that exist to hold a shipping identity in a market the buyer is not in.
- the rationale is aml, not convenience: sculptura is a dealer in precious metals and stones, and anonymous or identity-laundering delivery points (post boxes, mailbox-receiving agencies, reshippers) are recognized aml risk channels for dpms goods. we do not ship into them. the original anti-abuse and practical arguments (carriers require deliverable street addresses for our parcel classes, proof-of-delivery is part of the dispute-evidence chain) still hold underneath.
- parcel lockers and carrier pickup points are not in the banned classes and remain allowed: the buyer attends the carrier point in person, and the classes are kept distinct by thelocaletell for exactly this kind of per-class decision.
- enforcement is aml-conservative: for the three banned classes, suggestive-or-better evidence blocks at submit time with the reason code, since the cost of a false positive is one address edit while the cost of a miss is an aml channel. where the classifier honestly cannot see a class (cmra chains with no brand token in the lines), the ban is enforced on what is observable and no full-coverage claim is made; unknown is never silently converted into 'street address verified'.
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
