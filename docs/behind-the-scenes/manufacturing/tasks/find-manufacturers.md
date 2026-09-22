# find-manufacturers.md

a research brief for section 3.5 of research.md. hand the relevant section
below to firecrawl or browserbase directly. the output of this brief is
`reference/manufacturer-capabilities.json`, validated against
`manufacturer-capabilities.schema.json`.

the citation rule from research.md section 2 applies here without exception:
an uncited field never enters the json file. "the website's marketing copy
implied it" is not a citation. get it from the api docs, a pricing/spec page,
or a dated note from an actual sales conversation.

---

## 0. the question every candidate must answer before anything else

**does this manufacturer actually do castable-resin-print-to-lost-wax-casting
in precious metal, or are they a general additive manufacturing bureau that
merely lists "jewelry" as an application?**

these are not the same thing. most industrial am marketplaces print in
plastic, steel, or aluminum via sla/sls/binder-jet and have never touched
lost wax casting. do not let a slick developer portal substitute for
confirming the actual process. this is `process_fit.supports_precious_metal_lost_wax_casting`
in the schema, and it gates everything else -- a manufacturer that fails
this check does not need the rest of the checklist run against it.

---

## 1. candidates to verify (not a confirmed list)

these are starting points for firecrawl/browserbase to check, not a
pre-vetted shortlist. two are already confirmed to have live developer apis
as of 2026-09-11 (sculpteo, shapeways) -- everything else on this list needs
the full verification pass, including whether they do jewelry casting at all.

| candidate | why it's on the list | known as of last check |
|---|---|---|
| sculpteo | live api (upload/quote/order), merged into 3d prod group may 2026 | general am bureau, verify jewelry-casting process fit |
| shapeways | live api docs portal, restructured after 2024 bankruptcy | general am bureau, verify jewelry-casting process fit and api continuity |
| i.materialise | markets jewelry printing specifically | api existence unverified, check |
| cooksongold | uk precious-metals refiner and casting bureau | likely no self-serve api, verify manual-quote-only |
| stuller | major us jewelry manufacturing supplier, b2b integrations exist | verify whether any integration is a public/partner api vs closed b2b portal |
| rio grande | us jewelry supply + casting services | likely no public api, verify |
| xometry | general manufacturing marketplace, has a public api | almost certainly no precious-metal lost-wax casting -- check process fit first, may fail step 0 outright |

add to this table as research turns up more names. do not remove a row just
because it looks unlikely -- record the negative finding (`supports_precious_metal_lost_wax_casting: false`)
with its source instead of silently dropping the candidate. a documented "no"
is worth more than a missing row.

---

## 2. firecrawl task

use `formats: ['json']` with the extraction schema below against each
candidate's developer docs, pricing pages, and material/process spec pages.
use `markdown` format for anything that's prose you need to read yourself
(faq pages, process explainer pages) rather than structured spec data.

```json
{
  "type": "object",
  "properties": {
    "company_name": { "type": "string" },
    "processes_offered": {
      "type": "array",
      "items": { "type": "string" }
    },
    "materials_offered": {
      "type": "array",
      "items": { "type": "string" }
    },
    "supports_lost_wax_casting": { "type": "boolean" },
    "precious_metals_available": {
      "type": "array",
      "items": { "type": "string" }
    },
    "has_public_api": { "type": "boolean" },
    "api_docs_url": { "type": "string" },
    "api_auth_type": { "type": "string" },
    "self_serve_ordering": { "type": "boolean" },
    "accepted_file_formats": {
      "type": "array",
      "items": { "type": "string" }
    },
    "min_wall_thickness_mm": { "type": "number" },
    "typical_turnaround_days": { "type": "number" },
    "pricing_model": { "type": "string" },
    "stone_setting_service": { "type": "boolean" },
    "source_url": { "type": "string" }
  },
  "required": ["company_name", "source_url"]
}
```

pages to target per candidate:

- their developer/api docs root (if `has_public_api` from the table above, or unknown)
- their materials or process spec page
- their pricing or "how it works" page
- their jewelry-specific landing page, if one exists separately from their general am offering

---

## 3. browserbase task

use for anything firecrawl can't reach cleanly: pages behind a login, an
interactive quote calculator that needs form input before it renders a price,
or a materials chart rendered client-side after a dropdown selection.

concretely:

1. **live quote calculators.** enter a representative jewelry part (small,
   under 30g, silver, single unit) and capture the actual quoted price and
   turnaround, not just the existence of a calculator. screenshot the result
   as the source artifact.
2. **developer signup flows.** walk far enough into account creation /
   api-key request to determine whether it's genuinely self-serve or gated
   behind a sales conversation. stop before submitting real payment info or
   committing to anything -- the goal is `onboarding.requires_manual_setup`
   and `onboarding.steps`, not an actual account.
3. **material spec pdfs or charts that only render after interaction** --
   capture the precious-metal-specific rows (alloy, min wall thickness,
   casting process) if present.

record the interaction path taken (which buttons, which inputs) in the
source note so the finding is reproducible, per research.md's source format.

---

## 4. output format

for each candidate, write both:

- `jewelry/manufacturing/<candidate-id>.md` -- free-form note in the
  research.md format (finding / conditions and caveats / sources / how this
  enters the engine)
- an entry appended to `reference/manufacturer-capabilities.json`, matching
  `manufacturer-capabilities.schema.json` exactly, `review_status: "drafted"`
  until a human has checked it against the source and can bump it to `cited`
  or `accepted`

a candidate that fails step 0 (no precious-metal lost-wax casting) still gets
a `.md` file and a json entry -- with `supports_precious_metal_lost_wax_casting: false`
and a source -- so nobody re-researches it in six months.

---

## 5. definition of done for this pass

- every row in the candidates table has a `review_status` other than `open`
- every candidate that passes step 0 has a complete `api` block, even if
  `has_public_api: false`
- `reference/manufacturer-capabilities.json` validates against the schema
- at least one candidate is marked `accepted` with a real, working quote
  obtained (via api or browserbase) for a representative jewelry part
