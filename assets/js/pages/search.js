// Search and category results with filters.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc;
  var q = (RB.param('q') || '').trim();
  var cat = RB.param('cat') || '';
  var dealsOnly = RB.param('deals') === '1';
  var catName = cat ? (RB_CATEGORIES.find(function (c) { return c.id === cat; }) || {}).name : '';

  // Matching and ranking live in find.js (shared with the suggestions under the search box).
  var pool = RB_CATALOG.filter(function (p) { return (!cat || p.cat === cat) && (!dealsOnly || p.deal); });
  var found = RB_FIND.rank(q, pool, { exact: RB.param('exact') === '1' });
  var base = found.results.map(function (r) { return r.p; });
  var relevance = {};
  found.results.forEach(function (r) { relevance[r.p.id] = r.score; });
  var brands = Array.from(new Set(base.map(function (p) { return p.brand; }))).sort();
  var maxPrice = Math.ceil(Math.max.apply(null, base.map(function (p) { return p.price; }).concat([10])));
  var state = { min: 0, max: maxPrice, stars4: false, fast: false, picked: {}, sort: 'featured' };

  // Filters built from each product's attrs, like a real store's sidebar. Each one lists only the
  // values found in these results. A product passes a filter if it has any of the checked values,
  // and has to pass every filter that has something checked.
  function bucket(edges) {
    return function (v) { var b = edges.find(function (e) { return v <= e[0]; }); return v == null || !b ? null : b[1]; };
  }
  var WATTS = [[19, 'Under 20W'], [29, '20 to 29W'], [59, '30 to 59W'], [100, '60 to 100W'], [Infinity, 'Over 100W']];
  var FEET = [[3, 'Up to 3 ft'], [6, '4 to 6 ft'], [Infinity, 'Over 6 ft']];
  // Which phones a cable, a charger with its own cable, a case or a screen protector fits.
  // Plain chargers work with anything through a cable, so they don't get a value.
  function worksWith(p) {
    var a = p.attrs || {}, c = a.Connector || [], out = [];
    var fits = ((p.specs || []).find(function (s) { return /^(fits|works with)$/i.test(s[1]); }) || [])[2] || '';
    if (/iPhone 16/.test(fits)) out.push('iPhone 16');
    if (/iPhone 15/.test(fits)) out.push('iPhone 15');
    if (/Galaxy S24/.test(fits)) out.push('Samsung Galaxy S24');
    if (/Magnetic iPhones/i.test(fits)) out.push('iPhone 12 and newer (MagSafe)');
    if (a.Type === 'Cable' || (a.Type === 'Wall charger' && a['Cable length (ft)'])) {
      // The end that goes into the phone: Lightning if there is one, otherwise USB-C.
      if (c.indexOf('Lightning') !== -1) out.push('iPhone 14 and older');
      else if (c.indexOf('USB-C') !== -1) out.push('iPhone 15 and newer', 'Android phones');
    }
    return out;
  }
  var SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  function attr(name, fmt) {
    return function (p) { return [].concat((p.attrs || {})[name]).filter(function (v) { return v != null; }).map(fmt || String); };
  }
  var FACETS = [
    // Books have authors, not brands, so they only show under Author.
    { key: 'brand', title: 'Brand', of: function (p) { return p.cat === 'books' ? [] : [p.brand]; }, sort: 'abc' },
    { key: 'deal', title: 'Deals & discounts', of: function (p) {
      return [p.list ? 'All discounts' : null, p.deal ? 'Today’s deals' : null, RB.couponOf(p) ? 'Coupons' : null,
      p.subscribe ? 'Subscribe & Save' : null];
    }, order: ['All discounts', 'Today’s deals', 'Coupons', 'Subscribe & Save'], one: true },
    { key: 'ships', title: 'Ships from', of: function (p) { return [p.ship.std[0] >= 10 ? 'Overseas sellers' : 'Redbird']; }, order: ['Redbird', 'Overseas sellers'] },
    { key: 'type', title: 'Product type', of: attr('Type') },
    { key: 'watt', title: 'Wattage', of: attr('Wattage', bucket(WATTS)), order: WATTS.map(function (e) { return e[1]; }) },
    { key: 'conn', title: 'Connector type', of: attr('Connector') },
    { key: 'works', title: 'Works with', of: worksWith },
    { key: 'ports', title: 'Number of ports', of: attr('Ports', function (n) { return n + (n === 1 ? ' port' : ' ports'); }), sort: 'abc' },
    { key: 'count', title: 'Number of items', of: attr('Count'), sort: 'abc' },
    { key: 'cable', title: 'Cable length', of: attr('Cable length (ft)', bucket(FEET)), order: FEET.map(function (e) { return e[1]; }) },
    { key: 'feat', title: 'Features', of: attr('Features') },
    { key: 'gender', title: 'Gender', of: attr('Department') },
    { key: 'size', title: 'Size', of: function (p) { return p.sizes || []; }, order: null, sort: 'size' },
    { key: 'fit', title: 'Fit', of: attr('Fit') },
    { key: 'act', title: 'Activity', of: attr('Activity') },
    { key: 'format', title: 'Format', of: attr('Format') },
    { key: 'genre', title: 'Genre', of: attr('Genre') },
    { key: 'author', title: 'Author', of: attr('Author'), sort: 'abc' },
    { key: 'diet', title: 'Diet', of: attr('Diet') },
    { key: 'age', title: 'Age range', of: attr('Age'), sort: 'abc' },
    { key: 'material', title: 'Material', of: attr('Material') },
    { key: 'color', title: 'Color', of: function (p) { return (p.swatches || []).map(function (c) { return c.name; }); } },
  ];
  FACETS.forEach(function (f) {
    var count = {};
    base.forEach(function (p) {
      f.of(p).filter(Boolean).forEach(function (v) { count[v] = (count[v] || 0) + 1; });
    });
    f.values = Object.keys(count).sort(function (a, b) {
      if (f.sort === 'size') {
        var ia = SIZES.indexOf(a), ib = SIZES.indexOf(b);
        return ia !== -1 && ib !== -1 ? ia - ib : ia !== -1 ? -1 : ib !== -1 ? 1 : parseFloat(a) - parseFloat(b);
      }
      return f.order ? f.order.indexOf(a) - f.order.indexOf(b)
        : f.sort === 'abc' ? a.localeCompare(b, 'en', { numeric: true }) : count[b] - count[a] || a.localeCompare(b);
    });
    // Brand and deals show even with one value. Others need a real choice that covers 2+ products.
    var covered = base.filter(function (p) { return f.of(p).some(Boolean); }).length;
    f.show = f.values.length && (f.key === 'brand' || f.one || (f.values.length > 1 && covered > 1));
  });
  // Electronics results are shown as a list (photo on the left), like real stores show them.
  var asList = base.length && base.filter(function (p) { return p.cat === 'electronics'; }).length > base.length / 2;
  var label = q ? '“' + esc(q) + '”' : dealsOnly ? 'Today’s deals' : catName || 'All departments';

  // ── Sidebar ───────────────────────────────────────────────────────────────
  var SHOW = 6; // options shown before "See more"
  function heading(text, id) {
    return on(11) ? '<div class="h2" id="' + id + '">' + text + '</div>' : '<h2 id="' + id + '">' + text + '</h2>';
  }
  function facetHTML(f) {
    var id = 'fh-' + f.key;
    return '<div class="facet" data-key="' + f.key + '">' + heading(esc(f.title), id) +
      '<button type="button" class="f-clear" hidden>Clear</button>' +
      '<div' + (on(11) ? '' : ' role="group" aria-labelledby="' + id + '"') + '><ul>' + f.values.map(function (v, i) {
        return '<li' + (i >= SHOW ? ' class="f-extra" hidden' : '') + '><label><input type="checkbox" data-facet="' + f.key + '" value="' + esc(v) + '"> ' + esc(v) + '</label></li>';
      }).join('') + '</ul></div>' +
      (f.values.length > SHOW ? '<button type="button" class="f-see" aria-expanded="false">See more</button>' : '') + '</div>';
  }
  var facetOf = {};
  FACETS.forEach(function (f) { facetOf[f.key] = f; });
  var side = '<details class="f-wrap" open><summary>Filters</summary><div class="filters"' + (on(11) ? '' : ' role="region" aria-label="Filters"') + '>';
  side += h(2, 'Delivery day') + '<label><input type="checkbox" id="f-fast"> Get it in 2 days</label>';
  side += h(2, 'Department') + '<ul>' + RB_CATEGORIES.map(function (c) {
    return '<li><a href="search?cat=' + c.id + (q ? '&q=' + encodeURIComponent(q) : '') + '"' + (c.id === cat ? ' aria-current="page" style="font-weight:700;color:var(--ink)"' : '') + '>' + esc(c.name) + '</a></li>';
  }).join('') + '</ul>';
  side += h(2, 'Customer reviews') + '<label><input type="checkbox" id="f-stars"> 4 stars &amp; up</label>';
  if (facetOf.brand.show) side += facetHTML(facetOf.brand);
  side += h(2, 'Price');
  if (on(18)) {
    // Issue 18: the price filter is a drag-only slider built from divs.
    side += '<div class="drag-slider" id="slider"><div class="track"></div><div class="fill"></div>' +
      '<div class="knob" data-k="min"></div><div class="knob" data-k="max"></div></div>' +
      '<div class="fine" id="slider-label">$0 – $' + maxPrice + '+</div>';
  } else {
    // Price ranges that have something in them, then min and max boxes.
    var EDGES = [0, 10, 20, 35, 50, 100, Infinity];
    var ranges = [];
    for (var e = 0; e < EDGES.length - 1; e++) {
      var lo = EDGES[e], hi = EDGES[e + 1];
      if (base.some(function (p) { return p.price >= lo && p.price < hi; })) {
        ranges.push([lo, hi, lo === 0 ? 'Up to $' + hi : hi === Infinity ? '$' + lo + ' & above' : '$' + lo + ' to $' + hi]);
      }
    }
    side += '<div' + (on(11) ? '' : ' role="radiogroup" aria-label="Price range"') + '><ul><li><label><input type="radio" name="price-range" value="" checked> Any price</label></li>' +
      ranges.map(function (r) { return '<li><label><input type="radio" name="price-range" value="' + r[0] + '-' + r[1] + '"> ' + r[2] + '</label></li>'; }).join('') + '</ul></div>' +
      '<form class="price-boxes" id="price-form"><label class="sr-only" for="pmin">Minimum price in dollars</label><input id="pmin" inputmode="decimal" placeholder="$ Min">' +
      '<span aria-hidden="true">–</span><label class="sr-only" for="pmax">Maximum price in dollars</label><input id="pmax" inputmode="decimal" placeholder="$ Max">' +
      '<button type="submit">Go</button></form>';
  }
  FACETS.forEach(function (f) { if (f.key !== 'brand' && f.show) side += facetHTML(f); });
  side += '</div></details>';

  // ── Results column ────────────────────────────────────────────────────────
  var bar = '<div class="results-bar"><span id="count-line"></span>' +
    '<label>Sort by <select id="sort"><option value="featured">Featured</option><option value="low">Price: low to high</option>' +
    '<option value="high">Price: high to low</option><option value="rating">Customer rating</option></select></label></div>';
  // A sponsored brand banner above the results, like real stores have.
  var TAGLINES = {
    'Hanker': 'Charge everything at once.', 'Pebble Power': 'Small chargers, big batteries.', 'Hearth & Oak': 'Made for slow mornings.',
    'Saltgrass': 'Everyday layers for foggy days.', 'Mesa Trail': 'Gear for the long way round.', 'Foxglove': 'Built for the next climb.', 'Stanwell': 'Cold for the whole day.', 'BadgerBox': 'Cases that take the drop.',
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
    // The count is already in the bar above, so the status line is only for screen readers.
    '<p id="status"' + (on(8) ? '' : ' class="sr-only" role="status"') + '></p>' +
    (found.corrected ? '<p class="fix-note">Showing results for <b><i>' + esc(found.corrected) + '</i></b>. Search instead for <a href="search?q=' + encodeURIComponent(q) + '&exact=1">' + esc(q) + '</a></p>' : '') +
    '</div>' + brandAd + '<div class="results-grid' + (asList ? ' as-list' : '') + '" id="grid"></div>' +
    (on(10) ? '<p class="more-results"><a href="search' + (cat ? '?cat=' + cat : '') + '">Click here</a> for more results</p>' : '') + '</div>';

  var main = RB.mount(bar + '<div class="results-layout">' + side + results + '</div>', { title: 'Results for ' + (q || catName || 'all') });

  function filtered() {
    var list = base.filter(function (p) {
      if (p.price < state.min || p.price > state.max) return false;
      if (state.stars4 && p.rating < 4) return false;
      if (state.fast && p.ship.std[1] > 2) return false;
      for (var k in state.picked) {
        var want = state.picked[k];
        if (want.length && !facetOf[k].of(p).some(function (v) { return want.indexOf(v) !== -1; })) return false;
      }
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
    // Issue 8: with it on, the results change silently. The status line only updates for sighted users.
    main.querySelector('#status').textContent = n + (n === 1 ? ' result' : ' results') + (changed ? ' after filtering' : '');
  }
  render(false);

  main.querySelector('#sort').onchange = function (e) { state.sort = e.target.value; render(true); };
  main.querySelector('#f-stars').onchange = function (e) { state.stars4 = e.target.checked; render(true); };
  main.querySelector('#f-fast').onchange = function (e) { state.fast = e.target.checked; render(true); };
  main.querySelectorAll('.facet').forEach(function (box) {
    var key = box.getAttribute('data-key'), clear = box.querySelector('.f-clear'), see = box.querySelector('.f-see');
    var boxes = box.querySelectorAll('[data-facet]');
    function update() {
      state.picked[key] = Array.from(boxes).filter(function (x) { return x.checked; }).map(function (x) { return x.value; });
      clear.hidden = !state.picked[key].length;
      render(true);
    }
    boxes.forEach(function (cb) { cb.onchange = update; });
    clear.onclick = function () {
      boxes.forEach(function (x) { x.checked = false; });
      update();
      box.querySelector('[data-facet]').focus();
    };
    if (see) see.onclick = function () {
      var open = see.getAttribute('aria-expanded') !== 'true';
      box.querySelectorAll('.f-extra').forEach(function (li) { li.hidden = !open; });
      see.setAttribute('aria-expanded', String(open));
      see.textContent = open ? 'See less' : 'See more';
    };
  });
  // Filters fold away behind a "Filters" button on narrow screens.
  var wrap = main.querySelector('.f-wrap'), narrow = window.matchMedia('(max-width: 860px)');
  function fold() { wrap.open = !narrow.matches; }
  fold();
  if (narrow.addEventListener) narrow.addEventListener('change', fold);

  if (on(18)) {
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
      main.querySelector('[name=price-range][value=""]').checked = isNaN(lo) && isNaN(hi);
      main.querySelectorAll('[name=price-range]:not([value=""])').forEach(function (r) { r.checked = false; });
      render(true);
    };
    main.querySelectorAll('[name=price-range]').forEach(function (r) {
      r.onchange = function () {
        var parts = r.value ? r.value.split('-').map(Number) : [0, Infinity];
        // Ranges include their low end and stop just under the high end, like "$10 to $20".
        state.min = parts[0]; state.max = parts[1] === Infinity ? maxPrice : parts[1] - 0.001;
        main.querySelector('#pmin').value = ''; main.querySelector('#pmax').value = '';
        render(true);
      };
    });
  }
})();
