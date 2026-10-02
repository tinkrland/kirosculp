// Wishlist / save-for-later store (studio-side)
// Stores artifact ids the user has bookmarked, persisted to localStorage.
// This is a discovery aid, not a commerce feature; no prices are stored here.

const KEY = "sculptura_wishlist";

export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToWishlist(artifactId) {
  const list = getWishlist();
  if (!list.includes(artifactId)) {
    list.push(artifactId);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("wishlist-updated"));
  }
}

export function removeFromWishlist(artifactId) {
  const list = getWishlist().filter((id) => id !== artifactId);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function isInWishlist(artifactId) {
  return getWishlist().includes(artifactId);
}

export function isWishlisted(artifactId) {
  return isInWishlist(artifactId);
}

export function toggleWishlist(artifactId) {
  if (isInWishlist(artifactId)) {
    removeFromWishlist(artifactId);
  } else {
    addToWishlist(artifactId);
  }
}
