# Studio: virtual studio

A deterministic 3D scene with a parameterized hand, jewelry attachment points, camera, lighting, and environment. Product renders come from saved scene state, not image generation.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura/src/pages/studio/BuildPage.jsx`
- `TemplatesPage.jsx`
- `StylesPage.jsx`
- `PresetsPage.jsx`
- `MaterialsPage.jsx`
- `PrintPage.jsx`
- `CodePage.jsx`
- `sculptura/src/pages/CanvasDesigner.jsx`

### What exists now

- The routed studio surface and much of the intended interaction language exist. Several pages are alternative or earlier paths rather than one coherent project lifecycle.

### Required changes

- Consolidate the routes around one project model and ParaCraft build.
- Keep educational previews distinct from production validation.
- Connect every page to revision and release state rather than copied local state.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
