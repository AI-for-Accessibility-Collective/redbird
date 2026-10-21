// Pause Moving Things: holds still the parts of a page that move by themselves, like a deals bar
// that scrolls across the top, a banner that changes every few seconds, product rows that slide
// along, and a video that starts playing on its own.
//
// Moving things pull attention away from what the person is reading. For someone with ADHD or
// anxiety, or someone who gets dizzy from motion, a page that never stops moving is hard to use.
// This adapter doesn't hide anything. It holds each one still, and the person can still move it
// themselves: the banner's arrows, scrolling a row and the video's play button all still work.
//
// It finds them in four ways:
//   animations that never end (the deals bar)       paused
//   slides a timer moves along (the banner)         moved back, with the banner's own back button
//   rows a timer scrolls (the product rows)         the timer's scrolling is ignored
//   videos that play by themselves                  paused, with play controls shown
// "By themselves" means the person didn't click, tap, scroll or press a key on that thing (or right
// next to it, like a row's arrow buttons) in the last second.
//
// Profile: nothing to read. Try it: ?issues=33,34,35&try=pause-moving-things

const PERSON_MS = 1000;
const CURRENT = /\b(is-current|is-active|current|active|selected)\b/;

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
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 60);
}

export const PauseMovingThings = {
  styleId: 'ws-pause-styles',
  enabled: false,

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.lastTouch = 0;
    this.lastTarget = null;
    this.onPerson = (e) => { this.lastTouch = Date.now(); this.lastTarget = e.target; };
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) document.addEventListener(type, this.onPerson, true);
    // Did the person just do something to this element, or right next to it?
    const byPerson = (el) => {
      const t = this.lastTarget;
      return Date.now() - this.lastTouch < PERSON_MS && t instanceof Node && (el.contains(t) || !!el.parentElement?.contains(t));
    };
    const ours = (el) => el.closest('#ws-root, [id^="ai4a11y"], [class^="ws-"]');

    // 1. Animations that never end, like a scrolling deals bar.
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = '.ws-paused, .ws-paused * { animation-play-state: paused !important; }';
    document.head.appendChild(style);
    this.paused = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (ours(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none' && cs.animationIterationCount === 'infinite') {
        el.classList.add('ws-paused');
        this.paused.push(el);
      }
    }

    // 2. Slides a timer moves along: one slide in a group has a class like "is-current", and the
    // class moves to the next slide every few seconds. When it moves and the person didn't do it,
    // press the group's own back button, so the page's count of where it is stays right. With no
    // back button, put the class back by hand.
    this.slides = [];
    for (const cur of document.body.querySelectorAll('[class]')) {
      const word = (cur.className.baseVal ?? cur.className).match(CURRENT);
      const group = cur.parentElement;
      if (!word || !group || ours(cur) || group.children.length < 2 || this.slides.some((s) => s.group === group)) continue;
      const box = group.closest('section, [class*="carousel"], [class*="slider"], [class*="hero"]') || group.parentElement;
      const back = box && [...box.querySelectorAll('button, [role="button"]')]
        .find((b) => /prev|back|left/i.test(b.className + ' ' + (b.getAttribute('aria-label') || '')));
      this.slides.push({ group, box, word: word[1], held: cur, back });
    }
    this.observer = new MutationObserver((records) => {
      for (const s of this.slides) {
        if (!records.some((r) => r.target.parentElement === s.group)) continue;
        const now = [...s.group.children].find((c) => c.classList.contains(s.word));
        if (!now || now === s.held) continue;
        if (byPerson(s.box)) { s.held = now; continue; }
        if (s.back) s.back.click();
        else { now.classList.remove(s.word); s.held.classList.add(s.word); }
        this.observer.takeRecords(); // our own change isn't a new one to undo
      }
    });
    for (const s of this.slides) this.observer.observe(s.group, { subtree: true, attributes: true, attributeFilter: ['class'] });

    // 3. Rows a timer scrolls. The page's timer sets scrollLeft; this row ignores that unless the
    // person just did something. Scrolling with a mouse, finger or keyboard doesn't go through
    // scrollLeft, so it still works.
    const native = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
    this.rows = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (ours(el) || el.scrollWidth <= el.clientWidth + 1) continue;
      if (/visible|clip/.test(getComputedStyle(el).overflowX)) continue; // can't be scrolled from code
      Object.defineProperty(el, 'scrollLeft', {
        configurable: true,
        get() { return native.get.call(this); },
        set(v) { if (byPerson(this)) native.set.call(this, v); },
      });
      this.rows.push(el);
    }

    // 4. Videos that play by themselves. They're paused, and their controls are shown so the
    // person can start one. A video the person starts keeps playing.
    this.videos = new Map(); // video → whether it had controls
    this.onPlaying = (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement) || byPerson(v) || ours(v)) return;
      if (!this.videos.has(v)) this.videos.set(v, v.controls);
      v.controls = true;
      v.pause();
    };
    document.addEventListener('playing', this.onPlaying, true);
    for (const v of document.querySelectorAll('video')) if (!v.paused) this.onPlaying({ target: v });

    const n = this.paused.length + this.slides.length + this.videos.size;
    say(n ? 'Paused things that move by themselves. You can still move them yourself.' : 'Watching for things that move by themselves');
  },

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) document.removeEventListener(type, this.onPerson, true);
    document.removeEventListener('playing', this.onPlaying, true);
    this.observer.disconnect();
    this.paused.forEach((el) => el.classList.remove('ws-paused'));
    this.rows.forEach((el) => { delete el.scrollLeft; });
    for (const [v, hadControls] of this.videos) {
      v.controls = hadControls;
      if (v.autoplay) v.play().catch(() => {});
    }
    this.videos.clear();
    document.getElementById(this.styleId)?.remove();
    say('Moving things are back as the store showed them');
  },

  toggle(options) {
    if (this.enabled) this.disable();
    else this.enable(options);
  },
};
