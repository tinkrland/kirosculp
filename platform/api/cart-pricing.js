// POST /api/cart/pricing
//
// Server-side cart pricing endpoint. Client sends cart items with release IDs
// and variants (no amounts), server returns trusted pricing from operations.
//
// This is a contract stub documenting the expected behavior. Actual implementation
// will be in supabase edge functions or equivalent server runtime.

/**
 * Request body schema:
 * {
 *   items: Array<{
 *     releaseId: uuid,
 *     variant: string (metal),
 *     size: string | null,
 *     quantity: number
 *   }>
 * }
 * 
 * NO PRICE FIELDS FROM CLIENT.
 * 
 * Response schema:
 * {
 *   total: number,  // total in cents (operations computes)
 *   itemPrices: Array<{
 *     releaseId: uuid,
 *     variant: string,
 *     size: string | null,
 *     price: number  // unit price in cents
 *   }>
 * }
 */

export async function handleCartPricing(req) {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return errorResponse(400, 'Invalid request: items array required');
  }

  // Validate all releases exist and are castability-passed
  for (const item of items) {
    const release = await fetchRelease(item.releaseId);
    if (!release || !release.castability.passed) {
      return errorResponse(400, `Invalid release: ${item.releaseId}`);
    }

    // Validate variant
    if (!release.metals_offered.includes(item.variant)) {
      return errorResponse(400, `Metal ${item.variant} not offered`);
    }

    if (item.size && release.sizing.size_type !== 'unisize') {
      if (!release.sizing.sizes_offered.includes(item.size)) {
        return errorResponse(400, `Size ${item.size} not offered`);
      }
    }
  }

  // Call operations pricing for cart items
  // This is a preview pricing call - no order creation yet
  const pricingResponse = await callOperationsPricingPreview({
    items: items.map(item => ({
      releaseId: item.releaseId,
      metal: item.variant,
      size: item.size,
      quantity: item.quantity
    }))
  });

  if (!pricingResponse.ok) {
    return errorResponse(503, 'Pricing service unavailable');
  }

  const { itemPrices, total } = pricingResponse;

  return successResponse({
    total,
    itemPrices: itemPrices.map((price, i) => ({
      releaseId: items[i].releaseId,
      variant: items[i].variant,
      size: items[i].size,
      price: price.retail_cents  // Server-computed unit price in cents
    }))
  });
}

// Stub functions
async function fetchRelease(releaseId) {
  throw new Error('Not implemented: fetchRelease');
}

async function callOperationsPricingPreview(params) {
  // Call operations pricing service for cart preview
  // Returns retail prices based on listing pricing_intent + manufacturing costs
  throw new Error('Not implemented: callOperationsPricingPreview');
}

function errorResponse(status, message) {
  return { status, body: { error: message } };
}

function successResponse(data) {
  return { status: 200, body: data };
}

/**
 * CRITICAL VERIFICATION POINTS:
 * 
 * 1. NO CLIENT AMOUNTS: Request contains only releaseId, variant, size, quantity.
 *    Zero price fields from client.
 * 
 * 2. SERVER COMPUTES ALL PRICING: Every price returned comes from
 *    callOperationsPricingPreview, never client-side calculation.
 * 
 * 3. RELEASE VALIDATION: All releases validated for existence and castability
 *    before pricing lookup.
 */
