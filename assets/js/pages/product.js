// Product page: gallery, details, buy box, and everything below it.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var p = RB.byId(RB.param('id') || '') || RB.byId('rb-20w-usbc-charger');
  var cat = RB_CATEGORIES.find(function (c) { return c.id === p.cat; });
  var anyIssues = RB_ISSUES.any;

  // ── Breadcrumbs and gallery ───────────────────────────────────────────────
  // A sub-department for the breadcrumb, picked from the product's name.
  var SUBS = [[/charger|2-pack/i, 'Chargers & power adapters'], [/cable/i, 'Cables'], [/earbuds|headphones/i, 'Headphones'], [/phone case/i, 'Phone cases'],
    [/power bank/i, 'Portable chargers'], [/speaker/i, 'Speakers'], [/kettle|French press/i, 'Coffee & tea'], [/mugs|skillet/i, 'Kitchen & dining'],
    [/towels/i, 'Bath'], [/blanket|planter|lamp/i, 'Home decor'], [/hoodie|T-shirts|jacket|beanie/i, 'Clothing'], [/shoes/i, 'Shoes'],
    [/bottle|daypack|yoga|lantern/i, 'Outdoor gear'], [/novel/i, 'Literature & fiction'], [/Habits/i, 'Self-help'], [/Birds/i, 'Nature'],
    [/coffee|granola|oil|water/i, 'Pantry'], [/blocks|puzzle/i, 'Learning toys']];
  var sub = (SUBS.find(function (x) { return x[0].test(p.name); }) || [null, null])[1];
  var crumbs = '<nav class="crumbs"' + (on(12) ? '' : ' aria-label="Breadcrumb"') + '><ol><li><a href="./">Redbird</a></li>' +
    '<li><a href="search?cat=' + p.cat + '">' + esc(cat.name) + '</a></li>' +
    (sub ? '<li><a href="search?cat=' + p.cat + '">' + esc(sub) + '</a></li>' : '') +
    '<li aria-current="page">' + esc(p.brand) + '</li></ol></nav>';
  // Photos: the main one, then the extras listed in assets/js/images.js.
  var extra = (window.RB_IMAGES || {})[p.id] || { gallery: [], colors: {}, reviews: [] };
  var shots = [{ src: RB.imgSrc(p), alt: p.name }].concat(extra.gallery);
  // Issue 1: alt text is missing, a camera file name, or just "product image".
  var BAD_ALTS = [null, 'IMG_2931.jpg', 'product image', null, 'DSC00418.webp'];
  function altAttr(text, i) {
    var a = on(1) ? BAD_ALTS[i % BAD_ALTS.length] : text;
    return a === null ? '' : ' alt="' + esc(a) + '"';
  }
  var gallery = '<div class="gallery"><div class="thumbs">' + shots.map(function (s, i) {
    return '<button type="button" data-shot="' + i + '" aria-pressed="' + (i === 0) + '"' +
      (on(2) ? '' : ' aria-label="Show image ' + (i + 1) + ' of ' + shots.length + '"') + '><img src="' + s.src + '" alt=""></button>';
  }).join('') + (p.video ? '<a class="thumb-video" href="#video"><img src="assets/video/' + p.id + '-poster.webp" alt=""><span aria-hidden="true">▶</span>VIDEO</a>' : '') + '</div><div class="main-img"><img id="main-img" src="' + shots[0].src + '"' + altAttr(shots[0].alt, 0) + ' width="520" height="520"></div></div>';

  // ── Details column ────────────────────────────────────────────────────────
  var off = p.list ? Math.round((1 - p.price / p.list) * 100) : 0;
  var info = '<div class="pdp-info">';
  info += '<a class="store-link" href="search?q=' + encodeURIComponent(p.brand) + '">Visit the ' + esc(p.brand) + ' store</a>';
  info += h(1, esc(RB.titleOf(p)));
  info += '<div>' + RB.starsHTML(p) + '</div>' + RB.boughtHTML(p);
  if (p.badge) info += '<div style="margin-top:6px">' + RB.badgeHTML(p) + '</div>';
  info += '<hr>';
  info += '<div class="price-block">' + (off ? '<span class="save">-' + off + '%</span>' : '') + RB.priceHTML(p.price, 'price-lg') + '</div>';
  info += '<div>' + RB.listPriceHTML(p) + '</div><div class="fine" style="margin-top:4px"><a href="#policy">FREE Returns</a></div>';
  if (RB.couponOf(p)) {
    info += '<label class="coupon-row"><input type="checkbox" id="coupon"> <span class="coupon">Coupon</span> Apply ' + RB.couponOf(p) + '% coupon</label>';
  }
  if (p.badge === 'Limited time deal' && on(23)) info += '<div class="deal-timer" data-countdown>Deal ends in 04:59:59</div>';

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
  }
  // The top facts, like the short table real stores show above "About this item". Issues 10 and 22 apply here too.
  info += '<table class="top-specs">' + (on(10) ? '' : '<caption class="sr-only">Key facts</caption>') + [['Brand', 'Brand', p.brand]].concat(p.specs.slice(0, 3)).map(function (s) {
    var key = on(22) ? s[0] : s[1];
    return '<tr>' + (on(10) ? '<td><b>' + esc(key) + '</b></td>' : '<th scope="row">' + esc(key) + '</th>') + '<td>' + esc(s[2]) + '</td></tr>';
  }).join('') + '</table>';
  info += '<div class="about">' + h(2, 'About this item') + '<ul>' + p.about.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>';
  info += '</div>';

  // ── Buy box ───────────────────────────────────────────────────────────────
  var stock;
  if (on(23)) {
    // Issue 23: always says stock is about to run out.
    stock = '<div class="stock-low">Only ' + Math.min(p.stock, 2 + (p.id.length % 2)) + ' left in stock - order soon.</div>';
  } else {
    stock = p.stock > 5 ? '<div class="stock-ok">In stock</div>' : '<div class="stock-ok">In stock (' + p.stock + ' left)</div>';
  }
  var box = '<div class="buybox"' + (on(12) ? '' : ' role="region" aria-label="Buy"') + '>';
  box += RB.priceHTML(p.price, 'price-sm');
  box += RB.deliveryHTML(p, { full: true });
  box += '<div class="fine">' + RB.ICON.pinDark + ' Delivering to Palo Alto 94301</div>';
  box += stock;
  box += '<div><span id="qty-label" style="margin-right:8px">Quantity</span><div class="qty"' + (on(12) ? '' : ' role="group" aria-labelledby="qty-label"') + '>' +
    '<button type="button" data-qty="-1"' + (on(2) ? '' : ' aria-label="Decrease quantity"') + '>−</button>' +
    '<output id="qty" class="qty-val"' + (on(8) ? '' : ' aria-live="polite"') + '>1</output>' +
    '<button type="button" data-qty="1"' + (on(2) ? '' : ' aria-label="Increase quantity"') + '>+</button></div></div>';
  if (p.subscribe) {
    // Agent checkpoint V3: with issues on, "Subscribe & Save" (a repeat order) is picked for you.
    var sub = anyIssues;
    var subName = on(34) ? 'S&amp;S' : 'Subscribe &amp; Save';
    box += '<fieldset class="opt-group"><legend>How do you want to buy?</legend>' +
      '<label><input type="radio" name="buy" value="once"' + (sub ? '' : ' checked') + '> <span>One-time purchase: ' + money(p.price) + '</span></label>' +
      '<label><input type="radio" name="buy" value="sub"' + (sub ? ' checked' : '') + '> <span>' + subName + ' 5%: ' + money(p.price * 0.95) +
      (on(34) ? ' (auto-ship every 6 mo.)' : ', delivered again every 6 months until you cancel') + '</span></label></fieldset>';
  }
  if (p.protect) {
    // Agent checkpoint V2: with issues on, a paid protection plan is already ticked.
    box += '<label class="opt"><input type="checkbox" id="protect"' + (anyIssues ? ' checked' : '') + '> <span>Add a 2-year protection plan for ' + money(p.protect) + '</span></label>';
  }
  box += '<p class="error-box" id="buy-error" hidden></p>';
  box += RB.addButton('data-buy="cart" style="width:100%"');
  box += '<button type="button" class="btn btn-buy btn-block" data-buy="now">Buy now</button>';
  box += '<div class="seller"><span>Ships from</span><span>Redbird</span><span>Sold by</span><span>' + esc(p.brand) + '</span>' +
    '<span>Returns</span><span>Within 30 days</span><span>Payment</span><span>Secure transaction</span></div>';
  box += '<button type="button" class="btn btn-plain btn-block" id="add-list">Add to List</button>';
  box += '<div class="fine">' + (on(11) ? '<a href="#policy">Click here</a> for details.' : '<a href="#policy">Return policy details</a>') + '</div>';
  box += '</div>';

  // ── Lower sections ────────────────────────────────────────────────────────
  var lower = '';
  var fbt = RB_CATALOG.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 2);
  lower += '<section class="pdp-section">' + h(2, 'Frequently bought together') + '<div class="fbt">' +
    [p].concat(fbt).map(function (x, i) { return (i ? '<span class="plus" aria-hidden="true">+</span>' : '') + '<a href="product?id=' + x.id + '">' + RB.imgTag(x, i + 2) + '</a>'; }).join('') +
    '<div style="margin-left:16px">Total price: <b>' + money(p.price + fbt.reduce(function (s, x) { return s + x.price; }, 0)) + '</b><br>' +
    RB.addButton('data-fbt="1"', 'Add all three to cart') + '</div></div></section>';

  if (on(21)) {
    // Issue 21: extra ads and sponsored rows that crowd the page.
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
      // Issue 25: plays by itself, with sound, on a loop. Issue 27: no captions.
      '<video id="pvid" src="assets/video/' + p.id + '.mp4" playsinline' + (on(25) ? ' autoplay loop' : ' controls') + ' poster="assets/video/' + p.id + '-poster.webp">' +
      (on(27) ? '' : '<track kind="captions" src="assets/video/' + p.id + '.vtt" srclang="en" label="English" default>') +
      '</video></div></section>';
  }

  var specRows = p.specs.map(function (s) {
    // Issue 22: spec names are jargon and abbreviations. Issue 10: the table has no header cells.
    var key = on(22) ? s[0] : s[1];
    return on(10) ? '<tr><td><div class="k">' + esc(key) + '</div></td><td>' + esc(s[2]) + '</td></tr>'
      : '<tr><th scope="row">' + esc(key) + '</th><td>' + esc(s[2]) + '</td></tr>';
  }).join('');
  var brandRow = on(10) ? '<tr><td><div class="k">' + (on(22) ? 'Mfr.' : 'Brand') + '</div></td><td>' + esc(p.brand) + '</td></tr>'
    : '<tr><th scope="row">Brand</th><td>' + esc(p.brand) + '</td></tr>';
  lower += '<section class="pdp-section">' + h(2, 'Product information') + '<table class="spec-table">' +
    (on(10) ? '' : '<caption class="sr-only">Product information for ' + esc(p.name) + '</caption>') + brandRow + specRows + '</table></section>';

  // Issue 29: the description is marketing jargon.
  lower += '<section class="pdp-section">' + h(2, 'Product description') + '<p class="desc" id="desc">' + esc(RB.descOf(p)) + '</p></section>';

  // Issue 30: the return policy is one long legal sentence. Issue 14 makes it tiny.
  lower += '<section class="pdp-section" id="policy">' + h(2, 'Return policy');
  if (on(30)) {
    lower += '<p class="policy">Subject to the terms herein and notwithstanding any provision to the contrary, eligible merchandise (excluding final-sale, clearance, opened personal-care, digital and Subscribe &amp; Save items, and items returned in a condition other than as originally received, as determined at Redbird’s sole discretion) may be returned within thirty (30) calendar days of the date of delivery as recorded by the carrier, provided that the return is initiated through the Online Returns Center, whereupon a refund to the original form of payment, less any applicable restocking fee not to exceed fifteen percent (15%) of the item price and less original shipping charges except where the return is the result of Redbird’s error, will be issued within ten (10) business days of receipt and inspection, and Redbird reserves the right to refuse returns deemed abusive.</p>';
  } else {
    lower += '<ul class="policy"><li>You can return it within 30 days of delivery.</li><li>Start the return from Your orders. Shipping it back is free.</li><li>You get your money back on the card you paid with, within 10 business days.</li></ul>';
  }
  lower += '</section>';

  lower += compareHTML(p);
  lower += reviewsHTML(p);

  var also = RB_CATALOG.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).concat(RB_CATALOG.filter(function (x) { return x.cat !== p.cat; })).slice(0, 12);
  lower += '<section class="pdp-section">' + h(2, 'Customers who bought this item also bought') + '<div class="carousel" id="also">' +
    also.map(function (x, i) { return '<a class="deal-card" href="product?id=' + x.id + '">' + RB.imgTag(x, i + 1, '', true) + '<div class="deal-name">' + esc(RB.titleOf(x)) + '</div>' + RB.starsHTML(x, false) + RB.priceHTML(x.price) + '</a>'; }).join('') +
    '</div>' + (on(26) ? '' : '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn btn-plain" data-scroll="-1">Previous</button><button type="button" class="btn btn-plain" data-scroll="1">Next</button></div>') +
    '</section>';

  var main = RB.mount(crumbs + '<div class="pdp-wrap"><div class="pdp">' + gallery + info + box + '</div></div><div class="pdp-lower">' + lower + '</div>', { title: p.name });

  // ── Behavior ──────────────────────────────────────────────────────────────
  function showShot(i) {
    main.querySelectorAll('[data-shot]').forEach(function (x) { x.setAttribute('aria-pressed', String(Number(x.getAttribute('data-shot')) === i)); });
    var img = main.querySelector('#main-img');
    img.src = shots[i].src;
    var a = altAttr(shots[i].alt, i).match(/alt="([^"]*)"/);
    if (a) img.setAttribute('alt', a[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")); else img.removeAttribute('alt');
  }
  main.querySelectorAll('[data-shot]').forEach(function (b) {
    var i = Number(b.getAttribute('data-shot'));
    b.onclick = function () { showShot(i); };
    b.onmouseenter = function () { showShot(i); };
  });
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
      if (!on(9)) err.setAttribute('role', 'alert');
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
    [p].concat(fbt).forEach(function (x) { RB.cart.add({ id: x.id, qty: 1 }); });
    RB.addedToast(p, 3);
  };

  var alsoRow = main.querySelector('#also');
  if (on(26)) {
    setInterval(function () {
      var max = alsoRow.scrollWidth - alsoRow.clientWidth;
      alsoRow.scrollLeft = alsoRow.scrollLeft >= max - 5 ? 0 : alsoRow.scrollLeft + 196;
    }, 2500);
  } else {
    main.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.onclick = function () { alsoRow.scrollLeft += Number(b.getAttribute('data-scroll')) * 600; };
    });
  }
  if (on(23)) {
    var end = Date.now() + (4 * 3600 + 59 * 60 + 59) * 1000;
    setInterval(function () {
      var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      var t = 'Deal ends in ' + String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      main.querySelectorAll('[data-countdown]').forEach(function (el) { el.textContent = t; });
    }, 1000);
  }
  var vid = main.querySelector('#pvid');
  if (vid && on(25)) {
    // Issue 25: tries to play with sound. Browsers block that, so it plays muted and turns the sound on at the first click.
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
    b.textContent = saved ? 'Added to your list' : 'Add to List';
    if (!on(8)) RB.say(saved ? 'Added to your list.' : 'Removed from your list.');
  };
  main.querySelectorAll('[data-helpful]').forEach(function (b) {
    b.onclick = function () {
      var note = document.createElement('span');
      note.className = 'fine';
      note.textContent = 'Thank you for your feedback.';
      if (!on(8)) note.setAttribute('role', 'status');
      b.replaceWith(note);
    };
  });

  // ── Reviews ───────────────────────────────────────────────────────────────
  function reviewsHTML(p) {
    var data = (window.RB_REVIEWS || {})[p.id] || { reviews: [], questions: [], aspects: [] };
    var dist = p.rating >= 4.6 ? [0.71, 0.15, 0.07, 0.03, 0.04] : p.rating >= 4.4 ? [0.62, 0.19, 0.09, 0.04, 0.06] : [0.52, 0.2, 0.11, 0.07, 0.1];
    var html = '<section class="pdp-section" id="reviews"><div class="reviews"><div>' + h(2, 'Customer reviews') +
      '<div class="rv-score">' + RB.starsHTML(p, false) + '</div><p class="fine">' + p.reviews.toLocaleString('en-US') + ' global ratings</p><ul class="bars">';
    dist.forEach(function (d, i) {
      var pct = Math.round(d * 100);
      html += '<li><span>' + (5 - i) + ' star</span><span class="bar"' + (on(4) ? '' : ' role="img" aria-label="' + pct + ' percent"') + '><i style="width:' + pct + '%"></i></span><span>' + pct + '%</span></li>';
    });
    html += '</ul><hr>' + h(3, 'Review this product') + '<p class="fine">Share your thoughts with other customers</p>' +
      '<button type="button" class="btn btn-plain btn-block">Write a customer review</button></div><div>';
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
    data.reviews.forEach(function (r, ri) {
      var when = new Date(r.date + 'T10:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      var photo = r.photo != null && extra.reviews[r.photo];
      html += '<div class="review"><div class="who"><span class="avatar" aria-hidden="true">' + esc(r.name[0].toUpperCase()) + '</span>' + esc(r.name) + '</div>' +
        '<div class="rv-head"><span class="stars-art" style="--pct:' + r.stars * 20 + '%" aria-hidden="true">★★★★★</span>' +
        (on(4) ? '' : '<span class="sr-only">' + r.stars + ' out of 5 stars. </span>') + h(4, esc(r.title)) + '</div>' +
        '<p class="fine">Reviewed in the United States on ' + when + '</p>' +
        '<p class="rv-meta">' + (r.variant ? esc(r.variant) + ' | ' : '') + (r.verified ? '<b>Verified Purchase</b>' : '') + '</p>' +
        '<p>' + esc(r.text) + '</p>' +
        (photo ? '<div class="review-photos"><img src="' + photo.src + '"' + altAttr(photo.alt, ri + 3) + ' loading="lazy" width="96" height="96"></div>' : '') +
        (r.helpful ? '<p class="fine">' + (r.helpful === 1 ? 'One person' : r.helpful + ' people') + ' found this helpful</p>' : '') +
        '<div class="rv-actions"><button type="button" class="btn btn-plain" data-helpful="' + ri + '">Helpful</button><a href="#reviews">Report</a></div></div>';
    });
    html += '</div></div></section>';
    if (data.questions.length) {
      html += '<section class="pdp-section" id="questions">' + h(2, 'Looking for specific info?') +
        '<label class="sr-only" for="qa-search">Search questions and answers</label><input id="qa-search" class="qa-search" placeholder="Search questions and answers">' +
        '<p class="fine" id="qa-status"' + (on(9) ? '' : ' role="status"') + '></p>' +
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
    // Issue 10 also hits this table: with it on, there are no header cells.
    var cell = function (tag, scope, html) { return on(10) ? '<td>' + html + '</td>' : '<' + tag + (scope ? ' scope="' + scope + '"' : '') + '>' + html + '</' + tag + '>'; };
    var row = function (label, f) {
      return '<tr>' + cell('th', 'row', label) + cols.map(function (x) { return '<td>' + f(x) + '</td>'; }).join('') + '</tr>';
    };
    var html = '<section class="pdp-section">' + h(2, 'Compare with similar items') + '<div class="compare-wrap"><table class="compare">';
    html += '<tr>' + (on(10) ? '<td></td>' : '<td></td>') + cols.map(function (x, i) {
      return cell('th', 'col', (i === 0 ? '<span class="fine">This item</span>' : '') + '<a href="product?id=' + x.id + '">' + RB.imgTag(x, i + 5, '', true) + esc(RB.titleOf(x)) + '</a>');
    }).join('') + '</tr>';
    html += row('Customer rating', function (x) { return RB.starsHTML(x, 'product?id=' + x.id + '#reviews'); });
    html += row('Price', function (x) { return RB.priceHTML(x.price); });
    html += row('Delivery', function (x) { return RB.deliveryHTML(x); });
    html += row('Sold by', function (x) { return esc(x.brand); });
    keys.forEach(function (k, ki) {
      html += row(esc(on(22) ? k[0] : k[1]), function (x) {
        var m = x.specs.find(function (s) { return s[1] === k[1]; });
        return m ? esc(m[2]) : '<span class="fine">—</span>';
      });
    });
    return html + '</table></div></section>';
  }
})();
