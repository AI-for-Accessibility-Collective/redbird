// Search and category results with filters.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc;
  var q = (RB.param('q') || '').trim();
  var cat = RB.param('cat') || '';
  var dealsOnly = RB.param('deals') === '1';
  var catName = cat ? (RB_CATEGORIES.find(function (c) { return c.id === cat; }) || {}).name : '';

  // Matching and ranking live in find.js (shared with the suggestions under the search box).
  var pool = RB_CATALOG.filter(function (p) { return (!cat || p.cat === cat) && (!dealsOnly || p.list); });
  var found = RB_FIND.rank(q, pool, { exact: RB.param('exact') === '1' });
  var base = found.results.map(function (r) { return r.p; });
  var relevance = {};
  found.results.forEach(function (r) { relevance[r.p.id] = r.score; });
  var brands = Array.from(new Set(base.map(function (p) { return p.brand; }))).sort();
  var maxPrice = Math.ceil(Math.max.apply(null, base.map(function (p) { return p.price; }).concat([10])));
  var state = { min: 0, max: maxPrice, stars4: false, fast: false, brands: [], connectors: [], sort: 'featured' };
  // Chargers and cables get a "Connector type" filter, like real stores have.
  function connectorOf(p) { return /lightning/i.test(p.name) ? 'Lightning' : /usb-c/i.test(p.name) ? 'USB-C' : null; }
  var connectors = Array.from(new Set(base.map(connectorOf).filter(Boolean))).sort();
  // Electronics results are shown as a list (photo on the left), like real stores show them.
  var asList = base.length && base.filter(function (p) { return p.cat === 'electronics'; }).length > base.length / 2;
  var label = q ? '“' + esc(q) + '”' : dealsOnly ? 'Today’s deals' : catName || 'All departments';

  // ── Sidebar ───────────────────────────────────────────────────────────────
  var side = '<div class="filters"' + (on(12) ? '' : ' role="region" aria-label="Filters"') + '>';
  side += h(2, 'Department') + '<ul>' + RB_CATEGORIES.map(function (c) {
    return '<li><a href="search?cat=' + c.id + (q ? '&q=' + encodeURIComponent(q) : '') + '"' + (c.id === cat ? ' aria-current="page" style="font-weight:700;color:var(--ink)"' : '') + '>' + esc(c.name) + '</a></li>';
  }).join('') + '</ul>';
  side += h(2, 'Price');
  if (on(19)) {
    // Issue 19: the price filter is a drag-only slider built from divs.
    side += '<div class="drag-slider" id="slider"><div class="track"></div><div class="fill"></div>' +
      '<div class="knob" data-k="min"></div><div class="knob" data-k="max"></div></div>' +
      '<div class="fine" id="slider-label">$0 – $' + maxPrice + '+</div>';
  } else {
    side += '<form class="price-boxes" id="price-form"><label class="sr-only" for="pmin">Minimum price in dollars</label><input id="pmin" inputmode="decimal" placeholder="$ Min">' +
      '<span aria-hidden="true">–</span><label class="sr-only" for="pmax">Maximum price in dollars</label><input id="pmax" inputmode="decimal" placeholder="$ Max">' +
      '<button type="submit">Go</button></form>';
  }
  side += h(2, 'Customer reviews') + '<label><input type="checkbox" id="f-stars"> 4 stars &amp; up</label>';
  side += h(2, 'Delivery') + '<label><input type="checkbox" id="f-fast"> Arrives in 2 days</label>';
  if (connectors.length > 1) {
    side += h(2, 'Connector type') + '<ul>' + connectors.map(function (c) {
      return '<li><label><input type="checkbox" data-connector="' + c + '"> ' + c + '</label></li>';
    }).join('') + '</ul>';
  }
  side += h(2, 'Brand') + '<ul>' + brands.map(function (b, i) {
    return '<li><label><input type="checkbox" data-brand="' + esc(b) + '"> ' + esc(b) + '</label></li>';
  }).join('') + '</ul></div>';

  // ── Results column ────────────────────────────────────────────────────────
  var bar = '<div class="results-bar"><span id="count-line"></span>' +
    '<label>Sort by <select id="sort"><option value="featured">Featured</option><option value="low">Price: low to high</option>' +
    '<option value="high">Price: high to low</option><option value="rating">Customer rating</option></select></label></div>';
  // A sponsored brand banner above the results, like real stores have.
  var TAGLINES = {
    'Kestrel': 'Charge everything at once.', 'Pebble Power': 'Small chargers, big batteries.', 'Hearth & Oak': 'Made for slow mornings.',
    'Saltgrass': 'Everyday layers for foggy days.', 'Mesa Trail': 'Gear for the long way round.', 'Foxglove': 'Built for the next climb.',
    'Fernway': 'Soft things for home.', 'Tidewell': 'Kitchen and bath basics.', 'Lumen': 'Light and sound for small rooms.',
    'Cobble Kids': 'Toys that last.', 'Northloop': 'Sound for the commute.',
  };
  var counts = {};
  base.forEach(function (p) { if (TAGLINES[p.brand]) counts[p.brand] = (counts[p.brand] || 0) + 1; });
  var adBrand = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
  var brandAd = '';
  if (adBrand && counts[adBrand] >= 2) {
    var adItems = RB_CATALOG.filter(function (p) { return p.brand === adBrand; }).slice(0, 3);
    brandAd = '<div class="brand-ad"><div>' + RB.sponsoredHTML() + '<div class="brand-name">' + esc(adBrand) + '</div><p style="margin:4px 0 8px">' + esc(TAGLINES[adBrand]) + '</p>' +
      '<a href="search?q=' + encodeURIComponent(adBrand) + '">Shop ' + esc(adBrand) + ' ›</a></div><div class="ad-row">' +
      adItems.map(function (p, i) { return '<a href="product?id=' + p.id + '">' + RB.imgTag(p, i + 2, '', true) + esc(p.name.split(',')[0]) + '</a>'; }).join('') + '</div></div>';
  }
  var results = '<div><div class="results-head">' + h(1, 'Results for ' + label, '') +
    '<p id="status"' + (on(9) ? '' : ' role="status"') + '></p>' +
    (found.corrected ? '<p class="fix-note">Showing results for <b><i>' + esc(found.corrected) + '</i></b>. Search instead for <a href="search?q=' + encodeURIComponent(q) + '&exact=1">' + esc(q) + '</a></p>' : '') +
    '</div>' + brandAd + '<div class="results-grid' + (asList ? ' as-list' : '') + '" id="grid"></div>' +
    (on(11) ? '<p class="more-results"><a href="#">Click here</a> for more results</p>' : '') + '</div>';

  var main = RB.mount(bar + '<div class="results-layout">' + side + results + '</div>', { title: 'Results for ' + (q || catName || 'all') });

  function filtered() {
    var list = base.filter(function (p) {
      if (p.price < state.min || p.price > state.max) return false;
      if (state.stars4 && p.rating < 4) return false;
      if (state.fast && p.ship.std[1] > 2) return false;
      if (state.brands.length && state.brands.indexOf(p.brand) === -1) return false;
      if (state.connectors.length && state.connectors.indexOf(connectorOf(p)) === -1) return false;
      return true;
    });
    var sorters = {
      low: function (a, b) { return a.price - b.price; },
      high: function (a, b) { return b.price - a.price; },
      rating: function (a, b) { return b.rating - a.rating; },
      featured: function (a, b) { return (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0) || (relevance[b.id] || 0) - (relevance[a.id] || 0) || b.reviews - a.reviews; },
    };
    return list.slice().sort(sorters[state.sort]);
  }
  function render(changed) {
    var list = filtered();
    main.querySelector('#grid').innerHTML = list.length
      ? list.map(function (p, i) { return RB.cardHTML(p, i); }).join('')
      : base.length
        ? '<div class="empty">No products match these filters. Try removing a filter.</div>'
        : '<div class="empty">' + h(2, 'No results for ' + label) + '<p>Try checking your spelling, or use fewer or more general words.</p>' +
          '<p>Popular right now: ' + ['usb-c charger', 'headphones', 'hoodie', 'water bottle'].map(function (x) { return '<a href="search?q=' + encodeURIComponent(x) + '">' + x + '</a>'; }).join(', ') + '</p></div>';
    var n = list.length;
    main.querySelector('#count-line').innerHTML = (n > 1 ? '1–' + n + ' of ' + n + ' results' : n === 1 ? '1 result' : 'No results') + ' for <b class="q">' + label + '</b>';
    // Issue 9: with it on, the results change silently. The status line only updates for sighted users.
    main.querySelector('#status').textContent = n + (n === 1 ? ' result' : ' results') + (changed ? ' after filtering' : '');
  }
  render(false);

  main.querySelector('#sort').onchange = function (e) { state.sort = e.target.value; render(true); };
  main.querySelector('#f-stars').onchange = function (e) { state.stars4 = e.target.checked; render(true); };
  main.querySelector('#f-fast').onchange = function (e) { state.fast = e.target.checked; render(true); };
  main.querySelectorAll('[data-connector]').forEach(function (cb) {
    cb.onchange = function () {
      state.connectors = Array.from(main.querySelectorAll('[data-connector]:checked')).map(function (x) { return x.getAttribute('data-connector'); });
      render(true);
    };
  });
  main.querySelectorAll('[data-brand]').forEach(function (cb) {
    cb.onchange = function () {
      state.brands = Array.from(main.querySelectorAll('[data-brand]:checked')).map(function (x) { return x.getAttribute('data-brand'); });
      render(true);
    };
  });

  if (on(19)) {
    var slider = main.querySelector('#slider');
    var fill = slider.querySelector('.fill');
    var pos = { min: 0, max: 1 };
    var draw = function () {
      var kmin = slider.querySelector('[data-k=min]'), kmax = slider.querySelector('[data-k=max]');
      kmin.style.left = pos.min * 100 + '%'; kmax.style.left = pos.max * 100 + '%';
      fill.style.left = pos.min * 100 + '%'; fill.style.width = (pos.max - pos.min) * 100 + '%';
      state.min = Math.round(pos.min * maxPrice); state.max = Math.round(pos.max * maxPrice) + (pos.max === 1 ? 1 : 0);
      main.querySelector('#slider-label').textContent = '$' + state.min + ' – $' + Math.round(pos.max * maxPrice) + (pos.max === 1 ? '+' : '');
    };
    draw();
    slider.querySelectorAll('.knob').forEach(function (knob) {
      knob.addEventListener('pointerdown', function (e) {
        knob.setPointerCapture(e.pointerId);
        var move = function (ev) {
          var r = slider.getBoundingClientRect();
          var x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
          var k = knob.getAttribute('data-k');
          if (k === 'min') pos.min = Math.min(x, pos.max - 0.05); else pos.max = Math.max(x, pos.min + 0.05);
          draw();
        };
        var up = function () { knob.removeEventListener('pointermove', move); knob.removeEventListener('pointerup', up); render(true); };
        knob.addEventListener('pointermove', move);
        knob.addEventListener('pointerup', up);
      });
    });
  } else {
    main.querySelector('#price-form').onsubmit = function (e) {
      e.preventDefault();
      var lo = parseFloat(main.querySelector('#pmin').value), hi = parseFloat(main.querySelector('#pmax').value);
      state.min = isNaN(lo) ? 0 : lo; state.max = isNaN(hi) ? maxPrice : hi;
      render(true);
    };
  }
})();
