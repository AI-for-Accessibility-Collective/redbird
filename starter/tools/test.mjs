// Tests adapter.js on Redbird's pages, prints what it found, and saves it to test-report.md.
//
//   npm test                          the pages in fix.json, or a few common ones
//   npm test -- "/search?q=lamp"      only this page
//
// On each page it checks:
//   - that the adapter runs without errors
//   - which planted problems it fixes, using the same checks as the panel's red and green badges
//   - what it changed, and what a screen reader hears there with and without it
//   - that turning it off puts the page back
// Your own checks in checks/ run too (checks/README.md says how to write one).
//
// It drives Google Chrome (or Edge) in the background. Run npm install once first.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { start, readFix, ROOT, STORE } from './dev.mjs';

let chromium;
try { ({ chromium } = await import('playwright-core')); } catch (e) {
  console.error('The tests need playwright-core. Run npm install in this folder first.');
  process.exit(1);
}

const fix = readFix();
const COMMON = ['/', '/search?q=charger', '/product?id=rb-20w-usbc-charger', '/checkout?cart=rb-20w-usbc-charger'];
const asked = process.argv.slice(2).filter((a) => a.startsWith('/'));
const pages = asked.length ? asked : unique([fix.page, ...(fix.pages || [])].filter(Boolean).concat((fix.pages || []).length ? [] : COMMON));
const issues = (fix.issues || []).length ? fix.issues.join(',') : 'on';
const toolkit = (fix.toolkitAdapters || []).map((a) => a.id).filter(Boolean);
const WORDS = { present: 'not fixed', fixed: 'fixed', partly: 'partly fixed', nocheck: 'not checked automatically', waiting: 'only shows when a payment fails' };

function unique(list) { return list.filter((x, i) => list.indexOf(x) === i); }
function link(base, page, extra) {
  const u = new URL(page, base);
  u.searchParams.set('issues', issues);
  u.searchParams.set('workshop', 'off');
  u.searchParams.set('rbtest', '1');
  u.searchParams.set('today', '2026-11-02'); // the same delivery dates on every run
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  return u.toString();
}
function status(s) {
  if (!s) return 'not on this page';
  return s.status === 'partly' ? `partly fixed (${s.still} of ${s.places} places still have it)` : WORDS[s.status] || s.status;
}
function short(s, n = 120) { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
// Where on the page: the element like a CSS selector, then what it says.
function where(c) { return c.tag + (/“/.test(c.where) ? ' ' + c.where.slice(c.where.indexOf('“')) : ''); }
function value(v) { return v == null ? 'not set' : '“' + short(v, 60) + '”'; }
// Two texts that start the same are shown from where they differ, so a change near the end
// isn't cut off on both sides.
function differ(a, b) {
  a = String(a ?? '').replace(/\s+/g, ' ').trim(); b = String(b ?? '').replace(/\s+/g, ' ').trim();
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = i > 30 ? i - 15 : 0;
  const cut = (s) => (from ? '…' : '') + short(s.slice(from), 70);
  return [cut(a), cut(b)];
}
function what(c) {
  if (c.type === 'attr') return `${c.attr} is ${value(c.now)} (was ${value(c.before)})`;
  if (c.type === 'text') { const [was, now] = differ(c.before, c.now); return `the text is “${now}” (was “${was}”)`; }
  if (c.type === 'added') return 'added this';
  if (c.type === 'style') return 'added a style sheet';
  return 'removed this';
}
// One line per element, with everything that changed on it.
function byElement(list, max) {
  const groups = [];
  for (const c of list) {
    const g = c.type === 'style' ? null : groups.find((x) => x.el === c.el);
    if (g) g.parts.push(what(c)); else groups.push({ el: c.el, at: c.type === 'style' ? 'the page' : where(c), parts: [what(c)] });
  }
  // The same change to many elements (every star rating on the page) is one line.
  const rows = [];
  for (const g of groups) {
    const line = `${g.at}: ${g.parts.join(', ')}`;
    const r = rows.find((x) => x.line === line);
    if (r) r.n++; else rows.push({ line, n: 1 });
  }
  const lines = rows.slice(0, max).map((r) => `  - ${r.n > 1 ? r.n + ' times: ' : ''}${r.line}`);
  if (rows.length > max) lines.push(`  - and ${rows.slice(max).reduce((a, r) => a + r.n, 0)} more`);
  return lines;
}

async function launch() {
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { return await chromium.launch({ channel, headless: true }); } catch (e) { /* try the next one */ }
  }
  console.error('Couldn’t start a browser for the tests. Install Google Chrome, or run: npx playwright install chromium');
  process.exit(1);
}

