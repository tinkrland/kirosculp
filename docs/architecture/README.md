# Architecture documents

- [`system-boundaries.md`](system-boundaries.md) defines ownership between Studio, Platform, Console, Admin, Manufacturing, and Operations
- [`flow.md`](flow.md) describes the target movement from creator intent to delivery
- [`data-and-analytics.md`](data-and-analytics.md) stages Supabase, FalkorDB, Formance Ledger, and Apache Superset
- [`research-and-development-tools.md`](research-and-development-tools.md) records the proposed model and research toolchain
- [`../../studio/validation/server-release-gate.md`](../../studio/validation/server-release-gate.md) details the trusted ParaCraft worker and hosting boundary
- [`../../operations/financial/mock-finance-flow.md`](../../operations/financial/mock-finance-flow.md) drafts the mock checkout and ledger flow
- [`../current-state-audit.md`](../current-state-audit.md) compares that target with every file in the supplied `sculptura` and `sculptura.dev` snapshots

Architecture statements are target contracts. The audit identifies where existing code already supports them and where the source still violates them.
