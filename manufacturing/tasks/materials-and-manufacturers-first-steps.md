# Materials & manufacturers — what to check before going deep

Status: working notes, compiled 2026-09-22, cross-referencing sculptura.dev/research.md,
Keeberia (prior art), the base44 Sculptura prototype (sculpteoMaterials.js, pricing.js),
And live verification of sculpteo + shapeways.

This exists because the base44 prototype already has manufacturer/materials code in it,
And some of it is wrong or contradicts itself in ways that will quietly cost real money
If they reach production unfixed. Fix these before writing more engine code, not after —
The engine's job is to emit geometry that satisfies constraints this doc is supposed to
Pin down first.

---

## Tl;dr — do these six things before anything else

1. Confirm sculpteo and shapeways actually do lost-wax precious-metal casting, not just general am
2. Reconcile the two disagreeing pricing models already sitting in the base44 repo
3. Re-verify every number in `sculpteoMaterials.js` against a real, dated API response
4. Get a written answer on self-serve ordering, not an assumption, from both partners
5. Get real casting tolerance / min-wall-thickness numbers per alloy, not one flat number reused everywhere
6. Decide who picks the manufacturer — creator, buyer, or platform — before the schema locks in

Everything below is the detail behind each of those six.

---

## 1. Process fit: does either partner actually do what you need

This is the one question that gates everything else. Sculpteo and shapeways are both
General **additive manufacturing bureaus** — plastics and metals via sla/sls/binder-jet,
Mostly. What jewelry actually needs is a specific two-step process: **castable resin
Print → lost-wax casting in silver/gold**. Those are not the same capability, and a
Company can be a real, functioning 3D printing service with zero path to a cast ring.

- `sculpteoMaterials.js` already assumes sculpteo does this ("cast via lost-wax") for
  Silver/gold_14k/gold_18k. **that line is not sourced to anything** — it reads like an
  Assumption baked in as fact. Verify it before trusting a single downstream number.
- Neither company's public marketing foregrounds jewelry casting the way a company like
  Cooksongold or stuller does — that alone is a signal worth taking seriously, not proof
  Of anything either way.
- Action: this is what `find-manufacturers-brief.md` (already written) exists to answer.
  Run it — specifically the "does this manufacturer actually do castable-resin-print-to-
  Lost-wax-casting in precious metal" check in section 0 — against sculpteo and shapeways
  By name before assuming either passes.
- If both fail this check, the realistic fallback is a jewelry-specific casting house
  (Cooksongold, stuller, rio grande) that likely has no self-serve API at all, which
  Changes the integration model from "API adapter" to "generate a spec sheet a human at
  The platform sends by email" — a meaningfully different build, worth knowing now rather
  Than after the adapter code is written.

---

## 2. The two pricing models already contradict each other — pick one

The base44 prototype has two independent, disagreeing ways of pricing the same ring:

- `src/lib/pricing.js`: a flat table keyed by `material × region`
  (E.g. Silver/north_america = $48), explicitly commented `// mock values`. No size
  Dependency at all — a size-4 band and a size-13 cuff cost the same.
- `src/lib/sculpteoMaterials.js`: `estimatePriceUSD()`, volume-based —
  `volumeMM3 * pricePerMm3`, with a $25 floor (or $3 for the prototype-plastic material).

These will give different quotes for the same piece, and neither is a real vendor quote —
Both are local estimates. Before building more on top of either:

- Decide whether local price estimation is even the right model, vs. Always round-tripping
  To the manufacturer's live quote endpoint (sculpteo's `price_by_uuid`, once uploaded) and
  Treating any local number as a rough pre-upload estimate only, clearly labeled as such
  In the ui
- If you keep a local estimator for instant feedback before upload, it should be **one**
  Function, volume-based (the sculpteoMaterials.js approach is closer to physically real),
  Not two competing tables
- Either way, the region-based flat table in `pricing.js` should probably be deleted
  Outright rather than reconciled — it doesn't model anything real about how these vendors
  Actually price

---

## 3. Re-verify sculpteoMaterials.js against a live, dated source

Concretely, for every entry in `SCULPTEO_MATERIALS`:

