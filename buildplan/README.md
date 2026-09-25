# buildplan

this folder tracks what needs building, step by step, side by side. think of sculptura as a relay race: each leg (paracraft, tessa, the release gate, the platform, the money flow) is a runner with its own track, and the batons are the versioned contracts between them. a leg can only be tackled when it holds the baton: a leg waiting on a handoff stays in its waiting state instead of guessing its neighbor's job.

the [ordered rebuild](../audit/rebuild-order.md) remains the evidence-gated sequence. this folder holds the per-leg detail: what each leg contains, what it is waiting on, and what it hands over. the overall scope-out, including the separation of the content shell, the platform, and the docs boundary, lives in [scoping.md](scoping.md).

## the legs

| leg | owns | hands over (baton) | current step | waiting on |
|---|---|---|---|---|
| [security](security/README.md) | locking down the existing snapshot's auth and row policies | a database that later legs may safely build on | run the denial matrix against the applied corrective migrations (0001-0004 drafted) | nothing; this leg starts first |
| [paracraft](paracraft/README.md) | deterministic geometry compilation and per-metal physical rules | validated meshes and rule verdicts | converge the rule research: [resources](paracraft/resources.md), [acquisitions](paracraft/acquire.md), [benchmarks](paracraft/benchmarks.md) | partner answers to the acquisition questions |
| [tessa](tessa/README.md) | intent-to-parameter proposals within the allowed control set | typed parameter proposals the creator accepts or rejects | define the typed proposal protocol and its evaluation set | the canonical project model and control schema from paracraft's parameter envelope |
| [studio](studio/README.md) | the server release gate: headless builds, mesh analysis, immutable releases | the design release itself | containerize the pinned headless openscad worker | paracraft's consolidated rule versions |
| [platform](platform/README.md) | release-bound listings, variants, checkout intake | release-bound purchase requests | rework publishing to consume a release id and hash | the first design releases from the studio gate |
| [operations](operations/README.md) | the money flow: quote, mock payment, ledger, payout | paid, settled orders eligible for manufacture | draft the local finance prototype with spree + fetchsandbox | release-bound purchase requests from the platform |

## how the relay runs

1. **tackle one leg at a time, but keep the whole track visible.** the table above is the side-by-side view: it stays honest about what is actually being worked on versus what is parked waiting for a baton.
2. **a leg never reaches across the track.** paracraft does not quote prices, the platform does not generate geometry, operations does not decide castability. a leg that needs another domain's answer declares a dependency and waits.
3. **the batons are versioned.** the [design release](../contracts/design-release.md) is the studio-to-platform baton. a release-bound order is the platform-to-operations baton. an eligible paid order is the operations-to-manufacturing baton. when a contract changes, every leg that holds it re-checks its work against the new version.
4. **a waiting state is not a failure.** legs blocked on research answers (like paracraft's partner questions) park openly with the blocking question recorded, rather than inventing plausible numbers.
5. **every handoff needs evidence.** a leg marks its step done only when the receiving leg can consume the output: schema-valid, hashed, and tested. the [audit](../audit/index.md) is the truth ledger for what exists; this folder is the plan for what comes next.

## parallel tracks outside the relay

- **the content shell:** the public explanatory website, a static artifact built from [marketing/](../marketing/README.md) once that content settles. it explains the product and never runs it; see [scoping.md](scoping.md).
- **retelldb:** public documentation will move to retelldb, an independent project with its own spec, not designed here; see [scoping.md](scoping.md).

## what is being tackled now

the current active legs are [security](security/README.md) (contain the existing vulnerabilities before anything else builds on that database) and [paracraft](paracraft/README.md) (converge the casting research into versioned rules, since every downstream leg consumes them). tessa's protocol can be drafted in parallel because its proposal schema only needs the parameter envelope's shape, but its evaluation waits on the control schema settling.
