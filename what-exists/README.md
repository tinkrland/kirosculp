# what-exists

the two supplied source snapshots, brought in whole, so every citation in [audit/](../audit/index.md) and the domain readmes links to a real file in this repository instead of pointing at something elsewhere.

## subfolders

- [base44/](base44/_about.md): the `sculptura` snapshot, the base44-built platform attempt (175 non-generated files)
- [lovable/](lovable/_about.md): the `sculptura.dev` snapshot, the lovable-built public site and platform attempt (224 non-generated files)

## what this is, and is not

- this is a **frozen evidence snapshot**, not a live or maintained codebase. nothing here runs, builds, or gets patched in place.
- node_modules, dist, and .git history were stripped on import; source files, configuration, and documentation were kept byte for byte.
- these files keep their original case and formatting. the lowercase prose rule that governs the rest of this repository does not apply inside `what-exists/`: it would misrepresent what the source actually said. `scripts/normalize-prose.py` excludes this folder for that reason.
- do not edit files under `what-exists/`. if a citation needs correcting, correct the citing document; re-import only if the upstream source itself changes.

## how citations use this folder

domain readmes cite specific files under `### existing source evidence`. where a citation names a file that exists in one of these snapshots, it is now a working link, for example `[`sculptura/src/pages/studio/BuildPage.jsx`](base44/src/pages/studio/BuildPage.jsx)`. the [full per-file inventory with hashes and status](../audit/source-files.tsv) remains the authoritative source-of-truth ledger; this folder is what makes its entries browsable.
