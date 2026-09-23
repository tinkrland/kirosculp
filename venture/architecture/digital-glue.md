# The digital glue

## Not reinventing the wheel

Sculptura does not need to own every layer to own the product experience.

```text
[ creator intent ]
        ↓
[ Tessa: constrained translation ]
        ↓
[ ParaCraft: OpenSCAD compiler + physical rules ]
        ↓
[ versioned design release ]
        ↓
[ listing + trusted route-aware price ]
        ↓
[ payment and connected-account rails ]
        ↓
[ approved local casting partner ]
        ↓
[ production, delivery, settlement ]
```

## Reused rails

### OpenSCAD

OpenSCAD provides deterministic constructive geometry. Sculptura does not need to invent a new geometric language. ParaCraft supplies the jewelry-specific compiler framework, parameter vocabulary, physical rule sets, reproducibility, testing, and release contract around it.

### WebGL

WebGL supplies browser rendering. Sculptura does not need a native desktop CAD renderer. The creator sees and manipulates a view of the compiled model in-browser.

### Payment providers

Payment networks and connected-account providers handle regulated card acceptance, identity verification, account onboarding, and transfers. Sculptura owns the purchase state, pricing allocation, release and route references, operational ledger, and reconciliation.

Stripe Connect is the intended first connected-account rail. This must be described accurately: destination charges, separate charges and transfers, reserve behavior, refunds, disputes, and liability depend on the chosen integration and platform agreement. Using Connect does not automatically eliminate accounting or platform liability.

### Controlled factory-payment rails

Single-use virtual cards may be a useful way to pay exact approved factory costs when a provider and caster workflow support them. Stripe Issuing or another commercial-card product could provide that rail. This is a proposed implementation option, not a current capability or guaranteed regional feature.

### Distributed casting partners

Existing casting bureaus already own printers, investment equipment, furnaces, finishing tools, metal procurement, trained operators, and domestic shipping relationships. Sculptura integrates with those capabilities rather than recreating them.

### Tax, shipping, and hallmarking systems

Sculptura should integrate applicable tax reporting, carrier, customs, and hallmarking workflows. This can include EU OSS where legally applicable, but the compliance engine must model the actual seller, dispatch country, destination, threshold, product, and manufacturing route. “localized” does not mean automatically compliant.

## What Sculptura owns

- The creator workflow and project history
- Tessa's constrained proposal protocol
- ParaCraft's jewelry parameter language, compiler modules, physical rules, and test corpus
- Browser interaction around deterministic geometry
- The immutable design-release contract
- Offering and channel state
- Two-way pricing logic
- Manufacturing capability normalization
- Compliance-aware route eligibility and decision explanations
- Adapter contracts and reconciliation
- Order, production, delivery, and settlement state
- Quality and exception feedback loops

## Why the glue matters

None of the reused rails solves the whole problem. OpenSCAD does not understand creator onboarding, Stripe does not validate wall thickness, a caster API does not manage storefronts, and a marketplace listing does not prove a file can survive casting.

The product is the enforced contract between those systems.
