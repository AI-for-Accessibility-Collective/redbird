// Shared code for every Redbird page: header, footer, cart, prices, stars, dates, product cards.
//
// Planted issues: every place that behaves differently when an issue is on is written as
//   if (on(N)) { ...the broken version... } else { ...the accessible version... }
// so you can search for "on(6)" to find exactly what issue 6 changes.
(function () {
  var I = window.RB_ISSUES;
  var on = function (n) { return I.has(n); };
  var CATALOG = window.RB_CATALOG;
  var TAX_RATE = 0.09375; // Palo Alto sales tax

  // ── Small helpers ─────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n).toFixed(2); }
  function byId(id) { return CATALOG.find(function (p) { return p.id === id; }); }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function titleOf(p) { return on(25) ? p.title : p.name; }
  function descOf(p) { return on(27) ? p.jargon : p.plain; }
  function imgSrc(p) { return 'assets/img/products/' + p.id + '.webp'; }

  // Headings: with issue 11 on, the page has no real headings or landmarks, only styled divs.
  function h(level, text, cls) {
    cls = cls || '';
    if (on(11)) return '<div class="h' + level + ' ' + cls + '">' + text + '</div>';
    return '<h' + level + (cls ? ' class="' + cls + '"' : '') + '>' + text + '</h' + level + '>';
  }

  // ── Dates ─────────────────────────────────────────────────────────────────
  // ?today=2026-11-02 pins the store's "today", so a demo can show the same delivery dates. The pin is
  // kept in the browser tab that set it (sessionStorage), so an old agent link can't leave other tabs
  // or later visits on that day.
  if (param('today')) {
    try {
      if (param('today') === 'now') sessionStorage.removeItem('redbird:today');
      else sessionStorage.setItem('redbird:today', param('today'));
    } catch (e) {}
  }
  store('redbird:today', null); // where older versions kept the pin, for every tab
  // ?reset=1 empties the cart and the order history, for starting a new agent run.
  if (param('reset')) {
    store('redbird:cart', []);
    store('redbird:orders', []);
  }
  // ?cart=rb-20w-usbc-charger puts one of that product in an empty cart, so a guide link can open
  // checkout with something to buy.
  if (param('cart') && !(store('redbird:cart') || []).length) store('redbird:cart', [{ id: param('cart'), qty: 1 }]);
  // Always 10 am local, so adding days never crosses midnight and the date is the same in every timezone.
  function today() {
    var t = null;
    try { t = sessionStorage.getItem('redbird:today'); } catch (e) {}
    var d = t ? new Date(t + 'T10:00:00') : new Date();
    if (isNaN(d)) d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  }
  // YYYY-MM-DD in local time (toISOString would give the UTC date).
  function isoDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addBusinessDays(n) {
    var d = today();
    while (n > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) n--;
    }
    return d;
  }
  function dayLong(d) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
  function dayShort(d) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
  function shipDates(p) {
    var s = p.ship.std;
    return {
      stdFirst: addBusinessDays(s[0]),
      stdLast: addBusinessDays(s[1]),
      fast: p.ship.fast ? addBusinessDays(p.ship.fast.days) : null,
    };
  }

  // Delivery promise shown on cards and in the buy box.
  function deliveryHTML(p, opts) {
    opts = opts || {};
    var d = shipDates(p);
    var s = p.ship.std;
    var out = '';
    if (on(31)) {
      // Issue 31: no actual date, just business-day jargon.
      out = s[1] <= 2
        ? 'FREE Redbird Fast Shipping (est. ' + s[1] + ' business days*)'
        : 'FREE Standard Shipping (' + s[0] + '–' + s[1] + ' business days, excluding weekends and holidays, subject to carrier availability)';
      if (p.ship.fast && opts.full) out += '<br>Expedited Shipping available (' + p.ship.fast.days + ' business days) ' + money(p.ship.fast.fee);
    } else {
      var when = s[0] === s[1] ? dayShort(d.stdFirst) : dayShort(d.stdFirst) + ' – ' + dayShort(d.stdLast);
      out = 'FREE delivery <b>' + when + '</b>';
      if (p.ship.fast) out += (opts.full ? '<br>' : '. ') + 'Or fastest delivery <b>' + dayShort(d.fast) + '</b> for ' + money(p.ship.fast.fee);
    }
    if (p.ship.origin) out += '<br>' + p.ship.origin;
    if (on(16) && opts.full) {
      // Issue 16: the real arrival date is only in a tooltip that opens on mouse hover.
      out += ' <span class="tip-hover">Details<span class="tip">Arrives ' + dayLong(s[0] === s[1] ? d.stdFirst : d.stdLast) + ' if you order within 4 hrs 12 mins.</span></span>';
    }
    return '<div class="delivery">' + out + '</div>';
  }

  // ── Images ────────────────────────────────────────────────────────────────
  // Issue 1: alt text is missing, a camera file name, or just "product image".
  var BAD_ALTS = [null, 'IMG_2931.jpg', 'product image', null, 'DSC00418.webp'];
  // The photo for a chosen color, when there is one (cart, checkout and orders show the color you picked).
  function photoOf(p, color) {
    var x = (window.RB_IMAGES || {})[p.id];
    return (color && x && x.colors && x.colors[color]) || imgSrc(p);
  }
  // decorative: the product's name is already written next to the photo (in the same link or row),
  // so the clean store gives the photo empty alt text instead of repeating the name.
  function imgTag(p, i, extra, decorative, color) {
    var alt;
    if (on(1)) alt = BAD_ALTS[(i || 0) % BAD_ALTS.length];
    else alt = decorative ? '' : p.name;
    return '<img src="' + photoOf(p, color) + '"' + (alt === null ? '' : ' alt="' + esc(alt) + '"') +
      ' loading="lazy" width="400" height="400"' + (extra || '') + '>';
  }

  // ── Stars and prices ──────────────────────────────────────────────────────
  function starsHTML(p, link) {
    var pct = Math.round((p.rating / 5) * 100) + '%';
    var art = '<span class="stars-art" style="--pct:' + pct + '" aria-hidden="true">★★★★★</span>';
    var count = p.reviews.toLocaleString('en-US');
    // link === false: the stars sit inside a card that is already a link, so no link of their own.
    var countHTML = function (text) {
      return link === false ? '<span class="stars-count">' + text + '</span>' : '<a href="' + (link || '#reviews') + '">' + text + '</a>';
    };
    if (on(4)) {
      // Issue 4: the rating is only a picture of stars. A screen reader hears just "(12,408)".
      return '<span class="stars">' + art + countHTML('(' + count + ')') + '</span>';
    }
    return '<span class="stars"><span class="stars-num" aria-hidden="true">' + p.rating.toFixed(1) + '</span>' + art +
      '<span class="sr-only">' + p.rating.toFixed(1) + ' out of 5 stars, </span>' + countHTML(count + ' ratings') + '</span>';
  }
  function priceHTML(amount, size) {
    var whole = Math.floor(amount), cents = Math.round((amount - whole) * 100).toString().padStart(2, '0');
    var vis = '<span class="cur">$</span><span class="whole">' + whole + '</span><span class="cents">' + cents + '</span>';
    if (on(5)) {
      // Issue 5: the price is three separate pieces, read aloud as "dollar 18 99".
      return '<span class="price ' + (size || 'price-sm') + '">' + vis + '</span>';
    }
    return '<span class="price ' + (size || 'price-sm') + '"><span class="sr-only">' + money(amount) +
      '</span><span aria-hidden="true" style="display:inline-flex;align-items:flex-start">' + vis + '</span></span>';
  }
  function listPriceHTML(p) {
    if (!p.list) return '';
    // Issue 32: unexplained abbreviations such as MSRP.
    return '<span class="list-price">' + (on(32) ? 'MSRP: ' : 'List price: ') + '<s>' + money(p.list) + '</s></span>';
  }
  function badgeHTML(p) {
    if (!p.badge) return '';
    if (p.badge === 'Redbird pick') return '<span class="badge badge-pick"><b>Redbird’s</b> Pick</span>';
    if (p.badge === 'Limited time deal') return '<span class="badge badge-deal">Limited time deal</span>';
    return '<span class="badge">' + esc(p.badge) + '</span>';
  }
  function sponsoredHTML() {
    if (on(7)) {
      // Issue 7: "Sponsored" is faint text inside an image with no alt text.
      return '<img class="sponsored-img" src="data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="14"><text x="0" y="11" font-family="Arial" font-size="11" fill="#b5b5b5">Sponsored</text></svg>') +
        '" width="64" height="14">';
    }
    return '<span class="sponsored-tag">Sponsored</span>';
  }

  // ── Buttons that should be buttons ────────────────────────────────────────
  // Issue 3: "Add to cart" is a clickable div, so it has no button role and the keyboard skips it.
  function addButton(attrs, label) {
    label = label || 'Add to cart';
    if (on(3)) return '<div class="btn btn-cart" ' + attrs + '>' + label + '</div>';
    return '<button type="button" class="btn btn-cart" ' + attrs + '>' + label + '</button>';
  }
  var ICON = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1e7b3b"/><path d="M7 12.5l3.2 3.2L17.5 8.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#2b2100" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="#2b2100" stroke-width="2.6" stroke-linecap="round"/></svg>',
    cart: '<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M2 5h6l4.5 18h19L36 10H11" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="15" cy="29" r="2.6" fill="#fff"/><circle cx="29" cy="29" r="2.6" fill="#fff"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-7.2 7-12.2A7 7 0 0 0 5 9.8C5 14.8 12 22 12 22Z" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="#fff"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    searchGrey: '<svg viewBox="0 0 24 24" aria-hidden="true" class="sug-icon"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#8a8f8f" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="#8a8f8f" stroke-width="2.4" stroke-linecap="round"/></svg>',
        pinDark: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px"><path d="M12 22s7-7.2 7-12.2A7 7 0 0 0 5 9.8C5 14.8 12 22 12 22Z" fill="none" stroke="#565959" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="#565959"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.2 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.6 3.2 4.4 6.7C19.5 15.4 12 20 12 20Z" fill="none" stroke="#8c1515" stroke-width="2"/></svg>',
  };
  // The Redbird mark: a cardinal. BIRD takes the text color (white on the dark header), BIRD_ON_LIGHT is red for white backgrounds.
  var BIRD = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14.5 6 28 13 17 22Z" fill="currentColor"/><path d="M28 13 44 18 31 22Z" fill="#F2B705"/><path d="M17 22 28 13 31 22 34 33Z" fill="currentColor" opacity=".85"/><path d="M17 22 34 33 20 40Z" fill="currentColor" opacity=".7"/><path d="M17 22 20 40 6 46Z" fill="currentColor" opacity=".55"/></svg>';
  var BIRD_ON_LIGHT = '<svg viewBox="0 0 48 48" aria-hidden="true" style="color:#8c1515"><path d="M14.5 6 28 13 17 22Z" fill="currentColor"/><path d="M28 13 44 18 31 22Z" fill="#F2B705"/><path d="M17 22 28 13 31 22 34 33Z" fill="currentColor" opacity=".85"/><path d="M17 22 34 33 20 40Z" fill="currentColor" opacity=".7"/><path d="M17 22 20 40 6 46Z" fill="currentColor" opacity=".55"/></svg>';

  // ── Cart ──────────────────────────────────────────────────────────────────
  var CART_KEY = 'redbird:cart';
  var cart = {
    items: function () { return store(CART_KEY) || []; },
    save: function (items) { store(CART_KEY, items); renderCartCount(true); },
    count: function () { return cart.items().reduce(function (n, it) { return n + it.qty; }, 0); },
    add: function (item) {
      var items = cart.items();
      var same = items.find(function (it) { return it.id === item.id && it.color === item.color && it.size === item.size; });
      if (same) { same.qty += item.qty || 1; same.protect = same.protect || item.protect; }
      else items.push(Object.assign({ qty: 1 }, item));
      cart.save(items);
    },
    clear: function () { store(CART_KEY, []); },
  };
  // Clip-on coupons, in percent. None on the chargers, so the agent task's prices stay as designed.
  var COUPONS = { 'saltgrass-hoodie': 15, 'foxglove-bottle-24oz': 20, 'northloop-studio-headphones': 10, 'hearth-oak-mug-set': 10, 'tidewell-towel-set': 15 };
  function couponOf(p) { return COUPONS[p.id] || 0; }
  // Shown under the rating, from the review count: "2K+ bought in past month".
  function boughtHTML(p) {
    var n = p.reviews, b = n > 10000 ? '5K+' : n > 5000 ? '2K+' : n > 2000 ? '1K+' : n > 800 ? '500+' : '100+';
    return '<div class="bought">' + b + ' bought in past month</div>';
  }
  // Your list: products saved with the heart or "Add to List" (kept in this browser).
  var list = {
    ids: function () { return store('redbird:list') || []; },
    has: function (id) { return list.ids().indexOf(id) !== -1; },
    toggle: function (id, on) {
      var ids = list.ids().filter(function (x) { return x !== id; });
      if (on) ids.unshift(id);
      store('redbird:list', ids);
    },
  };
  // One cart line's prices. Subscribe & Save takes 5% off, a coupon takes its percent off,
  // and a protection plan is charged per unit.
  function lineOf(item) {
    var p = byId(item.id);
    var unit = item.subscribe ? Math.round(p.price * 95) / 100 : p.price;
    if (item.coupon && couponOf(p)) unit = Math.round(unit * (100 - couponOf(p))) / 100;
    var plan = item.protect && p.protect ? p.protect : 0;
    return { item: item, p: p, unit: unit, plan: plan, total: (unit + plan) * item.qty };
  }
  function renderCartCount(announce) {
    var n = cart.count();
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; });
    var link = document.querySelector('.cart-link');
    if (link && !on(2)) link.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
    // Issue 8: with it on, nothing tells a screen reader that the cart changed.
    if (announce && !on(8)) say('Cart now has ' + n + (n === 1 ? ' item' : ' items') + '.');
  }
  function say(text) {
    var live = document.getElementById('rb-live');
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 60);
  }

  // "Added to cart": a panel that slides in from the right, like big stores show after you add
  // something, with the cart subtotal, checkout and cart buttons, and a few related items.
  // With issues off it is a dialog: focus moves into it, Escape closes it, and focus goes back.
  function addedToast(p, qty) {
    closeAdded(false);
    var opener = document.activeElement;
    var lines = cart.items().map(lineOf);
    var n = lines.reduce(function (a, l) { return a + l.item.qty; }, 0);
    var sub = lines.reduce(function (a, l) { return a + l.total; }, 0);
    var inCart = lines.map(function (l) { return l.p.id; });
    var recs = window.RB_CATALOG.filter(function (x) { return x.cat === p.cat && inCart.indexOf(x.id) === -1; })
      .sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 3);
    var items = n + (n === 1 ? ' item' : ' items');
    var back = document.createElement('div');
    back.className = 'added-backdrop';
    var sheet = document.createElement('div');
    sheet.className = 'added-sheet';
    // Issue 8: with it on, the panel appears silently and focus stays where it was.
    if (!on(8)) { sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'added-title'); }
    sheet.innerHTML = '<button type="button" class="added-close"' + (on(2) ? '' : ' aria-label="Close"') + '>' + ICON.close + '</button>' +
      '<div class="added-head"><img src="' + imgSrc(p) + '" alt=""><div><p class="added-ok" id="added-title" tabindex="-1">' + ICON.check + ' Added to cart</p>' +
      '<p class="fine">' + esc(p.name) + (qty > 1 ? ', qty ' + qty : '') + '</p></div></div>' +
      '<p class="added-sub">Cart subtotal (' + items + '): <b>' + money(sub) + '</b></p>' +
      '<a class="btn btn-cart btn-block" href="checkout">Proceed to checkout (' + items + ')</a>' +
      '<a class="btn btn-plain btn-block" href="cart">Go to cart</a>' +
      (recs.length ? '<div class="added-recs">' + h(2, 'Customers also bought') + '<ul>' + recs.map(function (x) {
        return '<li><img src="' + imgSrc(x) + '" alt=""><div><a href="product?id=' + x.id + '">' + esc(x.name) + '</a>' +
          '<div class="added-price">' + money(x.price) + '</div><button type="button" class="btn btn-cart btn-small" data-sheet-add="' + x.id + '">Add to cart</button></div></li>';
      }).join('') + '</ul></div>' : '');
    document.body.appendChild(back);
    document.body.appendChild(sheet);
    function close() { closeAdded(true); }
    back.onclick = close;
    sheet.querySelector('.added-close').onclick = close;
    sheet.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sheet-add]');
      if (!b) return;
      var x = byId(b.getAttribute('data-sheet-add'));
      cart.add({ id: x.id, qty: 1, protect: false, subscribe: false });
      addedToast(x, 1);
    });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || on(8)) return;
      // Keep the keyboard inside the dialog while it is open.
      var f = sheet.querySelectorAll('a[href], button');
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    addedToast.opener = opener;
    if (!on(8)) sheet.querySelector('#added-title').focus();
  }
  function closeAdded(restore) {
    var sheet = document.querySelector('.added-sheet'), back = document.querySelector('.added-backdrop');
    if (sheet) sheet.remove();
    if (back) back.remove();
    if (restore && !on(8) && addedToast.opener && addedToast.opener.focus) addedToast.opener.focus();
  }

  // ── Header and footer ─────────────────────────────────────────────────────
  function headerHTML(opts) {
    var cats = window.RB_CATEGORIES;
    var q = esc(param('q') || '');
    var curCat = param('cat') || '';
    var tag = on(11) ? 'div' : 'header';
    var navTag = on(11) ? 'div' : 'nav';
    var html = '';
    if (!on(11)) html += '<a class="skip-link" href="#main">Skip to main content</a>';
    html += '<' + tag + ' class="rb-top">';
    html += '<div class="rb-header">';
    html += '<a class="logo hdr-box" href="./"' + (on(2) ? '' : ' aria-label="Redbird home"') + '>' + BIRD + '<span aria-hidden="true">redbird</span></a>';
    html += '<a class="deliver hdr-box" href="account#addresses">' + ICON.pin + '<div><small>Deliver to Jeff</small><b>Palo Alto 94301</b></div></a>';
    html += '<form class="search" action="search"' + (on(11) ? '' : ' role="search"') + '>';
    html += (on(11) ? '' : '<label class="sr-only" for="rb-q">Search Redbird</label>');
    html += '<select name="cat"' + (on(2) ? '' : ' aria-label="Department"') + '><option value="">All</option>' +
      cats.map(function (c) { return '<option value="' + c.id + '"' + (c.id === curCat ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>';
    html += '<input id="rb-q" name="q" value="' + q + '" placeholder="Search Redbird" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="rb-suggest">';
    html += '<ul id="rb-suggest" class="suggest" role="listbox" aria-label="Search suggestions" hidden></ul>';
    // Issue 2: icon-only buttons with no name.
    html += '<button type="submit"' + (on(2) ? '' : ' aria-label="Search"') + '>' + ICON.search + '</button>';
    html += '</form>';
    html += '<a class="hdr-box" href="account"><small>Hello, Jeff</small><b>Account &amp; lists</b></a>';
    html += '<a class="hdr-box hdr-orders" href="order"><small>Returns</small><b>&amp; orders</b></a>';
    html += '<a class="cart-link hdr-box" href="cart">' + ICON.cart + '<span class="cart-count"' + (on(2) ? '' : ' aria-hidden="true"') + '>0</span>' +
      (on(2) ? '' : '<b aria-hidden="true">Cart</b>') + '</a>';
    html += '</div>';

    html += '<' + navTag + ' class="rb-subnav"' + (on(11) ? '' : ' aria-label="Departments"') + '>';
    html += '<a href="search?deals=1">Today’s deals</a>';
    cats.forEach(function (c) { html += '<a href="search?cat=' + c.id + '">' + esc(c.name) + '</a>'; });
    html += '<a href="search?q=redbird+basics">Redbird Basics</a>';
    html += '</' + navTag + '>';
    // Issue 35: deals scroll across the top of every page and can't be paused (two copies make a seamless loop).
    var deals = [['Fall Deals Week', 'Up to 40% off home and kitchen'], ['Free 2-day delivery', 'on chargers and cables'],
      ['New colors', 'Saltgrass fleece hoodie in 5 shades'], ['Members save more', 'early access to Thursday deals'], ['Just in', 'Mesa Trail gear for colder hikes']];
    var run = '<span class="run">' + deals.map(function (d) { return '<span class="item"><b>' + d[0] + '</b>' + d[1] + '</span><span class="dot" aria-hidden="true">◆</span>'; }).join('') + '</span>';
    html += '<div class="ticker"><div class="track">' + run + run.replace('class="run"', 'class="run" aria-hidden="true"') + '</div></div>';
    html += '</' + tag + '>';
    return html;
  }
  function footerHTML() {
    var tag = on(11) ? 'div' : 'footer';
    return '<' + tag + ' class="rb-footer">' +
      '<button type="button" class="back-top" onclick="window.scrollTo(0,0)">Back to top</button>' +
      '<div class="foot-cols">' +
      '<div>' + h(2, 'Get to know us') + '<ul><li><a href="about">About Redbird</a></li><li><a href="about#careers">Careers</a></li><li><a href="about#sustainability">Sustainability</a></li></ul></div>' +
      '<div>' + h(2, 'Shop with us') + '<ul><li><a href="account">Your account</a></li><li><a href="order">Your orders</a></li><li><a href="help#shipping">Shipping rates</a></li></ul></div>' +
      '<div>' + h(2, 'Let us help you') + '<ul><li><a href="help#returns">Returns &amp; replacements</a></li><li><a href="help#accessibility">Accessibility</a></li><li><a href="help">Help</a></li></ul></div>' +
      '</div>' +
      '<div class="foot-base"><a class="logo" href="./" aria-label="Redbird home" style="color:#fff">' + BIRD + '<span aria-hidden="true">redbird</span></a>' +
      '<p class="foot-legal">© 2026 Redbird, Inc. <span aria-hidden="true">·</span> <a href="help#terms">Conditions of Use</a> <span aria-hidden="true">·</span> <a href="help#privacy">Privacy Notice</a></p>' +
      '</div>' +
      '</' + tag + '>';
  }

  // ── Product card (search results and shelves) ─────────────────────────────
  function cardHTML(p, i) {
    var url = 'product?id=' + p.id;
    var html = '<div class="card">';
    html += '<a class="card-img" href="' + url + '"' + (on(1) ? '' : ' tabindex="-1" aria-hidden="true"') + '>' + imgTag(p, i, '', true) + '</a>';
    // Issue 2: the heart button has no name.
    var inList = list.has(p.id);
    html += '<button type="button" class="heart' + (inList ? ' saved' : '') + '" data-id="' + p.id + '"' + (on(2) ? '' : ' aria-label="Save ' + esc(p.name) + ' to your list" aria-pressed="' + inList + '"') + '>' + ICON.heart + '</button>';
    if (p.sponsored) html += sponsoredHTML();
    html += h(2, '<a href="' + url + '">' + esc(titleOf(p)) + '</a>');
    html += '<div class="brand">' + (p.cat === 'books' ? 'by ' : '') + esc(p.brand) + '</div>';
    html += starsHTML(p, url + '#reviews');
    html += boughtHTML(p);
    if (p.badge) html += '<div>' + badgeHTML(p) + '</div>';
    html += '<div>' + priceHTML(p.price) + ' ' + listPriceHTML(p) + '</div>';
    if (couponOf(p)) html += '<div><span class="coupon">Save ' + couponOf(p) + '%</span> <span class="fine">with coupon</span></div>';
    if (p.ship.std[1] <= 2) html += '<div class="fast-badge"><span aria-hidden="true">✓</span> Redbird Fast</div>';
    html += deliveryHTML(p);
    if (p.swatches) {
      html += cardDots(p);
      // Issue 10: "See more" says nothing about what it links to.
      html += on(10)
        ? '<a class="options-link" href="' + url + '">See more</a>'
        : '<a class="options-link" href="' + url + '">' + p.swatches.length + ' colors<span class="sr-only"> of ' + esc(p.name) + '</span></a>';
    }
    if (!p.swatches && !p.sizes) html += addButton('data-add="' + p.id + '"');
    else html += '<a class="btn btn-plain" href="' + url + '" style="align-self:flex-start;margin-top:auto">Choose options<span class="sr-only"> for ' + esc(p.name) + '</span></a>';
    html += '</div>';
    return html;
  }
  function cardDots(p) {
    // Issue 6: the color dots have no names, on cards and on the product page.
    var dots = p.swatches.map(function (s) {
      return '<span style="background:' + s.hex + '"' + (on(6) ? '' : ' title="' + esc(s.name) + '"') + '></span>';
    }).join('');
    return '<div class="card-dots"' + (on(6) ? '' : ' role="img" aria-label="Colors: ' + esc(p.swatches.map(function (s) { return s.name; }).join(', ')) + '"') + '>' + dots + '</div>';
  }

  // ── Page shell ────────────────────────────────────────────────────────────
  function mount(contentHTML, opts) {
    opts = opts || {};
    document.getElementById('rb-top').innerHTML = opts.noHeader ? '' : headerHTML(opts);
    var slot = document.getElementById('rb-main');
    var main = document.createElement(on(11) ? 'div' : 'main');
    main.id = 'main';
    if (!on(11)) main.tabIndex = -1;
    main.className = opts.mainClass || '';
    main.innerHTML = contentHTML;
    slot.replaceWith(main);
    document.getElementById('rb-bottom').innerHTML = opts.noFooter ? '' : footerHTML();
    if (!document.getElementById('rb-live')) {
      var live = document.createElement('div');
      live.id = 'rb-live';
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    renderCartCount(false);
    wireSearch();
    wireAddButtons(main);
    if (opts.title) document.title = opts.title + ' | Redbird';
    return main;
  }
  // Suggestions under the search box, like real stores. Arrow keys move through them,
  // Enter searches for the highlighted one, Escape closes the list.
  function wireSearch() {
    var input = document.getElementById('rb-q'), list = document.getElementById('rb-suggest');
    if (!input || !window.RB_FIND) return;
    var items = [], active = -1;
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
    function show() {
      items = window.RB_FIND.suggest(input.value);
      if (!items.length) return close();
      var typed = input.value.trim().toLowerCase();
      list.innerHTML = items.map(function (s, i) {
        var at = s.indexOf(typed), label = at === 0 ? esc(s.slice(0, typed.length)) + '<b>' + esc(s.slice(typed.length)) + '</b>' : esc(s);
        return '<li id="rb-sug-' + i + '" role="option" aria-selected="false" data-i="' + i + '">' + ICON.searchGrey + '<span>' + label + '</span></li>';
      }).join('');
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    function pick(i) {
      active = i;
      list.querySelectorAll('[role=option]').forEach(function (o, j) { o.setAttribute('aria-selected', String(j === i)); });
      input.setAttribute('aria-activedescendant', 'rb-sug-' + i);
    }
    input.addEventListener('input', show);
    input.addEventListener('keydown', function (e) {
      if (list.hidden) { if (e.key === 'ArrowDown') { show(); if (items.length) pick(0); e.preventDefault(); } return; }
      if (e.key === 'ArrowDown') { pick((active + 1) % items.length); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { pick((active - 1 + items.length) % items.length); e.preventDefault(); }
      else if (e.key === 'Escape') { close(); e.preventDefault(); }
      else if (e.key === 'Enter' && active >= 0) { input.value = items[active]; close(); }
    });
    // Mouse users pick on mousedown, before the box loses focus. A plain click() from a script or an
    // AI agent sends no mousedown, so a click picks too (once).
    var picked = false;
    function pick(e) {
      var li = e.target.closest('[role=option]');
      if (!li || picked) return;
      e.preventDefault();
      picked = true;
      input.value = items[Number(li.getAttribute('data-i'))];
      close();
      input.form.submit();
    }
    list.addEventListener('mousedown', pick);
    list.addEventListener('click', pick);
    input.addEventListener('blur', function () { setTimeout(close, 100); });
  }
  function wireAddButtons(root) {
    // The heart saves a product to your list (only in this page view; nothing is stored).
    root.addEventListener('click', function (e) {
      var heart = e.target.closest('.heart');
      if (!heart) return;
      var saved = !heart.classList.contains('saved');
      heart.classList.toggle('saved', saved);
      list.toggle(heart.getAttribute('data-id'), saved);
      if (!on(2)) heart.setAttribute('aria-pressed', String(saved));
      if (!on(8)) say(saved ? 'Saved to your list.' : 'Removed from your list.');
    });
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-add]');
      if (!el) return;
      var p = byId(el.getAttribute('data-add'));
      if (!p) return;
      cart.add({ id: p.id, qty: 1, protect: false, subscribe: false });
      addedToast(p, 1);
    });
  }

  window.RB = {
    on: on, esc: esc, money: money, byId: byId, param: param, store: store, h: h,
    titleOf: titleOf, descOf: descOf, imgSrc: imgSrc, photoOf: photoOf, imgTag: imgTag,
    today: today, isoDate: isoDate, addBusinessDays: addBusinessDays, dayLong: dayLong, dayShort: dayShort, shipDates: shipDates,
    deliveryHTML: deliveryHTML, starsHTML: starsHTML, priceHTML: priceHTML, listPriceHTML: listPriceHTML,
    badgeHTML: badgeHTML, sponsoredHTML: sponsoredHTML, addButton: addButton, cardHTML: cardHTML, cardDots: cardDots,
    cart: cart, list: list, lineOf: lineOf, couponOf: couponOf, boughtHTML: boughtHTML, renderCartCount: renderCartCount, say: say, addedToast: addedToast,
    mount: mount, TAX_RATE: TAX_RATE, BIRD: BIRD, BIRD_ON_LIGHT: BIRD_ON_LIGHT, ICON: ICON,
  };
})();
