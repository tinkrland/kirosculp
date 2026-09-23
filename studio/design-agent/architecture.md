# tessa: parameter protocol and tooling

tessa proposes changes to a creator-owned project. it does not construct geometry, run authoritative physical checks, modify payment records, or approve a release. the proposed components below are design choices to validate, not installed services.

## typed parameter state

use a versioned canonical parameter document owned by the studio backend. pydantic is a sensible python validation layer if the service is python-based: define strict enums, bounds, units, supported fields, migrations, and cross-field invariants. publish a language-neutral json schema for the browser and other services, and serialize canonically before hashing. protocol buffers are an optional transport format if cross-language service contracts or binary efficiency justify them; they do not replace domain validation. pick one canonical wire representation and version it rather than maintaining two conflicting sources of truth.

a tessa response is a typed **proposal**, not a full replacement state. include project revision, allowed parameter paths, typed operations and values, model/prompt version, and a correlation id. reject unknown paths, unsafe values, stale revisions, and unexpected tool output before creator review. record the accepted proposal as a new project revision. never treat an llm response as a validated project model.

## prompt and tuning lineage

keep small prompt templates, schemas, and tool definitions in git with semantic versions and regression tests. dvc can version larger evaluation datasets, curated reference sets, model/tuning artifacts, and reproducible experiments, with remote storage configured separately. record prompt git sha, dvc dataset/model revision, model/provider version, tool schema version, and resulting proposal id so a later design can be audited. dvc does not itself provide prompt safety or replace the application release/version model.

## bounded tool calling

start with narrow tools such as `read_project_revision`, `list_allowed_parameters`, `propose_parameter_patch`, and `request_preview`. every tool enforces creator/project identity, allowlisted parameters, quotas, and typed input/output; `propose_parameter_patch` writes only a proposal. only a creator-approved request can cause paracraft compilation. there is no payment, listing, release-authoring, or unrestricted shell tool for tessa.

litellm is a candidate model gateway for routing across openai, gemini, or featherless-compatible endpoints. langchain is a candidate orchestration layer for tool calls, but is not a substitute for the gateway or the domain validators. choose either or both only after a narrow latency, observability, and schema-conformance spike; a direct sdk loop may be simpler initially. model-generated calls are always untrusted inputs.

## redis cache

redis may cache frequently read **versioned** parameter vocabulary, prompt/tool configuration snapshots, and preview metadata. cache keys must include schema/rules/prompt versions and tenant or project scope as appropriate, with short ttl and invalidation on config publication. the authoritative project revisions, prompt releases, validation reports, and design releases persist outside redis. a stale or missing cache must never authorize a release or alter the compiler rules.

## acceptance tests

- a stale project revision, unknown parameter, wrong unit, or out-of-range proposal is rejected.
- the same accepted canonical state and engine/rules versions yield the same content hash.
- Prompt/model/DVC changes cannot silently alter an already issued release.
- cache eviction, failure, and cross-tenant keys cannot change authorization or validation.
- tool calls cannot bypass creator approval or access checkout or manufacturing apis.
