# Studio: validation

Castability checks use sourced, versioned manufacturing rules. Failed designs remain saveable but cannot produce a publishable release.

The [Server-side release gate](server-release-gate.md) proposes an isolated headless OpenSCAD worker, mesh-derived physical measurements, separate wall/process checks, and a conditional release write. The browser WebGL render is a preview, never authority to publish.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- `sculptura/src/components/canvas/PrintPanel.jsx` shows print specifications and warnings.
- `sculptura/src/pages/studio/MaterialsPage.jsx` and `sculptura/src/lib/sculpteoMaterials.js` expose material information.

### What exists now

- The sources contain UI guidance, not a trusted geometry-analysis and manufacturability service. No validation report gates publishing.

### Required changes

- Implement topology, wall, feature, cavity, envelope, tolerance, volume, mass, and material/process checks.
- Version every rule and evidence source.
- Return structured failures and warnings tied to exact geometry hashes.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
