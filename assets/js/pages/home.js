// Home page: banner carousel, department tiles, today's deals, best sellers.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc;

  var SLIDES = [
    { img: 'hero-tech', title: 'Campus tech, sorted', text: 'Chargers, cables and headphones for the new quarter. Most arrive in two days.', cta: 'Shop electronics', href: 'search?cat=electronics' },
    { img: 'hero-cozy', title: 'Make your place cozier', text: 'Knit throws, kettles and mugs for colder evenings.', cta: 'Shop home & kitchen', href: 'search?cat=home' },
    { img: 'hero-outdoors', title: 'A weekend on the trail', text: 'Daypacks, water bottles and lanterns for a few hours outside.', cta: 'Shop sports & outdoors', href: 'search?cat=outdoors' },
  ];
  var TILES = [
    { title: 'Charge up for less', ids: ['rb-20w-usbc-charger', 'kestrel-65w-gan', 'pebble-20w-2pack', 'rb-usbc-cable-6ft'], more: 'search?q=charger', moreText: 'Shop all chargers' },
    { title: 'Cozy home picks', ids: ['fernway-throw-blanket', 'hearth-oak-kettle', 'hearth-oak-mug-set', 'lumen-desk-lamp'], more: 'search?cat=home', moreText: 'Shop home & kitchen' },
    { title: 'Gear for the trail', ids: ['mesa-trail-daypack', 'foxglove-bottle-24oz', 'mesa-trail-lantern', 'mesa-trail-runners'], more: 'search?cat=outdoors', moreText: 'Shop sports & outdoors' },
    { title: 'New in books', ids: ['book-bay-area-birds', 'book-orchard-at-dusk', 'book-small-habits', 'cobble-puzzle'], more: 'search?cat=books', moreText: 'Shop books' },
  ];

  // ── Banner carousel ───────────────────────────────────────────────────────
  var hero = '<section class="hero"' + (on(12) ? '' : ' aria-roledescription="carousel" aria-label="Featured"') + '>';
  SLIDES.forEach(function (s, i) {
    // Banners are decorative (the words are real text on top), so the clean version uses alt="".
    // Issue 1 leaves out alt, so a screen reader reads the file name instead.
    var alt = on(1) ? '' : ' alt=""';
    hero += '<div class="hero-slide' + (i === 0 ? ' is-current' : '') + '"' +
      (on(12) ? '' : ' role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + SLIDES.length + '"') + '>' +
      '<img src="assets/img/banners/' + s.img + '.webp"' + alt + ' width="1800" height="600">' +
      '<div class="hero-copy">' + h(2, esc(s.title)) + '<p>' + esc(s.text) + '</p><a class="btn btn-cart" href="' + s.href + '">' + esc(s.cta) + '</a></div></div>';
  });
  // Issue 2: the arrows have no names.
  hero += '<button type="button" class="hero-ctrl hero-prev"' + (on(2) ? '' : ' aria-label="Previous slide"') + '>‹</button>';
  hero += '<button type="button" class="hero-ctrl hero-next"' + (on(2) ? '' : ' aria-label="Next slide"') + '>›</button>';
  hero += '</section>';

  // ── Tiles ─────────────────────────────────────────────────────────────────
  var tiles = '<div class="home-tiles wrap">';
  TILES.forEach(function (t, ti) {
    tiles += '<div class="tile">' + h(2, esc(t.title)) + '<div class="tile-grid">';
    t.ids.forEach(function (id, i) {
      var p = RB.byId(id);
      tiles += '<a href="product?id=' + id + '">' + RB.imgTag(p, ti * 4 + i, '', true) + esc(p.name.split(',')[0]) + '</a>';
    });
    // Issue 11: "See more" instead of saying where the link goes.
    tiles += '</div><a href="' + t.more + '">' + (on(11) ? 'See more' : esc(t.moreText)) + '</a></div>';
  });
  tiles += '</div>';

  // ── Today's deals ─────────────────────────────────────────────────────────
  var deals = RB_CATALOG.filter(function (p) { return p.list && p.list - p.price >= 5; }).slice(0, 10);
  var dealHTML = '<section class="shelf wrap"><div class="shelf-head">' + h(2, 'Today’s deals') +
    '<a href="search?deals=1">' + (on(11) ? 'See more' : 'See all deals') + '</a></div><div class="shelf-row">';
  deals.forEach(function (p, i) {
    var off = Math.round((1 - p.price / p.list) * 100);
    dealHTML += '<a class="deal-card" href="product?id=' + p.id + '">' + RB.imgTag(p, i + 3, '', true) +
      '<span class="badge badge-deal">' + off + '% off</span>' +
      // Issue 23: a countdown that restarts on every visit.
      (on(23) ? '<span class="deal-timer" data-countdown>Ends in 04:59:59</span>' : '<span class="fine">Deal</span>') +
      '<div class="deal-name">' + esc(RB.titleOf(p)) + '</div>' +
      '<div>' + RB.priceHTML(p.price) + ' ' + RB.listPriceHTML(p) + '</div></a>';
  });
  dealHTML += '</div></section>';

  // ── Best sellers (auto-scrolling with issue 26) ───────────────────────────
  var best = RB_CATALOG.filter(function (p) { return p.reviews > 5000; }).slice(0, 12);
  var bestHTML = '<section class="shelf wrap"><div class="shelf-head">' + h(2, 'Best sellers') + '</div><div class="carousel-wrap">';
  if (!on(26)) bestHTML += '<p class="fine" style="margin:0 0 8px">Use the arrows to see more.</p>';
  bestHTML += '<div class="carousel" id="best">';
  best.forEach(function (p, i) {
    bestHTML += '<a class="deal-card" href="product?id=' + p.id + '">' + RB.imgTag(p, i + 7, '', true) +
      '<div class="deal-name">' + esc(RB.titleOf(p)) + '</div>' + RB.starsHTML(p, false) +
      '<div>' + RB.priceHTML(p.price) + '</div></a>';
  });
  bestHTML += '</div>';
  if (!on(26)) {
    bestHTML += '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn btn-plain" data-scroll="-1">Previous</button>' +
      '<button type="button" class="btn btn-plain" data-scroll="1">Next</button></div>';
  }
  bestHTML += '</div></section>';

  var main = RB.mount(h(1, 'Redbird: shop chargers, home, clothing and more', 'sr-only') + hero + tiles + dealHTML + bestHTML, { title: 'Online shopping for chargers, home, clothing and more' });
  document.title = 'Redbird: Online shopping for chargers, home, clothing and more';

  // Carousel behavior
  var slides = main.querySelectorAll('.hero-slide');
  var cur = 0;
  function show(n) {
    slides[cur].classList.remove('is-current');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('is-current');
  }
  main.querySelector('.hero-prev').onclick = function () { show(cur - 1); };
  main.querySelector('.hero-next').onclick = function () { show(cur + 1); };
  // Issue 28: the banner rotates on its own every 4 seconds and cannot be paused.
  if (on(28)) setInterval(function () { show(cur + 1); }, 4000);

  var best$ = main.querySelector('#best');
  if (on(26)) {
    setInterval(function () {
      var max = best$.scrollWidth - best$.clientWidth;
      best$.scrollLeft = best$.scrollLeft >= max - 5 ? 0 : best$.scrollLeft + 196;
    }, 2500);
  } else {
    main.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.onclick = function () { best$.scrollLeft += Number(b.getAttribute('data-scroll')) * 600; };
    });
  }

  if (on(23)) {
    var end = Date.now() + (4 * 3600 + 59 * 60 + 59) * 1000;
    setInterval(function () {
      var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      var t = 'Ends in ' + String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      main.querySelectorAll('[data-countdown]').forEach(function (el) { el.textContent = t; });
    }, 1000);
  }
})();
