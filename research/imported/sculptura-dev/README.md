# imported research: kqrla/sculptura.dev, research branch

these documents are a dated research cycle (2026-09-11) produced in the `research` branch of [kqrla/sculptura.dev](https://github.com/kqrla/sculptura.dev), the pre-consolidation workspace. they were reviewed on 2026-09-25 and ported here as source documents, not as corpus truth: their inline citations travel with them, and any value they contain must still become an evidence record in [../sources/](../sources/README.md) before it can enter a profile or a rule set.

## what was ported

- `casting/defect-modes.md`: investment casting defect physics (shrinkage porosity, gas defects, misruns, hot tearing, investment breakdown) with preventive design rules, 22 cited sources. the causal layer behind the constraint values.
- `casting/lost-wax-process.md`: the full lost-wax process walk with parameters, cited.
- `casting/sculptura-process-claims.md`: the customer-facing process promises of the old lovable app, verbatim from its source (quoted spans are wrapped in backticks so prose normalization preserves their exact case; the authoritative verbatim text remains the cited repo).
- `reference/sculptura-app-digest.md`: deep read of the old app as the product contract.
- `primitives/`: jewelry cad vocabulary, openscad patterns for jewelry primitives, adjacent cad techniques.
- `openscad/`: language reference digest, library decision, performance budget, and `stack/engine-landscape.md`, which covers the 2021 to 2026 shift from cgal to the manifold boolean backend and why browser wasm and server cli builds can differ: load-bearing for the release gate's determinism proof and the buildplan's tooling pin.

the two new manufacturer notes from the same cycle (apex jewelry casting, design build cast london) were ported to [../../manufacturing/research/candidates/](../../manufacturing/research/candidates/README.md) instead, since that is where partner candidates live.

## what was deliberately not ported

- the keeberia engine digests: excluded by the owner on 2026-09-25.
- `manufacturer-capabilities.json` and its schema: same seven partners as the validated [../../manufacturing/reference/manufacturer-capabilities.json](../../manufacturing/reference/manufacturer-capabilities.json), but with placeholder `source_ref: "0"` provenance; the reviewed, schema-validated version wins.
- the xano design-agent wiring: predates the supabase and render scoping decision; historical.
- node_modules and preview assets from the branch.
