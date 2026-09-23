# studio

studio is for creators. it turns intent into deterministic, manufacturable metal geometry.

## owns

- creator projects, references, parameters, presets, and revisions
- tessa's constrained intent-to-parameter relay
- paracraft, the deterministic compiler framework built on openscad
- creator-facing in-browser webgl rendering of the compiled model
- physical design rules such as wall thickness, shrinkage, clearances, minimum features, and process limits
- deterministic mesh and production-file compilation
- castability validation and mass estimates
- versioned design-release creation

## does not own

- listings or storefronts
- retail pricing, platform fees, or payouts
- orders, shipping, insurance, or refunds
- manufacturer selection
- stones, gemstone inventory, grading, sourcing, or setting fulfillment

## flow

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

tessa runs the middle leg of the relay. she translates human intent into constrained parameter proposals. paracraft takes the accepted parameters, compiles the openscad model, and enforces the physical boundaries. the webgl layer renders an interactive preview in the browser. the studio server independently compiles the same approved revision and is the only authority that may validate and issue a release.

same parameters, compiler version, and rule-set version in must produce the same geometry out. inference never generates geometry and never decides whether something is castable.

## current implementation

see the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
