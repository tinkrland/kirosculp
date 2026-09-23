# Supabase and FalkorDB: Application Backend and Analytics

**Status:** proposal, not deployed. Drafted 2026-09-23.

## Backend Ownership: Supabase and FalkorDB

The Supabase + FalkorDB pairing is the overall Sculptura application backend, **not a payments pairing**. Supabase/Postgres stores authenticated users, creator projects, immutable design-release references, listings, purchases, operational finance state, manufacturing partners, events, and auditable state transitions. FalkorDB is the complementary graph capability for interconnected creator, design, supplier, geographic, and compliance questions. Fix known row-level security and password/authentication problems before sensitive financial access. Use server-side service boundaries, least privilege, transactional writes, and provider-event verification. Spree's own store/order records are integration state; define explicit mappings to canonical IDs and reconcile them.

## FalkorDB: Graph Projection of Application Data

FalkorDB could be useful for queries across creator → project → design release → listing → purchase → route → manufacturer → compliance rule, and for explainable route/partner eligibility. It is not needed to make a mock charge or balance ledger accounts. Start with normal indexed Postgres relations; add graph only if a specific cross-relationship query or graph traversal merits the operational complexity.

FalkorDB's **DM-SQL-to-FalkorDB** project has a PostgreSQL loader and documents Supabase-compatible Postgres as a source. It supports initial import and ongoing **one-way** sync, via incremental polling or PostgreSQL logical-replication CDC where configured. The ability to use CDC in our managed Supabase environment and its replication privileges/slots, SSL settings, retention and delete handling must be verified with a dedicated proof. Treat graph reads as eventually consistent and keep payment authorization, account balances, payouts, permission checks, and checkout route gating on the authoritative Postgres path. Sync only allowlisted, minimized, non-secret columns. Enforce access at the graph API rather than assuming Supabase RLS propagates through replication.

A first graph slice can be prototyped **alongside**, not after, the finance spike: creator → project → design release → supported alloy → partner capability → shipping region → relevant compliance rule, with source row IDs, rule versions, and provenance. Graph connectivity is an application-backend concern, independent of whether the payment mock works. No raw credentials, buyer addresses, private messages, or payment information.

## Formance Ledger: Later Finance Evaluation

Formance Ledger is an open-source programmable double-entry ledger with atomic multi-posting transactions and PostgreSQL storage. This is the finance-ledger candidate for later evaluation. Compare Formance against Sculptura's payout holds, idempotency, immutable postings, currencies, refunds, disputes, reconciliation, and Numscript mapping. It must have one clear authoritative ledger role; Supabase remains the operational backend for the wider application, but do not maintain two independent authoritative financial journals. Integrate with an explicit event/outbox and reconciliation contract. Its repository states that production usage is supported only through the official Kubernetes operator deployment path. Since initial hosting is planned for Render, do not assert that a Render-hosted standalone Formance instance is a supported production configuration; defer the deployment decision until evaluated.

## Apache Superset: Before v1, Not in the First Mock Spike

Plan a read-only BI deployment before v1 for contribution margins, quote accuracy, maker/factory cost variance, order conversion, refunds, creator earnings, payout aging, route reliability, and hallmarking/market exceptions. Feed approved reporting views or a replica/warehouse from Supabase. Do not expose live financial tables or unrestricted personal data to the BI tool. Define per-role dashboard access, row-level policies at the reporting layer, metric definitions, and refresh lag. Superset is analytical visibility, never checkout logic or a payment ledger.

## Phase Order

1. **Now, in parallel:** design the overall Supabase + FalkorDB backend and a separate Spree + localstripe/FetchSandbox finance prototype. Neither requires live Stripe.
2. **Spikes:** prove one backend graph traversal/sync and one mock checkout flow independently. Mock ledger postings may start in Supabase; Formance remains a separate later evaluation.
3. **Backend proof:** test sanitized DM-SQL-to-FalkorDB one-way sync on a disposable database, measure lag and deleted-row handling before relying on graph reads.
4. **Later:** evaluate Formance Ledger against real finance requirements and its supported production deployment model; select exactly one journal of record.
5. **Before v1:** add read-only Apache Superset and finance/fulfillment dashboards, with access-control and metric tests.

## Sources Consulted

- FalkorDB SQL migration/sync documentation: https://docs.falkordb.com/operations/migration/sql-to-falkordb
- PostgreSQL loader repository: https://github.com/FalkorDB/DM-SQL-to-FalkorDB/blob/main/PostgreSQL-to-FalkorDB/README.md
- Formance Ledger repository: https://github.com/formancehq/ledger
- Apache Superset: https://superset.apache.org/
