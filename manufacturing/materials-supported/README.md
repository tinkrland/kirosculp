# materials supported

an allowlist derived from accepted manufacturer capabilities, not a generic list of metals the product would like to offer. each alloy/process combination needs sourced constraints, an eligible partner, a quote path, and a versioned validation ruleset before it reaches checkout.

## audited implementation reference

**status: partial research**

### existing source evidence

- `sculptura/src/lib/sculpteoMaterials.js`
- `sculptura/src/pages/studio/MaterialsPage.jsx`
- artifact material fields in both repositories
- `manufacturing/reference/manufacturer-capabilities.json` in this foundation

### what exists now

- client constants and researched manufacturer records exist, but there is no approved material/process registry used by release validation and routing.

### required changes

- create versioned material and process capabilities with units, tolerances, source evidence, approval, effective dates, and partner mappings.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
