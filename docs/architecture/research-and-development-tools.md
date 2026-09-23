# research and development toolchain (proposed)

**status:** available resources and a proposed workflow, not proof of installed integrations.

- **openai and gemini keys:** inference for coding/research tasks when their approved budgets allow; do not embed keys in documentation or frontend builds.
- **featherless.ai:** openai-compatible inference endpoint for supported open models. its docs describe tool/function calling for supported models. the application or local research harness still has to implement the tool loop, validate model-generated arguments, call Tavily/Firecrawl/Browserbase explicitly, and return results to the model. a key does not automatically give a model direct access to those services. model support, tool-calling behavior, rate limits, and pricing require a per-model check.
- **tavily:** search/discovery and dated source leads. **firecrawl:** extraction from selected pages into structured evidence. **browserbase:** interactive pages and visual workflows when plain fetch is insufficient. capture source url, retrieval date, and specific claim in research outputs; never promote unsourced manufacturing dimensions or legal rules to production data.
- **ibm bob and aws kiro:** development-assistance options for implementation spikes and code review. generated changes still require local tests, schema checks, secret scanning, and human review before merge.

a lean loop is: identify the exact unresolved question → search 1–2 high-signal sources → extract only the relevant pages → use an appropriate model to compare evidence and draft a patch → validate against repository contracts and live partner documentation. do not route user data, supplier terms, private designs, or credentials through another service merely because a model api is available. keep research tooling outside checkout, payout, and security-decision paths.

official capability references: https://featherless.ai/docs/quickstart-guide and https://featherless.ai/docs/tool-calling.
