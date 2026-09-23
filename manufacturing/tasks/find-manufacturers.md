# Find-manufacturers.md

A research brief for section 3.5 of research.md. Hand the relevant section
Below to Firecrawl or Browserbase directly. The output of this brief is
`reference/manufacturer-capabilities.json`, validated against
`manufacturer-capabilities.schema.json`.

The citation rule from research.md section 2 applies here without exception:
An uncited field never enters the JSON file. "the website's marketing copy
Implied it" is not a citation. Get it from the API docs, a pricing/spec page,
Or a dated note from an actual sales conversation.

---

## 0. The question every candidate must answer before anything else

**Does this manufacturer actually do castable-resin-print-to-lost-wax-casting
In precious metal, or are they a general additive manufacturing bureau that
Merely lists "jewelry" as an application?**

These are not the same thing. Most industrial am marketplaces print in
Plastic, steel, or aluminum via sla/sls/binder-jet and have never touched
Lost wax casting. Do not let a slick developer portal substitute for
Confirming the actual process. This is `process_fit.supports_precious_metal_lost_wax_casting`
In the schema, and it gates everything else -- a manufacturer that fails
This check does not need the rest of the checklist run against it.

---

## 1. Candidates to verify (not a confirmed list)

These are starting points for firecrawl/browserbase to check, not a
Pre-vetted shortlist. Two are already confirmed to have live developer apis
As of 2026-09-11 (sculpteo, shapeways) -- everything else on this list needs
The full verification pass, including whether they do jewelry casting at all.

| Candidate | why it's on the list | known as of last check |
|---|---|---|
| Sculpteo | live API (upload/quote/order), merged into 3D prod group may 2026 | general am bureau, verify jewelry-casting process fit |
| Shapeways | live API docs portal, restructured after 2024 bankruptcy | general am bureau, verify jewelry-casting process fit and API continuity |
| I.materialise | markets jewelry printing specifically | API existence unverified, check |
| Cooksongold | uk precious-metals refiner and casting bureau | likely no self-serve API, verify manual-quote-only |
| Stuller | major us jewelry manufacturing supplier, b2b integrations exist | verify whether any integration is a public/partner API vs closed b2b portal |
| Rio grande | us jewelry supply + casting services | likely no public API, verify |
| Xometry | general manufacturing marketplace, has a public API | almost certainly no precious-metal lost-wax casting -- check process fit first, may fail step 0 outright |

Add to this table as research turns up more names. Do not remove a row just
Because it looks unlikely -- record the negative finding (`supports_precious_metal_lost_wax_casting: false`)
With its source instead of silently dropping the candidate. A documented "no"
Is worth more than a missing row.

---

## 2. Firecrawl task

Use `formats: ['json']` with the extraction schema below against each
Candidate's developer docs, pricing pages, and material/process spec pages.
Use `markdown` format for anything that's prose you need to read yourself
(Faq pages, process explainer pages) rather than structured spec data.

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

Pages to target per candidate:

- Their developer/api docs root (if `has_public_api` from the table above, or unknown)
- Their materials or process spec page
- Their pricing or "how it works" page
- Their jewelry-specific landing page, if one exists separately from their general am offering

---

## 3. Browserbase task

Use for anything Firecrawl can't reach cleanly: pages behind a login, an
Interactive quote calculator that needs form input before it renders a price,
Or a materials chart rendered client-side after a dropdown selection.

Concretely:

1. **Live quote calculators.** enter a representative jewelry part (small,
   Under 30g, silver, single unit) and capture the actual quoted price and
   Turnaround, not just the existence of a calculator. Screenshot the result
   As the source artifact.
2. **Developer signup flows.** walk far enough into account creation /
   Api-key request to determine whether it's genuinely self-serve or gated
   Behind a sales conversation. Stop before submitting real payment info or
   Committing to anything -- the goal is `onboarding.requires_manual_setup`
   And `onboarding.steps`, not an actual account.
3. **Material spec pdfs or charts that only render after interaction** --
   Capture the precious-metal-specific rows (alloy, min wall thickness,
   Casting process) if present.

Record the interaction path taken (which buttons, which inputs) in the
Source note so the finding is reproducible, per research.md's source format.

---

## 4. Output format

For each candidate, write both:

- `research/candidates/<candidate-id>.md` -- free-form note in the
  Research.md format (finding / conditions and caveats / sources / how this
  Enters the engine)
- An entry appended to `reference/manufacturer-capabilities.json`, matching
  `manufacturer-capabilities.schema.json` exactly, `review_status: "drafted"`
  Until a human has checked it against the source and can bump it to `cited`
  Or `accepted`

A candidate that fails step 0 (no precious-metal lost-wax casting) still gets
A `.md` file and a JSON entry -- with `supports_precious_metal_lost_wax_casting: false`
And a source -- so nobody re-researches it in six months.

---

## 5. Definition of done for this pass

- Every row in the candidates table has a `review_status` other than `open`
- Every candidate that passes step 0 has a complete `api` block, even if
  `has_public_api: false`
- `reference/manufacturer-capabilities.json` validates against the schema
- At least one candidate is marked `accepted` with a real, working quote
  Obtained (via API or Browserbase) for a representative jewelry part

---

## 6. Routing evidence required for every useful candidate

A company-level “ships worldwide” statement is not enough. Routing happens from a specific production facility to a specific buyer destination. Research each facility separately where possible.

### Facility and route location

- Production-facility country and city, not only headquarters
- Whether casting, finishing, hallmarking, and dispatch occur at the same facility
- Countries the facility actually dispatches to
- Carrier and precious-metal insurance limits by route
- Incoterms, importer-of-record handling, and customs documentation
- Whether the company routes work to subcontractors or undisclosed facilities

### Exact technical capability

- Process and pattern type
- Exact alloy, color, and fineness
- Dimension, wall, detail, tolerance, and mass constraints
- Supported finishes with measurable descriptions
- Plating options and thickness where relevant
- Engraving preservation and hand-finishing availability
- File, units, metadata, and orientation requirements

### Hallmarking and precious-metal compliance

- Assay-office relationships
- Responsibility or sponsor marks
- Fineness marks supported
- Common control mark capability by verified route
- Convention status must come from official convention or assay-office evidence
- Destination-specific exemptions or additional marks
- Where testing and marking physically occur

Never record `vienna_convention_registered: true` on a caster as a shortcut. The convention operates through contracting states, authorized assay offices, accepted marks, and route-specific requirements.

### Capacity and service

- Next available production date by process/material
- Quoted production lead time
- Rush-service conditions
- Minimum order or batching requirements
- Status-update method
- Cancellation point after which production cannot be stopped

`max_weekly_capacity` and `current_active_orders` are not useful without a common work unit. Prefer promised lead time or available production slots for the exact process and material.

### Quality evidence

- Inspection steps
- Documented finishing standard
- Defect and remake terms
- Observed defect, remake, and on-time rates once Sculptura has orders
- Completed-order count behind each rate
- Whether quality evidence applies to the exact facility and process

Avoid unsupported labels such as standard, premium, or master artisan. Creators choose a finish specification; routing matches that specification to sourced capability and measured performance.

### Route acceptance

An accepted manufacturer record does not automatically approve every origin-destination pair. Each live route also needs country-rollout approval covering customs, tax, hallmarking, shipping, insurance, returns, and consumer handling.

