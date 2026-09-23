# studio flows

[`release.md`](release.md) describes the target transition from editable creator project to immutable design release.

## audited source state

`sculptura/src/pages/studio/BuildPage.jsx`, `sculptura/src/lib/studioStore.js`, and the studio route pages provide an editable browser workflow. `sculptura/src/pages/PublishArtifact.jsx` skips the release boundary and creates an artifact or listing record instead.

implement project revision, paracraft build, validation, creator approval, and release issuance as explicit states. a release failure must leave the editable project intact and must not create a listing.
