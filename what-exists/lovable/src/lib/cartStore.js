// Simple in-memory cart store using localStorage for persistence.
// Items are keyed by (artifactId, material, size) so the same design can
// sit in the queue multiple times in different sizes / metals.

const CART_KEY = "sculptura_cart";
const ADDRESS_KEY = "sculptura_saved_address";

const sizeKey = (s) => s ?? "";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(artifact, material, size = null) {
  const cart = getCart();
  const surcharge = Number((artifact.size_surcharges || {})[size] || 0);
  const basePrice = Number(artifact.prices?.[material] || 0);
  const unitPrice = basePrice + surcharge;

  const existingIdx = cart.findIndex(
    (item) => item.artifactId === artifact.id && item.material === material && sizeKey(item.size) === sizeKey(size)
  );
  if (existingIdx >= 0) {
    cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
  } else {
    cart.push({
      artifactId: artifact.id,
      artifactName: artifact.name,
      artifactImage: artifact.image_url,
      creatorHandle: artifact.creator_handle,
      material,
      size: size || null,
      price: unitPrice,
      quantity: 1,
    });
  }
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function removeFromCart(artifactId, material, size = null) {
  const cart = getCart().filter(
    (item) => !(item.artifactId === artifactId && item.material === material && sizeKey(item.size) === sizeKey(size))
  );
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function updateQuantity(artifactId, material, size, quantity) {
  const cart = getCart().map((item) =>
    item.artifactId === artifactId && item.material === material && sizeKey(item.size) === sizeKey(size)
      ? { ...item, quantity }
      : item
  );
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function clearCart() {
  saveCart([]);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
}

export function getSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAddress(address) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
}
