# Studio: ParaCraft geometry

ParaCraft is the deterministic compiler framework. It uses OpenSCAD under the hood to convert the canonical project parameters into rigid mathematical geometry and applies the physical rules required for manufacturable metal jewelry.

## Compiler responsibilities

- Accept only schema-valid, bounded project parameters
- Generate readable, versioned OpenSCAD
- Compile a watertight model and production mesh
- Enforce wall thickness, shrinkage allowances, clearances, minimum features, and process constraints
- Produce stable geometry and file hashes from stable inputs
- Expose the compiled model to the creator-facing WebGL renderer
- Provide the exact geometry used by validation, mass estimation, release creation, and production

WebGL is the interactive browser rendering layer. It displays the compiled OpenSCAD result. It must not become a second independent geometry implementation.

## Audited implementation reference

**Status: partial, with an important convergence gap**

### Existing source evidence

- `sculptura/src/components/canvas/JewelryViewport.jsx`
- `sculptura/src/components/canvas/RingViewport.jsx`
- `sculptura/src/components/canvas/CodePanel.jsx`
- `sculptura/src/lib/jewelryDefaults.js`
- `sculptura/src/lib/jewelryTemplates.js`
- `sculptura/src/lib/multiPieceJewelry.js`
- `sculptura/src/lib/svgToShape.js`
- `sculptura/src/lib/stlExport.js`

### What exists now

- A WebGL/Three.js browser viewport renders interactive jewelry models for several jewelry types
- The source includes procedural preview geometry, multi-piece behavior, and client-side clay deformation
- OpenSCAD generation exists mainly for the ring path, and STL export serializes scene geometry
- The audited snapshot does not yet prove that the WebGL model, sculpted model, OpenSCAD output, exported STL, validation input, and production file all derive from one canonical ParaCraft compile

### Required changes

- Extract and version ParaCraft as the sole OpenSCAD compiler and physical-rule framework
- Make the WebGL viewport consume ParaCraft's compiled output rather than recreate production geometry independently
- Make OpenSCAD, browser render, STL, mass properties, validation, and release hashes derive from one build result
- Define deterministic handling for any sculpting operation or remove it from the production path
- Remove manufacturing submission from the geometry UI

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
