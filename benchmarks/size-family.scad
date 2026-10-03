// size-family.scad
// benchmark family: size family
// purpose: one ring profile across the full us ring-size range to expose
//   how tolerance and proportion constraints move with size.
//   the harness checks that wall thickness, bounding box, and volume scale
//   deterministically with size and that no size produces unexpected violations.
//
// us ring size to inner diameter mapping (iso 8653 / jewellers of america):
//   size 3  -> 14.05 mm inner diameter
//   size 6  -> 16.51 mm inner diameter
//   size 9  -> 18.89 mm inner diameter
//   size 12 -> 21.26 mm inner diameter
// source: jewelers of america ring size chart (value unverified, see rule-digest;
//   a direct partner answer replaces these nominal diameters in the active profile.)
// wall thickness 1.0 mm from materialise ring band rule (src-0001, 2026-09-24)
// band height: value unverified, see rule-digest.

/* [ring size family parameters] */
// list of [us_size, inner_diameter_mm] pairs
// inner diameters nominally from jewellers of america chart; value unverified, see rule-digest
ring_sizes = [
    [3,  14.05],
    [4,  14.86],
    [5,  15.70],
    [6,  16.51],
    [7,  17.35],
    [8,  18.19],
    [9,  18.89],
    [10, 19.76],
    [11, 20.60],
    [12, 21.26],
    [13, 22.10]
];
// wall thickness in mm; 1.0 mm from materialise ring band minimum (src-0001, 2026-09-24)
wall_mm = 1.0;
// band height in mm; value unverified, see rule-digest
band_height = 4;   // value unverified, see rule-digest
// spacing between rings along the x axis in mm
spacing = 5;   // value unverified, see rule-digest

/* [Hidden] */
$fn = 128;

module ring_band(inner_d, wall, height) {
    outer_d = inner_d + 2 * wall;
    difference() {
        cylinder(h = height, d = outer_d, center = false);
        translate([0, 0, -0.01])
            cylinder(h = height + 0.02, d = inner_d, center = false);
    }
}

// place rings side by side; step size is the largest outer diameter + spacing
// so the harness can address each ring by index without overlap.
// actual bounding boxes are computed post-compile from the exported mesh.
for (i = [0 : len(ring_sizes) - 1]) {
    inner_d = ring_sizes[i][1];
    translate([(ring_sizes[len(ring_sizes)-1][1] + 2 * wall_mm + spacing) * i, 0, 0])
        ring_band(inner_d, wall_mm, band_height);
}
