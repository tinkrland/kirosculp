# paracraft operation taxonomy

## the problem with geometry-only rules

paracraft currently measures five things: mesh topology (manifoldness, nested components), minimum wall thickness, clearance between components, and bounding box. constraints are keyed to raw properties like `minimum_wall_thickness`. that works for walls and nesting. it breaks for surface operations.

sculpteo says minimum engraved detail is 0.4 mm. formlabs warns specifically about engraved channels deeper than they are wide. gildform says model-side engraving under 1.5 mm letter height tends to fail in both depths and recommends laser engraving instead. cooksongold allows recessed text to a maximum depth of 0.50 mm. none of those rules are expressible as a wall thickness constraint. the profile schema has `ctr-engrave-002` with a `max_depth` value, but the harness cannot evaluate it because it has no way to know which part of the mesh is an engraving versus a natural concavity.

the fix is not smarter mesh inspection. a ray cast cannot tell a deliberate engrave from a thin section caused by a design error. the fix is declared operations: the studio says what it did, and paracraft holds it against the rules for that operation type.

## declared not inferred

an operation declaration is a typed record the studio attaches to a parameter state:

```json
{
  "op": "op-engrave",
  "surface": "<declared surface id>",
  "depth_mm": 0.3,
  "method": "text"
}
```

paracraft reads the declaration and evaluates the op's constraints against the declared values. the mesh is still compiled and measured, but the op-specific constraints use the declared dimensions, not mesh-derived ones. this is the studio-to-paracraft handshake.

why not infer? because the same mesh feature can be the result of completely different operations:
- a 0.3 mm wall can be a deliberate design choice or a modelling error.
- a channel can be an engrave, a clearance groove, or a parting line.
- a cylinder can be a wire, a prong, or a through-hole.

a rule that fires on 0.3 mm walls must know whether that 0.3 mm is a raised text stroke (fire `ctr-engrave-001`) or an external wall (fire `ctr-wall-001`). without the declaration, the harness applies the wrong rule or fires both.

## the five operations in version 1

the taxonomy starts with exactly the operations already exercised by the benchmark families. nothing is invented; everything has a benchmark family that tests it.

| op_id | semantic_class | exercised by |
|---|---|---|
| `op-wire` | freestanding_element | feature-ladder wire sub-family |
| `op-stub` | freestanding_element | feature-ladder stub sub-family |
| `op-through_hole` | perforation | feature-ladder hole sub-family |
| `op-emboss` | additive | feature-ladder text sub-family (raised) |
| `op-engrave` | subtractive | engrave-recess benchmark family |

a sixth operation would require both a source-backed evidence trail and a benchmark family that exercises it. neither is created here.

## semantic classes

**freestanding_element**: a body attached at its base and free at its tip. wire and stub differ by aspect ratio: a wire is tall relative to its diameter (filigree, prongs); a stub is roughly as tall as it is wide (stone seats, bosses). both are subject to minimum diameter constraints at the tip; the base attachment invokes clearance rules separately.

**perforation**: a through or blind void that penetrates the body to its full or partial extent. the critical constraints are minimum diameter (investment fill) and depth-to-diameter ratio (fill consistency). evacuation holes in hollow shells are perforations.

**additive**: material raised above an existing surface. raised lettering and milgrain are additive. the neck between the feature and the surface is the critical dimension; the height ceiling is a casting demoulding concern.

**subtractive**: material removed from an existing surface. channel engravings and recessed lettering are subtractive. the remaining wall after the cut is the critical dimension; the depth-to-width ratio governs investment fill.

## verdicts become explainable

without declared ops, the harness reports: `minimum_wall_thickness: 0.28 mm, verdict: warning`. the studio knows only that something is thin. with declared ops, the harness reports: `op-engrave on surface ring-shank-exterior: remaining_wall_mm: 0.28 mm (below 0.35 mm floor, ctr-engrave-002), verdict: warning`. the studio knows exactly which engraving on which surface is the problem.

this is the explainability payoff. constraints applied to specific declared operations produce actionable, located verdicts instead of aggregate geometry flags.

## what this file is not

this file describes the vocabulary contract. it is not engine code. paracraft does not compile operations in this batch; no compiler changes are in scope. the declaration schema (`declaration.schema.json`) is the contract sketch the studio side will implement. the harness picks up op metadata from the manifest `ops` arrays for reporting purposes only; full declared-op evaluation is a future batch.
