# tessa leg

tessa is the vision-model middle layer: she reads a creator's references and description and proposes values for the studio's predefined controls. she never generates geometry, meshes, or openscad. her output is a typed, bounded parameter proposal that the creator accepts, edits, or rejects, and paracraft compiles only accepted values.

## steps

1. **define the proposal protocol:** a serialized schema (pydantic or protocol buffers candidate, per earlier architecture notes) for a proposal: control id, proposed value, unit, confidence, and the reference it was derived from. proposals that name a control outside the parameter envelope are invalid at the protocol level, not politely ignored.
2. **pin the control schema:** tessa's proposal targets come from paracraft's parameter envelope per jewelry family ([offerings](../../offerings/README.md) defines the families). this leg consumes that schema; it cannot invent controls.
3. **bound the tool calling:** tessa's toolkit is a fixed set: read project state, read the control schema, emit a proposal. no mesh output, no openscad emission, no control creation. langchain or litellm candidates for the bounded tool layer; the model itself is swappable behind the protocol.
4. **version the prompts and tuning artifacts:** prompts, few-shot examples, and tuning artifacts live in version control (dvc candidate), so a proposal regression can be traced to a prompt change like any other code change.
5. **build the evaluation set:** a dated corpus of (reference, description, expected control values) cases from real creator-style inputs, including images. proposals are scored on parameter accuracy and on boundary discipline: did tessa stay inside the envelope, and did she flag uncertainty instead of guessing?
6. **creator approval loop:** every proposal surfaces as an editable diff of control values in the studio ui. nothing auto-applies. a creator can accept all, edit, or reject, and rejections feed the evaluation set.

## waiting on

- the canonical project model and control schema from the [paracraft leg](../paracraft/README.md): proposals need their exact target.
- the studio ui's proposal-diff surface from the [studio leg](../studio/README.md).

## boundaries

tessa is exclusively for creators; buyers and commissioners never operate her. she does not decide castability (paracraft's rules do), and she does not touch listings, prices, or orders. if she misunderstands a reference, the worst case is a visible, editable parameter proposal, never a phantom geometry. on external dataset generation for her evaluation corpus, see the note in [paracraft's benchmarks](../paracraft/benchmarks.md).
