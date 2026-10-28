// Issue spotlight: marks the planted issues on the page, so sighted people can see what's wrong
// and whether an adapter fixed it. ISSUES.md lists all of them.
//
//   ?spotlight=on     mark every issue that is turned on and shows up on this page
//   ?spotlight=off    stop marking them (the default)
//
// Each issue gets a dashed outline and a numbered badge at one place it shows up. The badge opens
// what's wrong, who it affects and how to notice it. "Issues on this page" in the bottom-right
// corner lists them all, including ones that cover the whole page. The page is checked again
// whenever it changes, so a badge turns green when an adapter fixes its issue.
// It starts off on every page: ?spotlight=on or the workshop panel turns it on.
(function spotlight(force) {
  var KEY = 'redbird:spotlight';
  // The workshop panel turns the spotlight on and off in place, without reloading the page.
  window.RB_SPOTLIGHT_START = function () { if (!window.RB_SPOTLIGHT) spotlight(true); };
  // Only ?spotlight=on or the workshop panel turns it on. It isn't remembered between pages, so it
  // always starts off.
  var value = new URLSearchParams(location.search).get('spotlight');
  try { localStorage.removeItem(KEY); } catch (e) { /* private window */ }
  if (!window.RB_ISSUES || !window.RB) return;
  // Off, it still checks when asked (RB_ISSUE_REPORT, below), for tests and the workshop panel,
  // but draws nothing on the page.
  var quiet = !force && (value || 'off').toLowerCase() !== 'on';

  var esc = RB.esc;

  // ── What the store's own words look like with issues on ───────────────────
  // Taken from the catalog, so a title or description an adapter rewrote no longer matches.
  var STUFFED = new Set(), BULLETS = new Set(), JARGON = [], SPEC_KEYS = new Set();
  (window.RB_CATALOG || []).forEach(function (p) {
    STUFFED.add(p.title);
    (p.bullets || []).forEach(function (b) { BULLETS.add(b); });
    JARGON.push(p.jargon);
    (p.specs || []).forEach(function (s) { if (s[0] !== s[1]) SPEC_KEYS.add(s[0]); });
  });
  SPEC_KEYS.add('Mfr.');
  var ABBR = /\bMSRP\b|S&S|\bOOS\b|\bmo\.|Mfr\./;
  var VAGUE = /^(see more|click here|more|read more|here)$/i;
  var CODES = /ERR_|Error \d|[A-Z]{3,}_[A-Z_]+|\bAVS\b|^Action required\.$/;

  // ── Small helpers ─────────────────────────────────────────────────────────
  var ui = null;
  // The spotlight's own parts and the workshop panel are never part of the store.
  function ours(el) { return (ui && ui.contains(el)) || !!el.closest('#rb-spotlight, .ws-panel, .ws-calm-note'); }
  function all(sel) { return Array.prototype.filter.call(document.querySelectorAll(sel), function (el) { return !ours(el); }); }
  function text(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function rendered(el) { return el.isConnected && el.getClientRects().length > 0; }
  function shown(el) {
    if (!rendered(el)) return false;
    var cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05;
  }
  // Roughly what a screen reader says for an element: labels first, alt text for images,
  // and nothing from parts marked aria-hidden.
  function spoken(el) {
    if (el.nodeType === 3) return el.nodeValue;
    if (el.nodeType !== 1 || el.getAttribute('aria-hidden') === 'true' || /^(SCRIPT|STYLE|SVG|svg)$/.test(el.tagName)) return '';
    var label = el.getAttribute('aria-label');
    if (label && label.trim()) return label;
    var by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? text(x) : ''; }).join(' ');
    if (el.tagName === 'IMG') return el.getAttribute('alt') || '';
    return Array.prototype.map.call(el.childNodes, spoken).join('');
  }
  // A control's name: its own label, a <label> for it, its title, or what it says.
  function nameOf(el) {
    var s = el.getAttribute('aria-label') || '';
    if (!s && el.labels && el.labels.length) s = Array.prototype.map.call(el.labels, text).join(' ');
    if (!s && el.tagName !== 'SELECT') s = spoken(el);
    return (s || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
  }
  function notButton(el) { return el.tagName !== 'BUTTON' && !(el.getAttribute('role') === 'button' && el.tabIndex >= 0); }
  function explained(el) { return !!(el.title || el.getAttribute('aria-describedby') || el.querySelector('abbr[title], [title]')); }
  function inLiveRegion(el) {
    var r = el.closest('[aria-live], [role=status], [role=alert], [role=log]');
    return !!r && r.getAttribute('aria-live') !== 'off';
  }
  function rgba(s) {
    var m = String(s).match(/[\d.]+/g);
    return m && m.length >= 3 ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null;
  }
  function luminance(c) {
    var v = c.slice(0, 3).map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  // Text color against the first solid background behind it, the way contrast checkers measure it.
  function lowContrast(el) {
    if (!shown(el) || !text(el)) return false;
    var cs = getComputedStyle(el), fg = rgba(cs.color), bg = null;
    for (var a = el; a && !bg; a = a.parentElement) {
      var b = rgba(getComputedStyle(a).backgroundColor);
      if (b && b[3] > 0.5) bg = b;
    }
    if (!fg) return false;
    var l1 = luminance(fg), l2 = luminance(bg || [255, 255, 255]);
    var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    var size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.6 && Number(cs.fontWeight) >= 700);
    return ratio < (large ? 3 : 4.5);
  }
  function longestSentence(t) {
    return Math.max.apply(null, t.split(/[.!?]+(?:\s+|$)/).map(function (s) { return (s.match(/\S+/g) || []).length; }));
  }
  function badAlt(img) {
    if (img.getAttribute('aria-label')) return false;
    var a = img.getAttribute('alt');
    return a === null || /^(IMG|DSC)\S*\.(jpe?g|png|webp)$/i.test(a.trim()) || /^(product )?image$/i.test(a.trim());
  }
  // Hover changes some of these (the tooltip, the hidden buttons), so while the mouse is over
  // one it keeps the answer it had before.
  var before = new WeakMap();
  function unlessHovered(el, hoverEl, test) {
    if (hoverEl.matches(':hover') && before.has(el)) return before.get(el);
    var bad = test();
    before.set(el, bad);
    return bad;
  }

  // Things that move: a row that hasn't scrolled for 7 seconds, or a banner that hasn't
  // changed by itself for 9, has been stopped.
  var lastMove = new WeakMap();
  function stillMoving(el, position, wait) {
    var now = Date.now(), m = lastMove.get(el);
    if (!m) { lastMove.set(el, { at: now, pos: position }); return true; }
    if (position !== m.pos) { m.pos = position; if (now - clickedHero > 1500) m.at = now; }
    return now - m.at < wait;
  }
  var clickedHero = 0;
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.hero-ctrl')) clickedHero = Date.now();
  }, true);
  function animating(el) {
    if (!shown(el) || !el.getAnimations) return false;
    return el.getAnimations().some(function (a) {
      var d = a.effect && a.effect.getTiming ? a.effect.getTiming().duration : 0;
      return a.playState === 'running' && !(typeof d === 'number' && d < 100);
    });
  }
  // Issue 20: does anything outside the store's own stylesheet bring back a focus outline?
  function focusRule(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (!r.selectorText && r.cssRules && focusRule(r.cssRules)) return true;
      if (r.selectorText && /:focus/.test(r.selectorText) && r.style &&
        ((r.style.outlineStyle && r.style.outlineStyle !== 'none' && r.style.getPropertyPriority('outline-style')) ||
          (r.style.boxShadow && r.style.boxShadow !== 'none' && r.style.getPropertyPriority('box-shadow')))) return true;
    }
    return false;
  }
  function focusShown() {
    if (document.getElementById('ai4a11y-focus-ring')) return true;
    return Array.prototype.some.call(document.styleSheets, function (sheet) {
      if ((sheet.ownerNode && sheet.ownerNode.id === 'rb-spotlight-css') || /site\.css/.test(sheet.href || '')) return false;
      try { return focusRule(sheet.cssRules); } catch (e) { return false; } // other sites' sheets can't be read
    });
  }

  // The places an issue shows up on this page: [{ el, bad }], in the order of the selectors, so
  // the first one is the best place for its badge. keep(el) leaves out matches that aren't affected.
  function places(sels, bad, keep) {
    var list = [];
    [].concat(sels).forEach(function (sel) {
      all(sel).forEach(function (el) { if (list.indexOf(el) === -1 && (!keep || keep(el))) list.push(el); });
    });
    return list.map(function (el) { return { el: el, bad: !!bad(el) }; });
  }
  // The same, for issues found by their wording. Elements found once are remembered, so one an
  // adapter rewrites (and so no longer matches) counts as fixed instead of disappearing.
  var memory = {};
  function remembered(n, sels, bad, keep) {
    var list = (memory[n] || []).filter(function (el) { return el.isConnected; });
    places(sels, bad, keep).forEach(function (p) { if (list.indexOf(p.el) === -1) list.push(p.el); });
    memory[n] = list;
    return list.map(function (el) { return { el: el, bad: !!bad(el) }; });
  }
  function hasText(el) { return rendered(el) && !!text(el); }

  // ── The issues ────────────────────────────────────────────────────────────
  // what: what's wrong. who: who it affects. notice: something to try that shows it.
  // find: the places it shows up. wide: it covers the whole page, so it may have no one place.
  var BLIND = 'Blind and screen reader users';
  var ISSUES = {
    1: { title: 'Photos have no useful alt text',
      what: 'Product photos have no alt text, a camera file name like IMG_2931.jpg, or just "product image".',
      who: BLIND,
      notice: 'Turn on VoiceOver (Cmd+F5) and move to a photo: it reads "IMG_2931.jpg", "product image" or nothing.',
      find: function () {
        return places(['#main-img', '.card-img img', '.tile-grid img', '#main img:not(.sponsored-img)'], badAlt, function (el) { return el.getAttribute('alt') !== ''; });
      } },
    2: { title: 'Icon buttons have no name',
      what: 'Buttons that are only an icon have no name: search, cart, the hearts, banner arrows, photo thumbnails, and quantity − and +.',
      who: BLIND + ', and people who use voice control',
      notice: 'Turn on VoiceOver and Tab to the search button: it says only "button".',
      find: function () {
        return places(['.search button[type=submit]', '.cart-link', '.heart', '.hero-ctrl', '.thumbs button', '.qty button', '.added-close',
          '.rb-header .logo', '.co-header .logo', '.search select'], function (el) {
          var name = nameOf(el).replace(/[\s‹›−+×\-–]/g, '');
          return !name || /^\d+$/.test(name);
        });
      } },
    3: { title: '"Add to cart" is not a button',
      what: '"Add to cart" is a clickable box, not a real button, so the keyboard skips it.',
      who: 'Keyboard users and screen reader users',
      notice: 'Press Tab through the page: focus jumps over "Add to cart", and Enter can\'t press it.',
      find: function () { return places(['[data-buy="cart"]', '.btn-cart[data-add]', '[data-fbt]'], notButton); } },
    4: { title: 'Star ratings are only a picture',
      what: 'The rating is a picture of stars. A screen reader hears only the count, like "(12,408)".',
      who: BLIND,
      notice: 'Turn on VoiceOver and move to the stars: it reads how many ratings there are, but not the rating.',
      find: function () {
        return places(['.pdp-info .stars', '.card .stars', '.stars', '.rv-head'], function (el) { return !/out of 5|\d(\.\d)? stars?\b/i.test(spoken(el)); });
      } },
    5: { title: 'Prices are read in pieces',
      what: 'Each price is split into three pieces, so it is read as "dollar, 18, 99".',
      who: 'Screen reader users',
      notice: 'Turn on VoiceOver and move to a price: it reads the dollars and the cents as separate numbers.',
      find: function () { return places(['.price-block .price', '.card .price', '.price'], function (el) { return !/\$\s?\d[\d,]*\.\d\d/.test(spoken(el)); }); } },
    6: { title: 'Color choices have no names',
      what: 'Color choices are plain colored circles with no names, and the keyboard can\'t reach them.',
      who: BLIND + ', keyboard users, and people who are color blind',
      notice: 'Press Tab on the product page: the focus skips these color circles, and VoiceOver can\'t say which color is which.',
      find: function () {
        return places(['[data-swatch]', '.card-dots'], function (el) {
          if (el.matches('.card-dots')) {
            return !el.getAttribute('aria-label') && Array.prototype.some.call(el.children, function (d) { return !d.getAttribute('aria-label') && !d.title; });
          }
          var group = el.closest('[role=radiogroup]');
          return !el.getAttribute('aria-label') || !(el.tabIndex >= 0 || (group && group.querySelector('[tabindex="0"]')));
        });
      } },
    7: { title: '"Sponsored" is hidden in an image',
      what: '"Sponsored" is faint text inside an image with no alt text, so ads look like normal results.',
      who: 'Screen reader users and people with low vision',
      notice: 'Turn on VoiceOver on a result: nothing says it is an ad. Then look closely: "Sponsored" is pale grey.',
      find: function () { return places('.sponsored-img', function (el) { return !(el.getAttribute('alt') || '').trim() && !el.getAttribute('aria-label'); }); } },
    8: { title: 'Changes are not announced',
      what: 'The cart count, the "Added to cart" panel, search results and error messages change without telling a screen reader.',
      who: BLIND,
      notice: 'Turn on VoiceOver and add something to your cart, or change a filter: it says nothing.',
      checks: 'The spotlight checks for live regions on these spots. An adapter that announces changes in another way still shows here.',
      find: function () {
        return places(['#status', '#qty', '.cart-count', '.added-sheet', '#buy-error', '#pay-error', '#place-error'], function (el) {
          if (el.matches('.added-sheet')) return !el.getAttribute('role');
          return !inLiveRegion(el) && !(el.firstElementChild && inLiveRegion(el.firstElementChild));
        });
      } },
    9: { title: 'Tables have no header cells',
      what: 'The product information table has no header cells, so each value is read without its label.',
      who: 'Screen reader users',
      notice: 'Turn on VoiceOver and move through the table with Ctrl+Option+arrows: it never says which row you are in.',
      find: function () { return places(['.spec-table', '.top-specs', '.compare'], function (el) { return !el.querySelector('th, [role=rowheader], [role=columnheader]'); }); } },
    10: { title: 'Links say "See more" or "Click here"',
      what: 'Links say "See more" or "Click here" instead of where they go.',
      who: 'Screen reader users and people who use voice control',
      notice: 'Turn on VoiceOver and open the links list (Ctrl+Option+U): several links all say "See more".',
      find: function () { return remembered(10, 'a', function (el) { return VAGUE.test(nameOf(el)); }, function (el) { return VAGUE.test(text(el)); }); } },
    11: { title: 'No headings or landmarks', wide: true,
      what: 'Headings are styled boxes, not real headings. There is no header, navigation, main or footer, and no skip link.',
      who: 'Screen reader users and keyboard users',
      notice: 'Turn on VoiceOver and open the rotor (Ctrl+Option+U): there are no headings or landmarks to jump to.',
      find: function () {
        if (!document.getElementById('main')) return [];
        var fake = all('div.h1, .tile div.h2, .shelf div.h2, div.h2').filter(function (el) { return el.offsetWidth > 4; })[0] || null;
        return [{ el: fake, bad: !all('h1, h2, h3, h4, h5, h6, [role=heading]').length }, { el: null, bad: !all('main, [role=main]').length }];
      } },
    12: { title: 'Grey text is hard to read',
      what: 'Light grey text fails contrast: list prices, delivery text, fine print and brand names.',
      who: 'People with low vision, and anyone on a dim screen or in bright light',
      notice: 'Check it with a contrast checker: this grey on white is about 2.3 to 1, and text needs 4.5 to 1.',
      find: function () { return places(['.list-price', '.delivery', '.card .brand', '.stars-num', '.seller', '.fine'], lowContrast, hasText); } },
    13: { title: 'Fine print is tiny',
      what: 'The return policy and the subscription terms are 10 px tall.',
      who: 'People with low vision, and older adults',
      notice: 'Read the return policy at normal zoom: the letters are much smaller than the rest of the page.',
      find: function () { return places(['.policy', '.fine'], function (el) { return parseFloat(getComputedStyle(el).fontSize) < 12; }, hasText); } },
    14: { title: 'The header stays stuck at the top',
      what: 'The header and the deal ticker stay stuck to the top, so they cover much of the screen when zoomed in.',
      who: 'People with low vision who zoom in',
      notice: 'Zoom to 200% (Cmd and +) and scroll down: the header stays put and covers a big part of the page.',
      badgeOn: function (el) { return { el: el.querySelector('.rb-subnav') || el, at: 'end' }; },
      find: function () { return places('#rb-top', function (el) { return /sticky|fixed/.test(getComputedStyle(el).position); }); } },
    15: { title: 'The page doesn\'t fit when zoomed in', wide: true,
      what: 'The page is at least 1280 px wide, so at 200% zoom you have to scroll sideways.',
      who: 'People with low vision who zoom in, and phone users',
      notice: 'Zoom to 200%: the page scrolls sideways, so every line needs scrolling left and right.',
      find: function () {
        var root = document.documentElement;
        return [{ el: null, bad: (parseFloat(getComputedStyle(document.body).minWidth) || 0) > 700 || root.scrollWidth > root.clientWidth + 1 }];
      } },
    16: { title: 'The arrival date only shows on mouse hover',
      what: 'The real arrival date is only in a "Details" tooltip that opens when a mouse is over it.',
      who: 'Keyboard users, touch screen users and people who use a magnifier',
      notice: 'Press Tab to reach "Details" next to the delivery date: you can\'t, so the date never shows.',
      find: function () {
        return places('.tip-hover', function (el) {
          return unlessHovered(el, el, function () { var tip = el.querySelector('.tip'); return !!tip && !shown(tip); });
        });
      } },
    17: { title: 'Tiny click targets',
      what: 'The quantity − and + buttons, the hearts and the filter checkboxes are tiny, and clicking a filter\'s words does nothing.',
      who: 'People with tremors or limited hand control, and touch screen users',
      notice: 'Try to click the − and + buttons: they are about 18 px wide. In the filters, click the words next to a box.',
      find: function () {
        return places(['.qty button', '.heart', '.filters label'], function (el) {
          if (el.matches('label')) return getComputedStyle(el).pointerEvents === 'none';
          var r = el.getBoundingClientRect();
          return rendered(el) && (r.width < 24 || r.height < 24);
        }, function (el) { return !el.matches('label') || !!el.querySelector('input[type=checkbox]'); });
      } },
    18: { title: 'The price filter only works by dragging',
      what: 'The price filter is a slider you can only drag with a mouse.',
      who: 'Keyboard users, switch users and people with limited hand control',
      notice: 'Press Tab to the price filter and try the arrow keys: you can\'t reach it, and nothing moves.',
      find: function () {
        return places('.drag-slider', function (el) {
          var keys = !!el.querySelector('input[type=range]') || Array.prototype.some.call(el.querySelectorAll('[role=slider]'), function (k) { return k.tabIndex >= 0; });
          // A fix can also add min and max boxes next to the slider instead.
          var typed = !!el.parentElement && Array.prototype.some.call(el.parentElement.querySelectorAll('input[type=number], input[type=text], input[inputmode]'), rendered);
          return !keys && !typed;
        });
      } },
    19: { title: 'The checkout timer can\'t be extended', nocheck: true,
      what: 'Checkout says your cart is held for 5:00 and counts down. You can\'t get more time, and then you can\'t order.',
      who: 'Anyone who needs more time, like screen reader users, people with motor or cognitive disabilities, and people who type slowly',
      notice: 'Wait five minutes on this page: "Place your order" stops working, and nothing offers more time.',
      find: function () { return places('#hold', function () { return true; }); } },
    20: { title: 'No focus outline', wide: true,
      what: 'The keyboard focus outline is turned off, so you can\'t see where you are when you press Tab.',
      who: 'Keyboard users who can see, and people with low vision',
      notice: 'Press Tab a few times: something gets the focus, but nothing on the page shows where.',
      find: function () { return document.getElementById('main') ? [{ el: null, bad: !focusShown() }] : []; } },
    21: { title: '"Add to cart" only shows on mouse hover',
      what: '"Add to cart" on search results only appears while a mouse is over the card, so the keyboard can\'t reach it.',
      who: 'Keyboard users and touch screen users',
      notice: 'Press Tab through the results: the "Add to cart" buttons stay invisible and get skipped.',
      find: function () {
        return places('.card > .btn', function (el) {
          return unlessHovered(el, el.parentElement, function () { return getComputedStyle(el).visibility === 'hidden'; });
        });
      } },
    22: { title: 'Photos only switch on mouse hover',
      what: 'The small photos only change the big photo on mouse hover. They can\'t be clicked or reached with the keyboard.',
      who: 'Keyboard users, touch screen users and screen reader users',
      notice: 'Press Tab on the product page: the focus never reaches the small photos next to the big one.',
      find: function () { return places('.thumbs .thumb', notButton); } },
    23: { title: 'The product page is crowded with ads',
      what: 'Sponsored products and a big ad banner crowd the product page.',
      who: 'People with ADHD or cognitive disabilities, and screen reader users',
      notice: 'Scroll down the page: ads sit between the product details, and the banner looks like part of the store.',
      find: function () {
        return places('.pdp-section', shown, function (el) { return /^Sponsored products related/.test(text(el)) || !!el.querySelector('img[src*="hero-cozy"]'); });
      } },
    24: { title: 'Fake urgency',
      what: 'Deal countdowns start over on every visit, and low-stock and "other shoppers" warnings show whatever the real stock is.',
      who: 'People with anxiety, ADHD or cognitive disabilities',
      notice: 'Reload the page: the deal timer starts again from the top, so the deadline was never real.',
      find: function () {
        return places(['.buybox .stock-low', '.deal-timer', '.stock-low'], function (el) {
          var next = el.nextElementSibling;
          return shown(el) && !el.classList.contains('ws-calm-label') && !(next && next.classList.contains('ws-calm-note'));
        });
      } },
    25: { title: 'Product titles are stuffed with keywords',
      what: 'Product titles are long lists of keywords, so similar products look the same.',
      who: 'People with cognitive disabilities, screen reader users, and anyone comparing products',
      notice: 'Compare the charger titles: they start with the same words, so it\'s hard to tell them apart.',
      find: function () {
        var stuffed = function (el) { return STUFFED.has(text(el)); };
        return remembered(25, ['.pdp-info .h1', '.pdp-info h1', '.card .h2 a', '.card h2 a', '.deal-name', '.line .h2 a', '.line h2 a', '.co-item b', '.compare a'],
          stuffed, stuffed);
      } },
    26: { title: '"About this item" is hard to read',
      what: '"About this item" is five long bullets with ALL-CAPS labels in brackets and stuffed keywords.',
      who: 'People with dyslexia or cognitive disabilities, and screen reader users',
      notice: 'Read the first bullet, then say in a few words what it told you.',
      find: function () { return places('.about-messy li', function (el) { return BULLETS.has(text(el)) || /【/.test(text(el)); }); } },
    27: { title: 'The description is marketing jargon',
      what: 'The product description is marketing jargon in long sentences.',
      who: 'People with cognitive or reading disabilities, and people reading in a second language',
      notice: 'Read the description: can you say in one sentence what the product does?',
      find: function () { return places('#desc', function (el) { var t = text(el); return JARGON.some(function (j) { return t.indexOf(j) !== -1; }); }); } },
    28: { title: 'The policy is one long legal sentence',
      what: 'The return policy and the subscription terms are each one long legal sentence.',
      who: 'People with cognitive or reading disabilities, and people reading in a second language',
      notice: 'Count the sentences in the policy: there is one, and it is over 100 words long.',
      find: function () { return places('p.policy', function (el) { return longestSentence(text(el)) > 40; }); } },
    29: { title: 'A double-negative checkbox',
      what: 'A checkbox that is already ticked says "Uncheck this box if you do not wish to not receive Redbird offers".',
      who: 'People with cognitive disabilities, and anyone in a hurry',
      notice: 'Read the checkbox under Review: does a tick mean you get emails or not?',
      find: function () {
        return all('#offers').map(function (box) {
          var el = box.closest('label') || box;
          return { el: el, bad: /do not wish to not|uncheck this box if you do not/i.test(text(el)) };
        });
      } },
    30: { title: 'Payment errors are system codes',
      what: 'Payment errors are system codes like "Error 402: AVS mismatch" instead of what to do next.',
      who: 'People with cognitive disabilities, and everyone else',
      notice: 'Choose "Add a new card", enter 4242 4242 4242 4242, 12/30 and ZIP 10001, then press "Place your order".',
      find: function () {
        var boxes = all('#pay-error, #place-error');
        var shownErrors = boxes.filter(function (b) { return !!text(b); });
        if (shownErrors.length) return shownErrors.map(function (b) { return { el: b, bad: CODES.test(text(b)) }; });
        // No error yet: it only shows once a payment fails.
        return boxes.slice(0, 1).map(function (b) { return { el: b.closest('.co-step') || b, bad: true, waiting: true }; });
      } },
    31: { title: 'Shipping gives a day count, not a date',
      what: 'Shipping says how many working days it takes, not the date it arrives, so you have to count on a calendar.',
      who: 'People with memory or attention differences, and AI agents shopping for someone',
      notice: 'Look at the delivery line and work out which day it arrives, without a calendar.',
      find: function () {
        return remembered(31, ['.buybox .delivery', '.delivery', '#speed .ship-opt', '.ord-when', '.ord-status'],
          function (el) { return /\d+\s*(?:[–-]\s*\d+\s*)?business days/i.test(text(el)); },
          function (el) { return !el.matches('.ord-when, .ord-status') || /business days|estimated delivery/i.test(text(el)); });
      } },
    32: { title: 'Jargon and abbreviations',
      what: 'Words nobody explains: spec names like "Output (PD/PPS)" and "I/O config.", and MSRP, S&S and OOS.',
      who: 'People with cognitive disabilities, people reading in a second language, and new shoppers',
      notice: 'Look at the spec names and at "MSRP" next to the prices: would someone new know what they mean?',
      find: function () {
        var keys = '.top-specs th, .top-specs td b, .spec-table th, .spec-table .k, .compare tr > :first-child';
        var jargon = function (el) { return el.matches(keys) ? SPEC_KEYS.has(text(el)) : ABBR.test(text(el)); };
        return remembered(32, [keys, '.list-price', '.line .meta', '.co-item', '.opt-group label', '.notice-quiet', '.ord-line .fine'],
          function (el) { return jargon(el) && !explained(el); }, jargon);
      } },
    33: { title: 'The video plays by itself',
      what: 'The product video starts by itself and keeps looping, with no button to pause it.',
      who: 'People with ADHD or vestibular disorders, and screen reader users when its sound is on',
      notice: 'Watch the video: it starts by itself and keeps looping, and there is no button to pause it.',
      find: function () {
        return places('#pvid', function (v) { return rendered(v) && !(v.paused && (v.played.length > 0 || !v.autoplay)); });
      } },
    34: { title: 'Rows scroll by themselves',
      what: 'The "Best sellers" and "Customers also bought" rows scroll by themselves and have no buttons.',
      who: 'People with ADHD, vestibular disorders or low vision, and screen reader users',
      notice: 'Watch this row for a few seconds: it moves by itself, and there are no buttons to stop it or go back.',
      find: function () { return places(['#best', '#also'], function (el) { return stillMoving(el, el.scrollLeft, 7000); }); } },
    35: { title: 'The deal ticker never stops',
      what: 'A deal ticker scrolls across the top of every page, and the home banner changes every 4 seconds, with no way to pause.',
      who: 'People with ADHD, vestibular disorders or migraines, and anyone who reads slowly',
      notice: 'Look at the top of the page: the deals ticker keeps moving, and nothing pauses it.',
      badgeOn: function (el) { return el.closest('.ticker') ? { el: el.closest('.ticker'), at: 'end' } : null; },
      find: function () {
        return places(['.ticker .track', '.hero'], function (el) {
          if (el.matches('.hero')) {
            var slides = Array.prototype.slice.call(el.querySelectorAll('.hero-slide'));
            return stillMoving(el, slides.indexOf(el.querySelector('.hero-slide.is-current')), 9000);
          }
          return animating(el);
        });
      } },
    36: { title: 'The video has no captions',
      what: 'The product video has no captions.',
      who: 'Deaf and hard of hearing people, and anyone watching with the sound off',
      notice: 'Play the video: there are no captions and no CC button.',
      find: function () {
        return places('#pvid', function (v) {
          var tracks = Array.prototype.slice.call(v.textTracks || []);
          return !v.querySelector('track[kind=captions], track[kind=subtitles]') && !tracks.some(function (t) { return t.kind === 'captions' || t.kind === 'subtitles'; });
        });
      } },
  };

  // ── Checking ──────────────────────────────────────────────────────────────
  // state[n] = { places, still, status, anchor } for every issue that is on and shows up here.
  var state = {}, checkedOnce = false;
  function statusOf(issue, list, still) {
    if (list.some(function (p) { return p.waiting; })) return 'waiting';
    if (!still) return 'fixed';
    if (issue.nocheck) return 'nocheck';
    return still < list.length ? 'partly' : 'present';
  }
  function check() {
    var changed = [], next = {};
    RB_ISSUES.list.forEach(function (n) {
      var issue = ISSUES[n], list;
      if (!issue) return;
      try { list = issue.find(); } catch (e) { console.warn('[spotlight] issue ' + n + ':', e); return; }
      if (!list.length) return;
      var still = list.filter(function (p) { return p.bad; }).length;
      var s = { places: list, still: still, status: statusOf(issue, list, still) };
      // Keep the badge where it was while that place still fits, so badges don't jump around.
      var old = state[n] && state[n].anchor, oldPlace = old && list.find(function (p) { return p.el === old; });
      s.anchor = oldPlace && boxOf(old) && (oldPlace.bad || !still) ? old : pickAnchor(list, still);
      if (checkedOnce && state[n] && state[n].status !== s.status && s.status === 'fixed') changed.push(n);
      next[n] = s;
    });
    state = next;
    if (quiet) return;
    if (changed.length) say((changed.length === 1 ? 'Issue ' : 'Issues ') + changed.join(' and ') + (changed.length === 1 ? ' is' : ' are') + ' fixed now.');
    checkedOnce = true;
    render();
  }
  // The first place that is still broken and can be seen, or else the first that can be seen.
  function pickAnchor(list, still) {
    var seen = list.filter(function (p) { return p.el && boxOf(p.el); });
    var pick = (still && seen.find(function (p) { return p.bad; })) || seen[0];
    return pick ? pick.el : null;
  }

  // Where an element is on screen, cut to what scrolling boxes around it let through. Null when
  // it can't be seen: not shown, scrolled out of a row, or behind the "Added to cart" panel.
  function boxOf(el) {
    if (!el || !el.isConnected) return null;
    var sheet = document.querySelector('.added-sheet');
    if (sheet && !sheet.contains(el)) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    var b = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      var cs = getComputedStyle(a);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      var ar = a.getBoundingClientRect();
      if (cs.overflowX !== 'visible') { b.l = Math.max(b.l, ar.left); b.r = Math.min(b.r, ar.right); }
      if (cs.overflowY !== 'visible') { b.t = Math.max(b.t, ar.top); b.b = Math.min(b.b, ar.bottom); }
      if (b.r - b.l < 2 || b.b - b.t < 2) return null;
    }
    // A header stuck to the top (issue 14) covers what scrolls under it.
    var top = document.querySelector('.rb-top');
    if (top && !top.contains(el) && /sticky|fixed/.test(getComputedStyle(top).position)) {
      var tr = top.getBoundingClientRect();
      if (tr.top <= 1) {
        if (b.b <= tr.bottom + 4) return null;
        b.t = Math.max(b.t, tr.bottom);
      }
    }
    return b;
  }

  // ── The spotlight's own parts ─────────────────────────────────────────────
  // Everything sits in one <aside> at the end of the page. The badges and outlines are placed
  // over the page, so nothing in the store moves. Rules use the aside's id and !important where
  // adapters restyle every button or unpin everything fixed, so the spotlight keeps its shape.
  // GitHub's look (Primer colors), the same as the workshop's toolkit panel: issue numbers like
  // "#4" in small labels, red for not fixed, yellow for partly, green for fixed.
  var CSS =
    '#rb-spotlight{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;color:#1f2328}' +
    '#rb-spotlight .spot-layer{position:absolute!important;left:0;top:0;width:0;height:0;z-index:84}' +
    '#rb-spotlight.over-sheet .spot-layer{z-index:97}' +
    '#rb-spotlight .spot-box{position:absolute!important;box-sizing:border-box;margin:0!important;border:2px solid #d1242f;border-radius:6px;' +
    'outline:1px solid rgba(255,255,255,.85)!important;pointer-events:none!important}' +
    '#rb-spotlight .spot-box.is-fixed{border-color:#1a7f37}#rb-spotlight .spot-box.is-partly{border-color:#9a6700}' +
    '#rb-spotlight .spot-box.is-flash{border-color:#0969da;box-shadow:0 0 0 3px rgba(9,105,218,.3)}' +
    '#rb-spotlight .spot-badge{position:absolute!important;display:inline-flex!important;align-items:center;justify-content:center;box-sizing:border-box!important;' +
    'min-width:22px!important;min-height:0!important;height:22px!important;margin:0!important;padding:0 6px!important;border:2px solid #fff;border-radius:2em;' +
    'background:#cf222e;color:#fff;font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;white-space:nowrap;cursor:pointer;' +
    'box-shadow:0 1px 3px rgba(31,35,40,.3)}' +
    '#rb-spotlight .spot-badge:hover{background:#a40e26}' +
    '#rb-spotlight .spot-badge.is-fixed{background:#1f883d}#rb-spotlight .spot-badge.is-fixed:hover{background:#1a7f37}' +
    '#rb-spotlight .spot-badge.is-partly{background:#bf8700}#rb-spotlight .spot-badge.is-partly:hover{background:#9a6700}' +
    '#rb-spotlight :focus-visible{outline:2px solid #0969da!important;outline-offset:2px!important}' +
    '#rb-spotlight .spot-toggle{position:fixed!important;right:16px;bottom:calc(16px + env(safe-area-inset-bottom, 0px));z-index:86;margin:0!important;' +
    'min-height:0!important;padding:5px 12px!important;border:1px solid #d1d9e0;border-radius:6px;background:#f6f8fa;color:#1f2328;' +
    'font:500 14px/20px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(140,149,159,.2)}' +
    '#rb-spotlight .spot-toggle:hover{background:#eff2f5}#rb-spotlight .spot-toggle[hidden]{display:none!important}' +
    '#rb-spotlight .spot-count{display:inline-block;min-width:20px;margin-left:6px;padding:0 6px;border-radius:2em;background:rgba(129,139,152,.12);font-size:12px;line-height:18px;text-align:center}' +
    '#rb-spotlight .spot-panel{position:fixed!important;right:16px;bottom:60px;z-index:90;box-sizing:border-box;width:min(380px,calc(100vw - 32px));' +
    'max-height:min(72vh,620px);overflow-y:auto;padding:12px 16px 16px;background:#fff;border:1px solid #d1d9e0;border-radius:6px;box-shadow:0 8px 24px rgba(140,149,159,.2)}' +
    '#rb-spotlight .spot-pop{position:absolute!important;z-index:90;box-sizing:border-box;width:min(340px,calc(100vw - 24px));padding:12px 16px;' +
    'background:#fff;border:1px solid #d1d9e0;border-radius:6px;box-shadow:0 8px 24px rgba(140,149,159,.2)}' +
    '#rb-spotlight.over-sheet .spot-pop{z-index:98}' +
    '#rb-spotlight h2{font-size:14px;font-weight:600;line-height:1.5;margin:0 32px 4px 0}#rb-spotlight h2:focus{outline:none!important}' +
    '#rb-spotlight .spot-line{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:0 0 8px!important;font-size:12px;color:#59636e}' +
    '#rb-spotlight .spot-line .spot-btn{margin-left:4px!important;padding:0 8px!important}' +
    '#rb-spotlight p{margin:4px 0;font-size:14px}#rb-spotlight a{color:#0969da;text-decoration:underline;display:inline!important;min-height:0!important;padding:0!important;margin:0!important}' +
    '#rb-spotlight .spot-close{position:absolute!important;top:8px;right:8px;width:28px;height:28px;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;' +
    'border:0;border-radius:6px;background:none;color:#59636e;font-size:18px;line-height:1;cursor:pointer}' +
    '#rb-spotlight .spot-close:hover{background:#f6f8fa;color:#1f2328}' +
    '#rb-spotlight .spot-status{font-size:12px;font-weight:600;color:#d1242f}#rb-spotlight .spot-status.is-fixed{color:#1a7f37}#rb-spotlight .spot-status.is-partly{color:#9a6700}' +
    '#rb-spotlight .spot-btn{display:inline-block;margin:0 6px 0 0!important;min-height:0!important;padding:3px 12px!important;border:1px solid #d1d9e0;border-radius:6px;' +
    'background:#f6f8fa;color:#1f2328;font:500 12px/20px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;cursor:pointer}' +
    '#rb-spotlight .spot-btn:hover{background:#eff2f5}#rb-spotlight .spot-btn[aria-pressed=true]{background:#ddf4ff;border-color:#54aeff}' +
    '#rb-spotlight .spot-list{list-style:none;margin:8px 0 0;padding:0}' +
    '#rb-spotlight .spot-item{display:grid;grid-template-columns:32px 1fr;gap:8px;padding:8px 0;border-top:1px solid #d1d9e0}' +
    '#rb-spotlight .spot-num{font-size:12px;font-weight:600;line-height:21px;color:#d1242f}' +
    '#rb-spotlight .spot-num.is-fixed{color:#1a7f37}#rb-spotlight .spot-num.is-partly{color:#9a6700}' +
    '#rb-spotlight .spot-item p{margin:0 0 2px}#rb-spotlight .spot-item .spot-acts{margin-top:6px}' +
    '#rb-spotlight .spot-more{margin-top:8px;padding:8px 12px;background:#f6f8fa;border-radius:6px}#rb-spotlight .spot-more p{margin:0 0 6px;font-size:13px}' +
    '#rb-spotlight .spot-note{color:#59636e;font-size:12px}';

  var layer, toggle, panel = null, pop = null, live, badges = {}, boxes = [];
  var showAll = null, flash = null, flashTimer = null;

  function build() {
    var style = document.createElement('style');
    style.id = 'rb-spotlight-css';
    style.textContent = CSS;
    document.head.appendChild(style);
    ui = document.createElement('aside');
    ui.id = 'rb-spotlight';
    ui.setAttribute('aria-label', 'Issue spotlight');
    ui.innerHTML = '<div class="spot-layer"></div>' +
      '<button type="button" class="spot-toggle" aria-expanded="false" hidden>Issues on this page <span class="spot-count">0</span></button>' +
      '<div class="sr-only" aria-live="polite"></div>';
    document.body.appendChild(ui);
    layer = ui.querySelector('.spot-layer');
    toggle = ui.querySelector('.spot-toggle');
    live = ui.querySelector('[aria-live]');
    toggle.onclick = function () { if (panel) closePanel(true); else openPanel(); };
    ui.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (pop && (pop.contains(e.target) || e.target === badges[pop.n])) { e.preventDefault(); closePop(true); }
      else if (panel && (panel.contains(e.target) || e.target === toggle)) { e.preventDefault(); closePanel(true); }
    });
    // A click anywhere else closes what's open.
    document.addEventListener('mousedown', clickAway, true);
  }
  function clickAway(e) {
    if (pop && !pop.contains(e.target) && !e.target.closest('.spot-badge')) closePop(false);
    if (panel && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) closePanel(false);
  }
  function say(textToSay) {
    // With the workshop panel on the page, use its one voice, so messages don't talk over each other.
    if (window.RB_SAY) return window.RB_SAY(textToSay, true);
    live.textContent = '';
    setTimeout(function () { live.textContent = textToSay; }, 60);
  }
  var WORDS = { present: 'Not fixed', fixed: 'Fixed', partly: 'Partly fixed', nocheck: 'Not fixed', waiting: 'Shows when a payment fails' };
  function statusLine(n) {
    var s = state[n];
    if (s.status === 'partly') return 'Partly fixed: ' + s.still + ' of ' + s.places.length + ' still there';
    if (s.status === 'nocheck') return 'Not fixed (this one can\'t be checked automatically)';
    return WORDS[s.status];
  }
  function tone(status) { return status === 'fixed' ? 'is-fixed' : status === 'partly' ? 'is-partly' : 'is-bad'; }
  function present() { return RB_ISSUES.list.filter(function (n) { return state[n]; }); }

  // Badges: one per issue, kept between checks so focus stays on them.
  function render() {
    var shownNow = present();
    var label = 'Issues on this page <span class="spot-count">' + shownNow.length + '</span>';
    if (toggle.innerHTML !== label) toggle.innerHTML = label;
    Object.keys(badges).forEach(function (n) { if (!state[n]) { badges[n].remove(); delete badges[n]; } });
    shownNow.forEach(function (n) {
      var s = state[n], b = badges[n];
      if (!b) {
        b = badges[n] = document.createElement('button');
        b.type = 'button';
        b.className = 'spot-badge';
        b.setAttribute('aria-expanded', 'false');
        b.onclick = function () { if (pop && pop.n === n) closePop(true); else openPop(n); };
        // Badges stay in issue order, so Tab goes through them by number.
        var after = Object.keys(badges).map(Number).filter(function (m) { return m > n && badges[m] !== b && badges[m].isConnected; }).sort(function (x, y) { return x - y; })[0];
        layer.insertBefore(b, after ? badges[after] : null);
      }
      var words = { fixed: 'fixed', partly: 'partly fixed' }[s.status] || 'not fixed';
      var face = String(n);
      if (b.textContent !== face) b.textContent = face;
      if (b.getAttribute('aria-label') !== 'Issue ' + n + ', ' + words + ', details') b.setAttribute('aria-label', 'Issue ' + n + ', ' + words + ', details');
      var cls = 'spot-badge ' + tone(s.status);
      if (b.className !== cls) b.className = cls;
    });
    if (panel) fillPanel();
    if (pop && state[pop.n]) fillPop(); else if (pop) closePop(false);
    layout();
  }

  // Puts every badge and outline where its element is now. Runs after each check, and on scroll
  // and resize, since sticky headers and moving rows move things without changing the page.
  function layout() {
    var sheetOpen = !!document.querySelector('.added-sheet');
    ui.classList.toggle('over-sheet', sheetOpen);
    var L = layer.getBoundingClientRect();
    var root = document.documentElement, vw = root.clientWidth;
    var maxX = Math.max(vw, document.body.getBoundingClientRect().right); // page's right edge, on screen
    // The workshop panel sits beside the page (the page is padded to make room for it), so badges
    // stay out from under it.
    var rs = getComputedStyle(root), padL = parseFloat(rs.paddingLeft) || 0, padR = parseFloat(rs.paddingRight) || 0;
    var minX = Math.max(-window.scrollX, padL), minY = -window.scrollY;
    if (padR) maxX = Math.min(maxX, vw - padR);
    var placed = [], used = 0;
    // A header stuck to the top: badges for things under it stay below it, and badges for
    // things in it stay on screen.
    var header = document.querySelector('#rb-top'), hr = null;
    if (header && /sticky|fixed/.test(getComputedStyle(header).position)) hr = header.getBoundingClientRect();
    function box(b, status, extra) {
      var d = boxes[used] || (boxes[used] = layer.insertBefore(document.createElement('div'), layer.firstChild));
      used++;
      d.className = 'spot-box ' + tone(status) + (extra || '');
      d.setAttribute('aria-hidden', 'true');
      var l = Math.max(minX, b.l - 3), t = Math.max(minY, b.t - 3), r = Math.min(maxX, b.r + 3);
      d.style.left = (l - L.left) + 'px'; d.style.top = (t - L.top) + 'px';
      d.style.width = Math.max(4, r - l) + 'px'; d.style.height = Math.max(4, b.b + 3 - t) + 'px';
      d.hidden = false;
    }
    present().forEach(function (n) {
      var s = state[n], issue = ISSUES[n], badge = badges[n];
      var b = boxOf(s.anchor);
      var many = (showAll === n || flash === n) ? s.places : [];
      many.forEach(function (p) {
        var pb = p.el && p.el !== s.anchor && boxOf(p.el);
        if (pb && used < 120) box(pb, p.bad ? 'present' : 'fixed', flash === n ? ' is-flash' : '');
      });
      if (!b) { badge.hidden = true; return; }
      box(b, s.status, flash === n ? ' is-flash' : '');
      badge.hidden = false;
      var w = badge.offsetWidth || 24, h = 24;
      var at = issue.badgeOn ? issue.badgeOn(s.anchor) : null, spots;
      if (at && at.at === 'end') {
        var eb = boxOf(at.el) || b;
        var x = Math.min(eb.r, vw) - w - 8;
        spots = [[Math.max(Math.max(eb.l, 0) + 4, x), eb.t + (eb.b - eb.t - h) / 2]];
      } else {
        // Above the element if there's room, then to its left, above its right end, to its right,
        // below it, or inside its corner.
        spots = [[b.l - 3, b.t - 5 - h], [b.l - 5 - w, b.t + (b.b - b.t - h) / 2], [b.r - w + 3, b.t - 5 - h],
          [b.r + 5, b.t + (b.b - b.t - h) / 2], [b.r + 5, b.t], [b.l - 3, b.b + 5], [b.l + 2, b.t + 2],
          // A ring further out, for small controls packed close together.
          [b.r + w + 9, b.t + (b.b - b.t - h) / 2], [b.l - 2 * w - 9, b.t + (b.b - b.t - h) / 2], [b.l - 3, b.t - 2 * h - 9]];
      }
      var topLimit = minY;
      if (hr && header.contains(s.anchor)) topLimit = Math.max(minY, hr.top);
      else if (hr && hr.top <= 1) topLimit = hr.bottom;
      var fits = function (p) { return p[0] >= minX && p[1] >= topLimit && p[0] + w <= maxX; };
      var hits = function (p) { return placed.some(function (q) { return p[0] < q[0] + q[2] + 2 && p[0] + w + 2 > q[0] && p[1] < q[1] + h + 2 && p[1] + h + 2 > q[1]; }); };
      // Of the spots that fit and don't sit on another badge, the one hiding the least of the page.
      var spot = null, least = 99;
      spots.forEach(function (p) {
        if (!fits(p) || hits(p) || least === 0) return;
        var n = covers(p[0], p[1], w, h);
        if (n < least) { least = n; spot = p; }
      });
      spot = spot || spots.find(fits) || spots[spots.length - 1];
      spot = [Math.min(Math.max(spot[0], minX), maxX - w), Math.max(spot[1], topLimit)];
      // Badges that would sit on top of each other move along the line.
      for (var i = 0; i < 12 && hits(spot); i++) spot[0] = spot[0] + w + 4 > maxX - w ? spot[0] - (w + 4) * (i + 1) : spot[0] + w + 4;
      placed.push([spot[0], spot[1], w]);
      badge.style.left = (spot[0] - L.left) + 'px';
      badge.style.top = (spot[1] - L.top) + 'px';
    });
    for (var i = used; i < boxes.length; i++) boxes[i].hidden = true;
    placeToggle();
    if (pop) placePop();
  }
  // How much a badge at this spot (page coordinates as on screen) would hide of what people read or
  // press (text, a photo, a control): the page is looked at under five points of the badge, and
  // each one that lands on something counts.
  function covers(x, y, w, h) {
    var pts = [[x + 3, y + 3], [x + w - 3, y + 3], [x + 3, y + h - 3], [x + w - 3, y + h - 3], [x + w / 2, y + h / 2]];
    return pts.filter(function (pt) {
      if (pt[0] < 0 || pt[1] < 0 || pt[0] > window.innerWidth || pt[1] > window.innerHeight) return false;
      var under = document.elementsFromPoint(pt[0], pt[1]).find(function (el) {
        return el !== document.documentElement && el !== document.body && !layer.contains(el) && !ui.contains(el) && !el.closest('#ws-root');
      });
      if (!under) return false;
      if (/^(IMG|INPUT|BUTTON|SELECT|TEXTAREA|VIDEO|CANVAS|svg|path)$/.test(under.tagName)) return true;
      for (var c = under.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && /\S/.test(c.data)) return true;
      return false;
    }).length;
  }

  // Keep "Issues on this page" clear of the workshop panel in the bottom-left corner.
  function placeToggle() {
    var ws = document.querySelector('.ws-panel'), bottom = '';
    if (ws) {
      var wr = ws.getBoundingClientRect(), tr = toggle.getBoundingClientRect();
      if (wr.right + 8 > window.innerWidth - 12 - tr.width) bottom = (window.innerHeight - wr.top + 8) + 'px';
    }
    if (toggle.style.bottom !== bottom) toggle.style.bottom = bottom;
    if (panel) panel.style.bottom = (window.innerHeight - toggle.getBoundingClientRect().top + 8) + 'px';
  }

  // ── Details for one issue ─────────────────────────────────────────────────
  function detailsHTML(n) {
    var issue = ISSUES[n];
    return '<p>' + esc(issue.what) + '</p>' +
      '<p><b>Who it affects:</b> ' + esc(issue.who) + '</p>' +
      '<p><b>Try it:</b> ' + esc(issue.notice) + '</p>' +
      (issue.checks ? '<p class="spot-note">' + esc(issue.checks) + '</p>' : '');
  }
  function openPop(n) {
    closePop(false);
    pop = document.createElement('div');
    pop.n = n;
    pop.className = 'spot-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-labelledby', 'spot-pop-title');
    pop.innerHTML = '<button type="button" class="spot-close" aria-label="Close">×</button>' +
      '<h2 id="spot-pop-title" tabindex="-1">#' + n + ' ' + esc(ISSUES[n].title) + '</h2>' +
      '<p class="spot-line"><span class="spot-status"></span><span class="spot-where" hidden> · in <span></span> places ' +
        '<button type="button" class="spot-btn" data-all aria-pressed="false">Show all</button></span></p>' + detailsHTML(n);
    ui.insertBefore(pop, live);
    fillPop();
    badges[n].setAttribute('aria-expanded', 'true');
    pop.addEventListener('click', function (e) {
      if (e.target.closest('.spot-close')) closePop(true);
      var all = e.target.closest('[data-all]');
      if (all) { showAll = showAll === n ? null : n; all.setAttribute('aria-pressed', String(showAll === n)); layout(); }
    });
    // Tabbing out of it closes it.
    pop.addEventListener('focusout', function (e) {
      if (pop && e.relatedTarget && !pop.contains(e.relatedTarget) && e.relatedTarget !== badges[n]) closePop(false);
    });
    placePop();
    pop.querySelector('h2').focus();
  }
  // Only the status and the count change while it's open, so the focus stays where it is.
  function fillPop() {
    var n = pop.n, s = state[n], line = pop.querySelector('.spot-status');
    var count = String(s.places.filter(function (p) { return p.el; }).length), where = pop.querySelector('.spot-where');
    if (line.textContent !== statusLine(n)) line.textContent = statusLine(n);
    line.className = 'spot-status ' + tone(s.status);
    pop.className = 'spot-pop ' + tone(s.status);
    where.hidden = Number(count) < 2;
    var num = where.querySelector('span');
    if (num.textContent !== count) num.textContent = count;
  }
  // Under its badge, or above it when there's no room below, and never off the side of the screen.
  function placePop() {
    var badge = badges[pop.n];
    if (!badge || badge.hidden) return;
    var L = layer.getBoundingClientRect(), br = badge.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    var x = Math.min(Math.max(8, br.left), vw - w - 8);
    var y = br.bottom + 6 + h > window.innerHeight && br.top - 6 - h > 0 ? br.top - 6 - h : br.bottom + 6;
    pop.style.left = (x - L.left) + 'px';
    pop.style.top = (y - L.top) + 'px';
  }
  function closePop(restore) {
    if (!pop) return;
    var n = pop.n;
    pop.remove();
    pop = null;
    if (showAll === n) { showAll = null; layout(); }
    if (badges[n]) {
      badges[n].setAttribute('aria-expanded', 'false');
      if (restore) badges[n].focus();
    }
  }

  // ── "Issues on this page" ─────────────────────────────────────────────────
  function openPanel() {
    closePop(false);
    panel = document.createElement('div');
    panel.className = 'spot-panel';
    panel.id = 'spot-panel';
    ui.insertBefore(panel, toggle);
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', 'spot-panel');
    panel.addEventListener('click', function (e) {
      var show = e.target.closest('[data-show]'), more = e.target.closest('[data-more]');
      if (show) reveal(Number(show.getAttribute('data-show')));
      if (more) {
        var box = more.closest('.spot-item').querySelector('.spot-more'), open = more.getAttribute('aria-expanded') !== 'true';
        box.hidden = !open;
        more.setAttribute('aria-expanded', String(open));
      }
    });
    fillPanel();
    placeToggle();
    panel.querySelector('h2').focus();
  }
  // Built again only when the issues on the page change. Otherwise just the statuses update,
  // so the keyboard focus and any open details stay put.
  function fillPanel() {
    var list = present(), key = list.join(',');
    if (panel.key !== key) {
      panel.key = key;
      var off = new URL(location.href);
      off.searchParams.set('spotlight', 'off');
      panel.innerHTML = '<h2 tabindex="-1">Issues on this page</h2>' +
        (list.length
          ? '<p class="spot-note">Green ones are fixed by an adapter.</p><ul class="spot-list">' +
            list.map(function (n) {
              var issue = ISSUES[n];
              return '<li class="spot-item" data-n="' + n + '"><span class="spot-num" aria-hidden="true">#' + n + '</span><div>' +
                '<p><b><span class="sr-only">Issue ' + n + ': </span>' + esc(issue.title) + '</b></p><p class="spot-status"></p><div class="spot-acts">' +
                '<button type="button" class="spot-btn" data-show="' + n + '">Show me<span class="sr-only"> issue ' + n + '</span></button>' +
                '<span class="spot-note" hidden></span>' +
                '<button type="button" class="spot-btn" data-more aria-expanded="false">Details<span class="sr-only"> for issue ' + n + '</span></button></div>' +
                '<div class="spot-more" hidden>' + detailsHTML(n) + '</div></div></li>';
            }).join('') + '</ul>'
          : '<p>No accessibility problems are turned on here, so there is nothing to mark. Add ?issues=on to the address to turn them all on.</p>') +
        '<p class="spot-note"><a href="' + esc(off.href) + '">Turn off the spotlight</a></p>';
    }
    list.forEach(function (n) {
      var item = panel.querySelector('[data-n="' + n + '"]'), s = state[n];
      var line = item.querySelector('.spot-status'), words = statusLine(n), cls = 'spot-status ' + tone(s.status);
      if (line.textContent !== words) line.textContent = words;
      if (line.className !== cls) line.className = cls;
      item.querySelector('.spot-num').className = 'spot-num ' + tone(s.status);
      // Issues with no one place to point at (like a missing focus outline) can't be shown.
      var none = !s.anchor && !s.places.some(function (p) { return p.el && p.el.closest('details:not([open])'); });
      var show = item.querySelector('[data-show]');
      if (show.hidden !== none) {
        if (none && document.activeElement === show) item.querySelector('[data-more]').focus();
        show.hidden = none;
        show.nextElementSibling.textContent = ISSUES[n].wide ? 'Covers the whole page' : 'Not on screen right now';
        show.nextElementSibling.hidden = !none;
      }
    });
  }
  function closePanel(restore) {
    if (!panel) return;
    panel.remove();
    panel = null;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.removeAttribute('aria-controls');
    if (restore) toggle.focus();
  }
  // "Show me": scroll to the issue, light up every place it shows up for a moment, and put the
  // focus on its badge, so Enter opens its details.
  function reveal(n) {
    var s = state[n];
    if (!s) return;
    if (!s.anchor) {
      // Search filters fold away behind "Filters" on narrow screens.
      var folded = s.places.find(function (p) { return p.el && p.el.closest('details:not([open])'); });
      if (folded) { folded.el.closest('details:not([open])').open = true; s.anchor = pickAnchor(s.places, s.still); }
    }
    if (!s.anchor) return;
    closePanel(false);
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    s.anchor.scrollIntoView({ block: 'center', inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    flash = n;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { flash = null; layout(); }, 2600);
    setTimeout(function () {
      layout();
      if (badges[n] && !badges[n].hidden) badges[n].focus({ preventScroll: true }); else toggle.focus();
    }, smooth ? 450 : 0);
    layout();
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  // What the spotlight sees, for tests and agents: [{ issue, title, status, places, still }].
  // status is fixed, partly, present (not fixed), nocheck or waiting.
  function report() {
    return present().map(function (n) { return { issue: n, title: ISSUES[n].title, status: state[n].status, places: state[n].places.length, still: state[n].still }; });
  }
  if (quiet) {
    window.RB_ISSUE_REPORT = function () { check(); return report(); };
    return;
  }
  build();
  check();
  window.RB_ISSUE_REPORT = function () { check(); return report(); };
  window.RB_SPOTLIGHT = { report: report };
  // Check again when the page changes (adapters change it after load), at most twice a second,
  // and every second anyway, since moving rows and tickers change without touching the page.
  var queued = false;
  var watcher = new MutationObserver(function (records) {
    if (queued || !records.some(function (r) { return !ui.contains(r.target); })) return;
    queued = true;
    setTimeout(function () { queued = false; if (window.RB_SPOTLIGHT) check(); }, 500);
  });
  watcher.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  var ticker = setInterval(function () { if (!document.hidden) check(); }, 1000);
  window.RB_SPOTLIGHT.stop = function () {
    quiet = true; // RB_ISSUE_REPORT still works, without the badges
    watcher.disconnect();
    clearInterval(ticker);
    document.removeEventListener('mousedown', clickAway, true);
    window.removeEventListener('scroll', relayout, { capture: true });
    window.removeEventListener('resize', relayout);
    ui.remove();
    var css = document.getElementById('rb-spotlight-css');
    if (css) css.remove();
    delete window.RB_SPOTLIGHT;
  };
  var framed = false;
  function relayout() {
    if (framed) return;
    framed = true;
    requestAnimationFrame(function () { framed = false; layout(); });
  }
  window.addEventListener('scroll', relayout, { capture: true, passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
})();
