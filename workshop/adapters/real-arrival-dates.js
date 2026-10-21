// Real Arrival Dates: turns "5–7 business days" into the dates it means, like
// "arrives Tue, Nov 3 – Thu, Nov 5".
//
// Shipping text often hides the date behind business-day counts and fine print. To work out
// when a package actually comes, you have to know today's date, skip weekends and count.
// That is hard for people with memory or attention differences, slow with a screen reader,
// and easy for an AI agent to get wrong. This adapter does the counting.
//
// Profile: reads the need "concreteDates". If the profile sets it to false, nothing changes.
// Options: today, a Date to count from (the loader passes the store's own date).
// Try it: search?q=charger&issues=31&try=real-arrival-dates
//
// To move it into the toolkit: put it in tools/adapters/, swap say() for announce() from
// '../utils/ai.js', and register it as docs/adding-to-the-catalog.md describes.

const RANGE = /(?:est\.\s*)?(\d+)\s*[–-]\s*(\d+)\s+business days\*?/gi;
const SINGLE = /(?:est\.\s*)?(\d+)\s+business days\*?/gi;
// Fine print that adds nothing once the date is worked out.
const HEDGES = [/,?\s*excluding weekends and holidays/gi, /,?\s*subject to carrier availability/gi];

function need(options, dimension, fallback) {
  const n = (options.profile?.fields?.needs || []).find((x) => x.dimension === dimension);
  return n ? n.value : fallback;
}

function say(text) {
  let live = document.getElementById('ws-live');
  if (!live) {
    live = Object.assign(document.createElement('div'), { id: 'ws-live' });
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.appendChild(live);
  }
  live.textContent = text;
}

export const RealArrivalDates = {
  enabled: false,
  replaced: null, // span we added → the text node it replaced
  observer: null,

  enable(options = {}) {
    if (this.enabled || need(options, 'concreteDates', true) === false) return;
    this.enabled = true;
    this.today = options.today ? new Date(options.today) : new Date();
    this.replaced = new Map();
    const n = this.sweep(document.body);
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.sweep(document.body); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
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
    let out = text
      .replace(RANGE, (_, a, b) => `arrives ${this.dateAfter(+a)} – ${this.dateAfter(+b)}`)
      .replace(SINGLE, (_, a) => `arrives ${this.dateAfter(+a)}`);
    if (out !== text) for (const h of HEDGES) out = out.replace(h, '');
    return out;
  },

  sweep(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (/business days/i.test(node.nodeValue) && !node.parentElement.closest('.ws-arrival, script, style')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const span = document.createElement('span');
      span.className = 'ws-arrival';
      span.title = 'The store said: ' + node.nodeValue.trim();
      span.textContent = this.rewrite(node.nodeValue);
      node.replaceWith(span);
      this.replaced.set(span, node);
    }
    return nodes.length;
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    for (const [span, node] of this.replaced) if (span.isConnected) span.replaceWith(node);
    this.replaced.clear();
    say('Shipping times back to how the store wrote them');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
