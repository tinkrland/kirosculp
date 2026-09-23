# ordered rebuild with evidence gates

this is not a promise that any step is implemented. each step needs a source change, tests, and a verified status update in this tracker. the per-leg detail, dependencies, and waiting states live in [buildplan](../buildplan/README.md).

1. **contain security:** remove client admin password, correct row-level policies cumulatively, lock down private market accounts and commission requests, and prove cross-role denial. do not deploy finance functions against permissive policies.
2. **establish the studio source of truth:** version and serialize a canonical project state; implement tessa's bounded proposal/approval protocol; consolidate paracraft's geometry construction and rule versions. align browser preview with a reproducible server build.
3. **gate design release on the server:** compile the approved revision in a constrained headless openscad worker, derive mesh measurements, run independently sourced manufacturing checks, then issue an immutable release only on matching hashes and approval. no browser claim can create or alter a release.
4. **make platform consume releases:** remove client-provided price and validation claims; make listings, storefronts, and channels point to the release id/hash. detach duplicated offering code from the studio.
5. **prototype commercial flow before stripe:** use spree with localstripe and/or fetchsandbox to exercise a release-bound order, the two-way pricing equation, server quote, mock payment, ledger allocations, reversals, and reconciliation. verify the mock's actual api coverage. production stripe integration comes later, after the state machine and legal/payment model are proven.
6. **connect manufacturing:** onboard verified metal casting partners, capability/rule data, eligible quote and route selection, partner submission, production milestones, cancellation, and delivery reconciliation.
7. **open commissions only when complete:** require commissioner login, creator choice to enable, conversation, terms, revisions, protected milestones, acceptance, refunds, and disputes.
8. **finish payout and insight:** integrate an approved production payment rail, assess formance ledger without duplicating authoritative journals, build creator payout gates and read-only superset reporting before v1. add operational exception views and audit history.

keep supabase and falkordb scoped to the overall backend throughout; the graph is not a second payment journal. on render, a containerized studio validation worker is a candidate, while vercel remains a possible later frontend or thin-api option.
