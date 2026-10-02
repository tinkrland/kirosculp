// Release-bound cart store for platform
// Cart items reference design releases, not artifacts
// Pricing comes from server-side trusted pricing, never client-supplied

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

// Cart items now reference release ID, variant (includes material/size), and quantity
// No client-side pricing - server computes all prices
export function addToCart(releaseId, variant, size = null, listingId) {
  const cart = getCart();
  const sizeKey = size || null;
  const existingIdx = cart.findIndex(
    (item) => item.releaseId === releaseId && item.variant === variant && item.size === sizeKey
  );
  
  if (existingIdx >= 0) {
    cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
  } else {
    cart.push({
      releaseId,
      variant,
      size: sizeKey,
      listingId,
      quantity: 1,
      // Price will be fetched from server via trusted pricing
      serverPrice: null,
      lastPriceCheck: null
    });
  }
  
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function removeFromCart(releaseId, variant, size = null) {
  const sizeKey = size || null;
  const cart = getCart().filter(
    (item) => !(item.releaseId === releaseId && item.variant === variant && item.size === sizeKey)
  );
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function updateQuantity(releaseId, variant, size, quantity) {
  const sizeKey = size || null;
  const cart = getCart().map((item) =>
    item.releaseId === releaseId && item.variant === variant && item.size === sizeKey
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

// Cart total must be fetched from server via trusted pricing
// No client-side price calculations
export async function getCartTotalFromServer(cart) {
  if (cart.length === 0) return 0;
  
  try {
    const response = await fetch('/api/cart/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: cart.map(item => ({
          releaseId: item.releaseId,
          variant: item.variant,
          size: item.size,
          quantity: item.quantity
        }))
      })
    });
    
    if (!response.ok) throw new Error('Failed to fetch pricing');
    
    const { total, itemPrices } = await response.json();
    
    // Update cart with server prices
    const updatedCart = cart.map(item => {
      const serverItem = itemPrices.find(p => 
        p.releaseId === item.releaseId && p.variant === item.variant && (p.size || null) === (item.size || null)
      );
      return serverItem ? {
        ...item,
        serverPrice: serverItem.price,
        lastPriceCheck: Date.now()
      } : item;
    });
    
    saveCart(updatedCart);
    return total;
  } catch (error) {
    console.error('Failed to get cart total from server:', error);
    return null;
  }
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

// Convert cart to release-bound purchase requests
// Conforms to contracts/purchase-request.schema.json
export function cartToPurchaseRequests(cart, buyerId, destination) {
  return cart.map(item => {
    // Parse variant from cart item
    // Cart stores variant as a string like "silver_925" but schema expects {metal, size?, finish?}
    const metal = item.variant; // Assume variant is the metal identifier
    const size = item.size || null;
    
    // Generate client-side request_id as idempotency key per purchase-request.schema.json
    const requestId = crypto.randomUUID();
    
    return {
      request_id: requestId,
      buyer_id: buyerId,
      release_id: item.releaseId,
      listing_id: item.listingId,
      variant: {
        metal: metal,
        size: size,
        finish: null // Future: allow selection in cart
      },
      quantity: item.quantity,
      destination: destination,
      created_at: new Date().toISOString() // Client-generated, server validates
      // No amounts - server computes all pricing per zero-client-amounts contract
    };
  });
}