// Order entity type for commerce flow
// Purchase request with server-side pricing and escrow

export class Order {
  constructor(data) {
    this.id = data.id;
    this.order_number = data.order_number;
    this.buyer_id = data.buyer_id;
    this.creator_id = data.creator_id;
    this.release_id = data.release_id;
    this.listing_id = data.listing_id;
    this.metal = data.metal;
    this.size = data.size;
    this.region = data.region;
    this.status = data.status;
    this.amounts = data.amounts; // server-computed: retail, manufacturing_cost, creator_net, platform_fee
    this.escrow = data.escrow; // escrow hold and ledger entry references
    this.shipping_address = data.shipping_address;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  isPaid() {
    return this.status === 'paid';
  }

  isDelivered() {
    return this.status === 'delivered';
  }

  getRetailTotal() {
    return this.amounts?.retail_cents || 0;
  }

  getCreatorNet() {
    return this.amounts?.creator_net_cents || 0;
  }
}

export const ORDER_STATUS = [
  "pending_payment",
  "pending",
  "paid",
  "manufacturing",
  "shipped",
  "delivered",
  "refunded",
  "cancelled"
];
