# Server-Side ParaCraft Validation and Release Gate

The local WebGL renderer is an interactive preview, not a certificate of manufacturability. Only the Studio backend may issue an immutable design release, after recomputing and validating the accepted project revision on the server. This is a proposed implementation, not an existing deployed worker.

## Candidate Worker Flow

1. Receive an authenticated creator request for a specific immutable project revision and intended material/size variants. The server loads it from Supabase and checks ownership, schema version, strict bounds, and the allowed ParaCraft ruleset. Do not accept raw OpenSCAD code from the browser or Tessa.
2. Queue an idempotent build keyed by canonical state hash, ParaCraft version, OpenSCAD version, ruleset version, and relevant variant inputs. The API returns a pending job; it does not hold checkout open while rendering.
3. Run a pinned headless OpenSCAD build in an isolated container or worker. Generate source from trusted templates and validated parameters. Limit CPU, memory, runtime, process count, filesystem access, and network access; use a non-root user, read-only runtime where possible, ephemeral scratch files, and no payment credentials. Docker packaging alone is not a security boundary for arbitrary untrusted code.
4. Export the production mesh, capture exit status and warnings, and hash the exact source and mesh. Parse the exported mesh with a vetted mesh-analysis library to compute signed volume, physical bounding box, watertightness, components, and mass estimates using versioned alloy densities. Do not claim that OpenSCAD itself emits a trustworthy volume/bounds JSON report through a generic CLI flag. Confirm geometric units and reject invalid/empty/non-manifold meshes.
5. Apply separately versioned manufacturing rules to the **same exact geometry**: topology, walls and minimum features, cavities, clearances, shrinkage and size tolerances, partner process/build envelope, and alloy eligibility. Volume and bounding dimensions alone do **not** establish structural integrity or castability. Where a check cannot be made reliably, return an explicit failure or manual-review result, not `passed=true`.
6. Store a signed/provenanced validation report with source/mesh hashes, rule sources and versions, build logs, computed properties, timestamps, status, and per-variant results. Keep private source/mesh assets in durable immutable storage, not container-local files.
7. In one conditional server-side transition, confirm that the creator-approved revision and hashes still match the report, all offered variants passed, and report/engine/rules are current enough under policy; then issue the immutable release. A concurrent project edit remains a separate revision. Failed jobs never produce a release, listing, quote, or production order.
8. The Platform consumes a verified release ID and asset hash. It may price and list it but may neither invoke the Studio compiler to bypass validation nor rewrite geometry. Purchases and production orders bind to that exact release version.

## Hosting Decision

Start with Render for the API and a **separate Docker-based background worker** for headless OpenSCAD. This is a proposed deployment; verify container resource ceilings, queue durability, disk/asset storage, runtime isolation, and costs under realistic worst-case designs before launch. Supabase remains the application backend; Render runs services, not a replacement database. Redis may help queue/cache throughput, but durable job/result state is persisted to Supabase.

Vercel is only a possible later location for a frontend or thin API. Its functions have execution-duration and bundle/runtime limits; a heavyweight headless geometry worker should remain on a suitable container/worker service unless a measured deployment proves otherwise. Do not promise a full migration to Vercel.

## Proof Tests

- Reject an edited browser preview when it disagrees with the server build hash.
- Reject a clean bounding box with thin walls or internal cavities that violate process rules.
- Retry or time out compilation without issuing duplicate release versions.
- Reject stale creator approval, stale rules, and malformed or adversarial parameter proposals.
- Confirm fixed input and pinned binary produce stable artifact hashes, and document any non-deterministic exporter behavior.

References: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_OpenSCAD_in_a_command_line_environment, https://render.com/docs/background-workers, https://render.com/docs/docker, https://vercel.com/docs/functions/limitations.
