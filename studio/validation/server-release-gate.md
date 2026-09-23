# server-side paracraft validation and release gate

the local webgl renderer is an interactive preview, not a certificate of manufacturability. only the studio backend may issue an immutable design release, after recomputing and validating the accepted project revision on the server. this is a proposed implementation, not an existing deployed worker.

## candidate worker flow

1. receive an authenticated creator request for a specific immutable project revision and intended material/size variants. the server loads it from supabase and checks ownership, schema version, strict bounds, and the allowed paracraft ruleset. do not accept raw openscad code from the browser or tessa.
2. queue an idempotent build keyed by canonical state hash, paracraft version, openscad version, ruleset version, and relevant variant inputs. the api returns a pending job; it does not hold checkout open while rendering.
3. run a pinned headless openscad build in an isolated container or worker. generate source from trusted templates and validated parameters. limit cpu, memory, runtime, process count, filesystem access, and network access; use a non-root user, read-only runtime where possible, ephemeral scratch files, and no payment credentials. docker packaging alone is not a security boundary for arbitrary untrusted code.
4. export the production mesh, capture exit status and warnings, and hash the exact source and mesh. parse the exported mesh with a vetted mesh-analysis library to compute signed volume, physical bounding box, watertightness, components, and mass estimates using versioned alloy densities. do not claim that openscad itself emits a trustworthy volume/bounds json report through a generic cli flag. confirm geometric units and reject invalid/empty/non-manifold meshes.
5. apply separately versioned manufacturing rules to the **same exact geometry**: topology, walls and minimum features, cavities, clearances, shrinkage and size tolerances, partner process/build envelope, and alloy eligibility. volume and bounding dimensions alone do **not** establish structural integrity or castability. where a check cannot be made reliably, return an explicit failure or manual-review result, not `passed=true`.
6. store a signed/provenanced validation report with source/mesh hashes, rule sources and versions, build logs, computed properties, timestamps, status, and per-variant results. keep private source/mesh assets in durable immutable storage, not container-local files.
7. in one conditional server-side transition, confirm that the creator-approved revision and hashes still match the report, all offered variants passed, and report/engine/rules are current enough under policy; then issue the immutable release. a concurrent project edit remains a separate revision. failed jobs never produce a release, listing, quote, or production order.
8. the platform consumes a verified release id and asset hash. it may price and list it but may neither invoke the studio compiler to bypass validation nor rewrite geometry. purchases and production orders bind to that exact release version.

## hosting decision

start with render for the api and a **separate docker-based background worker** for headless openscad. this is a proposed deployment; verify container resource ceilings, queue durability, disk/asset storage, runtime isolation, and costs under realistic worst-case designs before launch. supabase remains the application backend; render runs services, not a replacement database. redis may help queue/cache throughput, but durable job/result state is persisted to supabase.

vercel is only a possible later location for a frontend or thin api. its functions have execution-duration and bundle/runtime limits; a heavyweight headless geometry worker should remain on a suitable container/worker service unless a measured deployment proves otherwise. do not promise a full migration to vercel.

## proof tests

- reject an edited browser preview when it disagrees with the server build hash.
- reject a clean bounding box with thin walls or internal cavities that violate process rules.
- retry or time out compilation without issuing duplicate release versions.
- reject stale creator approval, stale rules, and malformed or adversarial parameter proposals.
- confirm fixed input and pinned binary produce stable artifact hashes, and document any non-deterministic exporter behavior.

references: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_OpenSCAD_in_a_command_line_environment, https://render.com/docs/background-workers, https://render.com/docs/docker, https://vercel.com/docs/functions/limitations.
