# creator dashboard: private language and presentation preferences

these preferences belong to the creator's private dashboard interface.
they do not describe multilingual customer support, public storefront
localization, or a separate public creator-preview product.

specified product direction, not implemented or verified localization.

## v1: english with regional subtoggles

english is the only base language in v1. choosing it exposes a second-level
regional selector, including uk, us, canadian and irish english. these are
examples of the agreed choices, not a commitment to every english variant.

keep four preference areas independent:

- language and its regional variant
- currency
- measurement units
- tone

a creator's regional english choice must not silently choose a currency,
change measurement units, or determine tone. display preferences do not
change authoritative prices, payout currencies, geometry or validation rules.

## tone: chronically online

the tone selector includes a lowercase, informal gen-z english option called
"chronically online". it is independent of the english regional selector;
choosing british english does not require formal prose, and choosing a casual
tone does not imply american english.

tone changes how the private interface speaks, not what happened. validation
errors, financial amounts, obligations and required actions remain explicit.
never obscure a physical constraint or monetary consequence to land a joke.

this dashboard tone does not rewrite public storefront copy, commission
messages, creator-authored terms, or other customer-facing content.

## v2: five base languages including english

v2 retains english and adds french, german, portuguese and spanish. selecting
a base language exposes its regional choices rather than combining language,
country, currency, units and personality into one preset.

| base language | regional choices |
|---|---|
| english | uk, us, canadian and irish examples carried forward from v1 |
| french | france, north african french, swiss french and quebecois |
| german | germany, switzerland and german-speaking netherlands |
| portuguese | portugal or brazil |
| spanish | exactly peninsular or latam; no further subdivisions within latam |

german-speaking netherlands is intentional and does not mean dutch support.
it is a regional audience choice, not a claim that dutch is a german variant.

bavarian is a proposed optional german dialect/style choice, not yet a fixed
v2 launch requirement. regional context and dialect need clear labeling;
neither should force a particular personality or tone.

the exact french menu beyond the named examples, dialect depth, translated
tone coverage and fallback behavior still need implementation decisions.
do not promise a localized "chronically online" voice for every v2 language
until that language's copy has been authored and reviewed.

## private dashboard and public storefront are independent

a creator can use african french in their private dashboard and publish an
english storefront. there is no conflict, and switching the dashboard does
not translate, rewrite or switch the public shop.

storefront language and content belong to the creator's public presentation
settings. the creator can choose them independently of dashboard language,
regional variant, currency, units and tone.

do not publish the dashboard's regional selector as a creator-country badge,
locale metadata, or a commissioner-visible clue to the creator's location.
this supports the [intentional geographic ambiguity policy](../../marketing/positioning/creator/availability.md),
not a claim that publicly chosen storefront copy has no linguistic clues.

## boundary checks for implementation

- changing a regional variant preserves independently chosen currency, units
  and tone.
- changing tone preserves values, constraints and required actions.
- selecting latam does not open an extra country-by-country spanish selector.
- a french private dashboard can coexist with an unchanged english storefront.
- storefront/public profile responses do not expose private dashboard settings.
- language preferences do not determine country eligibility, legal/provider
  records, creator admission or commission rates.

see [creator console](README.md), [platform creator tools](../../platform/creators/README.md),
[storefronts](../../platform/storefronts/README.md), and
[future storefront flexibility](../../platform/storefronts/creative-flexibility.md).
