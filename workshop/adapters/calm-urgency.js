// Calm Urgency: finds sales pressure, like countdown timers, "only 2 left", "14 people have
// this in their carts" and blinking SALE badges, and either labels it or hides it.
//
// These messages are built to rush people. For someone with anxiety or ADHD they can take over
// the whole page, and a ticking timer pulls attention every second. This adapter finds them by
// their wording, stops anything blinking, and then does what the option says.
//
// Options: mode
//   "label" (the default)  dims the message and adds a short plain note after the first one
//                          of each kind (twelve notes on one page would be clutter of their own)
//   "hide"                 hides it from view and from screen readers
// Profile: nothing to read. The store's panel picks the mode for the person.
// Try it: ?issues=24&try=calm-urgency&profile=mark

const KINDS = [
  { kind: 'timer', test: /\b(ends in|deal ends|offer ends)\b[^\n]*\d{1,2}:\d{2}/i,
    note: 'Sale timer. Timers like this often start over, so there is no need to rush.' },
  { kind: 'stock', test: /\bonly \d+ left\b/i,
    note: 'Low-stock message. Stores use these to hurry you along.' },
  // "14 other people have this in their carts", not "12 people found this helpful".
  { kind: 'crowd', test: /\b(\d+ (other )?people (have|are|bought|just)\b|in their carts?\b|high demand\b)/i,
    note: 'Pressure message. You can take your time.' },
];

export const CalmUrgency = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    this.mode = options.mode === 'hide' ? 'hide' : 'label';
    this.found = new Map(); // element → { kind, note }
    // Notes are at least 16px, and larger when the person's text size is.
    const px = Math.round(16 * Math.max(100, Number(s.profile.get('fontScale')) || 100)) / 100;
    s.css('calm',
      '.ws-calm-label{color:#5f6368 !important;font-weight:400 !important;animation:none !important}' +
      '.ws-calm-hide{display:none !important}' +
      `.ws-calm-note{display:block;font-size:${px}px;line-height:1.4;color:#3c4043;background:#eef3f8;border-radius:6px;padding:3px 8px;margin:3px 0}` +
      '.ws-calm-still{animation:none !important;visibility:visible !important}');
    const n = this.sweep(s);
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    s.watch.added(document.body, () => {
      if (queued) return;
      queued = true;
      s.timer(() => { queued = false; this.sweep(s); }, 500);
    }, { batch: true });
    s.announce(n ? `${this.mode === 'hide' ? 'Hid' : 'Labeled'} ${n} pressure message${n === 1 ? '' : 's'}` : 'Watching for pressure messages');
  },

  sweep(s) {
    let n = 0;
    const ours = (el) => s.page.isOurs(el) || !!el.closest('.ws-panel, .ws-calm-note');
    // Stop anything that blinks or flashes, whatever it says.
    for (const el of document.body.querySelectorAll('*')) {
      if (!el.classList || el.classList.contains('ws-calm-still') || ours(el)) continue;
      const anim = getComputedStyle(el).animationName, text = el.textContent.trim();
      // Short text only (a badge, not a whole panel sliding in), and not an empty spinner.
      if (anim && anim !== 'none' && text && text.length < 30) s.addClass(el, 'ws-calm-still');
    }
    // The smallest element whose text matches a pressure pattern.
    for (const el of document.body.querySelectorAll('div, span, p, li, b, strong')) {
      if (this.found.has(el) || ours(el)) continue;
      const text = el.textContent;
      const hit = KINDS.find((k) => k.test.test(text));
      if (!hit || [...el.children].some((c) => hit.test.test(c.textContent))) continue;
      const rec = { kind: hit.kind, note: null };
      if (this.mode === 'hide') {
        s.addClass(el, 'ws-calm-hide');
        s.setAttr(el, 'aria-hidden', 'true');
      } else {
        s.addClass(el, 'ws-calm-label');
        const noted = [...this.found.values()].some((r) => r.kind === hit.kind && r.note?.isConnected);
        if (!noted && el.parentNode) {
          rec.note = s.el('span', { text: hit.note, attrs: { class: 'ws-calm-note' } });
          s.insert(el.parentNode, rec.note, el.nextSibling);
        }
        // A ticking timer is noise for a screen reader. The note says what it is.
        if (hit.kind === 'timer') s.setAttr(el, 'aria-hidden', 'true');
      }
      this.found.set(el, rec);
      n++;
    }
    return n;
  },

  disable() {
    this.s?.end();
    this.s = null;
  },
};
