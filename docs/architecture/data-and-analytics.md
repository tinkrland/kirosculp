# supabase and falkordb: application backend and analytics

**status:** proposal, not deployed. drafted 2026-09-23.

## backend ownership: supabase and falkordb

the supabase + falkordb pairing is the overall sculptura application backend, **not a payments pairing**. Supabase/Postgres stores authenticated users, creator projects, immutable design-release references, listings, purchases, operational finance state, manufacturing partners, events, and auditable state transitions. falkordb is the complementary graph capability for interconnected creator, design, supplier, geographic, and compliance questions. fix known row-level security and password/authentication problems before sensitive financial access. use server-side service boundaries, least privilege, transactional writes, and provider-event verification. spree's own store/order records are integration state; define explicit mappings to canonical ids and reconcile them.

## falkordb: graph projection of application data

falkordb could be useful for queries across creator → project → design release → listing → purchase → route → manufacturer → compliance rule, and for explainable route/partner eligibility. it is not needed to make a mock charge or balance ledger accounts. start with normal indexed postgres relations; add graph only if a specific cross-relationship query or graph traversal merits the operational complexity.

falkordb's **dm-sql-to-falkordb** project has a postgresql loader and documents supabase-compatible postgres as a source. it supports initial import and ongoing **one-way** sync, via incremental polling or postgresql logical-replication cdc where configured. the ability to use cdc in our managed supabase environment and its replication privileges/slots, ssl settings, retention and delete handling must be verified with a dedicated proof. treat graph reads as eventually consistent and keep payment authorization, account balances, payouts, permission checks, and checkout route gating on the authoritative postgres path. sync only allowlisted, minimized, non-secret columns. enforce access at the graph api rather than assuming supabase rls propagates through replication.

a first graph slice can be prototyped **alongside**, not after, the finance spike: creator → project → design release → supported alloy → partner capability → shipping region → relevant compliance rule, with source row ids, rule versions, and provenance. graph connectivity is an application-backend concern, independent of whether the payment mock works. no raw credentials, buyer addresses, private messages, or payment information.

## formance ledger: later finance evaluation

formance ledger is an open-source programmable double-entry ledger with atomic multi-posting transactions and postgresql storage. this is the finance-ledger candidate for later evaluation. compare formance against sculptura's payout holds, idempotency, immutable postings, currencies, refunds, disputes, reconciliation, and numscript mapping. it must have one clear authoritative ledger role; supabase remains the operational backend for the wider application, but do not maintain two independent authoritative financial journals. integrate with an explicit event/outbox and reconciliation contract. its repository states that production usage is supported only through the official kubernetes operator deployment path. since initial hosting is planned for render, do not assert that a render-hosted standalone formance instance is a supported production configuration; defer the deployment decision until evaluated.

## apache superset: before v1, not in the first mock spike

plan a read-only bi deployment before v1 for contribution margins, quote accuracy, maker/factory cost variance, order conversion, refunds, creator earnings, payout aging, route reliability, and hallmarking/market exceptions. feed approved reporting views or a replica/warehouse from supabase. do not expose live financial tables or unrestricted personal data to the bi tool. define per-role dashboard access, row-level policies at the reporting layer, metric definitions, and refresh lag. superset is analytical visibility, never checkout logic or a payment ledger.

## phase order

1. **now, in parallel:** design the overall supabase + falkordb backend and a separate spree + localstripe/FetchSandbox finance prototype. neither requires live stripe.
2. **spikes:** prove one backend graph traversal/sync and one mock checkout flow independently. mock ledger postings may start in supabase; formance remains a separate later evaluation.
3. **backend proof:** test sanitized dm-sql-to-falkordb one-way sync on a disposable database, measure lag and deleted-row handling before relying on graph reads.
4. **later:** evaluate formance ledger against real finance requirements and its supported production deployment model; select exactly one journal of record.
5. **before v1:** add read-only apache superset and finance/fulfillment dashboards, with access-control and metric tests.

## sources consulted

- falkordb sql migration/sync documentation: https://docs.falkordb.com/operations/migration/sql-to-falkordb
- postgresql loader repository: https://github.com/FalkorDB/DM-SQL-to-FalkorDB/blob/main/PostgreSQL-to-FalkorDB/README.md
- formance ledger repository: https://github.com/formancehq/ledger
- apache superset: https://superset.apache.org/
