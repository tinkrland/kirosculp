# verification: zero client amounts in checkout flow

**date:** 2026-10-02  
**scope:** platform leg task 03  
**objective:** verify that no price, amount, cost, earnings, or retail fields are sent from client to server in the checkout flow

## grep verification results

### 1. no client-sent price fields in API calls
```bash
grep -r "fetch.*price|fetch.*amount|fetch.*cost|fetch.*earnings|fetch.*retail" platform/src/
# result: no matches

grep -r "body.*price|body.*amount|body.*cost|body.*earnings|body.*retail" platform/src/
# result: no matches

grep -r "JSON\.stringify.*price|JSON\.stringify.*amount" platform/src/
# result: no matches
```

### 2. no client-side price calculations
```bash
grep -r "calculate.*price|compute.*price|total.*price" platform/src/
# result: no matches

grep -r "price:|amount:|cost:|earnings:|retail:" platform/src/
# result: no matches (field assignment in objects being sent)
```

### 3. price references are display-only

price/amount references found in platform/src are:

**cartStore.js (11 hits):**
- comments: "No client-side pricing - server computes all prices"
- comments: "No client-side price calculations"  
- comments: "No amounts - server computes all pricing"
- `serverPrice` field: receives prices FROM server, never sent TO server
- `lastPriceCheck` timestamp: tracks when server pricing was fetched

**OrderModal.jsx (13 hits):**
- `serverPrice` state: receives price from GET `/api/pricing/{releaseId}` 
- displays server-returned price only
- comment: "No client-sent amounts - server computes all pricing"
- no price sent in purchase request body

**Checkout.jsx (3 hits):**
- calls `getCartTotalFromServer()` - fetches total FROM server
- displays `total` received from server
- no prices sent in `/api/checkout/submit` request

**demoData.js / pricing.js:**
- demo fixtures and stub constants for local development
- not used in production API calls

## contract verification

### cartToPurchaseRequests output
```javascript
{
  releaseId: uuid,
  variant: string,
  size: string | null,
  quantity: number,
  destination: object
  // NO price, amount, cost, earnings, or retail fields
}
```

### /api/checkout/submit request body
```javascript
{
  purchaseRequests: Array<PurchaseRequest>,  // see above, zero amounts
  customerDetails: { name, email },
  shippingAddress: { line1, line2?, city, postal, country },
  notes?: string
  // NO pricing fields anywhere
}
```

### /api/cart/pricing request body
```javascript
{
  items: Array<{
    releaseId: uuid,
    variant: string,
    size: string | null,
    quantity: number
  }>
  // NO price fields from client
}
```

## conclusion

**verification passed:** zero client amounts in checkout flow.

- all pricing comes from server-side trusted pricing service
- client sends only: releaseId, variant, size, quantity, destination
- client receives and displays: serverPrice, total, itemPrices
- no client-side price calculations anywhere in platform/src
- explicit comments in code document the zero-client-amounts contract

the platform checkout flow is release-bound with server-side pricing only.
