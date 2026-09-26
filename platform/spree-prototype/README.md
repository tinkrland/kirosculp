# spree prototype (portable snapshot)

this is a snapshot of the working spree 5.6 commerce prototype, captured from
the temporary blaxel sandbox so it can be rebuilt on any host. the sandbox is
disposable; this folder is the source of truth.

## what this is

a minimal rails 8.1 app with spree 5.6 (core + api + admin) used to prototype
the platform leg's order flow and the escrow integration. it pairs with the
localstripe emulator and the supabase escrow ledger (see ../payments/).

## files captured

- Gemfile: rails ~> 8.1, spree ~> 5.6, devise
- config/initializers/devise.rb: devise config for both user classes
- app/models/spree/user.rb: storefront user, devise + spree user methods
- app/models/spree/admin_user.rb: devise admin user
- config/routes.rb: devise sessions routes for both user classes, spree
  engine mount, store api mounted at /api/v3

## rebuild steps (any linux host with ruby 3.3)

    gem install rails -v '~> 8.1' --no-document
    rails new spree-store --skip-git
    cd spree-store
    # copy the captured Gemfile over the generated one, then:
    bundle install
    bin/rails g spree:install --auto-accept
    bin/rails db:prepare
    # copy captured files: config/routes.rb, config/initializers/devise.rb,
    # app/models/spree/{user,admin_user}.rb
    bin/rails assets:precompile
    bin/rails s -p 3000 -b 0.0.0.0

## first-run setup (after rebuild)

    # admin user + role
    bin/rails runner 'Spree::AdminUser.create!(email: "spree@example.com", password: "spree123"); u = Spree::AdminUser.find_by!(email: "spree@example.com"); r = Spree::Role.find_or_create_by!(name: "admin"); u.spree_roles << r'

    # storefront api key (store api v3 uses the x-spree-api-key header)
    bin/rails runner 'k = Spree::ApiKey.create!(key_type: :publishable, name: "storefront", store: Spree::Store.default); puts k.token'

## localstripe emulator

    pip install localstripe
    localstripe   # binds ipv6 [::]:4242; use http://[::1]:4242

the order-purchase simulation then runs with:

    STRIPE_URL=http://[::1]:4242 \
    SUPABASE_URL=https://clmcmckaydkbkxuhfiyf.supabase.co \
    SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt> \
    node ../payments/simulate-order-purchase.js

## notes

- admin console: /admin (spree@example.com / spree123 in the sandbox build;
  change credentials on any real rebuild)
- escrow state machine itself is supabase-side (migrations 0007/0008) and
  passed 18/18 lifecycle checks; it does not depend on this app
- supabase keys are never stored in this repo; mint them via the management
  api with the personal access token kept in secrets
