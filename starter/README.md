# Redbird adapter

This folder has one adapter for Redbird, the workshop's practice store. You can keep changing it with a coding agent like Claude Code or Codex, run the store with it on your computer, and test it.

`fix.json` says who the adapter is for and what they asked for. If you downloaded this folder from the panel's Build your adapter tab, `fix.json` also has the conversation so far, and `adapter.js` has the code from your last version.

## Start

1. Install [Node.js](https://nodejs.org) 18 or newer, if you don't have it.
2. Open this folder in Claude Code, Codex or another coding agent.
3. Say: "Read AGENTS.md and start the store."

The agent starts the store and gives you a link, like `http://localhost:5179/product?id=rb-20w-usbc-charger&try=local`. Open it in Chrome. It's the same store, with the workshop panel on the left. It runs your `adapter.js` on every page. Each time `adapter.js` is saved, the page runs it again.

## Build it together

One person uses the store the way the person you're building for would. The agent changes the code. For example:

- Try the page with their screen reader, with only the keyboard, or zoomed in.
- When something is wrong, open the panel's Build your adapter tab. Under Your folder, write what's wrong and press Send to the coding agent. You can point at the part of the page too. The note goes at the bottom of `feedback.md`.
- Ask the agent to read the feedback and change the adapter.

## Test it

Run `npm install` once, then `npm test`. It opens the store's pages in Chrome in the background, and writes what it found to `test-report.md`:

- whether the adapter runs without errors
- which planted problems it fixes, using the same checks as the panel's red and green badges
- what it changed, and what a screen reader hears there with and without it
- whether turning it off puts the page back

The tests can't tell whether the person can actually do their task with the page, like finding a charger and adding it to the cart. For that, write down how they would check it, like "I can Tab to Add to cart and press Enter", and ask the agent to turn it into a check in `checks/`. `checks/README.md` has an example.

## Without an agent

| command | what it does |
|---|---|
| `npm run dev` | runs the store with your adapter at http://localhost:5179 |
| `npm test` | tests it (run `npm install` once first) |
| `npm test -- "/search?q=lamp"` | tests it on one page |

You need the internet for this. The pages, photos and the store's AI come from the live store. Only `adapter.js`, `fix.json` and `feedback.md` come from this folder.

## Share it

In the store, open the panel's Build your adapter tab and press Share it under Your folder. Anyone with the link can open your adapter on the live store.

`adapter.js` has the same shape as the adapters in the [AI for Accessibility Toolkit](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit), so it can go into the toolkit's `tools/adapters/` folder. Its [guide for adding to the catalog](https://github.com/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit/blob/main/docs/adding-to-the-catalog.md) has the steps.
