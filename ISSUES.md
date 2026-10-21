# Planted issues

Redbird has 34 accessibility problems built in on purpose. Each one has a number, and you can turn any of them on or off with the address bar:

| address | what you get |
|---|---|
| `?issues=on` | all 34 (the default) |
| `?issues=off` | none, so the store works with a screen reader and a keyboard |
| `?issues=6,23` | only issues 6 and 23, which is handy when testing one adapter |

The last column says whether an adapter in the [toolkit catalog](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/tree/main/tools/adapters) already tries to fix it. Those were made quickly with AI and are not robust, so they are mostly there to show the extension working. **Build one** means no adapter does it yet. Those are good projects for the workshop.

To find the code for an issue, search for `on(6)` in `assets/js/` or `data-planted~="6"` in `assets/css/site.css`.

## Blind and screen reader users

| # | what's wrong | where | adapter |
|---|---|---|---|
| 1 | Product photos have no alt text, a camera file name like `IMG_2931.jpg`, or just "product image". The infographics have their facts written inside the picture, so a screen reader gets none of them. | everywhere | `generate-alt` |
| 2 | Icon buttons have no name: search, cart, save to list, the banner arrows, the photo thumbnails, quantity − and +. | header, cards, product page | `generate-labels` |
| 3 | "Add to cart" is a clickable `div`, so it is not a button and the keyboard skips it. | cards, product page | **Build one** |
| 4 | Star ratings are only a picture of stars. A screen reader hears "(12,408)" and nothing about the rating. | everywhere | **Build one** |
| 5 | Prices are split into three pieces, so they are read as "dollar 18 99". | everywhere | **Build one** |
| 6 | Color choices are plain colored circles with no names, and the keyboard can't reach them. | product page, cards | **Build one** (worked example: `swatch-names`) |
| 7 | "Sponsored" is faint text inside an image with no alt text, so ads look like normal results. | search results, product page | **Build one** |
| 8 | The cart count changes with no announcement, and so does the "Added to cart" panel. | header | `live-region-announcer` |
| 9 | Search results change after a filter with no announcement. Error messages are not announced either. | search, product page, checkout | `spa-focus` (partly) |
| 10 | The product information table has no header cells. | product page | `fix-tables` |
| 11 | Links say "See more" or "Click here" instead of where they go. | home, cards, product page | `fix-links` |
| 12 | Headings are styled `div`s. There is no header, nav, main or footer, and no skip link. | everywhere | `fix-landmarks`, `page-outline` |

## Low vision

| # | what's wrong | where | adapter |
|---|---|---|---|
| 13 | Light grey text that fails contrast: list prices, delivery text, fine print, brand names. | everywhere | `fix-contrast` |
| 14 | Fine print at 10 px: the return policy and the subscription terms. | product page, checkout | `visual-assist`, `magnifier` |
| 15 | The header and the deal ticker stay stuck to the top, so they cover half the screen when zoomed in. | everywhere | `unpin-sticky` |
| 16 | The page is at least 1280 px wide, so at 200% zoom you have to scroll sideways. | everywhere | `reflow-column` |
| 17 | The real arrival date is only in a tooltip that opens on mouse hover ("Details"). | product page | `persistent-hover` |

## Motor

| # | what's wrong | where | adapter |
|---|---|---|---|
| 18 | Tiny targets: the quantity − and + buttons and the save-to-list heart. | product page, cart, cards | `big-targets` |
| 19 | The price filter is a slider you can only drag with a mouse. | search | **Build one** |
| 20 | Checkout says "Your cart is held for 5:00" and counts down. You can't extend it, and when it runs out you can't place the order. | checkout | **Build one** |

## Cognitive and reading

| # | what's wrong | where | adapter |
|---|---|---|---|
| 21 | The product page is crowded with sponsored products and a big ad banner. | product page | `focus-mode`, `reader-mode` |
| 22 | Spec names are jargon and abbreviations, like "Output (PD/PPS)" and "I/O config.". | product page | `simplify-text`, `define-words` |
| 23 | Fake urgency: countdowns that start over on every visit, "Only 3 left in stock - order soon", "14 other people have them in their carts". | home, product page, cart | **Build one** (worked example: `calm-urgency`) |
| 24 | Product titles are stuffed with keywords, so the six chargers look almost the same. For example, "Redbird Basics 20W USB C Wall Charger Fast Charging PD 3.0 GaN Power Adapter Block...". | everywhere | **Build one** |
| 29 | Product descriptions are marketing jargon in long sentences. | product page | `simplify-text` (worked example: `reading-level`) |
| 30 | The return policy and the subscription terms are each one long legal sentence. | product page, checkout | **Build one** |
| 31 | A checked box with a double negative: "Uncheck this box if you do not wish to not receive Redbird offers". | checkout | **Build one** |
| 32 | Payment errors are system codes, like "Error 402: AVS mismatch". | checkout | **Build one** |
| 33 | Shipping says "5–7 business days, excluding weekends and holidays" instead of a date. | cards, product page, checkout, order page | **Build one** (worked example: `real-arrival-dates`) |
| 34 | Abbreviations nobody explains: MSRP, S&S, OOS. | everywhere | `abbreviation-expand` |

## Motion, sound and flashing

| # | what's wrong | where | adapter |
|---|---|---|---|
| 25 | The product video plays by itself, with sound, on a loop. | Redbird Basics charger page | `mute-sounds`, `motion-reducer` |
| 26 | The "Best sellers" and "Customers also bought" rows scroll by themselves and have no buttons. | home, product page | `stop-auto-advance` |
| 28 | A deal ticker scrolls across the top of every page, and the home banner changes every 4 seconds with no way to pause. | everywhere, home | `motion-reducer`, `stop-auto-advance` |

## Deaf and hard of hearing

| # | what's wrong | where | adapter |
|---|---|---|---|
| 27 | The product video has no captions. | Redbird Basics charger page | `show-captions`, `generate-captions` |
