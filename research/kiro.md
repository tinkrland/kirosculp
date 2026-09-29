# kiro workflow findings

verified from official docs on 2026-09-29. these describe supported features,
not proof of code quality or a guarantee of output within the remaining budget.

## useful fit for this repository

- persistent steering carries product context, tech and project structure;
  use focused always-on files for non-negotiables, manual steering for the leg.
- frontmatter key is `inclusion`, not `included`. documented modes include
  always, fileMatch, manual and auto.
- root AGENTS.md is supported and always included. custom agents need explicit
  steering resources; do not assume normal steering discovery applies there.
- requirements-first specs produce requirements.md, design.md and tasks.md.
  requirements use ears-style conditions and testable acceptance criteria.
  requirements and design are reviewed before implementation.
- `#spec` loads the associated spec documents; individual tasks or all tasks
  can be executed. choose small batches here for verifiable security changes.
- specs can be revised and tasks synchronized rather than restarting context.
- quick specs skip approval gates; not the chosen fit for unresolved access
  policy contradictions in this security leg.

## sources and boundaries

| source | supports | boundary |
|---|---|---|
| https://kiro.dev/docs/steering/ | persistent steering, inclusion syntax, foundation files, AGENTS.md, custom-agent resource caveat | discovery applies only when files are actually present in the active workspace |
| https://kiro.dev/docs/specs/feature-specs/requirements-first/ | staged requirements/design/tasks with review and implementation | does not settle sculptura's policy conflicts |
| https://kiro.dev/docs/specs/best-practices/ | #spec references and revision/sync workflow | does not prove generated code or tests are correct |
| https://kiro.dev/docs/specs/ | spec workflow types, including quick specs | feature availability is not a claim about credit cost |

owner reported 4100 kiro tokens and about 25 hours remaining. preserve those
units as reported; do not reinterpret them as measured api tokens or promise
how much engineering they will purchase. focus on complete tested slices.
