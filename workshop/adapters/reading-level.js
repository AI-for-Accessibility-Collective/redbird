// Reading Level: rewrites hard paragraphs at the reading level set in the profile, with a
// button to show the original.
//
// Product descriptions full of marketing jargon, and return policies written as one long legal
// sentence, shut out people with reading or cognitive disabilities and people reading in a
// second language. This adapter scores each paragraph with the Flesch-Kincaid grade formula,
// and asks an AI model to rewrite the ones well above the profile's level.
//
// Profile: reads "readingLevel", a US school grade like 6. Without one it uses grade 8.
// Options:
//   rewrite(text, instructions)  returns a Promise of the new text, or null. The loader's
//                                version calls Gemini with a key typed into the workshop panel.
//   fallback(text)               used when rewrite gives nothing. On Redbird it returns the
//                                store's own plain description, so the demo works offline.
// Try it: product?id=rb-20w-usbc-charger&issues=27&try=reading-level&profile=dario

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}
// Flesch-Kincaid grade: longer sentences and longer words mean a higher grade.
export function gradeOf(text) {
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  if (!words.length) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}

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
  // Messages that come at the same moment (several adapters starting together) are read
  // together, instead of the last one replacing the rest. The region is emptied first, so
  // the same words said twice are read twice.
  live.waiting = (live.waiting || []).concat(text);
  clearTimeout(live.timer);
  live.timer = setTimeout(() => {
    const words = live.waiting.join('. ');
    live.waiting = [];
    live.textContent = '';
    setTimeout(() => { live.textContent = words; }, 60);
  }, 50);
}

export const ReadingLevel = {
  enabled: false,
  changed: null, // element → a box holding its original child nodes
  observer: null,

  async enable(options = {}) {
    if (this.enabled) return;
    this.enabled = true;
    this.options = options;
    this.changed = new Map();
    this.seen = new WeakSet(); // paragraphs already rewritten, or waiting for the AI
    this.asked = new Map(); // text → its rewrite (a Promise), so the same text is only sent once
    this.target = options.profile?.fields?.readingLevel ?? 8;
    this.instructions = `Rewrite this text so a reader at a US grade ${this.target} reading level can follow it. ` +
      'Keep every fact, number, name, date and condition. Use short sentences and everyday words, and keep an adult tone. ' +
      'Write it as one plain paragraph, with no lists, headings or markdown, and reply with only the rewritten text.';
    // Answers that come back after disable(), or after a second enable(), are thrown away.
    const run = (this.run = {});
    const hard = this.findHard();
    say(hard.length ? `Rewriting ${hard.length} long paragraph${hard.length === 1 ? '' : 's'} in plain language` : 'Nothing on this page needs rewriting');
    // Pages add text later (a new step at checkout, more reviews), so look again at most twice a second.
    let queued = false;
    this.observer = new MutationObserver(() => {
      if (queued || !this.enabled) return;
      queued = true;
      setTimeout(() => { queued = false; if (this.enabled) this.rewriteAll(this.findHard(), run); }, 500);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
    const n = await this.rewriteAll(hard, run);
    if (hard.length && this.run === run) say(n ? `Rewrote ${n} paragraph${n === 1 ? '' : 's'}. Each one has a Show original button.` : 'Could not rewrite the paragraphs this time');
  },

  // Paragraphs and list items you can see, with 15 words or more (most product descriptions
  // are 15 to 25), well above the target grade.
  findHard() {
    return [...document.body.querySelectorAll('p, li')].filter((el) => {
      if (this.seen.has(el) || el.closest('.ws-panel, nav, header, footer') || !el.getClientRects().length) return false;
      const text = el.textContent.trim();
      return text.split(/\s+/).length >= 15 && gradeOf(text) > this.target + 2;
    });
  },

  // Asks for every paragraph at once, so the page doesn't wait on them one by one.
  // Returns how many it rewrote.
  async rewriteAll(els, run) {
    const done = await Promise.all(els.map(async (el) => {
      this.seen.add(el);
      const text = el.textContent.trim();
      if (!this.asked.has(text)) this.asked.set(text, this.ask(text));
      const plain = await this.asked.get(text);
      if (!plain || this.run !== run || !el.isConnected) return false;
      this.swap(el, text, plain);
      return true;
    }));
    return done.filter(Boolean).length;
  },

  async ask(text) {
    let plain = null;
    try {
      if (this.options.rewrite) plain = await this.options.rewrite(text, this.instructions);
    } catch { /* no AI right now: try the fallback */ }
    return plain || (this.options.fallback ? this.options.fallback(text) : null);
  },

  swap(el, original, plain) {
    // The paragraph's own nodes wait in a box that is not on the page, not in a plain list.
    // Other adapters change those nodes too: abbreviation-expand wraps "MSRP" in an underlined
    // mark, and takes the mark off by swapping it back inside whatever holds it. In a plain
    // list nothing held it, so the mark stayed, and came back with the paragraph even after
    // abbreviation-expand was turned off.
    const kept = document.createElement('div');
    kept.append(...el.childNodes);
    this.changed.set(el, kept);
    const note = document.createElement('span');
    note.style.cssText = 'display:block;font-size:12.5px;color:#5f6368;margin-top:4px';
    note.textContent = 'Rewritten in plain language. ';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Show original';
    btn.style.cssText = 'font:inherit;color:#0b6e99;background:none;border:0;padding:0;text-decoration:underline;cursor:pointer';
    const text = document.createElement('span');
    text.textContent = plain;
    let showingOriginal = false;
    // The button's words say what it does next, and a screen reader hears which text is showing.
    btn.onclick = () => {
      showingOriginal = !showingOriginal;
      text.textContent = showingOriginal ? original : plain;
      btn.textContent = showingOriginal ? 'Show rewritten' : 'Show original';
      say(showingOriginal ? 'Showing the original text' : 'Showing the rewritten text');
    };
    note.appendChild(btn);
    el.replaceChildren(text, note);
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.run = null;
    this.observer.disconnect();
    // Put back whatever is in the box now: the store's own text, with another adapter's marks
    // only if that adapter is still on.
    for (const [el, kept] of this.changed) el.replaceChildren(...kept.childNodes);
    this.changed.clear();
    say('Original text restored');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
