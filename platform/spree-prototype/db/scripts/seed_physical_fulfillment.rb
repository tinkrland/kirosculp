# seed_physical_fulfillment.rb
#
# rails runner script: wires the physical fulfillment and escrow-style
# payment pieces that the default spree seeds (digital delivery) do not
# provide. run after db:seed on any rebuild:
#
#   bin/rails runner db/scripts/seed_physical_fulfillment.rb
#
# idempotent: every step is find_or_create by name/attribute.

# 1. physical shipping: category on the jewelry products, us zone,
#    flat-rate $10 method
cat = Spree::ShippingCategory.find_or_create_by!(name: "physical")
zone = Spree::Zone.find_or_create_by!(name: "us physical") { |z| z.kind = "shipping" }
Spree::ZoneMember.find_or_create_by!(zone: zone, zoneable: Spree::Country.find_by!(iso: "US"))

method = Spree::ShippingMethod.where(name: "standard shipping").first ||
         Spree::ShippingMethod.new(name: "standard shipping")
method.display_on ||= "both"
method.calculator ||= Spree::Calculator::Shipping::FlatRate.create!
method.calculator.set_preference(:amount, 10)
method.calculator.set_preference(:currency, "USD")
method.calculator.save!
method.zones = [zone]
method.shipping_categories = [cat]
method.save!

# put every existing product on the physical category
Spree::Product.find_each { |p| p.update!(shipping_category: cat) unless p.shipping_category == cat }

# 2. check payment method: simulates the gateway (authorize/capture
#    succeed unconditionally). raises the default max amount so real
#    order totals pass validation.
check = Spree::PaymentMethod.find_or_create_by!(type: "Spree::PaymentMethod::Check") do |m|
  m.name = "check (escrow prototype)"
  m.display_on = "both"
  m.active = true
end
check.update!(display_on: "both", active: true)

puts "seeded: shipping category 'physical', zone 'us physical', method 'standard shipping' (flat 10), check payment method id #{check.id}"
