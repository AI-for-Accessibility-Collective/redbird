// The workshop panel: runs adaptations on the store without installing anything, and shows a
// panel for trying them.
//
//   ?try=swatch-names                  one of Redbird's own adaptations, from workshop/adapters/
//   ?try=text-size                     one of the AI for Accessibility Toolkit's built-in adapters
//   ?try=swatch-names,text-size        several at once
//   ?profile=sam                       a workshop shopper (sam, mark, dario or bill), from workshop/profiles/
//   ?profile=toolkit                   your own toolkit profile, once the store is connected to your toolkit
//   ?try=none                          stop running them
//   ?workshop=off                      hide the panel, for AI agent runs (?workshop=on shows it again)
//
// What you pick is remembered in this browser, like ?issues=. Any ?try= link also turns the panel on.
// Every adaptation here is a toolkit web module built on the toolkit's building blocks
// (enable(options, toolkit) and disable()), the same kind of file the toolkit's skill writes and its
// browser extension runs on any website. The blocks and the built-in adapters load from the
// toolkit's repository, pinned to one version. The panel in the bottom-left corner has four tabs:
//   Profiles         who you're shopping as, and their adaptations
//   Adapter Library  every adaptation, each with a switch
//   Build            how to build a fix with the toolkit (its extension's Builder, or a coding agent)
//   Audit            the toolkit's auditors, and what a screen reader hears
// AI (simplifying text, describing photos, naming buttons) goes to your toolkit's /v1/ai once the
// store is connected to it. Without a toolkit it goes to the store's own /api/ai, which holds the
// Gemini key on the live site; elsewhere (for example a copy served by tools/serve.py) the
// adaptations do what they can without AI.
(function () {
  var base = document.currentScript.src.replace(/loader\.js.*$/, '');
  // The toolkit's building blocks, built-in adapters and auditors load straight from its GitHub
  // repo, pinned to one version so the workshop doesn't change under people. Bump the commit to
  // pick up newer ones.
  var TOOLKIT = 'https://cdn.jsdelivr.net/gh/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit@7e62405e6e52ee2a3107b9369f6f8419ffe188f9/';
  var AXE = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';
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
  // A toolkit to connect to: an AI for Accessibility toolkit's address and the person's token.
  // It comes from the developer console's Open Redbird link (after the #, which never reaches a
  // server) or from the form in the Profiles tab. Connected, this tab shows up in the console as
  // Redbird demo, and the person's toolkit profile is one of the profiles to shop as.
  // workshop/toolkit.js does the connecting.
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
    try { var saved = JSON.parse(localStorage.getItem(TK_KEY) || 'null'); return saved && saved.url && saved.token ? saved : null; } catch (e) { return null; }
  })();
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
  // Redbird's own adaptations, in workshop/adapters/: one for each kind of disability the
  // workshop's shoppers have. Redbird is an app with its own adaptations, so these follow the
  // person's toolkit profile, and toolkit.js offers the featured ones to the toolkit under Apps.
  // no-surprise-extras and always-show-buttons are hidden for now: still here, but in no group or profile.
  var EXAMPLES = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level', 'pause-moving-things', 'no-surprise-extras', 'always-show-buttons'];
  var FEATURED = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level', 'pause-moving-things'];
  // The toolkit's built-in adapters (its tools/core-adapters/), the ones its browser extension
  // offers every account under Toolkit.
  var BUILTIN = ['text-size', 'contrast', 'focus-keyboard', 'bigger-targets', 'structure', 'announce-changes',
    'calm-page', 'captions-on', 'names', 'plain-language', 'read-aloud'];
  // help: one line on what it does. who: who it helps. ai: it uses AI.
  var ADAPTERS = {
    'real-arrival-dates': { who: 'Screen reader users, people with memory or attention disabilities, and anyone who wants the real date', help: 'Turns “5–7 business days” into the dates it arrives.' },
    'swatch-names': { who: 'Blind and low-vision shoppers', help: 'Gives the color circles names a screen reader can say, and lets the arrow keys pick one.' },
    'calm-urgency': { who: 'People with anxiety or ADHD', help: 'Labels or hides countdowns and “only 2 left” messages.' },
    'reading-level': { who: 'People with cognitive or reading disabilities', help: 'Rewrites hard product descriptions in short, plain sentences, with a button to show the original.', ai: true },
    'pause-moving-things': { who: 'People with ADHD or anxiety, and people who get dizzy from motion', help: 'The deals bar, the banner and the product rows move by themselves, and the video plays on its own. This stops all of them, but you can still click or scroll through them yourself.' },
    'no-surprise-extras': { who: 'Older adults, and anyone who might buy something they didn’t mean to', help: 'On product pages, the store ticks a paid protection plan and a repeat order for you. This turns both off, with a note saying what it changed.' },
    'always-show-buttons': { who: 'People who can’t easily use a mouse, like keyboard and voice control users', help: 'In search results, “Add to cart” only shows up when the mouse is over a product, so the keyboard can’t reach it. This keeps the buttons showing.' },
    'text-size': { who: 'People with low vision or dyslexia', help: 'Makes the text bigger and gives it more room, as the person’s settings say.' },
    contrast: { who: 'People with low vision or color blindness', help: 'Raises text contrast where the page falls short.' },
    'focus-keyboard': { who: 'Keyboard and switch users', help: 'Shows a strong focus ring, adds a skip link, and keeps the focused control out from under fixed bars.' },
    'bigger-targets': { who: 'People with a tremor or less precise hands', help: 'Makes small buttons and links easier to hit, without moving anything.' },
    structure: { who: 'Screen reader and keyboard users', help: 'Adds the landmarks a page is missing, and an outline of its headings to jump between sections.' },
    'announce-changes': { who: 'Screen reader users', help: 'Reads out changes a screen reader would otherwise miss, like “Added to cart”.' },
    'calm-page': { who: 'People who get dizzy from motion, and people with attention differences', help: 'Stops animations, videos that play by themselves, and carousels that move on their own.' },
    'captions-on': { who: 'Deaf and hard of hearing people', help: 'Turns on the captions videos already have.' },
    names: { who: 'Screen reader and voice control users', help: 'Names buttons, links and fields that have no name, and describes photos that have no description.', ai: true },
    'plain-language': { who: 'People with cognitive or reading disabilities, and people reading in a second language', help: 'Shows long, hard paragraphs in plain language on request, with the original a click away.', ai: true },
    'read-aloud': { who: 'People who find reading hard, or prefer to listen', help: 'Reads the main content, or what you select, out loud, highlighting each word.' },
  };
  // [name, adapters]
  var GROUPS = [
    ['Redbird’s own adaptations', FEATURED],
    ['The toolkit’s built-in adapters', BUILTIN],
  ];
  // Old links and saved settings may name adapters that are gone: those are dropped.
  names = names.filter(function (n, i) { return ADAPTERS[n] && names.indexOf(n) === i; });
  // The workshop's four people, the few adaptations each one gets, and the settings Redbird gives
  // its own adaptations for them. Each set is checked on the store's pages, so picking someone never
  // breaks the page.
  var PEOPLE = {
    sam: ['Sam Saltman, blind', ['names', 'swatch-names', 'real-arrival-dates', 'announce-changes', 'structure']],
    dario: ['Dario Almondei, cognitive disability', ['reading-level', 'calm-urgency', 'pause-moving-things', 'real-arrival-dates'], { 'calm-urgency': { mode: 'hide' } }],
    mark: ['Mark Sugarberg, ADHD and anxiety', ['calm-urgency', 'pause-moving-things', 'real-arrival-dates'], { 'calm-urgency': { mode: 'hide' } }],
    bill: ['Bill Grapes, older adult', ['text-size', 'bigger-targets', 'real-arrival-dates'], { 'bigger-targets': { targetSize: 44 } }],
  };
  // Your toolkit profile turns on what it asks for, as an app follows the profile: a need in
  // fields.needs (one of the toolkit's own, the ones in its blocks/profile-words.js, or one an
  // adapter or app registered as '<app>/<id>') turns on the adaptation that meets it. Redbird's
  // own needs are the ones its adaptations register when the store connects (toolkit.js).
  var MEETS = {
    'text-size': ['textSize', 'lineSpacing', 'letterSpacing', 'toolkit/larger-text'],
    contrast: ['contrast', 'darkTheme', 'toolkit/more-contrast'],
    'focus-keyboard': ['keyboardAccess', 'skipLinks', 'toolkit/keyboard-use'],
    'bigger-targets': ['toolkit/bigger-targets'],
    structure: ['pageStructure', 'repairLandmarks', 'toolkit/page-structure'],
    'announce-changes': ['announceUpdates', 'spaAnnounce', 'toolkit/announce-changes'],
    'calm-page': ['toolkit/calm-page'],
    'captions-on': ['captions', 'toolkit/captions'],
    names: ['labelControls', 'describeImages', 'toolkit/control-names'],
    'plain-language': ['toolkit/plain-language'],
    'read-aloud': ['readAloud', 'toolkit/read-aloud'],
    'swatch-names': ['labelControls', 'describeImages'],
    'reading-level': ['simplify'],
    'pause-moving-things': ['reduceMotion'],
    'real-arrival-dates': ['redbird/real-dates'],
    'calm-urgency': ['redbird/no-pressure'],
  };
  // Two that do the same job fight on the page: Redbird's own, made for this store, wins.
  var CLASH = [['pause-moving-things', 'calm-page'], ['reading-level', 'plain-language']];
  function fromProfile(prof) {
    var fields = (prof && prof.fields) || {}, has = {};
    (fields.needs || []).forEach(function (n) { if (n && n.dimension && n.value !== false && n.value != null) has[n.dimension] = true; });
    var ids = Object.keys(MEETS).filter(function (id) { return MEETS[id].some(function (d) { return has[d]; }); });
    if (fields.largeTargets && ids.indexOf('bigger-targets') === -1) ids.push('bigger-targets');
    if (Number(fields.readingLevel) > 0 && ids.indexOf('reading-level') === -1) ids.push('reading-level');
    CLASH.forEach(function (c) { if (ids.indexOf(c[0]) !== -1) ids = ids.filter(function (n) { return n !== c[1]; }); });
    return ids;
  }
  // The parameters Redbird gives its adaptations for someone: a shopper's own, or from your
  // toolkit profile what it says that no setting carries (large targets).
  function paramsOf(id) {
    if (id === 'toolkit') return currentProfile && currentProfile.fields && currentProfile.fields.largeTargets ? { 'bigger-targets': { targetSize: 44 } } : {};
    return (PEOPLE[id] && PEOPLE[id][2]) || {};
  }
  function isPerson(id) { return (id === 'toolkit' && !!toolkitConfig) || !!PEOPLE[id]; }
  function setOf(id) {
    if (id === 'toolkit') return fromProfile(currentProfile);
    return PEOPLE[id] ? PEOPLE[id][1] : [];
  }
  // The preset the toolkit says is selected (its developer console loaded it), once the toolkit has said.
  var toolkitSelected = null;
  // The presets in the person's toolkit (the developer console's profile library), for the dropdown.
  var toolkitPresets = [];
  function toolkitName() { return 'Your toolkit profile' + (toolkitSelected ? ': ' + toolkitSelected.name + (toolkitSelected.edited ? ' (edited)' : '') : ''); }
  function nameOf(id) { return id === 'toolkit' ? toolkitName() : PEOPLE[id] ? PEOPLE[id][0] : id; }
  // A workshop shopper's profile is a file next to this one.
  function loadProfile(id) {
    // The profile in the person's toolkit, the one the toolkit's extension and developer console edit.
    if (id === 'toolkit') {
      return import(base + 'toolkit.js').then(function (m) { return m.readProfile(toolkitConfig); }).then(function (p) {
        return Object.assign({}, p, { name: toolkitName(), freeText: p.freeText || 'Your profile has no description yet.' });
      }).catch(function (e) { console.warn('[workshop] toolkit profile:', e); return null; });
    }
    return fetch(base + 'profiles/' + id + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  // Connected, your own profile comes first; the made-up shoppers are examples.
  if (!isPerson(profileName)) profileName = toolkitConfig ? 'toolkit' : '';
  var currentProfile = null;
  var profile = profileName ? loadProfile(profileName) : Promise.resolve(null);

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
  function readKey(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function writeKey(key, v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, v); } catch (e) {} }

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
  };
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

  // ── AI and the building blocks ────────────────────────────────────────────
  // Every adaptation gets the toolkit's building blocks as enable()'s second argument, as the
  // toolkit's browser extension gives them: toolkit.session() for every change (disable() ends
  // it, which puts the page back), toolkit.page, toolkit.personal (the person's settings, from
  // the profile you shop as) and toolkit.observe. One set of blocks per adaptation, made the way
  // the blocks say a host makes them: createBlocks({ win, adapter, ai }).
  var aiUrl = new URL('../api/ai', base).href;
  // Leaving the page cancels any AI request still on its way. Those just stop, instead of each
  // failing and filling the console.
  var leaving = false;
  addEventListener('pagehide', function () { leaving = true; });
  addEventListener('beforeunload', function () { leaving = true; });
  var blocksReady = null;
  function blocks() {
    blocksReady = blocksReady || import(TOOLKIT + 'toolkit/blocks/index.js');
    return blocksReady;
  }
  // The blocks' AI: the toolkit's own prompts on your toolkit's /v1/ai, with your token. Without a
  // toolkit, the tasks the store's own /api/ai knows go there instead (it holds the Gemini key on
  // the live site), and the rest get no answer, which the adaptations handle.
  var STORE_TASKS = { simplify: 'simplify', summarize: 'summarize', translate: 'translate', rewrite: 'rewrite', define: 'define', describe: 'describeImage' };
  function askToolkit(name, r) {
    var kind = r.kind === 'vision' ? 'vision' : 'text';
    return fetch(toolkitConfig.url.replace(/\/+$/, '') + '/v1/ai/' + kind, {
      method: 'POST',
      headers: { authorization: 'Bearer ' + toolkitConfig.token, 'content-type': 'application/json' },
      body: JSON.stringify(Object.assign({ task: r.task, input: r.input || '', options: r.options || {}, adapter: 'redbird/' + name }, r.image ? { image: r.image } : {})),
    }).then(function (res) { return res.json().catch(function () { return {}; }).then(function (b) { return res.ok ? b : { text: null, reason: b.error || 'http-' + res.status }; }); });
  }
  function askStore(r) {
    var task = STORE_TASKS[r.task], o = r.options || {};
    if (!task || (task === 'describeImage' && !r.image)) return Promise.resolve({ text: null, reason: 'unavailable' });
    var body = task === 'describeImage' ? { imageData: 'data:' + r.image.mimeType + ';base64,' + r.image.data }
      : task === 'define' ? { word: r.input, context: o.context || '' }
      : task === 'translate' ? { text: r.input, targetLang: o.translateTo || o.language || '' }
      : task === 'rewrite' ? { text: r.input, instructions: [o.instructions, o.readingLevel ? 'Write at reading level ' + o.readingLevel + '.' : ''].filter(Boolean).join(' ') }
      : { text: r.input };
    return fetch(aiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ task: task }, body)) })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (d) { return { text: d && d.result ? d.result : null }; });
  }
  // An answer comes back for the adaptation that asked: the change it leads to is put down to it.
  function aiFor(name) {
    return function (request) {
      return (toolkitConfig ? askToolkit(name, request) : askStore(request))
        .catch(function () { return leaving ? new Promise(function () {}) : { text: null, reason: 'unavailable' }; })
        .then(function (r) { Track.resume(name); return r; });
    };
  }
  // The person's settings, page-wide, for every adaptation's blocks: from the profile you shop as.
  function setPersonal(prof) {
    return blocks().then(function (B) { B.setPersonal(window, prof ? B.personalFromProfile(prof) : {}); });
  }
  var made = {};
  function toolkitFor(name) {
    return blocks().then(function (B) {
      if (made[name]) return made[name];
      var b = B.createBlocks({ win: window, adapter: name, ai: aiFor(name) });
      // Its session is the blocks' own, with every call put down to this adaptation (Track.run),
      // so what it changes later, from a watcher or after an AI answer, is listed under it too.
      // What the extension adds next to the blocks: the adaptation tells the toolkit what the
      // person did with it. Here only while you shop as yourself, never as a made-up shopper.
      return (made[name] = {
        session: function (config) { return traced(name, b.session(config), null, 0); }, page: b.page,
        get personal() { return b.personal; },
        observe: function (o) { return profileName === 'toolkit' ? tell(name, o) : Promise.reject(new Error('not shopping as yourself')); },
        data: { get: noData, set: noData, delete: noData },
      });
    });
  }
  function traced(name, o, owner, depth) {
    var w = typeof o === 'function' ? function () {
      var out = Track.run(name, o, owner, arguments);
      // s.group() gives a session inside the session: traced the same way.
      return out && typeof out === 'object' && typeof out.end === 'function' && typeof out.setAttr === 'function' ? traced(name, out, null, 0) : out;
    } : {};
    Object.keys(o).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(o, k);
      if (d.get) { Object.defineProperty(w, k, { get: function () { return o[k]; }, enumerable: true }); return; }
      var v = d.value, plain = v && typeof v === 'object' && !v.nodeType && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
      w[k] = depth < 2 && (typeof v === 'function' || plain) ? traced(name, v, o, depth + 1) : v;
    });
    return w;
  }
  function noData() { return Promise.reject(new Error('Redbird keeps no values for its adaptations')); }
  // toolkit.observe(text or { text, type, data }), as in the extension: one plain sentence.
  function tell(name, o) {
    if (!toolkitConfig) return Promise.reject(new Error('not connected'));
    var text = typeof o === 'string' ? o : o && o.text;
    var type = o && o.type === 'setting-change' ? 'setting-change' : 'observation';
    return import(base + 'toolkit.js').then(function (m) {
      return m.observe(toolkitConfig, { type: type, origin: location.origin, data: Object.assign({ adapter: name }, (o && o.data) || {}), text: String(text || '').slice(0, 300) });
    });
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
  // The panel's own voice. (The adaptations speak through the blocks' one live region.) Messages
  // that arrive together are read as one, and each stays up for a moment before the next.
  var hushUntil = 0; // while a shopper's adaptations switch on together, the panel doesn't speak for each
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

  // ── Loading adapters ──────────────────────────────────────────────────────
  // Parameters for an adaptation: a shopper's (PEOPLE), or what the toolkit asked for under Apps.
  var params = {};
  function loadModule(name) {
    if (EXAMPLES.indexOf(name) !== -1) return import(base + 'adapters/' + name + '.js');
    var url = TOOLKIT + 'tools/core-adapters/' + name + '.js';
    // One retry, in case the CDN drops the connection (the query makes the browser fetch it again).
    return import(url).catch(function () { return import(url + '?retry=1'); });
  }
  var loading = {}, adapters = {}, errors = {}, enabling = {};
  function ensure(name) {
    loading[name] = loading[name] || Promise.all([loadModule(name), toolkitFor(name)]).then(function (r) {
      var mod = r[0];
      var a = [mod.default].concat(Object.keys(mod).map(function (k) { return mod[k]; })).find(function (v) { return v && typeof v.enable === 'function'; });
      if (!a) throw new Error('no export with an enable() function');
      return (adapters[name] = instrument(name, a));
    });
    return loading[name];
  }
  // What an adaptation gets as options: its parameters, and the store's pinned date for the one
  // that works out arrival dates.
  function optionsFor(name) {
    var o = Object.assign({}, params[name] || {});
    if (name === 'real-arrival-dates' && window.RB) o.today = isoDay(RB.today());
    return o;
  }
  function isoDay(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function turnOn(name) {
    delete errors[name];
    refresh(name, 'Loading…');
    return ensure(name).then(function (a) {
      var fail = function (e) { errors[name] = 'Stopped with an error: ' + ((e && e.message) || e); warn(name)(e); refresh(name); };
      try {
        enabling[name] = Promise.resolve(made[name]).then(function (tk) { return a.enable(optionsFor(name), tk); }).catch(fail);
      } catch (e) { fail(e); }
      refresh(name);
    }, function (e) {
      errors[name] = 'Didn’t load: ' + (e.message || String(e));
      warn(name)(e);
      refresh(name);
    });
  }
  function turnOff(name) {
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
    var done = on ? turnOn(name) : turnOff(name);
    renderOnList();
    return done;
  }
  // Turns on exactly these adaptations, with these parameters: who you shop as changed.
  function applySet(ids, settings) {
    hushUntil = Date.now() + 2500;
    var before = params;
    params = settings || {};
    var off = names.filter(function (n) { return ids.indexOf(n) === -1; });
    learning = false;
    off.forEach(function (n) { toggle(n, false); });
    ids.forEach(function (n) {
      if (names.indexOf(n) === -1) toggle(n, true);
      else if (JSON.stringify(before[n] || {}) !== JSON.stringify(params[n] || {})) { turnOff(n); turnOn(n); }
    });
    learning = true;
    if (rendered) root.querySelectorAll('input[data-ad]').forEach(function (cb) { cb.checked = names.indexOf(cb.getAttribute('data-ad')) !== -1; });
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
  function label(name) { return name; }

  // ── Panel ─────────────────────────────────────────────────────────────────
  // dockW: how wide the sidebar is.
  var ui = { tab: 'profiles', open: true, side: 'left', dockW: 360, highlight: false };
  try { Object.assign(ui, JSON.parse(localStorage.getItem('redbird:panel') || 'null') || ((window.visualViewport ? visualViewport.width : innerWidth) < 640 ? { open: false } : {})); } catch (e) {}
  ui.open = true; // the panel is always there: it sits beside the page, not over it
  if (ui.dockW === 340) ui.dockW = 360; // the old default, too narrow for the tab names
  // ?tab=build (the guide's links): open that tab.
  if (qs.get('tab')) {
    ui.tab = qs.get('tab');
    qs.delete('tab');
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
    // Keys pressed in the panel are for the panel. On a real site they'd otherwise reach the site's
    // shortcuts: on YouTube, typing an m mutes the video, and on GitHub an s jumps to the search box.
    ['keydown', 'keypress', 'keyup'].forEach(function (type) {
      host.addEventListener(type, function (e) { if (!(e.altKey && e.shiftKey)) e.stopPropagation(); });
    });
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
            tab('profiles', 'Profiles') + tab('adapters', 'Adapter Library') + tab('build', 'Build') + tab('audit', 'Audit') +
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
      '</aside><div class="ws-marks" aria-hidden="true"></div>';
    putHost();
    box = root.querySelector('.ws-panel');
    rendered = true;
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

  // Profiles: who you're shopping as, in their own words, and their adaptations as switches you
  // can tap. Your toolkit profile is your own: you make and change it in the toolkit (its browser
  // extension's Profile tab, or the developer console's Profiles page), and the store follows it.
  // The panel also learns: turn one of a shopper's adaptations off, or another one on, and it's
  // remembered for that shopper next time (see LEARN_KEY).
  function profilesHTML() {
    var people = '<optgroup label="Workshop shoppers">' + Object.keys(PEOPLE).map(function (id) { return '<option value="' + id + '">' + PEOPLE[id][0] + '</option>'; }).join('') + '</optgroup>';
    return '<label class="ws-lab" for="ws-prof">Shop as</label>' +
      '<select id="ws-prof" class="ws-select">' + (toolkitConfig ? '<option value="toolkit">' + esc(toolkitName()) + '</option>' : '') + people +
        '<option value="none">Nobody in particular</option></select>' +
      '<div id="ws-persona"></div>' +
      '<div class="ws-line"><h3 class="ws-h">Adaptations on</h3><button type="button" class="ws-link" id="ws-alloff">Turn all off</button></div>' +
      '<ul class="ws-pills" id="ws-pills" aria-label="Adaptations on"></ul>' +
      '<p class="ws-help" id="ws-learned"></p>' +
      '<h3 class="ws-h">What they do on this page</h3>' +
      '<ul class="ws-plain ws-onlist" id="ws-on-list"></ul>' +
      '<div class="ws-card" id="ws-toolkit"></div>';
  }
  function renderOnList() {
    var el = rendered && $('#ws-on-list');
    if (!el) return;
    summary();
    // Just labels, so a stray click can't turn one off. Switches are in the Adapter Library tab.
    var pills = $('#ws-pills');
    pills.innerHTML = names.length ? names.map(function (n) {
      return '<li class="ws-pill" title="' + esc((ADAPTERS[n] || {}).help || '') + '">' + esc(label(n)) + '</li>';
    }).join('') : '<li class="ws-help">No adaptations on yet.</li>';
    var l = profileName ? learned()[learnKey(profileName)] : null, bits = [];
    // Only what matches the page now: a guide link can turn on an adaptation the person turned off.
    var lon = l ? l.on.filter(function (n) { return names.indexOf(n) !== -1; }) : [], loff = l ? l.off.filter(function (n) { return names.indexOf(n) === -1; }) : [];
    if (lon.length) bits.push('keeps ' + lon.map(label).join(', ') + ' on');
    if (loff.length) bits.push('keeps ' + loff.map(label).join(', ') + ' off');
    var whose = !bits.length ? '' : profileName === 'toolkit' ? 'your profile' : nameOf(profileName).split(',')[0];
    $('#ws-learned').innerHTML = bits.length ? 'Learned from you: ' + esc(whose) + ' ' + esc(bits.join(' and ')) + '. <button type="button" class="ws-link" id="ws-forget">Forget this</button>' : '';
    // The person's adaptations stay listed when they're off, so they can be ticked back on. The
    // boxes are the same switches as in the Adapter Library tab, kept in step both ways.
    var listed = (profileName ? setOf(profileName) : []).filter(function (n) { return ADAPTERS[n]; });
    names.forEach(function (n) { if (listed.indexOf(n) === -1) listed.push(n); });
    var had = root.activeElement && root.activeElement.closest && root.activeElement.closest('#ws-on-list') ? root.activeElement.getAttribute('data-ad') : null;
    el.innerHTML = listed.length ? listed.map(function (n) {
      var on = names.indexOf(n) !== -1, what = (ADAPTERS[n] || {}).help || '';
      return '<li><label class="ws-check"><input type="checkbox" data-ad="' + esc(n) + '"' + (on ? ' checked' : '') + '> <span class="ws-name">' + esc(label(n)) + '</span></label>' +
        (what ? '<span class="ws-help ws-block ws-indent">' + esc(what) + '</span>' : '') +
        '<div class="ws-chg-slot ws-indent" data-slot="' + esc(n) + '"></div></li>';
    }).join('') : '<li class="ws-help">' + (profileName === 'toolkit' ? 'Your profile doesn’t ask for any of these yet. Turn some on in the Adapter Library.' : 'Nothing on yet.') + '</li>';
    if (had) { var again = el.querySelector('input[data-ad="' + had + '"]'); if (again) again.focus(); }
    names.forEach(function (n) { refresh(n); });
  }
  // What the panel learned for each person: { sam: { on: [...], off: [...] } }.
  var LEARN_KEY = 'redbird:learned';
  function learnKey(id) { return id; }
  function learned() { try { return JSON.parse(localStorage.getItem(LEARN_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function learnedSet(id) {
    var l = learned()[learnKey(id)] || { on: [], off: [] };
    return setOf(id).filter(function (n) { return l.off.indexOf(n) === -1; }).concat(l.on.filter(function (n) { return setOf(id).indexOf(n) === -1; }));
  }
  var learning = true; // off while the toolkit or a profile switch turns adaptations on: that isn't the person
  function learn(name, on) {
    if (!learning || !profileName) return;
    var all = learned(), key = learnKey(profileName), l = all[key] || { on: [], off: [] }, inSet = setOf(profileName).indexOf(name) !== -1;
    l.on = l.on.filter(function (n) { return n !== name; });
    l.off = l.off.filter(function (n) { return n !== name; });
    if (on && !inSet) l.on.push(name);
    if (!on && inSet) l.off.push(name);
    all[key] = l;
    try { localStorage.setItem(LEARN_KEY, JSON.stringify(all)); } catch (e) {}
    // Shopping as yourself, your toolkit learns from it too. Never from a made-up shopper.
    if (toolkitConfig && profileName === 'toolkit') {
      import(base + 'toolkit.js').then(function (m) {
        return m.observe(toolkitConfig, {
          type: 'setting-change', origin: location.origin, data: { adapter: name, on: on },
          text: (on ? 'Turned on ' : 'Turned off ') + label(name) + ' while shopping on the Redbird store.',
        });
      }).catch(function () { /* learning is extra; the store works without it */ });
    }
  }
  // Adapter Library: every adaptation, Redbird's own and the toolkit's, each with a switch.
  function adaptersHTML() {
    var html = '<h3 class="ws-h">Fix accessibility problems with adaptations</h3>';
    GROUPS.forEach(function (g) {
      var on = g[1].filter(function (n) { return names.indexOf(n) !== -1; }).length;
      html += '<details class="ws-group"' + (on || g === GROUPS[0] ? ' open' : '') + '><summary>' + g[0] +
        ' <span class="ws-gc" data-group="' + esc(g[0]) + '">' + (on ? on + ' on' : '') + '</span></summary>' +
        g[1].map(row).join('') + '</details>';
    });
    return html;
  }
  // Where an adaptation's code is: Redbird's own next to this file, the toolkit's on GitHub.
  function codeUrl(name) {
    return EXAMPLES.indexOf(name) !== -1 ? base + 'adapters/' + name + '.js'
      : TOOLKIT.replace('https://cdn.jsdelivr.net/gh/', 'https://github.com/').replace(/@([0-9a-f]+)\/$/, '/blob/$1/') + 'tools/core-adapters/' + name + '.js';
  }
  function row(name) {
    var info = ADAPTERS[name] || {};
    var on = names.indexOf(name) !== -1;
    return '<div class="ws-ad" data-row="' + name + '"><label class="ws-check"><input type="checkbox" data-ad="' + name + '"' + (on ? ' checked' : '') + '> ' +
      '<span class="ws-name">' + label(name) + '</span>' + (info.ai ? ' <span class="ws-tag">AI</span>' : '') + '</label>' +
      (info.who ? '<p class="ws-help ws-for">For: ' + esc(info.who) + '</p>' : '') +
      '<p class="ws-help">' + esc(info.help) + ' <a href="' + esc(codeUrl(name)) + '" target="_blank" rel="noopener">Read the code<span class="ws-sr"> of ' + esc(name) + ' (opens in a new tab)</span></a></p>' +
      '<div class="ws-state" data-state="' + name + '"></div></div>';
  }
  // Build: fixes are built with the toolkit, and run through its browser extension, here and on
  // any website. The two ways the toolkit offers, and what this store's pages are called.
  function buildHTML() {
    var guide = function (page, text) { return '<a href="' + base + page + '" target="_blank" rel="noopener">' + text + '<span class="ws-sr"> (opens in a new tab)</span></a>'; };
    return '<h3 class="ws-h">Build a fix with the toolkit</h3>' +
      '<p class="ws-help">A fix is an adapter: one file that changes one thing on a page, and puts the page back when it’s turned off. It runs in your own Chrome through the AI for Accessibility extension, on this store and on any other website.</p>' +
      '<h3 class="ws-h">Describe it</h3>' +
      '<p class="ws-help">Open the extension’s sidebar on this page, go to Builder, and say what gets in the way and for whom. The assistant writes the adapter and previews it here with checks. While you try it, more checks run in the background. When it works, add it to your account.</p>' +
      '<h3 class="ws-h">Build it in code</h3>' +
      '<p class="ws-help">Ask a coding agent, such as Claude Code or opencode, with the toolkit’s skill. It asks what you need first, writes the adapter on the toolkit’s building blocks, publishes it to your toolkit, runs it here, and checks it. For this store, the pages it runs on are:</p>' +
      '<p><code class="ws-code">' + esc(location.origin + '/*') + '</code></p>' +
      '<p class="ws-help">Redbird’s own adaptations are written the same way. Each one in the Adapter Library has a link to its code.</p>' +
      '<p class="ws-help">' + guide('build-a-fix.html', 'Build a fix') + ' · ' + guide('keep-building-in-code.html', 'Build it in code') + ' · ' + guide('test-and-share.html', 'Test it and share it') + '</p>' +
      (toolkitConfig ? '' : '<p class="ws-help">Connect the store to your toolkit first, in the Profiles tab.</p>');
  }
  function spotOn() { return !!window.RB_SPOTLIGHT; }
  function auditHTML() {
    return '<h3 class="ws-h">Do a comprehensive audit</h3>' +
      '<p class="ws-help">Finds accessibility problems on this page, like photos with no description.</p>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-run">Run the audit</button></div>' +
      '<div id="ws-res"></div>' +
      '<details class="ws-group"><summary>What a screen reader hears</summary>' +
      '<p class="ws-help">Messages the page reads out, like “Added to cart”.</p>' +
      '<ol class="ws-heard" id="ws-heard"></ol></details>';
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
    $('#ws-prof').value = profileName || 'none';
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
      switchProfile(profileName);
    });
    $('#ws-alloff').onclick = function () {
      var was = names.slice();
      names = [];
      saveNames();
      // Turning everything off is a reset, not something to learn about the person.
      was.forEach(turnOff);
      root.querySelectorAll('input[data-ad]').forEach(function (cb) { cb.checked = false; });
      renderOnList();
    };
    root.addEventListener('change', function (e) {
      var cb = e.target;
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
    $('#ws-res').addEventListener('click', function (e) {
      var b = e.target.closest('[data-found]');
      if (b) locateEl(found[Number(b.getAttribute('data-found'))], b.textContent);
    });
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
  // Changes who you're shopping as without a reload: their profile is read, the person's settings
  // reach every adaptation's blocks, adaptations that were on start again with them, and their set
  // of adaptations is turned on. Only when the store's problems aren't all on (after an agent link)
  // does it reload, to put them back.
  function switchProfile(id) {
    if (!window.RB_ISSUES || RB_ISSUES.value !== 'on') return go({ profile: id || 'none', try: 'none', issues: 'on' });
    return (id === 'none' || !id ? Promise.resolve(null) : loadProfile(id))
      .then(function (prof) {
        profileName = id === 'none' ? '' : id;
        currentProfile = prof;
        try { localStorage.setItem('redbird:profile', id || 'none'); } catch (e) {}
        if (profileName === 'toolkit') writeKey(FOLLOW_KEY, asked());
        qs.set('profile', id || 'none');
        var ids = profileName ? learnedSet(profileName) : [];
        return setPersonal(prof).then(function () {
          var again = names.filter(function (n) { return ids.indexOf(n) !== -1; });
          applySet(ids, paramsOf(profileName));
          again.forEach(function (n) { turnOff(n); turnOn(n); });
          fillProfiles();
          renderOnList();
          var on = names.length + ' adaptation' + (names.length === 1 ? '' : 's') + ' on.';
          status(!prof ? 'Shopping as nobody in particular. ' + on : 'Shopping as ' + nameOf(profileName) + '. ' + on);
        });
      }, function () { go({ profile: id || 'none', try: 'none', issues: 'on' }); });
  }
  function fillProfiles() {
    if (profileName === 'toolkit') {
      $('#ws-persona').innerHTML = currentProfile
        ? '<figure class="ws-persona"><figcaption>' + esc(toolkitName()) + '</figcaption><blockquote>“' + esc(currentProfile.freeText || '') + '”</blockquote></figure>' +
          '<p class="ws-help">This is your own profile. Change it in the AI for Accessibility extension’s Profile tab, or on the Profiles page of your developer console. This page follows along; there is nothing to reload. <button type="button" class="ws-link" id="ws-tk-reload">Read it again</button> if it ever looks out of date.</p>'
        : '<p class="ws-err">Couldn’t read your toolkit profile. Check the connection below.</p>';
      return;
    }
    $('#ws-persona').innerHTML = currentProfile
      ? '<figure class="ws-persona"><figcaption>' + esc(nameOf(profileName)) + '</figcaption><blockquote>“' + esc(currentProfile.freeText || '') + '”</blockquote></figure>' +
        '<p class="ws-help">A made-up shopper: their profile is only a guess about what someone like them needs.</p>'
      : '<p class="ws-help">' + (toolkitConfig ? 'Pick someone to shop as, or Your toolkit profile to shop as yourself.' : 'Pick someone to shop as. To shop as yourself, connect the store to your toolkit below.') + '</p>';
  }
  function summary() {
    GROUPS.forEach(function (g) {
      var n = g[1].filter(function (x) { return names.indexOf(x) !== -1; }).length;
      var el = root.querySelector('[data-group="' + g[0] + '"]');
      if (el) el.textContent = n ? n + ' on' : '';
    });
  }
  // The line under an adaptation's switch: loading, or an error; then a list of its changes that
  // opens in place.
  function refresh(name, text) {
    if (!rendered) return;
    summary();
    root.querySelectorAll('[data-slot="' + name + '"]').forEach(function (slot) { updateChanges(slot, name); });
    var el = root.querySelector('[data-state="' + name + '"]');
    if (!el) return;
    var on = names.indexOf(name) !== -1, line = '';
    if (on && errors[name]) line = '<p class="ws-err">' + esc(errors[name]) + '</p>';
    else if (on && text) line = '<p class="ws-note">' + esc(text) + '</p>';
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
  var QUIET = ['read-aloud', 'announce-changes', 'captions-on'];
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

  // ── Start ─────────────────────────────────────────────────────────────────
  if (panelOn) Track.start();
  // The adaptations your toolkit profile asked for when this browser last followed it. When the
  // profile asks for others (it changed while the store was closed, or just now), those go on;
  // otherwise what you turned on or off since stays as it is.
  var FOLLOW_KEY = 'redbird:toolkit-set';
  function asked() { return JSON.stringify(fromProfile(currentProfile)); }
  var started = profile.then(function (prof) {
    currentProfile = prof;
    params = paramsOf(profileName);
    if (profileName === 'toolkit' && prof && !qs.has('try') && readKey(FOLLOW_KEY) !== asked()) {
      writeKey(FOLLOW_KEY, asked());
      names = learnedSet('toolkit');
      saveNames();
    }
    // A link that names a shopper and no adaptations turns on that shopper's, as picking them does.
    if (PEOPLE[profileName] && qs.has('profile') && !qs.has('try')) {
      names = learnedSet(profileName);
      saveNames();
    }
    return setPersonal(prof).catch(warn('the toolkit’s building blocks'));
  }).then(function () {
    if (panelOn) panel();
    names.forEach(turnOn);
    connectToolkit();
    // Load the shoppers' adaptations in the background, so switching between them doesn't wait on the network.
    if (panelOn) setTimeout(function () {
      var all = [];
      Object.keys(PEOPLE).map(setOf).forEach(function (set) { set.forEach(function (n) { if (all.indexOf(n) === -1) all.push(n); }); });
      all.forEach(function (n) { loadModule(n).catch(function () {}); });
    }, 2500);
  });

  // ── The toolkit connection ────────────────────────────────────────────────
  // workshop/toolkit.js connects this tab to the person's toolkit as Redbird demo, the app whose
  // adaptations are Redbird's own. It gets this bridge to the panel's own switches, so turning an
  // adaptation on from the developer console (or a coding agent) is the same as ticking it here,
  // and the panel always shows the truth.
  var RB_VERSION = '1.1.0';
  var toolkitLink = null, toolkitStatus = { state: toolkitConfig ? 'connecting' : 'off' };
  function toolkitBridge() {
    return {
      version: RB_VERSION,
      has: function (n) { return !!ADAPTERS[n]; },
      info: function (n) { var a = ADAPTERS[n] || {}; return { help: a.help || '', who: a.who || '', ai: !!a.ai }; },
      isOn: function (n) { return names.indexOf(n) !== -1 && !errors[n]; },
      // The parameters it is on with, as the panel has them.
      parameters: function (n) { return names.indexOf(n) !== -1 ? Object.assign({}, params[n] || {}) : null; },
      error: function (n) { return errors[n] || null; },
      changes: function (n) { return count(n); },
      // Not something to learn about the person: the developer is driving.
      turn: function (n, on, parameters) {
        var before = JSON.stringify(params[n] || {});
        if (on) {
          if (parameters && Object.keys(parameters).length) params[n] = parameters;
          else delete params[n];
        }
        var was = learning, done;
        learning = false;
        try {
          if (on && names.indexOf(n) !== -1 && before !== JSON.stringify(params[n] || {})) { turnOff(n); done = turnOn(n); }
          else done = toggle(n, on);
        } finally { learning = was; }
        return Promise.resolve(done).then(function () { return enabling[n]; }).then(function () {
          if (on && errors[n]) throw new Error(errors[n]);
        });
      },
    };
  }
  // The person's toolkit profile, followed live. The toolkit says when the profile changes or another
  // preset is selected; the profile is read again, the person's settings reach the blocks, and the
  // adaptations that are on start again with them. When the profile now asks for other adaptations,
  // those go on. The page doesn't reload.
  var profileWatch = null, seenRevision = null, followTimer = 0;
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
      $('#ws-prof').value = 'toolkit';
      if (profileName !== 'toolkit') return switchProfile('toolkit');
      followToolkitProfile();
    }, function (e) {
      $('#ws-prof').value = profileName || 'none';
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
      loadProfile('toolkit').then(function (prof) {
        if (!prof || profileName !== 'toolkit') return;
        currentProfile = prof;
        relabelToolkit();
        if (readKey(FOLLOW_KEY) !== asked()) {
          writeKey(FOLLOW_KEY, asked());
          return switchProfile('toolkit').then(function () {
            status('Your toolkit profile changed' + (toolkitSelected ? ' to ' + toolkitSelected.name : '') + '. This page turned on what it asks for.');
          });
        }
        return setPersonal(prof).then(function () {
          names.slice().forEach(function (n) { turnOff(n); turnOn(n); });
          if (!rendered) return;
          renderOnList();
          status('Your toolkit profile changed' + (toolkitSelected ? ' to ' + toolkitSelected.name : '') + '. This page is using the new one.');
        });
      });
    }, 150);
  }
  function watchToolkitProfile() {
    if (!toolkitConfig || !isTop || profileWatch || document.hidden) return;
    import(base + 'toolkit.js').then(function (m) {
      if (profileWatch || document.hidden) return;
      loadPresets();
      profileWatch = m.watchProfile(toolkitConfig, function (state) {
        toolkitSelected = state.selected || null;
        var first = seenRevision === null, changed = state.revision !== seenRevision;
        seenRevision = state.revision;
        // The first event is the state this page already read; after a gap (a hidden tab, a lost
        // connection) a different revision means something changed meanwhile.
        if (changed && !first) followToolkitProfile(); else relabelToolkit();
      });
    }, function () { /* connectToolkit says what's wrong */ });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (profileWatch) { profileWatch.close(); profileWatch = null; } } else watchToolkitProfile();
  });
  function connectToolkit() {
    watchToolkitProfile();
    if (!toolkitConfig || !isTop) return;
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
    el.innerHTML = '<h3 class="ws-h">Your toolkit</h3><p class="' + (st === 'failed' ? 'ws-err' : 'ws-help') + '">' + esc(text) + '</p>' +
      '<p class="ws-help">' + esc(toolkitConfig.url) + '</p>' +
      '<div class="ws-row"><button type="button" class="ws-btn ws-quiet" id="ws-tk-disconnect">Disconnect</button></div>';
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
      return leave.then(function () { go({ profile: profileName === 'toolkit' ? 'none' : profileName || 'none' }); });
    }
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  function runChecks() {
    var res = $('#ws-res');
    res.innerHTML = '<p class="ws-help">Checking…</p>';
    var mods = ['missing-alt', 'missing-labels', 'missing-captions', 'missing-landmarks', 'poor-contrast', 'wcag-issues'];
    Promise.all([loadScript(AXE, 'axe')].concat(mods.map(function (m) { return import(TOOLKIT + 'tools/auditors/' + m + '.js'); }))).then(function (r) {
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
    '.ws-top{display:flex;align-items:center;gap:4px;padding:4px;border-bottom:1px solid #d1d9e0}' +
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
    '.ws-for{color:#1f2328}.ws-ad .ws-for + .ws-help{margin-top:0}' +
    '.ws-pane > :first-child{margin-top:0!important}' +
    '.ws-toggle{display:flex;align-items:center;gap:8px;cursor:pointer}' +
    '.ws-toggle input{appearance:none;-webkit-appearance:none;flex:none;position:relative;width:30px;height:18px;margin:0;border-radius:9px;background:#d1d9e0;cursor:pointer;transition:background .15s}' +
    '.ws-toggle input::before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(31,35,40,.3);transition:left .15s}' +
    '.ws-toggle input:checked{background:#1f883d}.ws-toggle input:checked::before{left:14px}' +
    '.ws-toggle input:focus-visible{outline:2px solid #0969da;outline-offset:2px}' +
    '.ws-card{position:relative}.ws-card .ws-h{padding-right:28px}' +
    '.ws-h + .ws-plain{margin-top:4px!important}.ws-card .ws-h{margin-top:0!important}' +
    '.ws-main{display:flex;flex-direction:column;min-height:0}' +
    '.ws-tabs{display:flex;flex-wrap:wrap;column-gap:8px;padding:0 12px;border-bottom:1px solid #d1d9e0}' +
    '.ws-tab{all:unset;cursor:pointer;white-space:nowrap;padding:8px 2px;color:#59636e;border-bottom:2px solid transparent;margin-bottom:-1px}' +
    '.ws-tab:hover{color:#1f2328}.ws-tab[aria-selected=true]{color:#1f2328;font-weight:600;border-bottom-color:#fd8c73}' +
    '.ws-scroll{overflow:auto;padding:12px 16px 4px;min-height:0;flex:1}' +
    '.ws-pane > * + *{margin-top:8px}' +
    'select{flex:1;min-width:0;padding:4px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328}' +
    '.ws-help,.ws-note{color:#59636e;font-size:12px}.ws-note{color:#9a6700}' +
    '.ws-err{color:#d1242f;font-size:12px}' +
    '.ws-line{display:flex;align-items:baseline;justify-content:space-between;gap:8px}' +
    '.ws-h{font-size:14px;font-weight:600;margin-top:16px!important}.ws-pane > .ws-h:first-child,.ws-pane > #ws-in:empty + .ws-h{margin-top:0!important}' +
    '.ws-link{all:unset;cursor:pointer;color:#0969da;font-size:12px;display:inline-flex;align-items:center;min-height:24px;padding:0 2px}.ws-link:hover{text-decoration:underline}' +
    '.ws-skip{position:absolute;left:8px;top:8px;z-index:2;padding:6px 10px;background:#fff;border:2px solid #0969da;border-radius:6px;color:#0969da}' +
    '.ws-skip:not(:focus){width:1px;height:1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    'summary{min-height:24px;display:list-item}' +
    '.ws-check{min-height:24px}.ws-icon{min-width:28px;min-height:28px;display:inline-flex;align-items:center;justify-content:center}' +
    '.ws-group{border:1px solid #d1d9e0;border-radius:6px;padding:0}.ws-group + .ws-group{margin-top:8px}' +
    '#ws-pane-audit .ws-group{margin-top:16px!important}.ws-group > .ws-help,.ws-group > .ws-heard{margin:8px 12px!important}' +
    '.ws-group > summary{cursor:pointer;font-weight:600;padding:6px 12px;background:#f6f8fa;border-radius:6px}' +
    '.ws-group[open] > summary{border-bottom:1px solid #d1d9e0;border-radius:6px 6px 0 0}' +
    '.ws-gc{display:inline-block;padding:0 6px;margin-left:4px;border-radius:2em;background:rgba(129,139,152,.12);font-weight:500;font-size:12px}.ws-gc:empty{display:none}' +
    '.ws-ad{padding:6px 12px}.ws-ad + .ws-ad{border-top:1px solid #eff2f5}.ws-ad .ws-help{margin-left:24px}.ws-ad .ws-state{margin-left:24px}' +
    '.ws-check{display:flex;gap:8px;align-items:center;cursor:pointer}.ws-check input{width:18px;height:18px;margin:0;accent-color:#0969da}' +
    '.ws-name{font-weight:600}p.ws-name{margin-left:0}' +
    '.ws-tag{display:inline-block;padding:0 7px;border-radius:2em;border:1px solid #d1d9e0;color:#59636e;font-size:12px;font-weight:500;line-height:18px}' +
    '.ws-btn{padding:3px 12px;border-radius:6px;border:1px solid rgba(31,35,40,.15);background:#1f883d;color:#fff;font-weight:500;cursor:pointer}' +
    '.ws-btn:hover{background:#1a7f37}.ws-btn.ws-quiet{background:#f6f8fa;color:#1f2328;border-color:#d1d9e0}.ws-btn.ws-quiet:hover{background:#eff2f5}' +
    '.ws-btn:disabled{opacity:.6;cursor:default}' +
    '.ws-lab{display:block;font-weight:600;margin-top:12px!important}.ws-lab + .ws-input{margin-top:4px}' +
    '.ws-input{display:block;width:100%;padding:5px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328;resize:vertical}' +
    '.ws-input:focus{background:#fff}' +
    '.ws-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:8px!important}' +
    '.ws-msg{color:#59636e;font-size:12px;margin-top:6px!important}.ws-msg:empty{display:none}' +
    '.ws-card{margin-top:10px!important;padding:8px 12px 10px;border:1px solid #d1d9e0;border-radius:6px}.ws-card > .ws-lab:first-child{margin-top:0!important}' +
    '.ws-who{display:block;font-size:12px;font-weight:600;color:#59636e}' +
    '.ws-for{margin:0 0 6px!important}' +
    '.ws-code{display:block;padding:4px 8px;background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}' +
    '.ws-plain{list-style:none;margin-top:4px!important}.ws-plain li{padding:3px 0}.ws-block{display:block}' +
    '.ws-pre{max-height:240px;overflow:auto;margin:6px 0 0;padding:8px;background:#f6f8fa;border:1px solid #d1d9e0;border-radius:6px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}' +
    '.ws-sk{padding:8px 0;border-bottom:1px solid #eff2f5}.ws-sk .ws-row{margin-top:2px!important}' +
    '.ws-codearea{display:block;width:100%;height:320px;margin:6px 0 0;padding:8px;border-radius:6px;border:1px solid #d1d9e0;' +
      'font:12px/1.45 ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;color:#1f2328;background:#f6f8fa;resize:vertical}' +
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
