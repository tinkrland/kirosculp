// pin svg builder — teardrop shape ported from the fabnet/wandery pins.
// artist = cherry rose, buyer = thistle. cream disc + dark icon inside.

const SPARKLE_SVG = `<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>`;
const BAG_SVG = `<path d="M6 7h12l1.5 13.5H4.5z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>`;

// hsl(var(--make-color)) / hsl(var(--lib-color)) from the theme, hardcoded for svg use
const KIND_COLORS: Record<string, string> = {
  artist: '#C87088', // make-color 351 40% 60% — dusty cherry
  buyer:  '#A888C4', // lib-color  283 28% 68% — muted thistle
};

function iconFor(kind: string) {
  return kind === 'buyer' ? BAG_SVG : SPARKLE_SVG;
}

export function buildPinSvg(kind: string) {
  const color = KIND_COLORS[kind] ?? '#9D8189';
  const icon = iconFor(kind);
  return `<svg viewBox="0 0 40 54" width="40" height="54" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="52" rx="6" ry="2.5" fill="rgba(0,0,0,0.18)"/>
    <path d="M20 1C9.507 1 1 9.507 1 20C1 33 20 52 20 52C20 52 39 33 39 20C39 9.507 30.493 1 20 1Z" fill="${color}"/>
    <ellipse cx="14" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.18)"/>
    <circle cx="20" cy="20" r="11" fill="#F5EADC"/>
    <g transform="translate(13,13) scale(0.583)" stroke="#3D2018" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none">${icon}</g>
  </svg>`;
}

export function makeIcon(L: any, kind: string) {
  return L.divIcon({ className: '', html: buildPinSvg(kind), iconSize: [40, 54], iconAnchor: [20, 52] });
}
