# Redbird adapter

This folder has one adapter for Redbird, the workshop's practice store. You can keep changing it with a coding agent (e.g., Claude Code or Codex), run the store with it on your computer, and test it.

`fix.json` describes the person the adapter is for and the change they need. If you downloaded this folder from the panel's Build your adapter tab, `fix.json` also has the conversation so far, and `adapter.js` has the code from your last version.

## Start

1. Install [Node.js](https://nodejs.org) 18 or newer, if you don't have it.
2. Open this folder in Claude Code, Codex or another coding agent.
3. Say: "Read AGENTS.md and start the store."

The agent starts the store and gives you a link, like `http://localhost:5179/product?id=rb-20w-usbc-charger&try=local`. Open it in Chrome. It's the same store and workshop panel, but it runs your `adapter.js` on every page, and the page runs it again each time `adapter.js` is saved.

## Show it in your developer console

If your workshop runs an AI for Accessibility toolkit, start the store with your toolkit's address and the default token from its developer console:

```
TOOLKIT_URL=http://localhost:8080 TOOLKIT_TOKEN=aat_… npm run dev
```

Your adapter then shows up in the console under Apps, as part of Redbird demo ("Your folder's adapter.js"), and you can shop as your toolkit profile. The token only goes to the pages this folder serves on your computer.

## Build it together

One person on your team uses the store the way the person you're building for would, and the coding agent changes the code. Each round goes like this:

- Try the page with their screen reader, with only the keyboard, or zoomed in.
- When something is wrong, write it under Your folder in the panel's Build your adapter tab and press Add note for the coding agent (you can also point at the part of the page). The note goes at the bottom of `feedback.md`.
- Ask the agent to read the feedback and change the adapter.

## Test it

Run `npm install` once, then `npm test`. It opens the store's pages in Chrome in the background and writes what it found to `test-report.md`:

- whether the adapter runs without errors
- which planted problems it fixes, using the same checks as the panel's red and green badges
- what it changed, and what a screen reader hears there with and without it
- whether turning it off puts the page back

The tests can't tell whether the person can do their task with the page, e.g., find a charger and add it to the cart. For that, write down how the person would check it (e.g., "I can Tab to Add to cart and press Enter") and ask the agent to turn it into a check in `checks/`. There is an example in `checks/README.md`.

## Without an agent

| command | what it does |
|---|---|
| `npm run dev` | runs the store with your adapter at http://localhost:5179 |
| `npm test` | tests it (run `npm install` once first) |
| `npm test -- "/search?q=lamp"` | tests it on one page |
| `npm run page -- "/search?q=lamp"` | prints the page's markup after the store's scripts render it |

This needs the internet, since the pages, photos and the store's AI all come from the live store. Only `adapter.js`, `fix.json` and `feedback.md` come from this folder.

## Share it

In the store, open the panel's Build your adapter tab and press Share it under Your folder. Anyone with the link can open your adapter on the live store.

`adapter.js` has the same shape as the adapters in the [AI for Accessibility Toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit), so it can go into the toolkit's `tools/adapters/` folder later. The toolkit's [guide for adding to the catalog](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/blob/main/docs/adding-to-the-catalog.md) has the steps.
