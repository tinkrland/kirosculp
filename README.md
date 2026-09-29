# agent-instructions

orphan branch for tool-specific instructions, steering, specs and handoffs.
main remains the product source of truth. never merge this branch into main.

## correct workspace setup

open product code on a working branch based on main. do not switch that
workspace to this orphan branch: it contains no product implementation.
install the instruction files into that product workspace as untracked,
locally excluded overlays using the script below. generated specs also
belong on this branch, not main. product code, tests and audit evidence
belong on the product working branch.

```sh
git fetch origin agent-instructions
git show origin/agent-instructions:scripts/install-kiro-overlay.sh | sh
```

the installer refuses to overwrite an existing .kiro folder or AGENTS.md.
it installs AGENTS.md and .kiro, and excludes both through .git/info/exclude
without changing the product .gitignore. changes to instructions must be
copied back into a separate worktree of agent-instructions and committed
there before the temporary workspace disappears.

## contents

- `AGENTS.md`: agent-neutral execution contract, usable by other agents too
- `.kiro/steering/`: persistent product, tech, structure and safety context
- `.kiro/skills/`: optional procedural skills, not a substitute for steering
- `handoffs/security.md`: security run brief and paste-ready starting prompt
- `research/kiro.md`: verified official capabilities and workflow sources
- `scripts/install-kiro-overlay.sh`: reproducible product-workspace setup

bob-specific configuration is not present yet. do not invent its discovery
format; the common execution contract is ready for reuse after verification.
