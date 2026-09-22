# materials & manufacturers — what to check before going deep

status: working notes, compiled 2026-09-22, cross-referencing sculptura.dev/research.md,
keeberia (prior art), the base44 sculptura prototype (sculpteoMaterials.js, pricing.js),
and live verification of sculpteo + shapeways.

this exists because the base44 prototype already has manufacturer/materials code in it,
and some of it is wrong or contradicts itself in ways that will quietly cost real money
if they reach production unfixed. fix these before writing more engine code, not after —
the engine's job is to emit geometry that satisfies constraints this doc is supposed to
pin down first.

---

## tl;dr — do these six things before anything else

1. confirm sculpteo and shapeways actually do lost-wax precious-metal casting, not just general am
2. reconcile the two disagreeing pricing models already sitting in the base44 repo
3. re-verify every number in `sculpteoMaterials.js` against a real, dated api response
4. get a written answer on self-serve ordering, not an assumption, from both partners
5. get real casting tolerance / min-wall-thickness numbers per alloy, not one flat number reused everywhere
6. decide who picks the manufacturer — creator, buyer, or platform — before the schema locks in

everything below is the detail behind each of those six.

---

## 1. process fit: does either partner actually do what you need

this is the one question that gates everything else. sculpteo and shapeways are both
general **additive manufacturing bureaus** — plastics and metals via sla/sls/binder-jet,
mostly. what jewelry actually needs is a specific two-step process: **castable resin
print → lost-wax casting in silver/gold**. those are not the same capability, and a
company can be a real, functioning 3d printing service with zero path to a cast ring.

- `sculpteoMaterials.js` already assumes sculpteo does this ("cast via lost-wax") for
  silver/gold_14k/gold_18k. **that line is not sourced to anything** — it reads like an
  assumption baked in as fact. verify it before trusting a single downstream number.
- neither company's public marketing foregrounds jewelry casting the way a company like
  cooksongold or stuller does — that alone is a signal worth taking seriously, not proof
  of anything either way.
- action: this is what `find-manufacturers-brief.md` (already written) exists to answer.
  run it — specifically the "does this manufacturer actually do castable-resin-print-to-
  lost-wax-casting in precious metal" check in section 0 — against sculpteo and shapeways
  by name before assuming either passes.
- if both fail this check, the realistic fallback is a jewelry-specific casting house
  (cooksongold, stuller, rio grande) that likely has no self-serve api at all, which
  changes the integration model from "api adapter" to "generate a spec sheet a human at
  the platform sends by email" — a meaningfully different build, worth knowing now rather
  than after the adapter code is written.

---

## 2. the two pricing models already contradict each other — pick one

the base44 prototype has two independent, disagreeing ways of pricing the same ring:

- `src/lib/pricing.js`: a flat table keyed by `material × region`
  (e.g. silver/north_america = $48), explicitly commented `// mock values`. no size
  dependency at all — a size-4 band and a size-13 cuff cost the same.
- `src/lib/sculpteoMaterials.js`: `estimatePriceUSD()`, volume-based —
  `volumeMM3 * pricePerMm3`, with a $25 floor (or $3 for the prototype-plastic material).

these will give different quotes for the same piece, and neither is a real vendor quote —
both are local estimates. before building more on top of either:

- decide whether local price estimation is even the right model, vs. always round-tripping
  to the manufacturer's live quote endpoint (sculpteo's `price_by_uuid`, once uploaded) and
  treating any local number as a rough pre-upload estimate only, clearly labeled as such
  in the ui
- if you keep a local estimator for instant feedback before upload, it should be **one**
  function, volume-based (the sculpteoMaterials.js approach is closer to physically real),
  not two competing tables
- either way, the region-based flat table in `pricing.js` should probably be deleted
  outright rather than reconciled — it doesn't model anything real about how these vendors
  actually price

---

## 3. re-verify sculpteoMaterials.js against a live, dated source

concretely, for every entry in `SCULPTEO_MATERIALS`:

