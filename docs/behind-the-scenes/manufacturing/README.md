# manufacturing, behind the scenes

this folder is where assumptions go to either acquire a source or die politely.

## layout

- `tasks/` contains the research brief and the first-pass audit of placeholder manufacturer/material data
- `schemas/` defines the evidence-bound capability record
- `adapters/` contains interface prototypes only; no live credentials and no production claims
- `reference/` contains the structured candidate dataset used by validation and, eventually, admin routing
- `research/candidates/` contains the human-readable evidence note for every candidate

## current pass (2026-09-22)

seven candidates were checked with tavily discovery, firecrawl page extraction, and an openai evidence pass. everything remains `drafted`, not `accepted`.

| candidate | precious-metal lost-wax fit | public api | ordering status |
|---|---:|---:|---|
| sculpteo | yes, silver/brass/bronze verified | yes | api ordering requires manual account enablement |
| shapeways | yes | docs exist | current self-serve continuity still unverified |
| i.materialise | yes | unknown | unknown |
| cooksongold | yes | none found | service/portal flow, api unknown |
| stuller | yes | yes, general b2b apis | custom-casting api path unverified |
| rio grande | not established | unknown | customization evidence is not process-fit evidence |
| xometry | not established | general online quoting | no precious-metal jewelry route proved |

these are evidence states, not recommendations. no candidate enters automatic routing until a human changes `review_status` to `accepted`, and that should require a representative quote plus confirmed production onboarding.

## citation rule

an uncited field does not enter `manufacturer-capabilities.json`. unknown is represented as `null`, not guessed as `false`. general investment-casting marketing does not prove the required printed-pattern-to-precious-metal process.
