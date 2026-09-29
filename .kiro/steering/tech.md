---
inclusion: always
---

# technology and verification

production target: typescript/node and supabase. paracraft is independently
extractable; headless openscad validation is a separate studio service.
spree, localstripe and fetchsandbox are reproducible finance sandboxes,
not permission to replace the production stack.

inspect package.json before selecting tools. current root scripts are
`npm test` (paracraft tests) and `npm run validate` (data contracts,
offerings, research, jsonl and prose). neither currently proves rls.
add a dedicated reproducible security harness; do not claim the existing
unit suite establishes database authorization.

use disposable local supabase/postgres for policy integration tests.
identify whether tooling is actually installed. prerequisites, reset,
seed, test and cleanup commands must live in the product repository.
missing docker, database or credentials means blocked, not passed.
