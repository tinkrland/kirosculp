# studio: geometry

deterministic readable openscad generation and mesh compilation. same parameter set plus engine version must produce the same output and cache key.

## audited implementation reference

**status: partial**

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

- Three.js procedural preview geometry exists for several jewelry types, including multi-piece behavior and client-side clay deformation.
- OpenSCAD export exists mainly for the ring path. STL export serializes scene geometry.
- Preview geometry, sculpted geometry, OpenSCAD, and exported STL are not yet one canonical ParaCraft build.

### required changes

- Extract ParaCraft as the sole deterministic geometry compiler.
- Version its inputs and outputs.
- Make viewport meshes, OpenSCAD, STL, mass properties, and validation derive from one build result.
- Remove manufacturing submission from the geometry UI.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
