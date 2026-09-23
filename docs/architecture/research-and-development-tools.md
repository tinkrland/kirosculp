# Research and development toolchain (proposed)

**Status:** available resources and a proposed workflow, not proof of installed integrations.

- **OpenAI and Gemini keys:** inference for coding/research tasks when their approved budgets allow; do not embed keys in documentation or frontend builds.
- **Featherless.ai:** OpenAI-compatible inference endpoint for supported open models. Its docs describe tool/function calling for supported models. The application or local research harness still has to implement the tool loop, validate model-generated arguments, call Tavily/Firecrawl/Browserbase explicitly, and return results to the model. A key does not automatically give a model direct access to those services. Model support, tool-calling behavior, rate limits, and pricing require a per-model check.
- **Tavily:** search/discovery and dated source leads. **Firecrawl:** extraction from selected pages into structured evidence. **Browserbase:** interactive pages and visual workflows when plain fetch is insufficient. Capture source URL, retrieval date, and specific claim in research outputs; never promote unsourced manufacturing dimensions or legal rules to production data.
- **IBM Bob and AWS Kiro:** development-assistance options for implementation spikes and code review. Generated changes still require local tests, schema checks, secret scanning, and human review before merge.

A lean loop is: identify the exact unresolved question → search 1–2 high-signal sources → extract only the relevant pages → use an appropriate model to compare evidence and draft a patch → validate against repository contracts and live partner documentation. Do not route user data, supplier terms, private designs, or credentials through another service merely because a model API is available. Keep research tooling outside checkout, payout, and security-decision paths.

Official capability references: https://featherless.ai/docs/quickstart-guide and https://featherless.ai/docs/tool-calling.
