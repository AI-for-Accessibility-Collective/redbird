// Prints a store page's markup after the store's scripts have rendered it, so selectors can be picked
// from what is really on the page. curl only gets the empty page those scripts start from.
//
//   npm run page -- "/search?q=charger"              the main part of the page
//   npm run page -- "/search?q=charger" ".card"      the first 3 elements that match
//
// The planted problems in fix.json's issues are turned on (all of them if it's empty), and no
// adapter runs, so this is the page as the store has it.
import { start, readFix } from './dev.mjs';

let chromium;
try { ({ chromium } = await import('playwright-core')); } catch (e) {
  console.error('This needs playwright-core. Run npm install in this folder first.');
  process.exit(1);
}

const [pagePath = readFix().page || '/', selector = ''] = process.argv.slice(2);
const fix = readFix();
const server = await start(0, { live: false });
let browser;
for (const channel of ['chrome', 'msedge', undefined]) {
  try { browser = await chromium.launch({ channel, headless: true }); break; } catch (e) { /* try the next one */ }
}
if (!browser) {
  console.error('Couldn’t start a browser. Install Google Chrome, or run: npx playwright install chromium');
  process.exit(1);
}
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const u = new URL(pagePath, `http://127.0.0.1:${server.address().port}`);
u.searchParams.set('issues', (fix.issues || []).length ? fix.issues.join(',') : 'on');
u.searchParams.set('workshop', 'off');
u.searchParams.set('try', 'none');
await page.goto(u.toString(), { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(1000);
const html = await page.evaluate((sel) => {
  const pick = sel ? [...document.querySelectorAll(sel)].slice(0, 3) : [document.querySelector('main, #main') || document.body];
  return pick.map((el) => {
    const c = el.cloneNode(true);
    // The workshop's own parts, scripts and icon drawings only add noise.
    c.querySelectorAll('script, style, #ws-root, #ws-live, #rb-spotlight').forEach((n) => n.remove());
    c.querySelectorAll('svg').forEach((n) => { n.innerHTML = ''; });
    c.querySelectorAll('[src^="data:"]').forEach((n) => n.setAttribute('src', 'data:…'));
    return c.outerHTML.replace(/>\s+</g, '>\n<');
  }).join('\n\n');
}, selector);
console.log(html || `Nothing on ${pagePath} matches ${selector}`);
await browser.close();
server.close();
