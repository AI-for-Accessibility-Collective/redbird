# Working on this adapter

This folder has one accessibility adapter for Redbird, a practice online store for the AI for Accessibility workshop. The store has 36 accessibility problems built in on purpose. The adapter is JavaScript that changes the store's pages for one person, like naming the color circles for a screen reader user.

The person you're working with may not code, and may use a screen reader, a keyboard only or zoom.

## Start here

1. Read `fix.json`: who the adapter is for (`person`), what they asked for (`need`), the page it's about (`page`), the planted problems it fixes (`issues`), and the conversation so far.
2. Read `feedback.md`. When the person presses "Send to the coding agent" in the store, their note is added at the bottom, with the page and what they pointed at.
3. Read `adapter.js`, and one of the examples in `examples/` that is close to what they want.
4. Start the store with `npm run dev` in the background and keep it running. Give the person the link it prints. It serves the store at http://localhost:5179 with `adapter.js` on every page, and reloads the page each time `adapter.js` is saved.
5. Run `npm install` once, so `npm test` works.

## Each change

1. Check `feedback.md` for new notes.
2. Change `adapter.js`. Keep what already works, and make the smallest change that does what they asked.
3. Run `npm test` and read `test-report.md`. Fix every line that starts with PROBLEM before saying it's ready.
4. Tell the person in one or two plain sentences what changed and what to try, like "Tab to the color circles and press the arrow keys". Don't explain the code unless they ask.
5. Ask what's still wrong. If the tests pass but the person says it still doesn't work for them, keep working on it.
6. Add what they asked for to the `conversation` list in `fix.json`, so the next session knows.

When they say how they'd check it themselves ("I can Tab to the price and hear $18.99"), write that as a check in `checks/` (see `checks/README.md`).

## The adapter

`adapter.js` is an ES module that exports one object with four parts:

```js
export const StarReader = {
  enabled: false,
  enable(options = {}) { /* change the page, and remember every change */ },
  disable() { /* put the page back exactly the way it was */ },
  toggle(options) { if (this.enabled) this.disable(); else this.enable(options); },
};
```

Rules:

- `disable()` has to undo everything: every attribute, text and element `enable()` changed or added. Keep a list of what you changed as you go. The test turns the adapter off and lists anything left behind.
- The store adds content after the page loads, like search results, the cart and the "Added to cart" panel. Watch for it with a `MutationObserver`, wait about half a second after changes stop, and skip elements you already changed.
- Never touch the workshop's own parts: anything inside `#ws-root`, `#ws-live` or `#rb-spotlight`.
- Pick elements by what they are (roles, `data-` attributes, element types, visible text) rather than by long chains of classes. Look at the real markup first, for example `curl -s http://localhost:5179/search?q=charger`, or read the selectors in `test-report.md`.
- Tell screen reader users what happened with `say()`, once when it starts and once when it stops, not on every change.
- Only change how the page looks if that is the fix. Don't add things the person didn't ask for.
- Keep it small and easy to read. The person may open it.

### What enable() gets

- `options.profile`: the shopper picked in the panel, or `null`. For example, `options.profile.supportAreas` is a list like `["vision"]`, `options.profile.fields.readingLevel` is a school grade or `null`, and `options.profile.fields.needs` is a list like `[{ "dimension": "urgency", "value": "hide" }]`.
- `options.today`: today's date, as a `Date`.
- `options.rewrite(text, instructions)`: rewrites text with the store's AI and returns a promise of the new text, or `null` if the AI isn't available.
- `options.fallback(text)`: the store's own plain version of a product description, or `null`.

### The store's AI

The store has its own AI, so there's no key to set up. Never ask for one or add one. Send a task to `/api/ai`:

```js
const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ task: 'summarize', text }) });
const { result } = await r.json(); // the answer as text, or no result if it failed
```

| task | inputs | what it returns |
|---|---|---|
| `rewrite` | `text`, `instructions` | the text rewritten the way the instructions say |
| `simplify` | `text` | the text in simpler words, with every fact kept |
| `summarize` | `text` | 2 or 3 plain sentences |
| `translate` | `text`, `targetLang` | the translation |
| `define` | `word`, `context` | one sentence on what the word means there |
| `describeImage` | `imageData` (a `data:image/...` URL) | alt text, one sentence |
| `label` | `elementType`, `html`, `context` | a short name for a button or field |
| `linkText` | `linkText`, `href`, `context` | better link text |

Answers take a few seconds and sometimes fail. The adapter has to work without them, for example by keeping the original text.

## The store

- `issues.md` lists the 36 planted problems by number, with where each shows up. Add `?issues=4,5` to a page to turn on only those, or `?issues=off` for none. The test turns on the ones in `fix.json`'s `issues`, or all of them if it's empty.
- Pages: `/` (home), `/search?q=charger`, `/product?id=rb-20w-usbc-charger`, `/cart`, `/checkout?cart=rb-20w-usbc-charger` (puts that product in the cart first). Other products include `hearth-oak-kettle`, `kestrel-65w-gan`, `pebble-20w-2pack` and `northloop-studio-headphones`.
- `?today=2026-11-02` makes delivery dates the same on every run.
- `examples/` has the workshop's example adapters: `swatch-names.js` (names and keyboard access), `calm-urgency.js` (reads the profile, hides things), `reading-level.js` (AI rewriting, with a fallback), `real-arrival-dates.js` (changes text) and `pause-moving-things.js` (stops motion).

## Tests

`npm test` tests the pages in `fix.json` (`page`, then `pages`), or a few common ones. `npm test -- "/search?q=lamp"` tests one page. For each page, `test-report.md` says whether the adapter ran without errors, which planted problems it fixed or made worse, what it changed, what a screen reader hears there with and without it, and whether turning it off put the page back.

## Don't

- Don't change `tools/` unless the person asks.
- Don't add API keys, or packages the adapter would need at runtime. It runs in the browser as one file.
- Don't commit `node_modules/` or `test-report.md`.

## Sharing

In the store, the panel's Build your adapter tab has Share it under Your folder. It makes a link that runs `adapter.js` on the live store. The adapter has the same shape as the ones in the AI for Accessibility Toolkit's `tools/adapters/` folder, so it can be added there later.
