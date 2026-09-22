# studio: project model

one canonical parametric model per design. openscad, meshes, renders, manufacturing reports, and releases derive from it. a hand-edited mesh never replaces the source model.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura/src/lib/studioStore.js`
- `sculptura/src/lib/jewelryDefaults.js`
- `sculptura/src/pages/studio/BuildPage.jsx`

### what exists now

- The present project is a nested JavaScript object deep-merged with defaults and saved under one local-storage key.
- No schema version, migrations, ownership, revision history, or server persistence exists.

### required changes

- Define a canonical versioned project schema for all supported jewelry types.
- Add validated migrations, immutable revisions, autosave, ownership, and recovery.
- Separate creative intent from generated build artifacts and release records.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
