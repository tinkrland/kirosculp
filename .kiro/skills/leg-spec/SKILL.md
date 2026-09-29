---
name: leg-spec
description: convert a buildplan leg README into a kiro spec (requirements, design, tasks) with verifiable acceptance criteria. use when starting work on any buildplan leg.
---

# leg spec

turn a buildplan leg readme into a kiro spec before writing any code.

## inputs

- the leg readme: buildplan/<leg>/README.md
- every doc it links (read them all; do not skim)
- the steering files (product, conventions, architecture)

## steps

1. read the leg readme and all linked docs fully.
2. write .kiro/specs/<leg>/requirements.md: numbered requirements in
   ears-style (the system shall...), each with a verification method.
   every requirement must trace to a sentence in the source docs; note
   any requirement you had to invent and mark it open-question.
3. write .kiro/specs/<leg>/design.md: the technical approach, named
   components, data model changes, and explicit rejection of alternatives
   with reasons.
4. write .kiro/specs/<leg>/tasks.md: ordered, small tasks, each with an
   acceptance test that can actually run (a command, a query result, a
   passing test file). no task like "improve x".
5. stop for review before implementing.

## boundaries

- never invent product decisions to fill gaps; list them as open questions.
- the leg readme states intended behavior; tests and code establish current
  behavior. record contradictions for review before choosing a policy.
