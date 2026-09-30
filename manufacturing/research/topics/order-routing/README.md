# order routing: two independent regulatory axes

research pass: 2026-09-30. the scope is all 22 planned destinations: 16 first-cohort
markets, five research-hold markets and one v3 candidate. this is sourced
research and an implementation contract, not legal clearance or a live router.

## the two questions

1. **precious-metal market eligibility:** can this exact finished article be
   sold at the destination with its fineness, marks, assay path and evidence?
2. **customs and import treatment:** what declarations, origin rules, duties,
   taxes, importer obligations and delivery charges apply to the physical route?

vienna convention membership answers neither question by itself. a valid ccm
path can avoid duplicate control and marking in a contracting state, subject
to domestic eligibility. it does not remove a customs border, import vat or
carrier fees. eu membership can support movement of goods in free circulation;
it does not create a uniform jewelry hallmarking law.

## findings and records

- [hallmarking and all 22 country cases](hallmarking.md): membership, domestic
  evidence, control versus marking, and the remaining verification gaps.
- [imports and territory distinctions](imports.md): eu, efta, eea, great britain,
  northern ireland, non-european markets and changed low-value regimes.
- [route evidence contract](route-evidence-contract.md): facts a route must
  establish before approval, including assay detours and returns.
- [machine-readable country matrix](countries.json): versioned research records;
  every checkout flag remains false and every axis remains unapproved.
- [source index](sources.json): urls,
  retrieval outcomes and full-text hashes. source age is not reset by retrieval.

## source hierarchy and limits

prefer current consolidated legislation and customs implementation guidance over
trade summaries. the convention membership directory establishes the convention
list; its country profiles explicitly disclaim legal status and often retain
2019 update dates. those profiles are valuable leads, not approved predicates.

this pass found stale profile transition notices, an ambiguous israel weight
cell, distinctions between jewelry and other metal articles in german law,
and import-policy changes that would invalidate a simplistic geographic router.

several national details remain unresolved, especially jewelry marking in
australia, new zealand, south korea and singapore; current commencement and
article-specific conditions in older convention profiles; and precise tariffs,
origin proofs, importer arrangements and carrier coverage for actual facilities.
there is no honest basis to call every origin/destination pair legally approved.

## research tools

firecrawl and tavily were called through configured keys. alexandria discovery
was tested twice and returned no relevant tools; no provider execution or terms
acceptance occurred. firecrawl page reads and direct official-site reads supplied
the evidence. errors and unsuccessful retrievals remain visible in the index.

full source texts were read and retained as working evidence, not republished
in this public repository. [replay instructions](../../../../scripts/research/README.md)
make the collection reproducible without depending on a particular sandbox.
source facts and interpreted findings remain reviewable independently.

back to [cross-cutting research](../README.md),
[regional routing](../../../routing/regional-routing.md), and
[shipping locales](../../../../operations/shipping/locale.md).
