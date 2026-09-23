# Creator onboarding and payout geography

Creator signup geography and buyer shipping geography are separate policies.

## Intended signup policy

Allow a creator to create an account from any jurisdiction where the selected connected-payout provider supports the required account type, subject to sanctions, prohibited-business, age, and legal restrictions.

Signup itself does not intentionally require full kyc. Creators can build a profile, work in studio, and prepare listings before completing payout onboarding.

## Payout gate

Identity and payout verification must be complete before money is released. The initial product threshold is:

- Usd balance: **$20**
- Eur balance: **€20**

Reaching the threshold should prompt provider-hosted payout onboarding if it is incomplete. A creator may also complete it earlier voluntarily.

This is product intent, not a promise that every provider permits deferred verification. Stripe, paypal, a regulator, sanctions screening, transaction monitoring, or a connected-account configuration may require information earlier. Provider requirements win, and the product must surface that honestly instead of bypassing it.

## Provider direction

- Stripe connect: primary intended connected-account and payout layer
- Paypal: candidate secondary payout/account-sync option
- Razorpay and regional providers: later research where they improve local creator access

Provider support must be queried from current provider capability data. Do not freeze a copied country list in application code and call it permanent.
