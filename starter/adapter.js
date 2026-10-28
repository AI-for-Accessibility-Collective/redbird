// My Adapter: one sentence on what it changes on the page.
//
// Who it helps and why: which barrier this removes, for whom.
//
// Profile: which needs it reads, if any (options.profile, see AGENTS.md).
// Try it: npm run dev, then open the address it prints.
//
// Change the parts marked TODO.
// Every adapter has the same four parts: enabled, enable(), disable() and toggle(). disable()
// has to put the page back exactly the way it was.

// Tells screen reader users what happened, through the store's one live region.
function say(text) {
  if (window.RB_SAY) window.RB_SAY(text);
}

export const MyAdapter = {
  enabled: false,
  changed: null, // remember what you changed so disable() can undo it

  enable(options = {}) {
    if (this.enabled) return;
    this.enabled = true;
    this.changed = [];
    // TODO: find the problem on the page, for example:
    //   document.querySelectorAll('[data-swatch]')
    // and fix it, saving what you change:
    //   this.changed.push({ el, attr: 'aria-label', before: el.getAttribute('aria-label') });
    //   el.setAttribute('aria-label', 'New name');
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    for (const c of this.changed) {
      c.before === null ? c.el.removeAttribute(c.attr) : c.el.setAttribute(c.attr, c.before);
    }
    this.changed = [];
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
