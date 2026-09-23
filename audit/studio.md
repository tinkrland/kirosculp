# studio source state

## exists or exists partially

- `sculptura/src/pages/studio/BuildPage.jsx`, the `src/components/canvas/` files, and `src/lib/jewelryDefaults.js`, `jewelryTemplates.js`, `multiPieceJewelry.js`, `svgToShape.js`, `studioStore.js`, and `stlExport.js` are the strongest starting material. they provide controlled shape choices, browser previews and manipulation, template and material views, local project state, and exports.
- `src/components/canvas/CodePanel.jsx` exposes openscad output for the ring path. `JewelryViewport.jsx` provides three.js scene geometry, including editing behavior not yet proven equivalent to the exported openscad or stl.
- individual studio pages and shared ui components can be retained as interface parts. their presence does not prove server validation.

## partial or needs rebuilding

- project state currently resides in an unversioned browser object, not a canonical typed state with revision history, ownership, and migrations. the proposed pydantic/protocol buffers, dvc lineage, bounded agent tools, and redis cache are plans, not source found in these snapshots.
- there is no tessa implementation or typed proposal/creator-approval protocol. there is no unified paracraft compiler shared by every supported product type.
- no authoritative server-side headless openscad build, production mesh analysis, wall/cavity and process validation, validation report, or immutable design release is found. browser webgl is preview-only in the target architecture.
- `PrintPanel.jsx` sends exported output toward a factory from the creative surface. that shortcut must be removed and replaced with a release-backed platform/manufacturing order path.
- standalone viewport sculpting and stl export require convergence with deterministic parameters. if the server cannot reproduce a shape, the preview cannot authorize a release.

## code on the wrong side

`sculptura` also has checkout, publishing, storefronts, creator market settings, cart, artifact display, order modal, and admin review. the ledger marks these files `move`. copy or refactor only behavior that remains useful, then remove active commerce dependencies from the final studio. do not assume the duplicated `sculptura.dev` version is identical: common relative paths can differ.

## acceptance condition

one accepted creator revision produces a reproducible server build, complete versioned manufacturing validation, and a hashed immutable design release; failing or stale results cannot reach platform listing or manufacture. webgl renders a preview of that model without becoming a second geometry authority.
