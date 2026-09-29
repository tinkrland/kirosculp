---
inclusion: always
---

# architecture boundaries

- studio owns geometry; platform owns sales. never mix them.
- no llm call at search query time. catalog embeddings are precomputed; query-vector strategy requires its own verified spec.
- the release gate is the only path from validated revision to immutable
  design release. no release without server-side validation.
- supabase is the single source of truth for data and money. append-only
  journal entries for anything financial.
- edge/server functions never trust client-supplied financial values,
  ownership, or ids.
- findings (clasps, backs, chains) are platform-supplied hardware from a
  pre-validated catalog; custom geometry overrides must meet interface specs.
- search is two-track: curated vocabulary graph (explainable) and vector
  similarity (fuzzy, lower confidence); exact matches rank above both.
