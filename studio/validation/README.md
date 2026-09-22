# studio: validation

castability checks use sourced, versioned manufacturing rules. failed designs remain saveable but cannot produce a publishable release.

## audited implementation reference

**status: missing**

### existing source evidence

- `sculptura/src/components/canvas/PrintPanel.jsx` shows print specifications and warnings.
- `sculptura/src/pages/studio/MaterialsPage.jsx` and `sculptura/src/lib/sculpteoMaterials.js` expose material information.

### what exists now

- The sources contain UI guidance, not a trusted geometry-analysis and manufacturability service. No validation report gates publishing.

### required changes

- Implement topology, wall, feature, cavity, envelope, tolerance, volume, mass, and material/process checks.
- Version every rule and evidence source.
- Return structured failures and warnings tied to exact geometry hashes.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
