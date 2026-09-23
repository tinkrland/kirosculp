# Tessa: Parameter Protocol and Tooling

Tessa proposes changes to a creator-owned project. It does not construct geometry, run authoritative physical checks, modify payment records, or approve a release. The proposed components below are design choices to validate, not installed services.

## Typed Parameter State

Use a versioned canonical parameter document owned by the Studio backend. Pydantic is a sensible Python validation layer if the service is Python-based: define strict enums, bounds, units, supported fields, migrations, and cross-field invariants. Publish a language-neutral JSON Schema for the browser and other services, and serialize canonically before hashing. Protocol Buffers are an optional transport format if cross-language service contracts or binary efficiency justify them; they do not replace domain validation. Pick one canonical wire representation and version it rather than maintaining two conflicting sources of truth.

A Tessa response is a typed **proposal**, not a full replacement state. Include project revision, allowed parameter paths, typed operations and values, model/prompt version, and a correlation ID. Reject unknown paths, unsafe values, stale revisions, and unexpected tool output before creator review. Record the accepted proposal as a new project revision. Never treat an LLM response as a validated project model.

## Prompt and Tuning Lineage

Keep small prompt templates, schemas, and tool definitions in Git with semantic versions and regression tests. DVC can version larger evaluation datasets, curated reference sets, model/tuning artifacts, and reproducible experiments, with remote storage configured separately. Record prompt Git SHA, DVC dataset/model revision, model/provider version, tool schema version, and resulting proposal ID so a later design can be audited. DVC does not itself provide prompt safety or replace the application release/version model.

## Bounded Tool Calling

Start with narrow tools such as `read_project_revision`, `list_allowed_parameters`, `propose_parameter_patch`, and `request_preview`. Every tool enforces creator/project identity, allowlisted parameters, quotas, and typed input/output; `propose_parameter_patch` writes only a proposal. Only a creator-approved request can cause ParaCraft compilation. There is no payment, listing, release-authoring, or unrestricted shell tool for Tessa.

LiteLLM is a candidate model gateway for routing across OpenAI, Gemini, or Featherless-compatible endpoints. LangChain is a candidate orchestration layer for tool calls, but is not a substitute for the gateway or the domain validators. Choose either or both only after a narrow latency, observability, and schema-conformance spike; a direct SDK loop may be simpler initially. Model-generated calls are always untrusted inputs.

## Redis Cache

Redis may cache frequently read **versioned** parameter vocabulary, prompt/tool configuration snapshots, and preview metadata. Cache keys must include schema/rules/prompt versions and tenant or project scope as appropriate, with short TTL and invalidation on config publication. The authoritative project revisions, prompt releases, validation reports, and design releases persist outside Redis. A stale or missing cache must never authorize a release or alter the compiler rules.

## Acceptance Tests

- A stale project revision, unknown parameter, wrong unit, or out-of-range proposal is rejected.
- The same accepted canonical state and engine/rules versions yield the same content hash.
- Prompt/model/DVC changes cannot silently alter an already issued release.
- Cache eviction, failure, and cross-tenant keys cannot change authorization or validation.
- Tool calls cannot bypass creator approval or access checkout or manufacturing APIs.
