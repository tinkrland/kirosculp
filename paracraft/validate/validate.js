// validate(measurements, profile): apply a versioned manufacturing profile to
// a measurement report and return structured findings. per the server release
// gate, a check that cannot be made reliably returns an explicit unmeasured
// finding and blocks a passed=true outcome. never a bare boolean.

const SEVERITY_STATUS = { error: "failed", warning: "warning", informational: "info" };

function measuredProperty(property, m) {
  switch (property) {
    case "mesh_manifoldness":
      return { value: m.topology.manifold, method: m.topology.method };
    case "nested_components":
      return { value: m.nested_components.count, method: m.nested_components.method };
    case "minimum_wall_thickness":
      if (m.wall_thickness.min_mm === null) {
        return { unmeasured: "no opposing surface found for any face", method: m.wall_thickness.method };
      }
      return { value: m.wall_thickness.min_mm, method: m.wall_thickness.method };
    case "minimum_clearance":
      if (m.components.count < 2) {
        return { value: null, note: "single component, no clearances to check", method: m.clearance.method };
      }
      if (m.clearance.min_mm === null) {
        return { unmeasured: "no clearance value available", method: m.clearance.method };
      }
      return { value: m.clearance.min_mm, method: m.clearance.method };
    case "bounding_box":
      return { value: m.bounding_box.extents, method: "vertex_min_max" };
    case "hollow_parts":
      return { value: m.hollow_parts.detected, method: m.hollow_parts.method };
    default:
      return null; // not part of the five ready measurements
  }
}

function violates(operator, measured, threshold) {
  switch (operator) {
    case ">=": return measured < threshold;
    case "<=": return measured > threshold;
    case "==": return measured !== threshold;
    case "!=": return measured === threshold;
    default: return true; // unknown operator is a failure, not a pass
  }
}

function compareFinding(constraint, m, measured, profile) {
  const { operator, value: threshold, severity, constraint_id, property } = constraint;
  // bounding box: object threshold per axis
  if (property === "bounding_box" && threshold && typeof threshold === "object") {
    const [dx, dy, dz] = measured;
    const over = dx > threshold.x || dy > threshold.y || dz > threshold.z;
    return {
      constraint_id,
      property,
      severity,
      status: over ? SEVERITY_STATUS[severity] : "passed",
      measured: { x: dx, y: dy, z: dz },
      threshold,
      operator: "<=",
      evidence: constraint.evidence,
      method: "vertex_min_max",
      profile_version: profile.version,
    };
  }
  const violated = violates(operator, measured, threshold);
  return {
    constraint_id,
    property,
    severity,
    status: violated ? SEVERITY_STATUS[severity] : "passed",
    measured,
    threshold,
    operator,
    evidence: constraint.evidence,
    profile_version: profile.version,
  };
}

export function validate(measurements, profile) {
  const findings = [];
  for (const constraint of profile.constraints ?? []) {
    const source = measuredProperty(constraint.property, measurements);
    if (source === null) {
      findings.push({
        constraint_id: constraint.constraint_id,
        property: constraint.property,
        severity: constraint.severity,
        status: "unmeasured",
        reason: "measurement not implemented in the five-measurement scope",
        evidence: constraint.evidence,
        profile_version: profile.version,
      });
      continue;
    }
    if (source.unmeasured) {
      findings.push({
        constraint_id: constraint.constraint_id,
        property: constraint.property,
        severity: constraint.severity,
        status: "unmeasured",
        reason: source.unmeasured,
        method: source.method,
        evidence: constraint.evidence,
        profile_version: profile.version,
      });
      continue;
    }
    if (source.value === null && source.note) {
      // vacuously satisfied, e.g. clearance with a single component
      findings.push({
        constraint_id: constraint.constraint_id,
        property: constraint.property,
        severity: constraint.severity,
        status: "passed",
        note: source.note,
        method: source.method,
        evidence: constraint.evidence,
        profile_version: profile.version,
      });
      continue;
    }
    const finding = compareFinding(constraint, measurements, source.value, profile);
    if (source.note) finding.note = source.note;
    finding.method = source.method;
    findings.push(finding);
  }

  const hasFailed = findings.some((f) => f.status === "failed");
  const hasUnmeasured = findings.some((f) => f.status === "unmeasured");
  const hasWarning = findings.some((f) => f.status === "warning");
  const status = hasFailed ? "invalid"
    : hasUnmeasured ? "manual_review"
      : hasWarning ? "warning"
        : "valid";
  return {
    status,
    passed: status === "valid" || status === "warning",
    profile_id: profile.profile_id,
    profile_version: profile.version,
    findings,
  };
}
