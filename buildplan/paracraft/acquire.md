# paracraft acquisitions: what must be asked for directly

the robust dataset we need (per-alloy, per-process castability limits for jewelry geometry) does not exist readymade online. vendors publish marketing numbers and partial design rules; the numbers that actually govern a casting run live inside casting houses and alloy suppliers. so this leg has to acquire them the slow way: identify who holds each fact, ask a precise question, record the answer with a name, date, and written source, and treat silence as a blocker rather than filling the gap with a guess.

## who to ask

- **casting bureaus** (sculpteo, shapeways, and jewelry-specific casting houses like cooksongold or stuller): their real per-alloy rules, and whether they do castable-resin or castable-wax pattern casting in precious metal at all. the earlier [manufacturer research](../../manufacturing/tasks/materials-and-manufacturers-first-steps.md) already flagged that the prototype's sculpteo assumptions are unsourced and that self-serve ordering needs a written answer, not an assumption.
- **regional casting partners** (the smaller shops sculptura eventually routes to): they are the ones whose actual process limits become paracraft's rules. they are also the least likely to publish anything.
- **gildform** (casting-on-demand service): their model requirements page rate-limited our scrape twice, so their rules move here as questions rather than harvested citations.
- **morris and watson and cooksongold**, despite publishing partial guidelines (see the [rule digest](rule-digest.md)): their pages confirm the shape of the answers but leave the decisive numbers unpublished: shrinkage factor applied, dimensional tolerance, sprue dimensions, per-alloy section minimums, and burnout setpoints.
- **resin and wax manufacturers** (formlabs and competitors): which geometry limits are properties of the pattern material versus the alloy, and their recommended investment and burnout schedules per material.
- **alloy suppliers**: certified composition, density, casting temperature range, and shrinkage behavior per alloy grade.
- **cad/cam jewelry services**: what tolerance they actually hold on ring sizes and repeat orders, since tolerance claims drive sizing rules.

## the custom questions

[the partner-facing phrasing for these questions, including the paste-ready intro, lives in [partner-brief.md](partner-brief.md). use it per partner rather than sending this internal list.]

questions are grouped so one email covers one partner, and each is written to extract a number or an explicit "we do not support that", not a brochure.

### for casting partners

1. do you accept externally printed castable resin or wax patterns, or only your own printing? which pattern materials?
2. per alloy you cast: minimum wall thickness, minimum wire/prong thickness, minimum hole diameter, minimum engraved detail depth and width.
3. per alloy: shrinkage compensation you apply or expect the model to apply, and tolerance on final dimensions.
4. maximum and minimum piece weight and bounding volume you accept per alloy.
5. sprue requirements: who places sprues, placement rules, minimum sprue diameter relative to section thickness.
6. hollow piece rules: required drain holes, minimum hole count and diameter, your shelling policy.
7. burnout and investment schedule per pattern material, and which pattern materials are incompatible.
8. what finishes do you offer per alloy, and how does each finish affect minimum detail survival?
9. defect and remake policy: what happens when a piece fails casting through a geometry problem?
10. do you support self-serve api ordering, or is submission manual?

### for pattern material manufacturers

1. per material: minimum feature survival at 25 and 50 micron layers.
2. post-cure dimensional change, and recommended post-cure for casting.
3. incompatible investments or burnout profiles.
4. documented hollow part limits: shell thickness, drain hole size.

### for alloy suppliers

1. certified density and composition per grade, with the standard referenced.
2. casting temperature range and recommended investment type.
3. published solidification shrinkage per alloy, if measured.

## evidence handling

every answer is stored as a dated, attributed record (who answered, in what writing, for which alloy and process) in the manufacturing research area, then consolidated into the versioned rule set here. an answer that contradicts a published vendor page wins, and the contradiction is recorded. answers over a year old are re-asked before their values stay active. a rule value with no acquired or published source stays `drafted` and never gates a real release on its own.

## on dataset generation partners

the convergence problem (openscad model documentation on one side, castable jewelry models on the other, no unified corpus) could tempt us toward synthetic dataset generation services. assessed [adaptionlabs.ai](https://adaptionlabs.ai/): it is an adaptive ai and adaptive-data startup (continual learning models, a product called "invent a dataset" that generates training datasets from intent). it is not a manufacturing or casting-measurement lab, and paracraft is a deterministic compiler that does not train on data, so its role here would be limited at best, maybe generating evaluation variety for tessa's intent datasets later. the benchmark itself belongs in our own harness: [benchmarks.md](benchmarks.md).
