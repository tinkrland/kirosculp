# studio: tessa

Tessa is the intuitive middle layer between a creator and ParaCraft. she is an operator and translator, not a geometry generator.

## relay contract

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

- inspect creator-provided references
- identify visual relationships and likely design intent
- map words such as organic, molten, narrow, folded, brushed, or smooth to approved controls
- propose bounded numeric values and parameter operations
- explain what a control changes
- compare the rendered result with the creator's stated intention

Tessa may not:

- generate OpenSCAD, meshes, vertices, STL files, or production geometry
- add controls that do not exist in the project schema
- bypass creator approval
- declare a design castable
- weaken wall, clearance, shrinkage, feature, or process limits
- compute retail prices or choose manufacturers

ParaCraft owns the rigid mathematical code and physical safety lines. Tessa only turns predefined knobs.

## audited implementation reference

**status: missing**

### existing source evidence

- no Tessa implementation was found in either source repository
- `sculptura/src/pages/studio/BuildPage.jsx` exposes many of the structured controls Tessa will eventually be allowed to propose
- the source does not yet include visual-reference ingestion, a proposal schema, creator approval history, or a parameter-operation boundary

### required changes

- define a versioned Tessa proposal schema with an allowlist of parameter paths and operations
- constrain every numeric proposal to project and compiler bounds
- record the input references, model version, proposal, creator decision, and resulting project revision
- send only accepted parameters to ParaCraft
- test that malformed or adversarial instructions cannot cross the compiler boundary

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
