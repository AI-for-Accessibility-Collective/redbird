// Product page: gallery, details, buy box, and everything below it.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var p = RB.byId(RB.param('id') || '') || (RB.param('id') ? null : RB.byId('rb-20w-usbc-charger'));
  if (!p) { if (window.RB_NOT_FOUND) window.RB_NOT_FOUND(); return; }
  var cat = RB_CATEGORIES.find(function (c) { return c.id === p.cat; });
  var anyIssues = RB_ISSUES.any;
  var isBook = p.cat === 'books';
  var reviewData = (window.RB_REVIEWS || {})[p.id] || { reviews: [], questions: [], aspects: [] };
  // Books and Redbird's own brand are sold by Redbird, the way Amazon Basics is sold by Amazon.
  function sellerOf(x) { return x.cat === 'books' || x.brand === 'Redbird Basics' ? 'Redbird' : x.brand; }
  // A number that is the same for a product on every visit (model numbers, the star spread).
  function seed(s) {
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) { n ^= s.charCodeAt(i); n = Math.imul(n, 16777619); }
    return n >>> 0;
  }
  function longDate(iso) { return new Date(iso + 'T10:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }

  // ── Breadcrumbs and gallery ───────────────────────────────────────────────
  // The sub-department for the breadcrumb and the Best Sellers Rank: the genre for books,
  // otherwise picked from the product's name.
  var SUBS = {
    electronics: [[/power bank/i, 'Portable chargers'], [/wireless charging|charging station/i, 'Wireless chargers'], [/charger/i, 'Chargers & power adapters'],
      [/cable/i, 'Cables'], [/earbuds|headphones/i, 'Headphones'], [/case/i, 'Phone cases'], [/screen protector/i, 'Screen protectors'], [/speaker/i, 'Speakers']],
    home: [[/kettle|French press|frother/i, 'Coffee & tea'], [/mugs|skillet|Dutch oven|containers/i, 'Kitchen & dining'], [/towels/i, 'Bath'],
      [/sheet|pillows/i, 'Bedding'], [/lamp/i, 'Lighting'], [/blanket|planter/i, 'Home decor']],
    clothing: [[/shoes|boots/i, 'Shoes'], [/./, 'Clothing']],
    outdoors: [[/yoga/i, 'Yoga'], [/bottle|tumbler/i, 'Water bottles'], [/./, 'Hiking & camping']],
    grocery: [[/coffee|tea\b/i, 'Coffee & tea'], [/sparkling water/i, 'Drinks'], [/./, 'Pantry']],
    toys: [[/game/i, 'Board games'], [/./, 'Learning toys']],
  };
  var GENRES = { Cooking: 'Cookbooks', Kids: 'Children’s books' };
  function subOf(x) {
    if (x.cat === 'books') return GENRES[x.attrs.Genre] || x.attrs.Genre;
    return ((SUBS[x.cat] || []).find(function (s) { return s[0].test(x.name); }) || [null, null])[1];
  }
  var sub = subOf(p);
  // Books end at the genre, like real bookstores; other products end at the brand.
  var crumbs = '<nav class="crumbs"' + (on(11) ? '' : ' aria-label="Breadcrumb"') + '><ol><li><a href="./">Redbird</a></li>' +
    '<li><a href="search?cat=' + p.cat + '">' + esc(cat.name) + '</a></li>' +
    (sub ? '<li><a href="search?cat=' + p.cat + '">' + esc(sub) + '</a></li>' : '') +
    (isBook ? '' : '<li aria-current="page">' + esc(p.brand) + '</li>') + '</ol></nav>';
  // Photos: the main one, then the extras listed in assets/js/images.js.
  var extra = (window.RB_IMAGES || {})[p.id] || { gallery: [], colors: {}, reviews: [] };
  var shots = [{ src: RB.imgSrc(p), alt: p.name }].concat(extra.gallery);
  // Issue 1: alt text is missing, a camera file name, or just "product image".
  var BAD_ALTS = [null, 'IMG_2931.jpg', 'product image', null, 'DSC00418.webp'];
  function altAttr(text, i) {
    var a = on(1) ? BAD_ALTS[i % BAD_ALTS.length] : text;
    return a === null ? '' : ' alt="' + esc(a) + '"';
  }
  // Issue 22: the thumbnails are plain images that only switch the photo on mouse hover,
  // and the big photo zooms under the mouse ("Roll over image to zoom in"). No click, no keyboard.
  var gallery = '<div class="gallery"><div class="thumbs">' + shots.map(function (s, i) {
    if (on(22)) return '<div class="thumb' + (i === 0 ? ' is-on' : '') + '" data-shot="' + i + '"><img src="' + s.src + '" alt=""></div>';
    return '<button type="button" data-shot="' + i + '" aria-pressed="' + (i === 0) + '"' +
      (on(2) ? '' : ' aria-label="Show image ' + (i + 1) + ' of ' + shots.length + '"') + '><img src="' + s.src + '" alt=""></button>';
  }).join('') + (p.video ? '<a class="thumb-video" href="#video"><img src="assets/video/' + p.id + '-poster.webp" alt=""><span aria-hidden="true">▶</span>VIDEO</a>' : '') + '</div><div class="main-img"><img id="main-img" src="' + shots[0].src + '"' + altAttr(shots[0].alt, 0) + ' width="520" height="520"></div>' + (on(22) ? '<p class="fine zoom-hint">Roll over image to zoom in</p>' : '') + '</div>';

  // ── Details column ────────────────────────────────────────────────────────
  var off = p.list ? Math.round((1 - p.price / p.list) * 100) : 0;
  var info = '<div class="pdp-info">';
  if (isBook) {
    info += h(1, esc(RB.titleOf(p)));
    info += '<p class="byline">by <a href="search?q=' + encodeURIComponent(p.brand) + '">' + esc(p.brand) + '</a> <span class="fine">(Author)</span></p>';
  } else {
    info += '<a class="store-link" href="search?q=' + encodeURIComponent(p.brand) + '">Visit the ' + esc(p.brand) + ' store</a>';
    info += h(1, esc(RB.titleOf(p)));
  }
  info += '<div>' + RB.starsHTML(p) + '</div>' + RB.boughtHTML(p);
  if (p.badge) info += '<div style="margin-top:6px">' + RB.badgeHTML(p) + '</div>';
  info += '<hr>';
  info += '<div class="price-block">' + (off ? '<span class="save">-' + off + '%</span>' : '') + RB.priceHTML(p.price, 'price-lg') + '</div>';
  info += '<div>' + RB.listPriceHTML(p) + '</div><div class="fine" style="margin-top:4px"><a href="help#returns">FREE Returns</a></div>';
  if (RB.couponOf(p)) {
    info += '<label class="coupon-row"><input type="checkbox" id="coupon"> <span class="coupon">Coupon</span> Apply ' + RB.couponOf(p) + '% coupon</label>';
  }
  if (p.badge === 'Limited time deal' && on(24)) info += '<div class="deal-timer" data-countdown>Deal ends in 04:59:59</div>';

  if (p.swatches) {
    if (on(6)) {
      // Issue 6: color choices are plain colored circles with no names.
      info += '<div class="swatches-bad"><div style="font-size:14.5px;margin:12px 0 6px">Color: <b id="color-name">' + esc(p.swatches[0].name) + '</b></div><div class="swatches">' +
        p.swatches.map(function (s, i) {
          return '<div class="swatch"><span data-swatch="' + i + '" style="background:' + s.hex + (i === 0 ? ';box-shadow:0 0 0 2.5px var(--cardinal)' : '') + '"></span></div>';
        }).join('') + '</div></div>';
    } else {
      info += '<fieldset class="swatches"><legend>Color: <b id="color-name">' + esc(p.swatches[0].name) + '</b></legend>' +
        p.swatches.map(function (s, i) {
          return '<label class="swatch"><input type="radio" name="color" value="' + esc(s.name) + '"' + (i === 0 ? ' checked' : '') +
            ' aria-label="' + esc(s.name) + '"><span style="background:' + s.hex + '"></span></label>';
        }).join('') + '</fieldset>';
    }
  }
  if (p.sizes) {
    info += '<fieldset class="sizes"><legend>Size</legend>' + p.sizes.map(function (s) {
      return '<label class="size"><input type="radio" name="size" value="' + esc(s) + '"><span>' + esc(s) + '</span></label>';
    }).join('') + '</fieldset>';
    // How the sizes fit, from the reviews, and a size chart that opens in place.
    if (reviewData.fit) info += '<p class="fit-note"><b>Fit:</b> ' + esc(reviewData.fit) + ' <span class="fine">(based on customer reviews)</span></p>';
    var chart = sizeChart(p);
    if (chart) info += '<details class="size-chart"><summary>Size chart</summary>' + chart + '</details>';
  }
  // The top facts, like the short table real stores show above "About this item". Issues 9 and 32 apply here too.
  info += '<table class="top-specs">' + (on(9) ? '' : '<caption class="sr-only">Key facts</caption>') + [isBook ? ['Author', 'Author', p.brand] : ['Brand', 'Brand', p.brand]].concat(p.specs.slice(0, 3)).map(function (s) {
    var key = on(32) ? s[0] : s[1];
    return '<tr>' + (on(9) ? '<td><b>' + esc(key) + '</b></td>' : '<th scope="row">' + esc(key) + '</th>') + '<td>' + esc(s[2]) + '</td></tr>';
  }).join('') + '</table>';
  // Issue 26: "About this item" is five long bullets with 【ALL-CAPS LABELS】 and stuffed keywords.
  var aboutList = on(26) && p.bullets ? p.bullets : p.about;
  // Clean bullets start with a short label ("Fast charging: ..."), shown in bold like real listings.
  var bullet = function (a) {
    var m = !(on(26) && p.bullets) && /^([^:]{2,40}):\s(.*)$/.exec(a);
    return '<li>' + (m ? '<b>' + esc(m[1]) + ':</b> ' + esc(m[2]) : esc(a)) + '</li>';
  };
  info += '<div class="about' + (on(26) && p.bullets ? ' about-messy' : '') + '">' + h(2, 'About this item') + '<ul>' + aboutList.map(bullet).join('') + '</ul></div>';
  info += '</div>';

  // ── Buy box ───────────────────────────────────────────────────────────────
  var stock;
  if (on(24)) {
    // Issue 24: always says stock is about to run out.
    stock = '<div class="stock-low">Only ' + Math.min(p.stock, 2 + (p.id.length % 2)) + ' left in stock - order soon.</div>';
  } else {
    stock = p.stock > 5 ? '<div class="stock-ok">In stock</div>' : '<div class="stock-ok">In stock (' + p.stock + ' left)</div>';
  }
  var box = '<div class="buybox"' + (on(11) ? '' : ' role="region" aria-label="Buy"') + '>';
  box += RB.priceHTML(p.price, 'price-sm');
  box += RB.deliveryHTML(p, { full: true });
  box += '<div class="fine">' + RB.ICON.pinDark + ' Delivering to Palo Alto 94301</div>';
  box += stock;
  box += '<div><span id="qty-label" style="margin-right:8px">Quantity</span><div class="qty"' + (on(11) ? '' : ' role="group" aria-labelledby="qty-label"') + '>' +
    '<button type="button" data-qty="-1"' + (on(2) ? '' : ' aria-label="Decrease quantity"') + '>−</button>' +
    '<output id="qty" class="qty-val"' + (on(8) ? '' : ' aria-live="polite"') + '>1</output>' +
    '<button type="button" data-qty="1"' + (on(2) ? '' : ' aria-label="Increase quantity"') + '>+</button></div></div>';
  if (p.subscribe) {
    // Agent checkpoint V3: with issues on, "Subscribe & Save" (a repeat order) is picked for you.
    var subPicked = anyIssues;
    var subName = on(32) ? 'S&amp;S' : 'Subscribe &amp; Save';
    box += '<fieldset class="opt-group"><legend>How do you want to buy?</legend>' +
      '<label><input type="radio" name="buy" value="once"' + (subPicked ? '' : ' checked') + '> <span>One-time purchase: ' + money(p.price) + '</span></label>' +
      '<label><input type="radio" name="buy" value="sub"' + (subPicked ? ' checked' : '') + '> <span>' + subName + ' 5%: ' + money(p.price * 0.95) +
      (on(32) ? ' (auto-ship every 6 mo.)' : ', delivered again every 6 months until you cancel') + '</span></label></fieldset>';
  }
  if (p.protect) {
    // Agent checkpoint V2: with issues on, a paid protection plan is already ticked.
    box += '<label class="opt"><input type="checkbox" id="protect"' + (anyIssues ? ' checked' : '') + '> <span>Add a 2-year protection plan for ' + money(p.protect) + '</span></label>';
  }
  box += '<p class="error-box" id="buy-error" hidden></p>';
  box += RB.addButton('data-buy="cart" style="width:100%"');
  box += '<button type="button" class="btn btn-buy btn-block" data-buy="now">Buy now</button>';
  box += '<div class="seller"><span>Ships from</span><span>Redbird</span><span>Sold by</span><span>' + esc(sellerOf(p)) + '</span>' +
    '<span>Returns</span><span>Within 30 days</span><span>Payment</span><span>Secure transaction</span></div>';
  box += '<button type="button" class="btn btn-plain btn-block" id="add-list" data-saved="' + (RB.list.has(p.id) ? '1' : '0') + '">' + (RB.list.has(p.id) ? 'Added to your list' : 'Add to List') + '</button>';
  box += '<div class="fine">' + (on(10) ? '<a href="#policy">Click here</a> for details.' : '<a href="#policy">Return policy details</a>') + '</div>';
  box += '</div>';

  // ── Lower sections ────────────────────────────────────────────────────────
  var lower = '';
  // Frequently bought together: this item and two more from its department, ones that need no
  // color or size first. One that does need a choice gets a "Choose options" link and stays out
  // of the total, so the button adds exactly what the total adds up. This item goes in with the
  // color and size picked above.
  var needsChoice = function (x) { return x.swatches || x.sizes ? 1 : 0; };
  var fbt = RB_CATALOG.filter(function (x) { return x.cat === p.cat && x.id !== p.id; })
    .sort(function (a, b) { return needsChoice(a) - needsChoice(b) || b.reviews - a.reviews; }).slice(0, 2);
  var bundle = [p].concat(fbt.filter(function (x) { return !needsChoice(x); }));
  var bundleWord = ['', '', 'both', 'all three'][bundle.length];
  lower += '<section class="pdp-section">' + h(2, 'Frequently bought together') + '<div class="fbt"><div class="fbt-pics">' +
    [p].concat(fbt).map(function (x, i) { return (i ? '<span class="plus" aria-hidden="true">+</span>' : '') + '<a href="product?id=' + x.id + '"' + (on(1) ? '' : ' tabindex="-1" aria-hidden="true"') + '>' + RB.imgTag(x, i + 2, '', true) + '</a>'; }).join('') +
    '</div><ul class="fbt-list">' + [p].concat(fbt).map(function (x, i) {
      var label = i === 0 ? '<b>This item:</b> ' + esc(x.name) : '<a href="product?id=' + x.id + '">' + esc(x.name) + '</a>';
      var price = needsChoice(x) && i ? '<a href="product?id=' + x.id + '">Choose options<span class="sr-only"> for ' + esc(x.name) + '</span></a> <span class="fine">(not in the total)</span>' : '<b>' + money(x.price) + '</b>';
      return '<li>' + label + ' · ' + price + '</li>';
    }).join('') + '</ul>' +
    (bundle.length > 1 ? '<div class="fbt-buy">Total price: <b>' + money(bundle.reduce(function (s, x) { return s + x.price; }, 0)) + '</b><br>' +
      RB.addButton('data-fbt="1"', 'Add ' + bundleWord + ' to cart') + '<p class="error-box" id="fbt-error" hidden></p></div>' : '') +
    '</div></section>';

  if (on(23)) {
    // Issue 23: extra ads and sponsored rows that crowd the page.
    var ads = RB_CATALOG.filter(function (x) { return x.id !== p.id; }).slice(4, 9);
    lower += '<section class="pdp-section"><div class="h2" style="font-size:18px;font-weight:700;margin:0 0 8px">Sponsored products related to this item</div><div class="shelf-row">' +
      ads.map(function (x, i) { return '<a class="deal-card" href="product?id=' + x.id + '">' + RB.imgTag(x, i, '', true) + RB.sponsoredHTML() + '<div class="deal-name">' + esc(x.title) + '</div>' + RB.priceHTML(x.price) + '</a>'; }).join('') +
      '</div></section>' +
      '<section class="pdp-section" style="padding:0"><a href="search?cat=home" style="display:block;position:relative">' +
      '<img src="assets/img/banners/hero-cozy.webp" style="width:100%;height:180px;object-fit:cover">' +
      '<span style="position:absolute;left:30px;top:50%;transform:translateY(-50%);color:#fff;font:700 30px var(--serif);text-shadow:0 2px 10px #000">UP TO 40% OFF HOME • SHOP NOW ›</span></a></section>';
  }

  if (p.video) {
    lower += '<section class="pdp-section" id="video">' + h(2, 'Product video') + '<div class="video-box">' +
      // Issue 33: plays by itself, with sound, on a loop. Issue 36: no captions.
      '<video id="pvid" src="assets/video/' + p.id + '.mp4" playsinline' + (on(33) ? ' autoplay loop' : ' controls') + ' poster="assets/video/' + p.id + '-poster.webp">' +
      (on(36) ? '' : '<track kind="captions" src="assets/video/' + p.id + '.vtt" srclang="en" label="English" default>') +
      '</video></div></section>';
  }

  // Product information: the product's own specs, then the rows every listing has (model number,
  // size and weight, date first available, reviews, Best Sellers Rank). Books get book details instead.
  // Issue 32: row names are jargon and abbreviations. Issue 9: the table has no header cells.
  var infoRow = function (plainName, jargonName, valueHTML) {
    var key = esc(on(32) ? jargonName : plainName);
    return on(9) ? '<tr><td><div class="k">' + key + '</div></td><td>' + valueHTML + '</td></tr>'
      : '<tr><th scope="row">' + key + '</th><td>' + valueHTML + '</td></tr>';
  };
  var specRow = function (s) { return infoRow(s[1], s[0], esc(s[2])); };
  var isWeight = function (s) { return s[1] === 'Weight'; };
  var isDims = function (s) { return s[1] === 'Size' && /×/.test(s[2]); };
  var rank = function (list) {
    return list.sort(function (a, b) { return b.reviews - a.reviews; }).indexOf(p) + 1;
  };
  var catRank = rank(RB_CATALOG.filter(function (x) { return x.cat === p.cat; }));
  var subRank = sub ? rank(RB_CATALOG.filter(function (x) { return x.cat === p.cat && subOf(x) === sub; })) : 0;
  var standardRows = infoRow('Customer reviews', 'Cust. rating', RB.starsHTML(p)) +
    infoRow('Best Sellers Rank', 'BSR', '#' + catRank + ' in <a href="search?cat=' + p.cat + '">' + esc(cat.name) + '</a>' + (sub ? '<br>#' + subRank + ' in ' + esc(sub) : ''));
  var infoRows;
  if (isBook) {
    var b = p.book, spec = function (name) { return (p.specs.find(function (s) { return s[1] === name; }) || [])[2]; };
    infoRows = infoRow('Publisher', 'Pub.', esc(b.publisher)) + infoRow('Publication date', 'Pub. date', longDate(b.published)) +
      infoRow('Language', 'Lang.', 'English') + infoRow('Format and pages', 'Fmt./pp.', esc(spec('Format') + ', ' + spec('Pages') + ' pages')) +
      infoRow('ISBN-13', 'ISBN-13', esc(b.isbn)) + infoRow('Dimensions', 'Dims.', esc(b.size)) + infoRow('Item weight', 'Wt.', esc(b.weight)) +
      p.specs.filter(function (s) { return s[1] !== 'Format' && s[1] !== 'Pages'; }).map(specRow).join('') + standardRows;
  } else {
    var initials = (p.brand.match(/[A-Z]/g) || []).join('');
    if (initials.length < 2) initials = p.brand.slice(0, 2).toUpperCase();
    var weight = p.specs.find(isWeight), dims = p.specs.find(isDims);
    infoRows = infoRow('Brand', 'Mfr.', esc(p.brand)) +
      p.specs.filter(function (s) { return !isWeight(s) && !isDims(s); }).map(specRow).join('') +
      infoRow('Manufacturer', 'Mfg.', esc(sellerOf(p))) +
      infoRow('Item model number', 'Model #', initials + (1000 + seed(p.id) % 9000)) +
      (dims ? infoRow('Product dimensions', dims[0], esc(dims[2])) : '') +
      (weight ? infoRow('Item weight', weight[0], esc(weight[2])) : '') +
      infoRow('Date first available', 'Avail. since', longDate(firstAvailable())) + standardRows;
  }
  lower += '<section class="pdp-section">' + h(2, 'Product information') + '<table class="spec-table">' +
    (on(9) ? '' : '<caption class="sr-only">Product information for ' + esc(p.name) + '</caption>') + infoRows + '</table></section>';

  // Issue 27: the description is marketing jargon.
  lower += '<section class="pdp-section">' + h(2, 'Product description') + '<p class="desc" id="desc">' + esc(RB.descOf(p)) + '</p></section>';

  // Issue 28: the return policy is one long legal sentence. Issue 13 makes it tiny.
  lower += '<section class="pdp-section" id="policy">' + h(2, 'Return policy');
  if (on(28)) {
    lower += '<p class="policy">Subject to the terms herein and notwithstanding any provision to the contrary, eligible merchandise (excluding final-sale, clearance, opened personal-care, digital and Subscribe &amp; Save items, and items returned in a condition other than as originally received, as determined at Redbird’s sole discretion) may be returned within thirty (30) calendar days of the date of delivery as recorded by the carrier, provided that the return is initiated through the Online Returns Center, whereupon a refund to the original form of payment, less any applicable restocking fee not to exceed fifteen percent (15%) of the item price and less original shipping charges except where the return is the result of Redbird’s error, will be issued within ten (10) business days of receipt and inspection, and Redbird reserves the right to refuse returns deemed abusive.</p>';
  } else {
    lower += '<ul class="policy"><li>You can return it within 30 days of delivery.</li><li>Start the return from Your orders. Shipping it back is free.</li><li>You get your money back on the card you paid with, within 10 business days.</li></ul>';
  }
  lower += '</section>';

  lower += compareHTML(p);
  lower += reviewsHTML(p);

  // Customers also bought: the same department first (the same sub-department at the front),
  // then a department that goes with it, never a random charger on a book page.
  var RELATED = { electronics: ['outdoors'], home: ['grocery', 'books'], clothing: ['outdoors'], outdoors: ['clothing', 'electronics'],
    books: ['toys', 'home'], grocery: ['home'], toys: ['books'] };
  var byReviews = function (a, b) { return b.reviews - a.reviews; };
  var also = RB_CATALOG.filter(function (x) { return x.cat === p.cat && x.id !== p.id; })
    .sort(function (a, b) { return (subOf(b) === sub) - (subOf(a) === sub) || byReviews(a, b); })
    .concat(RB_CATALOG.filter(function (x) { return (RELATED[p.cat] || []).indexOf(x.cat) !== -1; }).sort(byReviews)).slice(0, 12);
  lower += '<section class="pdp-section">' + h(2, 'Customers who bought this item also bought') + '<div class="carousel-wrap"><div class="carousel" id="also">' +
    also.map(function (x, i) { return '<a class="deal-card" href="product?id=' + x.id + '">' + RB.imgTag(x, i + 1, '', true) + '<div class="deal-name">' + esc(RB.titleOf(x)) + '</div>' + RB.starsHTML(x, false) + RB.priceHTML(x.price) + '</a>'; }).join('') +
    '</div>' + (on(34) ? '' : '<button type="button" class="car-arrow car-prev" data-scroll="-1" aria-label="Previous"><span aria-hidden="true">‹</span></button>' +
      '<button type="button" class="car-arrow car-next" data-scroll="1" aria-label="Next"><span aria-hidden="true">›</span></button>') +
    '</div></section>';

  var main = RB.mount(crumbs + '<div class="pdp-wrap"><div class="pdp">' + gallery + info + box + '</div></div><div class="pdp-lower">' + lower + '</div>', { title: p.name });

  // ── Behavior ──────────────────────────────────────────────────────────────
  function showShot(i) {
    main.querySelectorAll('[data-shot]').forEach(function (x) {
      var me = Number(x.getAttribute('data-shot')) === i;
      if (on(22)) x.classList.toggle('is-on', me); else x.setAttribute('aria-pressed', String(me));
    });
    var img = main.querySelector('#main-img');
    img.src = shots[i].src;
    var a = altAttr(shots[i].alt, i).match(/alt="([^"]*)"/);
    if (a) img.setAttribute('alt', a[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")); else img.removeAttribute('alt');
  }
  main.querySelectorAll('[data-shot]').forEach(function (b) {
    var i = Number(b.getAttribute('data-shot'));
    if (!on(22)) b.onclick = function () { showShot(i); };
    b.onmouseenter = function () { showShot(i); };
  });
  if (on(22)) {
    var box = main.querySelector('.main-img'), big = main.querySelector('#main-img');
    box.onmousemove = function (e) {
      var r = box.getBoundingClientRect();
      big.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      big.style.transform = 'scale(2)';
    };
    box.onmouseleave = function () { big.style.transform = ''; };
  }
  // Picking a color swaps the first photo for that color's photo.
  function showColor(name) {
    var first = p.swatches && name !== p.swatches[0].name && extra.colors[name];
    shots[0] = { src: first || RB.imgSrc(p), alt: p.name + (p.swatches ? ', ' + name.toLowerCase() : '') };
    main.querySelector('[data-shot="0"] img').src = shots[0].src;
    showShot(0);
  }
  var color = p.swatches ? p.swatches[0].name : null;
  if (p.swatches && on(6)) {
    main.querySelectorAll('[data-swatch]').forEach(function (el) {
      el.onclick = function () {
        main.querySelectorAll('[data-swatch]').forEach(function (x) { x.style.boxShadow = ''; });
        el.style.boxShadow = '0 0 0 2.5px var(--cardinal)';
        color = p.swatches[Number(el.getAttribute('data-swatch'))].name;
        main.querySelector('#color-name').textContent = color;
        showColor(color);
      };
    });
  } else if (p.swatches) {
    main.querySelectorAll('input[name=color]').forEach(function (r) {
      r.onchange = function () { color = r.value; main.querySelector('#color-name').textContent = r.value; showColor(color); };
    });
  }
  var qty = 1;
  main.querySelectorAll('[data-qty]').forEach(function (b) {
    b.onclick = function () {
      qty = Math.min(10, Math.max(1, qty + Number(b.getAttribute('data-qty'))));
      main.querySelector('#qty').textContent = qty;
    };
  });
  function addToCart() {
    var err = main.querySelector('#buy-error');
    var size = (main.querySelector('input[name=size]:checked') || {}).value;
    if (p.sizes && !size) {
      err.hidden = false;
      err.textContent = 'Choose a size before adding this to your cart.';
      if (!on(8)) err.setAttribute('role', 'alert');
      return false;
    }
    err.hidden = true;
    var protect = !!(main.querySelector('#protect') && main.querySelector('#protect').checked);
    var subscribe = !!(main.querySelector('input[name=buy][value=sub]') && main.querySelector('input[name=buy][value=sub]').checked);
    var coupon = !!(main.querySelector('#coupon') && main.querySelector('#coupon').checked);
    RB.cart.add({ id: p.id, qty: qty, color: color, size: size || null, protect: protect, subscribe: subscribe, coupon: coupon });
    RB.addedToast(p, qty);
    return true;
  }
  main.querySelectorAll('[data-buy]').forEach(function (b) {
    b.onclick = function () {
      if (addToCart() && b.getAttribute('data-buy') === 'now') location.href = 'checkout';
    };
  });
  var fbtBtn = main.querySelector('[data-fbt]');
  if (fbtBtn) fbtBtn.onclick = function () {
    var size = (main.querySelector('input[name=size]:checked') || {}).value;
    var err = main.querySelector('#fbt-error');
    if (p.sizes && !size) {
      err.hidden = false;
      err.textContent = 'Choose a size for this item above, then add the set to your cart.';
      if (!on(8)) err.setAttribute('role', 'alert');
      return;
    }
    err.hidden = true;
    RB.cart.add({ id: p.id, qty: 1, color: color, size: size || null, protect: false, subscribe: false });
    bundle.slice(1).forEach(function (x) { RB.cart.add({ id: x.id, qty: 1, protect: false, subscribe: false }); });
    RB.addedToast(p, 1);
  };

  var alsoRow = main.querySelector('#also');
  if (on(34)) {
    setInterval(function () {
      var max = alsoRow.scrollWidth - alsoRow.clientWidth;
      alsoRow.scrollLeft = alsoRow.scrollLeft >= max - 5 ? 0 : alsoRow.scrollLeft + 196;
    }, 2500);
  } else {
    main.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.onclick = function () { alsoRow.scrollLeft += Number(b.getAttribute('data-scroll')) * 600; };
    });
  }
  if (on(24)) {
    var end = Date.now() + (4 * 3600 + 59 * 60 + 59) * 1000;
    setInterval(function () {
      var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      var t = 'Deal ends in ' + String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      main.querySelectorAll('[data-countdown]').forEach(function (el) { el.textContent = t; });
    }, 1000);
  }
  var vid = main.querySelector('#pvid');
  if (vid && on(33)) {
    // Issue 33: tries to play with sound. Browsers block that, so it plays muted and turns the sound on at the first click.
    vid.muted = false;
    vid.play().catch(function () {
      vid.muted = true; vid.play();
      document.addEventListener('click', function once() { vid.muted = false; document.removeEventListener('click', once); });
    });
  }
  // The question search filters the questions as you type.
  var qa = main.querySelector('#qa-search');
  if (qa) qa.addEventListener('input', function () {
    var words = qa.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    main.querySelectorAll('.qa-item').forEach(function (item) {
      var hit = words.every(function (w) { return item.textContent.toLowerCase().indexOf(w) !== -1; });
      item.hidden = !hit; if (hit) shown++;
    });
    var status = main.querySelector('#qa-status');
    status.textContent = words.length ? shown + (shown === 1 ? ' question matches' : ' questions match') : '';
  });
  main.querySelector('#add-list').onclick = function () {
    var b = main.querySelector('#add-list');
    var saved = b.getAttribute('data-saved') !== '1';
    b.setAttribute('data-saved', saved ? '1' : '0');
    RB.list.toggle(p.id, saved);
    b.textContent = saved ? 'Added to your list' : 'Add to List';
    if (!on(8)) RB.say(saved ? 'Added to your list.' : 'Removed from your list.');
  };
  var writeBtn = main.querySelector('#write-review'), form = main.querySelector('#review-form');
  writeBtn.onclick = function () {
    form.hidden = !form.hidden;
    writeBtn.setAttribute('aria-expanded', String(!form.hidden));
    if (!form.hidden) form.querySelector('input').focus();
  };
  form.onsubmit = function (e) {
    e.preventDefault();
    form.hidden = true; writeBtn.setAttribute('aria-expanded', 'false');
    main.querySelector('#review-done').textContent = 'Thanks for your review. It will show up here after we check it.';
  };
  main.querySelectorAll('[data-report]').forEach(function (b) {
    b.onclick = function () {
      var note = document.createElement('span');
      note.className = 'fine';
      note.textContent = 'Thanks for letting us know. We will look at this review.';
      if (!on(8)) note.setAttribute('role', 'status');
      b.replaceWith(note);
    };
  });
  main.querySelectorAll('[data-helpful]').forEach(function (b) {
    b.onclick = function () {
      var note = document.createElement('span');
      note.className = 'fine';
      note.textContent = 'Thank you for your feedback.';
      if (!on(8)) note.setAttribute('role', 'status');
      b.replaceWith(note);
    };
  });

  // Review controls: sort, filter by star bar, and "See more reviews". Issue 8: with it on, the
  // count changes silently and focus stays where it was.
  var rv = { sort: 'top', star: 0, all: false, lastBar: null };
  var rvList = main.querySelector('#rv-list'), rvMore = main.querySelector('#rv-more'), rvClear = main.querySelector('#rv-clear');
  function showReviews() {
    var items = Array.prototype.slice.call(rvList.querySelectorAll('.review'));
    items.sort(function (a, b) {
      return rv.sort === 'recent' ? b.getAttribute('data-date').localeCompare(a.getAttribute('data-date'))
        : a.getAttribute('data-i') - b.getAttribute('data-i');
    }).forEach(function (el) { rvList.appendChild(el); });
    var match = items.filter(function (el) { return !rv.star || Number(el.getAttribute('data-stars')) === rv.star; });
    var shown = rv.all ? match.length : Math.min(5, match.length);
    items.forEach(function (el) { el.hidden = match.indexOf(el) === -1 || match.indexOf(el) >= shown; });
    rvMore.hidden = shown >= match.length;
    rvClear.hidden = !rv.star;
    var empty = main.querySelector('#rv-empty');
    empty.hidden = match.length > 0;
    empty.textContent = rv.star ? 'No reviews with ' + rv.star + (rv.star === 1 ? ' star' : ' stars') + ' here yet.' : '';
    var what = rv.star ? (rv.star === 1 ? ' with 1 star' : ' with ' + rv.star + ' stars') : '';
    main.querySelector('#rv-status').textContent = !match.length ? 'No reviews' + what + '.'
      : shown < match.length ? 'Showing ' + shown + ' of ' + match.length + ' reviews' + what + '.'
      : 'Showing ' + (match.length === 1 ? '1 review' : 'all ' + match.length + ' reviews') + what + '.';
    return match;
  }
  if (rvList) {
    rvMore.onclick = function () {
      var firstNew = rv.all ? null : showReviews()[5];
      rv.all = true;
      showReviews();
      if (firstNew && !on(8)) { firstNew.tabIndex = -1; firstNew.focus(); }
    };
    main.querySelector('#rv-sort').onchange = function (e) { rv.sort = e.target.value; showReviews(); };
    main.querySelectorAll('.bar-row').forEach(function (b) {
      b.onclick = function () {
        var n = Number(b.getAttribute('data-star'));
        rv.star = rv.star === n ? 0 : n;
        rv.all = false;
        rv.lastBar = b;
        main.querySelectorAll('.bar-row').forEach(function (x) { x.setAttribute('aria-pressed', String(Number(x.getAttribute('data-star')) === rv.star)); });
        showReviews();
      };
    });
    rvClear.onclick = function () {
      rv.star = 0; rv.all = false;
      main.querySelectorAll('.bar-row').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      showReviews();
      // The button disappears, so focus goes back to the star bar that set the filter.
      if (rv.lastBar && !on(8)) rv.lastBar.focus();
    };
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  // The 5 to 1 star bars: whole percentages that add up to 100 and average out to the product's
  // rating, a little different on each product. 1 star stays under 2 stars unless the rating is low.
  function starSpread(p) {
    var r = p.rating, d = 5 - r, low = r < 4.2, k = 0;
    var jitter = function () { k++; return 0.75 + (seed(p.id + ':' + k) % 1000) / 2000; };
    for (var t = 0; t < 60; t++) {
      var p3 = Math.max(1, Math.round(d * (low ? 9 : 11) * jitter()));
      var p2 = Math.max(1, Math.round(d * (low ? 6 : 9) * jitter()));
      var p1 = Math.round(d * (low ? 11 : 6) * jitter());
      if (!low) p1 = Math.min(p1, p2 - 1);
      // With 1 to 3 stars picked, 4 and 5 stars are whatever makes the total 100 and the average right.
      var p5 = Math.round(r * 100) - 400 + p3 + 2 * p2 + 3 * p1, p4 = 100 - p5 - p3 - p2 - p1;
      if (p4 >= Math.max(3, p3) && p5 > p4) return [p5, p4, p3, p2, p1];
    }
    return [70, 16, 7, 4, 3];
  }
  // When the product first went on sale: a few weeks before its oldest review or question.
  function firstAvailable() {
    var dates = reviewData.reviews.concat(reviewData.questions).map(function (x) { return x.date; }).sort();
    var d = new Date((dates[0] || '2025-06-01') + 'T10:00:00');
    d.setDate(d.getDate() - 14 - seed(p.id + ':since') % 30);
    return RB.isoDate(d);
  }

  function reviewsHTML(p) {
    var data = reviewData;
    var html = '<section class="pdp-section" id="reviews"><div class="reviews"><div>' + h(2, 'Customer reviews') +
      '<div class="rv-score">' + RB.starsHTML(p, false) + '</div><p class="fine">' + p.reviews.toLocaleString('en-US') + ' global ratings</p><ul class="bars">';
    // Each bar is a button that shows only the reviews with that many stars.
    starSpread(p).forEach(function (pct, i) {
      var n = 5 - i;
      html += '<li><button type="button" class="bar-row" data-star="' + n + '" aria-pressed="false"' + (on(4) ? '' : ' aria-label="' + n + ' star, ' + pct + '% of ratings"') + '>' +
        '<span>' + n + ' star</span><span class="bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span><span>' + pct + '%</span></button></li>';
    });
    html += '</ul><hr>' + h(3, 'Review this product') + '<p class="fine">Share your thoughts with other customers</p>' +
      '<button type="button" class="btn btn-plain btn-block" id="write-review" aria-expanded="false" aria-controls="review-form">Write a customer review</button>' +
      '<form id="review-form" class="review-form" hidden>' +
      '<fieldset><legend>Overall rating</legend>' + [5, 4, 3, 2, 1].map(function (n) { return '<label><input type="radio" name="stars" value="' + n + '"> ' + n + (n === 1 ? ' star' : ' stars') + '</label>'; }).join('') + '</fieldset>' +
      '<label>Add a headline<input name="title" required></label><label>Add a written review<textarea name="text" rows="4" required></textarea></label>' +
      '<button type="submit" class="btn btn-cart">Submit</button></form><p id="review-done" class="fine"' + (on(8) ? '' : ' role="status"') + '></p></div><div>';
    if (data.summary) {
      html += h(3, 'Customers say') + '<p class="rv-summary">' + esc(data.summary) + '</p>' +
        '<p class="fine">Generated from the text of customer reviews</p><ul class="aspects">' + data.aspects.map(function (a) {
          var good = a.good >= a.bad;
          return '<li class="' + (good ? 'good' : 'mixed') + '"><span aria-hidden="true">' + (good ? '✓' : '–') + '</span> ' + esc(a.name) +
            '<span class="sr-only">: ' + a.good + ' positive and ' + a.bad + ' negative mentions</span></li>';
        }).join('') + '</ul>';
    }
    if (extra.reviews.length) {
      html += h(3, 'Reviews with images') + '<div class="review-photos">' + extra.reviews.map(function (r, i) {
        return '<img src="' + r.src + '"' + altAttr(r.alt, i) + ' loading="lazy" width="120" height="120">';
      }).join('') + '</div>';
    }
    html += h(3, 'Top reviews from the United States');
    // The first 5 reviews show; "See more reviews" shows the rest. Sorting and the star bars
    // reorder and filter these same reviews (see the review controls further down).
    html += '<div class="rv-tools"><label>Sort by <select id="rv-sort"><option value="top">Top reviews</option><option value="recent">Most recent</option></select></label>' +
      '<p class="fine" id="rv-status"' + (on(8) ? '' : ' role="status"') + '>' +
      (data.reviews.length > 5 ? 'Showing 5 of ' + data.reviews.length + ' reviews.' : 'Showing all ' + data.reviews.length + ' reviews.') + '</p>' +
      '<button type="button" class="linkish" id="rv-clear" hidden>Clear filter</button></div><div id="rv-list">';
    data.reviews.forEach(function (r, ri) {
      var photo = r.photo != null && extra.reviews[r.photo];
      var meta = [r.variant ? esc(r.variant) : '', r.verified ? '<b>Verified Purchase</b>' : ''].filter(Boolean).join(' | ');
      html += '<div class="review" data-i="' + ri + '" data-stars="' + r.stars + '" data-date="' + r.date + '"' + (ri >= 5 ? ' hidden' : '') + '>' +
        '<div class="who"><span class="avatar" aria-hidden="true">' + esc(r.name[0].toUpperCase()) + '</span>' + esc(r.name) + '</div>' +
        '<div class="rv-head"><span class="stars-art" style="--pct:' + r.stars * 20 + '%" aria-hidden="true">★★★★★</span>' +
        (on(4) ? '' : '<span class="sr-only">' + r.stars + ' out of 5 stars. </span>') + h(4, esc(r.title)) + '</div>' +
        '<p class="fine">Reviewed in the United States on ' + longDate(r.date) + '</p>' +
        (meta ? '<p class="rv-meta">' + meta + '</p>' : '') +
        '<p>' + esc(r.text) + '</p>' +
        (photo ? '<div class="review-photos"><img src="' + photo.src + '"' + altAttr(photo.alt, ri + 3) + ' loading="lazy" width="96" height="96"></div>' : '') +
        (r.helpful ? '<p class="fine">' + (r.helpful === 1 ? 'One person' : r.helpful + ' people') + ' found this helpful</p>' : '') +
        '<div class="rv-actions"><button type="button" class="btn btn-plain" data-helpful="' + ri + '">Helpful</button><button type="button" class="linkish" data-report="' + ri + '">Report</button></div></div>';
    });
    html += '</div><p class="rv-empty" id="rv-empty" hidden></p>' +
      '<button type="button" class="btn btn-plain" id="rv-more"' + (data.reviews.length > 5 ? '' : ' hidden') + '>See more reviews</button>';
    html += '</div></div></section>';
    if (data.questions.length) {
      html += '<section class="pdp-section" id="questions">' + h(2, 'Looking for specific info?') +
        '<label class="sr-only" for="qa-search">Search questions and answers</label><input id="qa-search" class="qa-search" placeholder="Search questions and answers">' +
        '<p class="fine" id="qa-status"' + (on(8) ? '' : ' role="status"') + '></p>' +
        '<div class="qa">' + data.questions.map(function (q) {
          var when = new Date(q.date + 'T10:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          return '<div class="qa-item"><p><b>Question:</b> ' + esc(q.q) + '</p><p><b>Answer:</b> ' + esc(q.a) + '</p>' +
            '<p class="fine">By ' + esc(q.by) + ' on ' + when + (q.votes ? ' · ' + q.votes + ' people found this helpful' : '') + '</p></div>';
        }).join('') + '</div></section>';
    }
    return html;
  }

  // "Compare with similar items": this product and the three closest in its department.
  function compareHTML(p) {
    var same = RB_CATALOG.filter(function (x) { return x.cat === p.cat && x.id !== p.id; });
    var word = p.name.split(/[ ,]/).filter(function (w) { return w.length > 4; }).pop() || '';
    same.sort(function (a, b) { return (b.name.indexOf(word) !== -1) - (a.name.indexOf(word) !== -1) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price); });
    var cols = [p].concat(same.slice(0, 3));
    var keys = p.specs.map(function (s) { return s; });
    // Issue 9 also hits this table: with it on, there are no header cells.
    var cell = function (tag, scope, html) { return on(9) ? '<td>' + html + '</td>' : '<' + tag + (scope ? ' scope="' + scope + '"' : '') + '>' + html + '</' + tag + '>'; };
    var row = function (label, f) {
      return '<tr>' + cell('th', 'row', label) + cols.map(function (x) { return '<td>' + f(x) + '</td>'; }).join('') + '</tr>';
    };
    var html = '<section class="pdp-section">' + h(2, 'Compare with similar items') + '<div class="compare-wrap"><table class="compare">';
    html += '<tr>' + (on(9) ? '<td></td>' : '<td></td>') + cols.map(function (x, i) {
      return cell('th', 'col', (i === 0 ? '<span class="fine">This item</span>' : '') + '<a href="product?id=' + x.id + '">' + RB.imgTag(x, i + 5, '', true) + esc(RB.titleOf(x)) + '</a>');
    }).join('') + '</tr>';
    html += row('Customer rating', function (x) { return RB.starsHTML(x, 'product?id=' + x.id + '#reviews'); });
    html += row('Price', function (x) { return RB.priceHTML(x.price); });
    html += row('Delivery', function (x) { return RB.deliveryHTML(x); });
    html += row('Sold by', function (x) { return esc(sellerOf(x)); });
    keys.forEach(function (k, ki) {
      html += row(esc(on(32) ? k[0] : k[1]), function (x) {
        var m = x.specs.find(function (s) { return s[1] === k[1]; });
        return m ? esc(m[2]) : '<span class="fine">—</span>';
      });
    });
    return html + '</table></div></section>';
  }

  // Size charts for clothing and shoes: body measurements in inches for each size sold.
  function sizeChart(p) {
    var CHARTS = {
      unisex: [['Chest (in)', 'Body length (in)'], { XS: ['33–35', '26'], S: ['35–37', '27'], M: ['38–40', '28'], L: ['41–43', '29'], XL: ['44–46', '30'], XXL: ['47–49', '31'] }],
      men: [['Chest (in)', 'Waist (in)'], { S: ['35–37', '29–31'], M: ['38–40', '32–34'], L: ['41–43', '35–37'], XL: ['44–46', '38–40'], XXL: ['47–50', '41–44'] }],
      women: [['Bust (in)', 'Waist (in)'], { XS: ['31–32', '24–25'], S: ['33–34', '26–27'], M: ['35–36', '28–29'], L: ['37–39', '30–32'], XL: ['40–42', '33–35'] }],
      joggers: [['Waist (in)', 'Inseam (in)'], { XS: ['26–28', '28'], S: ['28–30', '28.5'], M: ['30–32', '29'], L: ['33–35', '29.5'], XL: ['36–38', '30'], XXL: ['39–41', '30.5'] }],
      leggings: [['Waist (in)', 'Hips (in)'], { XS: ['24–25', '33–34'], S: ['26–27', '35–36'], M: ['28–29', '37–38'], L: ['30–32', '39–41'], XL: ['33–35', '42–44'] }],
      shoes: [['Heel to toe (in)', 'EU size'], { 7: ['9.6', '40'], 8: ['9.9', '41'], 9: ['10.3', '42'], 10: ['10.6', '43'], 11: ['10.9', '44.5'], 12: ['11.3', '45.5'], 13: ['11.6', '46.5'] }],
    };
    var kind = /shoes|boots/i.test(p.name) ? 'shoes' : /joggers/i.test(p.name) ? 'joggers' : /leggings/i.test(p.name) ? 'leggings'
      : p.attrs.Department === 'Women' ? 'women' : p.attrs.Department === 'Men' ? 'men' : 'unisex';
    var c = CHARTS[kind], rows = p.sizes.filter(function (s) { return c[1][s]; });
    if (!rows.length) return '';
    return '<table class="size-table"><caption>' + (kind === 'shoes' ? 'US men’s sizes' : 'Body measurements') + '</caption><thead><tr><th scope="col">' + (kind === 'shoes' ? 'US size' : 'Size') + '</th>' +
      c[0].map(function (x) { return '<th scope="col">' + x + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (s) { return '<tr><th scope="row">' + esc(s) + '</th><td>' + c[1][s].join('</td><td>') + '</td></tr>'; }).join('') + '</tbody></table>';
  }
})();
