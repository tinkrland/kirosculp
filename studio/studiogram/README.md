# studiogram

photograph jewelry before it has been made. studiogram is sculptura's planned virtual product studio, built around the same compiled 3d artifact that would be sent for manufacturing.

recovered from sculptura.dev, where the concept was explained across the studiogram overview page, five guide pages, and the site footer (`src/pages/Studiogram.jsx`, `src/features/studiogram/`, `.lovable/plan/studiogram-content-pages-2026-09-12.md`). that build was explicitly explanatory: content pages labeled upcoming, no studio engine, no data model.

## principles

- the photographed artifact is the same modeled object prepared for manufacturing
- the hand, jewelry, camera, light, and environment remain separate parts of the scene
- saved scene choices make every captured view reproducible
- studiogram renders a configured 3d scene rather than imagining a product image

studiogram is a deterministic 3d scene system, not image generation. every photograph is the rendered result of explicit geometry and saved scene state.

## why it exists

made-to-order jewelry is ready to validate and list before a physical sample exists. traditional product photography comes after manufacturing, which makes every new listing depend on an upfront sample, a model, a camera, and a physical shoot. studiogram removes that dependency: the design already has defined geometry, dimensions, materials, and manufacturing constraints, so the exact object can be presented without arranging a casting first.

the artifact is never redrawn for the photograph. the studio consumes the same compiled mesh used by the viewer, and attachment information travels with the canonical design record, so photography never becomes a second, drifting copy of the jewelry.

## the journey

1. **prepare the subject.** choose a saved hand or shape a new one, then add one or more compiled artifacts. every piece attaches to a named location and stays an independent object in the scene.
2. **direct the scene.** pose the hand, orbit a real camera, shape light and backdrop. each control changes one part of the scene while preserving every other choice.
3. **capture the set.** save a frame, adjust the scene, save another. the image set can be reviewed, ordered, and exported as png files for a product carousel.

## the parts of the scene

- **hand.** one parameterized base hand rather than a library of people. presentation and build are separate controls; finer controls shape width, finger length, thickness, and palm proportions. surface details stay separate: skin tone, body hair, and nail appearance affect the surface rather than replacing the hand; tattoos are placed on the skin and move naturally with poses. complete shape and surface choices save together as a reusable hand configuration.
- **jewelry.** the real compiled artifact enters the scene, placed at a named location such as a finger, wrist, or earlobe. attached jewelry follows the hand's pose rather than staying frozen in space. several pieces can share a scene, stacks can be reordered, and pieces from more than one creator can be combined while each artifact remains its own object.
- **scene.** pose controls move the hand's rig; the camera orbits an already composed scene; lighting and backdrop are independent from the camera, with presets as starting points and the same values available for manual adjustment.
- **capture.** each capture records the current hand, jewelry, pose, camera, lighting, and backdrop. a typical session produces three or four complementary shots: different angles, closer details, a new pose, with the product consistent throughout. export is a png image set with carousel-ready ordering; attribution, captions, and posting remain with the creator.

## relation to the studio leg

studiogram is the photography face of the [virtual studio](../virtual-studio/README.md): the virtual studio is the deterministic 3d scene system (parameterized hand, attachment points, camera, lighting, environment), and studiogram is the creator-facing capture flow built on top of it. it sits in the studio domain because it consumes the design release and never becomes a source of geometry.

similar and reference services are listed in [references.md](references.md).

## status

**planned, not built.** recovered as product explanation from sculptura.dev. no engine, scene state model, or backend work exists in this repository. build decisions wait for the studio leg to consolidate its project model and release flow first.