| field | current value (unverified) | what to check |
|---|---|---|
| `sculpteoId` | `"silver"`, `"gold_14k"`, `"gold_18k"`, `"brass"`, `"white_plastic"` | do these match real material ids returned by sculpteo's materials query endpoint, or are they placeholder slugs someone typed in? |
| `pricePerMm3` | e.g. silver 0.0014, gold_18k 0.018 | pull real per-unit pricing from the api or a quote round-trip, not a guess |
| `minThicknessMm` | e.g. 0.6mm for silver/gold | this is the single most consequential number in the file — a generator that trusts a wrong min-wall value produces pieces that either fail casting or waste material margin. get it from sculpteo directly, in writing |
| `maxSizeMm` | e.g. 90×90×90 for silver | verify against their current build volume for the specific process (lost-wax cast pieces are usually much smaller than general sla builds — a 90mm ring blank would be unusual) |

apply the same treatment before trusting anything about shapeways' material catalog —
that side of the file doesn't exist yet, which is arguably safer than existing and being
wrong.

once verified, this data's home is `reference/manufacturer-capabilities.json`
(schema already written) with the `sources` array populated — not a hardcoded js array
with a comment link at the top that nothing enforces.

---

## 4. self-serve ordering: get this in writing, not inferred

as of this session:

- **sculpteo**: public api docs describe upload → `price_by_uuid` (instant) → order.
  the order endpoint requires **invoice payment to be manually enabled on the account
  first** — there is no evidence of a fully self-serve path from signup to a placed
  order without a human at sculpteo doing something on their end.
- **shapeways**: developer portal (`developers.shapeways.com`) still describes an
  oauth2 api with model upload, printability checks, and order placement. shapeways
  went through chapter 7 bankruptcy in july 2024 and was relaunched by the original
  founders under new ownership in december 2024; the consumer marketplace/shops did
  not come back, only the core manufacturing service. **confirm the api is still live
  and self-serve today** — don't build against a portal that might be a leftover page
  from before the restructuring.

action: this is a browserbase task from the brief, not a firecrawl one — walk the actual
developer signup flow on both sites far enough to know whether it's self-serve or
sales-gated, without submitting real payment info. record which is true, dated, before
architecting the onboarding flow around an assumption either way.

---

## 5. casting tolerances need to be per-alloy, not one flat number

`sculpteoMaterials.js` uses a single `minThicknessMm` per material entry, which is a
reasonable start, but real lost-wax casting tolerance also depends on:

- **geometry**, not just material — a thin flat wall and a thin spike of the same
  nominal thickness behave very differently in casting
- **shrinkage rate during casting**, which varies by alloy (silver and gold shrink
  differently) and needs to be compensated for in the model *before* export, not
  corrected for after a failed cast
- **wax burnout and investment constraints** that a general-purpose am bureau's printed
  min-wall spec doesn't capture at all — sculpteo/shapeways' numbers describe what their
  printer can resolve in castable resin, not what survives the casting step afterward

this is exactly the gap research.md's `casting-tolerances.json` (with a required
`source` field) is meant to close, and exactly the kind of number the inference-ban
rule exists for — these values have to come from a citable casting reference or a
manufacturing partner's own spec sheet, never guessed by a model to "seem reasonable."

---

## 6. decide who picks the manufacturer, before the schema locks in

`pricing.js`'s region table implies a **platform-routes-automatically** model (buyer's
region picks a cost bucket). that's a different product decision from **creator picks
their preferred manufacturer per design**, which is closer to what `manufacturer-
capabilities.json`'s per-manufacturer capability data implies. this decision changes:

- whether `manufacturer-capabilities.json` needs a per-region routing table or just a
  flat list creators choose from
- whether the adapter layer needs to support "same design, multiple possible partners"
  from day one, or can assume one partner per design initially
- how quotes get shown to a buyer before checkout — one number, or "starting at" with
  partner-dependent variance

this is cheap to decide now and expensive to retrofit once orders/pricing schema exist
in a live database — worth an explicit answer before more manufacturer-side code gets
written on top of an assumption.

---

## suggested order of operations from here

1. run the process-fit check (section 1) on sculpteo and shapeways specifically —
   everything else is wasted effort if the answer is no on both
2. in parallel, do the browserbase self-serve check (section 4) — cheap, and changes
   the shape of the adapter work either way
3. once you know which partner(s) are real candidates, verify their actual material
   catalog and tolerances against them directly (section 3), replacing the placeholder
   numbers in `sculpteoMaterials.js`
4. only then reconcile pricing (section 2) and make the routing decision (section 6) —
   both depend on knowing which real partners and real numbers you're working with
