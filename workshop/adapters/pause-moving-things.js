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
// "By themselves" means the person didn't click, tap or press a key on that thing (or right next
// to it, like a row's arrow buttons) in the last second.
//
// Options: none.
// Profile: nothing to read.
// Try it: ?issues=33,34,35&try=pause-moving-things

const CURRENT = /\b(is-current|is-active|current|active|selected)\b/;

export const PauseMovingThings = {
  enable(options = {}, toolkit) {
    if (this.s && !this.s.ended) return;
    const s = (this.s = toolkit.session());
    // Did the person just do something to this element, or right next to it?
    const byPerson = (el) => s.watch.byPerson(el) || (!!el.parentElement && s.watch.byPerson(el.parentElement));
    const ours = (el) => s.page.isOurs(el) || !!el.closest('#ws-root, [id^="ai4a11y"], [class^="ws-"]');

    // 1. Animations that never end, like a scrolling deals bar.
    s.css('pause', '.ws-paused, .ws-paused * { animation-play-state: paused !important; }');
    let paused = 0;
    for (const el of document.body.querySelectorAll('*')) {
      if (ours(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none' && cs.animationIterationCount === 'infinite') {
        s.addClass(el, 'ws-paused');
        paused++;
      }
    }

    // 2. Slides a timer moves along: one slide in a group has a class like "is-current", and the
    // class moves to the next slide every few seconds. When it moves and the person didn't do it,
    // press the group's own back button, so the page's count of where it is stays right. With no
    // back button, put the class back by hand. Both are what the person would do to go back, so
    // disable() leaves the banner on the slide it shows then.
    const slides = [];
    for (const cur of document.body.querySelectorAll('[class]')) {
      const word = String(cur.className?.baseVal ?? cur.className ?? '').match(CURRENT);
      const group = cur.parentElement;
      if (!word || !group || ours(cur) || group.children.length < 2 || slides.some((x) => x.group === group)) continue;
      const box = group.closest('section, [class*="carousel"], [class*="slider"], [class*="hero"]') || group.parentElement;
      const back = box && [...box.querySelectorAll('button, [role="button"]')]
        .find((b) => /prev|back|left/i.test(b.className + ' ' + (b.getAttribute('aria-label') || '')));
      slides.push({ group, box, word: word[1], held: cur, back });
    }
    for (const x of slides) {
      s.watch.added(x.group, (els) => {
        if (!els.some((el) => el.parentElement === x.group)) return;
        const now = [...x.group.children].find((c) => c.classList.contains(x.word));
        if (!now || now === x.held) return;
        if (byPerson(x.box)) { x.held = now; return; }
        if (x.back) x.back.click();
        else { now.classList.remove(x.word); x.held.classList.add(x.word); }
      }, { types: ['attributes'], batch: true });
    }

    // 3. Rows a timer scrolls. The page's timer sets scrollLeft; this row ignores that unless the
    // person just did something. Scrolling with a mouse, finger or keyboard doesn't go through
    // scrollLeft, so it still works. disable() gives each row its own scrollLeft back.
    const native = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
    for (const el of document.body.querySelectorAll('*')) {
      if (ours(el) || el.scrollWidth <= el.clientWidth + 1) continue;
      if (/visible|clip/.test(getComputedStyle(el).overflowX)) continue; // can't be scrolled from code
      Object.defineProperty(el, 'scrollLeft', {
        configurable: true,
        get() { return native.get.call(this); },
        set(v) { if (byPerson(this)) native.set.call(this, v); },
      });
      s.onEnd(() => { delete el.scrollLeft; });
    }

    // 4. Videos that play by themselves. They're paused, and their controls are shown so the
    // person can start one. A video the person starts keeps playing. disable() plays again
    // only what was playing, and only if the person hasn't paused or played it since.
    const videos = new Set();
    const onPlaying = (v) => {
      if (!(v instanceof HTMLVideoElement) || byPerson(v) || ours(v)) return;
      videos.add(v);
      s.media.pause(v, { showControls: true });
    };
    s.listen(document, 'playing', (e) => onPlaying(e.target), true);
    for (const v of document.querySelectorAll('video')) if (!v.paused) onPlaying(v);

    const n = paused + slides.length + videos.size;
    s.announce(n ? 'Paused things that move by themselves. You can still move them yourself.' : 'Watching for things that move by themselves');
  },

  disable() {
    this.s?.end();
    this.s = null;
  },
};
