# behind the scenes

the closing page of the recovered studiogram guide. see how one saved scene keeps the real artifact, hand rig, camera, lighting, and output connected.

studiogram is a deterministic 3d scene system, not image generation. every photograph is the rendered result of explicit geometry and saved scene choices.

## one artifact flows through

the studio consumes the same compiled mesh used by the artifact viewer. attachment information belongs to the canonical design record, so photography never becomes a separate copy of the jewelry.

- one canonical design
- shared compiled mesh
- upstream attachment data

## the hand is a rigged system

one base hand uses shape controls for morphology and material controls for surface appearance. named attachment spaces allow jewelry to follow fingers, wrists, and other supported locations when the pose changes.

- one parameterized hand
- separate surface controls
- rig-aware attachments

## a scene is reproducible

pose, camera, lighting, environment, and object transforms are saved as scene state. the same values can reconstruct the same view for later edits, exports, and visual checks.

- saved scene values
- repeatable rendering
- consistent product views

back to the [studiogram guide](../README.md).
