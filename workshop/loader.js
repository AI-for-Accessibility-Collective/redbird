// Runs adapters on the store without installing the extension, and shows a panel for trying them.
//
//   ?try=swatch-names                  a workshop example from workshop/adapters/
//   ?try=motion-reducer                an adapter from the AI for Accessibility Toolkit itself
//   ?try=toolkit-fixes                 the toolkit's automatic fixes (alt text, labels, contrast, ...)
//   ?try=swatch-names,motion-reducer   several at once
//   ?profile=sam                       a workshop person (sam, mark, dario or bill), from workshop/profiles/
//   ?try=mine                          your own adapter, typed into the panel (saved in this browser)
//   ?try=none                          stop running them
//   ?workshop=off                      hide the panel, for AI agent runs (?workshop=on shows it again)
//
// What you pick is remembered in this browser, like ?issues=. Any ?try= link also turns the panel on.
// The panel in the bottom-left corner has four tabs:
//   Setup    every profile and every adapter, each with a switch (the other store settings are on workshop/controls)
//   Build    make a skill from existing adapters, or describe a fix and have AI write a new adapter
//   Changes  what each adapter changed, before and after, and what a screen reader hears
//   Checks   the toolkit's auditors, and the spotlight that points out the planted problems
// AI tasks (rewriting text, describing images, naming buttons) go to the store's own /api/ai,
// which holds the Gemini key on the server. Without it (for example on a copy served by
// tools/serve.py), adapters fall back to what they can do without AI.
(function () {
  var base = document.currentScript.src.replace(/loader\.js.*$/, '');
  // The toolkit's adapters load straight from its GitHub repo, pinned to one version so the
  // workshop doesn't change under people. Bump the commit to pick up newer adapters.
  var TOOLKIT = 'https://cdn.jsdelivr.net/gh/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit@5906f4307bf80ee50818b18549f4911a0f233551/tools/';
  var AXE = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';
  // Libraries some toolkit adapters expect on the page, as the extension provides them.
  var NEEDS = { 'reader-mode': ['Readability', 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js'] };
  var isTop = window.top === window;
  var qs = new URLSearchParams(location.search);
  function remember(key, param) {
    var v = qs.get(param);
    try {
      if (v) { if (isTop) localStorage.setItem(key, v); } // not when shown side by side
      else v = localStorage.getItem(key);
    } catch (e) { /* private window */ }
    return v && v !== 'none' ? v : '';
  }
  var names = remember('redbird:try', 'try').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  // Old names from before the profiles were renamed still work, from saved settings or old links.
  var profileName = remember('redbird:profile', 'profile');
  profileName = { alex: 'dario', riley: 'mark' }[profileName] || profileName;
  var panelOn = (function () {
    var v = qs.get('workshop') || (qs.has('try') ? 'on' : null);
    try {
      if (v) {
        if (isTop) localStorage.setItem('redbird:workshop', v);
        if (v === 'off') sessionStorage.setItem('redbird:panel-off-tab', '1');
      } else {
        v = localStorage.getItem('redbird:workshop');
        // Hidden only in the tab an agent link hid it in.
        if (v === 'off' && !sessionStorage.getItem('redbird:panel-off-tab')) v = 'on';
      }
    } catch (e) {}
    return v !== 'off' && isTop;
  })();
  if (!names.length && !panelOn) return;
  if (panelOn && innerWidth >= 700) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('redbird:panel') || '{}') || {}; } catch (e) {}
    if (saved.dockW === 340) saved.dockW = 360; // the old default, too narrow for the tab names
    var early = document.createElement('style');
    early.id = 'ws-dock';
    early.textContent = 'html{padding-' + (saved.side === 'right' ? 'right' : 'left') + ':' + Math.max(280, Math.min(saved.dockW || 360, 720, innerWidth - 360)) + 'px!important}';
    (document.head || document.documentElement).appendChild(early);
  }

  // ── What the panel offers ─────────────────────────────────────────────────
  // Adapters written for this workshop, in workshop/adapters/. The featured ones are the examples:
  // one for each kind of disability the workshop's shoppers have.
  // no-surprise-extras and always-show-buttons are hidden for now: still here, but in no group or profile.
  var EXAMPLES = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level', 'pause-moving-things', 'no-surprise-extras', 'always-show-buttons'];
  var FEATURED = ['reading-level', 'pause-moving-things', 'swatch-names'];
  // help: one line on what it does. ai: it uses /api/ai. opts: extra options for enable().
  // arg: what enable() takes instead of the options object.
  var ADAPTERS = {
    'real-arrival-dates': { who: 'Screen reader users, people with memory or attention disabilities, and anyone who wants the real date', help: 'Turns “5–7 business days” into the dates it arrives.' },
    'swatch-names': { who: 'Blind and low-vision shoppers', help: 'Gives the color circles names a screen reader can say, and lets the arrow keys pick one.' },
    'calm-urgency': { who: 'People with anxiety or ADHD', help: 'Labels or hides countdowns and “only 2 left” messages.' },
    'reading-level': { who: 'People with cognitive or reading disabilities', help: 'Rewrites hard product descriptions in short, plain sentences, with a button to show the original.', ai: true },
    'pause-moving-things': { who: 'People with ADHD or anxiety, and people who get dizzy from motion', help: 'The deals bar, the banner and the product rows move by themselves, and the video plays on its own. This stops all of them, but you can still click or scroll through them yourself.' },
    'no-surprise-extras': { who: 'Older adults, and anyone who might buy something they didn’t mean to', help: 'On product pages, the store ticks a paid protection plan and a repeat order for you. This turns both off, with a note saying what it changed.' },
    'always-show-buttons': { who: 'People who can’t easily use a mouse, like keyboard and voice control users', help: 'In search results, “Add to cart” only shows up when the mouse is over a product, so the keyboard can’t reach it. This keeps the buttons showing.' },
    mine: { help: 'The adapter you made in Build your adapter.' },
    'toolkit-fixes': { help: 'Fixes what the audit finds: describes photos, names buttons and fields, fixes low contrast and the page structure.', ai: true },
    'live-region-announcer': { help: 'Reads out updates a screen reader would otherwise miss, like “Added to cart”.' },
    'skip-links': { help: 'Adds a “Skip to main content” link, so keyboard users don’t have to Tab through the whole header.' },
    'page-outline': { help: 'Adds a list of the page’s headings, so you can jump straight to a section.' },
    'spa-focus': { help: 'When part of the page changes without a new page loading, moves the focus there and says so.' },
    'language-tag': { help: 'Marks text in another language, so a screen reader pronounces it right.' },
    'describe-on-demand': { help: 'Press Alt+D to hear a description of whatever has the keyboard focus.', ai: true },
    'focus-locator': { help: 'Draws a thick ring around whatever has the keyboard focus, so you can see where you are.' },
    'link-highlighter': { help: 'Underlines every link and gives it a clear color.' },
    'visual-assist': { help: 'Makes the text bigger, adds space between lines, and makes the focus ring easier to see.' },
    magnifier: { help: 'Shows a lens that enlarges whatever is under the mouse.' },
    'reflow-column': { help: 'Puts the page in one column, so zooming in never makes you scroll sideways.' },
    'unpin-sticky': { help: 'Stops headers and bars from staying stuck on the screen when you scroll.' },
    'persistent-hover': { help: 'Keeps pop-up hints open until you press Escape, instead of closing when the mouse moves.' },
    'dark-mode': { help: 'Turns the page dark, with light text on a dark background.' },
    'color-blind': { help: 'Shifts the page’s colors so red and green are easier to tell apart.', arg: 'deuteranopia' },
    'reduce-brightness': { help: 'Dims the whole page and softens bright colors.' },
    'explore-a-chart': { help: 'Turns a chart into a table you can read. This store has no charts.', ai: true },
    'math-a11y': { help: 'Gives math a name a screen reader can read. This store has no math.' },
    'bionic-reading': { help: 'Makes the first letters of each word bold, to guide the eye along the line.' },
    'reader-mode': { help: 'Shows only the main text of the page, in a plain layout.' },
    'simplify-text': { help: 'Rewrites long paragraphs in plainer words, keeping every fact.', ai: true },
    'define-words': { help: 'Shows a short definition when you point at or focus a hard word.', ai: true },
    'abbreviation-expand': { help: 'Spells out short forms, like MSRP and S&S.' },
    'translate-page': { help: 'Translates the page into Spanish.', ai: true, opts: { targetLang: 'Spanish' } },
    'read-aloud': { help: 'Reads the page out loud. Turn it off to stop.' },
    // The saved spot is kept per page, not per workshop link (those add ?issues=, ?try= and so on).
    'reading-spot': { opts: { key: 'ai4a11y-spot:' + location.pathname + (function () {
      var q = new URLSearchParams(location.search);
      ['issues', 'workshop', 'profile', 'today', 'spotlight', 'try', 'from', 'reset', 'cart', 'need', 'new'].forEach(function (k) { q.delete(k); });
      return q.toString() ? '?' + q : '';
    })() }, help: 'Remembers how far down the page you read, and offers to take you back there.' },
    'focus-mode': { help: 'Dims ads and pop-ups, and shows how far down the page you are.', opts: { hideDistractions: true } },
    'motion-reducer': { help: 'Stops animations, the scrolling deals bar, and videos that play by themselves.' },
    'stop-auto-advance': { help: 'Stops carousels and rows of products from moving on their own.' },
    'dismiss-overlays': { help: 'Closes cookie banners, sign-up pop-ups and promo bars.' },
    'mute-sounds': { help: 'Turns off all sound from videos and audio.' },
    'flash-guard': { help: 'Dims videos and animations that could flash.' },
    'confirm-actions': { help: 'Asks “Are you sure?” before you pay, delete or send something.' },
    'show-captions': { help: 'Turns on captions for videos that have them.' },
    'auto-transcriber': { help: 'Adds a CC button to videos that turns their captions on and off.' },
    'sound-visualizer': { help: 'Shows a sign on the screen whenever the page plays a sound.' },
    'keyboard-nav': { help: 'Adds a skip link, a clear focus ring, and shortcuts: Alt+1 for the main content, Alt+H for the next heading.' },
    'big-targets': { help: 'Makes small buttons and links bigger and easier to hit.' },
    'voice-commands': { help: 'Lets you control the page by speaking. It asks to use the microphone.' },
  };
  // [name, unused, adapters]
  var GROUPS = [
    ['Workshop examples', '', FEATURED.concat('mine')],
    ['Blind and screen reader users', '', ['live-region-announcer', 'skip-links', 'page-outline',
      'spa-focus', 'language-tag', 'describe-on-demand', 'explore-a-chart', 'math-a11y']],
    ['Low vision and color blindness', '', ['visual-assist', 'magnifier', 'focus-locator', 'link-highlighter',
      'reflow-column', 'unpin-sticky', 'persistent-hover', 'dark-mode', 'color-blind', 'reduce-brightness']],
    ['Reading and understanding', '', ['real-arrival-dates', 'bionic-reading', 'reader-mode', 'simplify-text', 'define-words',
      'abbreviation-expand', 'translate-page', 'read-aloud', 'reading-spot']],
    ['Attention, anxiety and motion', '', ['calm-urgency', 'focus-mode', 'motion-reducer', 'stop-auto-advance',
      'dismiss-overlays', 'mute-sounds', 'flash-guard', 'confirm-actions']],
    ['Deaf and hard of hearing', '', ['show-captions', 'auto-transcriber', 'sound-visualizer']],
    ['Motor and keyboard', '', ['keyboard-nav', 'big-targets', 'voice-commands']],
  ];
  // The workshop's four people, and the few adapters each one gets. Each set is checked on the
  // store's pages, so picking someone never breaks the page. (The toolkit's own profiles turn on
  // eight or more adapters at once, which fight each other on a page like this one.)
  var PEOPLE = {
    sam: ['Sam Saltman, blind', ['toolkit-fixes', 'swatch-names', 'real-arrival-dates', 'live-region-announcer', 'skip-links']],
    dario: ['Dario Almondei, cognitive disability', ['reading-level', 'abbreviation-expand', 'calm-urgency', 'stop-auto-advance', 'real-arrival-dates']],
    mark: ['Mark Sugarberg, ADHD and anxiety', ['calm-urgency', 'pause-moving-things', 'real-arrival-dates']],
    bill: ['Bill Grapes, older adult', ['visual-assist', 'big-targets', 'confirm-actions', 'real-arrival-dates']],
  };
  // The toolkit's own 12 profiles (its tools/profiles/settings.json), each with the few adapters that
  // work well together on this store. The full profiles turn on 8 or more at once, which fight.
  // [name, the toolkit's description, adapters]
  var TOOLKIT_PROFILES = {
    blind: ['Blind', 'Optimized for screen reader users: structure, labels, descriptions', ['toolkit-fixes', 'live-region-announcer', 'skip-links', 'swatch-names', 'describe-on-demand']],
    lowVision: ['Low vision', 'Larger text, spacing, enhanced focus, contrast fixes', ['visual-assist', 'toolkit-fixes', 'unpin-sticky', 'real-arrival-dates']],
    colorBlind: ['Color blindness', 'Contrast fixes, photo descriptions, and a clear focus ring', ['toolkit-fixes', 'focus-locator']],
    deaf: ['Deaf and hard of hearing', 'Captions on videos, and a sign on screen when the page plays a sound', ['auto-transcriber', 'sound-visualizer']],
    motor: ['Motor disability', 'Bigger buttons and links, a clear focus ring, and a check before you pay', ['big-targets', 'focus-locator', 'skip-links', 'stop-auto-advance', 'confirm-actions']],
    dyslexia: ['Dyslexia', 'More space between lines, and focus mode', ['visual-assist', 'focus-mode']],
    adhd: ['ADHD', 'Reduced distractions, progress indicators, summaries for long content', ['focus-mode', 'stop-auto-advance', 'calm-urgency', 'reading-level']],
    cognitive: ['Cognitive disability', 'Plain-language text, spelled-out abbreviations, and real dates', ['reading-level', 'abbreviation-expand', 'real-arrival-dates', 'calm-urgency', 'focus-mode', 'stop-auto-advance']],
    olderAdult: ['Older adult', 'Bigger text and buttons, plain language, and a check before you pay', ['visual-assist', 'big-targets', 'reading-level', 'stop-auto-advance', 'confirm-actions']],
    anxiety: ['Anxiety', 'Calm interface, reduced motion, progress indicators reduce uncertainty', ['calm-urgency', 'stop-auto-advance', 'real-arrival-dates', 'confirm-actions']],
    sensory: ['Sensory processing', 'Overload prevention: no motion, fewer distractions', ['stop-auto-advance', 'reduce-brightness', 'calm-urgency', 'mute-sounds']],
    photosensitive: ['Light sensitivity', 'Dark mode and reduced motion', ['dark-mode', 'reduce-brightness', 'stop-auto-advance']],
  };
  // My profile: the one people make for themselves in the Profiles tab. The shoppers and the
  // toolkit's profiles are made-up people, and this one is what the toolkit is for: a profile the
  // person keeps using. It stays in this browser, and saves as a file the toolkit's browser
  // extension can import (the toolkit's "aa-profile-blob" format).
  var ME_KEY = 'redbird:me';
  function myProfile() { try { var m = JSON.parse(localStorage.getItem(ME_KEY) || 'null'); return m && m.freeText ? m : null; } catch (e) { return null; } }
  function isPerson(id) { return id === 'me' || !!(PEOPLE[id] || TOOLKIT_PROFILES[id]); }
  function setOf(id) {
    if (id === 'me') { var m = myProfile(); return m && m.adapters ? m.adapters.filter(function (n) { return ADAPTERS[n]; }) : []; }
    return PEOPLE[id] ? PEOPLE[id][1] : TOOLKIT_PROFILES[id][2];
  }
  function nameOf(id) { return id === 'me' ? 'My profile' : PEOPLE[id] ? PEOPLE[id][0] : TOOLKIT_PROFILES[id][0] + ' (toolkit profile)'; }
  // A workshop shopper's profile is a file next to this one; a toolkit profile is its name and description.
  function loadProfile(id) {
    if (id === 'me') return Promise.resolve(myProfile());
    if (TOOLKIT_PROFILES[id]) return Promise.resolve({ name: TOOLKIT_PROFILES[id][0], freeText: TOOLKIT_PROFILES[id][1], toolkit: true });
    return fetch(base + 'profiles/' + id + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  // My profile is the default: the person's own profile comes first, the made-up shoppers after.
  if (!isPerson(profileName)) profileName = 'me';
  var profile = loadProfile(profileName);

  // ── Small helpers ─────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function squash(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function cut(s, n) { s = squash(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function inPanel(n) {
    var el = n && (n.nodeType === 1 ? n : n.parentElement);
    return !!(el && el.closest && el.closest('#ws-root'));
  }
  function loadScript(src, global) {
    if (window[global]) return Promise.resolve();
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { fail(new Error('could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function warn(name) { return function (e) { console.warn('[workshop] ' + name + ':', e); }; }

  // ── Watching what adapters change ─────────────────────────────────────────
  // One MutationObserver sees every change to the page. A change counts as an adapter's when it
  // happens while that adapter's own code runs (each of its methods is wrapped, below) or right
  // after an AI answer it asked for comes back. Changes the store makes on its own are left out.
  var LIVE = '[aria-live]:not([aria-live="off"]),[role="status"],[role="alert"],[role="log"]';
  var t0 = Date.now(), uids = new WeakMap(), nextUid = 0;
  function uid(el) { if (!uids.has(el)) uids.set(el, ++nextUid); return uids.get(el); }
  var Track = {
    who: null, list: [], keys: {}, owned: new WeakMap(), heard: [], obs: null,
    start: function () {
      var self = this;
      this.obs = new MutationObserver(function (recs) { self.take(recs, self.who); });
      this.obs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeOldValue: true, characterData: true, characterDataOldValue: true });
    },
    flush: function (who) { if (this.obs) this.take(this.obs.takeRecords(), who); },
    run: function (who, fn, self, args) {
      if (!this.obs) return fn.apply(self, args || []);
      var prev = this.who;
      this.flush(prev);
      this.who = who;
      try { return fn.apply(self, args || []); } finally { this.flush(who); this.who = prev; }
    },
    // An AI answer came back for `who`: the code waiting on it runs next, so its changes are `who`'s.
    resume: function (who) {
      if (!who || !this.obs) return;
      var self = this;
      this.flush(this.who);
      this.who = who;
      setTimeout(function () { self.flush(self.who); if (self.who === who) self.who = null; }, 0);
    },
    take: function (recs, who) {
      for (var i = 0; i < recs.length; i++) {
        if (inPanel(recs[i].target)) continue;
        this.listen(recs[i]);
        if (who) this.record(recs[i], who);
      }
      if (recs.length && who) changed();
    },
    ownerOf: function (n) {
      for (var el = n; el; el = el.parentNode) { var e = this.owned.get(el); if (e) return e; }
      return null;
    },
    record: function (r, who) {
      var t = r.target, self = this;
      var el = t.nodeType === 1 ? t : t.parentElement;
      if (!el || el.closest('#ws-live') || this.ownerOf(t)) return; // inside something an adapter added: part of that
      if (r.type === 'attributes') {
        if (!/^data-/.test(r.attributeName)) this.add(who, 'attr', t, r.attributeName, r.oldValue);
        return;
      }
      if (r.type === 'characterData') { this.text(who, el, r.oldValue, [t]); return; }
      var added = Array.prototype.filter.call(r.addedNodes, function (n) { return n.id !== 'ws-live' && (n.nodeType === 1 || squash(n.data)); });
      var removed = Array.prototype.filter.call(r.removedNodes, function (n) { return !self.owned.get(n) && (n.nodeType === 1 || squash(n.data)); });
      if (removed.length && added.length) {
        // Old content swapped for new: one rewrite, not a pile of separate additions.
        var e = this.text(who, el, removed.map(function (n) { return n.textContent; }).join(' '), added);
        if (e) added.forEach(function (n) { if (n.nodeType === 1) self.owned.set(n, e); });
        return;
      }
      added.forEach(function (n) {
        if (n.nodeType === 3) { self.text(who, el, '', [n]); return; }
        if (/^(SCRIPT|NOSCRIPT|TEMPLATE)$/.test(n.tagName) || (n.tagName === 'LINK' && !/stylesheet/.test(n.rel))) return; // loading code
        var kind = n.tagName === 'STYLE' || (n.tagName === 'LINK' && /stylesheet/.test(n.rel)) ? 'style' : 'added';
        var e2 = self.add(who, kind, n, '', null);
        if (e2) self.owned.set(n, e2);
      });
      removed.forEach(function (n) {
        if (n.nodeType === 3) self.text(who, el, n.data, []);
        else self.add(who, 'removed', n, '', describe(n));
      });
    },
    add: function (who, type, el, attr, before) {
      if (!el || inPanel(el)) return null;
      var key = who + '|' + type + '|' + uid(el) + '|' + attr;
      if (this.keys[key]) return this.keys[key];
      if (this.list.length >= 2000) return null;
      var e = { n: this.list.length + 1, who: who, type: type, el: el, attr: attr, before: before };
      this.keys[key] = e;
      this.list.push(e);
      return e;
    },
    // Text changes in one element add up: the words that went, and the nodes that replaced them.
    text: function (who, el, before, nodes) {
      var e = this.add(who, 'text', el, '', null);
      if (!e) return null;
      e.parts = e.parts || [];
      var seen = e.parts.some(function (p) { return p.nodes.some(function (n) { return nodes.indexOf(n) !== -1; }); });
      if (!seen) e.parts.push({ before: before || '', nodes: nodes });
      return e;
    },
    // The toolkit's fixes: compare an element before and after its fix, however long the AI took.
    diff: function (who, el, before, why) {
      var self = this;
      Object.keys(before).forEach(function (a) {
        var now = a === '#text' ? squash(el.textContent) : el.getAttribute(a);
        if (now === before[a]) return;
        var e = a === '#text' ? self.text(who, el, before[a], Array.prototype.slice.call(el.childNodes)) : self.add(who, 'attr', el, a, before[a]);
        if (e && why) e.why = why;
      });
      changed();
    },
    // What a screen reader would say: text that changes inside a live region.
    listen: function (r) {
      if (r.type === 'attributes') return;
      var el = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      var region = el && el.closest(LIVE);
      for (var i = 0; !region && i < r.addedNodes.length; i++) {
        var n = r.addedNodes[i];
        if (n.nodeType === 1 && n.matches('[role="alert"]')) region = n;
      }
      if (!region) return;
      if (this.who) region.__wsWho = this.who;
      var self = this;
      clearTimeout(region.__wsT);
      region.__wsT = setTimeout(function () {
        var text = squash(region.textContent);
        // One message often goes into two live regions at once (the toolkit's and the workshop's):
        // a screen reader says it once, so the log keeps it once.
        var last = self.heard[self.heard.length - 1];
        var repeat = last && last.text === text && Date.now() - last.at < 1500;
        if (text && text !== region.__wsLast && !repeat) {
          var own = self.ownerOf(region);
          self.heard.push({ at: Date.now(), text: text, who: region.__wsWho || (own && own.who) || null });
          if (self.heard.length > 60) self.heard.shift();
          changed();
        }
        region.__wsLast = text;
        region.__wsWho = null;
      }, 250);
    },
    soleAI: function () {
      var on = names.filter(function (n) { return n !== 'toolkit-fixes' && (ADAPTERS[n] || {}).ai; });
      return on.length === 1 ? on[0] : null;
    },
  };
  var SNAP = ['alt', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'title', 'role', 'lang', 'tabindex', 'style'];
  function snap(el) {
    var o = { '#text': squash(el.textContent) };
    SNAP.forEach(function (a) { o[a] = el.getAttribute(a); });
    return o;
  }
  // Every method of an adapter runs through Track.run, so what it does is put down to it.
  function instrument(name, obj) {
    if (!obj || obj.__ws) return obj;
    Object.keys(obj).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(obj, k);
      if (!d || typeof d.value !== 'function' || /^[A-Z]/.test(k)) return;
      var f = d.value;
      obj[k] = function () { return Track.run(name, f, this, arguments); };
    });
    try { Object.defineProperty(obj, '__ws', { value: true }); } catch (e) {}
    return obj;
  }

  // ── AI ────────────────────────────────────────────────────────────────────
  var aiUrl = new URL('../api/ai', base).href;
  // Leaving the page cancels any AI request still on its way. Those just stop, instead of each
  // failing and filling the console with "AI is not available" from the adapter that asked.
  var leaving = false;
  addEventListener('pagehide', function () { leaving = true; });
  addEventListener('beforeunload', function () { leaving = true; });
  function ai(task, input) {
    return fetch(aiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ task: task }, input)) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return d && d.result ? d.result : null; })
      .catch(function () { return leaving ? new Promise(function () {}) : null; });
  }
  // An AI call remembers which adapter asked, so the change it leads to is put down to that adapter.
  function traced(fn) {
    return function () {
      var who = Track.who || Track.soleAI();
      return fn.apply(null, arguments).then(function (v) { Track.resume(who); return v; }, function (e) { Track.resume(who); throw e; });
    };
  }
  // The workshop examples get rewrite(text, instructions). Without AI, product descriptions fall
  // back to the store's own plain version, so the reading-level guide still works.
  var rewrite = traced(function (text, instructions) { return ai('rewrite', { text: text, instructions: instructions }); });
  function storeFallback(text) {
    var p = (window.RB_CATALOG || []).find(function (x) { return x.jargon === text.trim(); });
    return p ? p.plain : null;
  }
  // The toolkit's adapters call a provider (tools/utils/ai.js). Each call becomes one /api/ai task.
  function need(v) { if (v == null) throw new Error('AI is not available here'); return v; }
  // Photos go to the AI at most 1024 px wide, as JPEG: big product photos would otherwise go over
  // the server's size limit, and a smaller picture is faster and cheaper to describe.
  // The server only takes image data, so a photo handed over by its address is drawn and sent as data.
  function shrink(dataUrl) {
    return new Promise(function (done, fail) {
      var img = new Image();
      img.onload = function () {
        if (!img.naturalWidth) return fail(new Error('the photo has no pixels yet'));
        var k = Math.min(1, 1024 / Math.max(img.naturalWidth, img.naturalHeight));
        if (k === 1 && /^data:image\/[\w.+-]+;base64,/.test(dataUrl) && dataUrl.length < 1500000) return done(dataUrl);
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        try { done(c.toDataURL('image/jpeg', 0.85)); } catch (e) { fail(e); }
      };
      img.onerror = function () { fail(new Error('the photo did not load')); };
      img.src = dataUrl;
    });
  }
  var provider = {
    describeImage: function (imageData) { return shrink(imageData).then(function (d) { return ai('describeImage', { imageData: d }); }).then(need); },
    describeElement: function (imageData, elementType, context) {
      return shrink(imageData).then(function (d) { return ai('describeElement', { imageData: d, elementType: elementType, context: context }); }).then(need);
    },
    simplifyText: function (text) { return ai('simplify', { text: text }).then(need); },
    summarizeText: function (text) { return ai('summarize', { text: text }).then(need); },
    translateText: function (text, lang) { return ai('translate', { text: text, targetLang: lang }).then(need); },
    defineWord: function (word, context) { return ai('define', { word: word, context: context }).then(need); },
    inferLabel: function (ctx) { return ai('label', ctx || {}).then(need); },
    generateLabels: function (ctx) { return ai('label', ctx || {}).then(need); },
    improveLinkText: function (linkText, href, context) { return ai('linkText', { linkText: linkText, href: href, context: context }).then(need); },
    inferColumnHeader: function (sampleData) { return ai('columnHeader', { sampleData: sampleData }).then(need); },
  };
  Object.keys(provider).forEach(function (k) { provider[k] = traced(provider[k]); });
  provider.announce = say;
  var toolkitReady = null;
  function toolkit() {
    toolkitReady = toolkitReady || import(TOOLKIT + 'utils/ai.js').then(function (m) { m.setAIProvider(provider); });
    return toolkitReady;
  }
  // Everything the adapters say goes through one polite live region. It goes on the page as soon
  // as the loader runs: screen readers often miss the first message of a region that appears
  // together with it. The region is emptied before each message, so the same words said twice
  // are read twice, and messages that arrive together are read as one instead of the last one
  // replacing the rest.
  function liveRegion() {
    var live = document.getElementById('ws-live');
    if (!live) {
      live = Object.assign(document.createElement('div'), { id: 'ws-live' });
      live.setAttribute('aria-live', 'polite');
      live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
      (document.body || document.documentElement).appendChild(live);
    }
    return live;
  }
  // One queue for the whole page, kept on the region itself, so the workshop's example adapters
  // (their say() helper does the same) and the toolkit's adapters never wipe each other's words.
  // Messages that arrive together are read as one, and each stays up for a moment before the next.
  var hushUntil = 0; // while a shopper or a fix switches many adapters at once, they don't each speak
  function say(text, mine) {
    text = squash(text);
    if (!mine && Date.now() < hushUntil) return;
    var live = liveRegion();
    if (!text || (live.waiting || []).slice(-1)[0] === text) return;
    // Whether everything waiting came from the panel itself, so the Audit tab's log says so.
    live.panel = (!live.waiting || !live.waiting.length ? true : live.panel) && !!mine;
    live.waiting = (live.waiting || []).concat(text);
    clearTimeout(live.timer);
    live.timer = setTimeout(function () {
      var words = live.waiting.join('. ');
      live.waiting = [];
      if (live.panel) live.__wsWho = 'panel';
      else if (live.__wsWho === 'panel') live.__wsWho = null;
      live.textContent = '';
      setTimeout(function () { live.textContent = words; live.until = Date.now() + 1200; }, 60);
    }, Math.max(50, (live.until || 0) - Date.now()));
  }
  if (document.body) liveRegion(); else document.addEventListener('DOMContentLoaded', liveRegion);
  window.RB_SAY = say;

  // ── The toolkit's automatic fixes ─────────────────────────────────────────
  // The extension runs axe-core, then hands each problem it finds to the toolkit's fix for that
  // rule (alt text, labels, contrast, link text, table headers, landmarks). This does the same.
  // Fixes change the page in place, so switching them off reloads the page without them.
  var ToolkitFixes = {
    enabled: false,
    enable: function () {
      if (this.enabled) return;
      this.enabled = true;
      var self = this;
      var mods = ['generate-alt', 'generate-labels', 'fix-contrast', 'wcag-fixes', 'fix-landmarks'];
      return Promise.all([loadScript(AXE, 'axe'), toolkit(), import(TOOLKIT + 'auditors/missing-alt.js')].concat(mods.map(function (n) { return import(TOOLKIT + 'adapters/' + n + '.js'); })))
        .then(function (r) {
          var handlers = {}, audit = r[2], alt = r[3];
          r.slice(3).forEach(function (m) { Object.assign(handlers, m.axeHandlers || {}); });
          return window.axe.run(document, { resultTypes: ['violations'] }).then(function (res) {
            var jobs = [];
            self.before = 0;
            res.violations.forEach(function (v) {
              var fix = handlers[v.id];
              v.nodes.forEach(function (n) {
                var el = document.querySelector(n.target[0]);
                if (!el || inPanel(el)) return;
                self.before++;
                if (!fix) return;
                var job = function () {
                  if (v.id.indexOf('color-contrast') === 0) { var s = getComputedStyle(el); return fix(el, s.color, s.backgroundColor); }
                  return fix(el);
                };
                job.el = el; job.kind = kindOf(v.id); job.why = v.help;
                jobs.push(job);
              });
            });
            // Like the extension's second scan: large images with empty alt text get a description too.
            audit.findEmptyAltImages().concat(audit.findBadAltImages()).forEach(function (img) {
              var job = function () { return alt.generateImageAlt(img); };
              job.el = img; job.kind = 'photo descriptions';
              job.why = img.alt.trim() ? 'Photo with a useless description, like a file name' : 'Large photo with an empty description';
              jobs.push(job);
            });
            var done = {};
            self.report('Fixing ' + jobs.length + ' problems…');
            // Five at a time, so image descriptions don't all wait on each other.
            var i = 0;
            function next() {
              var batch = jobs.slice(i, i + 5); i += 5;
              if (!batch.length) {
                var parts = Object.keys(done).map(function (k) { return done[k] + ' ' + k; });
                var n = Object.keys(done).reduce(function (a, k) { return a + done[k]; }, 0);
                return self.report(n ? 'Fixed ' + n + ' problems: ' + parts.join(', ') : 'Nothing to fix on this page');
              }
              return Promise.all(batch.map(function (f) {
                var before = snap(f.el);
                return Promise.resolve(Track.run('toolkit-fixes', f))
                  .then(function (r) { Track.diff('toolkit-fixes', f.el, before, f.why); if (r !== null) done[f.kind] = (done[f.kind] || 0) + 1; })
                  .catch(function (e) { console.warn('[workshop] fix failed:', e); });
              })).then(next);
            }
            return next();
          });
        });
    },
    // What it fixed, shown under its switch in the panel and read out to screen readers.
    report: function (text) {
      this.summary = text;
      say(text);
      document.dispatchEvent(new CustomEvent('ws-report', { detail: { name: 'toolkit-fixes', text: text } }));
    },
    disable: function () { this.enabled = false; },
  };
  // Groups the axe rules the fixes handle into words people know.
  function kindOf(rule) {
    if (/image|img|svg|object|area|role-img/.test(rule)) return 'photo descriptions';
    if (/contrast/.test(rule)) return 'contrast fixes';
    if (/landmark|region|heading|page-has|bypass|list/.test(rule)) return 'page structure fixes';
    if (/link/.test(rule)) return 'link names';
    return 'button and field names';
  }

  // ── Loading adapters ──────────────────────────────────────────────────────
  // "mine" is the adapter typed into the panel. It starts as the template and is kept in this browser.
  var MY_KEY = 'redbird:my-adapter';
  // What the Build tab keeps in this browser.
  var SKILLS_KEY = 'redbird:fixes', PERSON_KEY = 'redbird:person', NEED_KEY = 'redbird:need', DRAFT_KEY = 'redbird:build',
    PREV_KEY = 'redbird:my-adapter-prev', SETTINGS_KEY = 'redbird:settings', NOTE_KEY = 'redbird:build-note';
  // Settings a skill can give an adapter: the keys, and what the Engineer is told about them.
  var SETTINGS = {
    'visual-assist': [['fontScale', 'lineHeight', 'letterSpacing', 'enhanceFocus'], 'fontScale (1 to 2, text size), lineHeight (1 to 2.5), letterSpacing (0 to 0.3, in em), enhanceFocus (true or false)'],
    'translate-page': [['targetLang'], 'targetLang (a language name, e.g. "Spanish")'],
    'color-blind': [['type'], 'type ("protanopia", "deuteranopia" or "tritanopia")'],
    'calm-urgency': [['mode'], 'mode ("label" dims countdowns and low-stock messages and adds a short note, "hide" hides them)'],
  };
  var skillSettings = {};
  try { skillSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (e) {}
  function myCode() {
    var saved = null;
    try { saved = localStorage.getItem(MY_KEY); } catch (e) {}
    return saved ? Promise.resolve(saved) : fetch(base + 'adapters/_template.js').then(function (r) { return r.text(); });
  }
  // ?from=swatch-names copies that example into "your adapter" so you can change it.
  var from = qs.get('from');
  var copied = !from ? Promise.resolve() : fetch(base + 'adapters/' + from + '.js').then(function (r) { return r.ok ? r.text() : null; }).then(function (code) {
    if (code) {
      try {
        var old = localStorage.getItem(MY_KEY);
        if (old && old !== code) localStorage.setItem(PREV_KEY, old);
        localStorage.setItem(MY_KEY, code);
      } catch (e) {}
      result = { name: from + '-copy', need: 'A copy of the ' + from + ' example', description: '', adapters: [{ id: 'mine', settings: {} }], md: '', code: code };
      keep(DRAFT_KEY, result);
    }
    qs.delete('from');
    history.replaceState(history.state, '', location.pathname + (qs.toString() ? '?' + qs : '') + location.hash);
  });
  // Two toolkit files export functions rather than an adapter with enable() and disable().
  var WRAP = {
    'read-aloud': function (m) {
      return { enable: function () { m.ReadAloud.speakPage(); }, disable: function () { m.ReadAloud.stop(); } };
    },
    'simplify-text': function (m) {
      var done = [];
      return {
        enable: function () {
          // Issue 11 leaves the page without a <main>, so look in #main too.
          done = Array.prototype.filter.call(document.querySelectorAll('main p, main li, #main p, #main li'), function (el) {
            return !inPanel(el) && squash(el.textContent).length >= 100;
          }).slice(0, 6);
          return Promise.all(done.map(function (el) { return m.simplifyText(el).catch(warn('simplify-text')); }));
        },
        disable: function () { done.forEach(function (el) { m.restoreOriginal(el); }); done = []; },
      };
    },
  };
  function loadModule(name) {
    if (name === 'toolkit-fixes') return Promise.resolve({ ToolkitFixes: ToolkitFixes });
    if (name === 'mine') {
      return copied.then(myCode).then(function (code) {
        return import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      });
    }
    if (EXAMPLES.indexOf(name) !== -1) return import(base + 'adapters/' + name + '.js');
    var lib = NEEDS[name];
    var url = TOOLKIT + 'adapters/' + name + '.js';
    // One retry, in case the CDN drops the connection (the query makes the browser fetch it again).
    return Promise.all([toolkit(), lib ? loadScript(lib[1], lib[0]) : null])
      .then(function () { return import(url).catch(function () { return import(url + '?retry=1'); }); });
  }
  var loading = {}, adapters = {}, errors = {};
  function ensure(name) {
    loading[name] = loading[name] || loadModule(name).then(function (mod) {
      var a = WRAP[name] ? WRAP[name](mod) : Object.keys(mod).map(function (k) { return mod[k]; }).find(function (v) { return v && typeof v.enable === 'function'; });
      if (!a) throw new Error('no export with an enable() function');
      return (adapters[name] = instrument(name, a));
    });
    return loading[name];
  }
  var currentProfile = null, baseOptions = {};
  // A skill's settings for an adapter win over the profile's.
  function optionsFor(name) {
    var info = ADAPTERS[name] || {}, set = skillSettings[name] || {};
    if (info.arg) return set.type || info.arg;
    var o = Object.assign({}, baseOptions, info.opts || {});
    if (name === 'visual-assist') Object.assign(o, visualSettings());
    return Object.assign(o, set);
  }
  // visual-assist gets a middle setting: bigger text and more space, without breaking the layout.
  function visualSettings() { return { fontScale: 1.25, lineHeight: 1.6, enhanceFocus: true }; }
  function turnOn(name) {
    delete errors[name];
    refresh(name, 'Loading…');
    return ensure(name).then(function (a) {
      var fail = function (e) { errors[name] = 'Stopped with an error: ' + ((e && e.message) || e); warn(name)(e); refresh(name); };
      try { Promise.resolve(a.enable(optionsFor(name))).catch(fail); } catch (e) { fail(e); }
      refresh(name);
    }, function (e) {
      errors[name] = 'Didn’t load: ' + (e.message || String(e));
      warn(name)(e);
      refresh(name);
    });
  }
  function turnOff(name) {
    // The fixes and your own adapter change the page in ways a reload undoes best.
    if (name === 'toolkit-fixes' || name === 'mine') { location.reload(); return; }
    var a = adapters[name];
    try { if (a && a.disable) a.disable(); } catch (e) { warn(name)(e); }
    refresh(name);
  }
  function saveNames() {
    var v = names.length ? names.join(',') : 'none';
    try { localStorage.setItem('redbird:try', v); } catch (e) {}
    qs.set('try', v);
    history.replaceState(history.state, '', location.pathname + '?' + qs + location.hash);
  }
  function toggle(name, on) {
    var i = names.indexOf(name);
    if (on && i === -1) names.push(name);
    if (!on && i !== -1) names.splice(i, 1);
    saveNames();
    learn(name, on);
    if (rendered) root.querySelectorAll('input[data-ad="' + name + '"]').forEach(function (x) { x.checked = on; });
    if (on) turnOn(name); else turnOff(name);
    renderSaved();
    renderResult();
    renderOnList();
    fixAllButton();
  }
  function go(changes) {
    Object.keys(changes).forEach(function (k) { qs.set(k, changes[k]); });
    location.search = qs.toString();
  }


  // ── Describing what changed ───────────────────────────────────────────────
  var KIND = {
    IMG: 'photo', A: 'link', BUTTON: 'button', INPUT: 'field', SELECT: 'menu', TEXTAREA: 'field', H1: 'heading', H2: 'heading',
    H3: 'heading', H4: 'heading', P: 'paragraph', LI: 'list item', UL: 'list', OL: 'list', NAV: 'navigation', MAIN: 'main area',
    HEADER: 'header', FOOTER: 'footer', HTML: 'the whole page', BODY: 'the whole page', ABBR: 'abbreviation', VIDEO: 'video',
    TABLE: 'table', LABEL: 'label', SPAN: 'text', DIV: 'box', SECTION: 'section', ASIDE: 'side box', FORM: 'form', svg: 'icon',
    DETAILS: 'expandable box', DIALOG: 'dialog', STYLE: 'style sheet', LINK: 'style sheet',
  };
  function kindName(el) { return KIND[el.tagName] || el.tagName.toLowerCase(); }
  function describe(el) {
    if (!el || el.nodeType !== 1) return 'text';
    var kind = kindName(el);
    if (/^(HTML|BODY|STYLE|LINK|HEAD)$/.test(el.tagName)) return kind;
    var name = el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('title') || el.textContent;
    return kind + (squash(name) ? ' “' + cut(name, 40) + '”' : '');
  }
  var ATTR = {
    alt: 'description', 'aria-label': 'name a screen reader says', 'aria-labelledby': 'name taken from', 'aria-describedby': 'extra description from',
    'aria-hidden': 'hidden from screen readers', 'aria-live': 'read out when it changes', role: 'role', lang: 'language', tabindex: 'reachable with Tab',
    title: 'hint', style: 'inline style', class: 'class', hidden: 'hidden', 'aria-expanded': 'open', 'aria-checked': 'checked', 'aria-current': 'current',
  };
  // Changes a sighted person can't see: only a screen reader or the keyboard notices them.
  var UNSEEN = ['alt', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'aria-live', 'role', 'lang', 'tabindex', 'aria-expanded', 'aria-checked', 'aria-current'];
  function fmt(v) { return v == null ? 'none' : v === '' ? 'empty' : '“' + cut(v, 90) + '”'; }
  function live(e) {
    if (e.type === 'removed') return true;
    if (!e.el.isConnected) return false;
    if (e.type === 'attr') return e.el.getAttribute(e.attr) !== e.before;
    if (e.type === 'text') return e.parts.some(function (p) { return !p.nodes.length || p.nodes.some(function (n) { return n.isConnected; }); });
    return true;
  }
  // toolkit-fixes is the Audit tab's "Fix this page", so that's what it's called everywhere people see it.
  function label(name) { return name === 'mine' ? 'your adapter' : name === 'toolkit-fixes' ? 'fix-this-page' : name; }

  // ── Panel ─────────────────────────────────────────────────────────────────
  // dockW: how wide the sidebar is.
  var ui = { tab: 'profiles', open: true, side: 'left', dockW: 360, highlight: false };
  try { Object.assign(ui, JSON.parse(localStorage.getItem('redbird:panel') || 'null') || ((window.visualViewport ? visualViewport.width : innerWidth) < 640 ? { open: false } : {})); } catch (e) {}
  ui.open = true; // the panel is always there: it sits beside the page, not over it
  if (ui.dockW === 340) ui.dockW = 360; // the old default, too narrow for the tab names
  // "Edit a copy" in the guide: open the copied example's code in Build your adapter.
  var openCode = !!qs.get('from');
  if (openCode) ui.tab = 'build';
  // ?need= (the guide's problem list): open Build your own with that change already written in.
  if (qs.get('need')) {
    try {
      localStorage.setItem('redbird:need', qs.get('need'));
      localStorage.removeItem('redbird:build');
      // &new=1: the guide knows no adapter fixes this yet, so Build it goes straight to writing one.
      if (qs.get('new')) localStorage.setItem('redbird:need-new', qs.get('need')); else localStorage.removeItem('redbird:need-new');
    } catch (e) {}
    ui.tab = 'build';
    qs.delete('need');
    history.replaceState(history.state, '', location.pathname + (qs.toString() ? '?' + qs : '') + location.hash);
  }
  if (['profiles', 'adapters', 'build', 'audit'].indexOf(ui.tab) === -1) ui.tab = ui.tab === 'checks' || ui.tab === 'changes' ? 'audit' : 'profiles';
  function saveUi() { try { localStorage.setItem('redbird:panel', JSON.stringify(ui)); } catch (e) {} }
  // The panel is a full-height sidebar, and the store moves over to make room, so the panel never
  // covers the page. On a screen too narrow for both (a phone), it sits along the bottom instead,
  // and the page gets that much room at its end.
  var dockStyle = null;
  function dockWidth() { return Math.max(box.classList.contains('ws-wide') ? 520 : 280, Math.min(ui.dockW || 360, 720, innerWidth - 360)); }
  function dock() {
    if (!dockStyle) { dockStyle = document.getElementById('ws-dock') || document.head.appendChild(document.createElement('style')); }
    if (!host.isConnected) { dockStyle.textContent = ''; return; }
    var side = innerWidth >= 700, w = dockWidth();
    box.setAttribute('data-dock', side ? 'side' : 'bottom');
    var css = side ? 'html{padding-' + ui.side + ':' + w + 'px!important}' : 'html{padding-bottom:' + Math.round(innerHeight * 0.45) + 'px!important}';
    if (dockStyle.textContent !== css) dockStyle.textContent = css;
    var edge = $('.ws-edge');
    if (edge) { edge.setAttribute('aria-valuenow', String(w)); edge.setAttribute('aria-valuemin', '280'); edge.setAttribute('aria-valuemax', '720'); }
    place();
    if (marks.outline || marks.flash) queueMarks();
  }
  function place() {
    if (!box) return;
    var w = box.getAttribute('data-dock') === 'side' ? dockWidth() + 'px' : '';
    if (box.style.width !== w) box.style.width = w;
  }
  // The sidebar's inner edge changes its width: drag it, or focus it and use the arrow keys (it's a
  // separator, the usual pattern for a resizable side pane). The reset button puts the width and
  // the side back.
  function wireResize() {
    var edge = $('.ws-edge'), drag = null;
    function setWidth(w) { ui.dockW = Math.max(280, Math.min(720, Math.round(w))); saveUi(); dock(); }
    edge.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      drag = { x: e.clientX, w: dockWidth() };
      edge.setPointerCapture(e.pointerId);
    });
    edge.addEventListener('pointermove', function (e) {
      if (drag) setWidth(drag.w + (ui.side === 'left' ? 1 : -1) * (e.clientX - drag.x));
    });
    edge.addEventListener('pointerup', function () { drag = null; });
    edge.addEventListener('pointercancel', function () { drag = null; });
    edge.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (e.key === 'Home') d = -100; else if (e.key === 'End') d = 100;
      if (!d) return;
      e.preventDefault();
      setWidth(dockWidth() + d * 24 * (ui.side === 'left' ? 1 : -1));
    });
    $('#ws-reset').onclick = function () {
      ui.dockW = 360;
      ui.side = 'left';
      box.setAttribute('data-side', 'left');
      sideButton();
      saveUi();
      putHost();
      dock();
      $('#ws-reset').focus();
    };
  }
  var host, root, box, rendered = false;
  var filterWho = '', expanded = {}, lastCounts = {}, found = [];

  function panel() {
    // A shadow root keeps the panel out of the page's own DOM: adapters that watch, reword or
    // announce the page never see it, and the store's styles never reach it.
    host = document.createElement('div');
    host.id = 'ws-root';
    host.setAttribute('lang', 'en'); // stays English when translate-page switches the page to Spanish
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style>' +
      '<aside class="ws-panel" aria-label="AI4A11y Toolkit" data-side="' + ui.side + '">' +
        '<a class="ws-skip" href="#" id="ws-skip">Skip to the store</a>' +
        '<div class="ws-top">' +
          '<h2 class="ws-head"><span class="ws-title">AI4A11y Toolkit <span class="ws-sub">(Workshop Demo)</span></span></h2>' +
        '<button type="button" class="ws-icon" id="ws-reset" aria-label="Reset the panel’s width and side" title="Reset width and side">↺</button>' +
        '<button type="button" class="ws-icon" id="ws-side"></button></div>' +
        '<div class="ws-bar"><label class="ws-toggle" title="Marks each problem on the page with a red number, which turns green when an adapter fixes it.">' +
          '<input type="checkbox" role="switch" class="ws-spot"' + (spotOn() ? ' checked' : '') + '> <span>Show accessibility problems on the page</span></label></div>' +
        '<div class="ws-main">' +
          '<div class="ws-tabs" role="tablist" aria-label="AI4A11y Toolkit">' +
            tab('profiles', 'Profiles') + tab('adapters', 'Adapter Library') + tab('build', 'Build your adapter') + tab('audit', 'Audit') +
          '</div>' +
          '<div class="ws-scroll">' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-profiles" aria-labelledby="ws-tab-profiles">' + profilesHTML() + '</div>' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-adapters" aria-labelledby="ws-tab-adapters">' + adaptersHTML() + '</div>' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-build" aria-labelledby="ws-tab-build">' + buildHTML() + '</div>' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-audit" aria-labelledby="ws-tab-audit">' + auditHTML() + '</div>' +
          '</div>' +
          '<p class="ws-status" id="ws-status"></p>' +
          '<p class="ws-foot"><a href="' + base + '" target="_blank" rel="noopener">Guide<span class="ws-sr"> (opens in a new tab)</span></a></p>' +
        '</div>' +
        '<div class="ws-edge" role="separator" aria-orientation="vertical" aria-label="Panel width" tabindex="0" title="Drag to change the width"></div>' +
      '</aside><div class="ws-marks" aria-hidden="true"></div><div class="ws-pickbox" aria-hidden="true" hidden></div>';
    putHost();
    box = root.querySelector('.ws-panel');
    rendered = true;
    wire();
    showTab(ui.tab, false);
    sideButton();
    dock();
    fillProfiles();
    renderOnList();
    names.forEach(function (n) { refresh(n); });
    summary();
  }
  // Reading order follows the screen: on the left, the panel comes before the page; on the
  // right, after it.
  function putHost() {
    if (ui.side === 'left') document.body.insertBefore(host, document.body.firstChild);
    else document.body.appendChild(host);
  }
  function tab(id, text) {
    return '<button type="button" role="tab" class="ws-tab" id="ws-tab-' + id + '" aria-controls="ws-pane-' + id + '">' + text + '</button>';
  }
  function $(sel) { return root.querySelector(sel); }

  // Profiles: who you're shopping as, in their own words, and their adapters as switches you can
  // tap. Like the toolkit's profiles, it learns: turn one of their adapters off, or another one on,
  // and it's remembered for that person next time (see LEARN_KEY).
  function profilesHTML() {
    var people = '<optgroup label="Workshop shoppers">' + Object.keys(PEOPLE).map(function (id) { return '<option value="' + id + '">' + PEOPLE[id][0] + '</option>'; }).join('') + '</optgroup>' +
      '<optgroup label="The toolkit’s profiles">' + Object.keys(TOOLKIT_PROFILES).map(function (id) { return '<option value="' + id + '">' + TOOLKIT_PROFILES[id][0] + '</option>'; }).join('') + '</optgroup>';
    return '<label class="ws-lab" for="ws-prof">Shop as</label>' +
      '<select id="ws-prof" class="ws-select"><option value="me">My profile</option>' + people + '</select>' +
      '<div id="ws-persona"></div>' +
      '<div class="ws-line"><h3 class="ws-h">Adapters on</h3><button type="button" class="ws-link" id="ws-alloff">Turn all off</button></div>' +
      '<ul class="ws-pills" id="ws-pills" aria-label="Adapters on"></ul>' +
      '<p class="ws-help" id="ws-learned"></p>' +
      '<h3 class="ws-h">What they do on this page</h3>' +
      '<ul class="ws-plain ws-onlist" id="ws-on-list"></ul>';
  }
  function renderOnList() {
    var el = rendered && $('#ws-on-list');
    if (!el) return;
    // Just labels, so a stray click can't turn one off. Switches are in the Adapter Library tab.
    var pills = $('#ws-pills');
    pills.innerHTML = names.length ? names.map(function (n) {
      return '<li class="ws-pill" title="' + esc((ADAPTERS[n] || {}).help || '') + '">' + esc(label(n)) + '</li>';
    }).join('') : '<li class="ws-help">No adapters on yet.</li>';
    var l = profileName ? learned()[profileName] : null, bits = [];
    // Only what matches the page now: a guide link can turn on an adapter the person turned off.
    var lon = l ? l.on.filter(function (n) { return names.indexOf(n) !== -1; }) : [], loff = l ? l.off.filter(function (n) { return names.indexOf(n) === -1; }) : [];
    if (lon.length) bits.push('keeps ' + lon.map(label).join(', ') + ' on');
    if (loff.length) bits.push('keeps ' + loff.map(label).join(', ') + ' off');
    var whose = !bits.length ? '' : profileName === 'me' ? 'your profile' : nameOf(profileName).split(',')[0].replace(' (toolkit profile)', '');
    $('#ws-learned').innerHTML = bits.length ? 'Learned from you: ' + esc(whose) + ' ' + esc(bits.join(' and ')) + '. <button type="button" class="ws-link" id="ws-forget">Forget this</button>' : '';
    // The person's adapters stay listed when they're off, so they can be ticked back on. The
    // boxes are the same switches as in the Adapter Library tab, kept in step both ways.
    var listed = (profileName ? setOf(profileName) : []).filter(function (n) { return ADAPTERS[n]; });
    names.forEach(function (n) { if (listed.indexOf(n) === -1) listed.push(n); });
    var had = root.activeElement && root.activeElement.closest && root.activeElement.closest('#ws-on-list') ? root.activeElement.getAttribute('data-ad') : null;
    el.innerHTML = listed.length ? listed.map(function (n) {
      var on = names.indexOf(n) !== -1;
      var what = n === 'mine' && result && result.code ? result.need : (ADAPTERS[n] || {}).help || '';
      return '<li><label class="ws-check"><input type="checkbox" data-ad="' + esc(n) + '"' + (on ? ' checked' : '') + '> <span class="ws-name">' + esc(label(n)) + '</span></label>' +
        (what ? '<span class="ws-help ws-block ws-indent">' + esc(what) + '</span>' : '') +
        '<div class="ws-chg-slot ws-indent" data-slot="' + esc(n) + '"></div></li>';
    }).join('') : '<li class="ws-help">Nothing on yet.</li>';
    if (had) { var again = el.querySelector('input[data-ad="' + had + '"]'); if (again) again.focus(); }
    names.forEach(function (n) { refresh(n); });
  }
  // What the panel learned for each person: { sam: { on: [...], off: [...] } }.
  var LEARN_KEY = 'redbird:learned';
  function learned() { try { return JSON.parse(localStorage.getItem(LEARN_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function learnedSet(id) {
    var l = learned()[id] || { on: [], off: [] };
    return setOf(id).filter(function (n) { return l.off.indexOf(n) === -1; }).concat(l.on.filter(function (n) { return setOf(id).indexOf(n) === -1; }));
  }
  var learning = true; // off while a fix from the Build tab switches adapters: that isn't about the person
  function learn(name, on) {
    if (!learning || !profileName || name === 'mine' || (profileName === 'me' && !myProfile())) return;
    var all = learned(), l = all[profileName] || { on: [], off: [] }, base = setOf(profileName).indexOf(name) !== -1;
    l.on = l.on.filter(function (n) { return n !== name; });
    l.off = l.off.filter(function (n) { return n !== name; });
    if (on && !base) l.on.push(name);
    if (!on && base) l.off.push(name);
    all[profileName] = l;
    try { localStorage.setItem(LEARN_KEY, JSON.stringify(all)); } catch (e) {}
  }
  // Adapters: every adapter, grouped by who it helps, each with a switch.
  function adaptersHTML() {
    var html = '<h3 class="ws-h">Fix accessibility problems with adapters</h3>';
    GROUPS.forEach(function (g) {
      var on = g[2].filter(function (n) { return names.indexOf(n) !== -1; }).length;
      html += '<details class="ws-group"' + (on || g === GROUPS[0] ? ' open' : '') + '><summary>' + g[0] +
        ' <span class="ws-gc" data-group="' + esc(g[0]) + '">' + (on ? on + ' on' : '') + '</span></summary>' +
        g[2].map(row).join('') + '</details>';
    });
    return html;
  }
  // What people built in Build your own sits under the workshop examples: each saved adapter, and
  // the one running now if it isn't saved yet. One runs at a time, so turning one on swaps it in,
  // and the page reloads so the new code starts on a fresh page.
  function mineRows() {
    var code = readKey(MY_KEY), on = names.indexOf('mine') !== -1, html = '', shown = false;
    fixes().forEach(function (f, i) {
      if (!f.code) return;
      var here = on && f.code === code;
      if (here) shown = true;
      html += '<div class="ws-ad"><label class="ws-check"><input type="checkbox" data-fix="' + i + '"' + (here ? ' checked' : '') + '> <span class="ws-name">' + esc(f.name) + '</span></label>' +
        '<p class="ws-help ws-for">Built by you</p><p class="ws-help">' + esc(cut(f.need || f.description || '', 140)) + '</p>' +
        (here ? '<div class="ws-state" data-state="mine"></div>' : '') + '</div>';
    });
    if (code && !shown) {
      var cur = result && result.code === code;
      html = '<div class="ws-ad" data-row="mine"><label class="ws-check"><input type="checkbox" data-ad="mine"' + (on ? ' checked' : '') + '> <span class="ws-name">' + esc(cur ? result.name : 'your adapter') + '</span></label>' +
        '<p class="ws-help ws-for">Built by you, not saved yet</p><p class="ws-help">' + esc(cur ? cut(result.need, 140) : 'The adapter you made in Build your adapter.') + '</p>' +
        '<div class="ws-state" data-state="mine"></div></div>' + html;
    }
    return '<div id="ws-mine-rows">' + (html || '<p class="ws-help ws-ad">Adapters you build in the Build your adapter tab show up here.</p>') + '</div>';
  }
  function row(name) {
    if (name === 'mine') return mineRows();
    var info = ADAPTERS[name] || {};
    var on = names.indexOf(name) !== -1;
    var help = info.help, off = false;
    if (name === 'mine') {
      off = !hasMine() && !on;
      help = off ? 'Not made yet. The Build your adapter tab makes one.' : result && result.code ? '“' + cut(result.need, 140) + '”' : 'The adapter you made in Build your adapter.';
    }
    return '<div class="ws-ad" data-row="' + name + '"><label class="ws-check"><input type="checkbox" data-ad="' + name + '"' + (on ? ' checked' : '') + (off ? ' disabled' : '') + '> ' +
      '<span class="ws-name">' + label(name) + '</span>' + (info.ai ? ' <span class="ws-tag">AI</span>' : '') + '</label>' +
      (info.who ? '<p class="ws-help ws-for">For: ' + esc(info.who) + '</p>' : '') +
      '<p class="ws-help">' + esc(help) + '</p><div class="ws-state" data-state="' + name + '"></div></div>';
  }
  function spotOn() { return !!window.RB_SPOTLIGHT; }
  function auditHTML() {
    return '<h3 class="ws-h">Do a comprehensive audit</h3>' +
      '<p class="ws-help">Finds accessibility problems on this page, like photos with no description.</p>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-run">Run the audit</button></div>' +
      '<div id="ws-res"></div>' +
      '<h3 class="ws-h">Fix everything it found</h3>' +
      '<p class="ws-help">Fixes what the audit finds: it describes photos, names buttons and fields, and fixes low contrast and headings. Sam’s profile turns this on.</p>' +
      '<div class="ws-row"><button type="button" class="ws-btn" id="ws-fixall"></button></div>' +
      '<div class="ws-state" data-state="toolkit-fixes"></div>' +
      '<details class="ws-group"><summary>What a screen reader hears</summary>' +
      '<p class="ws-help">Messages the page reads out, like “Added to cart”.</p>' +
      '<ol class="ws-heard" id="ws-heard"></ol></details>';
  }
  function fixAllButton() {
    var b = rendered && $('#ws-fixall');
    if (b) b.textContent = names.indexOf('toolkit-fixes') !== -1 ? 'Undo the fixes' : 'Fix this page';
  }

  function wire() {
    $('#ws-side').onclick = function () { ui.side = ui.side === 'left' ? 'right' : 'left'; box.setAttribute('data-side', ui.side); sideButton(); saveUi(); putHost(); dock(); $('#ws-side').focus(); };
    addEventListener('resize', dock);
    var tabs = root.querySelectorAll('[role=tab]');
    tabs.forEach(function (t, i) {
      t.onclick = function () { showTab(t.id.replace('ws-tab-', ''), true); };
      t.onkeydown = function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var nt = tabs[(i + d + tabs.length) % tabs.length];
        showTab(nt.id.replace('ws-tab-', ''), true);
        nt.focus();
      };
    });
    // Setup
    $('#ws-prof').value = profileName || 'me';
    $('#ws-prof').onchange = function () {
      var id = this.value;
      switchProfile(id);
    };
    $('#ws-learned').addEventListener('click', function (e) {
      if (!e.target.closest('#ws-forget')) return;
      var all = learned();
      delete all[profileName];
      try { localStorage.setItem(LEARN_KEY, JSON.stringify(all)); } catch (x) {}
      go({ profile: profileName, try: setOf(profileName).join(',') });
    });
    $('#ws-alloff').onclick = function () {
      var reload = names.indexOf('toolkit-fixes') !== -1 || names.indexOf('mine') !== -1;
      var was = names.slice();
      names = [];
      saveNames();
      // Turning everything off is a reset, not something to learn about the person.
      if (reload) return location.reload();
      was.forEach(turnOff);
      root.querySelectorAll('input[data-ad]').forEach(function (cb) { cb.checked = false; });
      renderOnList();
      fixAllButton();
    };
    root.addEventListener('change', function (e) {
      var cb = e.target;
      if (cb.matches && cb.matches('input[data-fix]')) {
        var f = fixes()[Number(cb.getAttribute('data-fix'))], others = names.filter(function (n) { return n !== 'mine'; });
        if (!f) return;
        if (cb.checked) install(f.code, 'Turned on ' + f.name + '.', others.concat('mine'), 'adapters');
        else applySet(others, skillSettings);
        return;
      }
      if (!cb.matches || !cb.matches('input[data-ad]')) return;
      var n = cb.getAttribute('data-ad');
      root.querySelectorAll('input[data-ad="' + n + '"]').forEach(function (x) { x.checked = cb.checked; });
      toggle(n, cb.checked);
    });
    // The changes listed under an adapter: open the list, show more, outline one on the page.
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]');
      if (b) return locate(Track.list[Number(b.getAttribute('data-n')) - 1]);
      var more = e.target.closest('[data-more]');
      if (more) {
        expanded[more.getAttribute('data-more')] = true;
        var det = more.closest('details');
        det.querySelector('.ws-chgbody').__html = '';
        updateChanges(det.parentNode, det.getAttribute('data-who'));
      }
    });
    root.addEventListener('toggle', function (e) {
      var det = e.target;
      if (!det.classList || !det.classList.contains('ws-chgs')) return;
      openChanges[det.getAttribute('data-who')] = det.open;
      if (det.open) updateChanges(det.parentNode, det.getAttribute('data-who'));
    }, true);
    // Audit
    // The problem badges come and go in place, without a reload.
    root.querySelectorAll('.ws-spot').forEach(function (cb) {
      cb.onchange = function () {
        var on = cb.checked;
        qs.set('spotlight', on ? 'on' : 'off');
        history.replaceState(history.state, '', location.pathname + '?' + qs + location.hash);
        if (on && window.RB_SPOTLIGHT_START) window.RB_SPOTLIGHT_START();
        if (!on && window.RB_SPOTLIGHT && window.RB_SPOTLIGHT.stop) window.RB_SPOTLIGHT.stop();
        root.querySelectorAll('.ws-spot').forEach(function (other) { other.checked = on; });
      };
    });
    $('#ws-run').onclick = runChecks;
    $('#ws-fixall').onclick = function () {
      var on = names.indexOf('toolkit-fixes') !== -1;
      if (!on) status('Fixing the page. Photos take a few seconds each.');
      toggle('toolkit-fixes', !on);
      fixAllButton();
    };
    fixAllButton();
    $('#ws-res').addEventListener('click', function (e) {
      var b = e.target.closest('[data-found]');
      if (b) locateEl(found[Number(b.getAttribute('data-found'))], b.textContent);
    });
    document.addEventListener('ws-report', function (e) {
      refresh('toolkit-fixes');
      if (/^(Fixed|Nothing)/.test(e.detail.text) && $('#ws-res').innerHTML) runChecks();
    });
    wireBuild();
    wireResize();
    // Skip to the store, and Alt+Shift+T to come back to the panel from anywhere on the page.
    $('#ws-skip').onclick = function (e) {
      e.preventDefault();
      var main = document.querySelector('main, #main, [role=main]') || document.body;
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus();
    };
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.shiftKey && (e.code === 'KeyT')) { e.preventDefault(); var t = $('[role=tab][aria-selected=true]'); if (t) t.focus(); }
    });
  }
  function sideButton() {
    var b = $('#ws-side');
    b.textContent = ui.side === 'left' ? '→' : '←';
    b.setAttribute('aria-label', 'Move this panel to the ' + (ui.side === 'left' ? 'right' : 'left'));
  }
  function showTab(id, save) {
    ui.tab = id;
    if (save) saveUi();
    root.querySelectorAll('[role=tab]').forEach(function (t) {
      var on = t.id === 'ws-tab-' + id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    root.querySelectorAll('[role=tabpanel]').forEach(function (p) { p.hidden = p.id !== 'ws-pane-' + id; });
    if (id === 'audit') renderHeard();
    place();
  }
  // Changes who you're shopping as without a reload: their profile file is read, adapters that
  // read the profile start again with it, and their set of adapters is turned on. Only when the
  // store's problems aren't all on (after an agent link) does it reload, to put them back.
  function switchProfile(id) {
    var ids = id === 'none' ? [] : learnedSet(id);
    if (!window.RB_ISSUES || RB_ISSUES.value !== 'on') return go({ profile: id, try: ids.join(',') || 'none', issues: 'on' });
    return (id === 'none' ? Promise.resolve(null) : loadProfile(id))
      .then(function (prof) {
        profileName = id === 'none' ? '' : id;
        currentProfile = prof;
        baseOptions.profile = prof && !prof.toolkit ? prof : null;
        try { localStorage.setItem('redbird:profile', id); } catch (e) {}
        qs.set('profile', id);
        var again = names.filter(function (n) { return ids.indexOf(n) !== -1 && n !== 'toolkit-fixes' && n !== 'mine'; });
        if (applySet(ids, {})) return;
        again.forEach(function (n) { turnOff(n); turnOn(n); });
        fillProfiles();
        renderOnList();
        var p = $('#ws-person');
        if (p && !readKey(PERSON_KEY)) p.value = prof ? prof.freeText || '' : '';
        var on = names.length + ' adapter' + (names.length === 1 ? '' : 's') + ' on.';
        status(id === 'me' ? (prof ? 'Using your profile. ' + on : 'Answer the questions below to make your profile.')
          : !prof ? 'Shopping as nobody in particular. ' + on : prof.toolkit ? 'Using the toolkit’s ' + TOOLKIT_PROFILES[id][0] + ' profile. ' + on : 'Shopping as ' + nameOf(id) + '. ' + on);
      }, function () { go({ profile: id, try: ids.join(',') || 'none', issues: 'on' }); });
  }
  function fillProfiles() {
    if (profileName === 'me') return fillMine();
    $('#ws-persona').innerHTML = currentProfile
      ? '<figure class="ws-persona"><figcaption>' + esc(nameOf(profileName)) + '</figcaption>' + (currentProfile.toolkit
        ? '<p class="ws-help">' + esc(currentProfile.freeText) + '</p>' : '<blockquote>“' + esc(currentProfile.freeText || '') + '”</blockquote>') + '</figure>'
      : '<p class="ws-help">Pick someone to shop as, or pick My profile to make your own.</p>';
  }
  // My profile, made or not yet. Making it asks three questions; AI writes the profile in the
  // person's words and picks the adapters that match, the way the toolkit's onboarding does.
  function fillMine(editing) {
    var me = myProfile(), el = $('#ws-persona');
    if (me && !editing) {
      el.innerHTML = '<figure class="ws-persona" tabindex="-1"><figcaption>My profile</figcaption><blockquote>“' + esc(me.freeText) + '”</blockquote></figure>' +
        '<div class="ws-row" id="ws-me-acts"><button type="button" class="ws-btn ws-quiet" id="ws-me-edit">Change it</button>' +
        '<button type="button" class="ws-btn ws-quiet" id="ws-me-file">Save it as a file</button>' +
        '<button type="button" class="ws-link" id="ws-me-del">Delete it</button></div>' +
        '<p class="ws-help">It’s kept in this browser, and it remembers which adapters you turn on or off. The toolkit’s browser extension can load the file with Import profile.</p>';
      $('#ws-me-edit').onclick = function () { fillMine(true); $('#ws-me1').focus(); };
      $('#ws-me-file').onclick = saveMine;
      $('#ws-me-del').onclick = askDelete;
      return;
    }
    var a = (me && me.answers) || ['', '', ''];
    var q = function (id, text, v) { return '<label class="ws-lab" for="' + id + '">' + text + '</label><textarea id="' + id + '" class="ws-input" rows="2">' + esc(v) + '</textarea>'; };
    el.innerHTML = '<div class="ws-card"><h3 class="ws-h">Make your own profile</h3>' +
      '<p class="ws-help">Answer in your own words, and the toolkit picks adapters for you.</p>' +
      q('ws-me1', 'What gets in your way on shopping websites?', a[0]) + q('ws-me2', 'What would make shopping websites easier for you?', a[1]) + q('ws-me3', 'Is there anything you don’t want changed?', a[2]) +
      '<div class="ws-row"><button type="button" class="ws-btn" id="ws-me-go">' + (me ? 'Update my profile' : 'Make my profile') + '</button>' +
      (me ? '<button type="button" class="ws-link" id="ws-me-cancel">Cancel</button>' : '') + '</div>' +
      '<p class="ws-help" id="ws-me-msg"></p>' +
      '<p class="ws-help">AI reads your answers to write the profile. The profile is kept only in this browser.</p></div>';
    $('#ws-me-go').onclick = makeMine;
    if (me) $('#ws-me-cancel').onclick = function () { fillMine(); $('#ws-me-edit').focus(); };
  }
  function meSays(text) { var m = $('#ws-me-msg'); if (m) m.textContent = text; say(text, true); }
  // Two adapters that do the same job fight on the page; when the AI picks both, the first is kept.
  var CLASH = [['pause-moving-things', 'stop-auto-advance'], ['reading-level', 'simplify-text']];
  function makeMine() {
    var a = ['#ws-me1', '#ws-me2', '#ws-me3'].map(function (q) { return $(q).value.trim(); });
    if (!a[0] && !a[1]) { meSays('Answer the first two questions first.'); $('#ws-me1').focus(); return; }
    var btn = $('#ws-me-go'), label = btn.textContent, t0 = Date.now();
    btn.disabled = true;
    btn.textContent = 'Making your profile…';
    // The time ticks on the button, which a screen reader doesn't read out again.
    var tick = setInterval(function () { btn.textContent = 'Making your profile… ' + Math.round((Date.now() - t0) / 1000) + ' s'; }, 1000);
    var stop = function () { clearInterval(tick); btn.textContent = label; btn.disabled = false; };
    meSays('Making your profile…');
    var input = { catalog: catalog(), answers: 'What gets in my way on shopping websites: ' + (a[0] || '-') + '\nWhat would make shopping websites easier for me: ' + (a[1] || '-') + '\nWhat I don’t want changed: ' + (a[2] || '-') };
    var parse = function (text) {
      var d = null;
      try { d = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ['null'])[0]); } catch (e) {}
      if (!d || typeof d !== 'object' || (d.about != null && typeof d.about !== 'string')) throw new Error('the AI’s answer wasn’t a profile');
      d.about = d.about || ''; // nothing to go on: the answers didn't say what gets in their way
      return d;
    };
    // One more try if the answer doesn't come back or isn't a profile.
    ask('myProfile', input).then(parse).catch(function () { return ask('myProfile', input).then(parse); })
      .then(function (d) {
        clearInterval(tick);
        if (!d.about.trim()) { stop(); meSays('Say a bit more about what gets in your way, then try again.'); $('#ws-me1').focus(); return; }
        var ids = (d.adapters || []).filter(function (n, i, all) { return ADAPTERS[n] && n !== 'mine' && all.indexOf(n) === i; });
        CLASH.forEach(function (c) { if (ids.indexOf(c[0]) !== -1) ids = ids.filter(function (n) { return n !== c[1]; }); });
        ids = ids.slice(0, 5);
        var me = { name: 'My profile', freeText: String(d.about).trim(), adapters: ids, answers: a, updatedAt: Date.now(),
          supportAreas: (d.supportAreas || []).filter(function (x) { return /^(vision|hearing|motor|cognitive|reading|sensory)$/.test(x); }),
          fields: { needs: [] } };
        var grade = Number(d.readingLevel);
        if (grade >= 3 && grade <= 12) me.fields.readingLevel = grade;
        if (d.urgency === 'hide' || d.urgency === 'label') me.fields.needs.push({ dimension: 'urgency', value: d.urgency, strength: 'preference', unit: 'enum' });
        localStorage.setItem(ME_KEY, JSON.stringify(me));
        var all = learned(); delete all.me; localStorage.setItem(LEARN_KEY, JSON.stringify(all)); // a new profile starts fresh
        return Promise.resolve(switchProfile('me')).then(function () {
          var f = $('#ws-persona figure');
          if (f) f.focus();
          if (!ids.length) status('Made your profile. None of the adapters matched what you wrote, so none are on. Turn any on in the Adapter Library, and they’re saved to your profile.');
        });
      })
      .catch(function (e) { stop(); meSays('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function saveMine() {
    var me = myProfile();
    if (!me) return;
    var blob = { kind: 'aa-profile-blob', v: 1, exportedAt: Date.now(), abilityModel: null,
      profile: { supportAreas: me.supportAreas || [], freeText: me.freeText, fields: me.fields || {}, metaPreferences: { language: 'standard' }, updatedAt: me.updatedAt || null } };
    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(blob, null, 2)], { type: 'application/json' }));
    link.download = 'my-accessibility-profile.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
    status('Saved my-accessibility-profile.json to your downloads.');
  }
  function askDelete() {
    $('#ws-me-acts').innerHTML = '<span class="ws-help">Delete your profile from this browser?</span>' +
      '<button type="button" class="ws-btn ws-quiet" id="ws-me-yes">Delete it</button><button type="button" class="ws-link" id="ws-me-no">Keep it</button>';
    $('#ws-me-no').focus();
    $('#ws-me-no').onclick = function () { fillMine(); $('#ws-me-del').focus(); };
    $('#ws-me-yes').onclick = function () {
      localStorage.removeItem(ME_KEY);
      var all = learned(); delete all.me; localStorage.setItem(LEARN_KEY, JSON.stringify(all));
      Promise.resolve(switchProfile('me')).then(function () { var q = $('#ws-me1'); if (q) q.focus(); });
    };
  }
  function summary() {
    GROUPS.forEach(function (g) {
      var n = g[2].filter(function (x) { return names.indexOf(x) !== -1; }).length;
      var el = root.querySelector('[data-group="' + g[0] + '"]');
      if (el) el.textContent = n ? n + ' on' : '';
    });
  }
  // The line under an adapter's switch: loading, an error, or what the fixes did; then a list of
  // its changes that opens in place.
  function refresh(name, text) {
    if (!rendered) return;
    summary();
    if (name === 'mine') fixState();
    root.querySelectorAll('[data-slot="' + name + '"]').forEach(function (slot) { updateChanges(slot, name); });
    var el = root.querySelector('[data-state="' + name + '"]');
    if (!el) return;
    var on = names.indexOf(name) !== -1, line = '';
    if (on && errors[name]) line = '<p class="ws-err">' + esc(errors[name]) + '</p>';
    else if (on && text) line = '<p class="ws-note">' + esc(text) + '</p>';
    else if (on && name === 'toolkit-fixes' && ToolkitFixes.summary) line = '<p class="ws-note">' + esc(ToolkitFixes.summary) + '</p>';
    var lineEl = el.querySelector('.ws-state-line') || el.appendChild(Object.assign(document.createElement('div'), { className: 'ws-state-line' }));
    if (lineEl.__html !== line) { lineEl.innerHTML = line; lineEl.__html = line; }
    var slot = el.querySelector('.ws-chg-slot') || el.appendChild(Object.assign(document.createElement('div'), { className: 'ws-chg-slot' }));
    if (on && !errors[name] && !text) updateChanges(slot, name); else slot.innerHTML = '';
  }
  function count(name) { return Track.list.filter(function (e) { return e.who === name && live(e); }).length; }
  // "12 changes on this page", a disclosure that lists them when opened. A list that has focus
  // inside it isn't redrawn, so a screen reader or keyboard user doesn't lose their place.
  var openChanges = {};
  function updateChanges(slot, who) {
    var n = count(who), det = slot.querySelector('details.ws-chgs');
    if (!n) {
      var none = Track.obs ? '<p class="ws-help">Nothing to change on this page.</p>' : '';
      if (slot.__html !== none) { slot.innerHTML = none; slot.__html = none; }
      return;
    }
    var title = n + ' change' + (n === 1 ? '' : 's') + ' on this page';
    if (!det) {
      slot.innerHTML = '<details class="ws-chgs" data-who="' + esc(who) + '"' + (openChanges[who] ? ' open' : '') + '><summary><span>' + title + '</span><span class="ws-sr"> by ' + esc(label(who)) + '</span></summary><div class="ws-chgbody"></div></details>';
      slot.__html = '';
      det = slot.querySelector('details');
    } else if (det.firstChild.firstChild.textContent !== title) det.firstChild.firstChild.textContent = title;
    var body = det.querySelector('.ws-chgbody');
    if (det.open && !body.contains(root.activeElement)) {
      var html = changesList(who);
      if (body.__html !== html) { body.innerHTML = html; body.__html = html; }
    }
  }
  function changesList(who) {
    var mine = Track.list.filter(function (e) { return e.who === who && live(e); });
    var kinds = {}, order = [], html = '';
    mine.forEach(function (e) { var k = e.type + ':' + e.attr; if (!kinds[k]) { kinds[k] = []; order.push(k); } kinds[k].push(e); });
    order.forEach(function (k) {
      var items = kinds[k], key = who + '|' + k, open = expanded[key] ? items.length : 8;
      html += '<ul class="ws-list">' + items.slice(0, open).map(changeRow).join('') + '</ul>';
      if (items.length > open) html += '<button type="button" class="ws-link" data-more="' + esc(key) + '">Show ' + (items.length - open) + ' more like these</button>';
    });
    var unseen = mine.filter(function (e) { return e.type !== 'removed' && e.type !== 'style' && !box2(e.el); }).length;
    if (unseen) html += '<p class="ws-help">' + unseen + ' of these are only for screen readers or the keyboard, so they don’t show on the page.</p>';
    return html;
  }

  // Called after anything is put down to an adapter; redraws what's showing, a few times a second at most.
  var pending = 0;
  function changed() {
    if (!rendered || pending) return;
    pending = setTimeout(function () {
      pending = 0;
      names.forEach(function (n) { refresh(n); });
      if (ui.tab === 'audit') renderHeard();
      if (marks.outline) queueMarks();
      place();
    }, 300);
  }

  function changeRow(e) {
    var what, diff = '', tag = '';
    if (e.type === 'style') {
      var rules = 0;
      try { rules = e.el.sheet ? e.el.sheet.cssRules.length : 0; } catch (x) {}
      return '<li><details class="ws-css"><summary><span class="ws-num">' + e.n + '</span> Added a style sheet' + (rules ? ' with ' + rules + ' rules' : '') + '</summary>' +
        '<pre>' + esc(cut(e.el.textContent || e.el.href || '', 1500)) + '</pre></details></li>';
    }
    if (e.type === 'attr') {
      what = describe(e.el);
      // A new class or inline style reads as code ("deal-timer ws-calm-hide"), so say what it did instead.
      if (e.attr === 'class' || e.attr === 'style') diff = e.el.isConnected && !e.el.getClientRects().length ? 'hid it' : 'changed how it looks';
      else diff = (ATTR[e.attr] ? ATTR[e.attr] + ' (' + e.attr + ')' : e.attr) + ': ' + fmt(e.before) + ' → ' + fmt(e.el.getAttribute(e.attr));
      if (UNSEEN.indexOf(e.attr) !== -1) tag = '<span class="ws-tag">heard, not seen</span>';
    } else if (e.type === 'text') {
      what = 'Text in ' + (e.el.nodeType === 1 ? kindName(e.el) : 'the page');
      var was = squash(e.parts.map(function (p) { return p.before; }).join(' '));
      var nodes = [].concat.apply([], e.parts.map(function (p) { return p.nodes; })).filter(function (n) { return n.isConnected; });
      var now = squash(nodes.map(function (n) { return n.textContent; }).join(' '));
      if (was && was === now) diff = 'same words, new markup: ' + cut(nodes.map(function (n) { return n.nodeType === 1 ? n.outerHTML : n.data; }).join(''), 160);
      else diff = (was ? fmt(was) + ' → ' : 'added ') + (now ? fmt(now) : 'removed');
    } else if (e.type === 'added' && e.el.matches(LIVE)) {
      what = 'Added a message area for screen readers';
      diff = squash(e.el.textContent) ? 'now saying ' + fmt(squash(e.el.textContent)) : 'nothing said yet';
      tag = '<span class="ws-tag">heard, not seen</span>';
    } else if (e.type === 'added') {
      what = 'Added ' + describe(e.el);
    } else {
      what = 'Removed ' + e.before;
    }
    return '<li><button type="button" class="ws-chg" data-n="' + e.n + '"><span class="ws-num">' + e.n + '</span>' +
      '<span class="ws-what">' + esc(what) + ' ' + tag + '</span>' + (diff ? '<span class="ws-diff">' + esc(diff) + '</span>' : '') +
      (e.why ? '<span class="ws-why">' + esc(e.why) + '</span>' : '') + '</button></li>';
  }
  function renderHeard() {
    var ol = $('#ws-heard');
    if (!Track.heard.length) { ol.innerHTML = '<li class="ws-help">Nothing read out yet.</li>'; return; }
    ol.innerHTML = Track.heard.slice().reverse().map(function (h) {
      var s = Math.round((h.at - t0) / 1000);
      return '<li><span class="ws-t">' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '</span> “' + esc(cut(h.text, 160)) + '”' +
        ' <span class="ws-who">' + (h.who === 'panel' ? 'from the panel' : h.who ? 'from ' + esc(label(h.who)) : 'from the store') + '</span></li>';
    }).join('');
  }

  // ── Showing where a change is ─────────────────────────────────────────────
  var marks = { outline: false, flash: null, raf: 0, timer: 0 };
  function box2(el) {
    if (!el || !el.isConnected || el.nodeType !== 1 || /^(HTML|BODY|HEAD|STYLE|LINK|META|SCRIPT)$/.test(el.tagName)) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return null;
    var s = getComputedStyle(el);
    if (s.visibility === 'hidden' || Number(s.opacity) === 0) return null;
    if (r.right < -100 || r.bottom < -100 - scrollY || r.left > document.documentElement.scrollWidth) return null;
    return r;
  }
  function queueMarks() {
    if (!marks.raf) marks.raf = requestAnimationFrame(drawMarks);
    if ((marks.outline || marks.flash) && !marks.timer) marks.timer = setInterval(queueMarks, 700);
  }
  function drawMarks() {
    marks.raf = 0;
    var layer = root && root.querySelector('.ws-marks');
    if (!layer) return;
    if (marks.flash && Date.now() > marks.flash.until) marks.flash = null;
    if (!marks.outline && !marks.flash) { clearInterval(marks.timer); marks.timer = 0; layer.innerHTML = ''; return; }
    var items = [], seen = [];
    if (marks.outline) Track.list.forEach(function (e) {
      if (live(e) && e.type !== 'removed' && e.type !== 'style' && seen.indexOf(e.el) === -1) { seen.push(e.el); items.push([e.el, 0, '']); }
    });
    if (marks.flash) items.push([marks.flash.el, marks.flash.n, ' ws-flash']);
    var html = '';
    items.slice(-200).forEach(function (it) {
      var r = box2(it[0]);
      if (!r) return;
      html += '<div class="ws-mark' + it[2] + '" style="left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px">' +
        (it[1] ? '<span>' + it[1] + '</span>' : '') + '</div>';
    });
    layer.innerHTML = html;
  }
  addEventListener('scroll', function () { if (marks.outline || marks.flash) queueMarks(); }, { passive: true, capture: true });
  addEventListener('resize', function () { if (marks.outline || marks.flash) queueMarks(); });
  // The panel's visible message line. What it says is read out through say(), the page's one voice.
  function status(text) { var s = $('#ws-status'); s.textContent = text; say(text, true); }
  function locate(e) {
    if (!e) return;
    if (e.type === 'removed' || !e.el.isConnected) return status('That part isn’t on the page any more.');
    if (e.type === 'style' || /^(HTML|BODY|HEAD)$/.test(e.el.tagName)) return status('This changes the whole page, not one spot.');
    locateEl(e.el, '', e.n);
  }
  function locateEl(el, what, n) {
    if (!el || !el.isConnected) return status('That part isn’t on the page any more.');
    if (!box2(el)) {
      // Hidden things, like a skip link before you press Tab: point at the nearest visible parent.
      var p = el.parentElement;
      while (p && !box2(p)) p = p.parentElement;
      if (!p || /^(HTML|BODY)$/.test(p.tagName)) return status('This change is only for screen readers or the keyboard.');
      el = p;
      status('This change is only for screen readers or the keyboard. It’s inside the outlined part.');
    } else status(what ? 'Outlined: ' + what : 'Outlined on the page.');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    marks.flash = { el: el, n: n, until: Date.now() + 3000 };
    queueMarks();
  }

  // ── Build: one box, and the toolkit decides ───────────────────────────────
  // Someone writes who the fix is for and what should change, and presses Build it. The toolkit's
  // two builders run in the order the toolkit uses them: the Engineer (toolkit/core/skill-builder.js)
  // first tries to meet the need with adapters that already exist, and writes that up as a
  // SKILL.md. Only when none fit does the extension's Adapter Builder prompt have AI write a new
  // adapter, which runs here as "mine". Both prompts are in the store's api/_builders.js.
  //
  // Whatever gets built is a "fix": a name, the need, the adapters it turns on, its SKILL.md, and
  // the code of a new adapter if it has one. Saved fixes keep their own code, so building a new
  // adapter never overwrites a saved one.
  function hasMine() { try { return !!localStorage.getItem(MY_KEY); } catch (e) { return false; } }
  function readKey(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function writeKey(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch (e) {} }
  function load(key, fallback) { try { var v = JSON.parse(readKey(key) || 'null'); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function keep(key, v) { writeKey(key, v == null ? null : JSON.stringify(v)); }
  var result = load(DRAFT_KEY, null);
  if (result && !result.adapters) result = null; // something saved by an older version of the panel
  var note = load(NOTE_KEY, null);
  keep(NOTE_KEY, null);

  // What the Engineer can pick from: every adapter in the panel, with who it helps.
  var AREAS = { 'Blind and screen reader users': 'vision', 'Low vision and color blindness': 'vision', 'Reading and understanding': 'reading, cognitive',
    'Attention, anxiety and motion': 'cognitive, sensory', 'Deaf and hard of hearing': 'hearing', 'Motor and keyboard': 'motor' };
  var EX_AREAS = { 'real-arrival-dates': 'vision, cognitive', 'swatch-names': 'vision', 'calm-urgency': 'cognitive', 'reading-level': 'reading, cognitive', 'pause-moving-things': 'cognitive, sensory' };
  function areasOf(n) {
    if (EX_AREAS[n]) return EX_AREAS[n];
    var g = GROUPS.find(function (x) { return x[2].indexOf(n) !== -1; });
    return (g && AREAS[g[0]]) || 'cognitive';
  }
  function catalog() {
    var lines = ['- toolkit-fixes — ' + ADAPTERS['toolkit-fixes'].help + ' (helps: vision, motor)'];
    GROUPS.forEach(function (g) {
      g[2].forEach(function (n) { if (n !== 'mine') lines.push('- ' + n + ' — ' + ADAPTERS[n].help + ' (helps: ' + areasOf(n) + ')'); });
    });
    return lines.join('\n');
  }
  function settingsLines() { return Object.keys(SETTINGS).map(function (k) { return '- ' + k + ': ' + SETTINGS[k][1]; }).join('\n'); }
  function settingsOf(adapters) {
    var out = {};
    adapters.forEach(function (a) {
      var allowed = (SETTINGS[a.id] || [[]])[0], s = {};
      Object.keys(a.settings || {}).forEach(function (k) { if (allowed.indexOf(k) !== -1) s[k] = a.settings[k]; });
      if (Object.keys(s).length) out[a.id] = s;
    });
    return out;
  }

  // A SKILL.md, the toolkit's format: front matter, a few short sections, and a JSON recipe.
  function parseSkill(md) {
    var text = String(md || '').trim();
    var outer = text.match(/^```(?:markdown|md)?\s*\n([\s\S]*)\n```$/);
    if (outer) text = outer[1].trim();
    var meta = {}, fm = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm) fm[1].split('\n').forEach(function (l) { var m = l.match(/^(\w+):\s*(.*)$/); if (m) meta[m[1]] = m[2].trim(); });
    var rec = text.match(/```json\s*\n([\s\S]*?)\n```/), list = [];
    try { list = JSON.parse(rec[1]).adapters || []; } catch (e) {}
    var seen = {};
    var adapters = list.filter(function (a) {
      var ok = a && ADAPTERS[a.id] && a.id !== 'mine' && !seen[a.id];
      if (ok) seen[a.id] = true;
      return ok;
    }).map(function (a) { return { id: a.id, settings: a.settings && typeof a.settings === 'object' ? a.settings : {} }; });
    var s = { name: kebab(meta.name), description: meta.description || '', adapters: adapters, md: text };
    s.md = recipe(s);
    return s;
  }
  function recipe(s) {
    if (!s.md) return '';
    var json = '```json\n' + JSON.stringify({ adapters: s.adapters.map(function (a) { return { id: a.id, settings: settingsOf([a])[a.id] || {} }; }) }, null, 2) + '\n```';
    var md = /```json\s*\n[\s\S]*?\n```/.test(s.md) ? s.md.replace(/```json\s*\n[\s\S]*?\n```/, json) : s.md + '\n\n## Recipe\n' + json;
    return md.replace(/^name:.*$/m, 'name: ' + s.name);
  }
  function kebab(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'my-fix'; }
  function idsOf(s) { return s.adapters.map(function (a) { return a.id; }); }
  function same(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) !== -1; }); }
  function fixes() { return load(SKILLS_KEY, []).filter(function (f) { return f && f.adapters; }); }
  function activeFix() { return names.length ? fixes().find(function (s) { return same(idsOf(s), names); }) : null; }
  function isSaved(f) { return fixes().some(function (x) { return x.name === f.name && same(idsOf(x), idsOf(f)) && (x.code || '') === (f.code || ''); }); }
  function saveFix(f) {
    var list = fixes().filter(function (x) { return x.name !== f.name; });
    list.unshift({ name: f.name, need: f.need || '', description: f.description || '', adapters: f.adapters, md: f.md || '', code: f.code || null, from: f.from || 'built', at: Date.now() });
    keep(SKILLS_KEY, list);
  }

  // The Build tab's AI calls. Unlike the adapters' calls, these say why they failed.
  function ask(task, input) {
    return fetch(aiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ task: task }, input)) })
      .catch(function () { throw new Error('couldn’t reach the AI'); })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (r.ok && d.result) return d.result;
          throw new Error(d.error || 'the AI didn’t answer (' + r.status + ')');
        });
      });
  }
  function person() { var t = rendered && $('#ws-person'); return t ? t.value.trim() : readKey(PERSON_KEY) || ''; }
  function here() { return location.pathname + location.search; }

  // Turns on exactly these adapters, in place when it can. Returns true when the page reloads.
  function applySet(ids, settings) {
    hushUntil = Date.now() + 2500;
    var before = skillSettings;
    skillSettings = settings || {};
    keep(SETTINGS_KEY, skillSettings);
    var off = names.filter(function (n) { return ids.indexOf(n) === -1; });
    if (off.indexOf('toolkit-fixes') !== -1 || off.indexOf('mine') !== -1) {
      names = ids.slice();
      saveNames();
      location.reload();
      return true;
    }
    learning = false;
    off.forEach(function (n) { toggle(n, false); });
    ids.forEach(function (n) {
      if (names.indexOf(n) === -1) toggle(n, true);
      else if (JSON.stringify(before[n] || {}) !== JSON.stringify(skillSettings[n] || {})) { turnOff(n); turnOn(n); }
    });
    learning = true;
    root.querySelectorAll('input[data-ad]').forEach(function (cb) { cb.checked = names.indexOf(cb.getAttribute('data-ad')) !== -1; });
    renderResult();
    renderSaved();
    return false;
  }
  // Puts code in as your adapter (the last version is kept), turns on exactly these adapters, and
  // reloads so the new code runs on a fresh page.
  function install(code, msg, ids, tab) {
    var old = readKey(MY_KEY);
    if (old && old !== code) writeKey(PREV_KEY, old);
    writeKey(MY_KEY, code);
    keep(NOTE_KEY, { text: msg });
    names = ids.slice();
    saveNames();
    ui.tab = tab || 'build';
    saveUi();
    location.reload();
  }
  function cleanCode(code) {
    var m = String(code).match(/```(?:javascript|js)?\s*\n([\s\S]*?)\n```/);
    if (m) code = m[1];
    if (!/export\s+(const|let|var|default|function|class)\b/.test(code)) throw new Error('the AI’s answer wasn’t an adapter');
    return String(code).trim() + '\n';
  }

  // Share links carry the whole fix after the #, so they can be long, and the server
  // never sees them. They are squeezed first, so a whole adapter fits in a chat message.
  function b64(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  function pack(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (!window.CompressionStream) return Promise.resolve('j' + b64(bytes));
    return new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()
      .then(function (b) { return 'z' + b64(new Uint8Array(b)); });
  }
  function unpack(s) {
    var bytes = unb64(s.slice(1));
    var p = s[0] === 'z' ? new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer().then(function (b) { return new Uint8Array(b); }) : Promise.resolve(bytes);
    return p.then(function (b) { return JSON.parse(new TextDecoder().decode(b)); });
  }
  // The same page, with only its own settings (which product, which search) kept.
  function pageLink(extra) {
    var q = new URLSearchParams();
    ['id', 'q', 'cat'].forEach(function (k) { if (qs.get(k)) q.set(k, qs.get(k)); });
    q.set('workshop', 'on');
    Object.keys(extra || {}).forEach(function (k) { q.set(k, extra[k]); });
    return location.origin + location.pathname + '?' + q;
  }
  function fixLink(f) {
    var ids = idsOf(f).filter(function (n) { return n !== 'mine'; });
    return pack({ name: f.name, need: f.need, description: f.description, adapters: f.adapters, md: f.md, code: f.code || null })
      .then(function (p) { return pageLink({ try: ids.join(',') || 'none' }) + '#fix=' + p; });
  }
  function share(f, msgSel) {
    fixLink(f).then(function (url) {
      var shown = $(msgSel);
      shown.innerHTML = '<label class="ws-lab">Link to share<input class="ws-input ws-linkbox" readonly value="' + esc(url) + '"></label><span class="ws-said"></span>';
      var box = shown.querySelector('input');
      box.onfocus = function () { box.select(); };
      var said = shown.querySelector('.ws-said');
      return (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        function () { said.textContent = 'Copied. Paste it in the chat.'; say(said.textContent, true); },
        function () { box.focus(); said.textContent = 'Copy the link from the box.'; say(said.textContent, true); });
    }).catch(function (e) { $(msgSel).textContent = 'Couldn’t make a link: ' + (e.message || e); });
  }

  // A link from someone else (#fix=, or #skill= and #adapter= from before). A fix without new code
  // turns on right away (its adapters come in the link's ?try=) and is saved. A fix with code waits:
  // the code is shown, and only runs when the person presses Run it.
  var incoming = null;
  var shared = location.hash.match(/^#(fix|skill|adapter)=([\w-]+)$/);
  var incomingReady = !shared ? Promise.resolve() : unpack(shared[2]).then(function (d) {
    var f = { name: kebab(d.name || d.description), need: d.need || d.description || '', description: d.description || '', md: d.md || '', code: d.code || null, from: 'shared' };
    f.adapters = (d.adapters || (d.code ? [{ id: 'mine' }] : [])).filter(function (a) { return a && ADAPTERS[a.id]; })
      .map(function (a) { return { id: a.id, settings: a.settings || {} }; })
      .filter(function (a) { return a.id !== 'mine'; });
    if (f.code) f.adapters.push({ id: 'mine', settings: {} });
    incoming = { fix: f };
    if (!f.code) {
      saveFix(f);
      result = f;
      keep(DRAFT_KEY, result);
      skillSettings = settingsOf(f.adapters);
      keep(SETTINGS_KEY, skillSettings);
    }
  }).catch(function () { incoming = { bad: true }; }).then(function () {
    if (incoming) ui.tab = 'build';
    history.replaceState(history.state, '', location.pathname + location.search);
  });

  // ── Build tab ─────────────────────────────────────────────────────────────
  // Three steps, top to bottom: who it's for, what should change, Build it.
  var EXAMPLE_NEEDS = ['Hide the countdowns and “only 2 left” messages', 'Read the star ratings out as numbers', 'Make the buttons bigger and easier to hit'];
  function buildHTML() {
    return '<div id="ws-in"></div>' +
      '<h3 class="ws-h">Build your own adapter or skill</h3>' +
      '<ol class="ws-steps">' +
        '<li><label class="ws-lab" for="ws-person">Who is it for?</label>' +
          '<textarea id="ws-person" class="ws-input" rows="2" aria-describedby="ws-person-help" placeholder="e.g., Mark has ADHD and anxiety. Countdown timers make him rush."></textarea>' +
          '<p class="ws-help" id="ws-person-help">A sentence or two about them, like your card game’s ability profile.</p>' +
          '<details class="ws-more" id="ws-ask"><summary>Not sure what to write? Answer three questions</summary>' +
            '<label class="ws-lab" for="ws-q1">What on shopping sites gets in their way?</label><textarea id="ws-q1" class="ws-input" rows="2"></textarea>' +
            '<label class="ws-lab" for="ws-q2">What would make shopping sites easier for them?</label><textarea id="ws-q2" class="ws-input" rows="2"></textarea>' +
            '<label class="ws-lab" for="ws-q3">Is there anything they don’t want changed?</label><textarea id="ws-q3" class="ws-input" rows="2"></textarea>' +
            '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-askgo">Write it for me</button></div></details></li>' +
        '<li><label class="ws-lab" for="ws-need">What should change on this page?</label>' +
          '<textarea id="ws-need" class="ws-input" rows="3" placeholder="Describe one change"></textarea>' +
          '<p class="ws-help">For example: ' + EXAMPLE_NEEDS.map(function (t, i) {
            return '<button type="button" class="ws-link" data-eg="' + i + '">' + esc(t) + '</button>';
          }).join(', ') + '</p>' +
          '<p class="ws-help"><button type="button" class="ws-link" id="ws-point" aria-pressed="false">Point at it on the page</button> <span id="ws-target"></span></p>' +
          '<details class="ws-more" id="ws-ideas"><summary>Not sure what to change? Get ideas for this page</summary>' +
            '<p class="ws-help">AI looks at this page and at who it’s for, and suggests three changes.</p>' +
            '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-ideasgo">Suggest changes</button></div>' +
            '<ul class="ws-plain" id="ws-idealist"></ul></details></li>' +
        '<li><div class="ws-row"><button type="button" class="ws-btn" id="ws-build" aria-describedby="ws-build-help">Build it</button></div>' +
          '<p class="ws-help" id="ws-build-help">If the toolkit has adapters that do this, you get a skill that turns them on. If not, AI writes a new adapter, which takes about 30 seconds.</p>' +
          '<details class="ws-more"><summary>What’s the difference?</summary>' +
            '<p class="ws-help"><b>An adapter</b> is code that changes one thing on a page, like stopping animations.</p>' +
            '<p class="ws-help"><b>A skill</b> has no code. It lists a few adapters to turn on together for a user’s need.</p></details></li>' +
      '</ol>' +
      '<p class="ws-msg" id="ws-msg"></p>' +
      '<div id="ws-result"></div>' +
      '<div id="ws-saved"></div>' +
      '<details class="ws-more ws-ready"><summary>Ready-made skills from the toolkit</summary><ul class="ws-sks" id="ws-ready"></ul></details>';
  }
  // The toolkit's built-in skills (toolkit/skills/builtin/*.md). Their recipes are mapped to the
  // adapters in this panel, since the toolkit's ids for its automatic fixes and captions differ.
  var READY = [
    { name: 'calm-browsing', need: 'Stops motion, darkens the page and hides clutter.', adapters: ['motion-reducer', 'dark-mode', 'focus-mode'] },
    { name: 'quiet-video', need: 'Turns on captions and stops motion.', adapters: ['show-captions', 'motion-reducer'] },
    { name: 'reading-aid', need: 'Bigger text, more space between lines, and fewer distractions.', adapters: ['visual-assist', 'focus-mode'] },
    { name: 'screen-reader-boost', need: 'Fixes the page for screen readers and adds keyboard shortcuts.', adapters: ['toolkit-fixes', 'keyboard-nav'] },
  ];
  function renderReady() {
    var el = rendered && $('#ws-ready');
    if (!el) return;
    el.innerHTML = READY.map(function (r, i) {
      return '<li class="ws-sk"><p><span class="ws-name">' + r.name + '</span></p><p class="ws-help">' + esc(r.need) + ' Turns on ' + r.adapters.map(label).join(', ') + '.</p>' +
        '<div class="ws-row"><button type="button" class="ws-link" data-ready="' + i + '" aria-label="Turn on ' + r.name + '">Turn on</button></div></li>';
    }).join('');
  }
  function useReady(r) {
    var f = { name: r.name, need: r.need, description: r.need, adapters: r.adapters.map(function (id) { return { id: id, settings: {} }; }), md: '', code: null, from: 'toolkit' };
    result = f;
    keep(DRAFT_KEY, result);
    keep(NOTE_KEY, { text: 'Turned on ' + r.name + '.' });
    // Its SKILL.md comes from the toolkit's repository, for the Details link.
    fetch(TOOLKIT.replace(/tools\/$/, 'toolkit/skills/builtin/') + r.name + '.md').then(function (x) { return x.ok ? x.text() : ''; }).then(function (md) {
      if (md && result === f) { f.md = md; keep(DRAFT_KEY, f); renderResult(); }
    }).catch(function () {});
    if (!applySet(idsOf(f), {})) { keep(NOTE_KEY, null); msg('Turned on ' + r.name + '.'); renderResult(); }
  }
  // Ideas for step 2: AI reads this page and who it's for, and suggests three changes.
  function suggest() {
    var done = wait($('#ws-ideasgo'), 'Looking at this page…');
    ask('suggestChanges', { person: person(), snapshot: snapshot(document.body, 14000), url: here() }).then(function (text) {
      done();
      var ideas = text.split('\n').map(function (l) { return l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').replace(/^["“]|["”]$/g, '').trim(); }).filter(Boolean).slice(0, 4);
      $('#ws-idealist').innerHTML = ideas.map(function (t) {
        return '<li><button type="button" class="ws-link ws-idea" data-idea>' + esc(t) + '</button></li>';
      }).join('');
      msg(ideas.length ? '' : 'No ideas came back. Try again.');
      if (ideas.length) say(ideas.length + ' ideas below.', true);
    }, function (e) { done(); msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  // Three answers become the "Who is it for?" text, like the toolkit's onboarding chat.
  function askProfile() {
    var a = ['#ws-q1', '#ws-q2', '#ws-q3'].map(function (q) { return $(q).value.trim(); });
    if (!a.join('')) { msg('Answer at least one question first.'); $('#ws-q1').focus(); return; }
    var done = wait($('#ws-askgo'), 'Writing who it’s for…');
    ask('profileFromChat', { answers: 'What gets in their way on shopping sites: ' + (a[0] || '-') + '\nWhat would make shopping sites easier for them: ' + (a[1] || '-') + '\nWhat they don’t want changed: ' + (a[2] || '-') })
      .then(function (text) {
        done();
        var main = text.split(/\n\s*Support areas:/i)[0].trim();
        var p = $('#ws-person');
        p.value = main;
        writeKey(PERSON_KEY, main);
        $('#ws-ask').open = false;
        p.focus();
        msg('Done. Edit it if anything is wrong.');
      }, function (e) { done(); msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function msg(text) { var el = rendered && $('#ws-msg'); if (el) el.textContent = text; if (text) say(text, true); }
  // A button that waits on the AI shows how long it has been, so a 30-second wait doesn't look stuck.
  // The time ticks in a separate, silent element, so a screen reader hears the message once.
  var waiting = 0;
  function wait(btn, text) {
    var t = Date.now();
    btn.disabled = true;
    msg(text);
    var tick = Object.assign(document.createElement('span'), { className: 'ws-tick' });
    tick.setAttribute('aria-hidden', 'true');
    btn.parentNode.appendChild(tick);
    clearInterval(waiting);
    waiting = setInterval(function () { tick.textContent = Math.round((Date.now() - t) / 1000) + ' s'; }, 1000);
    return function () { clearInterval(waiting); tick.remove(); btn.disabled = false; };
  }

  // Build it: the Engineer first; if no adapter fits, AI writes a new one.
  function build() {
    var need = $('#ws-need').value.trim();
    if (!need) { msg('Write what should change first.'); $('#ws-need').focus(); return; }
    if (readKey('redbird:need-new') === need) return writeNew(need, $('#ws-build'));
    var done = wait($('#ws-build'), 'Looking for adapters that do this…');
    ask('buildSkill', { need: need, person: person(), catalog: catalog(), settings: settingsLines() }).then(parseSkill).then(function (s) {
      done();
      if (s.adapters.length) return useSkill(need, s);
      writeNew(need, $('#ws-build'));
    }, function (e) { done(); msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function useSkill(need, s) {
    result = { name: s.name, need: need, description: s.description, adapters: s.adapters, md: s.md, code: null };
    keep(DRAFT_KEY, result);
    var n = s.adapters.length;
    var text = 'Done. Check the page.';
    keep(NOTE_KEY, { text: text });
    if (applySet(idsOf(result), settingsOf(result.adapters))) return;
    keep(NOTE_KEY, null);
    msg(text);
    $('#ws-result').scrollIntoView({ block: 'nearest' });
  }
  // keep: adapters from the toolkit to keep next to the new one (a skill someone asked to change).
  function writeNew(need, btn, keep) {
    var done = wait(btn, 'No adapter does this yet, so AI is writing one. This takes about 30 seconds…');
    ask('writeAdapter', { description: need, person: person(), snapshot: snapshot(document.body, 14000), target: target ? target.html : '', url: here() })
      .then(function (code) { finishAdapter(need, cleanCode(code), 'Done. AI wrote a new adapter, and it’s on.', keep); })
      .catch(function (e) { done(); msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function finishAdapter(need, code, text, kept) {
    var adapters = (kept || []).filter(function (a) { return a.id !== 'mine'; }).concat({ id: 'mine', settings: {} });
    result = { name: kebab(need.split(/\s+/).slice(0, 5).join(' ')), need: need, description: need, adapters: adapters, md: '', code: code, target: target };
    keep(DRAFT_KEY, result);
    install(code, text, idsOf(result));
  }
  // Not right? A built adapter is changed by the AI that wrote it. A skill goes back to the
  // Engineer, and if it now finds no adapter that fits, AI writes a new one for the need and the change.
  function change(feedback, error) {
    // Code written by hand (in Details, or from the guide) has no fix card: make one, so the AI
    // can fix the code that's running.
    var running = readKey(MY_KEY);
    if (error && running && (!result || !result.code || result.code !== running)) {
      result = { name: (result && result.name) || 'my-adapter', need: (result && result.need) || 'My own adapter', description: '',
        adapters: [{ id: 'mine', settings: {} }], md: '', code: running };
      keep(DRAFT_KEY, result);
    }
    if (!result) return;
    if (!feedback && !error) { msg('Say what to change first.'); $('#ws-fb').focus(); return; }
    var btn = $(error ? '#ws-repair' : '#ws-change');
    if (result.code) {
      var done = wait(btn, error ? 'Asking the AI to fix the error…' : 'Changing the adapter…');
      ask('reviseAdapter', { code: result.code, description: result.need, feedback: feedback || '', error: error || '', person: person(),
        snapshot: snapshot(document.body, 14000), target: result.target ? result.target.html : '', url: here() })
        .then(function (code) {
          result.code = cleanCode(code);
          keep(DRAFT_KEY, result);
          install(result.code, error ? 'Fixed. It’s running again.' : 'Changed.', idsOf(result));
        }).catch(function (e) { done(); msg('That didn’t work: ' + e.message + '. Try again.'); });
      return;
    }
    var done2 = wait(btn, 'Trying again…');
    ask('buildSkill', { need: result.need, person: person(), catalog: catalog(), settings: settingsLines(), previous: result.md, feedback: feedback })
      .then(parseSkill).then(function (s) {
        done2();
        if (s.adapters.length) return useSkill(result.need, s);
        writeNew(result.need + '. ' + feedback, btn, result.adapters);
      }, function (e) { done2(); msg('That didn’t work: ' + e.message + '. Try again.'); });
  }

  // What was built: what it turned on, a switch to compare, Save, and a box to change it.
  function renderResult() {
    var el = rendered && $('#ws-result');
    if (!el) return;
    if (!result) {
      // Coders who open ?try=mine get the code box straight away (Write an adapter by hand).
      el.innerHTML = names.indexOf('mine') !== -1 ? '<div class="ws-card"><h3 class="ws-h">Your adapter</h3>' + mineState() + codeBox('') + '</div>' : '';
      fillCode();
      return;
    }
    var ids = idsOf(result), on = same(ids, names), saved = isSaved(result);
    var others = ids.filter(function (n) { return n !== 'mine'; });
    var did = result.code ? (others.length ? 'A new adapter written by AI, plus ' + others.map(label).join(', ') + ' from the toolkit.' : 'A new adapter, written by AI.')
      : ids.length + ' adapter' + (ids.length === 1 ? '' : 's') + ' from the toolkit:';
    var body = result.code
      ? mineState()
      : '<ul class="ws-plain ws-compact">' + result.adapters.map(function (a) {
        return '<li><span class="ws-name" title="' + esc(ADAPTERS[a.id].help) + '">' + esc(label(a.id)) + '</span>' +
          '<div class="ws-chg-slot" data-slot="' + esc(a.id) + '"></div></li>';
      }).join('') + '</ul>';
    el.innerHTML = '<div class="ws-card">' +
      '<button type="button" class="ws-icon ws-close" id="ws-close" aria-label="Close ' + esc(result.name) + ' (its adapters stay as they are)" title="Close">×</button>' +
      '<h3 class="ws-h">' + esc(result.name) + ' <span class="ws-tag">' + (result.code ? (others.length ? 'Skill + new adapter' : 'New adapter') : 'Skill') + '</span></h3><p class="ws-help">' + did + '</p>' + body +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-onoff" aria-pressed="' + !on + '">' + (on ? 'Turn off to compare' : 'Turn it back on') + '</button>' +
        '<button type="button" class="ws-btn" id="ws-save"' + (saved ? ' disabled' : '') + '>' + (saved ? 'Saved' : 'Save') + '</button></div>' +
      '<details class="ws-more" id="ws-fbbox"><summary>Not right? Change it</summary>' +
        '<label class="ws-lab" for="ws-fb">Say what to change</label>' +
        '<textarea id="ws-fb" class="ws-input" rows="2" placeholder="e.g., It missed the countdown at checkout"></textarea>' +
        '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-change">Change it</button></div></details>' +
      (result.code ? codeBox(readKey(PREV_KEY) ? '<button type="button" class="ws-link" id="ws-prev">Go back to the last version</button>' : '')
        : '<details class="ws-more"><summary>Details</summary><p class="ws-help">As a SKILL.md file, the toolkit’s format for skills:</p><pre class="ws-pre" tabindex="0">' + esc(result.md) + '</pre></details>') +
      '</div>';
    fillCode();
    ids.forEach(function (n) { var slot = el.querySelector('[data-slot="' + n + '"]'); if (slot) updateChanges(slot, n); });
  }
  function codeBox(extra) {
    return '<details class="ws-more" id="ws-code-box"' + (openCode ? ' open' : '') + '><summary>Details</summary>' +
      '<label class="ws-help" for="ws-code">The code. You can edit it and run it again.</label>' +
      '<textarea id="ws-code" class="ws-codearea" spellcheck="false"></textarea>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-runmine">Save and run</button>' + extra + '</div></details>';
  }
  function fillCode() { var t = $('#ws-code'); if (t) myCode().then(function (c) { t.value = (result && result.code) || c; }); }
  // How your adapter is doing: off, broken, or what it changed.
  var mineWarn = '';
  function mineState() {
    var on = names.indexOf('mine') !== -1, err = errors.mine || (mineWarn && 'It logged an error: ' + mineWarn);
    if (!on) return '<p class="ws-help" id="ws-fix-state">It’s off.</p>';
    if (err) return '<div id="ws-fix-state"><p class="ws-err">' + esc(err) + '</p><div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-repair">Ask the AI to fix it</button></div></div>';
    return '<div id="ws-fix-state"><div class="ws-chg-slot" data-slot="mine"></div></div>';
  }
  function fixState() {
    var el = rendered && $('#ws-fix-state');
    if (!el) return;
    var slot = el.querySelector('[data-slot="mine"]');
    if (slot && !errors.mine && !mineWarn) return updateChanges(slot, 'mine');
    var wrap = document.createElement('div');
    wrap.innerHTML = mineState();
    el.replaceWith(wrap.firstChild);
    var s2 = $('#ws-fix-state [data-slot="mine"]');
    if (s2) updateChanges(s2, 'mine');
  }
  function renderSaved() {
    var mr = rendered && $('#ws-mine-rows');
    if (mr) mr.outerHTML = mineRows();
    var el = rendered && $('#ws-saved');
    if (!el) return;
    summary();
    var list = fixes();
    if (!list.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<h3 class="ws-h">Saved fixes</h3><ul class="ws-sks">' + list.map(function (f, i) {
      var on = same(idsOf(f), names) && (!f.code || f.code === readKey(MY_KEY));
      var kind = f.code ? (idsOf(f).length > 1 ? 'Skill + new adapter' : 'New adapter') : 'Skill';
      return '<li class="ws-sk"><p><span class="ws-name">' + esc(f.name) + '</span> <span class="ws-tag">' + kind + '</span>' + (on ? ' <span class="ws-tag">on</span>' : '') +
          (f.from === 'shared' ? ' <span class="ws-tag">shared with you</span>' : '') + '</p>' +
        '<p class="ws-help">' + esc(cut(f.need || f.description || idsOf(f).map(label).join(', '), 160)) + '</p>' +
        '<div class="ws-row">' + (on ? '' : '<button type="button" class="ws-link" data-fon="' + i + '" aria-label="Turn on ' + esc(f.name) + '">Turn on</button>') +
          '<button type="button" class="ws-link" data-fshare="' + i + '" aria-label="Share ' + esc(f.name) + '">Share</button>' +
          '<button type="button" class="ws-link" data-fdel="' + i + '" aria-label="Delete ' + esc(f.name) + '">Delete</button></div>' +
        '<div class="ws-msg" id="ws-f' + i + '"></div></li>';
    }).join('') + '</ul>';
  }
  function renderIncoming() {
    var el = rendered && $('#ws-in');
    if (!el || !incoming) return;
    var html;
    if (incoming.bad) html = '<p class="ws-err">This share link is broken. Ask for it again.</p>';
    else {
      var f = incoming.fix;
      html = '<h3 class="ws-h">Someone shared a fix: ' + esc(f.name) + '</h3><p class="ws-help">' + esc(cut(f.need || f.description, 300)) + '</p>';
      html += f.code
        ? '<p class="ws-help">It has code they wrote, which runs only if you press Run it.</p>' +
          '<details class="ws-more"><summary>See their code</summary><pre class="ws-pre" tabindex="0">' + esc(f.code) + '</pre></details>' +
          '<div class="ws-row"><button type="button" class="ws-btn" id="ws-in-run">Run it</button></div>'
        : '<p class="ws-help">It’s on, and saved under Saved fixes.</p>';
    }
    el.innerHTML = '<div class="ws-card ws-incard">' + html + '<button type="button" class="ws-link" id="ws-in-close">Close</button></div>';
  }

  // Pointing at the part of the page the change is about. Its markup goes to the AI with the request.
  var target = (result && result.target) || null, picking = false, pickBox = null;
  function startPick() {
    if (picking) return stopPick('Stopped pointing.');
    picking = true;
    var b = $('#ws-point');
    b.textContent = 'Stop pointing';
    b.setAttribute('aria-pressed', 'true');
    pickBox = root.querySelector('.ws-pickbox');
    ['mouseover', 'focusin'].forEach(function (t) { document.addEventListener(t, pickOver, true); });
    ['click', 'mousedown', 'pointerdown', 'mouseup', 'keydown'].forEach(function (t) { document.addEventListener(t, pickEvent, true); });
    status('Click the part of the page, or Tab to it and press Enter. Press Escape to stop.');
  }
  function stopPick(msg) {
    picking = false;
    ['mouseover', 'focusin'].forEach(function (t) { document.removeEventListener(t, pickOver, true); });
    ['click', 'mousedown', 'pointerdown', 'mouseup', 'keydown'].forEach(function (t) { document.removeEventListener(t, pickEvent, true); });
    if (pickBox) pickBox.hidden = true;
    var b = $('#ws-point');
    b.textContent = 'Point at it on the page';
    b.setAttribute('aria-pressed', 'false');
    if (msg) status(msg);
  }
  function pickOver(e) {
    var el = e.target;
    if (inPanel(el) || el.nodeType !== 1 || /^(HTML|BODY)$/.test(el.tagName)) { pickBox.hidden = true; return; }
    var r = el.getBoundingClientRect();
    pickBox.hidden = false;
    pickBox.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
  }
  function pickEvent(e) {
    if (e.type === 'keydown') {
      if (e.key === 'Escape') { e.preventDefault(); stopPick('Stopped pointing.'); }
      else if (e.key === 'Enter' && !inPanel(document.activeElement) && document.activeElement !== document.body) {
        e.preventDefault(); e.stopPropagation(); setTarget(document.activeElement);
      }
      return;
    }
    if (inPanel(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.type === 'click') setTarget(e.target);
  }
  function setTarget(el) {
    stopPick();
    target = { html: snapshot(el, 3000), label: describe(el) };
    renderTarget();
    status('Pointing at ' + target.label + '.');
    $('#ws-need').focus();
  }
  function renderTarget() {
    var el = $('#ws-target');
    el.innerHTML = target ? 'Pointing at ' + esc(cut(target.label, 60)) + ' <button type="button" class="ws-link" id="ws-untarget" aria-label="Stop pointing at ' + esc(cut(target.label, 60)) + '">×</button>' : '';
  }

  // A shortened copy of the page's markup for the AI: no scripts or styles, long text cut, and
  // runs of the same item (product cards, list rows) cut down to the first few.
  var KEEP = /^(id|class|role|aria-[\w-]+|data-[\w-]+|alt|type|name|href|for|title|tabindex|hidden|disabled|checked|value|placeholder|lang|src|style|min|max)$/;
  function snapshot(el, max) {
    var base0 = el.cloneNode(true);
    if (base0.querySelectorAll) base0.querySelectorAll('script,style,noscript,template,link,meta,iframe,#ws-root,#ws-live').forEach(function (n) { n.remove(); });
    var tries = [[80, 3], [40, 2], [24, 1]], html = '';
    for (var i = 0; i < tries.length; i++) {
      var c = base0.cloneNode(true);
      tidy(c, tries[i][0], tries[i][1]);
      html = c.outerHTML.replace(/>\s+</g, '><');
      if (html.length <= max) return html;
    }
    return html.slice(0, max) + '<!-- cut here -->';
  }
  function tidy(node, textMax, runMax) {
    if (node.nodeType !== 1) return;
    Array.prototype.slice.call(node.attributes).forEach(function (a) {
      if (!KEEP.test(a.name)) node.removeAttribute(a.name);
      else if (a.value.length > 80) node.setAttribute(a.name, a.value.slice(0, 77) + '…');
    });
    if (node.tagName === 'svg' || node.tagName === 'SVG') { node.innerHTML = ''; return; }
    var kids = Array.prototype.slice.call(node.childNodes), prev = '', run = 0;
    kids.forEach(function (k) {
      if (k.nodeType === 8) return k.remove();
      if (k.nodeType === 3) {
        var t = squash(k.data);
        if (!t) return k.remove();
        k.data = t.length > textMax ? t.slice(0, textMax - 1) + '…' : t;
        prev = ''; run = 0;
        return;
      }
      if (k.nodeType !== 1) return k.remove();
      var sig = k.tagName + '.' + (k.getAttribute('class') || '');
      run = sig === prev ? run + 1 : 1;
      prev = sig;
      if (run > runMax) {
        var last = k.previousSibling;
        if (last && last.nodeType === 8) { last.data = ' ' + (parseInt(last.data, 10) + 1) + ' more like this '; }
        else node.insertBefore(document.createComment(' 1 more like this '), k);
        return k.remove();
      }
      tidy(k, textMax, runMax);
    });
  }

  function seg(which, save) {
    ui.build = which;
    if (save) saveUi();
    root.querySelectorAll('[data-seg]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-seg') === which)); });
    $('#ws-b-skill').hidden = which !== 'skill';
    $('#ws-b-fix').hidden = which !== 'fix';
    place();
  }
  function wireBuild() {
    var pane = $('#ws-pane-build');
    var p = $('#ws-person'), need = $('#ws-need');
    p.value = readKey(PERSON_KEY) || (currentProfile ? currentProfile.freeText || '' : '');
    p.oninput = function () { writeKey(PERSON_KEY, p.value.trim() || null); };
    need.value = readKey(NEED_KEY) || (result && result.need) || '';
    need.oninput = function () { writeKey(NEED_KEY, need.value.trim() || null); };
    $('#ws-build').onclick = build;
    $('#ws-askgo').onclick = askProfile;
    $('#ws-ideasgo').onclick = suggest;
    $('#ws-point').onclick = startPick;
    pane.addEventListener('toggle', function (e) {
      if (e.target.id === 'ws-code-box' && e.target.open) $('#ws-code').focus();
    }, true);
    pane.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      var id = t.id, list = fixes(), f, i;
      if (id === 'ws-onoff') {
        if (same(idsOf(result), names)) {
          keep(NOTE_KEY, { text: 'Your fix is off.' });
          if (!applySet([], {})) { keep(NOTE_KEY, null); msg('Your fix is off.'); }
        }
        else if (result.code && result.code !== readKey(MY_KEY)) install(result.code, 'Your fix is on again.', idsOf(result));
        else { applySet(idsOf(result), settingsOf(result.adapters)); msg('Your fix is on again.'); }
      } else if (id === 'ws-save') {
        saveFix(result);
        renderResult();
        renderSaved();
        msg('Saved as “' + result.name + '”. It’s under Saved fixes, where you can share it.');
      } else if (id === 'ws-change') change($('#ws-fb').value.trim(), '');
      else if (id === 'ws-close') { result = null; keep(DRAFT_KEY, null); renderResult(); msg(''); need.focus(); }
      else if (id === 'ws-repair') change('', errors.mine || mineWarn);
      else if (id === 'ws-runmine') {
        var code = $('#ws-code').value;
        if (result) { result.code = code; keep(DRAFT_KEY, result); }
        install(code, 'Saved your code and ran it.', result ? idsOf(result) : names.indexOf('mine') === -1 ? names.concat('mine') : names);
      } else if (id === 'ws-prev') {
        var prev = readKey(PREV_KEY);
        writeKey(PREV_KEY, null);
        if (prev) { result.code = prev; keep(DRAFT_KEY, result); install(prev, 'Back to the last version.', idsOf(result)); }
      } else if (id === 'ws-untarget') { target = null; renderTarget(); need.focus(); }
      else if (t.hasAttribute('data-ready')) useReady(READY[+t.getAttribute('data-ready')]);
      else if (t.hasAttribute('data-idea')) { need.value = t.textContent; writeKey(NEED_KEY, need.value); $('#ws-ideas').open = false; need.focus(); }
      else if (t.hasAttribute('data-eg')) { need.value = EXAMPLE_NEEDS[+t.getAttribute('data-eg')].replace(/[“”]/g, ''); writeKey(NEED_KEY, need.value); need.focus(); }
      else if (t.hasAttribute('data-fon')) {
        f = list[+t.getAttribute('data-fon')];
        result = f;
        keep(DRAFT_KEY, result);
        if (f.code) return install(f.code, 'Turned on ' + f.name + '.', idsOf(f));
        if (!applySet(idsOf(f), settingsOf(f.adapters))) msg('Turned on ' + f.name + '.');
      } else if (t.hasAttribute('data-fshare')) { i = +t.getAttribute('data-fshare'); share(list[i], '#ws-f' + i); }
      else if (t.hasAttribute('data-fdel')) {
        i = +t.getAttribute('data-fdel');
        var gone = list.splice(i, 1)[0];
        keep(SKILLS_KEY, list);
        renderSaved();
        renderResult();
        msg('Deleted ' + gone.name + '.');
      } else if (id === 'ws-in-run') {
        f = incoming.fix;
        saveFix(f);
        result = f;
        keep(DRAFT_KEY, result);
        install(f.code, 'Their fix is on now.', idsOf(f));
      } else if (id === 'ws-in-close') { incoming = null; $('#ws-in').innerHTML = ''; need.focus(); }
    });
    renderTarget();
    renderResult();
    renderSaved();
    renderReady();
    renderIncoming();
    if (note) {
      msg(note.text);
      setTimeout(function () {
        var h = $('#ws-result .ws-h');
        if (!h) return;
        h.setAttribute('tabindex', '-1');
        h.scrollIntoView({ block: 'nearest' });
        h.focus();
      }, 300);
    }
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  if (panelOn) {
    Track.start();
    // Your adapter's own error messages (it logs them as "my adapter: …") show on its card.
    var warn0 = console.warn;
    console.warn = function (first, e) {
      try { if (/^my adapter/i.test(String(first))) { mineWarn = String((e && e.message) || e || first); fixState(); } } catch (x) {}
      return warn0.apply(console, arguments);
    };
  }
  Promise.all([profile, incomingReady]).then(function (r) {
    var prof = r[0];
    currentProfile = prof;
    baseOptions = { profile: prof && !prof.toolkit ? prof : null, today: window.RB ? RB.today() : new Date(), rewrite: rewrite, fallback: storeFallback };
    if (panelOn) panel();
    names.forEach(turnOn);
    // Load the shoppers' adapters in the background, so switching between them doesn't wait on the network.
    if (panelOn) setTimeout(function () {
      var all = [];
      Object.keys(PEOPLE).concat(Object.keys(TOOLKIT_PROFILES)).forEach(function (id) {
        setOf(id).forEach(function (n) { if (all.indexOf(n) === -1 && n !== 'toolkit-fixes' && n !== 'mine') all.push(n); });
      });
      all.forEach(function (n) { ensure(n).catch(function () {}); });
    }, 2500);
  });

  // ── Checks ────────────────────────────────────────────────────────────────
  function runChecks() {
    var res = $('#ws-res');
    res.innerHTML = '<p class="ws-help">Checking…</p>';
    var mods = ['missing-alt', 'missing-labels', 'missing-captions', 'missing-landmarks', 'poor-contrast', 'wcag-issues'];
    Promise.all([loadScript(AXE, 'axe')].concat(mods.map(function (m) { return import(TOOLKIT + 'auditors/' + m + '.js'); }))).then(function (r) {
      var A = r[1], L = r[2], C = r[3], M = r[4], P = r[5], W = r[6];
      var groups = [
        ['Photos with no description', A.findImagesWithoutAlt().concat(A.findEmptyAltImages())],
        ['Photos with a useless description, like “image”', A.findBadAltImages()],
        ['Icons a screen reader can’t name', A.findSvgWithoutAlt()],
        ['Links with no name', L.findEmptyLinks()],
        ['Links that only say “click here” or “more”', L.findAmbiguousLinks()],
        ['Buttons with no name', L.findEmptyButtons()],
        ['Fields with no label', L.findUnlabeledInputs()],
        ['Videos with no captions', C.findVideosWithoutCaptions()],
        ['Text with too little contrast', P.findLowContrastText().map(function (x) { return x.element; })],
        ['Links that look like plain text', P.findIndistinguishableLinks()],
      ];
      var lm = M.auditLandmarks(), missing = [];
      if (!lm.hasMain) missing.push('main area');
      if (!lm.hasBanner) missing.push('page header');
      if (!lm.hasContentinfo) missing.push('page footer');
      if (!lm.hasNavigation) missing.push('navigation');
      return W.runAxeAnalysis().then(function (violations) {
        found = [];
        var html = '<h3 class="ws-h">The toolkit’s auditors</h3>';
        groups.forEach(function (g) {
          var els = g[1].filter(function (el) { return el && !inPanel(el); });
          html += auditRow(g[0], els.map(function (el) { return [el, describe(el)]; }));
        });
        html += '<p class="ws-res-line">Landmarks the page is missing: <b>' + (missing.length ? esc(missing.join(', ')) : 'none') + '</b></p>';
        var groupsAxe = W.groupViolationsByCategory(violations), total = 0;
        var axeHtml = '';
        Object.keys(groupsAxe).forEach(function (cat) {
          groupsAxe[cat].forEach(function (v) {
            var els = v.nodes.map(function (n) { return W.getElementFromNode(n); }).filter(function (el) { return el && !inPanel(el); });
            if (!els.length) return;
            total += els.length;
            axeHtml += auditRow(v.help, els.map(function (el) { return [el, describe(el)]; }));
          });
        });
        html += '<h3 class="ws-h">axe-core · ' + total + ' problems</h3>';
        if (ToolkitFixes.before != null) html += '<p class="ws-help">Before toolkit-fixes ran, axe found ' + ToolkitFixes.before + ' problems on this page.</p>';
        html += axeHtml || '<p class="ws-help">axe found nothing.</p>';
        res.innerHTML = html;
        status('Audit done: ' + total + ' problem' + (total === 1 ? '' : 's') + '.');
      });
    }).catch(function (e) { res.innerHTML = '<p class="ws-err">The checks didn’t load: ' + esc(e.message || e) + '</p>'; });
  }
  function auditRow(title, items) {
    var was = lastCounts[title];
    lastCounts[title] = items.length;
    var head = esc(title) + ' <b>' + items.length + '</b>' + (was != null && was !== items.length ? ' <span class="ws-was">was ' + was + '</span>' : '');
    if (!items.length) return '<p class="ws-res-line ws-zero">' + head + '</p>';
    return '<details class="ws-res-line"><summary>' + head + '</summary><ul class="ws-list">' + items.slice(0, 30).map(function (it) {
      found.push(it[0]);
      return '<li><button type="button" class="ws-chg" data-found="' + (found.length - 1) + '"><span class="ws-what">' + esc(it[1]) + '</span></button></li>';
    }).join('') + '</ul>' + (items.length > 30 ? '<p class="ws-help">and ' + (items.length - 30) + ' more</p>' : '') + '</details>';
  }

  // GitHub's light look (Primer colors): white, grey borders, blue links and focus.
  var CSS =
    '.ws-panel{position:fixed;left:12px;bottom:12px;z-index:2147483000;width:360px;max-width:calc(100vw - 24px);max-height:min(62vh,600px);' +
      'display:flex;flex-direction:column;background:#fff;color:#1f2328;border:1px solid #d1d9e0;border-radius:6px;' +
      'box-shadow:0 8px 24px rgba(140,149,159,.2);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;' +
      'text-align:left;letter-spacing:normal;word-spacing:normal}' +
    '.ws-panel[data-side=right]{left:auto;right:12px}.ws-panel.ws-wide{width:600px}' +
    '.ws-panel[data-dock]{top:0;bottom:0;left:0;width:360px;max-width:none;max-height:none;border-radius:0;border-width:0 1px 0 0;box-shadow:none}' +
    '.ws-panel[data-dock=side][data-side=right]{left:auto;right:0;border-width:0 0 0 1px}' +
    '.ws-panel[data-dock=bottom]{top:auto;left:0;right:0;width:auto;height:45vh;border-width:1px 0 0 0}' +
    '.ws-panel[data-dock=bottom] #ws-side,.ws-panel[data-dock=bottom] #ws-reset{display:none}' +
    '*{box-sizing:border-box}[hidden]{display:none!important}' +
    'p,h3,ul,ol{margin:0;padding:0}' +
    'button,select,input,textarea{font:inherit;color:inherit;letter-spacing:normal}' +
    ':focus-visible{outline:2px solid #0969da;outline-offset:-2px;border-radius:6px}' +
    'a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}' +
    '.ws-top{display:flex;align-items:center;gap:4px;padding:4px;border-bottom:1px solid #d1d9e0}.ws-closed .ws-top{border-bottom:0}' +
    '.ws-head{flex:1;min-width:0;margin:0;padding:4px 8px;font-size:14px;overflow:hidden}' +
    '.ws-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ws-title .ws-sub{font-weight:400}' +
    '.ws-sub{color:#59636e;font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    '.ws-icon{all:unset;cursor:pointer;padding:2px 8px;border-radius:6px;color:#59636e;line-height:20px}.ws-icon:hover{background:#f6f8fa;color:#1f2328}' +
    '.ws-bar{padding:6px 12px;border-bottom:1px solid #d1d9e0;font-size:13px}' +

    '.ws-edge{position:absolute;top:0;bottom:0;right:-4px;width:8px;cursor:col-resize;display:none;touch-action:none;z-index:1}' +
    '.ws-edge:hover,.ws-edge:focus-visible{background:rgba(9,105,218,.35);outline:none}' +
    '.ws-panel[data-dock=side] .ws-edge{display:block}.ws-panel[data-dock=side][data-side=right] .ws-edge{right:auto;left:-4px}' +
    '.ws-select{display:block;width:100%;margin-top:4px;padding:5px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328}' +
    '.ws-onlist{margin-top:4px!important}.ws-onlist > li{padding:6px 0;border-top:1px solid #eff2f5}.ws-indent{margin-left:26px}' +
    '.ws-persona{margin:10px 0 0;padding:10px 12px;background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px}' +
    '.ws-persona[tabindex]:focus{outline:none}.ws-persona figcaption{font-weight:600}.ws-persona blockquote{margin:4px 0 0;color:#59636e;font-size:13px}' +
    '.ws-pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px!important}' +
    '.ws-pills{list-style:none;padding:0}.ws-pill{padding:0 8px;border-radius:2em;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328;font-size:12px;line-height:20px}' +
    '.ws-chgs > summary{cursor:pointer;color:#0969da;font-size:12px}.ws-chgs[open] > summary{margin-bottom:4px}' +
    '.ws-tick{color:#59636e;font-size:12px;font-variant-numeric:tabular-nums}' +
    '.ws-for{color:#1f2328}.ws-ad .ws-for + .ws-help{margin-top:0}' +
    '.ws-steps{list-style:none;padding:0!important;margin:0;counter-reset:step}.ws-steps > li{margin-bottom:16px;counter-increment:step}' +
    '.ws-steps > li > .ws-lab:first-child::before{content:counter(step) ". "}' +
    '.ws-steps .ws-lab{margin-top:0!important}.ws-steps .ws-help{margin-top:4px}' +
    '.ws-pane > :first-child{margin-top:0!important}' +
    '.ws-toggle{display:flex;align-items:center;gap:8px;cursor:pointer}' +
    '.ws-toggle input{appearance:none;-webkit-appearance:none;flex:none;position:relative;width:30px;height:18px;margin:0;border-radius:9px;background:#d1d9e0;cursor:pointer;transition:background .15s}' +
    '.ws-toggle input::before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(31,35,40,.3);transition:left .15s}' +
    '.ws-toggle input:checked{background:#1f883d}.ws-toggle input:checked::before{left:14px}' +
    '.ws-toggle input:focus-visible{outline:2px solid #0969da;outline-offset:2px}' +
    '.ws-steps details .ws-lab{margin-top:8px!important}.ws-ready{margin-top:16px!important}' +
    '.ws-idea{display:block;text-align:left;font-size:13px;padding:4px 0}#ws-idealist li + li{border-top:1px solid #eff2f5}' +
    '.ws-card{position:relative}.ws-close{position:absolute;top:4px;right:4px;font-size:16px}.ws-card .ws-h{padding-right:28px}' +
    '.ws-compact li{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;padding:2px 0}.ws-compact .ws-chg-slot{flex:1 1 auto}' +
    '.ws-h + .ws-plain{margin-top:4px!important}.ws-card .ws-h{margin-top:0!important}' +
    '.ws-main{display:flex;flex-direction:column;min-height:0}' +
    '.ws-tabs{display:flex;flex-wrap:wrap;column-gap:8px;padding:0 12px;border-bottom:1px solid #d1d9e0}' +
    '.ws-tab{all:unset;cursor:pointer;white-space:nowrap;padding:8px 2px;color:#59636e;border-bottom:2px solid transparent;margin-bottom:-1px}' +
    '.ws-tab:hover{color:#1f2328}.ws-tab[aria-selected=true]{color:#1f2328;font-weight:600;border-bottom-color:#fd8c73}' +
    '.ws-scroll{overflow:auto;padding:12px 16px 4px;min-height:0;flex:1}' +
    '.ws-pane > * + *{margin-top:8px}' +
    '.ws-field{display:flex;align-items:center;gap:8px}.ws-field > span{min-width:7.5em;color:#1f2328}' +
    'select{flex:1;min-width:0;padding:4px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328}' +
    '.ws-help,.ws-note{color:#59636e;font-size:12px}.ws-note{color:#9a6700}' +
    '.ws-err{color:#d1242f;font-size:12px}' +
    '.ws-line{display:flex;align-items:baseline;justify-content:space-between;gap:8px}' +
    '.ws-h{font-size:14px;font-weight:600;margin-top:16px!important}.ws-pane > .ws-h:first-child,.ws-pane > #ws-in:empty + .ws-h{margin-top:0!important}' +
    '.ws-link{all:unset;cursor:pointer;color:#0969da;font-size:12px;display:inline-flex;align-items:center;min-height:24px;padding:0 2px}.ws-link:hover{text-decoration:underline}' +
    '.ws-skip{position:absolute;left:8px;top:8px;z-index:2;padding:6px 10px;background:#fff;border:2px solid #0969da;border-radius:6px;color:#0969da}' +
    '.ws-skip:not(:focus){width:1px;height:1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    'summary{min-height:24px;display:list-item}.ws-chgs > summary,.ws-more summary{padding:2px 0}' +
    '.ws-check{min-height:24px}.ws-icon{min-width:28px;min-height:28px;display:inline-flex;align-items:center;justify-content:center}' +
    '.ws-group{border:1px solid #d1d9e0;border-radius:6px;padding:0}.ws-group + .ws-group{margin-top:8px}' +
    '#ws-pane-audit .ws-group{margin-top:16px!important}.ws-group > .ws-help,.ws-group > .ws-heard{margin:8px 12px!important}' +
    '.ws-group > summary{cursor:pointer;font-weight:600;padding:6px 12px;background:#f6f8fa;border-radius:6px}' +
    '.ws-group[open] > summary{border-bottom:1px solid #d1d9e0;border-radius:6px 6px 0 0}' +
    '.ws-gc{display:inline-block;padding:0 6px;margin-left:4px;border-radius:2em;background:rgba(129,139,152,.12);font-weight:500;font-size:12px}.ws-gc:empty{display:none}' +
    '.ws-gwho{padding:6px 12px 0}' +
    '.ws-ad{padding:6px 12px}.ws-ad + .ws-ad{border-top:1px solid #eff2f5}.ws-ad .ws-help{margin-left:24px}.ws-ad .ws-state{margin-left:24px}.ws-flat .ws-help{margin-left:0}' +
    '.ws-check{display:flex;gap:8px;align-items:center;cursor:pointer}.ws-check input{width:18px;height:18px;margin:0;accent-color:#0969da}' +
    '.ws-name{font-weight:600}p.ws-name{margin-left:0}' +
    '.ws-tag{display:inline-block;padding:0 7px;border-radius:2em;border:1px solid #d1d9e0;color:#59636e;font-size:12px;font-weight:500;line-height:18px}' +
    '.ws-btn{padding:3px 12px;border-radius:6px;border:1px solid rgba(31,35,40,.15);background:#1f883d;color:#fff;font-weight:500;cursor:pointer}' +
    '.ws-btn:hover{background:#1a7f37}.ws-btn.ws-quiet{background:#f6f8fa;color:#1f2328;border-color:#d1d9e0}.ws-btn.ws-quiet:hover{background:#eff2f5}' +
    '.ws-btn:disabled{opacity:.6;cursor:default}' +
    '.ws-seg{display:flex;margin-top:12px!important;border:1px solid #d1d9e0;border-radius:6px;overflow:hidden}' +
    '.ws-seg button{all:unset;flex:1;text-align:center;padding:5px 8px;cursor:pointer;color:#59636e}.ws-seg button + button{border-left:1px solid #d1d9e0}' +
    '.ws-seg button:hover{background:#f6f8fa;color:#1f2328}.ws-seg button[aria-pressed=true]{background:#f6f8fa;color:#1f2328;font-weight:600;box-shadow:inset 0 -2px 0 #fd8c73}' +
    '#ws-b-skill > .ws-help:first-child,#ws-b-fix > .ws-help:first-child{margin-top:8px}' +
    '.ws-lab{display:block;font-weight:600;margin-top:12px!important}.ws-lab + .ws-input{margin-top:4px}' +
    '.ws-input{display:block;width:100%;padding:5px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328;resize:vertical}' +
    '.ws-input:focus{background:#fff}' +
    '.ws-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:8px!important}' +
    '.ws-msg{color:#59636e;font-size:12px;margin-top:6px!important}.ws-msg:empty{display:none}' +
    '.ws-card{margin-top:10px!important;padding:8px 12px 10px;border:1px solid #d1d9e0;border-radius:6px}.ws-card > .ws-lab:first-child{margin-top:0!important}' +
    '.ws-incard{border-color:#0969da;margin:0 0 4px!important}' +
    '.ws-plain{list-style:none;margin-top:4px!important}.ws-plain li{padding:3px 0}.ws-block{display:block}' +
    '.ws-more{margin-top:8px!important}.ws-more summary{cursor:pointer;color:#0969da;font-size:12px}' +
    '.ws-pre{max-height:240px;overflow:auto;margin:6px 0 0;padding:8px;background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}' +
    '.ws-sks{list-style:none}.ws-sk{padding:8px 0;border-bottom:1px solid #eff2f5}.ws-sk .ws-row{margin-top:2px!important}' +
    '.ws-codearea{display:block;width:100%;height:320px;margin:6px 0 0;padding:8px;border-radius:6px;border:1px solid #d1d9e0;' +
      'font:12px/1.45 ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;color:#1f2328;background:#f6f8fa;resize:vertical}' +
    '.ws-linkbox{font-size:12px}' +
    '.ws-pickbox{position:fixed;pointer-events:none;z-index:2147483001;border:2px solid #bf3989;background:rgba(191,57,137,.08);border-radius:3px}' +
    '.ws-list{list-style:none;margin-top:4px!important}.ws-list li{margin:2px 0}' +
    '.ws-chg{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;padding:6px 8px 6px 34px;position:relative;border:1px solid #d1d9e0;border-radius:6px;background:#fff}' +
    '.ws-chg:hover{background:#f6f8fa}' +
    '.ws-res-line .ws-chg{padding-left:8px}' +
    '.ws-num{position:absolute;left:8px;top:6px;font-size:12px;font-weight:600;color:#0969da}' +
    '.ws-css .ws-num{position:static;margin-right:6px}' +
    '.ws-what{display:block}.ws-diff{display:block;color:#59636e;font-size:12px;word-break:break-word}' +
    '.ws-why{display:block;color:#1a7f37;font-size:12px}' +
    '.ws-css{padding:6px 8px;border:1px solid #d1d9e0;border-radius:6px}.ws-css summary{cursor:pointer}' +
    '.ws-css pre{max-height:200px;overflow:auto;margin:6px 0 0;padding:8px;background:#f6f8fa;border-radius:6px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}' +
    '.ws-heard{list-style:none;font-size:13px}.ws-heard li{padding:4px 0;border-bottom:1px solid #eff2f5}' +
    '.ws-t{color:#59636e;font-variant-numeric:tabular-nums}.ws-who{color:#59636e;font-size:12px}' +
    '.ws-res-line{font-size:13px}.ws-res-line summary{cursor:pointer}.ws-zero{color:#59636e}' +
    '.ws-was{color:#1a7f37;font-size:12px}' +
    '.ws-status{padding:4px 16px 0;color:#59636e;font-size:12px}.ws-status:empty{display:none}' +
    '.ws-foot{padding:4px 16px;font-size:12px;color:#59636e;border-top:1px solid #d1d9e0}.ws-foot a{display:inline-flex;align-items:center;min-height:28px}' +
    '.ws-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.ws-marks{position:fixed;inset:0;pointer-events:none;z-index:2147482000}' +
    '.ws-mark{position:fixed;border:2px solid #0969da;border-radius:3px}' +
    '.ws-mark span{position:absolute;left:-2px;top:-18px;padding:0 5px;background:#0969da;color:#fff;font:600 11px/16px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border-radius:3px 3px 3px 0}' +
    '.ws-mark.ws-flash{border:3px solid #bf3989;box-shadow:0 0 0 3px rgba(191,57,137,.25)}.ws-mark.ws-flash span{background:#bf3989}' +
    '@media (max-width:640px){.ws-panel{width:auto;right:12px}.ws-panel.ws-wide{width:auto}.ws-field{flex-wrap:wrap}}';
})();
