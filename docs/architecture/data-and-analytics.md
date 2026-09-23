# Supabase, FalkorDB, and analytics: staged plan

**status:** proposal, not deployed. Drafted 2026-09-23.

## Supabase stays authoritative

Continue with Supabase/Postgres for authenticated users, immutable design-release references, listings, purchases, double-entry financial entries, partner orders, event inbox/outbox, and auditable state transitions. Fix known row-level security and password/authentication problems before sensitive financial access. Use server-side service boundaries, least privilege, transactional writes, and provider-event verification. Spree's own store/order records are integration state; define explicit mappings to canonical IDs and reconcile them.

## FalkorDB is a projection, not a second ledger

FalkorDB could be useful for queries across creator → project → design release → listing → purchase → route → manufacturer → compliance rule, and for explainable route/partner eligibility. It is not needed to make a mock charge or balance ledger accounts. Start with normal indexed Postgres relations; add graph only if a specific cross-relationship query or graph traversal merits the operational complexity.

FalkorDB's **DM-SQL-to-FalkorDB** project has a PostgreSQL loader and documents Supabase-compatible Postgres as a source. It supports initial import and ongoing **one-way** sync, via incremental polling or PostgreSQL logical-replication CDC where configured. The ability to use CDC in our managed Supabase environment and its replication privileges/slots, SSL settings, retention and delete handling must be verified with a dedicated proof. Treat graph reads as eventually consistent and keep payment authorization, account balances, payouts, permission checks, and checkout route gating on the authoritative Postgres path. Sync only allowlisted, minimized, non-secret columns. Enforce access at the graph API rather than assuming Supabase RLS propagates through replication.

Suggested first projection, **after** the finance spike: design release → listing → supported alloy → partner capability → shipping region → relevant compliance rule, with source row IDs, rule versions, and provenance. No raw credentials, buyer addresses, private messages, or payment information.

## Fleetbase Ledger: later evaluation

Fleetbase maintains an open-source **Ledger** accounting and invoicing extension to the Fleetbase ecosystem. Its repository describes double-entry bookkeeping. Later, compare it against Sculptura's own Supabase ledger contracts for multi-party payable states, idempotency, immutable journal entries, currency, refunds, disputes, event reconciliation, API maturity, operational dependencies, license, and integration effort. Do not run two competing authoritative ledgers. If adopted, decide whether Fleetbase becomes the ledger of record or a reporting/invoicing consumer; do not mirror writes both ways without a reconciliation contract.

## Apache Superset: before v1, not in the first mock spike

Plan a read-only BI deployment before v1 for contribution margins, quote accuracy, maker/factory cost variance, order conversion, refunds, creator earnings, payout aging, route reliability, and hallmarking/market exceptions. Feed approved reporting views or a replica/warehouse from Supabase. Do not expose live financial tables or unrestricted personal data to the BI tool. Define per-role dashboard access, row-level policies at the reporting layer, metric definitions, and refresh lag. Superset is analytical visibility, never checkout logic or a payment ledger.

## phase order

1. **Now:** draft the finance state machine and mock payment adapter; keep Spree's commerce data and Supabase financial state explicit.
2. **Spike:** run one mock end-to-end order and failure tests, with a balanced Supabase ledger and reconciliation.
3. **After demonstrated need:** test a sanitized DM-SQL-to-FalkorDB one-way graph projection on a disposable database, measure lag and deleted-row handling.
4. **Later:** evaluate Fleetbase Ledger only against real ledger requirements, with one clear source of truth.
5. **Before v1:** add read-only Apache Superset and finance/fulfillment dashboards, with access-control and metric tests.

## sources consulted

- FalkorDB SQL migration/sync documentation: https://docs.falkordb.com/operations/migration/sql-to-falkordb
- PostgreSQL loader repository: https://github.com/FalkorDB/DM-SQL-to-FalkorDB/blob/main/PostgreSQL-to-FalkorDB/README.md
- Fleetbase Ledger repository: https://github.com/fleetbase/ledger
- Apache Superset: https://superset.apache.org/
