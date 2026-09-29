#!/bin/sh
set -eu
root=$(git rev-parse --show-toplevel)
cd "$root"
ref=${1:-origin/agent-instructions}
git rev-parse --verify "$ref" >/dev/null
if [ -e .kiro ] || [ -e AGENTS.md ]; then
  printf '%s\n' 'refusing to overwrite existing .kiro or AGENTS.md' >&2
  exit 1
fi
# exclusions are local, not product policy. install only agent-discovered paths.
exclude=$(git rev-parse --git-path info/exclude)
mkdir -p "$(dirname "$exclude")"
for pattern in '/.kiro/' '/AGENTS.md'; do
  grep -qxF "$pattern" "$exclude" 2>/dev/null || printf '%s\n' "$pattern" >> "$exclude"
done
git archive "$ref" .kiro AGENTS.md | tar -x -C "$root"
printf '%s\n' 'installed kiro instruction overlay; product branch unchanged'
