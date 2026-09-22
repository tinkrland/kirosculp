/**
 * manufacturer-adapter.js
 *
 * one interface, one adapter per partner. mirrors the pattern already used for
 * src/lib/db.js: the engine never talks to a vendor sdk directly, it talks to
 * this shape. swapping or dropping a manufacturer means writing one adapter
 * file, not touching the pipeline.
 *
 * pipeline this plugs into (agents.md section 7):
 *   parameters -> scad generation -> openscad compile -> mesh
 *                                  -> export (stl / 3mf) -> [this file] -> manufacturer
 *
 * every adapter must implement all five methods. none of them may invent
 * data -- if a vendor doesn't expose a field, return null and let the caller
 * decide, don't guess a number.
 */

/**
 * @typedef {Object} QuoteRequest
 * @property {string} meshUrl        signed url to the exported stl/3mf
 * @property {string} process        e.g. "lost_wax_casting"
 * @property {string} material       e.g. "silver_925", "gold_14k_yellow"
 * @property {number} quantity
 * @property {string} unit           "mm" | "cm" | "in"
 */

/**
 * @typedef {Object} Quote
 * @property {string} quoteId
 * @property {number} price
 * @property {string} currency
 * @property {number} estimatedTurnaroundDays
 * @property {Object} raw            unmodified vendor response, kept for audit
 */

/**
 * @typedef {Object} OrderResult
 * @property {string} orderId
 * @property {string} trackingUrl
 * @property {string} status
 */

class ManufacturerAdapter {
  /** @returns {Promise<{designId: string}>} */
  async upload(_meshBuffer, _filename) { throw new Error("not implemented"); }

  /** @param {QuoteRequest} _req @returns {Promise<Quote>} */
  async quote(_req) { throw new Error("not implemented"); }

  /** @returns {Promise<OrderResult>} */
  async order(_quoteId, _shippingAddress, _notificationUrl) { throw new Error("not implemented"); }

  /** parses an inbound webhook payload into a normalized status. */
  parseStatusWebhook(_payload) { throw new Error("not implemented"); }

  /** capability introspection, read from manufacturer-capabilities.json, not hardcoded. */
  getCapabilities() { throw new Error("not implemented"); }
}

/**
 * sculpteo adapter.
 *
 * endpoints below are from sculpteo's own public webapi docs (developer.sculpteo.com,
 * retrieved 2026-09-11). the order endpoint requires sculpteo to manually enable
 * invoice-payment on the account before it will accept a real order -- there is no
 * fully self-serve path yet as of that date. reverify before relying on this.
 */
class SculpteoAdapter extends ManufacturerAdapter {
  constructor({ apiKey, notificationUrl }) {
    super();
    this.apiKey = apiKey;
    this.notificationUrl = notificationUrl;
    this.baseUrl = "https://www.sculpteo.com/en/api";
  }

  async upload(meshBuffer, filename) {
    // POST to sculpteo's upload_api. returns a design uuid used by price/order below.
    // TODO: confirm current multipart field names against live docs before wiring up.
    throw new Error("todo: implement against sculpteo upload_api");
  }

  async quote({ meshUrl, quantity = 1, unit = "mm" }) {
    // GET https://www.sculpteo.com/en/api/design/3D/price_by_uuid/
    //   ?uuid=<design_uuid>&quantity=<n>&scale=<f>&unit=<mm|cm|m|in|ft|yd>
    // uuid is required; everything else has a documented default.
    throw new Error("todo: implement price_by_uuid call, map response into Quote shape");
  }

  async order(quoteId, shippingAddress, notificationUrl = this.notificationUrl) {
    // POST https://www.sculpteo.com/en/api/store/3D/order/
    // requires invoice-payment to be pre-enabled on this account by sculpteo's team.
    // notification_url (optional) receives a POST with { reference } on status change;
    // fetch TRACKING_URL = https://www.sculpteo.com/shop/tracking/reference/<reference>
    // to resolve current status including parcel tracking.
    throw new Error("todo: implement order call, contact sculpteo to unlock invoice payment first");
  }

  parseStatusWebhook(payload) {
    // sculpteo's webhook body is just { reference }. the caller must fetch the
    // tracking url themselves to learn what actually changed.
    return { reference: payload.reference, requiresFollowupFetch: true };
  }

  getCapabilities() {
    return require("../../reference/manufacturer-capabilities.json")
      .manufacturers.find((m) => m.id === "sculpteo");
  }
}

/**
 * shapeways adapter. STUB.
 *
 * shapeways' developer portal (developers.shapeways.com) still lists model
 * upload with printability checks, order placement, and a material catalog
 * endpoint, oauth2 against api.shapeways.com/v1, as of 2026-09-11. shapeways
 * went through chapter 7 bankruptcy in july 2024 and relaunched under new
 * ownership (manuevo -> shapeways) in december 2024; the consumer marketplace
 * did not come back, only the core manufacturing service did. confirm the api
 * is still live and self-serve, in writing, before building past this stub --
 * do not assume continuity from a company with this recent a restructuring.
 */
class ShapewaysAdapter extends ManufacturerAdapter {
  constructor({ clientId, clientSecret }) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = "https://api.shapeways.com/v1";
  }

  async upload() { throw new Error("todo: confirm oauth2 flow is live, then implement /models"); }
  async quote() { throw new Error("todo: confirm printability-check + price endpoints post-relaunch"); }
  async order() { throw new Error("todo: confirm order placement is self-serve post-relaunch"); }
  parseStatusWebhook() { throw new Error("todo: confirm shapeways still supports webhooks post-relaunch"); }
  getCapabilities() {
    return require("../../reference/manufacturer-capabilities.json")
      .manufacturers.find((m) => m.id === "shapeways");
  }
}

module.exports = { ManufacturerAdapter, SculpteoAdapter, ShapewaysAdapter };
