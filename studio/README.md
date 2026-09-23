# Studio

Studio is for creators. It turns intent into deterministic, manufacturable metal geometry.

## Owns

- Creator projects, references, parameters, presets, and revisions
- Tessa's constrained intent-to-parameter relay
- ParaCraft, the deterministic compiler framework built on OpenSCAD
- Creator-facing in-browser WebGL rendering of the compiled model
- Physical design rules such as wall thickness, shrinkage, clearances, minimum features, and process limits
- Deterministic mesh and production-file compilation
- Castability validation and mass estimates
- Versioned design-release creation

## Does not own

- Listings or storefronts
- Retail pricing, platform fees, or payouts
- Orders, shipping, insurance, or refunds
- Manufacturer selection
- Stones, gemstone inventory, grading, sourcing, or setting fulfillment

## Flow

```mermaid
flowchart LR
  idea[intent + references] --> tessa[tessa: allowed parameter proposals]
  tessa --> approve[creator review]
  approve --> model[canonical project model]
  model --> paracraft[paracraft: openscad compiler]
  paracraft --> rules[physical design rules]
  rules --> webgl[creator WebGL preview]
  approve --> server[Studio server: approved revision]
  server --> compile[isolated headless ParaCraft + OpenSCAD]
  compile --> check[server-side mesh analysis + physical rules]
  check -->|pass + approval/hash match| release[immutable design release]
  check -->|fail| revise[save + revise]
  revise --> model
```

Tessa runs the middle leg of the relay. She translates human intent into constrained parameter proposals. ParaCraft takes the accepted parameters, compiles the OpenSCAD model, and enforces the physical boundaries. The WebGL layer renders an interactive preview in the browser. The Studio server independently compiles the same approved revision and is the only authority that may validate and issue a release.

Same parameters, compiler version, and rule-set version in must produce the same geometry out. Inference never generates geometry and never decides whether something is castable.

## Current implementation

See the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
