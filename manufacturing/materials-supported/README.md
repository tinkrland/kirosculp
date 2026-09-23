# Materials supported

An allowlist derived from accepted manufacturer capabilities, not a generic list of metals the product would like to offer. Each alloy/process combination needs sourced constraints, an eligible partner, a quote path, and a versioned validation ruleset before it reaches checkout.

## Audited implementation reference

**Status: partial research**

### Existing source evidence

- `sculptura/src/lib/sculpteoMaterials.js`
- `sculptura/src/pages/studio/MaterialsPage.jsx`
- Artifact material fields in both repositories
- `manufacturing/reference/manufacturer-capabilities.json` in this foundation

### What exists now

- Client constants and researched manufacturer records exist, but there is no approved material/process registry used by release validation and routing.

### Required changes

- Create versioned material and process capabilities with units, tolerances, source evidence, approval, effective dates, and partner mappings.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
