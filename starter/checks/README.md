# Your own checks

`npm test` turns on the adapter and runs every `.mjs` file in this folder on each page. These are for what the person you're building for would check themselves, e.g., "I can Tab to Add to cart" or "the price is read as one number".

Each file exports one function, which gets the page (a [Playwright](https://playwright.dev/docs/api/class-page) page), the page's path (e.g., `/product?id=rb-20w-usbc-charger`) and `fix.json`. It returns `{ ok, says }`, a list of those, or nothing when the check doesn't apply to that page. For example, `checks/tab-to-add-to-cart.mjs`:

```js
// From our verification plan: with only the keyboard, I can Tab to "Add to cart" on a product page.
export default async function ({ page, path }) {
  if (!path.startsWith('/product')) return; // only product pages have this button
  for (let i = 1; i <= 60; i++) {
    await page.keyboard.press('Tab');
    const now = await page.evaluate(() => document.activeElement.textContent.trim());
    if (now === 'Add to cart') return { ok: true, says: `Tab reached Add to cart after ${i} presses` };
  }
  return { ok: false, says: 'Tab never reached Add to cart in 60 presses' };
}
```

Make a check look for the right answer, not only for the wrong one being gone. For example, a check on payment errors should make the ZIP code fail and look for "ZIP" in the message, since a message with no error code can still explain the wrong thing.

To check what a screen reader hears, get the ARIA snapshot of that part of the page:

```js
const heard = await page.locator('.price').first().ariaSnapshot(); // e.g., - text: $18.99
```

Files whose names start with `_` are skipped, e.g., `_draft.mjs`.
