// Always Show Buttons: shows the "Add to cart" buttons on product cards that only appear while
// a mouse is over the card, and lets the keyboard reach them.
//
// Some stores hide each card's buttons until the mouse moves over the card, to make the page
// look tidy. People who use a keyboard, a switch or voice control don't hover, so they never
// see the button and Tab skips it. People with a tremor have to hold the mouse still over the
// card and hit a button that disappears when the pointer slips off. This adapter finds card
// buttons hidden this way and shows them. A hidden button still takes up its space, so showing
// it moves nothing. It also gives them a clear focus ring, and if a button is a clickable box
// rather than a real button, it makes Tab reach it and Enter or Space press it.
//
// Profile: nothing to read. It helps anyone who doesn't use a mouse, or can't hold one steady.
// Try it: search?q=charger&issues=21&try=always-show-buttons

// Buttons that sit right inside a product card. On another store, change this to match its cards.
const BUTTONS = '.card > .btn';

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
  // Empty it first, so the same words said twice are read twice.
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 60);
}

export const AlwaysShowButtons = {
  styleId: 'ws-show-buttons-styles',
  enabled: false,
  shown: null, // button → the role and tabindex it had, if we changed them (otherwise null)
  observer: null,

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.shown = new Map();
    const style = document.createElement('style');
    style.id = this.styleId;
    // !important wins over the store's hover-only rule. ":root" makes the focus ring win over
    // the store's rule that turns focus rings off.
    style.textContent =
      ':root .ws-shown{visibility:visible !important;opacity:1 !important}' +
      ':root .ws-shown:focus-visible{outline:3px solid #0b6e99 !important;outline-offset:2px}';
    document.head.appendChild(style);
    this.onKey = (e) => this.key(e);
    document.addEventListener('keydown', this.onKey, true);
    const n = this.sweep();
    // Search results are drawn again after each filter, so look again when the page changes.
    // This store changes every second (countdown timers), so look at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.sweep(); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    say(n ? `Showed ${n} button${n === 1 ? '' : 's'} that only appeared under the mouse` : 'Watching for buttons that only appear under the mouse');
  },

  sweep() {
    let n = 0;
    for (const btn of document.querySelectorAll(BUTTONS)) {
      if (this.shown.has(btn) || btn.closest('#ws-root, .ws-panel') || !this.hiddenUntilHover(btn)) continue;
      btn.classList.add('ws-shown');
      let before = null;
      // A clickable box that isn't a real button or link: let Tab reach it, and say it's a button.
      if (!btn.matches('button, a[href], input, [tabindex]')) {
        before = { role: btn.getAttribute('role'), tabindex: null };
        btn.setAttribute('tabindex', '0');
        if (!before.role) btn.setAttribute('role', 'button');
      }
      this.shown.set(btn, before);
      n++;
    }
    return n;
  },

  // Hidden with visibility or opacity, which keep the button's space. A card under the mouse
  // shows its button, so we can't tell for that one. Showing it anyway changes nothing.
  hiddenUntilHover(btn) {
    const cs = getComputedStyle(btn);
    return cs.visibility === 'hidden' || cs.opacity === '0' || btn.parentElement.matches(':hover');
  },

  // Enter or Space presses a clickable box we made reachable, as they would a real button.
  key(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!this.shown.get(e.target)) return;
    e.preventDefault();
    e.target.click();
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    document.removeEventListener('keydown', this.onKey, true);
    for (const [btn, before] of this.shown) {
      btn.classList.remove('ws-shown');
      if (!before) continue;
      for (const [k, v] of Object.entries(before)) v === null ? btn.removeAttribute(k) : btn.setAttribute(k, v);
    }
    this.shown.clear();
    document.getElementById(this.styleId)?.remove();
    say('Card buttons back to showing only under the mouse');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
