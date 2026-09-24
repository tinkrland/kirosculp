# studio: validation

castability checks use sourced, versioned manufacturing rules. failed designs remain saveable but cannot produce a publishable release.

the [server-side release gate](server-release-gate.md) proposes an isolated headless openscad worker, mesh-derived physical measurements, separate wall/process checks, and a conditional release write. the browser webgl render is a preview, never authority to publish.

## audited implementation reference

**status: missing**

### existing source evidence

- [`sculptura/src/components/canvas/PrintPanel.jsx`](../../what-exists/base44/src/components/canvas/PrintPanel.jsx) shows print specifications and warnings.
- [`sculptura/src/pages/studio/MaterialsPage.jsx`](../../what-exists/base44/src/pages/studio/MaterialsPage.jsx) and [`sculptura/src/lib/sculpteoMaterials.js`](../../what-exists/base44/src/lib/sculpteoMaterials.js) expose material information.

### what exists now

- the sources contain ui guidance, not a trusted geometry-analysis and manufacturability service. no validation report gates publishing.

### required changes

- implement topology, wall, feature, cavity, envelope, tolerance, volume, mass, and material/process checks.
- version every rule and evidence source.
- return structured failures and warnings tied to exact geometry hashes.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
