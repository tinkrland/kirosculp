// wishlist store
//
// localStorage-backed list of artifact ids the buyer wants to come back
// to. kept separate from the cart so buyers can browse and bookmark
// without committing to a checkout. items are full snapshots so the
// wishlist page can render without an extra fetch even if an artifact
// later goes offline.

const KEY = "sculptura_wishlist";

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function isWishlisted(artifactId) {
  return getWishlist().some((w) => w.artifactId === artifactId);
}

export function toggleWishlist(artifact) {
  const list = getWishlist();
  const idx = list.findIndex((w) => w.artifactId === artifact.id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift({
      artifactId: artifact.id,
      artifactName: artifact.name,
      artifactImage: artifact.image_url,
      creatorHandle: artifact.creator_handle,
      creatorName: artifact.creator_name,
      prices: artifact.prices || {},
      addedAt: Date.now(),
    });
  }
  save(list);
  return list;
}

export function removeFromWishlist(artifactId) {
  save(getWishlist().filter((w) => w.artifactId !== artifactId));
}

export function clearWishlist() { save([]); }