// Loads a page and waits for the store and the adapters to settle.
async function open(page, url, adapter) {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => !!window.RB_ISSUE_REPORT, null, { timeout: 15000 });
  let ready = { error: null };
  if (adapter) ready = await page.evaluate((n) => window.RB_TEST.ready(n), adapter);
  await page.waitForTimeout(1500); // adapters that wait for the page to change, and AI answers
  return ready;
}

async function loadChecks(page) {
  await page.addScriptTag({ url: '/workshop/checks.js' }).catch(() => {});
  return page.evaluate(() => Object.keys(window.RB_CHECKS || {}).map(Number)).catch(() => []);
}

async function checksIn() {
  const dir = path.join(ROOT, 'checks');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => /\.m?js$/.test(f) && !f.startsWith('_')).sort();
  const out = [];
  for (const f of files) {
    try { out.push({ name: f, run: (await import(pathToFileURL(path.join(dir, f)) + '?at=' + Date.now())).default }); }
    catch (e) { out.push({ name: f, broken: e.message }); }
  }
  return out;
}

async function testPage(browser, base, pagePath, checks) {
  const lines = [`## ${pagePath}`, ''];
  const problems = [];
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const logged = [];
  page.on('pageerror', (e) => logged.push(e.message));
  page.on('console', (m) => { if (/^(\[workshop\] local|my adapter)/i.test(m.text())) logged.push(m.text().replace(/^\[workshop\] local:\s*/, '')); });

  // The page as the store has it, then with the adapter.
  await open(page, link(base, pagePath, { try: 'none' }));
  const before = await page.evaluate(() => window.RB_ISSUE_REPORT());
  logged.length = 0; // errors so far came from the store without the adapter
  const ready = await open(page, link(base, pagePath, { try: ['local', ...toolkit].join(',') }), 'local');
  const after = await page.evaluate(() => window.RB_ISSUE_REPORT());
  const changes = await page.evaluate(() => window.RB_TEST.changes('local'));
  const heard = (await page.evaluate(() => window.RB_TEST.heard())).filter((h) => h.who === 'local');
  // The store's ready-made checks for some planted problems (workshop/checks.js): they try the fix
  // the way the person would, like making a payment fail.
  const builtIn = await loadChecks(page);

  const errors = [];
  for (const e of [ready.error, ...logged].filter(Boolean).map((e) => String(e).replace(/^Stopped with an error:\s*/, '').split(/\s+at\s+\S+\s*\(/)[0].trim())) {
    if (!errors.some((x) => x.includes(e.replace(/^\w*Error:\s*/, '')) || e.includes(x))) errors.push(e);
  }
  if (errors.length) {
    problems.push('errors');
    lines.push(`- PROBLEM: it stopped with an error: ${errors.map((e) => short(e, 300)).join(' / ')}`);
  } else lines.push('- Ran without errors.');

  // Planted problems whose state changed, and the ones fix.json says this fix is about.
  const was = Object.fromEntries(before.map((s) => [s.issue, s]));
  const now = Object.fromEntries(after.map((s) => [s.issue, s]));
  const watched = (fix.issues || []).map(Number);
  const nums = unique([...before, ...after].map((s) => s.issue)).sort((a, b) => a - b);
  const moved = nums.filter((n) => status(was[n]) !== status(now[n]) || watched.includes(n));
  const better = [], worse = [];
  for (const n of moved) {
    const s = was[n] || now[n];
    // A problem that was on the page and no longer shows up anywhere was fixed in every place.
    const gone = was[n] && !now[n];
    const row = `${n} (${s.title}): ${status(was[n])} without the adapter, ${gone ? 'fixed with it (it no longer shows up anywhere on the page)' : status(now[n]) + ' with it'}`;
    const rank = (x) => (!x ? 3 : { fixed: 3, partly: 2 }[x.status] ?? 1);
    if (rank(now[n]) < rank(was[n])) worse.push(row); else better.push(row);
  }
  // Some can't be checked from the page (nocheck), and some only show after an action (waiting).
  const missed = watched.filter((n) => now[n] && /^(present|partly)$/.test(now[n].status) && pagePath === fix.page);
  const later = watched.filter((n) => now[n] && /^(nocheck|waiting)$/.test(now[n].status) && pagePath === fix.page);
  if (missed.length) {
    problems.push('missed');
    lines.push(`- PROBLEM: fix.json says this adapter fixes planted problem ${missed.join(' and ')}, but on this page it is still ${missed.map((n) => status(now[n])).join(' and ')}.`);
    for (const n of missed) if ((now[n].left || []).length) lines.push(`  - Problem ${n} is still at: ${now[n].left.join(', ')}${now[n].still > now[n].left.length ? ', …' : ''}`);
  }
  for (const n of later) {
    if (builtIn.includes(n)) { lines.push(`- Planted problem ${n} can't be seen from the page alone, so the ready-made check below tries it the way the person would.`); continue; }
    lines.push(now[n].status === 'waiting'
      ? `- Planted problem ${n} only shows after something happens on the page (e.g., a failed payment), so this test can't see it. Write a check in checks/ that makes it happen, then looks at what the adapter did.`
      : `- Planted problem ${n} can't be checked automatically. Write a check in checks/ for what the person needs, or try it yourself.`);
  }
  if (better.length) lines.push('- Planted problems:', ...better.map((r) => '  - ' + r));
  else lines.push('- It didn’t fix or break any planted problem on this page.');
  if (worse.length) { problems.push('worse'); lines.push('- PROBLEM: it made a planted problem worse:', ...worse.map((r) => '  - ' + r)); }

  if (!changes.length) {
    // On the fix's own page that is a problem, unless what it fixes only shows after an action.
    if (pagePath === fix.page && !later.some((n) => now[n].status === 'waiting')) {
      problems.push('nothing');
      lines.push('- PROBLEM: it changed nothing on this page.');
    } else lines.push('- It changed nothing on this page.');
  } else {
    const els = new Set(changes.map((c) => c.el)).size;
    lines.push(`- It changed ${els} thing${els === 1 ? '' : 's'} on the page:`, ...byElement(changes, 5));
  }
  if (heard.length) lines.push(`- It said out loud: ${heard.slice(0, 3).map((h) => '“' + short(h.text, 100) + '”').join(', ')}`);

  // Your own checks, on the page with the adapter on.
  let ran = 0;
  for (const c of checks) {
    if (c.broken) { problems.push('check'); lines.push(`- PROBLEM: checks/${c.name} didn’t load: ${short(c.broken, 200)}`); continue; }
    try {
      const results = [].concat((await c.run({ page, path: pagePath, fix })) || []);
      for (const r of results) {
        ran++;
        if (!r.ok) problems.push('check');
        lines.push(`- ${r.ok ? 'Check passed' : 'PROBLEM: check failed'} (${c.name}): ${short(r.says, 300)}`);
      }
    } catch (e) { problems.push('check'); lines.push(`- PROBLEM: checks/${c.name} stopped with an error: ${short(e.message, 300)}`); }
  }

  // A planted problem this test can't see on its own has to be covered by a check. Once the checks
  // have run (and, e.g., made a payment fail), look at it again.
  if (later.length) {
    if (!ran && later.some((n) => !builtIn.includes(n))) {
      problems.push('unchecked');
      const none = later.filter((n) => !builtIn.includes(n));
      lines.push(`- PROBLEM: nothing checks planted problem ${none.join(' and ')} yet, so this test would pass even if the adapter didn't work. Add a check in checks/ (see checks/README.md).`);
    } else {
      const again = Object.fromEntries((await page.evaluate(() => window.RB_ISSUE_REPORT()).catch(() => [])).map((s) => [s.issue, s]));
      for (const n of later) {
        const s2 = again[n];
        if (s2 && /^(present|partly)$/.test(s2.status)) {
          problems.push('missed');
          lines.push(`- PROBLEM: after the checks ran, planted problem ${n} is ${status(s2)}.`);
          if ((s2.left || []).length) lines.push(`  - Problem ${n} is still at: ${s2.left.join(', ')}`);
        } else if (s2 && s2.status === 'fixed') lines.push(`- After the checks ran, planted problem ${n} is fixed.`);
      }
      const more = (await page.evaluate(() => window.RB_TEST.changes('local')).catch(() => [])).filter((c) => !changes.some((x) => x.n === c.n));
      if (more.length) lines.push(`- While the checks ran, it changed ${new Set(more.map((c) => c.el)).size} more thing${more.length === 1 ? '' : 's'}:`, ...byElement(more, 3));
    }
  }

  // What a screen reader hears where it changed things: with the adapter, then after turning it off.
  const marks = unique(changes.filter((c) => c.mark && c.type !== 'style').map((c) => c.mark)).slice(0, 4);
  const heardWith = {};
  for (const m of marks) heardWith[m] = await page.locator(`[data-rbtest="${m}"]`).first().ariaSnapshot({ timeout: 2000 }).catch(() => null);
  const undo = await page.evaluate(() => window.RB_TEST.undo('local'));
  const spoken = [];
  for (const m of marks) {
    const off = await page.locator(`[data-rbtest="${m}"]`).first().ariaSnapshot({ timeout: 2000 }).catch(() => null);
    if (heardWith[m] != null && off != null && heardWith[m] !== off) {
      const c = changes.find((x) => x.mark === m);
      spoken.push(`  - At ${where(c)}:`, `    - without it: ${short(off, 200) || '(nothing)'}`, `    - with it: ${short(heardWith[m], 200) || '(nothing)'}`);
    }
  }
  if (spoken.length) lines.push('- What a screen reader hears where it changed things:', ...spoken);

  if (undo.error) { problems.push('undo'); lines.push(`- PROBLEM: disable() stopped with an error: ${short(undo.error, 300)}`); }
  if (undo.left.length) {
    problems.push('undo');
    const left = new Set(undo.left.map((c) => c.el)).size;
    lines.push(`- PROBLEM: turning it off left ${left} thing${left === 1 ? '' : 's'} changed. disable() should undo these:`,
      ...byElement(undo.left, 5));
  } else if (changes.length && !undo.error) lines.push('- Turning it off put the page back.');

  // The ready-made checks for the problems this fix is about, on a fresh copy of the page, since they
  // change it (they type, press buttons and let the cart timer run out).
  const mine = watched.filter((n) => builtIn.includes(n) && (now[n] || was[n]) && pagePath === fix.page);
  if (mine.length) {
    const fresh = await context.newPage();
    fresh.on('pageerror', (e) => logged.push(e.message));
    await open(fresh, link(base, pagePath, { try: ['local', ...toolkit].join(',') }), 'local');
    await loadChecks(fresh);
    for (const n of mine) {
      const results = await fresh.evaluate((k) => window.RB_CHECKS[k](window), n).catch((e) => [{ ok: false, says: 'the check stopped: ' + e.message.split('\n')[0] }]);
      for (const r of results) {
        if (!r.ok) problems.push('built-in');
        lines.push(`- ${r.ok ? 'Ready-made check passed' : 'PROBLEM: ready-made check failed'} (problem ${n}): ${short(r.says, 300)}`);
      }
    }
  }

  await context.close();
  return { lines, problems };
}

const server = await start(0, { live: false });
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await launch();
const checks = await checksIn();
const when = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const report = [`# Test report`, '',
  `adapter.js, tested ${when} on ${pages.length} page${pages.length === 1 ? '' : 's'} of ${STORE}, with ${issues === 'on' ? 'every planted problem' : 'planted problem ' + issues} on.`, ''];
const found = [];
for (const p of pages) {
  process.stdout.write(`Testing ${p}…\n`);
  try {
    const r = await testPage(browser, base, p, checks);
    report.push(...r.lines, '');
    if (r.problems.length) found.push(p);
  } catch (e) {
    report.push(`## ${p}`, '', `- PROBLEM: the test couldn’t finish on this page: ${short(e.message, 300)}`, '');
    found.push(p);
  }
}
report.push('## Summary', '', found.length ? `Look at the problems on ${found.join(', ')}.` : 'No problems found. Now try it the way the person you’re building for would (e.g., with their screen reader, with only the keyboard, or zoomed in).');
await browser.close();
server.close();
const text = report.join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'test-report.md'), text);
console.log('\n' + text);
process.exit(found.length ? 1 : 0);
