// My Adapter: one sentence on what it changes on the page.
//
// Who it helps and why: which barrier this removes, for whom.
//
// Options: the settings the store's panel can pass, if any (plain values, like mode: 'hide').
// Profile: which of the person's settings it reads, if any (s.profile.get('fontScale'), ...).
// Try it: publish it as below, with --runs-on 'https://redbird-workshop.vercel.app/*', and open
// the store. (The panel's ?try= runs only the store's own adaptations and the toolkit's built-ins.)
//
// Copy this file, rename it (for example to bigger-buttons.js), and change the parts marked TODO.
// An adapter has two parts: enable() makes the change, and disable() puts the page back exactly
// the way it was. Make every change through the session `s` (s.setAttr, s.setStyle, s.addClass,
// s.css, s.insert, s.listen, s.announce, ...): s.end() then undoes all of it. The toolkit's
// building blocks are listed in the ai4a11y-toolkit skill (reference/building-blocks.md).
//
// The same file is a toolkit web module: the ai4a11y-toolkit skill's helper publishes it to a
// toolkit (node <skill folder>/scripts/adapter.mjs publish my-adapter.js ...), and the toolkit's
// browser extension then runs it on any site you choose.

export const MyAdapter = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return; // already on
    const s = (this.s = toolkit.session());
    // TODO: find the problem on the page, for example:
    //   for (const el of document.querySelectorAll('[data-swatch]')) ...
    // and fix it through the session, for example:
    //   s.setAttr(el, 'aria-label', 'New name');
    // Then tell a screen reader what changed, in a few plain words:
    //   s.announce('Named 3 color swatches');
  },

  disable() {
    this.s?.end(); // undoes every change made through s, in reverse
    this.s = null;
  },
};
