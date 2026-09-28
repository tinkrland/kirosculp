# search store alternatives: falkordb vs the field

companion to [discovery.md](../discovery.md); kept out of the main doc.
the two-track latent model (curated graph + vector similarity) stands;
this file records what could serve it instead of falkordb, and what
would decide it.

| option | what it gives | trade |
|---|---|---|
| **postgres only** (supabase: fts + pgvector + graph as tables/recursive ctes) | one store, one billing, one backup story; ledger of truth stays sole authority; portability rule loves it | traversal queries hand-written; hybrid ranking diy; no cypher |
| **apache age** (postgres graph extension) | keeps single-store win, adds cypher | hosted supabase availability unverified; least mature option here |
| **neo4j** | mature graph + vector indexes, does everything falkordb does | heavy ops (jvm), licensing, maximal infra for our needs |
| **weaviate** | native hybrid keyword+vector, search-engine-in-a-box | fuzzy track only; curated graph still needs a home |
| **elasticsearch / opensearch** | battle-tested bm25 + knn hybrid | heavy ops for a graph that is thousands of nodes, not millions |

## the real contest

falkordb vs postgres-only. falkordb earns its slot through cypher
traversals over the curated vocabulary and single-binary ops, but the
vocabulary graph is small and shallow (phrase -> concept -> style,
2-3 hops): it does not need graph-engine speed. the deciding
experiment belongs to the prototype leg: resolve "swirly gold rings"
with pgvector + fts + ctes in plain supabase. if it resolves cleanly,
falkordb comes off the stack entirely; if the traversals turn
miserable, falkordb is the purpose-built answer and stays.

decision deferred to the prototype leg; both paths are candidates.
the saved "supabase + falkordb backend pairing" predates this model and
is superseded by this open question, not silently.
