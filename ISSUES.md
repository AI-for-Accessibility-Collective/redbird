# Planted issues

Redbird has 36 accessibility problems built in on purpose. Each one has a number, and you can turn any of them on or off with the address bar:

| address | what you get |
|---|---|
| `?issues=on` | all 36 (the default) |
| `?issues=off` | none, so the store works with a screen reader and a keyboard |
| `?issues=6,24` | only issues 6 and 24, which is handy when testing one adapter |

The last column says whether an adapter in the [toolkit catalog](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/tree/main/tools/adapters) already tries to fix it. Those were made quickly with AI and are not robust, so they are mostly there to show the extension working. **Build one** means no adapter does it yet. Those are good projects for the workshop.

To find the code for an issue, search for `on(6)` in `assets/js/` or `data-planted~="6"` in `assets/css/site.css`.

## Blind and screen reader users

| # | what's wrong | where | adapter |
|---|---|---|---|
| 1 | Product photos have no alt text, a camera file name like `IMG_2931.jpg`, or just "product image". | everywhere | `generate-alt` |
| 2 | Icon buttons have no name: search, cart, save to list, the banner arrows, the photo thumbnails, quantity − and +. | header, cards, product page | `generate-labels` |
| 3 | "Add to cart" is a clickable `div`, so it is not a button and the keyboard skips it. | cards, product page | **Build one** |
| 4 | Star ratings are only a picture of stars. A screen reader hears "(12,408)" and nothing about the rating. | everywhere | **Build one** |
| 5 | Prices are split into three pieces, so they are read as "dollar 18 99". | everywhere | **Build one** |
| 6 | Color choices are plain colored circles with no names, and the keyboard can't reach them. | product page, cards | **Build one** (worked example: `swatch-names`) |
| 7 | "Sponsored" is faint text inside an image with no alt text, so ads look like normal results. | search results, product page | **Build one** |
| 8 | Things change with no announcement: the cart count, the "Added to cart" panel, search results after a filter, and error messages. | header, search, product page, checkout | `live-region-announcer`, `spa-focus` (partly) |
| 9 | The product information table has no header cells. | product page | `fix-tables` |
| 10 | Links say "See more" or "Click here" instead of where they go. | home, cards, product page | `fix-links` |
| 11 | Headings are styled `div`s. There is no header, nav, main or footer, and no skip link. | everywhere | `fix-landmarks`, `page-outline` |

## Low vision

| # | what's wrong | where | adapter |
|---|---|---|---|
| 12 | Light grey text that fails contrast: list prices, delivery text, fine print, brand names. | everywhere | `fix-contrast` |
| 13 | Fine print at 10 px: the return policy and the subscription terms. | product page, checkout | `visual-assist`, `magnifier` |
| 14 | The header and the deal ticker stay stuck to the top, so they cover half the screen when zoomed in. | everywhere | `unpin-sticky` |
| 15 | The page is at least 1280 px wide, so at 200% zoom you have to scroll sideways. | everywhere | `reflow-column` |
| 16 | The real arrival date is only in a tooltip that opens on mouse hover ("Details"). | product page | `persistent-hover` |

## Motor

| # | what's wrong | where | adapter |
|---|---|---|---|
| 17 | Tiny targets: the quantity − and + buttons, the save-to-list heart, and the filter checkboxes, where only the small box can be clicked. | product page, cart, cards, search | `big-targets` |
| 18 | The price filter is a slider you can only drag with a mouse. | search | **Build one** |
| 19 | Checkout says "Your cart is held for 5:00" and counts down. You can't extend it, and when it runs out you can't place the order. | checkout | **Build one** |
| 20 | The keyboard focus outline is turned off, so you can't see where you are when you press Tab. | everywhere | `focus-locator` (partly) |
| 21 | "Add to cart" on search results only appears while a mouse hovers over the card, so the keyboard can't reach it. | search, home | **Build one** |
| 22 | Product photos only switch when a mouse hovers over a thumbnail, and the big photo only zooms under the mouse. The thumbnails can't be clicked or reached with the keyboard. | product page | **Build one** |

## Cognitive and reading

| # | what's wrong | where | adapter |
|---|---|---|---|
| 23 | The product page is crowded with sponsored products and a big ad banner. | product page | `focus-mode`, `reader-mode` |
| 24 | Fake urgency: countdowns that start over on every visit, "Only 3 left in stock - order soon", "14 other people have them in their carts". | home, product page, cart | **Build one** (worked example: `calm-urgency`) |
| 25 | Product titles are stuffed with keywords, so the six chargers look almost the same. For example, "Redbird Basics 20W USB C Wall Charger Fast Charging PD 3.0 GaN Power Adapter Block...". | everywhere | **Build one** |
| 26 | "About this item" is five long bullets with 【ALL-CAPS LABELS】, stuffed keywords and run-on sentences. | product page | `simplify-text` (partly) |
| 27 | Product descriptions are marketing jargon in long sentences. | product page | `simplify-text` (worked example: `reading-level`) |
| 28 | The return policy and the subscription terms are each one long legal sentence. | product page, checkout | **Build one** |
| 29 | A checked box with a double negative: "Uncheck this box if you do not wish to not receive Redbird offers". | checkout | **Build one** |
| 30 | Payment errors are system codes, like "Error 402: AVS mismatch". | checkout | **Build one** |
| 31 | Shipping says "5–7 business days, excluding weekends and holidays" instead of a date. | cards, product page, checkout, order page | **Build one** (worked example: `real-arrival-dates`) |
| 32 | Jargon and abbreviations nobody explains: spec names like "Output (PD/PPS)" and "I/O config.", and MSRP, S&S and OOS. | product page, cart, checkout | `abbreviation-expand`, `define-words` |

## Motion and sound

| # | what's wrong | where | adapter |
|---|---|---|---|
| 33 | The product video plays by itself, with sound, on a loop. | Redbird Basics charger page | `mute-sounds`, `motion-reducer` |
| 34 | The "Best sellers" and "Customers also bought" rows scroll by themselves and have no buttons. | home, product page | `stop-auto-advance` |
| 35 | A deal ticker scrolls across the top of every page, and the home banner changes every 4 seconds with no way to pause. | everywhere, home | `motion-reducer`, `stop-auto-advance` |

## Deaf and hard of hearing

| # | what's wrong | where | adapter |
|---|---|---|---|
| 36 | The product video has no captions. | Redbird Basics charger page | `show-captions`, `generate-captions` |
