# Studio: Tessa

Tessa is the intuitive middle layer between a creator and ParaCraft. She is an operator and translator, not a geometry generator.

## Relay contract

```text
creator taste, language, and visual references
  ↓
tessa interprets intent
  ↓
versioned proposal of predefined parameter changes
  ↓
creator accepts, rejects, or adjusts
  ↓
paracraft compiles OpenSCAD and enforces physical rules
  ↓
WebGL renders the deterministic model in the browser
```

Tessa may:

- Inspect creator-provided references
- Identify visual relationships and likely design intent
- Map words such as organic, molten, narrow, folded, brushed, or smooth to approved controls
- Propose bounded numeric values and parameter operations
- Explain what a control changes
- Compare the rendered result with the creator's stated intention

Tessa may not:

- Generate OpenSCAD, meshes, vertices, STL files, or production geometry
- Add controls that do not exist in the project schema
- Bypass creator approval
- Declare a design castable
- Weaken wall, clearance, shrinkage, feature, or process limits
- Compute retail prices or choose manufacturers

ParaCraft owns the rigid mathematical code and physical safety lines. Tessa only turns predefined knobs.

See the [Tessa parameter protocol and tooling plan](architecture.md) for Pydantic/optional Protocol Buffers, Git and DVC lineage, bounded agent tools, and Redis configuration caching. None of these replaces creator approval or server-side ParaCraft validation.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- No Tessa implementation was found in either source repository
- `sculptura/src/pages/studio/BuildPage.jsx` exposes many of the structured controls Tessa will eventually be allowed to propose
- The source does not yet include visual-reference ingestion, a proposal schema, creator approval history, or a parameter-operation boundary

### Required changes

- Define a versioned Tessa proposal schema with an allowlist of parameter paths and operations
- Constrain every numeric proposal to project and compiler bounds
- Record the input references, model version, proposal, creator decision, and resulting project revision
- Send only accepted parameters to ParaCraft
- Test that malformed or adversarial instructions cannot cross the compiler boundary

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
