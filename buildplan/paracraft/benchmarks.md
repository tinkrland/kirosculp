# paracraft benchmarks

benchmarks differ per metal and per pattern material: a rule that holds for bronze in a sculpteo casting run (0.8 mm walls, per their published page) does not automatically transfer to sterling silver, and formlabs' 0.7 mm hollow-shell guidance is a property of their castable wax resin patterns, not of any alloy. so paracraft cannot have one benchmark; it needs a small comparative suite, per (alloy, pattern process) pair, that makes rule changes measurable instead of vibes.

## what a benchmark run is

a benchmark run compiles a fixed, versioned set of parametric test pieces with paracraft, exports meshes, and evaluates them against a specific rule set version. everything is deterministic: the same paracraft version, openscad pin, test set, and rule set version must produce the same verdicts, and the run records all four hashes.

## the test set

start small and purposeful, each piece targeting one rule family:

- **wall ladder:** a series of bands stepping wall thickness across the plausible minimum, to locate each rule set's actual pass/fail boundary instead of its advertised one.
- **feature ladder:** wires, prong-like stubs, holes, and engraved text at descending sizes, to find minimum feature, hole, and engraving limits per alloy.
- **hollow shell:** a hollow pendant at several shell thicknesses with and without drain holes, to verify shelling and drain rules.
- **size family:** one ring profile across the full ring-size range, to expose how tolerance and proportion constraints move with size.
- **symbolic stress:** a claddagh-like motif and a double-heart base at production scale, since thin joined sections are where symbolic designs actually fail.
- **pathological cases:** disconnected components, trapped volumes, near-tangent unions: pieces that must fail, to prove the harness catches them rather than passing everything.

each test piece declares its expected verdict per rule set (pass, fail, or needs-manual-review) in a checked-in manifest. a rule set that produces unexpected verdicts on the pathological set is wrong, not the pieces.

## what a benchmark proves

- a new (alloy, process) rule set behaves consistently with its acquired sources before it becomes active.
- a rule change's blast radius is visible: exactly which test pieces flip verdicts, and by how much in millimeters.
- paracraft version changes don't silently alter geometry: the same parameters must hash to the same mesh across versions, or the change is documented as a geometry change with downstream release impact.
- claims like "0.8 mm walls for bronze" are anchored to a dated source and reproduced in the harness, not copied from a marketing page.

## what a benchmark does not prove

it does not prove a real casting succeeds. physical casting trials with a partner remain the final evidence; the harness's job is to catch predictable failures early and cheaply, and to keep rule sets honest between physical trials. it also does not benchmark price, lead time, or route eligibility, which belong to [manufacturing](../../manufacturing/README.md) and [operations](../../operations/README.md).

## on external benchmark partners

we assessed using an outside service for this. [adaptionlabs.ai](https://adaptionlabs.ai/) is an adaptive ai / adaptive-data company (continual-learning models, synthetic dataset generation). it is not a casting or manufacturing-measurement lab, and paracraft's benchmark is deterministic and self-hostable, so there is no clear role for it here today. if tessa later needs generated evaluation corpora for intent parsing, that is the point where a dataset partner would earn reconsideration, recorded in the [tessa leg](../tessa/README.md). the benchmark harness itself we build and own, alongside the [studio release gate](../studio/README.md) that consumes its verdicts.
