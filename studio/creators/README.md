# studio: creators

creator identity, project ownership, presets, and saved creative assets. buyers and commissioners never receive direct studio or design-agent access.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura/src/pages/studio/BuildPage.jsx`
- `sculptura/src/components/studio/StudioNav.jsx`
- `sculptura/src/lib/studioStore.js`
- `sculptura/src/pages/PublishArtifact.jsx`

### what exists now

- A creator can move through a broad guided builder, inspect a Three.js preview, and persist one active design in browser local storage.
- The current publish page crosses into listing creation and does not create a design release.

### required changes

- Replace the browser-only active design with authenticated creator projects and explicit drafts.
- Keep publishing out of the Studio. The Studio should issue a release that the Platform may list.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
