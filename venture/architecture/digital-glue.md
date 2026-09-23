# the digital glue

## not reinventing the wheel

sculptura does not need to own every layer to own the product experience.

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

## reused rails

### openscad

openscad provides deterministic constructive geometry. sculptura does not need to invent a new geometric language. paracraft supplies the jewelry-specific compiler framework, parameter vocabulary, physical rule sets, reproducibility, testing, and release contract around it.

### webgl

webgl supplies browser rendering. sculptura does not need a native desktop cad renderer. the creator sees and manipulates a view of the compiled model in-browser.

### payment providers

payment networks and connected-account providers handle regulated card acceptance, identity verification, account onboarding, and transfers. sculptura owns the purchase state, pricing allocation, release and route references, operational ledger, and reconciliation.

stripe connect is the intended first connected-account rail. this must be described accurately: destination charges, separate charges and transfers, reserve behavior, refunds, disputes, and liability depend on the chosen integration and platform agreement. using connect does not automatically eliminate accounting or platform liability.

### controlled factory-payment rails

single-use virtual cards may be a useful way to pay exact approved factory costs when a provider and caster workflow support them. stripe issuing or another commercial-card product could provide that rail. this is a proposed implementation option, not a current capability or guaranteed regional feature.

### distributed casting partners

existing casting bureaus already own printers, investment equipment, furnaces, finishing tools, metal procurement, trained operators, and domestic shipping relationships. sculptura integrates with those capabilities rather than recreating them.

### tax, shipping, and hallmarking systems

sculptura should integrate applicable tax reporting, carrier, customs, and hallmarking workflows. this can include eu oss where legally applicable, but the compliance engine must model the actual seller, dispatch country, destination, threshold, product, and manufacturing route. “localized” does not mean automatically compliant.

## what sculptura owns

- the creator workflow and project history
- tessa's constrained proposal protocol
- paracraft's jewelry parameter language, compiler modules, physical rules, and test corpus
- browser interaction around deterministic geometry
- the immutable design-release contract
- offering and channel state
- two-way pricing logic
- manufacturing capability normalization
- compliance-aware route eligibility and decision explanations
- adapter contracts and reconciliation
- order, production, delivery, and settlement state
- quality and exception feedback loops

## why the glue matters

none of the reused rails solves the whole problem. openscad does not understand creator onboarding, stripe does not validate wall thickness, a caster api does not manage storefronts, and a marketplace listing does not prove a file can survive casting.

the product is the enforced contract between those systems.