| Field | current value (unverified) | what to check |
|---|---|---|
| `sculpteoId` | `"silver"`, `"gold_14k"`, `"gold_18k"`, `"brass"`, `"white_plastic"` | do these match real material ids returned by sculpteo's materials query endpoint, or are they placeholder slugs someone typed in? |
| `pricePerMm3` | e.g. Silver 0.0014, gold_18k 0.018 | pull real per-unit pricing from the API or a quote round-trip, not a guess |
| `minThicknessMm` | e.g. 0.6mm for silver/gold | this is the single most consequential number in the file — a generator that trusts a wrong min-wall value produces pieces that either fail casting or waste material margin. Get it from sculpteo directly, in writing |
| `maxSizeMm` | e.g. 90×90×90 for silver | verify against their current build volume for the specific process (lost-wax cast pieces are usually much smaller than general sla builds — a 90mm ring blank would be unusual) |

Apply the same treatment before trusting anything about shapeways' material catalog —
That side of the file doesn't exist yet, which is arguably safer than existing and being
Wrong.

Once verified, this data's home is `reference/manufacturer-capabilities.json`
(Schema already written) with the `sources` array populated — not a hardcoded js array
With a comment link at the top that nothing enforces.

---

## 4. Self-serve ordering: get this in writing, not inferred

As of this session:

- **Sculpteo**: public API docs describe upload → `price_by_uuid` (instant) → order.
  The order endpoint requires **invoice payment to be manually enabled on the account
  First** — there is no evidence of a fully self-serve path from signup to a placed
  Order without a human at sculpteo doing something on their end.
- **Shapeways**: developer portal (`developers.shapeways.com`) still describes an
  Oauth2 API with model upload, printability checks, and order placement. Shapeways
  Went through chapter 7 bankruptcy in july 2024 and was relaunched by the original
  Founders under new ownership in december 2024; the consumer marketplace/shops did
  Not come back, only the core manufacturing service. **confirm the API is still live
  And self-serve today** — don't build against a portal that might be a leftover page
  From before the restructuring.

Action: this is a Browserbase task from the brief, not a Firecrawl one — walk the actual
Developer signup flow on both sites far enough to know whether it's self-serve or
Sales-gated, without submitting real payment info. Record which is true, dated, before
Architecting the onboarding flow around an assumption either way.

---

## 5. Casting tolerances need to be per-alloy, not one flat number

`sculpteoMaterials.js` uses a single `minThicknessMm` per material entry, which is a
Reasonable start, but real lost-wax casting tolerance also depends on:

- **Geometry**, not just material — a thin flat wall and a thin spike of the same
  Nominal thickness behave very differently in casting
- **Shrinkage rate during casting**, which varies by alloy (silver and gold shrink
  Differently) and needs to be compensated for in the model *before* export, not
  Corrected for after a failed cast
- **Wax burnout and investment constraints** that a general-purpose am bureau's printed
  Min-wall spec doesn't capture at all — sculpteo/shapeways' numbers describe what their
  Printer can resolve in castable resin, not what survives the casting step afterward

This is exactly the gap research.md's `casting-tolerances.json` (with a required
`source` field) is meant to close, and exactly the kind of number the inference-ban
Rule exists for — these values have to come from a citable casting reference or a
Manufacturing partner's own spec sheet, never guessed by a model to "seem reasonable."

---

## 6. Decide who picks the manufacturer, before the schema locks in

`pricing.js`'s region table implies a **platform-routes-automatically** model (buyer's
Region picks a cost bucket). That's a different product decision from **creator picks
Their preferred manufacturer per design**, which is closer to what `manufacturer-
Capabilities.json`'s per-manufacturer capability data implies. This decision changes:

- Whether `manufacturer-capabilities.json` needs a per-region routing table or just a
  Flat list creators choose from
- Whether the adapter layer needs to support "same design, multiple possible partners"
  From day one, or can assume one partner per design initially
- How quotes get shown to a buyer before checkout — one number, or "starting at" with
  Partner-dependent variance

This is cheap to decide now and expensive to retrofit once orders/pricing schema exist
In a live database — worth an explicit answer before more manufacturer-side code gets
Written on top of an assumption.

---

## Suggested order of operations from here

1. Run the process-fit check (section 1) on sculpteo and shapeways specifically —
   Everything else is wasted effort if the answer is no on both
2. In parallel, do the Browserbase self-serve check (section 4) — cheap, and changes
   The shape of the adapter work either way
3. Once you know which partner(s) are real candidates, verify their actual material
   Catalog and tolerances against them directly (section 3), replacing the placeholder
   Numbers in `sculpteoMaterials.js`
4. Only then reconcile pricing (section 2) and make the routing decision (section 6) —
   Both depend on knowing which real partners and real numbers you're working with
