# source state tracker

this folder is the running distinction between source that exists, work that exists only partially, interface shells, code that belongs elsewhere, and parts that need to be rebuilt. it is not a list of completed features. it covers the two supplied source snapshots, `sculptura` (175 files) and `sculptura.dev` (224 files). the `repo` working copy matches the 175 non-generated `sculptura` files byte for byte, so the same analysis applies to it. the platform snapshot currently has a pre-existing modified `package-lock.json` compared with the earlier inventory; this tracker hashes its current bytes and does not edit that lockfile. no application source files were modified during this documentation pass.

[`source-files.tsv`](source-files.tsv) has **one row for every one of the 399 non-generated source files**. each row records its original path, byte count, sha256 except private files, role, triage state, content signals, and the next decision. the [rebuild script](../scripts/build-source-audit.py) opens each individual file, reads its contents, and regenerates the ledger. binary assets are read and hashed, not interpreted as code. environment files are recognized but their contents and hashes are withheld. this is a per-file triage inventory, not a claim that a regex can establish behavioral completeness. the domain reviews below supply the interpretation, and the [prior source audit](../docs/current-state-audit.md) provides build and test findings.

| state | meaning | count |
|---|---|---:|
| exists | source utility, component, schema/configuration, or asset exists; not proof of a finished feature | 153 |
| partial | meaningful logic or persistence exists, but major boundaries, security, or lifecycle work remains | 111 |
| shell | visual/static/demo surface exists without the complete operational behavior | 37 |
| move | useful source is on the wrong side of the studio/platform boundary | 59 |
| rebuild | unsafe or contract-incompatible path requiring replacement or substantial rewriting | 15 |
| reference | legacy documentation or planning material, not functioning software | 22 |
| restricted | credential-bearing file, deliberately not copied into this repository | 2 |

these labels describe the supplied snapshots, not a live deployment. they are preliminary per-file triage. a shared ui component classified `exists` does not make the end-to-end feature it displays exist. likewise, the absence of a source file cannot appear as a row: each missing capability is tracked in the domain pages.

## where things stand

- [studio](studio.md): viable browser design controls and geometry experiments, but no tessa, canonical paracraft compiler, server validation, or releases.
- [platform](platform.md): storefronts, listings, cart, checkout, and creator/account surfaces exist in mixed stages; trusted release-bound publishing and paid checkout do not.
- [finance, manufacturing, and operations](operations.md): pricing previews, order rows, partner records, and routing settings exist; actual payment, fulfillment, double-entry settlement, and route execution do not.
- [security](security.md): the client password and permissive policies are critical blockers, not tasks to postpone behind launch polish.
- [rebuild sequence](rebuild-order.md): ordered work with testable acceptance conditions.

## maintenance rule

on every source change, regenerate the per-file ledger, compare hashes, update affected domain claims, and identify what was actually verified. never mark a status `exists` merely because a draft document or ui says a feature will be built. the original code snapshots may not be available inside a standalone checkout of this foundation; the script requires their paths or `--sources` with the two directories. never publish `.env` values, credentials, or private data in this tracker.
