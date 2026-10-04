// size-family.scad
// benchmark family: size family
// purpose: one ring profile across the full us ring-size range to expose
//   how tolerance and proportion constraints move with size.
//   the harness checks that wall thickness, bounding box, and volume scale
//   deterministically with size and that no size produces unexpected violations.
//
// us ring size to inner diameter mapping (gia 4cs ring size chart, src-0023,
// accessed 2026-10-04):
//   size 3  -> 14.10 mm inner diameter
//   size 6  -> 16.50 mm inner diameter
//   size 9  -> 19.00 mm inner diameter
//   size 12 -> 21.40 mm inner diameter
// gia rounds to one decimal; a second chart source is desirable before these
//   diameters are treated as tight tolerances (see rule-digest gia section).
// wall thickness 1.0 mm from materialise ring band rule (src-0001, 2026-09-24)
// band height: value unverified, see rule-digest.

/* [ring size family parameters] */
// list of [us_size, inner_diameter_mm] pairs
// inner diameters from the gia 4cs ring size chart (src-0023, 2026-10-04)
ring_sizes = [
    [3,  14.10],
    [4,  14.90],
    [5,  15.70],
    [6,  16.50],
    [7,  17.30],
    [8,  18.10],
    [9,  19.00],
    [10, 19.80],
    [11, 20.60],
    [12, 21.40],
    [13, 22.20]
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
