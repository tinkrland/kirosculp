// wall-ladder.scad
// benchmark family: wall ladder
// purpose: step wall thickness across the plausible minimum range to locate
//   each rule set's actual pass/fail boundary instead of its advertised one.
//   each rung is a hollow band with a defined wall thickness; the outer
//   diameter and height are held constant so only wall thickness varies.
//
// all values derived from sourced rule-digest entries unless noted.
// wall thresholds from:
//   cooksongold design guidelines (src-0010, accessed 2026-09-24): 0.8 mm
//   sculpteo sterling silver page (rule-digest, accessed 2026-09-23):  0.8 mm
//   materialise silver guidelines (src-0001, accessed 2026-09-24):    0.8 mm
//   formlabs castable wax guide (src-0015, accessed 2026-09-24):      0.7 mm hollow shell
//   gildform empirical tests (src-0019, accessed 2026-09-24):         0.5 mm marginal, 0.75 mm pass
// step count and outer diameter: named parameters, value unverified, see rule-digest.

/* [wall ladder parameters] */
// outer diameter of each rung in mm
outer_diameter = 20;   // value unverified, see rule-digest
// height of each rung in mm
rung_height = 4;       // value unverified, see rule-digest
// wall thickness steps in mm; sourced range 0.3 to 1.2 mm covers sub-fail to safe
wall_steps = [0.3, 0.5, 0.7, 0.8, 1.0, 1.2];
// spacing between rungs in mm
spacing = 4;           // value unverified, see rule-digest

/* [Hidden] */
$fn = 64;

module rung(wall_mm) {
    difference() {
        cylinder(h = rung_height, d = outer_diameter, center = false);
        translate([0, 0, -0.01])
            cylinder(
                h = rung_height + 0.02,
                d = outer_diameter - 2 * wall_mm,
                center = false
            );
    }
}

// place rungs side by side along the x axis
for (i = [0 : len(wall_steps) - 1]) {
    translate([(outer_diameter + spacing) * i, 0, 0])
        rung(wall_steps[i]);
}
