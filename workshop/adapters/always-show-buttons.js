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
// Options: none.
// Profile: nothing to read. It helps anyone who doesn't use a mouse, or can't hold one steady.
// Try it: search?q=charger&issues=21&try=always-show-buttons

// Buttons that sit right inside a product card. On another store, change this to match its cards.
const BUTTONS = '.card > .btn';

export const AlwaysShowButtons = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    this.shown = new WeakMap(); // button → true if we made it reachable with Tab, otherwise false
    // !important wins over the store's hover-only rule. ":root" makes the focus ring win over
    // the store's rule that turns focus rings off.
    s.css('show-buttons',
      ':root .ws-shown{visibility:visible !important;opacity:1 !important}' +
      ':root .ws-shown:focus-visible{outline:3px solid #0b6e99 !important;outline-offset:2px}');
    s.listen(document, 'keydown', (e) => this.key(e), true);
    const n = this.sweep(s);
    // Search results are drawn again after each filter, so look again when the page changes.
    // This store changes every second (countdown timers), so look at most twice a second.
    let queued = false;
    s.watch.added(document.body, () => {
      if (queued) return;
      queued = true;
      s.timer(() => { queued = false; this.sweep(s); }, 500);
    }, { batch: true });
    s.announce(n ? `Showed ${n} button${n === 1 ? '' : 's'} that only appeared under the mouse` : 'Watching for buttons that only appear under the mouse');
  },

  sweep(s) {
    let n = 0;
    for (const btn of document.querySelectorAll(BUTTONS)) {
      if (this.shown.has(btn) || btn.closest('#ws-root, .ws-panel') || s.page.isOurs(btn) || !this.hiddenUntilHover(btn)) continue;
      s.addClass(btn, 'ws-shown');
      let reachable = false;
      // A clickable box that isn't a real button or link: let Tab reach it, and say it's a button.
      if (!btn.matches('button, a[href], input, [tabindex]')) {
        s.setAttr(btn, 'tabindex', '0');
        if (!btn.getAttribute('role')) s.setAttr(btn, 'role', 'button');
        reachable = true;
      }
      this.shown.set(btn, reachable);
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
    this.s?.end();
    this.s = null;
  },
};
