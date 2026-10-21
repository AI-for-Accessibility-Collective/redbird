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
  let live = document.getElementById('ws-live');
  if (!live) {
    live = Object.assign(document.createElement('div'), { id: 'ws-live' });
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.appendChild(live);
  }
  live.textContent = text;
}

export const ReadingLevel = {
  enabled: false,
  changed: null, // element → its original child nodes

  async enable(options = {}) {
    if (this.enabled) return;
    this.enabled = true;
    this.changed = new Map();
    const target = options.profile?.fields?.readingLevel ?? 8;
    const instructions = `Rewrite this text so a reader at a US grade ${target} reading level can follow it. ` +
      'Keep every fact, number, name, date and condition. Use short sentences and everyday words, and keep an adult tone. ' +
      'Reply with only the rewritten text.';
    const hard = [...document.body.querySelectorAll('p, li')].filter((el) => {
      const text = el.textContent.trim();
      return !el.closest('.ws-panel, nav, header, footer') && text.split(/\s+/).length >= 25 && gradeOf(text) > target + 2;
    });
    say(hard.length ? `Rewriting ${hard.length} hard paragraph${hard.length === 1 ? '' : 's'} at grade ${target}` : 'No paragraphs harder than your chosen level');
    for (const el of hard) {
      const text = el.textContent.trim();
      let plain = options.rewrite ? await options.rewrite(text, instructions) : null;
      if (!plain && options.fallback) plain = options.fallback(text);
      if (!plain || !this.enabled) continue;
      this.swap(el, text, plain);
    }
  },

  swap(el, original, plain) {
    this.changed.set(el, [...el.childNodes]);
    const note = document.createElement('span');
    note.style.cssText = 'display:block;font-size:12.5px;color:#5f6368;margin-top:4px';
    note.textContent = `Rewritten at grade ${Math.max(1, Math.round(gradeOf(plain)))} (was about grade ${Math.round(gradeOf(original))}). `;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Show original';
    btn.setAttribute('aria-pressed', 'false');
    btn.style.cssText = 'font:inherit;color:#0b6e99;background:none;border:0;padding:0;text-decoration:underline;cursor:pointer';
    const text = document.createElement('span');
    text.textContent = plain;
    btn.onclick = () => {
      const showing = btn.getAttribute('aria-pressed') === 'true';
      text.textContent = showing ? plain : original;
      btn.textContent = showing ? 'Show original' : 'Show rewritten';
      btn.setAttribute('aria-pressed', String(!showing));
    };
    note.appendChild(btn);
    el.replaceChildren(text, note);
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    for (const [el, nodes] of this.changed) el.replaceChildren(...nodes);
    this.changed.clear();
    say('Original text restored');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
