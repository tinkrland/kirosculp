// symbolic-stress.scad
// benchmark family: symbolic stress
// purpose: a claddagh-like motif and a double-heart base at production scale.
//   thin joined sections are where symbolic designs actually fail.
//   this family checks that the harness catches wall violations in complex
//   geometry where a naive bounding-box check would pass.
//
// geometry is stylised, not a replica of any protected design.
// all dimensions approximate common production jewelry scale.
// base wall and join thickness:
//   wall minimum 0.8 mm from cooksongold (src-0010, 2026-09-24)
//   bridges/connectors minimum 1.0-1.2 mm from jfd jewelry (src-0004, 2026-09-24)
// overall scale: value unverified, see rule-digest.

/* [symbolic stress parameters] */
// base plate thickness in mm; 1.2 mm is within the bridge/connector range (src-0004)
base_thickness = 1.2;
// join width between hearts in mm; tested at limit and below limit
join_width_safe   = 1.0;   // passes ctr-wall-001 (>= 0.8 mm)
join_width_thin   = 0.6;   // triggers ctr-wall-001 warning (< 0.8 mm)
// heart lobe radius in mm; value unverified, see rule-digest
heart_r = 5;
// spacing between the two test variants in mm
spacing = 6;   // value unverified, see rule-digest

/* [Hidden] */
$fn = 64;

// single heart silhouette: hull of two circles (upper lobes) and a point
// (lower tip). hull() guarantees a convex result with no internal coincident
// edges, avoiding the non-manifold t-junctions that a union of overlapping
// circles and a polygon produces in openscad 2021.01.
module heart_2d(r) {
    offset = r * 0.5;
    hull() {
        translate([-offset, r * 0.2]) circle(r = r);
        translate([ offset, r * 0.2]) circle(r = r);
        // lower tip: tiny circle so hull() produces the pointed bottom
        translate([0, -r * 1.6]) circle(r = r * 0.05);
    }
}

// double heart: two hearts joined at the midline by a bridge of width join_mm
// bridge_overlap: small epsilon so the bridge cube intersects the heart bodies
// rather than touching them face-to-face. touching (coincident) faces in a
// union produce non-manifold output in openscad 2021.01; an epsilon overlap
// ensures the boolean merges cleanly.
module double_heart(join_mm) {
    sep = heart_r * 2.2;
    bridge_len = sep - 2 * heart_r + 2;
    bridge_overlap = 0.1;  // epsilon overlap into each heart body
    union() {
        translate([-sep / 2, 0, 0]) linear_extrude(height = base_thickness)
            heart_2d(heart_r);
        translate([ sep / 2, 0, 0]) linear_extrude(height = base_thickness)
            heart_2d(heart_r);
        // the join bridge extends bridge_overlap into each heart to avoid
        // coincident-face non-manifold issues in the boolean union
        translate([-(bridge_len / 2 + bridge_overlap), -join_mm / 2, 0])
            cube([bridge_len + 2 * bridge_overlap, join_mm, base_thickness]);
    }
}

// claddagh-like: a crown over two hands cradling a heart
// stylised only; no brand reproduction. thin crown tines are the stress point.
module claddagh_like() {
    // central heart
    linear_extrude(height = base_thickness)
        heart_2d(heart_r * 0.7);
    // left hand (simplified arc)
    translate([-heart_r * 2, 0, 0])
        linear_extrude(height = base_thickness)
            difference() {
                circle(r = heart_r);
                circle(r = heart_r - 0.9);  // 0.9 mm wall; above 0.8 mm threshold
            }
    // right hand
    translate([ heart_r * 2, 0, 0])
        linear_extrude(height = base_thickness)
            difference() {
                circle(r = heart_r);
                circle(r = heart_r - 0.9);
            }
    // crown tines: three prongs; tine width 0.7 mm tests below the 0.8 mm wall threshold
    for (x = [-heart_r * 0.8, 0, heart_r * 0.8]) {
        translate([x, heart_r * 1.2, 0])
            cube([0.7, heart_r * 0.8, base_thickness], center = true);
    }
}

// variant 1: safe join (>= 0.8 mm) - passes ctr-wall-001
translate([0, 0, 0])
    double_heart(join_width_safe);

// variant 2: thin join (< 0.8 mm) - warns ctr-wall-001
translate([heart_r * 5 + spacing, 0, 0])
    double_heart(join_width_thin);

// variant 3: claddagh-like motif - crown tines at 0.7 mm trigger wall warning
translate([0, heart_r * 6 + spacing, 0])
    claddagh_like();
