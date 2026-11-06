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
// Options: today, the day to count from, as 'YYYY-MM-DD' (the store can pin its own date).
//          Without it, today's date.
// Profile: nothing to read.
// Try it: search?q=charger&issues=31&try=real-arrival-dates

// "5–7 business days", "5 to 7 business days", "est. 2 business days*"
const COUNT = /(?:est\.\s*)?(\d+)(?:\s*(?:[–-]|to)\s*(\d+))?\s+business days\*?/gi;
// Fine print that adds nothing once the date is worked out.
const HEDGES = [/,?\s*excluding weekends and holidays/gi, /,?\s*subject to carrier availability/gi];
// The paragraph, row or box around a count has to be about shipping (not refunds, say).
const ABOUT_SHIPPING = /ship|deliver|arriv/i;
// Counts that don't start today: in the past, or counted from another day.
const PAST = /\btook\s+(about\s+)?$/i;
const FROM_ANOTHER_DAY = /^\s*(of|after|from)\b/i;

// 10 am on that day, as the store counts, so adding days never crosses midnight.
function startDay(today) {
  let d = /^\d{4}-\d{2}-\d{2}$/.test(String(today || '')) ? new Date(today + 'T10:00:00') : new Date();
  if (isNaN(d)) d = new Date();
  d.setHours(10, 0, 0, 0);
  return d;
}

export const RealArrivalDates = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    this.today = startDay(options.today);
    this.now = new WeakMap(); // text node → the words we gave it
    const n = this.sweep(s, document.body);
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    s.watch.added(document.body, () => {
      if (queued) return;
      queued = true;
      s.timer(() => { queued = false; this.sweep(s, document.body); }, 500);
    }, { types: ['childList', 'characterData'], batch: true });
    s.announce(n ? `Showing real arrival dates in ${n} place${n === 1 ? '' : 's'}` : 'Watching for shipping times to turn into dates');
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

  // Changes the words in place, so the page's layout and other adapters' changes stay as they
  // are. disable() puts the store's words back, unless the store has changed them since.
  sweep(s, root) {
    let n = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!/business days/i.test(node.nodeValue) || this.now.get(node) === node.nodeValue) continue;
      const box = node.parentElement?.closest('p, li, table, div');
      if (!box || !ABOUT_SHIPPING.test(box.textContent) || node.parentElement.closest('script, style')) continue;
      if (s.page.isOurs(node.parentElement)) continue;
      const now = this.rewrite(node.nodeValue);
      if (now === node.nodeValue) continue;
      s.text.set(node, now);
      this.now.set(node, now);
      n++;
    }
    return n;
  },

  disable() {
    this.s?.end();
    this.s = null;
  },
};
