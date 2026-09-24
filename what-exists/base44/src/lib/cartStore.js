// Simple in-memory cart store using localStorage for persistence

const CART_KEY = "sculptura_cart";
const ADDRESS_KEY = "sculptura_saved_address";

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

export function addToCart(artifact, material) {
  const cart = getCart();
  const existingIdx = cart.findIndex(
    (item) => item.artifactId === artifact.id && item.material === material
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
      price: artifact.prices?.[material] || 0,
      quantity: 1,
    });
  }
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function removeFromCart(artifactId, material) {
  const cart = getCart().filter(
    (item) => !(item.artifactId === artifactId && item.material === material)
  );
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function updateQuantity(artifactId, material, quantity) {
  const cart = getCart().map((item) =>
    item.artifactId === artifactId && item.material === material
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