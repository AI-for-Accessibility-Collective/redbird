// No Surprise Extras: unticks a paid protection plan and a repeat order that the store picked
// for you, and says so next to each one.
//
// Some stores tick extras before you have chosen anything: a protection plan that costs more,
// or "Subscribe & Save", which sends the item again every few months until you cancel. They are
// easy to miss, and then you pay for something you didn't pick. Bill, the older adult in
// workshop/profiles/bill.json, worries about paying for something he didn't want. An AI agent
// shopping for someone can miss it too. This adapter unticks the plan, picks the one-time
// purchase, and adds a short note to each so you know what changed and can pick it again.
// Anything you change yourself after that is left alone.
//
// Options: none.
// Profile: nothing to read. It helps anyone who wants to pay only for what they picked.
// Try it: product?id=rb-20w-usbc-charger&try=no-surprise-extras&profile=bill

// Where Redbird puts these choices. On another store, change these to match its page.
const PLAN = 'input#protect';                // "Add a 2-year protection plan" checkbox
const REPEAT = 'input[name=buy][value=sub]'; // "Subscribe & Save", sent again every 6 months
const ONCE = 'input[name=buy][value=once]';  // "One-time purchase"

// A click on a checkbox or radio button sends "input" and "change" events. Send the same ones,
// so any store code that watches the choice (a price, a total) sees the new one.
function tell(input) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// One message for everything changed at once, like "Unticked the protection plan. You can
// change it back."
function summary(done) {
  const text = done.join(' and ');
  return text[0].toUpperCase() + text.slice(1) + `. You can change ${done.length === 1 ? 'it' : 'them'} back.`;
}

export const NoSurpriseExtras = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    this.changed = new Map(); // input we turned off → { picked: the one we picked instead (or null), note }
    this.theirs = new WeakSet(); // inputs the person changed themselves: never touched again
    // Notes are at least 16px, and larger when the person's text size is.
    const px = Math.round(16 * Math.max(100, Number(s.profile.get('fontScale')) || 100)) / 100;
    s.css('extras', `.ws-extras-note{display:block;margin:4px 0 0;padding:4px 8px;border-radius:6px;background:#eef3f8;color:#1f2933;font-size:${px}px;line-height:1.4}`);
    s.listen(document, 'change', (e) => this.noticed(e), true);
    const done = this.apply(s);
    // Some pages add these choices after they load, so look again when the page changes. This
    // store changes every second (countdown timers), so look at most twice a second.
    let queued = false;
    s.watch.added(document.body, () => {
      if (queued) return;
      queued = true;
      s.timer(() => {
        queued = false;
        const more = this.apply(s);
        if (more.length) s.announce(summary(more));
      }, 500);
    }, { batch: true });
    s.announce(done.length ? summary(done) : 'Watching for extras the store picks for you');
  },

  // Untick the plan and pick the one-time purchase, unless the person has already chosen.
  apply(s) {
    const done = [];
    for (const plan of document.querySelectorAll(PLAN)) {
      if (!plan.checked || this.skip(s, plan)) continue;
      plan.checked = false;
      tell(plan);
      this.note(s, plan, null, 'Unticked for you. Tick it if you want the plan.');
      done.push('unticked the protection plan');
    }
    for (const repeat of document.querySelectorAll(REPEAT)) {
      const once = repeat.closest('fieldset, form')?.querySelector(ONCE);
      if (!repeat.checked || !once || this.skip(s, repeat) || this.skip(s, once)) continue;
      once.checked = true; // picking one radio button unpicks the other
      tell(once);
      this.note(s, repeat, once, 'Changed to a one-time purchase for you. Pick the other choice if you want repeat orders.');
      done.push('picked a one-time purchase instead of a repeat order');
    }
    return done;
  },

  skip(s, input) {
    return this.theirs.has(input) || !!input.closest('#ws-root, .ws-panel') || s.page.isOurs(input);
  },

  // A short note under the choice. One note per choice, even if the store ticks it again.
  // disable() takes the note away and ticks the store's choice again, unless the person has
  // chosen since.
  note(s, input, picked, text) {
    if (this.changed.has(input)) return;
    const note = s.el('span', { text, attrs: { class: 'ws-extras-note' } });
    const after = input.closest('label') || input;
    s.insert(after.parentNode, note, after.nextSibling);
    this.changed.set(input, { picked, note });
    const theirs = this.theirs;
    s.onEnd(() => {
      if (theirs.has(input) || !input.isConnected) return;
      input.checked = true;
      tell(input);
    });
  },

  // The person changed a choice, so it's theirs now and its note is out of date. A real click
  // or key press makes a "trusted" event; the ones tell() sends are not.
  noticed(e) {
    if (!e.isTrusted) return;
    this.theirs.add(e.target);
    for (const [input, c] of this.changed) {
      if (input !== e.target && c.picked !== e.target) continue;
      this.theirs.add(input);
      c.note.remove();
    }
  },

  disable() {
    this.s?.end();
    this.s = null;
  },
};
