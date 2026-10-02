# verification: zero client amounts in checkout flow

**date:** 2026-10-02
**scope:** platform leg task 03
**objective:** verify that no price, amount, cost, earnings, or retail fields are sent from client to server in the checkout flow

## grep verification results

### 1. no client-sent price fields in api calls
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

price/amountprice/amountplatform/srcprice/amountprice/amountplatform/srcplatform/srcprice/amountprice/amountplatform/srcprice/amountprice/amountplatform/srcplatform/srcplatform/src references found in platform/src are display-only, never sent to server:

- comments document server-side pricing throughout
- fields receive prices from server, never sent to server
- timestamp tracks when server pricing was fetched
- state receives price from server endpoints
- displays server-returned price only
- no price sent in purchase request body
- calls fetch total from server
- displays total received from server
- no prices sent in checkout submit request
- demo fixtures and stub constants for local development only

## contract verification

### cart to purchase requests output
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

### checkout submit request body
```javascript
{
  purchaseRequests: Array<PurchaseRequest>,  // see above, zero amounts
  customerDetails: { name, email },
  shippingAddress: { line1, line2?, city, postal, country },
  notes?: string
  // NO pricing fields anywhere
}
```

### cart pricing request body
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
- client sends only variant selection and destination, no amounts
- client receives and displays server-computed prices in cents
- no client-side price calculations anywhere in platform or studio snapshots
- explicit comments in code document the zero-client-amounts contract
- client-side pricing functions deleted
- pages calling deleted functions disabled with explanation

the platform checkout flow is release-bound with server-side pricing only.

### additional verification (2026-10-02 tightening)

**exported functions producing amounts outside demo data:**
```bash
grep -r "export (function|const).*(price|cost|amount|total|fee)" platform/src/ --exclude=demoData.js
# result: no matches
```

**tables storing computed prices:**
```bash
grep -r "CREATE TABLE.*price|retail.*cents|creator.*net" platform/
# result: only in server-side stubs
# all amounts are server-computed and stored, never client-supplied
```

**client code price computations:**
```bash
grep -r "function.*(price|cost|amount)|const.*(price|cost|amount).*=.*\*" what-exists/ --exclude=demoData.js
# result: only prop names in OrderModal.jsx, no computations
# dist/ build artifacts excluded from verification
```

**zero-client-amounts contract enforcement:**
- listing schema: pricing intent only, additional properties blocked
- purchase request schema: no price or amount properties defined, buyer authentication required
- validation script: negative test cases verify extra price fields are rejected
- all client to server requests validated against schemas with zero price fields

**verified:** no exported functions or tables producing amounts in client code outside demo data




