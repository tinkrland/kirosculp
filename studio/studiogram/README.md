# studiogram

photograph jewelry before it has been made. studiogram is sculptura's planned virtual product studio, built around the same compiled 3d artifact that would be sent for manufacturing.

recovered from sculptura.dev, where the concept was explained across the studiogram overview page and five linked guides (`src/pages/Studiogram.jsx`, `src/features/studiogram/studiogramContent.js`, `.lovable/plan/studiogram-content-pages-2026-09-12.md`). that build was explicitly explanatory: content pages labeled upcoming, no studio engine, no data model. the folder structure below mirrors those guides.

## principles

- the photographed artifact is the same modeled object prepared for manufacturing
- the hand, jewelry, camera, light, and environment remain separate parts of the scene
- saved scene choices make every captured view reproducible
- studiogram renders a configured 3d scene rather than imagining a product image

studiogram is a deterministic 3d scene system, not image generation. every photograph is the rendered result of explicit geometry and saved scene state.

## the journey

1. **prepare the subject.** choose a saved hand or shape a new one, then add one or more compiled artifacts. every piece attaches to a named location and stays an independent object in the scene.
2. **direct the scene.** pose the hand, orbit a real camera, shape light and backdrop. each control changes one part of the scene while preserving every other choice.
3. **capture the set.** save a frame, adjust the scene, save another. the image set can be reviewed, ordered, and exported as png files for a product carousel.

## guides

- [why/](why/README.md): why studiogram exists, closing the photography gap between a finished digital design and the first physical casting
- [how-it-works/](how-it-works/README.md): the complete flow from compiled jewelry design to an ordered set of product images through one reproducible scene
- [hand/](hand/README.md): choose and shape a hand, one configurable base model with independent build, proportion, and surface controls
- [jewelry/](jewelry/README.md): add and arrange jewelry, placing the real compiled artifact at named attachment locations without flattening it into an image
- [scene-system/](scene-system/README.md): the scene machinery: parameterized hand, attachment points, camera, lighting, environment, and saved scene state
- [capture/](capture/README.md): capture several views from the same scene, review their order, and export a clean image set for a product carousel
- [behind-the-scenes/](behind-the-scenes/README.md): how one saved scene keeps the real artifact, hand rig, camera, lighting, and output connected

similar and reference services are listed in [references.md](references.md).

## relation to the studio leg

studiogram is the virtual product studio itself: the scene system lives in [scene-system/](scene-system/README.md) and the capture flow wraps it. it sits in the studio domain because it consumes the design release and never becomes a source of geometry. the marketing-facing re-explanation lives in [marketing/](../../marketing/README.md).

## status

**planned, not built.** recovered as product explanation from sculptura.dev. no engine, scene state model, or backend work exists in this repository. build decisions wait for the studio leg to consolidate its project model and release flow first.
