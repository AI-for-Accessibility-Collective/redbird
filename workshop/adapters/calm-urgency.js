// Calm Urgency: finds sales pressure, like countdown timers, "only 2 left", "14 people have
// this in their carts" and blinking SALE badges, and either labels it or hides it.
//
// These messages are built to rush people. For someone with anxiety or ADHD they can take over
// the whole page, and a ticking timer pulls attention every second. This adapter finds them by
// their wording, stops anything blinking, and then does what the profile asks.
//
// Profile: reads the need "urgency".
//   "label" (the default)  dims the message and adds a short plain note after it
//   "hide"                 hides it from view and from screen readers
// Try it: ?issues=23&try=calm-urgency&profile=riley

const KINDS = [
  { kind: 'timer', test: /\b(ends in|deal ends|offer ends)\b[^\n]*\d{1,2}:\d{2}/i,
    note: 'Sale timer. Timers like this often start over, so there is no need to rush.' },
  { kind: 'stock', test: /\bonly \d+ left\b/i,
    note: 'Low-stock message. Stores use these to hurry you along.' },
  { kind: 'crowd', test: /\b(\d+ (other )?people|high demand)\b/i,
    note: 'Pressure message. You can take your time.' },
];

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

export const CalmUrgency = {
  styleId: 'ws-calm-styles',
  enabled: false,
  found: null, // element → { kind, note, hadAriaHidden }
  observer: null,

  enable(options = {}) {
    if (this.enabled) return;
    this.enabled = true;
    this.mode = need(options, 'urgency', 'label') === 'hide' ? 'hide' : 'label';
    this.found = new Map();
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent =
      '.ws-calm-label{color:#5f6368 !important;font-weight:400 !important;animation:none !important}' +
      '.ws-calm-hide{display:none !important}' +
      '.ws-calm-note{display:block;font-size:13px;color:#3c4043;background:#eef3f8;border-radius:6px;padding:3px 8px;margin:3px 0}' +
      '.ws-calm-still{animation:none !important;visibility:visible !important}';
    document.head.appendChild(style);
    const n = this.sweep();
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.sweep(); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    say(n ? `${this.mode === 'hide' ? 'Hid' : 'Labeled'} ${n} pressure message${n === 1 ? '' : 's'}` : 'Watching for pressure messages');
  },

  sweep() {
    let n = 0;
    // Stop anything that blinks or flashes, whatever it says.
    for (const el of document.body.querySelectorAll('*')) {
      if (el.closest('.ws-panel') || el.classList.contains('ws-calm-still')) continue;
      const anim = getComputedStyle(el).animationName;
      if (anim && anim !== 'none' && el.textContent.trim().length < 30) el.classList.add('ws-calm-still');
    }
    // The smallest element whose text matches a pressure pattern.
    for (const el of document.body.querySelectorAll('div, span, p, li, b, strong')) {
      if (this.found.has(el) || el.closest('.ws-panel, .ws-calm-note')) continue;
      const text = el.textContent;
      const hit = KINDS.find((k) => k.test.test(text));
      if (!hit || [...el.children].some((c) => hit.test.test(c.textContent))) continue;
      const rec = { kind: hit.kind, hadAriaHidden: el.getAttribute('aria-hidden') };
      if (this.mode === 'hide') {
        el.classList.add('ws-calm-hide');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.classList.add('ws-calm-label');
        rec.note = Object.assign(document.createElement('span'), { className: 'ws-calm-note', textContent: hit.note });
        el.after(rec.note);
        // A ticking timer is noise for a screen reader. The note says what it is.
        if (hit.kind === 'timer') el.setAttribute('aria-hidden', 'true');
      }
      this.found.set(el, rec);
      n++;
    }
    return n;
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    for (const [el, rec] of this.found) {
      el.classList.remove('ws-calm-hide', 'ws-calm-label');
      rec.hadAriaHidden === null ? el.removeAttribute('aria-hidden') : el.setAttribute('aria-hidden', rec.hadAriaHidden);
      rec.note?.remove();
    }
    this.found.clear();
    document.querySelectorAll('.ws-calm-still').forEach((el) => el.classList.remove('ws-calm-still'));
    document.getElementById(this.styleId)?.remove();
    say('Pressure messages back as the store showed them');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
