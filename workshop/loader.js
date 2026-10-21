// Runs adapters on the store without installing the extension, and shows a panel for trying them.
//
//   ?try=swatch-names                  a workshop example from workshop/adapters/
//   ?try=motion-reducer                an adapter from the AI for Accessibility Toolkit itself
//   ?try=toolkit-fixes                 the toolkit's automatic fixes (alt text, labels, contrast, ...)
//   ?try=swatch-names,motion-reducer   several at once
//   ?profile=sam                       a workshop person, from workshop/profiles/sam.json
//   ?profile=lowVision                 one of the toolkit's own profiles (its tools/profiles/settings.json)
//   ?try=mine                          your own adapter, typed into the panel (saved in this browser)
//   ?try=none                          stop running them
//   ?workshop=off                      hide the panel, for AI agent runs (?workshop=on shows it again)
//
// What you pick is remembered in this browser, like ?issues=. Any ?try= link also turns the panel on.
// The panel in the bottom-left corner has three tabs:
//   Setup    every profile and every adapter, each with a switch (the other store settings are on workshop/controls)
//   Changes  what each adapter changed, before and after, and what a screen reader hears
//   Checks   the toolkit's auditors, and the spotlight that points out the planted problems
// AI tasks (rewriting text, describing images, naming buttons) go to the store's own /api/ai,
// which holds the Gemini key on the server. Without it (for example on a copy served by
// tools/serve.py), adapters fall back to what they can do without AI.
(function () {
  var base = document.currentScript.src.replace(/loader\.js.*$/, '');
  // The toolkit's adapters load straight from its GitHub repo, pinned to one version so the
  // workshop doesn't change under people. Bump the commit to pick up newer adapters.
  var TOOLKIT = 'https://cdn.jsdelivr.net/gh/AI-for-Accessibility-Collective/AI-for-Accessibility-Toolkit@a17a48483ef4c3e736273119b1e9b607aea9900d/tools/';
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
      if (v) { if (isTop) localStorage.setItem('redbird:workshop', v); }
      else v = localStorage.getItem('redbird:workshop');
    } catch (e) {}
    return v !== 'off' && isTop;
  })();
  if (!names.length && !panelOn) return;

  // ── What the panel offers ─────────────────────────────────────────────────
  var EXAMPLES = ['real-arrival-dates', 'swatch-names', 'calm-urgency', 'reading-level'];
  // help: one line on what it does. ai: it uses /api/ai. opts: extra options for enable().
  // arg: what enable() takes instead of the options object.
  var ADAPTERS = {
    'real-arrival-dates': { help: 'Turns “2 business days” into the day it arrives.' },
    'swatch-names': { help: 'Gives the color swatches names a screen reader can say.' },
    'calm-urgency': { help: 'Labels or hides countdowns and “only 2 left” pressure.' },
    'reading-level': { help: 'Rewrites product descriptions at the profile’s reading level.', ai: true },
    mine: { help: 'The adapter you write in the first-adapter guide.' },
    'toolkit-fixes': { help: 'Finds problems with axe-core and fixes them: photo descriptions, button and field names, contrast, page structure.', ai: true },
    'live-region-announcer': { help: 'Reads out updates like “Added to cart” that a screen reader would miss.' },
    'skip-links': { help: 'Adds “Skip to main content” as the first thing you reach with Tab.' },
    'page-outline': { help: 'Adds a list of the page’s headings to jump between.' },
    'spa-focus': { help: 'Announces the new page when content changes without a reload.' },
    'language-tag': { help: 'Marks text in another language so it’s pronounced right.' },
    'describe-on-demand': { help: 'Press Alt+D to hear a description of whatever has focus.', ai: true },
    'focus-locator': { help: 'Draws a strong ring around whatever has keyboard focus.' },
    'link-highlighter': { help: 'Underlines links and makes them stand out.' },
    'visual-assist': { help: 'Bigger text, more space between lines, a clearer focus ring.' },
    magnifier: { help: 'A lens that enlarges the text under the pointer.' },
    'reflow-column': { help: 'Puts the page in one column, so zooming in doesn’t scroll sideways.' },
    'unpin-sticky': { help: 'Stops the header and bars from sticking to the screen.' },
    'persistent-hover': { help: 'Keeps pop-up hints open until you press Escape.' },
    'dark-mode': { help: 'Turns the page dark.' },
    'color-blind': { help: 'Shifts colors so red and green are easier to tell apart.', arg: 'deuteranopia' },
    'reduce-brightness': { help: 'Dims the page and mutes its colors.' },
    'explore-a-chart': { help: 'Turns charts into tables you can read. This store has no charts.', ai: true },
    'math-a11y': { help: 'Gives equations a name a screen reader can say. This store has no math.' },
    'reading-ruler': { help: 'A band that follows the pointer and dims the lines around it.' },
    'bionic-reading': { help: 'Bolds the start of each word.' },
    'reader-mode': { help: 'Shows just the main text in a plain view.' },
    'simplify-text': { help: 'Rewrites long paragraphs in plainer words.', ai: true },
    'define-words': { help: 'Hover or focus a hard word to get a short definition.', ai: true },
    'abbreviation-expand': { help: 'Spells out abbreviations like “PD” and “MSRP”.' },
    'translate-page': { help: 'Translates the page into Spanish.', ai: true, opts: { targetLang: 'Spanish' } },
    'read-aloud': { help: 'Reads the page out loud. Switch it off to stop.' },
    'reading-spot': { help: 'Remembers how far down you read and offers to jump back.' },
    'focus-mode': { help: 'Dims ads and pop-ups and shows how far down the page you are.' },
    'motion-reducer': { help: 'Stops animations, the moving ticker and autoplaying video.' },
    'stop-auto-advance': { help: 'Pauses carousels and anything else that moves on its own.' },
    'dismiss-overlays': { help: 'Closes cookie banners, sign-up pop-ups and promo bars.' },
    'mute-sounds': { help: 'Mutes all audio and video.' },
    'flash-guard': { help: 'Dims videos and GIFs that could flash.' },
    'confirm-actions': { help: 'Asks for a second click before paying, deleting or sending.' },
    'show-captions': { help: 'Turns on captions for videos that have them.' },
    'auto-transcriber': { help: 'Adds caption controls to videos.' },
    'sound-visualizer': { help: 'Shows a sign on screen whenever the page plays sound.' },
    'keyboard-nav': { help: 'Keyboard shortcuts and a clearer path through the page with Tab.' },
    'big-targets': { help: 'Makes small buttons and links bigger and easier to hit.' },
    'voice-commands': { help: 'Control the page by voice. Asks to use the microphone.' },
  };
  // [name, unused, adapters]
  var GROUPS = [
    ['Workshop examples', '', EXAMPLES.concat('mine')],
    ['Fix the whole page', '', ['toolkit-fixes']],
    ['Screen readers', '', ['live-region-announcer', 'skip-links', 'page-outline',
      'spa-focus', 'language-tag', 'describe-on-demand', 'explore-a-chart', 'math-a11y']],
    ['Low vision and color', '', ['visual-assist', 'magnifier', 'focus-locator', 'link-highlighter',
      'reflow-column', 'unpin-sticky', 'persistent-hover', 'dark-mode', 'color-blind', 'reduce-brightness']],
    ['Reading', '', ['reading-ruler', 'bionic-reading', 'reader-mode', 'simplify-text', 'define-words',
      'abbreviation-expand', 'translate-page', 'read-aloud', 'reading-spot']],
    ['Attention and anxiety', '', ['focus-mode', 'motion-reducer', 'stop-auto-advance',
      'dismiss-overlays', 'mute-sounds', 'flash-guard', 'confirm-actions']],
    ['Hearing', '', ['show-captions', 'auto-transcriber', 'sound-visualizer']],
    ['Keyboard and motor', '', ['keyboard-nav', 'big-targets', 'voice-commands']],
  ];
  // The workshop's three people, and the adapters each one gets on the side-by-side page.
  var PEOPLE = {
    sam: ['Sam Saltman, blind', ['toolkit-fixes', 'swatch-names', 'real-arrival-dates', 'live-region-announcer', 'skip-links']],
    mark: ['Mark Sugarberg, ADHD and anxiety', ['calm-urgency', 'motion-reducer', 'stop-auto-advance', 'real-arrival-dates']],
    dario: ['Dario Almondei, dyslexia', ['reading-level', 'abbreviation-expand', 'real-arrival-dates']],
  };
  // The toolkit's profiles name settings, not adapters. This is the adapter each setting turns on.
  // Voice commands stay off here, so picking a profile never asks for the microphone.
  var SETTING = {
    autoWcagFix: 'toolkit-fixes', autoFixLabels: 'toolkit-fixes', autoDescribe: 'toolkit-fixes', fixContrast: 'toolkit-fixes', fixLandmarks: 'toolkit-fixes',
    announceUpdates: 'live-region-announcer', describeOnDemand: 'describe-on-demand', languageTag: 'language-tag', exploreChart: 'explore-a-chart',
    spaFocus: 'spa-focus', skipLinks: 'skip-links', mathAccessible: 'math-a11y',
    fontScale: 'visual-assist', lineHeight: 'visual-assist', letterSpacing: 'visual-assist', largeCursor: 'visual-assist', enhanceFocus: 'visual-assist',
    highlightLinks: 'link-highlighter', unpinSticky: 'unpin-sticky', magnifier: 'magnifier', reflowColumn: 'reflow-column', focusLocator: 'focus-locator',
    persistentHover: 'persistent-hover', showCaptions: 'show-captions', autoCaptions: 'show-captions', soundVisualizer: 'sound-visualizer',
    keyboardNav: 'keyboard-nav', dismissOverlays: 'dismiss-overlays', bigTargets: 'big-targets', pageOutline: 'page-outline',
    stopAutoAdvance: 'stop-auto-advance', confirmActions: 'confirm-actions', focusMode: 'focus-mode', hideDistractions: 'focus-mode',
    showProgress: 'focus-mode', bionicReading: 'bionic-reading', readingRuler: 'reading-ruler', autoSimplify: 'simplify-text',
    defineWords: 'define-words', rememberSpot: 'reading-spot', expandAbbreviations: 'abbreviation-expand', motionReducer: 'motion-reducer',
    muteSounds: 'mute-sounds', reduceBrightness: 'reduce-brightness', darkMode: 'dark-mode', flashGuard: 'flash-guard',
  };
  var settingsReady = null;
  function toolkitProfiles() {
    settingsReady = settingsReady || fetch(TOOLKIT + 'profiles/settings.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return (d && d.profiles) || {}; })
      .catch(function () { return {}; });
    return settingsReady;
  }
  function bundleFor(id, all) {
    if (PEOPLE[id]) return PEOPLE[id][1];
    var p = all[id], out = [];
    if (p) Object.keys(p.tools).forEach(function (k) { var a = SETTING[k]; if (p.tools[k] && a && out.indexOf(a) === -1) out.push(a); });
    return out;
  }
  var profile = !profileName ? Promise.resolve(null)
    : PEOPLE[profileName] ? fetch(base + 'profiles/' + profileName + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    : toolkitProfiles().then(function (all) {
      var p = all[profileName];
      return p ? { name: p.name, description: p.description, tools: p.tools, toolkit: true } : null;
    });

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
  function say(text) {
    var live = document.getElementById('ws-live');
    if (!live) {
      live = Object.assign(document.createElement('div'), { id: 'ws-live' });
      live.setAttribute('aria-live', 'polite');
      live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
      document.body.appendChild(live);
    }
    live.textContent = text;
  }

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
            audit.findEmptyAltImages().forEach(function (img) {
              var job = function () { return alt.generateImageAlt(img); };
              job.el = img; job.kind = 'photo descriptions'; job.why = 'Large photo with an empty description';
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
  function myCode() {
    var saved = null;
    try { saved = localStorage.getItem(MY_KEY); } catch (e) {}
    return saved ? Promise.resolve(saved) : fetch(base + 'adapters/_template.js').then(function (r) { return r.text(); });
  }
  // ?from=swatch-names copies that example into "your adapter" so you can change it.
  var from = qs.get('from');
  var copied = !from ? Promise.resolve() : fetch(base + 'adapters/' + from + '.js').then(function (r) { return r.ok ? r.text() : null; }).then(function (code) {
    if (code) { try { localStorage.setItem(MY_KEY, code); } catch (e) {} }
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
          done = Array.prototype.filter.call(document.querySelectorAll('main p, main li'), function (el) {
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
  function optionsFor(name) {
    var info = ADAPTERS[name] || {};
    if (info.arg) return info.arg;
    var o = Object.assign({}, baseOptions, info.opts || {});
    if (name === 'visual-assist') Object.assign(o, visualSettings());
    return o;
  }
  // A toolkit profile's text settings go to visual-assist; without one it gets a middle setting.
  function visualSettings() {
    var t = currentProfile && currentProfile.tools;
    if (!t) return { fontScale: 1.25, lineHeight: 1.8, enhanceFocus: true };
    var o = {};
    ['fontScale', 'lineHeight', 'letterSpacing', 'largeCursor', 'enhanceFocus'].forEach(function (k) { if (t[k] != null && t[k] !== false) o[k] = t[k]; });
    return o;
  }
  function turnOn(name) {
    delete errors[name];
    refresh(name, 'Loading…');
    return ensure(name).then(function (a) {
      try { Promise.resolve(a.enable(optionsFor(name))).catch(warn(name)); } catch (e) { warn(name)(e); }
      refresh(name);
    }, function (e) {
      errors[name] = e.message || String(e);
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
    if (on) turnOn(name); else turnOff(name);
  }
  function go(changes) {
    Object.keys(changes).forEach(function (k) { qs.set(k, changes[k]); });
    location.search = qs.toString();
  }

  if (panelOn) Track.start();
  profile.then(function (prof) {
    currentProfile = prof;
    baseOptions = { profile: prof && !prof.toolkit ? prof : null, today: window.RB ? RB.today() : new Date(), rewrite: rewrite, fallback: storeFallback };
    if (panelOn) panel();
    names.forEach(turnOn);
  });

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
  function label(name) { return name === 'mine' ? 'your adapter' : name; }

  // ── Panel ─────────────────────────────────────────────────────────────────
  var ui = { tab: 'setup', open: true, side: 'left' };
  try { Object.assign(ui, JSON.parse(localStorage.getItem('redbird:panel') || 'null') || ((window.visualViewport ? visualViewport.width : innerWidth) < 640 ? { open: false } : {})); } catch (e) {}
  function saveUi() { try { localStorage.setItem('redbird:panel', JSON.stringify(ui)); } catch (e) {} }
  // On a wide screen the open panel docks to the side like browser developer tools, and the store
  // moves over to make room, so the panel never covers what an adapter changed. It only docks when
  // the store still fits beside it: planted issue 15 makes the store at least 1280 px wide, and
  // docking then would push the store into a sideways scroll. Otherwise it floats in the corner.
  var dockStyle = null;
  function dock() {
    if (!dockStyle) {
      dockStyle = document.createElement('style');
      dockStyle.textContent = 'html.ws-dock-left{padding-left:340px!important}html.ws-dock-right{padding-right:340px!important}' +
        'html.ws-dock-wide.ws-dock-left{padding-left:540px!important}html.ws-dock-wide.ws-dock-right{padding-right:540px!important}';
      document.head.appendChild(dockStyle);
    }
    var need = (parseFloat(getComputedStyle(document.body).minWidth) || 0) || 900;
    var on = ui.open && innerWidth - (box.classList.contains('ws-wide') ? 540 : 340) >= need && !!host.isConnected;
    document.documentElement.classList.toggle('ws-dock-left', on && ui.side === 'left');
    document.documentElement.classList.toggle('ws-dock-right', on && ui.side === 'right');
    document.documentElement.classList.toggle('ws-dock-wide', on && box.classList.contains('ws-wide'));
    if (on) box.setAttribute('data-dock', ''); else box.removeAttribute('data-dock');
    place();
    if (marks.outline || marks.flash) queueMarks();
  }
  // A floating panel sits in the corner of what you can see. When the store is wider than the
  // screen (issue 15 on a phone), the browser stretches the area fixed things are placed in, and a
  // plain bottom: 12px would put the panel far below the screen.
  function place() {
    var vv = window.visualViewport;
    if (!box || box.hasAttribute('data-dock') || !vv) { if (box) box.removeAttribute('style'); return; }
    var w = ui.open ? Math.min(box.classList.contains('ws-wide') ? 600 : 360, vv.width - 24) : Math.min(box.offsetWidth, vv.width - 24);
    if (ui.open) box.style.width = w + 'px'; else box.style.width = '';
    box.style.maxHeight = Math.round(vv.height * 0.62) + 'px';
    box.style.right = box.style.bottom = 'auto';
    box.style.left = Math.round(ui.side === 'right' ? vv.offsetLeft + vv.width - w - 12 : vv.offsetLeft + 12) + 'px';
    box.style.top = Math.round(vv.offsetTop + vv.height - box.offsetHeight - 12) + 'px';
  }
  var host, root, box, rendered = false;
  var filterWho = '', expanded = {}, lastCounts = {}, found = [];

  function panel() {
    // A shadow root keeps the panel out of the page's own DOM: adapters that watch, reword or
    // announce the page never see it, and the store's styles never reach it.
    host = document.createElement('div');
    host.id = 'ws-root';
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style>' +
      '<section class="ws-panel" aria-label="Workshop panel" data-side="' + ui.side + '">' +
        '<div class="ws-top"><button type="button" class="ws-head" aria-expanded="' + ui.open + '">' +
          '<span class="ws-title">Workshop</span> <span class="ws-sub" id="ws-sub"></span></button>' +
        '<button type="button" class="ws-icon" id="ws-side"></button>' +
        '<button type="button" class="ws-icon ws-fold" id="ws-fold"></button></div>' +
        '<div class="ws-main"' + (ui.open ? '' : ' hidden') + '>' +
          '<div class="ws-tabs" role="tablist" aria-label="Workshop panel">' +
            tab('setup', 'Setup') + tab('changes', 'Changes <span class="ws-count" id="ws-count"></span>') + tab('checks', 'Checks') +
          '</div>' +
          '<div class="ws-scroll">' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-setup" aria-labelledby="ws-tab-setup">' + setupHTML() + '</div>' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-changes" aria-labelledby="ws-tab-changes">' + changesHTML() + '</div>' +
            '<div role="tabpanel" class="ws-pane" id="ws-pane-checks" aria-labelledby="ws-tab-checks">' + checksHTML() + '</div>' +
          '</div>' +
          '<p class="ws-status" id="ws-status" role="status"></p>' +
          '<p class="ws-foot"><a href="' + base + '" target="_blank" rel="noopener">Guides<span class="ws-sr"> (opens in a new tab)</span></a> · ' +
            '<a href="' + base + 'controls" target="_blank" rel="noopener">Store controls<span class="ws-sr"> (opens in a new tab)</span></a></p>' +
        '</div>' +
      '</section><div class="ws-marks" aria-hidden="true"></div>';
    document.body.appendChild(host);
    box = root.querySelector('.ws-panel');
    rendered = true;
    wire();
    showTab(ui.tab, false);
    box.classList.toggle('ws-closed', !ui.open);
    foldButton();
    sideButton();
    dock();
    toolkitProfiles().then(fillProfiles);
    names.forEach(function (n) { refresh(n); });
    summary();
  }
  function tab(id, text) {
    return '<button type="button" role="tab" class="ws-tab" id="ws-tab-' + id + '" aria-controls="ws-pane-' + id + '">' + text + '</button>';
  }
  function $(sel) { return root.querySelector(sel); }

  function setupHTML() {
    var people = Object.keys(PEOPLE).map(function (id) { return '<option value="' + id + '">' + PEOPLE[id][0] + '</option>'; }).join('');
    var html =
      '<h3 class="ws-h">Shop as</h3>' +
      '<label class="ws-field"><span class="ws-sr">Shop as</span><select id="ws-prof"><option value="none">Nobody in particular</option>' +
        '<optgroup label="Workshop people">' + people + '</optgroup><optgroup label="Toolkit profiles" id="ws-tkprof"></optgroup></select></label>' +
      '<p class="ws-help" id="ws-prof-note">Picking someone turns on the adapters that help them.</p>' +
      '<div class="ws-line"><h3 class="ws-h">Adapters</h3><button type="button" class="ws-link" id="ws-alloff">Turn all off</button></div>' +
      '<p class="ws-help">Switch one on to see it change the store. The Changes tab shows what it changed.</p>';
    GROUPS.forEach(function (g) {
      var on = g[2].filter(function (n) { return names.indexOf(n) !== -1; }).length;
      html += '<details class="ws-group"' + (on || g === GROUPS[0] ? ' open' : '') + '><summary>' + g[0] +
        ' <span class="ws-gc" data-group="' + esc(g[0]) + '">' + (on ? on + ' on' : '') + '</span></summary>' +
        g[2].map(row).join('') + '</details>';
    });
    html += '<details class="ws-group"><summary>Only in the extension</summary>' +
      '<div class="ws-ad ws-flat"><p class="ws-name">Verification layer</p><p class="ws-help">Checks an AI agent’s work while it shops, and stops to ask you before it does anything you didn’t ask for. ' +
        'It runs in the toolkit’s Chrome extension, next to the browser agent.</p></div>' +
      '<div class="ws-ad ws-flat"><p class="ws-name">agent-watch</p><p class="ws-help">Shows on the page what the agent is doing for you. It needs the extension’s agent too.</p></div>' +
      '<p class="ws-help"><a href="' + base + 'agents.html" target="_blank" rel="noopener">How to try them: the AI agents guide<span class="ws-sr"> (opens in a new tab)</span></a></p></details>';
    return html;
  }
  function row(name) {
    var info = ADAPTERS[name] || {};
    var on = names.indexOf(name) !== -1;
    return '<div class="ws-ad" data-row="' + name + '"><label class="ws-check"><input type="checkbox" data-ad="' + name + '"' + (on ? ' checked' : '') + '> ' +
      '<span class="ws-name">' + label(name) + '</span>' + (info.ai ? ' <span class="ws-tag">AI</span>' : '') + '</label>' +
      '<p class="ws-help">' + esc(info.help) + '</p><div class="ws-state" data-state="' + name + '"></div>' +
      (name === 'mine' ? '<div class="ws-mine" hidden><label for="ws-code">Your adapter (saved in this browser)</label><textarea id="ws-code" spellcheck="false"></textarea>' +
        '<button type="button" class="ws-btn" id="ws-runmine">Save and run</button> <button type="button" class="ws-btn ws-quiet" id="ws-reset">Start over</button></div>' : '') +
      '</div>';
  }
  function changesHTML() {
    return '<label class="ws-check"><input type="checkbox" id="ws-outline"> Outline the changes on the page</label>' +
      '<label class="ws-field"><span>Show</span><select id="ws-filter"><option value="">Every adapter</option></select></label>' +
      '<div id="ws-chg"></div>' +
      '<h3 class="ws-h">What a screen reader hears</h3>' +
      '<p class="ws-help">What the page reads out as it changes, e.g., “Added to cart”. Without it, a screen reader user doesn’t hear that anything changed.</p>' +
      '<ol class="ws-heard" id="ws-heard"></ol>';
  }
  function checksHTML() {
    var spot = false;
    try { spot = (new URLSearchParams(location.search).get('spotlight') || localStorage.getItem('redbird:spotlight')) === 'on'; } catch (e) {}
    return '<label class="ws-check"><input type="checkbox" id="ws-spot"' + (spot ? ' checked' : '') + '> Point out the planted problems</label>' +
      '<p class="ws-help">Puts a numbered badge on each planted problem on this page. A badge turns green once an adapter fixes it.</p>' +
      '<button type="button" class="ws-btn" id="ws-run">Run the toolkit’s checks</button>' +
      '<p class="ws-help">The same checks the extension runs before it fixes a page. Run them again after turning adapters on to compare.</p>' +
      '<div id="ws-res"></div>';
  }

  function wire() {
    var head = $('.ws-head'), main = $('.ws-main');
    var setOpen = function (open) {
      ui.open = open;
      head.setAttribute('aria-expanded', String(open));
      main.hidden = !open;
      box.classList.toggle('ws-closed', !open);
      foldButton();
      saveUi();
      dock();
    };
    head.onclick = function () { setOpen(!ui.open); };
    $('#ws-fold').onclick = function () { setOpen(!ui.open); if (ui.open) head.focus(); };
    $('#ws-side').onclick = function () { ui.side = ui.side === 'left' ? 'right' : 'left'; box.setAttribute('data-side', ui.side); sideButton(); saveUi(); dock(); };
    addEventListener('resize', dock);
    if (window.visualViewport) { visualViewport.addEventListener('resize', place); visualViewport.addEventListener('scroll', place); }
    addEventListener('scroll', place, { passive: true });
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
    $('#ws-prof').value = profileName && (PEOPLE[profileName] || profileName) ? profileName : 'none';
    $('#ws-prof').onchange = function () {
      var id = this.value;
      if (id === 'none') return go({ profile: 'none' });
      toolkitProfiles().then(function (all) { var b = bundleFor(id, all); go({ profile: id, try: b.length ? b.join(',') : 'none' }); });
    };
    $('#ws-alloff').onclick = function () {
      var reload = names.indexOf('toolkit-fixes') !== -1 || names.indexOf('mine') !== -1;
      var was = names.slice();
      names = [];
      saveNames();
      if (reload) return location.reload();
      was.forEach(turnOff);
      root.querySelectorAll('input[data-ad]').forEach(function (cb) { cb.checked = false; });
    };
    root.querySelectorAll('input[data-ad]').forEach(function (cb) {
      cb.onchange = function () { toggle(cb.getAttribute('data-ad'), cb.checked); };
    });
    root.addEventListener('click', function (e) {
      var show = e.target.closest('[data-show]');
      if (show) { filterWho = show.getAttribute('data-show'); $('#ws-filter').value = filterWho; showTab('changes', true); }
    });
    var code = $('#ws-code');
    if (code) {
      copied.then(myCode).then(function (c) { code.value = c; });
      $('#ws-runmine').onclick = function () {
        try { localStorage.setItem(MY_KEY, code.value); } catch (e) {}
        if (names.indexOf('mine') === -1) { names.push('mine'); saveNames(); }
        location.reload();
      };
      $('#ws-reset').onclick = function () {
        try { localStorage.removeItem(MY_KEY); } catch (e) {}
        location.reload();
      };
    }
    // Changes
    $('#ws-outline').onchange = function () { setMarks(this.checked); };
    $('#ws-filter').onchange = function () { filterWho = this.value; renderChanges(); };
    $('#ws-chg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]');
      if (b) return locate(Track.list[Number(b.getAttribute('data-n')) - 1]);
      var more = e.target.closest('[data-more]');
      if (more) { expanded[more.getAttribute('data-more')] = true; renderChanges(); }
    });
    // Checks
    $('#ws-spot').onchange = function () { go({ spotlight: this.checked ? 'on' : 'off' }); };
    $('#ws-run').onclick = runChecks;
    $('#ws-res').addEventListener('click', function (e) {
      var b = e.target.closest('[data-found]');
      if (b) locateEl(found[Number(b.getAttribute('data-found'))], b.textContent);
    });
    document.addEventListener('ws-report', function () { refresh('toolkit-fixes'); });
  }
  // Collapsed, the panel is just its title in the corner; the same button opens it again.
  function foldButton() {
    var b = $('#ws-fold');
    b.textContent = ui.open ? '–' : '+';
    b.setAttribute('aria-label', ui.open ? 'Collapse the workshop panel' : 'Open the workshop panel');
    b.title = ui.open ? 'Collapse' : 'Open';
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
    if (id === 'changes') renderChanges();
    place();
  }
  function fillProfiles(all) {
    var group = $('#ws-tkprof');
    group.innerHTML = Object.keys(all).map(function (id) { return '<option value="' + esc(id) + '">' + esc(all[id].name) + '</option>'; }).join('');
    if (profileName && (PEOPLE[profileName] || all[profileName])) $('#ws-prof').value = profileName;
    var note = '';
    if (currentProfile) {
      var b = bundleFor(profileName, all);
      note = (currentProfile.toolkit ? esc(currentProfile.description) : '“' + esc(currentProfile.freeText || '') + '”') +
        (b.length ? ' Its adapters: ' + b.map(label).join(', ') + '.' : '');
    } else {
      note = 'Picking a profile switches on its adapters. You can change them below.';
    }
    $('#ws-prof-note').innerHTML = note;
  }
  function summary() {
    var on = names.length;
    $('#ws-sub').textContent = (currentProfile ? currentProfile.name.split(',')[0] + ' · ' : '') + (on ? on + ' adapter' + (on === 1 ? '' : 's') + ' on' : 'no adapters on');
    GROUPS.forEach(function (g) {
      var n = g[2].filter(function (x) { return names.indexOf(x) !== -1; }).length;
      var el = root.querySelector('[data-group="' + g[0] + '"]');
      if (el) el.textContent = n ? n + ' on' : '';
    });
  }
  // The line under an adapter's switch: loading, an error, what the fixes did, how many changes.
  function refresh(name, text) {
    if (!rendered) return;
    var el = root.querySelector('[data-state="' + name + '"]');
    summary();
    if (!el) return;
    var on = names.indexOf(name) !== -1;
    var n = on ? count(name) : 0;
    var html = '';
    if (!on) html = '';
    else if (errors[name]) html = '<p class="ws-err">Didn’t load: ' + esc(errors[name]) + '</p>';
    else if (text) html = '<p class="ws-note">' + esc(text) + '</p>';
    else if (name === 'toolkit-fixes' && ToolkitFixes.summary) html = '<p class="ws-note">' + esc(ToolkitFixes.summary) + '</p>';
    if (on && !errors[name] && n) html += '<button type="button" class="ws-link" data-show="' + name + '">See its ' + n + ' change' + (n === 1 ? '' : 's') + '</button>';
    else if (on && !errors[name] && !text && Track.obs) html += '<p class="ws-note">No changes on this page yet.</p>';
    el.innerHTML = html;
    var mine = name === 'mine' && root.querySelector('.ws-mine');
    if (mine) { mine.hidden = !on; box.classList.toggle('ws-wide', on); dock(); }
  }
  function count(name) { return Track.list.filter(function (e) { return e.who === name && live(e); }).length; }

  // Called after anything is put down to an adapter; redraws what's showing, a few times a second at most.
  var pending = 0;
  function changed() {
    if (!rendered || pending) return;
    pending = setTimeout(function () {
      pending = 0;
      names.forEach(function (n) { refresh(n); });
      var total = Track.list.filter(live).length;
      $('#ws-count').textContent = total ? String(total) : '';
      if (ui.tab === 'changes' && ui.open) renderChanges();
      if (marks.outline) queueMarks();
      place();
    }, 300);
  }

  function renderChanges() {
    if (!rendered) return;
    var sel = $('#ws-filter'), whos = [];
    Track.list.forEach(function (e) { if (whos.indexOf(e.who) === -1 && live(e)) whos.push(e.who); });
    sel.innerHTML = '<option value="">Every adapter</option>' + whos.map(function (w) { return '<option value="' + esc(w) + '">' + esc(label(w)) + '</option>'; }).join('');
    if (filterWho && whos.indexOf(filterWho) === -1) whos.push(filterWho);
    sel.value = filterWho;
    var shown = filterWho ? [filterWho] : whos, html = '';
    shown.forEach(function (w) {
      var mine = Track.list.filter(function (e) { return e.who === w && live(e); });
      html += '<h3 class="ws-h">' + esc(label(w)) + ' · ' + mine.length + '</h3>';
      if (!mine.length) { html += '<p class="ws-help">No changes on this page yet.</p>'; return; }
      var kinds = {}, order = [];
      mine.forEach(function (e) { var k = e.type + ':' + e.attr; if (!kinds[k]) { kinds[k] = []; order.push(k); } kinds[k].push(e); });
      order.forEach(function (k) {
        var items = kinds[k], key = w + '|' + k, open = expanded[key] ? items.length : 8;
        html += '<ul class="ws-list">' + items.slice(0, open).map(changeRow).join('') + '</ul>';
        if (items.length > open) html += '<button type="button" class="ws-link" data-more="' + esc(key) + '">Show ' + (items.length - open) + ' more like these</button>';
      });
    });
    if (!shown.length) html = '<p class="ws-help">Nothing yet. Switch an adapter on in Setup and its changes show up here.</p>';
    var hidden = Track.list.filter(function (e) { return live(e) && e.type !== 'removed' && e.type !== 'style' && !box2(e.el); }).length;
    if (hidden) html += '<p class="ws-help">' + hidden + ' of these only change what a screen reader or the keyboard gets, so they don’t show on the page.</p>';
    $('#ws-chg').innerHTML = html;
    renderHeard();
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
      diff = (ATTR[e.attr] ? ATTR[e.attr] + ' (' + e.attr + ')' : e.attr) + ': ' + fmt(e.before) + ' → ' + fmt(e.el.getAttribute(e.attr));
      if (UNSEEN.indexOf(e.attr) !== -1) tag = '<span class="ws-tag">heard, not seen</span>';
    } else if (e.type === 'text') {
      what = 'Text in ' + (e.el.nodeType === 1 ? kindName(e.el) : 'the page');
      var was = squash(e.parts.map(function (p) { return p.before; }).join(' '));
      var nodes = [].concat.apply([], e.parts.map(function (p) { return p.nodes; })).filter(function (n) { return n.isConnected; });
      var now = squash(nodes.map(function (n) { return n.textContent; }).join(' '));
      if (was && was === now) diff = 'same words, new markup: ' + cut(nodes.map(function (n) { return n.nodeType === 1 ? n.outerHTML : n.data; }).join(''), 160);
      else diff = (was ? fmt(was) + ' → ' : 'added ') + (now ? fmt(now) : 'removed');
    } else if (e.type === 'added' && e.el.matches(LIVE)) {
      what = 'Added an area that screen readers read out';
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
        ' <span class="ws-who">' + (h.who ? 'from ' + esc(label(h.who)) : 'from the store') + '</span></li>';
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
  function setMarks(on) {
    marks.outline = on;
    var cb = rendered && $('#ws-outline');
    if (cb) cb.checked = on;
    queueMarks();
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
      if (live(e) && e.type !== 'removed' && e.type !== 'style' && (!filterWho || e.who === filterWho) && seen.indexOf(e.el) === -1) { seen.push(e.el); items.push([e.el, e.n, '']); }
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
  function status(text) { var s = $('#ws-status'); s.textContent = ''; setTimeout(function () { s.textContent = text; }, 50); }
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
      if (!p || /^(HTML|BODY)$/.test(p.tagName)) return status('You can’t see this one. Only a screen reader or the keyboard notices it.');
      el = p;
      status('You can’t see this one. It sits inside the outlined part, and only a screen reader or the keyboard notices it.');
    } else status(what ? 'Outlined: ' + what : 'Outlined on the page.');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    marks.flash = { el: el, n: n, until: Date.now() + 3000 };
    queueMarks();
  }

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
          html += result(g[0], els.map(function (el) { return [el, describe(el)]; }));
        });
        html += '<p class="ws-res-line">Landmarks the page is missing: <b>' + (missing.length ? esc(missing.join(', ')) : 'none') + '</b></p>';
        var groupsAxe = W.groupViolationsByCategory(violations), total = 0;
        var axeHtml = '';
        Object.keys(groupsAxe).forEach(function (cat) {
          groupsAxe[cat].forEach(function (v) {
            var els = v.nodes.map(function (n) { return W.getElementFromNode(n); }).filter(function (el) { return el && !inPanel(el); });
            if (!els.length) return;
            total += els.length;
            axeHtml += result(v.help, els.map(function (el) { return [el, describe(el)]; }));
          });
        });
        html += '<h3 class="ws-h">axe-core · ' + total + ' problems</h3>';
        if (ToolkitFixes.before != null) html += '<p class="ws-help">Before toolkit-fixes ran, axe found ' + ToolkitFixes.before + ' problems on this page.</p>';
        html += axeHtml || '<p class="ws-help">axe found nothing.</p>';
        res.innerHTML = html;
        status('Checks done. axe found ' + total + ' problems.');
      });
    }).catch(function (e) { res.innerHTML = '<p class="ws-err">The checks didn’t load: ' + esc(e.message || e) + '</p>'; });
  }
  function result(title, items) {
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
    '.ws-panel[data-dock]{top:0;bottom:0;left:0;width:340px;max-height:none;border-radius:0;border-width:0 1px 0 0;box-shadow:none}' +
    '.ws-panel[data-dock][data-side=right]{left:auto;right:0;border-width:0 0 0 1px}.ws-panel[data-dock].ws-wide{width:540px}' +
    '.ws-panel.ws-closed{width:auto!important;max-width:min(360px,calc(100vw - 24px))}.ws-panel.ws-closed #ws-side{display:none}' +
    '*{box-sizing:border-box}[hidden]{display:none!important}' +
    'p,h3,ul,ol{margin:0;padding:0}' +
    'button,select,input,textarea{font:inherit;color:inherit;letter-spacing:normal}' +
    ':focus-visible{outline:2px solid #0969da;outline-offset:-2px;border-radius:6px}' +
    'a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}' +
    '.ws-top{display:flex;align-items:center;gap:4px;padding:4px;border-bottom:1px solid #d1d9e0}.ws-closed .ws-top{border-bottom:0}' +
    '.ws-head{all:unset;cursor:pointer;flex:1;min-width:0;display:flex;align-items:baseline;gap:8px;padding:4px 8px;border-radius:6px;overflow:hidden}' +
    '.ws-head:hover{background:#f6f8fa}.ws-title{font-weight:600}' +
    '.ws-sub{color:#59636e;font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    '.ws-icon{all:unset;cursor:pointer;padding:2px 8px;border-radius:6px;color:#59636e;line-height:20px}.ws-icon:hover{background:#f6f8fa;color:#1f2328}' +
    '.ws-fold{font-size:16px}' +
    '.ws-main{display:flex;flex-direction:column;min-height:0}' +
    '.ws-tabs{display:flex;gap:8px;padding:0 12px;border-bottom:1px solid #d1d9e0}' +
    '.ws-tab{all:unset;cursor:pointer;padding:8px 2px;color:#59636e;border-bottom:2px solid transparent;margin-bottom:-1px}' +
    '.ws-tab:hover{color:#1f2328}.ws-tab[aria-selected=true]{color:#1f2328;font-weight:600;border-bottom-color:#fd8c73}' +
    '.ws-count{display:inline-block;min-width:20px;padding:0 6px;margin-left:4px;border-radius:2em;background:rgba(129,139,152,.12);color:#1f2328;font-size:12px;font-weight:500;line-height:18px;text-align:center}' +
    '.ws-count:empty{display:none}' +
    '.ws-scroll{overflow:auto;padding:12px 16px 4px;min-height:0;flex:1}' +
    '.ws-pane > * + *{margin-top:8px}' +
    '.ws-field{display:flex;align-items:center;gap:8px}.ws-field > span{min-width:7.5em;color:#1f2328}' +
    'select{flex:1;min-width:0;padding:4px 8px;border-radius:6px;border:1px solid #d1d9e0;background:#f6f8fa;color:#1f2328}' +
    '.ws-help,.ws-note{color:#59636e;font-size:12px}.ws-note{color:#9a6700}' +
    '.ws-err{color:#d1242f;font-size:12px}' +
    '.ws-line{display:flex;align-items:baseline;justify-content:space-between;gap:8px}' +
    '.ws-h{font-size:14px;font-weight:600;margin-top:16px!important}.ws-pane > .ws-h:first-child{margin-top:0!important}' +
    '.ws-link{all:unset;cursor:pointer;color:#0969da;font-size:12px}.ws-link:hover{text-decoration:underline}' +
    '.ws-group{border:1px solid #d1d9e0;border-radius:6px;padding:0}.ws-group + .ws-group{margin-top:8px}' +
    '.ws-group > summary{cursor:pointer;font-weight:600;padding:6px 12px;background:#f6f8fa;border-radius:6px}' +
    '.ws-group[open] > summary{border-bottom:1px solid #d1d9e0;border-radius:6px 6px 0 0}' +
    '.ws-gc{display:inline-block;padding:0 6px;margin-left:4px;border-radius:2em;background:rgba(129,139,152,.12);font-weight:500;font-size:12px}.ws-gc:empty{display:none}' +
    '.ws-gwho{padding:6px 12px 0}' +
    '.ws-ad{padding:6px 12px}.ws-ad + .ws-ad{border-top:1px solid #eff2f5}.ws-ad .ws-help{margin-left:24px}.ws-state{margin-left:24px}.ws-flat .ws-help{margin-left:0}' +
    '.ws-check{display:flex;gap:8px;align-items:center;cursor:pointer}.ws-check input{width:16px;height:16px;margin:0;accent-color:#0969da}' +
    '.ws-name{font-weight:600}p.ws-name{margin-left:0}' +
    '.ws-tag{display:inline-block;padding:0 7px;border-radius:2em;border:1px solid #d1d9e0;color:#59636e;font-size:12px;font-weight:500;line-height:18px}' +
    '.ws-btn{padding:3px 12px;border-radius:6px;border:1px solid rgba(31,35,40,.15);background:#1f883d;color:#fff;font-weight:500;cursor:pointer}' +
    '.ws-btn:hover{background:#1a7f37}.ws-btn.ws-quiet{background:#f6f8fa;color:#1f2328;border-color:#d1d9e0}.ws-btn.ws-quiet:hover{background:#eff2f5}' +
    '.ws-mine{margin:6px 0 0 24px}.ws-mine textarea{display:block;width:100%;height:260px;margin:6px 0;padding:8px;border-radius:6px;border:1px solid #d1d9e0;' +
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
    '.ws-foot{padding:8px 16px;font-size:12px;color:#59636e;border-top:1px solid #d1d9e0}' +
    '.ws-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.ws-marks{position:fixed;inset:0;pointer-events:none;z-index:2147482000}' +
    '.ws-mark{position:fixed;border:2px solid #0969da;border-radius:3px}' +
    '.ws-mark span{position:absolute;left:-2px;top:-18px;padding:0 5px;background:#0969da;color:#fff;font:600 11px/16px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border-radius:3px 3px 3px 0}' +
    '.ws-mark.ws-flash{border:3px solid #bf3989;box-shadow:0 0 0 3px rgba(191,57,137,.25)}.ws-mark.ws-flash span{background:#bf3989}' +
    '@media (max-width:640px){.ws-panel{width:auto;right:12px}.ws-panel.ws-wide{width:auto}.ws-field{flex-wrap:wrap}}';
})();
