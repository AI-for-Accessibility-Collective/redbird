# Your own checks

`npm test` runs every `.mjs` file in this folder on each page, with the adapter on. Use them for what the person would check themselves, like "I can Tab to Add to cart" or "the price is read as one number".

A check exports one function. It gets the page (a [Playwright](https://playwright.dev/docs/api/class-page) page), the page's address and `fix.json`, and returns `{ ok, says }`, a list of those, or nothing when it doesn't apply to that page.

For example, `checks/tab-to-stars.mjs`:

```js
// Sam's check: with only the keyboard, Tab reaches a star rating.
export default async function ({ page, path }) {
  if (!path.startsWith('/search')) return; // only search results have the ratings Sam asked about
  for (let i = 1; i <= 40; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => !!document.activeElement.closest('.stars'))) {
      return { ok: true, says: `Tab reached a star rating after ${i} presses` };
    }
  }
  return { ok: false, says: 'Tab never reached a star rating in 40 presses' };
}
```

To hear what a screen reader would, ask the browser for that part of the page:

```js
const heard = await page.locator('.price').first().ariaSnapshot(); // like: - text: $18.99
```

A file whose name starts with `_` is skipped.
