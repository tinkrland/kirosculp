# studio: paracraft geometry

ParaCraft is the deterministic compiler framework. it uses OpenSCAD under the hood to convert the canonical project parameters into rigid mathematical geometry and applies the physical rules required for manufacturable metal jewelry.

## compiler responsibilities

- accept only schema-valid, bounded project parameters
- generate readable, versioned OpenSCAD
- compile a watertight model and production mesh
- enforce wall thickness, shrinkage allowances, clearances, minimum features, and process constraints
- produce stable geometry and file hashes from stable inputs
- expose the compiled model to the creator-facing WebGL renderer
- provide the exact geometry used by validation, mass estimation, release creation, and production

WebGL is the interactive browser rendering layer. it displays the compiled OpenSCAD result. it must not become a second independent geometry implementation.

## audited implementation reference

**status: partial, with an important convergence gap**

### existing source evidence

- `sculptura/src/components/canvas/JewelryViewport.jsx`
- `sculptura/src/components/canvas/RingViewport.jsx`
- `sculptura/src/components/canvas/CodePanel.jsx`
- `sculptura/src/lib/jewelryDefaults.js`
- `sculptura/src/lib/jewelryTemplates.js`
- `sculptura/src/lib/multiPieceJewelry.js`
- `sculptura/src/lib/svgToShape.js`
- `sculptura/src/lib/stlExport.js`

### what exists now

- a WebGL/Three.js browser viewport renders interactive jewelry models for several jewelry types
- the source includes procedural preview geometry, multi-piece behavior, and client-side clay deformation
- OpenSCAD generation exists mainly for the ring path, and STL export serializes scene geometry
- the audited snapshot does not yet prove that the WebGL model, sculpted model, OpenSCAD output, exported STL, validation input, and production file all derive from one canonical ParaCraft compile

### required changes

- extract and version ParaCraft as the sole OpenSCAD compiler and physical-rule framework
- make the WebGL viewport consume ParaCraft's compiled output rather than recreate production geometry independently
- make OpenSCAD, browser render, STL, mass properties, validation, and release hashes derive from one build result
- define deterministic handling for any sculpting operation or remove it from the production path
- remove manufacturing submission from the geometry UI

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
