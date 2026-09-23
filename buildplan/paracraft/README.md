# paracraft leg

paracraft is the deterministic compiler framework built on openscad. it turns an accepted parameter state into rigid geometry and owns the physical safety lines: wall thickness, minimum features, shrinkage allowances, clearances, and process limits. this leg produces two things downstream legs depend on: reproducible builds, and versioned per-material rule sets that the [studio release gate](../studio/README.md) applies to the exact exported mesh.

## why this leg is hard

there is no robust, readymade dataset of "jewelry geometry that is castable in metal x under process y". the evidence is scattered across resin and wax manufacturers, casting bureaus, alloy suppliers, and foundry practice, and the numbers genuinely differ per metal and per pattern material: a wall that casts fine in a formlabs castable wax pattern may fail in a standard resin pattern, and silver, gold, and bronze each carry different shrinkage and tolerance behavior. so this leg is comparative research, not lookup.

the convergence strategy, in order:

1. **fetch from all sides** using [resources.md](resources.md): published design rules from sculpteo, formlabs, alloy references, and openscad model collections.
2. **acquire what is not published** using [acquire.md](acquire.md): custom questions to partners and suppliers whose real per-alloy limits never appear online.
3. **consolidate** into versioned rule sets, one per (alloy, pattern process) pair, each value carrying its source and date.
4. **benchmark** using [benchmarks.md](benchmarks.md): a deterministic harness that compiles a fixed set of parametric test pieces and checks them against each rule set, so a rule change is measurable, not vibes.

## steps

1. settle the parameter envelope per jewelry family with [offerings/](../../offerings/README.md): the allowed controls paracraft must compile, per family.
2. consolidate openscad sources: one trusted template per family, generated from validated parameters only, no browser-supplied openscad.
3. pin tooling: a specific openscad version, container image, and mesh-analysis library, recorded in the build provenance.
4. land the first rule set (one alloy, one pattern process) with dated sources, even if narrow.
5. grow coverage metal by metal, benchmarking at each addition, never copying a number without a source.

## boundaries

paracraft does not quote prices, choose partners, or decide route eligibility: those belong to [operations](../../operations/README.md) and [manufacturing](../../manufacturing/README.md). tessa hands paracraft constrained parameters; paracraft never receives freeform intent. a rule value without a dated source is `drafted`, never active.
