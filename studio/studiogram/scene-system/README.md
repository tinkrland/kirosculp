# scene-system

the scene machinery behind studiogram: a deterministic 3d scene with a parameterized hand, jewelry attachment points, camera, lighting, and environment. product renders come from saved scene state, not image generation.

this folder absorbs what was previously tracked separately as the virtual studio: studiogram is the virtual studio, and the scene system is its engine room. the creator-facing guide for directing the scene is step 03 of the recovered studiogram guide, included below.

## pose the hand

pose controls move the hand's rig. attached jewelry follows its assigned location automatically, allowing relaxed, spread, and gesture-based compositions without rebuilding the scene.

- reusable pose states
- attached pieces move with the hand
- no repainting between poses

## frame with a real camera

the camera can orbit an already composed scene. its position, angle, and framing change the view, not the jewelry or hand underneath it.

- full orbit control
- adjustable position and angle
- repeatable framing

## shape light and environment

lighting and backdrop are independent from the camera. presets provide a starting point, while the same values remain available for manual adjustment when a creator needs a more specific look.

- adjustable lighting
- backdrop presets
- manual control over preset values

## the asset boundary

scene machinery holds only scene assets. releases enter a scene by reference, and nothing flows back into a release: see [scene assets vs release assets](scene-assets-vs-release-assets.md).

## system shape

- one parameterized hand with shape controls for morphology and material controls for surface appearance
- named attachment spaces so jewelry follows fingers, wrists, and other supported locations when the pose changes
- pose, camera, lighting, environment, and object transforms saved as scene state: the same values reconstruct the same view for later edits, exports, and visual checks

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura/src/pages/studio/BuildPage.jsx`](../../../what-exists/base44/src/pages/studio/BuildPage.jsx)
- [`TemplatesPage.jsx`](../../../what-exists/base44/src/pages/studio/TemplatesPage.jsx)
- [`StylesPage.jsx`](../../../what-exists/base44/src/pages/studio/StylesPage.jsx)
- [`PresetsPage.jsx`](../../../what-exists/base44/src/pages/studio/PresetsPage.jsx)
- [`MaterialsPage.jsx`](../../../what-exists/base44/src/pages/studio/MaterialsPage.jsx)
- [`PrintPage.jsx`](../../../what-exists/base44/src/pages/studio/PrintPage.jsx)
- [`CodePage.jsx`](../../../what-exists/base44/src/pages/studio/CodePage.jsx)
- [`sculptura/src/pages/CanvasDesigner.jsx`](../../../what-exists/base44/src/pages/CanvasDesigner.jsx)

### what exists now

- the routed studio surface and much of the intended interaction language exist. several pages are alternative or earlier paths rather than one coherent project lifecycle.

### required changes

- consolidate the routes around one project model and paracraft build.
- keep educational previews distinct from production validation.
- connect every page to revision and release state rather than copied local state.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order. back to the [studiogram guide](../README.md).
