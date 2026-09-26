// gateway-adapter.js
//
// the single payment-gateway boundary. the platform talks to money
// exclusively through this interface, so swapping the sandbox provider for
// localstripe (stripe-shaped, used in the order-flow prototype) and later
// real stripe is a constructor argument, not a rewrite.
//
// providers implement: createIntent, capture, refund, cancel.

export function makeGateway({ provider = 'sandbox', baseUrl, apiKey }) {
  if (provider === 'localstripe') {
    const key = apiKey || 'sk_test_123';
    const root = baseUrl || 'http://localhost:4242';
    const call = async (path, form) => {
      const res = await fetch(root + path, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(form).toString(),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(`gateway ${path}: ${json?.error?.message || res.status}`);
      return json;
    };
    return {
      provider: 'localstripe',
      // authorize and hold: manual capture means funds sit in requires_capture
      async createIntent({ amountCents, currency, paymentMethod = 'pm_card_visa' }) {
        return call('/v1/payment_intents', {
          amount: amountCents, currency, capture_method: 'manual',
          payment_method: paymentMethod, confirm: 'true',
        });
      },
      async capture(intentId) {
        return call(`/v1/payment_intents/${intentId}/capture`, {});
      },
      async refund(intentId, amountCents) {
        return call('/v1/refunds', { payment_intent: intentId, ...(amountCents ? { amount: amountCents } : {}) });
      },
      async cancel(intentId) {
        return call(`/v1/payment_intents/${intentId}/cancel`, {});
      },
    };
  }

  // sandbox: pure simulation, no external service. used by the commission
  // lifecycle simulation; the intent id is only a marker.
  let n = 0;
  return {
    provider: 'sandbox',
    async createIntent({ amountCents }) { return { id: `sbx_${++n}_${amountCents}`, status: 'requires_capture' }; },
    async capture(intentId) { return { id: intentId, status: 'succeeded' }; },
    async refund(intentId) { return { id: `re_${intentId}`, status: 'succeeded' }; },
    async cancel(intentId) { return { id: intentId, status: 'canceled' }; },
  };
}
