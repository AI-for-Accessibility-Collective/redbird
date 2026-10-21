// Real Arrival Dates: turns "5–7 business days" into the dates it means, like
// "arrives Tue, Nov 3 – Thu, Nov 5".
//
// Shipping text often hides the date behind business-day counts and fine print. To work out
// when a package actually comes, you have to know today's date, skip weekends and count.
// That is hard for people with memory or attention differences, slow with a screen reader,
// and easy for an AI agent to get wrong. This adapter does the counting.
//
// It only changes counts about shipping that start today. A count in a review ("mine took
// 8 business days") or one that starts from another day ("within 10 business days of
// receipt") stays as it is. Inside a sentence it keeps the store's words and adds the date
// after them, so the sentence still reads right.
//
// Profile: reads the need "concreteDates". If the profile sets it to false, nothing changes.
// Options: today, a Date to count from (the loader passes the store's own date).
// Try it: search?q=charger&issues=31&try=real-arrival-dates
//
// To move it into the toolkit: put it in tools/adapters/, swap say() for announce() from
// '../utils/ai.js', and register it as docs/adding-to-the-catalog.md describes.

// "5–7 business days", "5 to 7 business days", "est. 2 business days*"
const COUNT = /(?:est\.\s*)?(\d+)(?:\s*(?:[–-]|to)\s*(\d+))?\s+business days\*?/gi;
// Fine print that adds nothing once the date is worked out.
const HEDGES = [/,?\s*excluding weekends and holidays/gi, /,?\s*subject to carrier availability/gi];
// The paragraph, row or box around a count has to be about shipping (not refunds, say).
const ABOUT_SHIPPING = /ship|deliver|arriv/i;
// Counts that don't start today: in the past, or counted from another day.
const PAST = /\btook\s+(about\s+)?$/i;
const FROM_ANOTHER_DAY = /^\s*(of|after|from)\b/i;

function need(options, dimension, fallback) {
  const n = (options.profile?.fields?.needs || []).find((x) => x.dimension === dimension);
  return n ? n.value : fallback;
}

function say(text) {
  // On Redbird the workshop panel gives the page one voice, so messages don't talk over each other.
  if (window.RB_SAY) return window.RB_SAY(text);
  let live = document.getElementById('ws-live');
  if (!live) {
    live = Object.assign(document.createElement('div'), { id: 'ws-live' });
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.appendChild(live);
  }
  // Messages that come at the same moment (several adapters starting together) are read
  // together, instead of the last one replacing the rest. The region is emptied first, so
  // the same words said twice are read twice.
  live.waiting = (live.waiting || []).concat(text);
  clearTimeout(live.timer);
  live.timer = setTimeout(() => {
    const words = live.waiting.join('. ');
    live.waiting = [];
    live.textContent = '';
    setTimeout(() => { live.textContent = words; }, 60);
  }, 50);
}

export const RealArrivalDates = {
  enabled: false,
  changed: null, // text node → { was, now }: the store's words and ours
  observer: null,

  enable(options = {}) {
    if (this.enabled || need(options, 'concreteDates', true) === false) return;
    this.enabled = true;
    this.today = options.today ? new Date(options.today) : new Date();
    this.changed = new Map();
    const n = this.sweep(document.body);
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.sweep(document.body); }, 500);
    });
    this.observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    say(n ? `Showing real arrival dates in ${n} place${n === 1 ? '' : 's'}` : 'Watching for shipping times to turn into dates');
  },

  // Count business days forward from today, skipping Saturdays and Sundays.
  dateAfter(days) {
    const d = new Date(this.today);
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days--;
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  rewrite(text) {
    let out = text.replace(COUNT, (count, a, b, at) => {
      if (PAST.test(text.slice(0, at)) || FROM_ANOTHER_DAY.test(text.slice(at + count.length))) return count;
      const when = `arrives ${this.dateAfter(+a)}${b ? ` – ${this.dateAfter(+b)}` : ''}`;
      // On its own, in brackets or after a label, the date takes the count's place.
      // In a sentence ("please allow 6–9 business days for delivery") it goes after it.
      return /(^|[(:]\s*)$/.test(text.slice(0, at)) ? when : `${count} (${when})`;
    });
    if (out !== text) for (const h of HEDGES) out = out.replace(h, '');
    return out;
  },

  // Changes the words in place, so the page's layout and other adapters' changes stay as they are.
  sweep(root) {
    let n = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!/business days/i.test(node.nodeValue) || this.changed.get(node)?.now === node.nodeValue) continue;
      const box = node.parentElement?.closest('p, li, table, div');
      if (!box || !ABOUT_SHIPPING.test(box.textContent) || node.parentElement.closest('script, style')) continue;
      const now = this.rewrite(node.nodeValue);
      if (now === node.nodeValue) continue;
      this.changed.set(node, { was: node.nodeValue, now });
      node.nodeValue = now;
      n++;
    }
    return n;
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    for (const [node, { was, now }] of this.changed) if (node.nodeValue === now) node.nodeValue = was;
    this.changed.clear();
    say('Shipping times back to how the store wrote them');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
