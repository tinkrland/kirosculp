// hollow-shell.scad
// benchmark family: hollow shell
// purpose: a hollow pendant at several shell thicknesses, with and without
//   drain holes, to verify shelling and drain rules.
//   profile-001 v0.2.0 (ctr-hollow-001) rejects all hollow geometry as error
//   under the solid-only interim rule; these pieces must therefore produce
//   "fail" verdicts on profile-001. when a partner profile that confirms
//   hollow support replaces the interim rule, the manifest verdict updates.
//
// sourced thresholds:
//   hollow shell wall, formlabs castable wax (src-0015, 2026-09-24): 0.7 mm
//   thick-section shelling trigger (src-0015, 2026-09-24): parts thicker than 4 mm
//   drain hole diameter, materialise silver (src-0001, 2026-09-24): > 1.5 mm
//   drain hole count, materialise silver (src-0001): 2 or more
//   single 3.5 mm hole insufficient (src-0019 gildform, 2026-09-24): empirical
// pendant outer dimensions: value unverified, see rule-digest.

/* [hollow shell parameters] */
// outer pendant dimensions in mm
outer_x = 18;   // value unverified, see rule-digest
outer_y = 24;   // value unverified, see rule-digest
outer_z = 6;    // value unverified, see rule-digest
// shell thickness steps in mm; 0.7 mm is the formlabs floor (src-0015)
shell_steps = [0.5, 0.7, 1.0, 1.5];
// drain hole diameter in mm; > 1.5 mm required by materialise (src-0001)
drain_diameter = 2.0;
// number of drain holes per pendant; materialise requires 2 or more (src-0001)
drain_count = 2;
// spacing between pendant variants along x axis in mm
spacing = 6;   // value unverified, see rule-digest

/* [Hidden] */
// $fn reduced from 48 to 16: the hollow-shell benchmark tests ctr-hollow-001
// detection and shell thickness, not surface smoothness. sphere() at $fn=48
// with 8 variants exceeds the 2-minute per-file compile timeout; $fn=16 keeps
// each compile under 10 seconds while producing the same rule verdicts.
$fn = 16;

module drain_holes(shell_mm) {
    inner_z = outer_z - 2 * shell_mm;
    if (inner_z > 0) {
        // two holes on the top face, separated along y
        for (pos = [-outer_y / 4, outer_y / 4]) {
            translate([0, pos, outer_z - shell_mm - 0.01])
                cylinder(h = shell_mm + 0.02, d = drain_diameter, center = false);
        }
    }
}

module hollow_pendant(shell_mm, with_drain) {
    difference() {
        // outer rounded box (approximated with scaled sphere for pendant shape)
        scale([outer_x / 2, outer_y / 2, outer_z / 2])
            sphere(r = 1);
        // inner cavity
        scale([(outer_x / 2 - shell_mm), (outer_y / 2 - shell_mm), (outer_z / 2 - shell_mm)])
            sphere(r = 1);
        // drain holes if requested
        if (with_drain) drain_holes(shell_mm);
    }
}

// column 1: hollow pendants without drain holes (all fail: hollow + no drain)
for (i = [0 : len(shell_steps) - 1]) {
    translate([(outer_x + spacing) * i, 0, 0])
        hollow_pendant(shell_steps[i], false);
}

// column 2: hollow pendants with drain holes (fail on profile-001 ctr-hollow-001 solid-only rule;
//   expected to pass a future partner profile that lifts the interim rule)
for (i = [0 : len(shell_steps) - 1]) {
    translate([(outer_x + spacing) * i, outer_y + spacing, 0])
        hollow_pendant(shell_steps[i], true);
}
