# manufacturing

manufacturing turns an eligible paid order and exact design release into a normalized partner production order.

## product code boundaries

- `materials-supported/`: accepted alloy/process allowlist
- `manufacturer-layer/`: normalized upload, quote, order, and status adapters
- `routing/`: route eligibility and scoring
- `quotes/`: time-bounded partner quote snapshots
- `quality/`: defect, remake, reliability, and capability-suspension evidence

## research and reference

- `processes/`: how metal actually becomes jewelry: lost-wax investment casting, the resin-pattern variant, sand casting, and the defect catalog, distilled from the recovered casting research
- `tasks/`: research briefs and open checks
- `schemas/`: evidence-bound capability contract
- `reference/`: structured candidate dataset
- `research/candidates/`: human-readable partner evidence notes
- `research/topics/`: cross-partner research such as the vienna convention and common control mark

seven candidates were checked with tavily discovery, firecrawl extraction, and an openai evidence pass. every record remains `drafted`, not `accepted`. only accepted records may enter automatic routing.

unknown is `null`, not guessed as `false`. general investment-casting marketing does not prove the required printed-pattern-to-precious-metal jewelry process.

## current implementation

see the [complete source audit](../docs/current-state-audit.md) and the audited implementation reference in each subfolder.
