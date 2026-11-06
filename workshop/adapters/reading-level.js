// Reading Level: rewrites hard paragraphs at the person's reading level, with a button to show
// the original.
//
// Product descriptions full of marketing jargon, and return policies written as one long legal
// sentence, shut out people with reading or cognitive disabilities and people reading in a
// second language. This adapter scores each paragraph with the Flesch-Kincaid grade formula,
// and asks the toolkit's AI to rewrite the ones well above the person's level. When the AI
// gives nothing, it uses the store's own plain description where the store has one, so it
// also works offline.
//
// Options: grade, the US school grade to aim for when the person's settings have no reading
//          level (default 8).
// Profile: reads the person's reading level: a grade like 6, "plain" or "easy-read".
// Try it: product?id=rb-20w-usbc-charger&issues=27&try=reading-level&profile=dario

// What "plain" and "easy-read" mean as a grade, for deciding which paragraphs are hard.
const LEVEL_GRADE = { plain: 8, 'easy-read': 5 };

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}
// Flesch-Kincaid grade: longer sentences and longer words mean a higher grade.
function gradeOf(text) {
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  if (!words.length) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59;
}

// The store's own plain version of a product description, when it has one.
function storePlain(text) {
  const p = (globalThis.RB_CATALOG || []).find((x) => x.jargon === text.trim());
  return p ? p.plain : null;
}

export const ReadingLevel = {
  async enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    const own = Math.round(Number(options.grade));
    const grade = own >= 1 && own <= 12 ? own : 8;
    // The person's reading level wins over the grade here, in the AI's prompt too.
    const level = s.profile.get('readingLevel');
    this.target = typeof level === 'number' ? level : LEVEL_GRADE[level] || grade;
    this.fields = { readingLevel: grade, context: document.title,
      instructions: 'Write it as one plain paragraph, with no lists or headings. Keep an adult tone.' };
    this.seen = new WeakSet(); // paragraphs already rewritten, or waiting for the AI
    // The note and its button are at least 16px, and larger when the person's text size is.
    const px = Math.round(16 * Math.max(100, Number(s.profile.get('fontScale')) || 100)) / 100;
    s.css('reading-level',
      `.ws-rl-note{display:block;font-size:${px}px;line-height:1.4;color:#5f6368;margin-top:4px}` +
      '.ws-rl-note button{font:inherit;color:#0b6e99;background:none;border:0;padding:0;text-decoration:underline;cursor:pointer}');
    const hard = this.findHard(s);
    s.announce(hard.length ? `Rewriting ${hard.length} long paragraph${hard.length === 1 ? '' : 's'} in plain language` : 'Nothing on this page needs rewriting');
    // Pages add text later (a new step at checkout, more reviews), so look again at most twice a second.
    let queued = false;
    s.watch.added(document.body, () => {
      if (queued) return;
      queued = true;
      s.timer(() => { queued = false; this.rewriteAll(s, this.findHard(s)); }, 500);
    }, { batch: true });
    const n = await this.rewriteAll(s, hard);
    if (hard.length && s.alive()) s.announce(n ? `Rewrote ${n} paragraph${n === 1 ? '' : 's'}. Each one has a Show original button.` : 'Could not rewrite the paragraphs this time');
  },

  // Paragraphs and list items you can see, with 15 words or more (most product descriptions
  // are 15 to 25), well above the target grade.
  findHard(s) {
    return [...document.body.querySelectorAll('p, li')].filter((el) => {
      if (this.seen.has(el) || el.closest('.ws-panel, nav, header, footer') || s.page.isOurs(el) || !el.getClientRects().length) return false;
      const text = el.textContent.trim();
      return text.split(/\s+/).length >= 15 && gradeOf(text) > this.target + 2;
    });
  },

  // Asks for every paragraph at once, so the page doesn't wait on them one by one.
  // Returns how many it rewrote.
  async rewriteAll(s, els) {
    const done = await Promise.all(els.map(async (el) => {
      this.seen.add(el);
      const text = el.textContent.trim();
      const plain = (await s.ai.text('simplify', text, this.fields)) || storePlain(text);
      // A late answer, after disable(), leaves the page alone.
      if (!plain || !s.alive() || !el.isConnected) return false;
      this.swap(s, el, text, plain);
      return true;
    }));
    return done.filter(Boolean).length;
  },

  swap(s, el, original, plain) {
    // The paragraph's own nodes wait in a box that is not on the page, and come back on
    // disable(). Other adapters change those nodes too (one wraps "MSRP" in an underlined
    // mark, and takes the mark off by swapping it back inside whatever holds it), so they wait
    // in a box rather than a plain list: what comes back is the store's own text, with another
    // adapter's marks only if that adapter is still on.
    const kept = document.createElement('div');
    kept.append(...el.childNodes);
    s.onEnd(() => el.replaceChildren(...kept.childNodes));
    const text = s.el('span', { kind: 'content', text: plain });
    const note = s.el('span', { text: 'Rewritten in plain language. ', attrs: { class: 'ws-rl-note' } });
    const btn = s.el('button', { text: 'Show original', attrs: { type: 'button' } });
    note.append(btn);
    let showingOriginal = false;
    // The button's words say what it does next, and a screen reader hears which text is showing.
    s.listen(btn, 'click', () => {
      showingOriginal = !showingOriginal;
      text.textContent = showingOriginal ? original : plain;
      btn.textContent = showingOriginal ? 'Show rewritten' : 'Show original';
      s.announce(showingOriginal ? 'Showing the original text' : 'Showing the rewritten text');
    });
    s.append(el, text);
    s.append(el, note);
  },

  disable() {
    this.s?.end();
    this.s = null;
  },
};
