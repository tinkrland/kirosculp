# studio: paracraft geometry

paracraft is the deterministic compiler framework. it uses openscad under the hood to convert the canonical project parameters into rigid mathematical geometry and applies the physical rules required for manufacturable metal jewelry.

## compiler responsibilities

- accept only schema-valid, bounded project parameters
- generate readable, versioned openscad
- compile a watertight model and production mesh
- enforce wall thickness, shrinkage allowances, clearances, minimum features, and process constraints
- produce stable geometry and file hashes from stable inputs
- expose the compiled model to the creator-facing webgl renderer
- provide the exact geometry used by validation, mass estimation, release creation, and production

webgl is the interactive browser rendering layer. it displays the compiled openscad result. it must not become a second independent geometry implementation.

## audited implementation reference

**status: partial, with an important convergence gap**

### existing source evidence

- [`sculptura/src/components/canvas/JewelryViewport.jsx`](../../what-exists/base44/src/components/canvas/JewelryViewport.jsx)
- [`sculptura/src/components/canvas/RingViewport.jsx`](../../what-exists/base44/src/components/canvas/RingViewport.jsx)
- [`sculptura/src/components/canvas/CodePanel.jsx`](../../what-exists/base44/src/components/canvas/CodePanel.jsx)
- [`sculptura/src/lib/jewelryDefaults.js`](../../what-exists/base44/src/lib/jewelryDefaults.js)
- [`sculptura/src/lib/jewelryTemplates.js`](../../what-exists/base44/src/lib/jewelryTemplates.js)
- [`sculptura/src/lib/multiPieceJewelry.js`](../../what-exists/base44/src/lib/multiPieceJewelry.js)
- [`sculptura/src/lib/svgToShape.js`](../../what-exists/base44/src/lib/svgToShape.js)
- [`sculptura/src/lib/stlExport.js`](../../what-exists/base44/src/lib/stlExport.js)

### what exists now

- a WebGL/Three.js browser viewport renders interactive jewelry models for several jewelry types
- the source includes procedural preview geometry, multi-piece behavior, and client-side clay deformation
- openscad generation exists mainly for the ring path, and stl export serializes scene geometry
- the audited snapshot does not yet prove that the webgl model, sculpted model, openscad output, exported stl, validation input, and production file all derive from one canonical paracraft compile

### required changes

- extract and version paracraft as the sole openscad compiler and physical-rule framework
- make the webgl viewport consume paracraft's compiled output rather than recreate production geometry independently
- make openscad, browser render, stl, mass properties, validation, and release hashes derive from one build result
- define deterministic handling for any sculpting operation or remove it from the production path
- remove manufacturing submission from the geometry ui

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
