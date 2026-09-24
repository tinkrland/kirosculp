// slug helpers
//
// every artifact and collection lives at a human-readable URL like
// /shop/<creator>/<slug>. slugs are derived from the title but can be
// overridden by the creator. they are kept lowercase, ascii-safe, and
// dash-separated so they read well in address bars and seo crawlers.

export function slugify(input) {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// when a creator wants a unique slug suggestion against an existing list.
export function uniqueSlug(base, existing = []) {
  const taken = new Set(existing.filter(Boolean));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
