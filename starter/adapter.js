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

// Tells screen reader users what happened. On Redbird the workshop panel gives the page one voice,
// so messages don't talk over each other. Anywhere else this makes its own polite live region.
function say(text) {
  if (window.RB_SAY) return window.RB_SAY(text);
  let live = document.getElementById('ws-live');
  if (!live) {
    live = Object.assign(document.createElement('div'), { id: 'ws-live' });
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.appendChild(live);
  }
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 60);
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
