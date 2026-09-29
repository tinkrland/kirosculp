# byok: creators plug their own inference into tessa

owner direction (2026-09-29): free creators work with our inference but
infinite revisions on our bill is not acceptable, so creators may bring
their own key for the tessa inference turns. this file defines what
keys/models qualify, what the floor is, and what happens on the wrong
key. companion to [architecture.md](architecture.md).

## scope: byok moves one cost, not the gate

byok covers **tessa inference turns only** (vision interpretation,
proposal generation). server-side preview compiles and paracraft
validation are always platform compute, still metered (studio credits
/ wallet). so "infinite revisions on a byok key" bills their provider,
and bills us only when they actually compile something. the release
gate is untouched: byok never changes what a release requires
([the server gate](../validation/server-release-gate.md)).

the safety argument is the one already in the architecture: paracraft
consumes typed parameter state, never agent output. a model of any
quality can only emit a **proposal**, which is parsed against the
envelope before the creator even sees it. wrong values, unknown paths,
stale revisions: rejected, no geometry generated. byok can degrade
quality; it cannot degrade safety.

## provider surface

the litellm gateway candidate is the provider surface: any
litellm-supported endpoint qualifies mechanically. that covers the
major providers, aggregators (openrouter, featherless, aimlapi, groq,
together), and self-hosted open models (llama, qwen, mistral, anything
openai-compatible behind ollama/vllm). "open models welcome" is a
consequence of the gateway, not a separate track: an open model is
just an openai-compatible endpoint that happens to run on the
creator's own hardware. local-only keys are fine; no data flows to a
third party at all in that case, only to the creator's own box.

## the floor: capability conformance, not model names

no approved-model allowlist (it would go stale in a week and start
blocking good models). a key is enabled by passing a **capability
probe** at setup time, run server-side against their endpoint:

1. **vision test:** tessa is vision-first; the model must extract
   geometry-relevant description from a fixture reference image
   (shape language, symmetry, approximate proportions) at a minimum
   bar.
2. **structure test:** the model must emit a proposal that parses
   against the typed parameter envelope schema for a fixture project
   (json-schema mode or native tool/function calling).
3. **tool test:** the four narrow tools (`read_project_revision`,
   `list_allowed_parameters`, `propose_parameter_patch`,
   `request_preview`) must be callable with typed outputs.
4. **refusal/garbage handling:** the model must fail *safe*; a probe
   that gets a refusal or malformed output must not loop.

a context floor (multi-image + session history; on the order of tens
of thousands of tokens) is part of the probe fixtures, not a spec
number here. failing keys are rejected with **which check failed**,
not a mystery 401.

quality above the floor is the creator's tradeoff: a passing small
model will be a worse tessa, and that is their bill and their
experience; the envelope keeps geometry safe either way. we publish a
**tested-against** list (models we regression-test tessa prompts on)
as a recommendation; it is never a gate.

### the tested-against list (the big ones)

lanes, not pinned versions: model ids churn faster than docs, so this
table names the lane each provider's usable models live in, and exact
model ids live in the regression config (`studio regression fixtures`),
refreshed at each regression run. seeded 2026-09-29; the probe remains
the only gate, this list is what we *test* and therefore can honestly
recommend:

| provider | lane | notes |
|---|---|---|
| openai | flagship multimodal (gpt-5 generation and successors) + mini lane | the default recommendation lane; reasoning variants fall under the reasoning handling above |
| anthropic | claude sonnet + haoku lanes | tool-calling native; vision capable |
| google | gemini pro + flash lanes | flash is the budget lane |
| deepseek | deepseek-chat lane + deepseek-reasoner lane | chat is the recommendation; reasoner runs under the reasoning rules |
| mistral | flagship lane + pixtral (vision) lane | text-only mistral models fail the vision probe |
| open models (ollama/vllm) | qwen-vl family, llama vision family | the self-hosted lane; small variants will fail the probe, which is fine and honest |

anything not in the table is not disallowed; it is simply untested, and
the probe still decides. the console shows "tested" next to lane
members at key setup, purely informational.

## wrong model, right key (the reasoning-api case)

a key can be perfectly valid and still be the wrong *kind* of model: a
reasoning-only endpoint with no vision, a model with no native tool
calling, a provider plan that only serves a text-only variant. this is
exactly what the probe battery is for, and why it probes capabilities
instead of checking credentials: the key connects, the model answers,
and it still fails check 1 (vision) or check 3 (tools) with a message
naming the model id and the failed check ("this endpoint serves
X, which has no vision input; tessa is vision-first").

reasoning models are not banned; they pass or fail on what they can
do. but they get explicit handling when they do pass:

- **final-answer extraction:** reasoning traces are stripped at parse
  time; only the final structured proposal enters the envelope. a
  model whose reasoning leaks into the proposal output fails the
  structure check.
- **reasoning tokens are their bill:** interleaved thinking burns the
  creator's key faster per turn, which is their call, but the console
  shows an estimated per-turn cost at setup so it is an informed one.
- **latency tier:** a passing model whose probe turns take long enough
  to wreck the conversational flow gets a warning at setup ("this
  model averages Xs per turn"), not a rejection; the floor is
  capability, and slow-but-capable is the creator's tradeoff.
- **parameter quirks:** some reasoning models reject common sampling
  parameters or system prompts; the probe uses the minimal parameter
  set that the gateway normalizes, and a model that cannot run under
  the gateway's normalized call shape fails the tool check honestly.

## the wrong key, at runtime

- **setup:** the probe battery above is the wrong-key answer at entry:
  bad endpoint, wrong model id, insufficient capability: rejected
  with a reason.
- **runtime conformance drift:** a key that passed but starts emitting
  malformed proposals is caught by the existing proposal parser;
  failure rate is surfaced in the console with a re-run-the-probe
  hint. platform meter is never charged for their inference, and
  rejected proposals never trigger a compile.
- **runtime provider errors (quota, expired card, rate limit):** the
  creator's problem by construction; the console shows the provider
  error verbatim, and tessa pauses for that project until the key
  works. no silent fallback to platform inference on their quota
  spikes; fallback-by-default would quietly re-create the unlimited
  bill.
- **studio independence:** tessa being down never blocks the studio;
  the creator can hand-adjust parameters and compile without tessa at
  all ([architecture.md](architecture.md)).

## key custody

encrypted at rest, per-creator scoped, never logged (redaction in
observability), never used for platform workloads, revocable anytime.
prompt confidentiality note: tessa's prompts stay server-side and are
sent to the creator's chosen provider by our backend at call time; we
never ship prompt text to the browser, but the creator's provider sees
the request (their logs, their account). that is the honest tradeoff of
byok and it is stated at key setup.

## metering summary

- byok key, tessa turn: their provider bill.
- preview compile + paracraft validation: platform meter, always
  (studio credits / wallet), byok or not.
- rejected proposals: never compiled, never platform-metered.
