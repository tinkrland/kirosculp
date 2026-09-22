# studio: virtual studio

a deterministic 3d scene with a parameterized hand, jewelry attachment points, camera, lighting, and environment. product renders come from saved scene state, not image generation.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura/src/pages/studio/BuildPage.jsx`
- `TemplatesPage.jsx`
- `StylesPage.jsx`
- `PresetsPage.jsx`
- `MaterialsPage.jsx`
- `PrintPage.jsx`
- `CodePage.jsx`
- `sculptura/src/pages/CanvasDesigner.jsx`

### what exists now

- The routed studio surface and much of the intended interaction language exist. Several pages are alternative or earlier paths rather than one coherent project lifecycle.

### required changes

- Consolidate the routes around one project model and ParaCraft build.
- Keep educational previews distinct from production validation.
- Connect every page to revision and release state rather than copied local state.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
