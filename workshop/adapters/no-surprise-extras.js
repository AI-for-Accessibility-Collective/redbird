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
// Profile: nothing to read. It helps anyone who wants to pay only for what they picked.
// Try it: product?id=rb-20w-usbc-charger&try=no-surprise-extras&profile=bill

// Where Redbird puts these choices. On another store, change these to match its page.
const PLAN = 'input#protect';                // "Add a 2-year protection plan" checkbox
const REPEAT = 'input[name=buy][value=sub]'; // "Subscribe & Save", sent again every 6 months
const ONCE = 'input[name=buy][value=once]';  // "One-time purchase"

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
  enabled: false,
  changed: null, // input we turned off → { picked: the one we picked instead (or null), note }
  theirs: null, // inputs the person changed themselves: never touched again
  observer: null,

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.changed = new Map();
    this.theirs = new WeakSet();
    this.onChange = (e) => this.noticed(e);
    document.addEventListener('change', this.onChange, true);
    const done = this.apply();
    // Some pages add these choices after they load, so look again when the page changes. This
    // store changes every second (countdown timers), so look at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => {
        queued = false;
        if (!this.enabled) return;
        const more = this.apply();
        if (more.length) say(summary(more));
      }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    say(done.length ? summary(done) : 'Watching for extras the store picks for you');
  },

  // Untick the plan and pick the one-time purchase, unless the person has already chosen.
  apply() {
    const done = [];
    for (const plan of document.querySelectorAll(PLAN)) {
      if (!plan.checked || this.skip(plan)) continue;
      plan.checked = false;
      tell(plan);
      this.note(plan, null, 'Unticked for you. Tick it if you want the plan.');
      done.push('unticked the protection plan');
    }
    for (const repeat of document.querySelectorAll(REPEAT)) {
      const once = repeat.closest('fieldset, form')?.querySelector(ONCE);
      if (!repeat.checked || !once || this.skip(repeat) || this.skip(once)) continue;
      once.checked = true; // picking one radio button unpicks the other
      tell(once);
      this.note(repeat, once, 'Changed to a one-time purchase for you. Pick the other choice if you want repeat orders.');
      done.push('picked a one-time purchase instead of a repeat order');
    }
    return done;
  },

  skip(input) {
    return this.theirs.has(input) || !!input.closest('#ws-root, .ws-panel');
  },

  // A short note under the choice. One note per choice, even if the store ticks it again.
  note(input, picked, text) {
    if (this.changed.has(input)) return;
    const note = document.createElement('span');
    note.className = 'ws-extras-note';
    note.textContent = text;
    note.style.cssText = 'display:block;margin:4px 0 0;padding:4px 8px;border-radius:6px;background:#eef3f8;color:#1f2933;font-size:14px';
    (input.closest('label') || input).after(note);
    this.changed.set(input, { picked, note });
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
    if (!this.enabled) return;
    this.enabled = false;
    this.observer.disconnect();
    document.removeEventListener('change', this.onChange, true);
    // Put back what the store picked, except where the person has chosen since.
    for (const [input, c] of this.changed) {
      c.note.remove();
      if (this.theirs.has(input) || !input.isConnected) continue;
      input.checked = true;
      tell(input);
    }
    this.changed.clear();
    say('Extras back as the store picked them');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
