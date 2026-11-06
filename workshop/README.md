# Workshop

This folder is the store's toolkit panel, Redbird's own adaptations, the four made-up shoppers and the workshop guides. For the workshop itself (touring the store, building a fix with the toolkit, and testing it), open the [workshop guides](https://redbird-workshop.vercel.app/workshop/).

The [AI for Accessibility Toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit) is an active research project: pre-alpha, a technology probe. Its adapters, and the adaptations here, are unvalidated, and it is not a replacement for assistive technology. In practice, a fix can change the store in ways nobody has checked with the people it is meant for.

The store has to be opened from a web address, not as a file. Use the live site, or run `python3 tools/serve.py` in the repository folder and open `http://localhost:8000`. On your own computer, the AI parts (rewriting text) work only while the store is connected to your toolkit, which runs them. On the live site, they also work through the store's own server (`api/ai.js`).

## Where fixes are built

Fixes are built with the toolkit, not in this folder:

- **In the toolkit's extension.** Its sidebar's **Builder** is an assistant: say what gets in the way, it builds an adapter, previews it on the page with checks, and adds it to your account. It runs in your Chrome on the store and on any other website.
- **In code.** A coding agent (Claude Code, Codex, opencode) with the toolkit's `ai4a11y-toolkit` skill writes the adapter on the toolkit's building blocks, publishes it to your account with the skill's `adapter.mjs`, and checks it. For the store, it runs on `https://redbird-workshop.vercel.app/*`. Start from [adapters/_template.js](adapters/_template.js) if you like.

The panel's **Build** tab says the same, with links to the guides.

## The panel

`loader.js` puts a panel next to the store, with four tabs: **Profiles** (who to shop as), **Adapter Library** (a switch for each adaptation), **Build** and **Audit** (common problems on the page, from the toolkit's auditors). It loads the toolkit's building blocks and built-in adapters from the toolkit's repository, pinned to one commit (`TOOLKIT` at the top of `loader.js`), and gives each adaptation its own session of the blocks, so turning it off puts back what it changed. The panel lists each adaptation's changes from that session.

| address | what it does |
|---|---|
| `?try=swatch-names` | run `adapters/swatch-names.js` |
| `?try=text-size` | run one of the toolkit's built-in adapters |
| `?try=swatch-names,calm-urgency` | run two at once |
| `?profile=sam` | shop as Sam: turn on the adaptations Sam's profile asks for |
| `?profile=toolkit` | shop as your own toolkit profile, once the store is connected |
| `?try=none` | stop running them |

The adaptations and profile you pick are saved in your browser until you change them.

## Redbird's adaptations

Redbird is an app with its own adaptations, the way the toolkit's skill describes one. They are written like any toolkit web adapter (`enable(options, toolkit)` and `disable()`, every change through `toolkit.session()`), so each file can also be published to the toolkit as it is.

| file | what it fixes | try it |
|---|---|---|
| `real-arrival-dates.js` | Turns "5–7 business days" into dates, like "arrives Tue, Nov 3 – Thu, Nov 5". | `search?q=charger&issues=31&try=real-arrival-dates` |
| `swatch-names.js` | Gives unnamed color circles a name ("sage green") and makes them work with the arrow keys. | `product?id=hearth-oak-kettle&issues=6&try=swatch-names` |
| `calm-urgency.js` | Finds countdowns, "Only 2 left" and "14 other people" messages, and labels them, or hides them (option `mode: "hide"`). | `?issues=24&try=calm-urgency&profile=mark` |
| `reading-level.js` | Rewrites hard paragraphs at the person's reading level with the toolkit's AI text block, with a button to show the original. Without AI, it uses the store's own plain description. | `product?id=rb-20w-usbc-charger&issues=27&try=reading-level&profile=dario` |
| `pause-moving-things.js` | Holds the deals bar, banner, product rows and video still, while the person can still move them. | `?issues=33,34,35&try=pause-moving-things` |
| `no-surprise-extras.js` | Unticks the protection plan and picks one-time purchase, with a note saying so. | `product?id=rb-20w-usbc-charger&try=no-surprise-extras` |
| `always-show-buttons.js` | Shows the "Add to cart" buttons that only appear on mouse hover, and makes them work with the keyboard. | `search?q=charger&issues=21&try=always-show-buttons` |

## Connect to your toolkit

Press **Open Redbird** on the Apps page of your toolkit's developer console (under **+ Connect an app**), or use **Connect to your toolkit** in the panel's Profiles tab. [toolkit.js](toolkit.js) does the connecting, with the toolkit's Adapter MCP SDK:

- Each tab shows up in the console under Apps as **Redbird demo**. You, or a coding agent with your token, can turn the first five adaptations above on and off there, change calm-urgency's mode, and undo a change. The skill's `adapter.mjs verify --app redbird` checks them.
- The store registers two needs that its adaptations meet: `redbird/real-dates` (real-arrival-dates) and `redbird/no-pressure` (calm-urgency). The toolkit suggests them to people whose profiles could use them, in the extension's Profile tab.
- **Your toolkit profile** is on the Profiles tab's list. Shopping as it turns on the adaptations that meet your profile's needs, and follows the profile when it changes. While you shop as it, switching an adaptation on or off tells your toolkit in one plain sentence, and it may suggest a change to your profile. It never sends what is on the page.

The toolkit has to allow the store's address. A local one does when started with `npm run dev:workshop`.

## Profiles

A profile describes what one person needs. The four here are made up, and are starting points, not descriptions of real people:

- `sam.json`: Sam Saltman, blind, uses a screen reader
- `dario.json`: Dario Almondei, cognitive disability, prefers short, plain text
- `mark.json`: Mark Sugarberg, ADHD and anxiety, wants pressure messages hidden
- `bill.json`: Bill Grapes, an older adult, wants bigger text and buttons

They use the toolkit's profile shape: needs in `fields.needs`, like `{ "dimension": "reduceMotion", "value": true }`, including Redbird's own (`redbird/real-dates`). The panel turns on the adaptations that meet them, and the blocks read the person's settings (text size, reading level, less motion) from the same profile.

## Ready-made checks

[checks.js](checks.js) has checks for some of the planted problems that try the fix the way the person would (press Enter, type a price, let the cart timer run out). A coding agent testing an adapter on the store can load it and call `RB_CHECKS[n](window)`. `window.RB_ISSUE_REPORT()` on any store page says which planted problems are fixed, the same check the panel's red and green badges use.
