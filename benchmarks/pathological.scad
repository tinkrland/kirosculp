// pathological.scad
// benchmark family: pathological cases
// purpose: pieces that must fail, to prove the harness catches them rather
//   than passing everything. a rule set that produces unexpected verdicts on
//   this set is wrong, not the pieces.
//
// cases:
//   p-001: disconnected components (two cubes, no bridge) - fails ctr-clear-001
//          if gap < 0.3 mm; also tests component counting
//   p-002: near-tangent union (two spheres just touching) - near-zero clearance
//   p-003: trapped volume (cube inside a larger cube, no evacuation) - fails ctr-nested-001
//   p-004: degenerate sub-1mm wall sliver - fails ctr-wall-001
//   p-005: wall at exactly the 0.8 mm threshold - must pass (boundary check)
//
// clearance threshold 0.3 mm from materialise silver (src-0001, 2026-09-24)
// nesting prohibition from materialise (src-0001): nested objects not supported
// wall minimum 0.8 mm from cooksongold/sculpteo/materialise (src-0010, src-0001, 2026-09-24)

/* [pathological parameters] */
// p-001: gap between the two disconnected cubes in mm
// gap_below_threshold < 0.3 mm triggers ctr-clear-001 warning
gap_below_threshold = 0.1;   // sourced: 0.3 mm threshold (src-0001); this is below it
gap_above_threshold = 0.4;   // sourced: passes the 0.3 mm threshold
cube_size = 5;   // value unverified, see rule-digest
// p-003: outer and inner cube for the trapped-volume case
outer_cube = 8;   // value unverified, see rule-digest
inner_cube = 4;   // value unverified, see rule-digest
inner_offset = 2; // value unverified, see rule-digest (centers inner cube inside outer)
// p-004/p-005: slab dimensions for wall-thickness boundary test
slab_x = 10;   // value unverified, see rule-digest
slab_y = 10;   // value unverified, see rule-digest

/* [Hidden] */
$fn = 48;

// p-001a: two cubes with a gap below the clearance threshold (should warn)
module p001a() {
    cube([cube_size, cube_size, cube_size]);
    translate([cube_size + gap_below_threshold, 0, 0])
        cube([cube_size, cube_size, cube_size]);
}

// p-001b: two cubes with a gap above the clearance threshold (should pass)
module p001b() {
    cube([cube_size, cube_size, cube_size]);
    translate([cube_size + gap_above_threshold, 0, 0])
        cube([cube_size, cube_size, cube_size]);
}

// p-002: near-tangent union - two spheres touching at a point
module p002() {
    r = 4;  // value unverified, see rule-digest
    sphere(r = r);
    translate([2 * r, 0, 0]) sphere(r = r);
}

// p-003: trapped volume - inner cube fully inside outer cube, manifold violation
// this is a shell with a sealed inner cavity; harness must detect nested components
module p003() {
    difference() {
        cube([outer_cube, outer_cube, outer_cube]);
        // 1 mm walls on all sides
        translate([1, 1, 1])
            cube([outer_cube - 2, outer_cube - 2, outer_cube - 2]);
    }
    // the inner body is re-added as a separate component to simulate nesting
    // note: in real geometry this is a manifold error; here it tests the harness
    translate([inner_offset, inner_offset, inner_offset])
        cube([inner_cube, inner_cube, inner_cube]);
}

// p-004: sub-minimum wall sliver; 0.3 mm wall is below the 0.8 mm threshold
module p004() {
    difference() {
        cube([slab_x, slab_y, 0.3]);
        // open top to create a shell; not needed here; slab itself is the thin wall
    }
    cube([slab_x, slab_y, 0.3]);
}

// p-005: wall at exactly the 0.8 mm threshold (boundary value; must pass)
module p005() {
    difference() {
        cylinder(h = 4, d = 12, center = false);
        translate([0, 0, -0.01])
            cylinder(h = 4.02, d = 12 - 2 * 0.8, center = false);
    }
}

// layout: each case in a separate x/y region
translate([  0,  0, 0]) p001a();
translate([ 20,  0, 0]) p001b();
translate([ 40,  0, 0]) p002();
translate([  0, 20, 0]) p003();
translate([ 20, 20, 0]) p004();
translate([ 40, 20, 0]) p005();
