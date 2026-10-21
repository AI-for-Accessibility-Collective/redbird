# Workshop adapters

This folder lets you run an adapter on Redbird without installing the extension. You write one JavaScript file, open a store page with `?try=` and the file's name, and the adapter runs on that page.

For the workshop itself (touring the store, making a skill, describing a fix for AI to write, and testing it), open the [workshop guides](https://redbird-workshop.vercel.app/workshop/).

The store has to be opened from a web address, not as a file. Use the live site, or run `python3 tools/serve.py` in the repository folder and open `http://localhost:8000`. The AI parts (rewriting text, describing photos, naming buttons) only work on the live site, because that's where the Gemini key is. On your own computer, adapters fall back to what they can do without AI.

## Try one

| address | what it does |
|---|---|
| `?try=swatch-names` | run `adapters/swatch-names.js` |
| `?try=motion-reducer` | run an adapter from the [toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/tree/main/tools/adapters) itself, loaded from its GitHub repo |
| `?try=toolkit-fixes` | run the toolkit's automatic fixes (alt text, button names, contrast, link text) |
| `?try=swatch-names,calm-urgency` | run two at once |
| `?profile=sam` | run the adapters with the profile in `profiles/sam.json` |
| `?try=none` | stop running them |

The adapters and profile you pick are saved in your browser until you change them. A panel in the bottom-left corner shows the profile and has a switch for each adapter, so you can compare the page with and without it.

The panel's Build tab makes fixes without writing code, using the same two builders as the toolkit's extension. "Make a skill" sends a need to the toolkit's Engineer prompt, which picks existing adapters and writes a SKILL.md. "Describe a fix" sends a description and a shortened copy of the page to the Adapter Builder's prompt, and the adapter it writes runs as `?try=mine`. Both prompts are in `api/_builders.js`. Skills and adapters are saved in the browser, and their share links carry them after the `#`.

## The four examples

| file | what it fixes | try it |
|---|---|---|
| `real-arrival-dates.js` | Turns "5–7 business days" into dates, like "arrives Tue, Nov 3 – Thu, Nov 5". Reads `concreteDates` from the profile. | `search?q=charger&issues=31&try=real-arrival-dates&profile=sam` |
| `swatch-names.js` | Gives unnamed color circles a name ("sage green") and makes them work with the arrow keys. | `product?id=hearth-oak-kettle&issues=6&try=swatch-names` |
| `calm-urgency.js` | Finds countdowns, "Only 2 left" and "14 other people" messages. Labels them, or hides them if the profile's `urgency` is `hide`. | `?issues=24&try=calm-urgency&profile=mark` |
| `reading-level.js` | Rewrites hard paragraphs at the profile's `readingLevel`, with a button to show the original. On the live site it uses Gemini through the store's own server. Without AI, it uses the store's own plain description. | `product?id=rb-20w-usbc-charger&issues=27&try=reading-level&profile=dario` |

The Gemini key stays on the server (`api/ai.js`) and is never sent to the browser. That server only does the store's own AI tasks, so it can't be used as a general Gemini proxy.

## Ideas to build

If you are not sure where to start, pick one of these. Each one fixes an issue we built into the store on purpose, and no adapter in the toolkit handles it yet. The issue column is the issue's number in [ISSUES.md](../ISSUES.md), so you can open the store with only that issue turned on (e.g., `?issues=21`).

| idea | what it does | issue | who it helps | how hard |
|---|---|---|---|---|
| Real buttons | Turns clickable `div`s into real buttons that work with Tab and Enter. | 3 | keyboard and screen reader users | easy |
| Star reader | Adds "4.6 out of 5 stars" as text next to the star pictures. | 4 | screen reader users | easy |
| One price | Makes "$18.99" read as one price instead of three pieces. | 5 | screen reader users | easy |
| Focus ring | Puts back a thick, high-contrast focus outline. | 20 | keyboard and low vision users | easy |
| Show hidden buttons | Shows the "Add to cart" buttons that only appear on mouse hover. | 21 | keyboard and motor users | easy |
| Clickable photos | Turns the hover-only photo thumbnails into buttons. | 22 | keyboard and motor users | easy |
| Stop the ticker | Stops the scrolling deals bar and shows it as one line. | 35 | people distracted by motion | easy |
| Ad labels | Finds sponsored results and gives each one a clear "Ad" label. | 7 | everyone, and AI agents | medium |
| Price boxes | Swaps the drag-only price slider for min and max boxes. | 18 | keyboard and switch users | medium |
| More time | Adds 10 minutes to the checkout timer, or stops it. | 19 | people with motor or cognitive disabilities | medium |
| Yes or no | Rewrites double-negative checkboxes as plain yes-or-no questions. | 29 | people with cognitive disabilities | medium |
| Friendly errors | Explains payment error codes in plain words, with what to do next. | 30 | people with cognitive disabilities | medium |
| Short titles | Cuts keyword-stuffed titles down to the brand, the product and one key fact. | 25 | screen reader users and people with cognitive disabilities | uses AI |
| Plain bullets | Rewrites "About this item" as three short, plain points. | 26 | people with cognitive or reading disabilities | uses AI |
| Plain policy | Turns the long legal text into three answers: can I return it, by when, and who pays. | 28 | people with cognitive or reading disabilities | uses AI |

Bigger ideas that combine several fixes for one profile:

- **Page summary:** puts the price, arrival date, rating, colors and stock in one short block at the top of a product page, so a screen reader user hears the key facts first.
- **Total cost:** shows the price with tax and delivery next to "Add to cart". This lets a person or an agent check it against a budget.
- **Compare helper:** a plain side-by-side table for products that look the same in search (e.g., the 12 wall chargers that come up when you search "USB-C charger").
- **Review finder:** finds reviews that mention what the profile cares about (e.g., "VoiceOver", "small buttons" or "hard to open").
- **Calm mode:** one switch for a cognitive profile that hides ads, countdowns and moving rows together.

## Write your own

1. Copy `adapters/_template.js` to a new name, for example `adapters/real-buttons.js`.
2. Fill in `enable()` so it finds the problem and fixes it, and `disable()` so it puts the page back.
3. Open a page with `?issues=` set to the issue you are fixing and `?try=real-buttons`. [ISSUES.md](../ISSUES.md) lists every issue and where it shows up.

Every adapter is an object with `enabled`, `enable(options)`, `disable()` and `toggle()`, the same shape as the adapters in the [toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit). So once one works here, it can move into the toolkit's `tools/adapters/` folder. The toolkit's [adding-to-the-catalog guide](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/blob/main/docs/adding-to-the-catalog.md) has the steps.

## Profiles

A profile describes one person's needs. The adapters get it as `options.profile`. The three here are made up:

- `sam.json`: Sam Saltman, blind, uses a screen reader
- `mark.json`: Mark Sugarberg, ADHD and anxiety, wants pressure messages hidden
- `dario.json`: Dario Almondei, dyslexia, prefers short, plain text at about a sixth grade level

They use the toolkit's profile shape. For example, a need looks like `{ "dimension": "urgency", "value": "hide" }`, and the reading level is `fields.readingLevel`. To make a new one, copy a file and change the needs.
