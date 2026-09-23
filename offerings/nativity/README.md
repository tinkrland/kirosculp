# nativity: native sales channels

where sculptura listings natively surface and sell beyond our own storefront. the platform owns every channel connection: it pushes a release-bound listing out and receives orders back as release-bound purchase requests. a channel is a surface, never a second geometry, pricing, or settlement authority.

## candidate channels

| channel | phase | notes |
|---|---|---|
| [shopify](https://www.shopify.com/) | early | strongest fit for creator white-label storefronts; the platform publishes per-release products and syncs inventory state |
| [etsy](https://www.etsy.com/) marketplace | early | large marketplace demand for personalized jewelry; subject to etsy's handmade and reseller policies, which need a per-policy check before listing |
| [pinterest](https://www.pinterest.com/business/shopping/) products | early | shoppable pins fit the moodboard audience sculptura draws creators from |
| instagram / [meta commerce](https://www.facebook.com/business/shops) | early | catalog-driven; meta commerce policies apply |
| tiktok shop | early | growing demand for personalized/made-to-order jewelry; its fulfillment and content rules need their own check |
| [woocommerce](https://woocommerce.com/) | later | self-hosted wordpress channel for creators who run their own stores |
| [squarespace](https://www.squarespace.com/) / [webflow](https://webflow.com/) / [wix studio](https://www.wix.com/studio) | later | site-builder commerce; revisit when channel demand justifies them |

## rules that hold on every channel

- a channel listing points at a specific immutable design release, same as our own storefront. no channel gets a loose stl or client-validated geometry.
- pricing, settlement, and payout always flow through operations; a channel only submits a purchase request. channel fees and per-channel tax handling are recorded per channel in the quote.
- fulfillment promises shown on a channel must match the operations route decision. no channel gets a lead time or shipping promise that the eligible route has not confirmed.
- content policy per channel (handmade claims, personalization disclosures, metal fineness claims) is checked before that channel goes live.
- a channel disconnecting or de-listing never corrupts the studio side; channel state is platform state, synced from releases.

nothing here is connected yet. these are the target channels and the constraints each integration must respect.
