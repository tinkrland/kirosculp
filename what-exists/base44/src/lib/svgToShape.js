/**
 * svgToShape.js
 * Converts an SVG file's first path (or compound paths) into a THREE.Shape
 * so it can be extruded into 3D jewelry geometry.
 *
 * Why custom: three.js SVGLoader requires a separate import that isn't always
 * available; this lightweight parser handles common path commands (M, L, C, Q, Z, H, V)
 * which covers 95% of simple logo / icon SVGs used as pendant silhouettes.
 */

// ── normalise a raw "d" attribute string into command tokens ─────────────────
function parseDAttr(d) {
  // Inject spaces around command letters then split
  const tokens = d
    .replace(/([MmZzLlHhVvCcSsQqTtAa])/g, " $1 ")
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  return tokens;
}

// ── convert a path "d" string to a THREE.Shape ───────────────────────────────
export function pathDToShape(THREE, d, scale = 1) {
  const shape = new THREE.Shape();
  const tokens = parseDAttr(d);
  let i = 0;
  let cx = 0, cy = 0;   // current position
  let lastCmd = "";

  const n = () => parseFloat(tokens[i++]) * scale;

  while (i < tokens.length) {
    const cmd = tokens[i++];
    lastCmd = cmd;

    switch (cmd) {
      case "M": { cx = n(); cy = -n(); shape.moveTo(cx, cy); break; }
      case "m": { cx += n(); cy -= n(); shape.moveTo(cx, cy); break; }
      case "L": { cx = n(); cy = -n(); shape.lineTo(cx, cy); break; }
      case "l": { cx += n(); cy -= n(); shape.lineTo(cx, cy); break; }
      case "H": { cx = n(); shape.lineTo(cx, cy); break; }
      case "h": { cx += n(); shape.lineTo(cx, cy); break; }
      case "V": { cy = -n(); shape.lineTo(cx, cy); break; }
      case "v": { cy -= n(); shape.lineTo(cx, cy); break; }
      case "C": {
        const x1=n(), y1=-n(), x2=n(), y2=-n();
        cx=n(); cy=-n();
        shape.bezierCurveTo(x1, y1, x2, y2, cx, cy);
        break;
      }
      case "c": {
        const x1=cx+n(), y1=cy-n(), x2=cx+n(), y2=cy-n();
        cx+=n(); cy-=n();
        shape.bezierCurveTo(x1, y1, x2, y2, cx, cy);
        break;
      }
      case "Q": {
        const x1=n(), y1=-n();
        cx=n(); cy=-n();
        shape.quadraticCurveTo(x1, y1, cx, cy);
        break;
      }
      case "q": {
        const x1=cx+n(), y1=cy-n();
        cx+=n(); cy-=n();
        shape.quadraticCurveTo(x1, y1, cx, cy);
        break;
      }
      case "Z":
      case "z": shape.closePath(); break;
      default:
        // unknown token — skip
        break;
    }
  }
  return shape;
}

// ── extract all <path d="..."> from SVG text ─────────────────────────────────
export function extractPathsFromSVG(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const pathEls = Array.from(doc.querySelectorAll("path, polygon, polyline, rect, circle, ellipse"));
  const dAttrs = [];

  for (const el of pathEls) {
    if (el.tagName === "path") {
      const d = el.getAttribute("d");
      if (d) dAttrs.push(d);
    } else if (el.tagName === "rect") {
      const x = parseFloat(el.getAttribute("x") || 0);
      const y = parseFloat(el.getAttribute("y") || 0);
      const w = parseFloat(el.getAttribute("width") || 0);
      const h = parseFloat(el.getAttribute("height") || 0);
      dAttrs.push(`M ${x} ${y} H ${x+w} V ${y+h} H ${x} Z`);
    } else if (el.tagName === "circle") {
      // approximate circle with cubic bezier
      const cx = parseFloat(el.getAttribute("cx") || 0);
      const cy = parseFloat(el.getAttribute("cy") || 0);
      const r  = parseFloat(el.getAttribute("r")  || 0);
      const k  = r * 0.5523;
      dAttrs.push(
        `M ${cx} ${cy-r} C ${cx+k} ${cy-r} ${cx+r} ${cy-k} ${cx+r} ${cy} ` +
        `C ${cx+r} ${cy+k} ${cx+k} ${cy+r} ${cx} ${cy+r} ` +
        `C ${cx-k} ${cy+r} ${cx-r} ${cy+k} ${cx-r} ${cy} ` +
        `C ${cx-r} ${cy-k} ${cx-k} ${cy-r} ${cx} ${cy-r} Z`
      );
    }
  }

  // also grab viewBox for normalisation
  const svg = doc.querySelector("svg");
  const vb = svg?.getAttribute("viewBox")?.split(/[\s,]+/).map(Number) ?? [0, 0, 100, 100];
  return { dAttrs, viewBox: vb };
}

// ── top-level: SVG data URL / text → THREE.Shape (normalised to ±0.5 units) ──
export function svgToThreeShape(THREE, svgDataUrlOrText) {
  let text = svgDataUrlOrText;
  if (svgDataUrlOrText.startsWith("data:")) {
    // decode base64 or plain data URL
    const comma = svgDataUrlOrText.indexOf(",");
    const isB64 = svgDataUrlOrText.slice(0, comma).includes("base64");
    text = isB64
      ? atob(svgDataUrlOrText.slice(comma + 1))
      : decodeURIComponent(svgDataUrlOrText.slice(comma + 1));
  }

  const { dAttrs, viewBox } = extractPathsFromSVG(text);
  if (!dAttrs.length) return null;

  const vbW = viewBox[2] || 100;
  const vbH = viewBox[3] || 100;
  const scale = 1 / Math.max(vbW, vbH); // normalise to ~1 unit

  // use only the first path for the primary shape
  return pathDToShape(THREE, dAttrs[0], scale);
}