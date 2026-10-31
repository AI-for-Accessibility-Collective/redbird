// Runs adapters on the store without installing the extension, and shows a panel for trying them.
//
//   ?try=swatch-names                  a workshop example from workshop/adapters/
//   ?try=motion-reducer                an adapter from the AI for Accessibility Toolkit itself
//   ?try=toolkit-fixes                 the toolkit's automatic fixes (alt text, labels, contrast, ...)
//   ?try=swatch-names,motion-reducer   several at once
//   ?profile=sam                       a workshop person (sam, mark, dario or bill), from workshop/profiles/
//   ?try=mine                          your own adapter, typed into the panel (saved in this browser)
//   ?try=local                         adapter.js from a starter folder, when its server (tools/dev.mjs) serves the store
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
  // The extension in extension/ also puts this panel on other sites, which have none of the store's
  // planted problems.
  var onStore = location.origin === new URL(base).origin;
  var SITES = onStore ? 'shopping websites' : 'websites'; // what the questions in the panel ask about
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
  // A starter folder's server (tools/dev.mjs) serves the store on this computer and sets RB_LOCAL.
  // "local" is then the adapter.js in that folder, and the page reloads when the file is saved.
  var LOCAL = window.RB_LOCAL || null;
  if (!LOCAL) names = names.filter(function (n) { return n !== 'local'; }); // there is no folder to run
  // A toolkit to connect to: an AI for Accessibility toolkit's address and the person's token.
  // It comes from the developer console's Open Redbird link (after the #, which never reaches a
  // server), from a starter folder started with TOOLKIT_URL and TOOLKIT_TOKEN, or from the form in
  // the Profiles tab. Connected, this tab shows up in the console as Redbird demo, and the person's
  // toolkit profile is one of the profiles to shop as. workshop/toolkit.js does the connecting.
  var TK_KEY = 'redbird:toolkit';
  var toolkitConfig = (function () {
    var m = location.hash.match(/^#ai4a11y=([\w-]+)$/);
    if (m) {
      try {
        var c = JSON.parse(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (c && /^https?:\/\//.test(c.url) && /^aat_[\w-]+$/.test(c.token) && isTop) localStorage.setItem(TK_KEY, JSON.stringify({ url: c.url, token: c.token }));
      } catch (e) { /* a broken link connects nothing */ }
      history.replaceState(history.state, '', location.pathname + location.search);
    }
    if (LOCAL && LOCAL.toolkit && LOCAL.toolkit.url && LOCAL.toolkit.token) return LOCAL.toolkit;
    try { var saved = JSON.parse(localStorage.getItem(TK_KEY) || 'null'); return saved && saved.url && saved.token ? saved : null; } catch (e) { return null; }
  })();
  // ?rbtest=1: the folder's tests (tools/test.mjs) are driving this page, through RB_TEST below.
  var testing = qs.has('rbtest');
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
    local: { help: 'adapter.js from your folder. It runs again each time the file is saved.' },
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
    ['Workshop examples', '', FEATURED.concat(LOCAL ? ['local', 'mine'] : 'mine')],
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
  // The adapters each of the developer console's built-in presets (Profile 1–9, ids wai-1…wai-9,
  // adapted from W3C WAI's Stories of Web Users) turns on here: a few that work well together on
  // this store. Shopping as your toolkit profile uses the selected preset's set.
  var PRESET_ADAPTERS = {
    'wai-1': ['big-targets', 'focus-locator', 'skip-links', 'stop-auto-advance', 'confirm-actions'], // limited arm mobility
    'wai-2': ['stop-auto-advance', 'reduce-brightness', 'calm-urgency', 'mute-sounds'], // autism
    'wai-3': ['toolkit-fixes', 'live-region-announcer', 'skip-links', 'swatch-names', 'describe-on-demand'], // blindness
    'wai-4': ['toolkit-fixes', 'focus-locator'], // color blindness
    'wai-5': ['reading-level', 'abbreviation-expand', 'real-arrival-dates', 'calm-urgency', 'focus-mode', 'stop-auto-advance'], // Down syndrome
    'wai-6': ['auto-transcriber', 'sound-visualizer'], // deafness
    'wai-7': ['visual-assist', 'toolkit-fixes', 'unpin-sticky', 'real-arrival-dates', 'auto-transcriber', 'sound-visualizer'], // deafblindness (magnified text)
    'wai-8': ['focus-mode', 'stop-auto-advance', 'calm-urgency', 'reading-level', 'visual-assist'], // ADHD and dyslexia
    'wai-9': ['visual-assist', 'toolkit-fixes', 'unpin-sticky', 'real-arrival-dates', 'big-targets', 'confirm-actions'], // low vision, tremor, memory support
  };
  // My profile: the one people make for themselves in the Profiles tab. The shoppers are
  // made-up people, and this one is what the toolkit is for: a profile the
  // person keeps using. It stays in this browser, and saves as a file the toolkit's browser
  // extension can import (the toolkit's "aa-profile-blob" format).
  var ME_KEY = 'redbird:me';
  function myProfile() { try { var m = JSON.parse(localStorage.getItem(ME_KEY) || 'null'); return m && m.freeText ? m : null; } catch (e) { return null; } }
  function isPerson(id) { return id === 'me' || (id === 'toolkit' && !!toolkitConfig) || !!PEOPLE[id]; }
  function setOf(id) {
    // The selected preset's adapters; a profile saved by hand has none, and the developer turns them on.
    if (id === 'toolkit') return (toolkitSelected && PRESET_ADAPTERS[toolkitSelected.id] || []).slice();
    if (id === 'me') { var m = myProfile(); return m && m.adapters ? m.adapters.filter(function (n) { return ADAPTERS[n]; }) : []; }
    return PEOPLE[id] ? PEOPLE[id][1] : [];
  }
  // Fixes the person added to their own profile come on with it: a skill's adapters, and the code of
  // one adapter they built (only one runs as "your adapter" at a time).
  function myFixes() { var m = myProfile(); return (m && m.fixes) || []; }
  function withMyFixes(ids) {
    myFixes().forEach(function (f) { (f.adapters || []).forEach(function (a) { if (a.id !== 'mine' && ADAPTERS[a.id] && ids.indexOf(a.id) === -1) ids.push(a.id); }); });
    var coded = myFixes().filter(function (f) { return f.code; })[0];
    if (coded && ids.indexOf('mine') === -1) ids.push('mine');
    return { ids: ids, code: coded ? coded.code : null };
  }
  // The preset the toolkit says is selected (its developer console loaded it), once the toolkit has said.
  var toolkitSelected = null;
  // The presets in the person's toolkit (the developer console's profile library), for the dropdown.
  var toolkitPresets = [];
  function toolkitName() { return 'Your toolkit profile' + (toolkitSelected ? ': ' + toolkitSelected.name + (toolkitSelected.edited ? ' (edited)' : '') : ''); }
  function nameOf(id) { return id === 'me' ? 'My profile' : id === 'toolkit' ? toolkitName() : PEOPLE[id] ? PEOPLE[id][0] : id; }
  // A workshop shopper's profile is a file next to this one.
  function loadProfile(id) {
    if (id === 'me') return Promise.resolve(myProfile());
    // The profile in the person's toolkit, the one the developer console edits.
    if (id === 'toolkit') {
      return import(base + 'toolkit.js').then(function (m) { return m.readProfile(toolkitConfig); }).then(function (p) {
        return Object.assign({}, p, { name: toolkitName(), freeText: p.freeText || 'The profile loaded in your developer console. It has no description yet.' });
      }).catch(function (e) { console.warn('[workshop] toolkit profile:', e); return null; });
    }
    return fetch(base + 'profiles/' + id + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  // My profile is the default: the person's own profile comes first, the made-up shoppers after.
  if (!isPerson(profileName)) profileName = 'me';
  // In a starter folder the store runs at another address, without the person's profile, so it
  // comes from the folder's fix.json.
  var profile = (LOCAL && LOCAL.fix && profileName === 'me' ? localFetch(LOCAL.fix, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (f) {
    if (f && f.profile && f.profile.freeText) localStorage.setItem(ME_KEY, JSON.stringify(Object.assign({ name: 'My profile', adapters: [] }, f.profile)));
  }).catch(function () {}) : Promise.resolve()).then(function () { return loadProfile(profileName); });

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
    who: null, list: [], keys: {}, owned: new WeakMap(), heard: [], obs: null, undoing: false,
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
      if (r.type === 'characterData') { this.text(who, el, r.oldValue, [t], true); return; }
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
    // inPlace: the words of an existing text node changed, rather than nodes being swapped.
    text: function (who, el, before, nodes, inPlace) {
      var e = this.add(who, 'text', el, '', null);
      if (!e) return null;
      e.parts = e.parts || [];
      var seen = e.parts.some(function (p) { return p.nodes.some(function (n) { return nodes.indexOf(n) !== -1; }); });
      if (!seen) e.parts.push({ before: before || '', nodes: nodes, inPlace: !!inPlace });
      if (!this.undoing) e.wrote = squash(el.textContent); // what the element says after this adapter's change
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
  // How many requests to the store's AI are on their way, from any adapter, including ones that call
  // /api/ai themselves. The checks on each version, and the tests, wait for these to come back, since
  // an adapter that rewrites text with AI keeps changing the page after enable() returns.
  var aiBusy = 0, aiQuietSince = Date.now();
  if (window.fetch) {
    var fetch0 = window.fetch;
    window.fetch = function (input) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (!/\/api\/ai(\?|$)/.test(url)) return fetch0.apply(this, arguments);
      aiBusy++;
      return fetch0.apply(this, arguments).finally(function () { aiBusy--; aiQuietSince = Date.now(); });
    };
  }
  // Resolves once no AI request has been on its way for half a second, or after `max` ms.
  function aiSettled(max) {
    var until = Date.now() + (max || 20000);
    return new Promise(function (done) {
      (function check() {
        if ((!aiBusy && Date.now() - aiQuietSince > 500) || Date.now() > until) return done();
        setTimeout(check, 200);
      })();
    });
  }
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
  // With no text, the model answers by asking for some, and that would land on the page.
  var rewrite = traced(function (text, instructions) { return String(text || '').trim() ? ai('rewrite', { text: text, instructions: instructions }) : Promise.resolve(null); });
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
    if (!mine && Track.who) live.__wsSpeaker = Track.who;
    live.waiting = (live.waiting || []).concat(text);
    clearTimeout(live.timer);
    live.timer = setTimeout(function () {
      var words = live.waiting.join('. ');
      live.waiting = [];
      if (live.panel) live.__wsWho = 'panel';
      else live.__wsWho = live.__wsSpeaker || (live.__wsWho === 'panel' ? null : live.__wsWho);
      live.__wsSpeaker = null;
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
    PREV_KEY = 'redbird:my-adapter-prev', SETTINGS_KEY = 'redbird:settings', NOTE_KEY = 'redbird:build-note',
    FB_KEY = 'redbird:next-change', FOLDER_NOTE_KEY = 'redbird:folder-note';
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
    // The toolkit's version looks through everything inside each element, then does that again for
    // each of those elements. The work doubles with each level of the page, so a deep one, like
    // Amazon or GitHub, freezes the tab. This looks at each element once.
    'dismiss-overlays': function (m) {
      var a = m.DismissOverlays;
      function hide(el) {
        if (!el || el.nodeType !== 1 || a.hidden.has(el) || el.classList.contains(a.hiddenClass) || !a.isOverlay(el)) return false;
        el.classList.add(a.hiddenClass);
        a.hidden.add(el);
        return true;
      }
      a.sweep = function (top) {
        var n = 0;
        try { top.querySelectorAll('div, section, aside, dialog, [role="dialog"], [aria-modal="true"]').forEach(function (el) { if (hide(el)) n++; }); } catch (e) {}
        return n;
      };
      a.consider = function (el) { return hide(el) || !!(el && el.querySelector && a.sweep(el)); };
      return a;
    },
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
    if (name === 'local') {
      if (!LOCAL) return Promise.reject(new Error('your folder’s server isn’t running. Start it with npm run dev'));
      return localFetch(LOCAL.adapter + '?at=' + Date.now(), { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('your folder has no adapter.js');
        return r.text();
      }).then(function (code) { localCode = code; return import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))); });
    }
    if (EXAMPLES.indexOf(name) !== -1) return import(base + 'adapters/' + name + '.js');
    var lib = NEEDS[name];
    var url = TOOLKIT + 'adapters/' + name + '.js';
    // One retry, in case the CDN drops the connection (the query makes the browser fetch it again).
    return Promise.all([toolkit(), lib ? loadScript(lib[1], lib[0]) : null])
      .then(function () { return import(url).catch(function () { return import(url + '?retry=1'); }); });
  }
  var loading = {}, adapters = {}, errors = {}, enabling = {}, localCode = null;
  // Bionic reading resets its text with all: unset, and Chrome writes that out with a background in
  // it. Dark mode takes that for a colored box to flip back, which leaves the bold letters dark on dark.
  function keepBionicVisible() {
    if (document.getElementById('ws-bionic')) return;
    var s = document.head.appendChild(document.createElement('style'));
    s.id = 'ws-bionic';
    s.textContent = '.ai4a11y-bionic,.ai4a11y-bionic *{--ai4a11y-media-dark:initial!important;--ai4a11y-media-dim:initial!important}';
  }
  function ensure(name) {
    if (name === 'bionic-reading') keepBionicVisible();
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
      try { enabling[name] = Promise.resolve(a.enable(optionsFor(name))).catch(fail); } catch (e) { fail(e); }
      refresh(name);
    }, function (e) {
      errors[name] = 'Didn’t load: ' + (e.message || String(e));
      warn(name)(e);
      refresh(name);
    });
  }
  function turnOff(name) {
    // The fixes and your own adapter change the page in ways a reload undoes best.
    if (name === 'toolkit-fixes' || name === 'mine' || name === 'local') { location.reload(); return; }
    var a = adapters[name];
    try { if (a && a.disable) a.disable(); } catch (e) { warn(name)(e); }
    refresh(name);
  }
  function saveNames() {
    var v = names.length ? names.join(',') : 'none';
    try {
      localStorage.setItem('redbird:try', v);
      // The extension turns the folder's adapter on at each page, unless it was turned off here.
      if (LOCAL && LOCAL.bridge && names.indexOf('local') === -1) localStorage.setItem('redbird:folder-off', '1');
      else if (LOCAL && LOCAL.bridge) localStorage.removeItem('redbird:folder-off');
    } catch (e) {}
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
    var done = on ? turnOn(name) : turnOff(name);
    if (name === 'local') listen();
    renderSaved();
    renderResult();
    renderOnList();
    fixAllButton();
    return done;
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
  function label(name) { return name === 'mine' ? 'your adapter' : name === 'local' ? 'your folder' : name === 'toolkit-fixes' ? 'fix-this-page' : name; }

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
    if (!onStore) fitFixed();
    var edge = $('.ws-edge');
    if (edge) { edge.setAttribute('aria-valuenow', String(w)); edge.setAttribute('aria-valuemin', '280'); edge.setAttribute('aria-valuemax', '720'); }
    place();
    if (marks.outline || marks.flash) queueMarks();
  }
  // Banners fixed to the window don't move over with the page, and neither does a whole page laid
  // out as one box placed on the window, like YouTube's. Keeps them, and buttons like Accept on a
  // cookie notice, in the room beside the panel.
  function fitFixed() {
    if (innerWidth < 700) return;
    var w = dockWidth(), left = ui.side === 'left' ? w : 0, room = innerWidth - w;
    var onWindow = getComputedStyle(document.body).position === 'static';
    document.querySelectorAll('body > *, body > * > *, body > * > * > *').forEach(function (el) {
      if (el === host) return;
      var pos = getComputedStyle(el).position;
      if (pos !== 'fixed' && pos !== 'absolute') return;
      var r = el.getBoundingClientRect();
      // Off the screen on purpose, like a skip link waiting for keyboard focus.
      if (r.width < 200 || r.right <= 0 || r.left >= innerWidth) return;
      if (r.left >= left - 1 && r.right <= left + room + 1) return;
      if (pos === 'absolute') {
        if (!onWindow || r.width < innerWidth * 0.6 || (el.offsetParent && el.offsetParent !== document.body)) return;
        el.style.setProperty('width', room + 'px', 'important');
      }
      el.style.setProperty('left', left + 'px', 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('max-width', room + 'px', 'important');
      el.style.setProperty('transform', 'none', 'important');
    });
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
    // Keys pressed in the panel are for the panel. On a real site they'd otherwise reach the site's
    // shortcuts: on YouTube, typing an m mutes the video, and on GitHub an s jumps to the search box.
    ['keydown', 'keypress', 'keyup'].forEach(function (type) {
      host.addEventListener(type, function (e) { if (!(e.altKey && e.shiftKey)) e.stopPropagation(); });
    });
    root.innerHTML = '<style>' + CSS + '</style>' +
      '<aside class="ws-panel" aria-label="AI4A11y Toolkit" data-side="' + ui.side + '">' +
        '<a class="ws-skip" href="#" id="ws-skip">Skip to the ' + (onStore ? 'store' : 'page') + '</a>' +
        '<div class="ws-top">' +
          '<h2 class="ws-head"><span class="ws-title">AI4A11y Toolkit <span class="ws-sub">(Workshop Demo)</span></span></h2>' +
        '<button type="button" class="ws-icon" id="ws-reset" aria-label="Reset the panel’s width and side" title="Reset width and side">↺</button>' +
        '<button type="button" class="ws-icon" id="ws-side"></button></div>' +
        (onStore ? '<div class="ws-bar"><label class="ws-toggle" title="Marks each problem on the page with a red number, which turns green when an adapter fixes it.">' +
          '<input type="checkbox" role="switch" class="ws-spot"' + (spotOn() ? ' checked' : '') + '> <span>Show accessibility problems on the page</span></label></div>' : '') +
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
    if (!onStore) {
      // Some sites are wider than the room beside the panel, and Chrome opens them scrolled all the
      // way right, with their left side under the panel. They start at the left, and stay scrollable.
      var moved = false;
      ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { passive: true, once: true }); });
      [0, 1000, 3000, 6000, 12000].forEach(function (ms) {
        setTimeout(function () { dock(); if (!moved && scrollX) scrollTo(0, scrollY); }, ms); // banners come in late
      });
    }
    wire();
    root.addEventListener('click', toolkitClick);
    showTab(ui.tab, false);
    sideButton();
    dock();
    fillProfiles();
    toolkitCard();
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
    var people = '<optgroup label="Workshop shoppers">' + Object.keys(PEOPLE).map(function (id) { return '<option value="' + id + '">' + PEOPLE[id][0] + '</option>'; }).join('') + '</optgroup>';
    return '<label class="ws-lab" for="ws-prof">Shop as</label>' +
      '<select id="ws-prof" class="ws-select"><option value="me">My profile</option>' + (toolkitConfig ? '<option value="toolkit">' + esc(toolkitName()) + '</option>' : '') + people + '</select>' +
      '<div id="ws-persona"></div>' +
      '<div class="ws-line"><h3 class="ws-h">Adapters on</h3><button type="button" class="ws-link" id="ws-alloff">Turn all off</button></div>' +
      '<ul class="ws-pills" id="ws-pills" aria-label="Adapters on"></ul>' +
      '<p class="ws-help" id="ws-learned"></p>' +
      '<h3 class="ws-h">What they do on this page</h3>' +
      '<ul class="ws-plain ws-onlist" id="ws-on-list"></ul>' +
      '<div class="ws-card" id="ws-toolkit"></div>';
  }
  function renderOnList() {
    var el = rendered && $('#ws-on-list');
    if (!el) return;
    // Just labels, so a stray click can't turn one off. Switches are in the Adapter Library tab.
    var pills = $('#ws-pills');
    pills.innerHTML = names.length ? names.map(function (n) {
      return '<li class="ws-pill" title="' + esc((ADAPTERS[n] || {}).help || '') + '">' + esc(label(n)) + '</li>';
    }).join('') : '<li class="ws-help">No adapters on yet.</li>';
    var l = profileName ? learned()[learnKey(profileName)] : null, bits = [];
    // Only what matches the page now: a guide link can turn on an adapter the person turned off.
    var lon = l ? l.on.filter(function (n) { return names.indexOf(n) !== -1; }) : [], loff = l ? l.off.filter(function (n) { return names.indexOf(n) === -1; }) : [];
    if (lon.length) bits.push('keeps ' + lon.map(label).join(', ') + ' on');
    if (loff.length) bits.push('keeps ' + loff.map(label).join(', ') + ' off');
    var whose = !bits.length ? '' : profileName === 'me' ? 'your profile' : nameOf(profileName).split(',')[0];
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
  // Your toolkit profile learns per preset: what you changed under Profile 3 stays with Profile 3.
  function learnKey(id) { return id === 'toolkit' && toolkitSelected ? 'toolkit:' + toolkitSelected.id : id; }
  function learned() { try { return JSON.parse(localStorage.getItem(LEARN_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function learnedSet(id) {
    var l = learned()[learnKey(id)] || { on: [], off: [] };
    return setOf(id).filter(function (n) { return l.off.indexOf(n) === -1; }).concat(l.on.filter(function (n) { return setOf(id).indexOf(n) === -1; }));
  }
  var learning = true; // off while a fix from the Build tab switches adapters: that isn't about the person
  function learn(name, on) {
    if (!learning || !profileName || name === 'mine' || (profileName === 'me' && !myProfile())) return;
    var all = learned(), key = learnKey(profileName), l = all[key] || { on: [], off: [] }, inSet = setOf(profileName).indexOf(name) !== -1;
    l.on = l.on.filter(function (n) { return n !== name; });
    l.off = l.off.filter(function (n) { return n !== name; });
    if (on && !inSet) l.on.push(name);
    if (!on && inSet) l.off.push(name);
    all[key] = l;
    try { localStorage.setItem(LEARN_KEY, JSON.stringify(all)); } catch (e) {}
    // Shopping as yourself, your toolkit learns from it too. Never from a made-up shopper.
    if (toolkitConfig && (profileName === 'toolkit' || profileName === 'me')) {
      import(base + 'toolkit.js').then(function (m) {
        return m.observe(toolkitConfig, {
          type: 'setting-change', origin: location.origin, data: { adapter: name, on: on },
          text: (on ? 'Turned on ' : 'Turned off ') + label(name) + ' while shopping on the Redbird store.',
        });
      }).catch(function () { /* learning is extra; the store works without it */ });
    }
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
      html += '<div class="ws-ad"><label class="ws-check"><input type="checkbox" data-fix="' + i + '"' + (here ? ' checked' : '') + '> <span class="ws-name">' + esc(titleOf(f)) + '</span></label>' +
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
      if (id.indexOf('preset:') === 0) return choosePreset(id.slice(7));
      switchProfile(id);
    };
    $('#ws-prof').addEventListener('focus', loadPresets);
    presetOptions();
    $('#ws-learned').addEventListener('click', function (e) {
      if (!e.target.closest('#ws-forget')) return;
      var all = learned();
      delete all[learnKey(profileName)];
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
        if (cb.checked) install(f.code, 'Turned it on.', others.concat('mine'), 'adapters');
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
    if (id === 'me') {
      var mf = withMyFixes(ids.slice());
      ids = mf.ids;
      // Their own adapter's code goes in as "your adapter", which starts on a fresh page.
      if (mf.code && mf.code !== readKey(MY_KEY)) {
        try { localStorage.setItem('redbird:profile', 'me'); } catch (e) {}
        return install(mf.code, 'Using your profile, with your own adapter.', ids, 'profiles');
      }
    }
    if (!window.RB_ISSUES || RB_ISSUES.value !== 'on') return go({ profile: id, try: ids.join(',') || 'none', issues: 'on' });
    return (id === 'none' ? Promise.resolve(null) : loadProfile(id))
      .then(function (prof) {
        profileName = id === 'none' ? '' : id;
        currentProfile = prof;
        baseOptions.profile = prof || null;
        try { localStorage.setItem('redbird:profile', id); } catch (e) {}
        if (id === 'toolkit') writeKey(PRESET_KEY, toolkitSelected ? toolkitSelected.id : '');
        qs.set('profile', id);
        var again = names.filter(function (n) { return ids.indexOf(n) !== -1 && n !== 'toolkit-fixes' && n !== 'mine'; });
        if (applySet(ids, {})) return;
        again.forEach(function (n) { turnOff(n); turnOn(n); });
        fillProfiles();
        renderOnList();
        var p = $('#ws-person');
        if (p && !readKey(PERSON_KEY)) p.value = prof ? prof.freeText || '' : '';
        renderFor();
        var on = names.length + ' adapter' + (names.length === 1 ? '' : 's') + ' on.';
        status(id === 'me' ? (prof ? 'Using your profile. ' + on : 'Answer the questions below to make your profile.')
          : !prof ? 'Shopping as nobody in particular. ' + on : 'Shopping as ' + nameOf(id) + '. ' + on);
      }, function () { go({ profile: id, try: ids.join(',') || 'none', issues: 'on' }); });
  }
  function fillProfiles() {
    if (profileName === 'me') return fillMine();
    if (profileName === 'toolkit') {
      $('#ws-persona').innerHTML = currentProfile
        ? '<figure class="ws-persona"><figcaption>' + esc(toolkitName()) + '</figcaption><blockquote>“' + esc(currentProfile.freeText || '') + '”</blockquote></figure>' +
          '<p class="ws-help">Change it on the Profiles page of your developer console. This page follows along; there is nothing to reload. <button type="button" class="ws-link" id="ws-tk-reload">Read it again</button> if it ever looks out of date.</p>'
        : '<p class="ws-err">Couldn’t read your toolkit profile. Check the connection below.</p>';
      return;
    }
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
        mineThread(me) +
        '<label class="ws-lab" for="ws-me-say">What should change about your profile?</label>' +
        '<textarea id="ws-me-say" class="ws-input" rows="2" placeholder="e.g., Moving banners distract me too"></textarea>' +
        '<div class="ws-row"><button type="button" class="ws-btn" id="ws-me-change">Change it</button></div>' +
        '<p class="ws-help" id="ws-me-msg"></p>' +
        '<details class="ws-more" id="ws-me-more"><summary>More</summary>' +
          '<p class="ws-help">It’s kept in this browser, and it remembers which adapters you turn on or off. The toolkit’s browser extension can load the file with Import profile.</p>' +
          '<div class="ws-row" id="ws-me-acts"><button type="button" class="ws-btn ws-quiet" id="ws-me-file">Save it as a file</button>' +
            '<button type="button" class="ws-link" id="ws-me-edit">Answer the questions again</button>' +
            '<button type="button" class="ws-link" id="ws-me-del">Delete it</button></div></details>';
      $('#ws-me-change').onclick = reviseMine;
      $('#ws-me-edit').onclick = function () { fillMine(true); $('#ws-me1').focus(); };
      $('#ws-me-file').onclick = saveMine;
      $('#ws-me-del').onclick = askDelete;
      el.querySelectorAll('[data-mever]').forEach(function (b) { b.onclick = function () { backToMine(+b.getAttribute('data-mever')); }; });
      return;
    }
    var a = (me && me.answers) || ['', '', ''];
    var q = function (id, text, v) { return '<label class="ws-lab" for="' + id + '">' + text + '</label><textarea id="' + id + '" class="ws-input" rows="2">' + esc(v) + '</textarea>'; };
    el.innerHTML = '<div class="ws-card"><h3 class="ws-h">Make your own profile</h3>' +
      '<p class="ws-help">Answer in your own words, and the toolkit picks adapters for you.</p>' +
      q('ws-me1', 'What gets in your way on ' + SITES + '?', a[0]) + q('ws-me2', 'What would make ' + SITES + ' easier for you?', a[1]) + q('ws-me3', 'Is there anything you don’t want changed?', a[2]) +
      '<div class="ws-row"><button type="button" class="ws-btn" id="ws-me-go">' + (me ? 'Update my profile' : 'Make my profile') + '</button>' +
      (me ? '<button type="button" class="ws-link" id="ws-me-cancel">Cancel</button>' : '') + '</div>' +
      '<p class="ws-help" id="ws-me-msg"></p>' +
      '<p class="ws-help">AI reads your answers to write the profile. The profile is kept only in this browser.</p></div>';
    $('#ws-me-go').onclick = makeMine;
    if (me) $('#ws-me-cancel').onclick = function () { fillMine(); $('#ws-me-more').open = true; $('#ws-me-edit').focus(); };
  }
  function meSays(text) { var m = $('#ws-me-msg'); if (m) m.textContent = text; say(text, true); }
  // The profile's versions, like a fix's: what the person said, and what changed. The last three show.
  function versionsOf(me) {
    if (!me.versions || !me.versions.length) me.versions = [{ n: 1, said: null, changed: 'Made from your answers.', about: me.freeText, adapters: me.adapters || [] }];
    return me.versions;
  }
  // The version on now says what changed; the earlier ones fold away, each with a way back to it.
  function mineThread(me) {
    var vs = versionsOf(me), now = me.current || vs[vs.length - 1].n;
    if (vs.length < 2) return '';
    var line = function (v) {
      return '<li class="ws-ver"><span class="ws-who">Version ' + v.n + (v.n === now ? ' <span class="ws-tag">on now</span>' : '') + '</span> ' +
        (v.said ? 'You said: “' + esc(cut(v.said, 120)) + '” ' : '') + esc(v.changed || '') +
        (v.n !== now ? ' <button type="button" class="ws-link" data-mever="' + v.n + '">Go back to version ' + v.n + '</button>' : '') + '</li>';
    };
    var cur = vs.filter(function (v) { return v.n === now; })[0] || vs[vs.length - 1], rest = vs.filter(function (v) { return v !== cur; }).reverse();
    return '<ol class="ws-thread">' + line(cur) + '</ol>' +
      '<details class="ws-more"><summary>Earlier versions (' + rest.length + ')</summary><ol class="ws-thread">' + rest.map(line).join('') + '</ol></details>';
  }
  // Saves a profile the AI wrote (from the three answers, or from what the person just said) as the
  // next version, and shops as it. A new version starts with the adapters it lists.
  function storeMine(d, said, answers) {
    var ids = (d.adapters || []).filter(function (n, i, all) { return ADAPTERS[n] && n !== 'mine' && all.indexOf(n) === i; });
    CLASH.forEach(function (c) { if (ids.indexOf(c[0]) !== -1) ids = ids.filter(function (n) { return n !== c[1]; }); });
    ids = ids.slice(0, said ? 6 : 5);
    var old = myProfile();
    var me = { name: 'My profile', freeText: String(d.about).trim(), adapters: ids, answers: answers || (old && old.answers) || [], updatedAt: Date.now(),
      supportAreas: (d.supportAreas || []).filter(function (x) { return /^(vision|hearing|motor|cognitive|reading|sensory)$/.test(x); }),
      fields: { needs: [] }, fixes: (old && old.fixes) || [] };
    var grade = Number(d.readingLevel);
    if (grade >= 3 && grade <= 12) me.fields.readingLevel = grade;
    if (d.urgency === 'hide' || d.urgency === 'label') me.fields.needs.push({ dimension: 'urgency', value: d.urgency, strength: 'preference', unit: 'enum' });
    var vs = said && old ? versionsOf(old) : [];
    me.versions = vs.concat({ n: vs.length + 1, said: said || null, changed: said ? String(d.changed || '').trim() || 'Updated your profile.' : 'Made from your answers.',
      about: me.freeText, adapters: ids, supportAreas: me.supportAreas, fields: me.fields }).slice(-12);
    localStorage.setItem(ME_KEY, JSON.stringify(me));
    var all = learned(); delete all.me; localStorage.setItem(LEARN_KEY, JSON.stringify(all)); // this version's adapters are the ones it lists
    return Promise.resolve(switchProfile('me')).then(function () {
      var f = $('#ws-persona figure');
      if (f) f.focus();
      if (!ids.length) status('Made your profile. None of the adapters matched what you wrote, so none are on. Turn any on in the Adapter Library, and they’re saved to your profile.');
      else if (said) status(me.versions[me.versions.length - 1].changed);
    });
  }
  function parseMine(text) {
    var d = null;
    try { d = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ['null'])[0]); } catch (e) {}
    if (!d || typeof d !== 'object' || (d.about != null && typeof d.about !== 'string')) throw new Error('the AI’s answer wasn’t a profile');
    d.about = d.about || '';
    return d;
  }
  // "What should change about your profile?": one thing the person says, worked into the profile.
  function reviseMine() {
    var box = $('#ws-me-say'), said = box.value.trim(), me = myProfile();
    if (!said) { meSays('Say what should change first.'); box.focus(); return; }
    var on = learnedSet('me'), off = ((learned().me || {}).off) || [];
    var earlier = versionsOf(me).filter(function (v) { return v.said; }).map(function (v) { return '- ' + v.said; }).join('\n');
    var btn = $('#ws-me-change');
    btn.disabled = true;
    meSays('Changing your profile…');
    var done = function () { btn.disabled = false; };
    var input = { about: me.freeText, on: on.map(function (n) { return n + ' (' + (ADAPTERS[n] || {}).help + ')'; }).join('; '), off: off.join(', '), earlier: earlier, said: said, catalog: catalog() };
    ask('reviseProfile', input).then(parseMine).catch(function () { return ask('reviseProfile', input).then(parseMine); })
      .then(function (d) {
        done();
        if (!d.about.trim()) { meSays('That didn’t change anything. Say it another way?'); box.focus(); return; }
        return storeMine(d, said);
      }).catch(function (e) { done(); meSays('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function backToMine(n) {
    var me = myProfile(), v = versionsOf(me).filter(function (x) { return x.n === n; })[0];
    if (!v) return;
    me.freeText = v.about; me.adapters = v.adapters; me.current = n;
    if (v.supportAreas) me.supportAreas = v.supportAreas;
    if (v.fields) me.fields = v.fields;
    localStorage.setItem(ME_KEY, JSON.stringify(me));
    var all = learned(); delete all.me; localStorage.setItem(LEARN_KEY, JSON.stringify(all));
    return Promise.resolve(switchProfile('me')).then(function () { status('Back to version ' + n + ' of your profile.'); });
  }
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
    var input = { catalog: catalog(), answers: 'What gets in my way on ' + SITES + ': ' + (a[0] || '-') + '\nWhat would make ' + SITES + ' easier for me: ' + (a[1] || '-') + '\nWhat I don’t want changed: ' + (a[2] || '-') };
    // One more try if the answer doesn't come back or isn't a profile.
    ask('myProfile', input).then(parseMine).catch(function () { return ask('myProfile', input).then(parseMine); })
      .then(function (d) {
        clearInterval(tick);
        if (!d.about.trim()) { stop(); meSays('Say a bit more about what gets in your way, then try again.'); $('#ws-me1').focus(); return; }
        return storeMine(d, null, a);
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
    $('#ws-me-no').onclick = function () { fillMine(); $('#ws-me-more').open = true; $('#ws-me-del').focus(); };
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
    if (name === 'local') folderState();
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
  // These do their work without changing the page, so an empty list doesn't mean they did nothing.
  var QUIET = ['read-aloud', 'reading-spot', 'mute-sounds', 'confirm-actions', 'show-captions', 'live-region-announcer', 'persistent-hover'];
  function updateChanges(slot, who) {
    var n = count(who), det = slot.querySelector('details.ws-chgs');
    if (!n) {
      var none = !Track.obs ? '' : '<p class="ws-help">' + (QUIET.indexOf(who) !== -1 ? 'It’s on. It works in the background, so the page looks the same.' : 'Nothing to change on this page.') + '</p>';
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
  function titleOf(f) {
    var t = squash((f && (f.need || f.description || f.name)) || 'My fix');
    return cut(t.charAt(0).toUpperCase() + t.slice(1), 80);
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
    // From a real website, a share link opens the store, which is the one place everyone has the panel.
    if (LOCAL && LOCAL.bridge) return LOCAL.store + '/?' + q;
    return (LOCAL ? LOCAL.store : location.origin) + location.pathname + '?' + q;
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
  // One box, like a chat. Before there is a fix: who it's for (one line), what should change, and
  // starter prompts. Once there is a fix, its conversation takes this place (renderResult), with the
  // same kind of box for the next change. From a starter folder, only the folder's card shows.
  function buildHTML() {
    if (LOCAL) return '<div id="ws-in"></div>' + folderHTML();
    return '<div id="ws-in"></div>' +
      '<div id="ws-start">' +
        '<p class="ws-help ws-for"><span id="ws-for"></span> <button type="button" class="ws-link" id="ws-for-edit" aria-expanded="false" aria-controls="ws-for-box">Change</button></p>' +
        '<div id="ws-for-box" hidden>' +
          '<label class="ws-lab" for="ws-person">Who is it for?</label>' +
          '<textarea id="ws-person" class="ws-input" rows="2" aria-describedby="ws-person-help" placeholder="e.g., Mark has ADHD and anxiety. Countdown timers make him rush."></textarea>' +
          '<p class="ws-help" id="ws-person-help">A sentence or two about them, like your card game’s ability profile.</p>' +
          '<details class="ws-more" id="ws-ask"><summary>Not sure what to write? Answer three questions</summary>' +
            '<label class="ws-lab" for="ws-q1">What on ' + SITES + ' gets in their way?</label><textarea id="ws-q1" class="ws-input" rows="2"></textarea>' +
            '<label class="ws-lab" for="ws-q2">What would make ' + SITES + ' easier for them?</label><textarea id="ws-q2" class="ws-input" rows="2"></textarea>' +
            '<label class="ws-lab" for="ws-q3">Is there anything they don’t want changed?</label><textarea id="ws-q3" class="ws-input" rows="2"></textarea>' +
            '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-askgo">Write it for me</button></div></details>' +
        '</div>' +
        '<label class="ws-lab" for="ws-need">What should change on this page?</label>' +
        '<textarea id="ws-need" class="ws-input" rows="3" placeholder="Describe one change"></textarea>' +
        '<div id="ws-starters"></div>' +
        '<p class="ws-help" id="ws-target"></p>' +
        '<div class="ws-row"><button type="button" class="ws-btn" id="ws-build">Build it</button>' +
          '<button type="button" class="ws-link" id="ws-point" aria-pressed="false">Point at it on the page</button>' +
          '<button type="button" class="ws-link" id="ws-ideasgo">Get ideas for this page</button></div>' +
        '<ul class="ws-plain" id="ws-idealist"></ul>' +
      '</div>' +
      '<p class="ws-msg" id="ws-msg"></p>' +
      '<div id="ws-result"></div>' +
      '<div id="ws-saved"></div>' +
      '<details class="ws-more ws-ready"><summary>Ready-made skills from the toolkit</summary><ul class="ws-sks" id="ws-ready"></ul></details>';
  }
  // Starter prompts from the workshop guide, for the planted problems on this page. Picking one also
  // tells the panel which problem the fix is for, so the AI is told what "fixed" means and the
  // ready-made check for it runs.
  var STARTERS = {
    3: 'Make the Add to cart box a real button that the keyboard can reach and press',
    4: 'Read the star ratings out as numbers, like 4.6 out of 5 stars',
    5: 'Make each price read as one number, like $18.99, for a screen reader',
    6: 'Give the color circles names a screen reader can say',
    7: 'Clearly label the sponsored results as ads, for screen readers too',
    18: 'Add boxes to type a minimum and maximum price, instead of the slider you can only drag',
    19: 'Give me more time at checkout, or stop the timer that empties the cart',
    22: 'Let a click or the keyboard switch the product photos, not just the mouse moving over them',
    24: 'Hide the countdowns and “only 2 left” messages',
    25: 'Shorten the long product titles to the brand and what the product is',
    28: 'Rewrite the return policy in short, plain sentences',
    29: 'Rewrite the double-negative offers checkbox at checkout as a plain yes or no question',
    30: 'Explain payment errors in plain words, with what to do next',
    31: 'Show the real arrival date instead of “5–7 business days”',
  };
  var starterIssue = Number(readKey('redbird:starter-issue')) || 0;
  function renderStarters() {
    var el = rendered && $('#ws-starters');
    if (!el) return;
    var here = [];
    try {
      here = (window.RB_ISSUE_REPORT ? window.RB_ISSUE_REPORT() : []).filter(function (r) { return STARTERS[r.issue] && r.status !== 'fixed'; })
        .map(function (r) { return { issue: r.issue, text: STARTERS[r.issue] }; });
    } catch (e) {}
    var list = here.length ? here.slice(0, 3) : EXAMPLE_NEEDS.map(function (t) { return { issue: 0, text: t }; });
    el.innerHTML = '<p class="ws-help" id="ws-starters-lab">Or start from one of these:</p><ul class="ws-plain ws-starters" aria-labelledby="ws-starters-lab">' +
      list.map(function (x) { return '<li><button type="button" class="ws-link" data-starter="' + x.issue + '">' + esc(x.text) + '</button></li>'; }).join('') + '</ul>';
  }
  // "For: Sam Saltman, blind": the person from the Profiles tab, or what was typed under Change.
  function renderFor() {
    var el = rendered && $('#ws-for');
    if (!el) return;
    var p = person(), prof = currentProfile;
    el.textContent = 'For: ' + (!p ? 'anyone' : prof && prof.name && p === (prof.freeText || '') ? prof.name : cut(p, 80));
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
    ask('profileFromChat', { answers: 'What gets in their way on ' + SITES + ': ' + (a[0] || '-') + '\nWhat would make ' + SITES + ' easier for them: ' + (a[1] || '-') + '\nWhat they don’t want changed: ' + (a[2] || '-') })
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
  //
  // Each fix keeps its conversation in result.thread: what the person asked ({ who: 'you' }), and
  // each version that came back ({ who: 'version', n, note, code, adapters, checks }). The AI says
  // in one line what each version changed, and the panel checks each version once it has run.
  var asking = null; // the conversation so far, while the AI works on the next version
  function build() {
    var need = $('#ws-need').value.trim();
    if (!need) { msg('Write what should change first.'); $('#ws-need').focus(); return; }
    var targets = targetIssues(target && target.from !== '#ws-point3' ? target : null);
    if (starterIssue && targets.indexOf(starterIssue) === -1) targets = [starterIssue].concat(targets).slice(0, 3);
    asking = { thread: [{ who: 'you', text: need }], base: baseline(), targets: targets };
    if (readKey('redbird:need-new') === need) return writeNew(need, $('#ws-build'));
    var done = wait($('#ws-build'), 'Looking for adapters that do this…');
    ask('buildSkill', { need: askFor({ need: need }), person: person(), catalog: catalog(), settings: settingsLines() }).then(parseSkill).then(function (s) {
      done();
      if (s.adapters.length) return useSkill(need, s);
      writeNew(need, $('#ws-build'));
    }, function (e) { done(); asking = null; msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  // The planted problems a fix is for: the ones a store link turned on by number (the guide's links
  // do this), or else the ones at the part of the page the person pointed at.
  function targetIssues(pointed) {
    var v = (window.RB_ISSUES && window.RB_ISSUES.value) || '';
    if (/^\d+(,\d+)*$/.test(v)) return v.split(',').map(Number).slice(0, 3);
    return ((pointed && pointed.issues) || []).slice(0, 3);
  }
  // What the AI is told about them, so it knows when the fix is done. It goes after the person's own
  // words, in the request the store's AI already takes.
  function problemText(nums) {
    var parts = (nums || []).map(function (n) {
      var i = window.RB_ISSUE_INFO && window.RB_ISSUE_INFO(n);
      return i && ('Problem ' + n + ', "' + i.title + '": ' + i.what + (i.done ? ' It is fixed when ' + i.done : ''));
    }).filter(Boolean);
    return parts.length ? cut('\n\nThis is about a problem Redbird has on purpose, which the workshop checks for after the adapter runs. ' + parts.join(' '), 1000) : '';
  }
  function askFor(r) { return ((r && r.need) || '') + problemText((asking && asking.targets) || (r && r.targets)); }
  // The AI's "// What changed: …" line is shown in the conversation, not kept in the code.
  function splitNote(code) {
    var m = code.match(/^\s*\/\/\s*What changed:\s*(.+)\n/i);
    return m ? { code: code.slice(m[0].length).replace(/^\s*\n/, ''), note: m[1].trim() } : { code: code, note: '' };
  }
  // The next version of the fix, with the conversation carried over.
  function nextResult(r, note) {
    var from = asking || result || {};
    r.thread = (from.thread || []).slice();
    r.base = from.base || null;
    r.targets = from.targets || r.targets || [];
    var n = r.thread.filter(function (t) { return t.who === 'version'; }).length + 1;
    r.thread.push({ who: 'version', n: n, note: note, code: r.code || null, adapters: r.adapters, auto: !!from.auto });
    // Old versions' code goes after a while, so the conversation fits in the browser's storage.
    var vs = r.thread.filter(function (t) { return t.who === 'version' && t.code; });
    vs.slice(0, Math.max(0, vs.length - 12)).forEach(function (t) { t.code = null; });
    asking = null;
    return r;
  }
  function useSkill(need, s) {
    result = nextResult({ name: s.name, need: need, description: s.description, adapters: s.adapters, md: s.md, code: null },
      'Turns on ' + s.adapters.map(function (a) { return label(a.id); }).join(', ') + ' from the toolkit.');
    keep(DRAFT_KEY, result);
    var text = 'Done. Check the page.';
    keep(NOTE_KEY, { text: text });
    if (applySet(idsOf(result), settingsOf(result.adapters))) return;
    keep(NOTE_KEY, null);
    msg(text);
    renderResult();
    checkVersion();
    $('#ws-result').scrollIntoView({ block: 'nearest' });
  }
  // keep: adapters from the toolkit to keep next to the new one (a skill someone asked to change).
  function writeNew(need, btn, keep) {
    var done = wait(btn, 'No adapter does this yet, so AI is writing one. This takes about 30 seconds…');
    var pointed = target && target.from !== '#ws-point3' ? target : null;
    var input = { description: askFor({ need: need }), person: person(), snapshot: snapshot(document.body, 14000), target: pointed ? pointed.html : '', url: here() };
    // One more try if the answer doesn't come back or isn't an adapter.
    ask('writeAdapter', input).then(cleanCode).catch(function () { return ask('writeAdapter', input).then(cleanCode); })
      .then(function (code) { finishAdapter(need, code, 'Done. AI wrote a new adapter, and it’s on.', keep); })
      .catch(function (e) { done(); asking = null; msg('That didn’t work: ' + e.message + '. Try again.'); });
  }
  function finishAdapter(need, code, text, kept) {
    var adapters = (kept || []).filter(function (a) { return a.id !== 'mine'; }).concat({ id: 'mine', settings: {} });
    var sp = splitNote(code);
    result = nextResult({ name: kebab(need.split(/\s+/).slice(0, 5).join(' ')), need: need, description: need, adapters: adapters, md: '', code: sp.code,
      target: target && target.from !== '#ws-point3' ? target : null },
      sp.note || 'AI wrote a new adapter.');
    keep(DRAFT_KEY, result);
    install(sp.code, text, idsOf(result));
  }
  // What should change next. A built adapter is changed by the AI that wrote it. A skill goes back
  // to the Engineer, and if it now finds no adapter that fits, AI writes a new one for the need and the change.
  // auto: the panel's own check found a problem, so this is the AI's second try by itself. It is the
  // plain version of what the check found, shown in the conversation; feedback is what the AI gets.
  function change(feedback, error, auto) {
    // Code written by hand (in Details, or from the guide) has no fix card: make one, so the AI
    // can fix the code that's running.
    var running = readKey(MY_KEY);
    if (error && running && (!result || !result.code || result.code !== running)) {
      result = { name: (result && result.name) || 'my-adapter', need: (result && result.need) || 'My own adapter', description: '',
        adapters: [{ id: 'mine', settings: {} }], md: '', code: running, thread: [{ who: 'version', n: 1, note: 'Your own code.', code: running }] };
      keep(DRAFT_KEY, result);
    }
    if (!result) return;
    if (!feedback && !error) { msg('Say what should change first.'); $('#ws-fb').focus(); return; }
    var asked = turns().filter(function (t) { return t.who === 'you'; }).slice(1).map(function (t) { return '- ' + t.text; }).join('\n');
    var turn = auto ? { who: 'check', text: typeof auto === 'string' ? auto : feedback } : { who: 'you', text: feedback || 'Fix this error: ' + String(error).replace(/^Stopped with an error:\s*/, '') };
    var mine = target && target.from === '#ws-point2' ? target : null;
    asking = { thread: turns().concat(turn), base: result.base || null, auto: !!auto,
      targets: (result.targets || []).concat(targetIssues(mine).filter(function (n) { return (result.targets || []).indexOf(n) === -1; })).slice(0, 3) };
    var btn = $(auto ? '#ws-change' : error ? '#ws-repair' : '#ws-change') || $('#ws-build');
    var pointed = mine || result.target;
    var working = auto ? 'The check found a problem, so the AI is trying again…' : error ? 'Asking the AI to fix the error…' : 'Changing the adapter…';
    if (result.code) {
      var done = wait(btn, working);
      ask('reviseAdapter', { code: result.code, description: askFor(result), feedback: cut(feedback || '', 590), error: error || '', history: asked, person: person(),
        snapshot: snapshot(document.body, 14000), target: pointed ? pointed.html : '', url: here() })
        .then(function (code) {
          var sp = splitNote(cleanCode(code));
          result = nextResult(Object.assign({}, result, { code: sp.code, target: pointed }), sp.note || (error ? 'Fixed the error.' : 'Changed the adapter.'));
          keep(DRAFT_KEY, result);
          if (!error && !auto) writeKey(FB_KEY, null);
          install(result.code, auto ? 'The AI tried again. Check the page.' : error ? 'Fixed. It’s running again.' : 'Changed. Check the page.', idsOf(result));
        }).catch(function (e) { done(); asking = null; msg('That didn’t work: ' + e.message + '. Try again.'); });
      return;
    }
    // A skill whose adapters didn't fix the problem gets a new adapter written for it.
    if (auto) return writeNew(result.need, btn, result.adapters);
    var done2 = wait(btn, 'Trying again…');
    ask('buildSkill', { need: askFor(result), person: person(), catalog: catalog(), settings: settingsLines(), previous: result.md, feedback: feedback })
      .then(parseSkill).then(function (s) {
        done2();
        writeKey(FB_KEY, null);
        // The same adapters again have nothing new for this change, so AI writes one for it.
        if (s.adapters.length && !same(idsOf(s), idsOf(result))) return useSkill(result.need, s);
        writeNew(result.need + '. ' + feedback, btn, result.adapters);
      }, function (e) { done2(); asking = null; msg('That didn’t work: ' + e.message + '. Try again.'); });
  }

  // ── Checking each version ─────────────────────────────────────────────────
  // The page before the fix, to compare each version against: which planted problems are fixed.
  function pageKey() {
    var q = new URLSearchParams();
    ['id', 'q', 'cat'].forEach(function (k) { if (qs.get(k)) q.set(k, qs.get(k)); });
    return location.pathname + (q.toString() ? '?' + q : '');
  }
  function baseline() {
    try { return window.RB_ISSUE_REPORT ? { page: pageKey(), report: window.RB_ISSUE_REPORT() } : null; } catch (e) { return null; }
  }
  var RANK = { fixed: 3, partly: 2 };
  function issueWords(s) {
    if (!s) return 'gone';
    if (s.status === 'partly') return 'partly fixed (' + s.still + ' of ' + s.places + ' places still have it)';
    return { fixed: 'fixed', present: 'not fixed', nocheck: 'not checked automatically', waiting: 'not showing yet' }[s.status] || s.status;
  }
  // Once the latest version has run: did it stop with an error, how much did it change, and which
  // planted problems on this page did it fix (or make worse) compared with the page before the fix.
  function checkVersion() {
    var v = versions().slice(-1)[0];
    if (!v || v.checks || !result || !same(idsOf(result), names)) return;
    if (v.code && v.code !== readKey(MY_KEY)) return;
    var ids = idsOf(result);
    Promise.all(ids.map(function (n) { return Promise.resolve(loading[n]).then(function () { return enabling[n]; }).catch(function () {}); }))
      .then(function () { return new Promise(function (ok) { setTimeout(ok, 1500); }); })
      .then(function () { return aiSettled(20000); })
      .then(function () {
        if (versions().slice(-1)[0] !== v) return;
        var c = { page: pageKey(), error: ids.map(function (n) { return errors[n]; }).filter(Boolean)[0] || (ids.indexOf('mine') !== -1 && mineWarn) || '',
          changes: Track.list.filter(function (e) { return ids.indexOf(e.who) !== -1 && live(e); }).length, issues: [] };
        var base = result.base;
        if (base && base.page === c.page && window.RB_ISSUE_REPORT) {
          var was = {}, now = {};
          base.report.forEach(function (s) { was[s.issue] = s; });
          window.RB_ISSUE_REPORT().forEach(function (s) { now[s.issue] = s; });
          Object.keys(was).concat(Object.keys(now)).filter(function (n, i, all) { return all.indexOf(n) === i; }).forEach(function (n) {
            var a = was[n], b = now[n];
            if (issueWords(a) === issueWords(b)) return;
            // Gone from a page it was on means the adapter fixed every place it showed up.
            c.issues.push({ issue: +n, title: (a || b).title, was: issueWords(a), now: b ? issueWords(b) : 'fixed', status: b ? b.status : a ? 'fixed' : 'gone',
              worse: (RANK[(b || {}).status] || 1) < (RANK[(a || {}).status] || 1) && !!b });
          });
          c.issues.sort(function (x, y) { return x.issue - y.issue; });
          // The problems this fix is for, whether or not this version changed them.
          c.target = (result.targets || []).map(function (n) {
            var b = now[n], a = was[n];
            return { issue: n, title: (b || a || window.RB_ISSUE_INFO(n) || {}).title || '', status: b ? b.status : a ? 'fixed' : 'gone', words: b ? issueWords(b) : 'fixed', left: b ? b.left || [] : [] };
          }).filter(function (t) { return t.status !== 'gone'; });
        }
        // New code also gets switched off in a hidden copy of the page, to see whether it puts the page back.
        return (base && base.page === c.page ? hiddenCheck() : Promise.resolve(null)).then(function (u) {
          if (versions().slice(-1)[0] !== v) return;
          if (u && u.left) c.left = u.left.slice(0, 6);
          if (u && u.tried && u.tried.length) c.tried = u.tried;
          v.checks = c;
          keep(DRAFT_KEY, result);
          renderResult();
          var words = document.createElement('div');
          words.innerHTML = checkWords(c);
          say('Version ' + v.n + ': ' + words.textContent, true);
          tryAgain(c);
        });
      });
  }
  // In a hidden copy of this page: tries the fix the way the person would, with the store's ready-made
  // checks for the problems it is for (workshop/checks.js), then turns a new adapter off and lists
  // what it left behind. It uses the same test hooks as the starter folder's tests (RB_TEST), and the
  // person's own page doesn't change.
  function hiddenCheck() {
    var ids = idsOf(result), targets = result.targets || [];
    return loadScript(base + 'checks.js', 'RB_CHECKS').catch(function () {}).then(function () {
      var own = targets.filter(function (n) { return window.RB_CHECKS && window.RB_CHECKS[n]; });
      if (!result.code && !own.length) return null;
      return new Promise(function (done) {
        var q = new URLSearchParams(location.search);
        ['reset', 'from', 'need', 'new', 'spotlight'].forEach(function (k) { q.delete(k); });
        q.set('try', ids.join(',')); q.set('workshop', 'off'); q.set('rbtest', '1');
        var f = document.createElement('iframe'), poll = 0, timer = 0;
        function finish(r) { clearInterval(poll); clearTimeout(timer); f.remove(); done(r || null); }
        timer = setTimeout(finish, 60000);
        f.setAttribute('aria-hidden', 'true');
        f.tabIndex = -1;
        f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:900px;border:0;visibility:hidden';
        f.onload = function () {
          var w = f.contentWindow;
          poll = setInterval(function () {
            if (!w || !w.RB_TEST) return;
            clearInterval(poll);
            w.document.querySelectorAll('video, audio').forEach(function (m) { m.muted = true; });
            var tried = [];
            Promise.all(ids.map(function (n) { return w.RB_TEST.ready(n); })).then(function () {
              return own.reduce(function (p, n) {
                return p.then(function () { return window.RB_CHECKS[n](w); }).then(function (rs) {
                  (rs || []).forEach(function (r) { tried.push({ issue: n, ok: !!r.ok, says: String(r.says || '') }); });
                }, function () {});
              }, Promise.resolve());
            }).then(function () { return result.code ? w.RB_TEST.undo('mine') : { left: [] }; })
              .then(function (u) { finish({ left: u.left || [], tried: tried }); }, function () { finish({ tried: tried }); });
          }, 200);
        };
        f.src = location.pathname + '?' + q;
        document.body.appendChild(f);
      });
    });
  }
  // What was left behind, in words the AI can act on.
  function leftWords(rows) {
    return rows.slice(0, 3).map(function (r) {
      if (r.type === 'attr') return r.attr + ' on ' + r.tag + ' is still ' + (r.now == null ? 'missing' : '"' + cut(r.now, 40) + '"');
      if (r.type === 'text') return r.tag + ' still has the new text';
      if (r.type === 'removed') return 'the store\u2019s ' + r.tag + ' was removed or replaced and is not back';
      if (r.type === 'style') return 'the added style sheet is still there';
      return 'the added ' + r.tag + ' is still there';
    }).join('; ');
  }
  // After a version's check: when it stopped with an error, or a problem this fix is for is still
  // there, the AI gets one more try by itself, told what the check found. Once per request.
  function tryAgain(c) {
    var t = turns(), lastYou = -1;
    t.forEach(function (x, i) { if (x.who === 'you') lastYou = i; });
    if (t.slice(lastYou + 1).some(function (x) { return x.who === 'check'; })) return;
    var why = [], plain = []; // what the AI is told, and what the person sees in the conversation
    if (c.error) {
      why.push('It stopped with an error: ' + String(c.error).replace(/^(Stopped with an error|It logged an error):\s*/, '') + '.');
      plain.push('It stopped with an error.');
    }
    (c.target || []).forEach(function (x) {
      if (!/^(present|partly)$/.test(x.status)) return;
      var what = 'Problem ' + x.issue + ' (' + x.title.charAt(0).toLowerCase() + x.title.slice(1) + ') is still ' + x.words + ' on this page';
      why.push(what + (x.left.length ? ', for example at ' + x.left.slice(0, 3).join(', ') : '') + '.');
      plain.push(what + '.');
    });
    var failed = (c.tried || []).filter(function (x) { return !x.ok; });
    failed.forEach(function (x) {
      why.push('Trying it the way the person would (the workshop\u2019s check for problem ' + x.issue + '): ' + x.says + '.');
      plain.push('Trying it: ' + x.says + '.');
    });
    // What already works, so the next version doesn't break it while fixing the rest.
    var kept = (c.tried || []).filter(function (x) { return x.ok && failed.some(function (y) { return y.issue === x.issue; }); });
    if (kept.length) why.push('Keep these working: ' + kept.map(function (x) { return x.says; }).join('; ') + '.');
    if (c.left && c.left.length) {
      why.push('When it is turned off, it leaves the page changed: ' + leftWords(c.left) + '. Make disable() put back exactly what enable() changed, and change the store\u2019s elements in place instead of replacing them.');
      plain.push('Turning it off didn\u2019t put the page back: ' + c.left.length + ' change' + (c.left.length === 1 ? '' : 's') + ' stayed.');
    }
    if (!why.length || (!result.code && !(c.target || []).length)) return;
    change(why.join(' '), c.error && result.code ? c.error : '', plain.join(' '));
  }
  function checkWords(c) {
    if (!c) return '';
    var out = [];
    if (c.error) out.push('<span class="ws-err">Stopped with an error.</span>');
    if (c.left && c.left.length) out.push('<span class="ws-err">Turning it off leaves ' + c.left.length + ' change' + (c.left.length === 1 ? '' : 's') + '.</span>');
    (c.tried || []).forEach(function (x) { out.push((x.ok ? '' : '<span class="ws-err">') + 'Trying it: ' + esc(x.says) + '.' + (x.ok ? '' : '</span>')); });
    (c.target || []).forEach(function (x) {
      if (/^(present|partly)$/.test(x.status) && !c.issues.some(function (y) { return y.issue === x.issue; })) {
        out.push('<span class="ws-err">Problem ' + x.issue + ' (' + esc(x.title.charAt(0).toLowerCase() + x.title.slice(1)) + ') is still ' + esc(x.words) + '.</span>');
      }
    });
    // With a problem the fix is for, show that one (and anything made worse); the rest is one line.
    var aim = (c.target || []).map(function (x) { return x.issue; });
    var shown = aim.length ? c.issues.filter(function (x) { return aim.indexOf(x.issue) !== -1 || x.worse; }) : c.issues.slice(0, 3);
    var rest = c.issues.filter(function (x) { return shown.indexOf(x) === -1 && !x.worse && /^(fixed|partly)$/.test(x.status); });
    shown.forEach(function (x) {
      var what = 'problem ' + x.issue + ' (' + esc(x.title.charAt(0).toLowerCase() + x.title.slice(1)) + ')';
      if (x.worse) out.push('<span class="ws-err">Makes ' + what + ' worse: it was ' + esc(x.was) + ', and now it is ' + esc(x.now) + '.</span>');
      else if (x.status === 'fixed') out.push('Fixes ' + what + '.');
      else if (x.status === 'partly') out.push('Partly fixes ' + what + ': ' + esc(x.now.replace(/^partly fixed \((.*)\)$/, '$1')) + '.');
      else out.push(what.charAt(0).toUpperCase() + what.slice(1) + ' is now ' + esc(x.now) + ' (was ' + esc(x.was) + ').');
    });
    if (rest.length) out.push('Also helps with ' + rest.length + ' other planted problem' + (rest.length === 1 ? '' : 's') + '.');
    if (!c.changes) out.push('Changed nothing on this page.');
    else if (!c.issues.length && !(c.tried || []).length) out.push('Made ' + c.changes + ' change' + (c.changes === 1 ? '' : 's') + ' on this page.');
    return out.join(' ');
  }
  function turns() {
    if (!result) return [];
    // A fix from before the panel kept conversations: start one from what it has.
    if (!result.thread) result.thread = [{ who: 'you', text: result.need || result.description || '' }, { who: 'version', n: 1, note: '', code: result.code || null, adapters: result.adapters }];
    return result.thread;
  }
  function versions() { return turns().filter(function (t) { return t.who === 'version'; }); }
  // Which version is on the page: the newest one whose code is running, or for a skill, the newest
  // one whose adapters are the ones turned on.
  function runningVersion() {
    var vs = versions(), code = readKey(MY_KEY);
    if (!result || !same(idsOf(result), names)) return null;
    for (var i = vs.length - 1; i >= 0; i--) {
      if (result.code ? vs[i].code === code : vs[i].adapters && same(vs[i].adapters.map(function (a) { return a.id; }), names)) return vs[i];
    }
    return null;
  }
  function threadHTML() {
    var on = runningVersion(), last = versions().slice(-1)[0];
    return '<ol class="ws-thread">' + turns().map(function (t) {
      if (t.who === 'you') return '<li class="ws-you"><span class="ws-who">You asked</span> ' + esc(t.text) + '</li>';
      if (t.who === 'back') return '<li class="ws-you"><span class="ws-who">You went back to version ' + t.n + '</span></li>';
      if (t.who === 'check') return '<li class="ws-you"><span class="ws-who">The panel’s check</span> ' + esc(t.text) + ' The AI tried again by itself.</li>';
      var checks = t.checks ? '<span class="ws-checks">' + checkWords(t.checks) + '</span>' : t === last && t === on ? '<span class="ws-checks">Checking…</span>' : '';
      return '<li class="ws-ver"><span class="ws-who">Version ' + t.n + (t === on ? ' <span class="ws-tag">on now</span>' : '') + '</span> ' + esc(t.note || '') + ' ' + checks +
        (t !== on && (t.code || (!result.code && t.adapters)) ? ' <button type="button" class="ws-link" data-ver="' + t.n + '">Go back to version ' + t.n + '</button>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function goBack(n) {
    var v = versions().find(function (t) { return t.n === n; });
    if (!v) return;
    turns().push({ who: 'back', n: n });
    if (v.code) {
      result.code = v.code;
      keep(DRAFT_KEY, result);
      return install(v.code, 'Back to version ' + n + '.', idsOf(result));
    }
    result.adapters = v.adapters;
    keep(DRAFT_KEY, result);
    if (!applySet(idsOf(result), settingsOf(result.adapters))) { msg('Back to version ' + n + '.'); renderResult(); }
  }

  // What was built: the conversation, a switch to compare, Save, and a box for what should change next.
  function renderResult() {
    var el = rendered && $('#ws-result');
    if (!el) return;
    var start = $('#ws-start');
    if (start) start.hidden = !!result;
    if (!result) {
      // Coders who open ?try=mine get the code box straight away (Write an adapter by hand).
      el.innerHTML = names.indexOf('mine') !== -1 ? '<div class="ws-card"><h3 class="ws-h">Your adapter</h3>' + mineState() + codeBox('') + '</div>' : '';
      fillCode();
      return;
    }
    var ids = idsOf(result), on = same(ids, names), saved = isSaved(result);
    var others = ids.filter(function (n) { return n !== 'mine'; });
    var body = result.code
      ? mineState()
      : '<ul class="ws-plain ws-compact">' + result.adapters.map(function (a) {
        return '<li><span class="ws-name" title="' + esc(ADAPTERS[a.id].help) + '">' + esc(label(a.id)) + '</span>' +
          '<div class="ws-chg-slot" data-slot="' + esc(a.id) + '"></div></li>';
      }).join('') + '</ul>';
    el.innerHTML = '<div class="ws-card">' +
      '<button type="button" class="ws-link ws-newfix" id="ws-close" aria-label="New fix (this one stays on)">New fix</button>' +
      '<h3 class="ws-h">' + esc(titleOf(result)) + ' <span class="ws-tag">' + (result.code ? (others.length ? 'Skill + new adapter' : 'New adapter') : 'Skill') + '</span></h3>' +
      threadHTML() + body +
      '<label class="ws-lab" for="ws-fb">What should change next?</label>' +
      '<textarea id="ws-fb" class="ws-input" rows="2" placeholder="e.g., It missed the countdown at checkout"></textarea>' +
      '<p class="ws-help" id="ws-target2"></p>' +
      '<div class="ws-row"><button type="button" class="ws-btn" id="ws-change">Change it</button>' +
        '<button type="button" class="ws-link" id="ws-point2" aria-pressed="false">Point at it on the page</button></div>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-onoff" aria-pressed="' + !on + '">' + (on ? 'Turn off to compare' : 'Turn it back on') + '</button>' +
        '<button type="button" class="ws-btn ws-quiet" id="ws-save"' + (saved ? ' disabled' : '') + '>' + (saved ? 'Saved' : 'Save') + '</button></div>' +
      // Everything for coders, in one place.
      '<details class="ws-more" id="ws-code-box"' + (openCode ? ' open' : '') + '><summary>More</summary>' +
        (result.code
          ? '<label class="ws-lab" for="ws-code">The code</label><textarea id="ws-code" class="ws-codearea" spellcheck="false"></textarea>' +
            '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-runmine">Save and run</button></div>'
          : '<p class="ws-help">As a SKILL.md file, the toolkit’s format for skills:</p><pre class="ws-pre" tabindex="0">' + esc(result.md) + '</pre>') +
        (LOCAL ? '' : '<p class="ws-lab">Keep building in code</p>' +
          '<p class="ws-help">Download this fix as a folder, so you can keep changing it with a coding agent (e.g., Claude Code or Codex) and test it on the store.</p>' +
          '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-dl">Download the folder</button></div><p class="ws-msg" id="ws-dlmsg"></p>') +
        (saved ? '<div class="ws-row"><button type="button" class="ws-link" id="ws-fdel-this">Delete this fix from Saved fixes</button></div>' : '') +
      '</details></div>';
    fillCode();
    renderTarget();
    $('#ws-fb').value = readKey(FB_KEY) || '';
    ids.forEach(function (n) { var slot = el.querySelector('[data-slot="' + n + '"]'); if (slot) updateChanges(slot, n); });
  }
  // ── Keep building in code ─────────────────────────────────────────────────
  // "Download the folder" gets the starter folder (workshop/starter.js makes the zip) with this
  // fix's code, and its conversation in fix.json.
  function fixJSON(f) {
    var issues = [];
    (qs.get('issues') || '').split(',').forEach(function (n) { if (/^\d+$/.test(n)) issues.push(+n); });
    versions().forEach(function (v) {
      ((v.checks || {}).issues || []).forEach(function (x) { if (!x.worse && issues.indexOf(x.issue) === -1) issues.push(x.issue); });
    });
    return {
      name: kebab(f.name), need: f.need || f.description || '', person: person(), page: (f.base && f.base.page) || pageKey(), pages: [],
      site: onStore ? '' : location.href, // built on a real website through the extension
      issues: issues.sort(function (a, b) { return a - b; }),
      toolkitAdapters: (f.adapters || []).filter(function (a) { return a.id !== 'mine'; }),
      pointedAt: (f.target || {}).html || '',
      // The whole profile, the same thing adapters get as options.profile. The folder's store reads it.
      profile: currentProfile ? { name: currentProfile.name || '', freeText: currentProfile.freeText || '', supportAreas: currentProfile.supportAreas || [],
        fields: currentProfile.fields || {} } : null,
      conversation: (f.thread || []).filter(function (t) { return t.who !== 'back'; }).map(function (t) {
        if (t.who === 'you') return { who: 'person', text: t.text };
        if (t.who === 'check') return { who: 'panel check', text: t.text + ' The AI tried again by itself.' };
        return { who: 'version ' + t.n, text: t.note || '' };
      }),
    };
  }
  function downloadFolder(f) {
    var out = $('#ws-dlmsg'), files = {};
    out.textContent = 'Making the folder…';
    if (f && f.code) files['adapter.js'] = f.code;
    if (f) files['fix.json'] = JSON.stringify(fixJSON(f), null, 2) + '\n';
    loadScript(base + 'starter.js', 'RB_STARTER').then(function () { return window.RB_STARTER.download(kebab((f && f.name) || 'my-adapter'), files); })
      .then(function (text) { out.textContent = text; say(text, true); }, function (e) { out.textContent = 'Couldn’t make the folder: ' + e.message; });
  }

  // ── Your folder ───────────────────────────────────────────────────────────
  // When the store runs from a starter folder (npm run dev), the Build tab starts with that folder's
  // adapter: what it changed, a chat with opencode if it's installed, or else a box for notes to the
  // coding agent working in the folder (they go into its feedback.md), and Share. The panel's
  // extension does the same on real websites while a folder is running.
  function folderHTML() {
    if (!LOCAL) return '';
    return '<div class="ws-card" id="ws-folder"><h3 class="ws-h">Your folder</h3>' +
      '<p class="ws-help">This page runs adapter.js from your folder, and runs it again each time the file is saved.</p>' +
      '<div id="ws-folder-state"></div>' +
      (LOCAL.chat
        ? '<ol class="ws-thread" id="ws-chat-log" tabindex="0" aria-label="Your conversation with opencode" hidden></ol>' +
          '<p class="ws-help" id="ws-chat-status"></p>' +
          '<label class="ws-lab" for="ws-chat-box">What should change?</label>' +
          '<textarea id="ws-chat-box" class="ws-input" rows="2" aria-describedby="ws-chat-help" placeholder="e.g., Hide the photos, so only the headlines are left"></textarea>' +
          '<p class="ws-help" id="ws-chat-help">Opencode reads this page and changes adapter.js in your folder. Press Control and Enter, or Command and Enter, to send.</p>' +
          '<div class="ws-row"><button type="button" class="ws-btn" id="ws-chat-send">Send to opencode</button>' +
            '<button type="button" class="ws-btn ws-quiet" id="ws-chat-stop" hidden>Stop</button>'
        : '<label class="ws-lab" for="ws-note">What’s still wrong, or what should change?</label>' +
          '<textarea id="ws-note" class="ws-input" rows="2" aria-describedby="ws-note-help" placeholder="e.g., VoiceOver still reads the price in the cart as dollar 18 99"></textarea>' +
          '<p class="ws-help" id="ws-note-help">It goes at the bottom of feedback.md in your folder, with this page’s address.</p>' +
          '<div class="ws-row"><button type="button" class="ws-btn" id="ws-send">Add note for the coding agent</button>') +
        '<button type="button" class="ws-link" id="ws-point3" aria-pressed="false">Point at it on the page</button></div>' +
      '<p class="ws-help" id="ws-target3"></p><p class="ws-msg" id="ws-folder-msg"></p>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-lshare">Share it</button></div><div class="ws-msg" id="ws-lshare-msg"></div>' +
      '</div>';
  }
  function folderState() {
    var el = rendered && $('#ws-folder-state');
    if (!el) return;
    chatShow();
    var box = $('#ws-note') || $('#ws-chat-box');
    if (box && !box.value) box.value = readKey(FOLDER_NOTE_KEY) || '';
    if (names.indexOf('local') === -1) { el.innerHTML = '<p class="ws-help">It’s off. <button type="button" class="ws-link" id="ws-lon">Turn it on</button></p>'; return; }
    if (errors.local) { el.innerHTML = '<p class="ws-err">' + esc(errors.local) + '</p><p class="ws-help">Send the error to the coding agent, or run npm test in the folder.</p>'; return; }
    var slot = el.querySelector('[data-slot="local"]');
    if (!slot) { el.innerHTML = '<div class="ws-chg-slot" data-slot="local"></div>'; slot = el.firstChild; }
    updateChanges(slot, 'local');
  }
  function folderMsg(text) { var el = $('#ws-folder-msg'); if (el) el.textContent = text; if (text) say(text, true); }
  function sendNote() {
    var box = $('#ws-note'), text = box.value.trim();
    if (!text) { folderMsg('Write what’s wrong first.'); box.focus(); return; }
    var done = wait($('#ws-send'), 'Adding the note…');
    var pointed = target && target.from === '#ws-point3' ? target : null;
    var note = { text: text + (errors.local ? '\n\nThe panel shows this error: ' + errors.local : ''), page: LOCAL.bridge ? location.href : here(), pointedAt: pointed ? pointed.html : '', pointedAtLabel: pointed ? pointed.label : '' };
    localFetch(LOCAL.feedback, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) }).then(function (r) {
      if (!r.ok) throw new Error();
      done();
      msg('');
      box.value = '';
      writeKey(FOLDER_NOTE_KEY, null);
      if (pointed) { target = null; renderTarget(); }
      folderMsg('Added to the bottom of feedback.md. Ask the coding agent to read it.');
    }).catch(function () { done(); msg(''); folderMsg('Couldn’t add it. Is npm run dev still running in the folder?'); });
  }
  // On another site the panel's extension carries requests to the folder, since Chrome asks before a
  // public page can reach this computer. In the folder's own store they're ordinary requests.
  function localFetch(url, init) {
    if (!LOCAL.bridge) return fetch(url, init);
    var id = 'rb-' + Math.random();
    return new Promise(function (done, fail) {
      function answer(e) {
        if (e.source !== window || !e.data || e.data.rbAnswer !== id) return;
        removeEventListener('message', answer);
        clearTimeout(timer);
        if (e.data.status) done(new Response(e.data.body, { status: e.data.status }));
        else fail(new Error('the folder isn’t answering'));
      }
      // Opencode can take a while to start the first time.
      var timer = setTimeout(function () { removeEventListener('message', answer); fail(new Error('the folder isn’t answering')); }, 90000);
      addEventListener('message', answer);
      window.postMessage({ rbAsk: id, path: url, method: (init && init.method) || 'GET', body: (init && init.body) || null }, location.origin);
    });
  }

  // The chat with opencode in the folder (starter/tools/agent.mjs). The conversation lives in the
  // folder's server, so it's still here after the page reloads for a new adapter.js.
  var CHAT_SAID = 'redbird:chat-said', CHAT_FOCUS = 'redbird:chat-focus';
  var chat = { messages: [], busy: false, doing: '' }, chatDrawn = [], chatTimer = null, reloadLater = false, chatStarted = 0, sending = false, chatMissed = 0;
  function chatRead() {
    clearTimeout(chatTimer);
    return localFetch(LOCAL.chat, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (s) {
      chatMissed = 0;
      var replies = (s.messages || []).filter(function (m) { return m.who === 'opencode'; }).length;
      // The folder can answer before opencode has picked up the message that was just sent.
      var justSent = !s.busy && Date.now() - chatStarted < 8000 && replies <= chat.repliesBefore;
      var was = chat.busy;
      chat = { messages: s.messages || [], busy: !!s.busy || justSent || sending, doing: s.doing || '', repliesBefore: chat.repliesBefore };
      if (!chat.busy && reloadLater) { reloadLater = false; reloadNow(); return; }
      chatShow();
      chatSpeak(was);
      if (chat.busy || s.starting) chatTimer = setTimeout(chatRead, 1200);
    }).catch(function () {
      // One missed answer doesn't mean the folder has gone. Opencode may still be working.
      if (chat.busy && ++chatMissed < 6) { chatTimer = setTimeout(chatRead, 2000); return; }
      chat.busy = false; chatShow(); folderMsg('Couldn’t reach your folder. Is npm run dev still running?');
    });
  }
  function chatShow() {
    var log = rendered && $('#ws-chat-log');
    if (!log) return;
    var box = $('#ws-chat-box'), added = false;
    // Only what changed is redrawn, so someone reading the conversation doesn't lose their place.
    chat.messages.forEach(function (m, i) {
      var html = '<span class="ws-who">' + (m.who === 'you' ? 'You' : 'Opencode') + '</span><span class="ws-said">' + esc(m.text) + '</span>' +
        (m.error ? '<span class="ws-err">' + esc(m.error) + '</span>' : '');
      if (chatDrawn[i] === html) return;
      chatDrawn[i] = html;
      var li = log.children[i];
      if (!li) { li = log.appendChild(document.createElement('li')); added = true; }
      li.innerHTML = html;
    });
    while (log.children.length > chat.messages.length) log.lastElementChild.remove();
    chatDrawn.length = chat.messages.length;
    log.hidden = !chat.messages.length;
    if (added) log.lastElementChild.scrollIntoView({ block: 'nearest' });
    $('#ws-chat-status').textContent = chat.busy ? (chat.doing || 'Working') + '…' : '';
    var stop = $('#ws-chat-stop');
    if (!chat.busy && root.activeElement === stop) box.focus(); // Stop is about to hide, with the focus on it
    stop.hidden = !chat.busy;
    if (readKey(CHAT_FOCUS)) { writeKey(CHAT_FOCUS, null); box.focus(); }
  }
  // Reads each finished reply aloud once, including one that finished just before a reload.
  function chatSpeak(wasBusy) {
    if (chat.busy) return;
    var replies = chat.messages.filter(function (m) { return m.who === 'opencode'; }), said = readKey(CHAT_SAID);
    // On a site the panel hasn't been on yet, the conversation so far has been said already.
    if (said != null && replies.length > Number(said)) {
      var last = replies[replies.length - 1];
      say(last.text + (last.error ? ' ' + last.error : ''), true);
    } else if (wasBusy) say('Opencode stopped without a reply.', true);
    writeKey(CHAT_SAID, String(replies.length));
  }
  function sendChat() {
    var box = $('#ws-chat-box'), text = box.value.trim();
    if (!text) { folderMsg('Write what should change first.'); box.focus(); return; }
    if (chat.busy) { folderMsg('Opencode is still working on your last message.'); return; }
    var pointed = target && target.from === '#ws-point3' ? target : null;
    var note = { text: text, url: location.href, snapshot: snapshot(document.body, 40000), error: errors.local || '',
      pointedAt: pointed ? pointed.html : '', pointedAtLabel: pointed ? pointed.label : '' };
    chat.busy = sending = true;
    chat.repliesBefore = chat.messages.filter(function (m) { return m.who === 'opencode'; }).length;
    writeKey(CHAT_SAID, String(chat.repliesBefore));
    chatShow();
    folderMsg('');
    localFetch(LOCAL.chat, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) }).then(function (r) {
      sending = false;
      if (!r.ok) throw new Error();
      box.value = '';
      writeKey(FOLDER_NOTE_KEY, null);
      if (pointed) { target = null; renderTarget(); }
      chatStarted = Date.now();
      say('Sent. Opencode is working.', true);
      chatRead();
    }).catch(function () { sending = chat.busy = false; chatShow(); folderMsg('Couldn’t send it. Is npm run dev still running in the folder?'); });
  }
  function stopChat() {
    localFetch(LOCAL.chat + '/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(chatRead, function () {});
  }
  // A new adapter.js loads with the page. While opencode is still working, that waits until it's
  // done, so the page doesn't reload under someone reading or typing, and they end up back in the box.
  function reloadNow() {
    var el = rendered && root.activeElement;
    if (el && el.closest('#ws-folder')) writeKey(CHAT_FOCUS, '1');
    location.reload();
  }
  function reloadForAdapter() {
    if (chat.busy) reloadLater = true;
    else reloadNow();
  }

  // A share link for the live store, carrying adapter.js and the toolkit adapters fix.json names.
  function shareLocal() {
    Promise.all([
      localFetch(LOCAL.adapter, { cache: 'no-store' }).then(function (r) { return r.text(); }),
      localFetch(LOCAL.fix, { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return {}; }),
    ]).then(function (r) {
      var fx = r[1] || {};
      share({ name: kebab(fx.name || 'my-adapter'), need: fx.need || '', description: fx.need || '', md: '', code: r[0],
        adapters: (fx.toolkitAdapters || []).filter(function (a) { return a && ADAPTERS[a.id] && a.id !== 'mine'; }).concat({ id: 'mine', settings: {} }) }, '#ws-lshare-msg');
    }).catch(function () { $('#ws-lshare-msg').textContent = 'Couldn’t read the folder. Is npm run dev still running?'; });
  }

  function codeBox(extra) {
    return '<details class="ws-more" id="ws-code-box"' + (openCode ? ' open' : '') + '><summary>The code</summary>' +
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
      var t = esc(titleOf(f));
      return '<li class="ws-sk"><p><span class="ws-name">' + t + '</span> <span class="ws-tag">' + kind + '</span>' + (on ? ' <span class="ws-tag">on</span>' : '') +
          (f.from === 'shared' ? ' <span class="ws-tag">shared with you</span>' : '') + '</p>' +
        '<div class="ws-row">' + (on ? '' : '<button type="button" class="ws-link" data-fon="' + i + '" aria-label="Turn on ' + t + '">Turn on</button>') +
          '<button type="button" class="ws-link" data-fshare="' + i + '" aria-label="Share ' + t + '">Share</button>' +
          (!myProfile() ? '' : myFixes().some(function (x) { return x.name === f.name; })
            ? '<button type="button" class="ws-link" data-fmeout="' + i + '" aria-label="Take ' + t + ' out of my profile">Take out of my profile</button>'
            : '<button type="button" class="ws-link" data-fme="' + i + '" aria-label="Add ' + t + ' to my profile">Add to my profile</button>') + '</div>' +
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
      html = '<h3 class="ws-h">Someone shared a fix</h3><p class="ws-help">' + esc(titleOf(f)) + '</p>';
      html += f.code
        ? '<p class="ws-help">It has code they wrote, which runs only if you press Run it.</p>' +
          '<details class="ws-more"><summary>See their code</summary><pre class="ws-pre" tabindex="0">' + esc(f.code) + '</pre></details>' +
          '<div class="ws-row"><button type="button" class="ws-btn" id="ws-in-run">Run it</button></div>'
        : '<p class="ws-help">It’s on, and saved under Saved fixes.</p>';
    }
    el.innerHTML = '<div class="ws-card ws-incard">' + html + '<button type="button" class="ws-link" id="ws-in-close">Close</button></div>';
  }

  // Pointing at the part of the page the change is about. Its markup goes to the AI with the request.
  // It can start from step 2 (a new fix) or from "What should change next?" (the next version).
  var target = (result && result.target) || null, picking = false, pickBox = null, pickFrom = '#ws-point';
  function startPick(e) {
    if (picking) return stopPick('Stopped pointing.');
    picking = true;
    pickFrom = '#' + ((e && e.currentTarget && e.currentTarget.id) || 'ws-point');
    var b = $(pickFrom);
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
    var b = $(pickFrom);
    if (!b) return msg && status(msg);
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
  // Each Point button, the box it fills in, and where it says what it's pointing at.
  var POINT = { '#ws-point': ['#ws-need', '#ws-target'], '#ws-point2': ['#ws-fb', '#ws-target2'], '#ws-point3': [LOCAL && LOCAL.chat ? '#ws-chat-box' : '#ws-note', '#ws-target3'] };
  function setTarget(el) {
    stopPick();
    target = { html: snapshot(el, 3000), label: describe(el), from: pickFrom, issues: window.RB_ISSUES_AT ? window.RB_ISSUES_AT(el) : [] };
    renderTarget();
    status('Pointing at ' + target.label + '.');
    var box = $(POINT[pickFrom][0]);
    if (box) box.focus();
  }
  function renderTarget() {
    Object.keys(POINT).forEach(function (k) {
      var el = $(POINT[k][1]), mine = target && (target.from || '#ws-point') === k;
      if (el) el.innerHTML = mine ? 'Pointing at ' + esc(cut(target.label, 60)) + ' <button type="button" class="ws-link" data-untarget aria-label="Stop pointing at ' + esc(cut(target.label, 60)) + '">×</button>' : '';
    });
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
    if (p) {
      p.value = readKey(PERSON_KEY) || (currentProfile ? currentProfile.freeText || '' : '');
      p.oninput = function () { writeKey(PERSON_KEY, p.value.trim() || null); renderFor(); };
      need.value = readKey(NEED_KEY) || '';
      need.oninput = function () {
        writeKey(NEED_KEY, need.value.trim() || null);
        if (!need.value.trim()) { starterIssue = 0; writeKey('redbird:starter-issue', null); }
      };
      $('#ws-build').onclick = build;
      $('#ws-askgo').onclick = askProfile;
      $('#ws-ideasgo').onclick = suggest;
      $('#ws-point').onclick = startPick;
      $('#ws-for-edit').onclick = function () {
        var box = $('#ws-for-box'), open = box.hidden;
        box.hidden = !open;
        this.setAttribute('aria-expanded', String(open));
        if (open) p.focus();
      };
    }
    // The page reloads for every new version, and each time adapter.js is saved, so half-written
    // notes are kept until they're sent.
    pane.addEventListener('input', function (e) {
      if (e.target.id === 'ws-fb') writeKey(FB_KEY, e.target.value || null);
      if (e.target.id === 'ws-note' || e.target.id === 'ws-chat-box') writeKey(FOLDER_NOTE_KEY, e.target.value || null);
    });
    pane.addEventListener('click', function (e) { if (e.target.closest('#ws-point2, #ws-point3')) startPick({ currentTarget: e.target.closest('button') }); });
    pane.addEventListener('keydown', function (e) { if (e.target.id === 'ws-chat-box' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendChat(); } });
    pane.addEventListener('toggle', function (e) {
      if (e.target.id === 'ws-code-box' && e.target.open && $('#ws-code')) $('#ws-code').focus();
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
        msg('Saved. It’s under Saved fixes, where you can share it.');
      } else if (id === 'ws-change') change($('#ws-fb').value.trim(), '');
      else if (t.hasAttribute('data-ver')) goBack(+t.getAttribute('data-ver'));
      else if (id === 'ws-dl') downloadFolder(result);
      else if (id === 'ws-send') sendNote();
      else if (id === 'ws-chat-send') sendChat();
      else if (id === 'ws-chat-stop') stopChat();
      else if (id === 'ws-lshare') shareLocal();
      else if (id === 'ws-lon') toggle('local', true);
      else if (id === 'ws-close') {
        // A new fix starts with an empty box; the last one stays on the page until something else is turned on.
        result = null; keep(DRAFT_KEY, null); writeKey(NEED_KEY, null); writeKey('redbird:starter-issue', null); starterIssue = 0;
        need.value = ''; target = null; renderTarget(); renderResult(); renderStarters(); msg(''); need.focus();
      }
      else if (id === 'ws-repair') change('', errors.mine || mineWarn);
      else if (id === 'ws-runmine') {
        var code = $('#ws-code').value;
        if (result) { result = nextResult(Object.assign({}, result, { code: code }), 'You changed the code by hand.'); keep(DRAFT_KEY, result); }
        install(code, 'Saved your code and ran it.', result ? idsOf(result) : names.indexOf('mine') === -1 ? names.concat('mine') : names);
      } else if (t.hasAttribute('data-untarget')) { target = null; renderTarget(); (t.closest('.ws-card') ? $('#ws-fb') || $('#ws-note') || $('#ws-chat-box') : need).focus(); }
      else if (t.hasAttribute('data-ready')) useReady(READY[+t.getAttribute('data-ready')]);
      else if (t.hasAttribute('data-idea')) { need.value = t.textContent; writeKey(NEED_KEY, need.value); need.focus(); }
      else if (t.hasAttribute('data-starter')) {
        need.value = t.textContent.replace(/[“”]/g, '');
        writeKey(NEED_KEY, need.value);
        starterIssue = Number(t.getAttribute('data-starter')) || 0;
        writeKey('redbird:starter-issue', starterIssue || null);
        need.focus();
      }
      else if (t.hasAttribute('data-fon')) {
        f = list[+t.getAttribute('data-fon')];
        result = f;
        keep(DRAFT_KEY, result);
        if (f.code) return install(f.code, 'Turned it on.', idsOf(f));
        if (!applySet(idsOf(f), settingsOf(f.adapters))) msg('Turned it on.');
      } else if (t.hasAttribute('data-fshare')) { i = +t.getAttribute('data-fshare'); share(list[i], '#ws-f' + i); }
      else if (t.hasAttribute('data-fme') || t.hasAttribute('data-fmeout')) {
        var add = t.hasAttribute('data-fme'), fx = list[+t.getAttribute(add ? 'data-fme' : 'data-fmeout')], me = myProfile();
        me.fixes = (me.fixes || []).filter(function (x) { return x.name !== fx.name && (!add || !fx.code || !x.code); });
        if (add) me.fixes.push({ name: fx.name, adapters: fx.adapters, code: fx.code || null });
        localStorage.setItem(ME_KEY, JSON.stringify(me));
        renderSaved();
        msg(add ? 'It’s in your profile now, and turns on whenever you shop as My profile.' : 'It’s out of your profile.');
      }
      else if (id === 'ws-fdel-this') {
        keep(SKILLS_KEY, list.filter(function (x) { return x.name !== result.name; }));
        renderSaved();
        renderResult();
        msg('Deleted it from Saved fixes. It’s still on this page until you start a new fix.');
      } else if (id === 'ws-in-run') {
        f = incoming.fix;
        saveFix(f);
        result = f;
        keep(DRAFT_KEY, result);
        install(f.code, 'Their fix is on now.', idsOf(f));
      } else if (id === 'ws-in-close') { incoming = null; $('#ws-in').innerHTML = ''; need.focus(); }
    });
    renderTarget();
    renderFor();
    renderStarters();
    renderResult();
    renderSaved();
    renderReady();
    renderIncoming();
    folderState();
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
  if (panelOn || testing) {
    Track.start();
    // Your adapter's own error messages (it logs them as "my adapter: …") show on its card.
    var warn0 = console.warn;
    console.warn = function (first, e) {
      try { if (/^my adapter/i.test(String(first))) { mineWarn = String((e && e.message) || e || first); fixState(); } } catch (x) {}
      return warn0.apply(console, arguments);
    };
  }
  var started = Promise.all([profile, incomingReady]).then(function (r) {
    var prof = r[0];
    currentProfile = prof;
    baseOptions = { profile: prof || null, today: window.RB ? RB.today() : new Date(), rewrite: rewrite, fallback: storeFallback };
    if (panelOn) panel();
    if (testing) {
      beforeAll = new WeakMap();
      document.querySelectorAll('body *').forEach(function (el) { beforeAll.set(el, snap(el)); });
    }
    names.forEach(turnOn);
    if (panelOn) checkVersion();
    connectToolkit();
    // Load the shoppers' adapters in the background, so switching between them doesn't wait on the network.
    if (panelOn) setTimeout(function () {
      var all = [];
      Object.keys(PEOPLE).map(setOf).concat(Object.keys(PRESET_ADAPTERS).map(function (k) { return PRESET_ADAPTERS[k]; })).forEach(function (set) {
        set.forEach(function (n) { if (all.indexOf(n) === -1 && n !== 'toolkit-fixes' && n !== 'mine') all.push(n); });
      });
      all.forEach(function (n) { ensure(n).catch(function () {}); });
    }, 2500);
  });

  // Saving adapter.js in the starter folder runs it again on a fresh page.
  // Browsers keep only a few connections open to one address, so only a visible tab with the
  // folder's adapter on listens. A tab that comes back checks whether the file changed meanwhile.
  var events = null, checking = null;
  function checkFile() {
    if (document.hidden || localCode == null) return;
    localFetch(LOCAL.adapter + '?at=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : localCode; })
      .then(function (code) { if (code !== localCode) reloadForAdapter(); }, function () {});
  }
  function listen() {
    if (!LOCAL || names.indexOf('local') === -1) return;
    // A real website has no open connection to the folder, so it asks every second and a half.
    if (LOCAL.bridge) { checking = checking || setInterval(checkFile, 1500); return; }
    if (!LOCAL.events || !window.EventSource) return;
    if (document.hidden) { if (events) { events.close(); events = null; } return; }
    if (events) return;
    events = new EventSource(LOCAL.events);
    events.onmessage = function (e) { if (e.data === 'adapter.js') reloadForAdapter(); };
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !events && names.indexOf('local') !== -1) checkFile();
    listen();
  });
  listen();
  if (LOCAL && LOCAL.chat) chatRead();

  // ── The toolkit connection ────────────────────────────────────────────────
  // workshop/toolkit.js connects this tab to the person's toolkit as Redbird demo. It gets this
  // bridge to the panel's own switches, so turning an adapter on from the developer console (or a
  // coding agent) is the same as ticking it here, and the panel always shows the truth.
  var RB_VERSION = '1.0.0';
  var toolkitLink = null, toolkitStatus = { state: toolkitConfig ? 'connecting' : 'off' };
  var RELOADING = ['toolkit-fixes', 'mine', 'local'];
  // Reload once the answer has gone back to the caller; a reload any sooner cuts it off.
  var answered = null;
  function reloadAfterAnswer() {
    var gone = false, go = function () { if (!gone) { gone = true; location.reload(); } };
    if (answered) { answered(go); setTimeout(go, 5000); } else setTimeout(go, 400);
  }
  function toolkitBridge() {
    return {
      version: RB_VERSION,
      local: !!LOCAL,
      has: function (n) { return n === 'local' ? !!LOCAL : !!ADAPTERS[n]; },
      info: function (n) { var a = ADAPTERS[n] || {}; return { help: a.help || '', who: a.who || '', ai: !!a.ai }; },
      isOn: function (n) { return names.indexOf(n) !== -1 && !errors[n]; },
      error: function (n) { return errors[n] || null; },
      changes: function (n) { return count(n); },
      code: function (n) {
        if (n === 'mine') return copied.then(myCode);
        if (n === 'local' && LOCAL) return localFetch(LOCAL.adapter, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
        return Promise.resolve(null);
      },
      // toolkit.js hands over a way to wait until the next answer has reached the toolkit.
      afterAnswer: function (wait) { answered = wait; },
      // Not something to learn about the person: the developer is driving.
      turn: function (n, on, parameters) {
        if (on) {
          if (parameters && Object.keys(parameters).length) skillSettings[n] = parameters;
          else delete skillSettings[n];
        }
        if (!on && RELOADING.indexOf(n) !== -1) {
          // These come off with a reload. Answer the caller first, then reload.
          var i = names.indexOf(n);
          if (i !== -1) { names.splice(i, 1); saveNames(); }
          reloadAfterAnswer();
          return Promise.resolve();
        }
        var was = learning, done;
        learning = false;
        try { done = toggle(n, on); } finally { learning = was; }
        return Promise.resolve(done).then(function () { return enabling[n]; }).then(function () {
          if (on && errors[n]) throw new Error(errors[n]);
        });
      },
    };
  }
  // The person's toolkit profile, followed live. The toolkit says when the profile changes or another
  // preset is selected; the profile is read again and the adapters that are on start again with it.
  // The adapters stay as they are (the developer turned them on), and the page doesn't reload.
  var profileWatch = null, seenRevision = null, followTimer = 0;
  // The preset whose adapters this page last turned on, so a reload keeps what the developer
  // turned on since, and another preset being selected turns on its own set.
  var PRESET_KEY = 'redbird:toolkit-preset';
  function presetChanged() { return profileName === 'toolkit' && !!toolkitSelected && readKey(PRESET_KEY) !== toolkitSelected.id; }
  function presetOptions() {
    if (!rendered) return;
    var sel = $('#ws-prof'), at = sel && sel.querySelector('option[value="toolkit"]');
    if (!at) return;
    var old = sel.querySelector('#ws-presets');
    if (old) old.remove();
    if (!toolkitPresets.length) return;
    var group = document.createElement('optgroup');
    group.id = 'ws-presets';
    group.label = 'Saved on your toolkit';
    toolkitPresets.forEach(function (p) {
      var o = document.createElement('option');
      o.value = 'preset:' + p.id;
      o.textContent = p.name + (p.description ? ' (' + p.description + ')' : '');
      group.appendChild(o);
    });
    at.after(group);
  }
  function loadPresets() {
    if (!toolkitConfig) return Promise.resolve();
    return import(base + 'toolkit.js').then(function (m) { return m.listPresets(toolkitConfig); })
      .then(function (list) { toolkitPresets = list; presetOptions(); }, function () { /* an older toolkit has none to offer */ });
  }
  // Picking a preset changes the toolkit's profile, for every app on the account. Redbird then
  // follows it the way it follows a change made in the console.
  function choosePreset(id) {
    var preset = toolkitPresets.filter(function (p) { return p.id === id; })[0];
    status('Loading ' + (preset ? preset.name : 'that profile') + ' into your toolkit…');
    return import(base + 'toolkit.js').then(function (m) { return m.selectPreset(toolkitConfig, id); }).then(function (done) {
      toolkitSelected = done.selected;
      seenRevision = done.revision; // the toolkit's announcement of this is the same change
      presetOptions();
      if (profileName !== 'toolkit') { $('#ws-prof').value = 'toolkit'; return switchProfile('toolkit'); }
      $('#ws-prof').value = 'toolkit';
      followToolkitProfile();
    }, function (e) {
      $('#ws-prof').value = profileName || 'me';
      status('Couldn’t load that profile into your toolkit: ' + ((e && e.message) || e) + '.');
    });
  }
  function relabelToolkit() {
    if (!rendered) return;
    var opt = $('#ws-prof option[value="toolkit"]');
    if (opt) opt.textContent = toolkitName();
    presetOptions();
    if (profileName === 'toolkit') fillProfiles();
  }
  function followToolkitProfile() {
    clearTimeout(followTimer);
    followTimer = setTimeout(function () {
      if (profileName !== 'toolkit') return relabelToolkit();
      if (presetChanged()) { relabelToolkit(); return switchProfile('toolkit'); }
      loadProfile('toolkit').then(function (prof) {
        if (!prof || profileName !== 'toolkit') return;
        currentProfile = prof;
        baseOptions.profile = prof;
        names.slice().forEach(function (n) { if (RELOADING.indexOf(n) === -1) { turnOff(n); turnOn(n); } });
        if (!rendered) return;
        relabelToolkit();
        renderOnList();
        var p = $('#ws-person');
        if (p && !readKey(PERSON_KEY)) p.value = prof.freeText || '';
        renderFor();
        status('Your toolkit profile changed' + (toolkitSelected ? ' to ' + toolkitSelected.name : '') + '. This page is using the new one.');
      });
    }, 150);
  }
  function watchToolkitProfile() {
    if (!toolkitConfig || !isTop || testing || profileWatch || document.hidden) return;
    import(base + 'toolkit.js').then(function (m) {
      if (profileWatch || document.hidden) return;
      loadPresets();
      profileWatch = m.watchProfile(toolkitConfig, function (state) {
        toolkitSelected = state.selected || null;
        var first = seenRevision === null, changed = state.revision !== seenRevision;
        seenRevision = state.revision;
        // The first event is the state this page already read; after a gap (a hidden tab, a lost
        // connection) a different revision means something changed meanwhile.
        if (presetChanged() || (changed && !first)) followToolkitProfile(); else relabelToolkit();
      });
    }, function () { /* connectToolkit says what's wrong */ });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (profileWatch) { profileWatch.close(); profileWatch = null; } } else watchToolkitProfile();
  });
  function connectToolkit() {
    watchToolkitProfile();
    if (!toolkitConfig || !isTop || testing) return;
    import(base + 'toolkit.js').then(function (m) {
      return m.connect(toolkitConfig, toolkitBridge(), function (st) {
        var was = toolkitStatus.state;
        toolkitStatus = st;
        toolkitCard();
        if (rendered && st.state !== was && (st.state === 'connected' || st.state === 'failed')) {
          status(st.state === 'connected' ? 'Connected to your toolkit. This store is under Apps in your developer console, as Redbird demo.' : 'Couldn’t connect to your toolkit: ' + (st.message || 'unknown problem') + '.');
        }
      });
    }).then(function (link) { toolkitLink = link; }, function (e) {
      toolkitStatus = { state: 'failed', message: 'couldn’t load the toolkit’s SDK from ' + toolkitConfig.url + ' (' + ((e && e.message) || e) + '). Is the toolkit running, and does it allow this page’s address (start it with npm run dev:workshop)?' };
      toolkitCard();
    });
  }
  function toolkitCard() {
    var el = rendered && $('#ws-toolkit');
    if (!el) return;
    if (!toolkitConfig) {
      el.innerHTML = '<details><summary class="ws-h">Connect to your toolkit</summary>' +
        '<p class="ws-help">Shows this store in your developer console as Redbird demo, and lets you shop as your toolkit profile. The easy way: sign in to the developer console and press Open Redbird on its Apps page.</p>' +
        '<label class="ws-lab" for="ws-tk-url">Toolkit address</label><input id="ws-tk-url" class="ws-input" value="http://localhost:8080" spellcheck="false">' +
        '<label class="ws-lab" for="ws-tk-token">Your default token</label><input id="ws-tk-token" class="ws-input" type="password" autocomplete="off" placeholder="aat_…">' +
        '<div class="ws-row"><button type="button" class="ws-btn" id="ws-tk-connect">Connect</button></div><p class="ws-msg" id="ws-tk-msg" role="status"></p></details>';
      return;
    }
    var st = toolkitStatus.state;
    var text = st === 'connected' ? 'Connected. This tab is under Apps in your developer console, as Redbird demo.'
      : st === 'connecting' ? 'Connecting to your toolkit…'
      : st === 'reconnecting' ? 'Lost the connection to your toolkit. Trying again…'
      : st === 'failed' ? 'Couldn’t connect: ' + (toolkitStatus.message || 'unknown problem') + '. If your token changed, disconnect and connect again with the new one.'
      : 'Not connected.';
    var fromFolder = !!(LOCAL && LOCAL.toolkit);
    el.innerHTML = '<h3 class="ws-h">Your toolkit</h3><p class="' + (st === 'failed' ? 'ws-err' : 'ws-help') + '">' + esc(text) + '</p>' +
      '<p class="ws-help">' + esc(toolkitConfig.url) + (fromFolder ? ' (set by your folder’s TOOLKIT_URL and TOOLKIT_TOKEN)' : '') + '</p>' +
      (fromFolder ? '' : '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-tk-disconnect">Disconnect</button></div>');
  }
  function toolkitClick(e) {
    if (e.target.closest('#ws-tk-reload')) return switchProfile('toolkit');
    if (e.target.closest('#ws-tk-connect')) {
      var url = ($('#ws-tk-url').value || '').trim().replace(/\/+$/, ''), token = ($('#ws-tk-token').value || '').trim();
      if (!/^https?:\/\//.test(url) || !/^aat_[\w-]+$/.test(token)) {
        $('#ws-tk-msg').textContent = 'Enter the toolkit’s address (like http://localhost:8080) and a token that starts with aat_.';
        return;
      }
      try { localStorage.setItem(TK_KEY, JSON.stringify({ url: url, token: token })); } catch (x) {}
      return go({ profile: 'toolkit' });
    }
    if (e.target.closest('#ws-tk-disconnect')) {
      try { localStorage.removeItem(TK_KEY); } catch (x) {}
      var leave = toolkitLink ? toolkitLink.close() : Promise.resolve();
      return leave.then(function () { go({ profile: profileName === 'toolkit' ? 'me' : profileName || 'me' }); });
    }
  }

  // ── For the starter folder's tests ────────────────────────────────────────
  // tools/test.mjs opens a page with ?rbtest=1 and uses these to see what an adapter did and
  // whether switching it off puts the page back. A change's element gets data-rbtest="<n>", so
  // the test can find it and ask the browser what a screen reader hears there.
  var beforeAll = null; // each element's text and attributes from before any adapter ran
  function testNow(e) {
    if (e.type === 'attr') return e.el.getAttribute(e.attr);
    if (e.type === 'text') return squash(e.el.textContent);
    return null;
  }
  // Whether a change is still on the page. Text is compared with what the element said before any
  // adapter ran, since putting the old words back counts as a new change to the same element.
  function testStill(e) {
    if (e.type === 'removed') return !e.el.isConnected;
    // An empty class or style left where there was none does nothing, so it counts as put back.
    if (e.type === 'attr' && /^(class|style)$/.test(e.attr) && e.before == null && !(e.el.getAttribute(e.attr) || '').trim()) return false;
    if (e.type !== 'text') return live(e);
    if (!e.el.isConnected) return false;
    var now = squash(e.el.textContent), orig = beforeAll && beforeAll.has(e.el) ? beforeAll.get(e.el)['#text'] : null;
    // Left behind when the words the adapter wrote are still there. This holds however the adapter
    // puts the old words back, and whatever the store does to the element by itself in between.
    if (e.wrote != null && e.wrote !== orig) return now === e.wrote;
    // The adapter's change didn't alter the words (e.g., it wrapped a word in a tag): look at the nodes.
    if (orig != null) return now !== orig;
    return e.parts.some(function (p) {
      return p.inPlace ? p.nodes[0].isConnected && p.nodes[0].data !== p.before : p.nodes.some(function (n) { return n.isConnected; });
    });
  }
  // Like a CSS selector, so a coding agent can find it: span.swatch, button#buy.
  function testTag(el) {
    if (!el || el.nodeType !== 1) return 'text';
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : el.classList && el.classList[0] ? '.' + el.classList[0] : '');
  }
  function testRow(e) {
    var at = e.type === 'added' || e.type === 'style' ? e.el.parentElement : e.type === 'removed' ? null : e.el;
    if (at && at.isConnected && at !== document.body && at !== document.documentElement) at.setAttribute('data-rbtest', e.n);
    else at = null;
    return {
      n: e.n, type: e.type, attr: e.attr || '', where: describe(e.el), el: uid(e.el), tag: testTag(e.el), mark: at ? e.n : null,
      before: e.type === 'attr' ? e.before : e.type !== 'text' ? null
        : beforeAll && beforeAll.has(e.el) ? beforeAll.get(e.el)['#text'] : squash(e.parts.map(function (p) { return p.before; }).join(' ')),
      now: testNow(e), inEffect: testStill(e),
    };
  }
  window.RB_TEST = {
    // Waits until the adapter has loaded and its enable() has finished.
    ready: function (name) {
      return started.then(function () {
        if (!loading[name]) throw new Error(name + ' is not turned on');
        return loading[name];
      }).then(function () { return enabling[name]; })
        .then(function () { return new Promise(function (ok) { setTimeout(ok, 800); }); })
        .then(function () { return aiSettled(20000); })
        .then(function () { return { error: errors[name] || null }; }, function (e) { return { error: errors[name] || String((e && e.message) || e) }; });
    },
    changes: function (name) {
      Track.flush(Track.who);
      return Track.list.filter(function (e) { return e.who === name; }).map(testRow);
    },
    // Switches the adapter off in place (the panel would reload instead), then lists the changes
    // still in effect half a second later.
    undo: function (name) {
      var a = adapters[name];
      if (!a) return Promise.resolve({ error: name + ' never loaded', left: [] });
      var err = null;
      Track.undoing = true;
      try { a.disable(); } catch (e) { err = String((e && e.message) || e); }
      return new Promise(function (done) { setTimeout(done, 500); }).then(function () {
        Track.flush(Track.who);
        Track.undoing = false;
        var left = Track.list.filter(function (e) { return e.who === name && testStill(e); });
        return { error: err, left: left.map(testRow) };
      });
    },
    // What the adapters said out loud through a live region, like "Added names to 3 colors".
    heard: function () { return Track.heard.map(function (h) { return { who: h.who, text: h.text }; }); },
  };

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
    '.ws-thread{list-style:none;margin:8px 0!important;padding:0!important;border-left:2px solid #d1d9e0}.ws-thread li{padding:4px 0 4px 10px}' +
    '.ws-who{display:block;font-size:12px;font-weight:600;color:#59636e}.ws-ver .ws-who{color:#1f2328}.ws-checks{display:block;color:#59636e;font-size:12px;margin-top:2px}' +
    '#ws-folder{border-color:#0969da;margin:0 0 12px!important}#ws-folder .ws-lab{margin-top:10px!important}' +
    '#ws-chat-log{max-height:260px;overflow-y:auto}.ws-said{white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.ws-for{margin:0 0 6px!important}.ws-starters li{padding:1px 0}#ws-starters .ws-help{margin-top:6px!important}' +
    '.ws-newfix{position:absolute;top:6px;right:10px}#ws-result .ws-card .ws-h{padding-right:64px}#ws-code-box .ws-lab{margin-top:10px!important}' +
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
