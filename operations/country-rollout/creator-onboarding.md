# creator onboarding and payout geography

creator signup geography and buyer shipping geography are separate policies.

## intended signup policy

allow a creator to create an account from any jurisdiction where the selected connected-payout provider supports the required account type, subject to sanctions, prohibited-business, age, and legal restrictions.

signup itself does not intentionally require full kyc. creators can build a profile, work in studio, and prepare listings before completing payout onboarding.

## payout gate

identity and payout verification must be complete before money is released. the thresholds are:

- first payout: usd balance **$50**, eur balance **€50**
- subsequent payouts: usd balance **$25**, eur balance **€25**

reaching the first-payout threshold should prompt provider-hosted payout onboarding if it is incomplete. a creator may also complete it earlier voluntarily. after the first payout clears, the payout threshold drops to the subsequent level.

this is product intent, not a promise that every provider permits deferred verification. stripe, paypal, a regulator, sanctions screening, transaction monitoring, or a connected-account configuration may require information earlier. provider requirements win, and the product must surface that honestly instead of bypassing it.

## provider direction

- stripe connect: primary intended connected-account and payout layer
- paypal: candidate secondary payout/account-sync option
- razorpay and regional providers: later research where they improve local creator access

provider support must be queried from current provider capability data. do not freeze a copied country list in application code and call it permanent.
