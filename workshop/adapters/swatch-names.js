// Swatch Names: gives unnamed color swatches a name a screen reader can say, and makes
// them work with the keyboard.
//
// Many stores show colors as plain colored circles. A screen reader says nothing useful, and
// the keyboard skips them, so a blind shopper can't tell which color they're picking. This
// adapter finds small, round, empty elements filled with one color, names each one from the
// closest color in a short list, and:
//   - clickable swatches become a group of radio buttons: Tab to the group, arrow keys to move,
//     Space to pick, and the name and "selected" are read out
//   - color dots that aren't clickable (like on product cards) just get their name
// It doesn't change how anything looks. disable() puts every attribute back.
//
// Profile: nothing to read. It helps anyone who can't see the colors.
// Try it: product?id=hearth-oak-kettle&issues=6&try=swatch-names

// Plain color names and a typical shade of each. A name can appear twice to cover a wider range.
const COLORS = [
  ['black', '#161616'], ['black', '#2c2c2c'], ['charcoal gray', '#3d3f42'], ['slate gray', '#5d6770'], ['gray', '#8f9195'], ['gray', '#a8aaad'],
  ['light gray', '#c4c6c8'], ['white', '#f6f6f4'], ['cream', '#efe6d2'], ['beige', '#d8cab0'], ['brown', '#7a4b2a'],
  ['red', '#c62828'], ['dark red', '#8c1515'], ['pink', '#f2a7b8'], ['light pink', '#e8c4c0'], ['orange', '#ef7d22'],
  ['yellow', '#f2c94c'], ['olive green', '#6b7048'], ['green', '#2e7d32'], ['sage green', '#9caf94'], ['forest green', '#2f4f3a'],
  ['teal', '#1b8a8f'], ['light blue', '#8cb8d8'], ['blue', '#2a5bc4'], ['steel blue', '#2e5e8c'], ['dusty blue', '#7d96ae'],
  ['navy blue', '#1f2a44'], ['lavender', '#b8a9d6'], ['purple', '#6a3d9a'], ['plum', '#6e4a6b'],
];

function rgb(css) {
  const m = css.match(/\d+(\.\d+)?/g);
  return m ? m.slice(0, 3).map(Number) : null;
}
function hexRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
// "Redmean" color distance: cheap, and closer to how people see color than plain RGB distance.
function closestName(color) {
  let best = null, bestD = Infinity;
  for (const [name, hex] of COLORS) {
    const [r, g, b] = hexRgb(hex), rm = (color[0] + r) / 2;
    const d = (2 + rm / 256) * (color[0] - r) ** 2 + 4 * (color[1] - g) ** 2 + (2 + (255 - rm) / 256) * (color[2] - b) ** 2;
    if (d < bestD) { bestD = d; best = name; }
  }
  return best;
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

export const SwatchNames = {
  enabled: false,
  touched: null, // element → the attributes it had before
  observer: null,

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.touched = new Map();
    this.onKey = (e) => this.key(e);
    this.onClick = (e) => this.picked(e);
    const n = this.sweep();
    document.addEventListener('keydown', this.onKey, true);
    document.addEventListener('click', this.onClick, true);
    // Pages like this one change every second (countdown timers), so scan at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.sweep(); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    say(n ? `Named ${n} color swatch${n === 1 ? '' : 'es'}` : 'Watching for color swatches');
  },

  // A swatch: small, round, empty, filled with one color, and with no name of its own.
  isSwatch(el) {
    if (this.touched.has(el) || el.children.length || el.textContent.trim()) return false;
    if (el.closest('label, button, [role=img], [role=radio], [aria-label], .ws-panel')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.width > 64 || Math.abs(r.width - r.height) > 4) return false;
    const cs = getComputedStyle(el);
    // Slider handles and badges are positioned on top of things. Swatches sit in a row.
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;
    if (!cs.borderRadius.includes('%') && parseFloat(cs.borderRadius) < r.width * 0.3) return false;
    const c = rgb(cs.backgroundColor);
    return c && !/rgba\(.*, 0\)$/.test(cs.backgroundColor) && !/transparent/.test(cs.backgroundColor);
  },

  mark(el, attrs) {
    if (!this.touched.has(el)) {
      const before = {};
      for (const k of Object.keys(attrs)) before[k] = el.getAttribute(k);
      this.touched.set(el, before);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  },

  sweep() {
    const found = [...document.body.querySelectorAll('span, div, i, a')].filter((el) => this.isSwatch(el));
    // Swatches that share a parent's parent form one group (one color picker).
    const groups = new Map();
    for (const el of found) {
      const g = el.parentElement.parentElement;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(el);
    }
    for (const [group, els] of groups) {
      const clickable = els.length > 1 && getComputedStyle(els[0]).cursor === 'pointer';
      els.forEach((el) => {
        const name = closestName(rgb(getComputedStyle(el).backgroundColor));
        if (!clickable) return this.mark(el, { role: 'img', 'aria-label': name });
        this.mark(el, { role: 'radio', 'aria-label': name, 'aria-checked': 'false', tabindex: '-1' });
      });
      if (clickable) {
        this.mark(group, { role: 'radiogroup', 'aria-label': 'Color' });
        // The picked one is usually drawn differently from the rest (a ring or outline).
        const looks = els.map((el) => getComputedStyle(el).boxShadow + getComputedStyle(el).outlineStyle);
        const odd = els.find((el, i) => looks.filter((l) => l === looks[i]).length === 1);
        this.check(odd || null, els);
      }
    }
    return found.length;
  },

  check(el, els) {
    els.forEach((x, i) => {
      x.setAttribute('aria-checked', String(x === el));
      x.setAttribute('tabindex', x === el || (!el && i === 0) ? '0' : '-1');
    });
  },

  picked(e) {
    const el = e.target.closest?.('[role=radio]');
    if (!el || !this.touched.has(el)) return;
    const els = [...el.closest('[role=radiogroup]').querySelectorAll('[role=radio]')];
    this.check(el, els);
    say(`${el.getAttribute('aria-label')} selected`);
  },

  key(e) {
    const el = e.target.closest?.('[role=radio]');
    if (!el || !this.touched.has(el)) return;
    const els = [...el.closest('[role=radiogroup]').querySelectorAll('[role=radio]')];
    const i = els.indexOf(el);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      const next = els[(i + step + els.length) % els.length];
      next.click();
      next.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      el.click();
    }
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    document.removeEventListener('keydown', this.onKey, true);
    document.removeEventListener('click', this.onClick, true);
    for (const [el, before] of this.touched) {
      for (const [k, v] of Object.entries(before)) v === null ? el.removeAttribute(k) : el.setAttribute(k, v);
    }
    this.touched.clear();
    say('Color swatch names removed');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
