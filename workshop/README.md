# Workshop adapters

This folder lets you run an adapter on Redbird without installing the extension. You write one JavaScript file, open a store page with `?try=` and the file's name, and the adapter runs on that page.

The store has to be opened from a web address, not as a file. GitHub Pages works, or run `python3 tools/serve.py` in the repository folder and open `http://localhost:8000`.

## Try one

| address | what it does |
|---|---|
| `?try=swatch-names` | run `adapters/swatch-names.js` |
| `?try=swatch-names,calm-urgency` | run two at once |
| `?profile=sam` | run the adapters with the profile in `profiles/sam.json` |
| `?try=none` | stop running them |

Both choices are remembered in your browser until you change them. A panel in the bottom-left corner shows the profile and has a switch for each adapter, so you can compare the page with and without it.

## The four examples

| file | what it fixes | try it |
|---|---|---|
| `real-arrival-dates.js` | Turns "5–7 business days" into dates, like "arrives Tue, Nov 3 – Thu, Nov 5". Reads `concreteDates` from the profile. | `search?q=charger&issues=33&try=real-arrival-dates&profile=sam` |
| `swatch-names.js` | Gives unnamed color circles a name ("sage green") and makes them work with the arrow keys. | `product?id=hearth-oak-kettle&issues=6&try=swatch-names` |
| `calm-urgency.js` | Finds countdowns, "only 3 left" and "14 other people" messages. Labels them, or hides them if the profile's `urgency` is `hide`. | `?issues=23&try=calm-urgency&profile=riley` |
| `reading-level.js` | Rewrites hard paragraphs at the profile's `readingLevel`, with a button to show the original. Needs a Gemini key for real rewrites. Without one, it uses the store's own plain description. | `product?id=rb-20w-usbc-charger&issues=29&try=reading-level&profile=alex` |

For `reading-level`, you can paste a Gemini API key into the workshop panel. It is kept in your browser's storage and only sent to Google.

## Write your own

1. Copy `adapters/_template.js` to a new name, for example `adapters/real-buttons.js`.
2. Fill in `enable()` so it finds the problem and fixes it, and `disable()` so it puts the page back.
3. Open a page with `?issues=` set to the issue you are fixing and `?try=real-buttons`. [ISSUES.md](../ISSUES.md) lists every issue and where it shows up.

Every adapter is an object with `enabled`, `enable(options)`, `disable()` and `toggle()`, the same shape as the adapters in the [toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit). So once one works here, it can move into the toolkit's `tools/adapters/` folder. The toolkit's [adding-to-the-catalog guide](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/blob/main/docs/adding-to-the-catalog.md) has the steps.

## Profiles

A profile describes one person's needs. The adapters get it as `options.profile`. The three here are made up:

- `sam.json`: blind, uses a screen reader
- `riley.json`: ADHD and anxiety, wants pressure messages hidden
- `alex.json`: dyslexia, reads at about a sixth grade level

They use the toolkit's profile shape. For example, a need looks like `{ "dimension": "urgency", "value": "hide" }`, and the reading level is `fields.readingLevel`. To make a new one, copy a file and change the needs.
