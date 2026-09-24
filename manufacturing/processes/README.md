# manufacturing/processes: how metal actually becomes jewelry

explanations of the casting processes behind sculptura's routing decisions. these pages are process knowledge, not active rule data: the machine-extracted per-partner values live in the [paracraft rule digest](../../buildplan/paracraft/rule-digest.md), and active rule sets will live in the paracraft compiler.

the core material was recovered from the sculptura.dev-research source repo (research dated 2026-09-11: a full investment-casting pipeline study and a defect-mode catalog, both citation-backed), then distilled here and cross-referenced against the 2026-09-23 published-rule harvest.

## process families

| process | role in sculptura | page |
|---|---|---|
| lost-wax investment casting | the primary manufacturing route: how a validated design becomes a precious metal piece | [lost-wax-investment-casting.md](lost-wax-investment-casting.md) |
| resin-pattern casting | the variant sculptura actually runs: 3d printed castable resin patterns instead of carved wax, with different burnout physics | [resin-pattern-casting.md](resin-pattern-casting.md) |
| sand casting | explained for completeness and partner evaluation; out of routing scope for fine jewelry in v1 | [sand-casting.md](sand-casting.md) |
| defect modes | how castings fail, and the design guardrails that prevent each failure before a pattern is ever printed | [defect-modes.md](defect-modes.md) |

## what sculptura routes to

every routed order uses investment casting with a 3d printed castable pattern: sla, dlp, or msla printed wax-filled resin, burned out and replaced by precious metal. that is the only family that reproduces jewelry-scale detail (tolerance grades ct4 to ct6, roughly plus or minus 0.10 to 0.20 mm per [iso 8062-3](https://www.bessercast.com/investment-casting-tolerances/)).

sand casting and other coarse families are documented so that a partner capability claim can be evaluated correctly: general investment-casting marketing does not prove the printed-pattern-to-precious-metal jewelry process, and a sand-casting-only shop is not a routing candidate for v1 pieces.

## status

all numeric values on these pages are **drafted citations** from published sources, carried over with their links. they become active rules only after cross-checking and benchmark reproduction, per the [convergence strategy](../../buildplan/paracraft/README.md).
