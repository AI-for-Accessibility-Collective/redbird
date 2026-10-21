// Cart page: one line per item, quantity, delete, save for later, and the checkout box.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var main = RB.mount('<div class="cart-layout" id="cart"></div>', { title: 'Shopping cart' });
  var root = main.querySelector('#cart');
  // "Save for later" moves an item to your list (the same list as the heart). Its color and size
  // are kept here, so "Move to cart" can put it back the way it was.
  var OPTS_KEY = 'redbird:saved-options';

  function savedHTML() {
    var ids = RB.list.ids().filter(RB.byId), opts = RB.store(OPTS_KEY) || {};
    if (!ids.length) return '';
    return '<div class="panel saved-list">' + h(2, 'Saved for later (' + ids.length + (ids.length === 1 ? ' item)' : ' items)'), 'saved-title') + ids.map(function (id, i) {
      var p = RB.byId(id), o = opts[id] || {}, url = 'product?id=' + p.id;
      // Something with colors or sizes needs them picked before it can go in the cart.
      var ready = !(p.swatches && !o.color) && !(p.sizes && !o.size);
      return '<div class="line saved-line" data-saved="' + esc(id) + '">' +
        '<a href="' + url + '"' + (on(1) ? '' : ' tabindex="-1" aria-hidden="true"') + '>' + RB.imgTag(p, i, '', true, o.color) + '</a><div>' +
        h(3, '<a href="' + url + '">' + esc(RB.titleOf(p)) + '</a>') +
        (o.color ? '<div class="meta"><b>Color:</b> ' + esc(o.color) + '</div>' : '') + (o.size ? '<div class="meta"><b>Size:</b> ' + esc(o.size) + '</div>' : '') +
        '<div class="actions">' + (ready
          ? '<button type="button" class="btn btn-plain btn-small" data-move="1">Move to cart<span class="sr-only"> ' + esc(p.name) + '</span></button>'
          : '<a class="btn btn-plain btn-small" href="' + url + '">Choose options<span class="sr-only"> for ' + esc(p.name) + '</span></a>') +
        '<button type="button" class="linkish" data-unsave="1">Delete<span class="sr-only"> ' + esc(p.name) + ' from saved items</span></button></div></div>' +
        '<div class="line-price">' + RB.priceHTML(p.price, 'price-sm') + '</div></div>';
    }).join('') + '</div>';
  }

  function render() {
    var lines = RB.cart.items().filter(function (it) { return RB.byId(it.id); }).map(RB.lineOf);
    var count = lines.reduce(function (n, l) { return n + l.item.qty; }, 0);
    var subtotal = lines.reduce(function (s, l) { return s + l.total; }, 0);
    if (!lines.length) {
      root.innerHTML = '<div class="cart-main"><div class="panel cart-list">' + h(1, 'Your Redbird cart is empty') +
        '<p>Have a look at <a href="search?deals=1">today’s deals</a>, or search for something above.</p></div>' + savedHTML() + '</div>';
      return;
    }
    var html = '<div class="cart-main"><div class="panel cart-list">' + h(1, 'Shopping cart') + '<div class="col-head" aria-hidden="true">Price</div>';
    lines.forEach(function (l, i) {
      var p = l.p, it = l.item;
      var url = 'product?id=' + p.id;
      html += '<div class="line" data-i="' + i + '">';
      html += '<a href="' + url + '"' + (on(1) ? '' : ' tabindex="-1" aria-hidden="true"') + '>' + RB.imgTag(p, i, '', true, it.color) + '</a><div>';
      html += h(2, '<a href="' + url + '">' + esc(RB.titleOf(p)) + '</a>');
      html += on(24) && p.stock <= 5
        ? '<div class="stock-low">Only ' + p.stock + ' left in stock - order soon.</div>'
        : '<div class="stock-ok" style="font-size:14px">In stock</div>';
      html += RB.deliveryHTML(p);
      if (it.color) html += '<div class="meta"><b>Color:</b> ' + esc(it.color) + '</div>';
      if (it.size) html += '<div class="meta"><b>Size:</b> ' + esc(it.size) + '</div>';
      if (it.subscribe) {
        html += '<div class="meta">' + (on(32) ? '<b>S&amp;S:</b> every 6 mo. (5% off)' : '<b>Subscribe &amp; Save:</b> we send this again every 6 months until you cancel. 5% off.') + '</div>';
      }
      if (l.plan) html += '<div class="meta"><b>Protection plan:</b> 2 years, ' + money(l.plan) + ' each</div>';
      if (it.coupon && RB.couponOf(p)) html += '<div class="meta"><span class="coupon">' + RB.couponOf(p) + '% coupon applied</span></div>';
      html += '<div class="actions"><span id="q' + i + '" class="sr-only">Quantity for ' + esc(p.name) + '</span><div class="qty"' + (on(11) ? '' : ' role="group" aria-labelledby="q' + i + '"') + '>' +
        '<button type="button" data-q="-1"' + (on(2) ? '' : ' aria-label="Decrease quantity"') + '>−</button>' +
        '<span class="qty-val">' + it.qty + '</span>' +
        '<button type="button" data-q="1"' + (on(2) ? '' : ' aria-label="Increase quantity"') + '>+</button></div>' +
        '<button type="button" class="linkish" data-del="1">Delete<span class="sr-only"> ' + esc(p.name) + '</span></button>' +
        (l.plan ? '<button type="button" class="linkish" data-noplan="1">Remove protection plan<span class="sr-only"> from ' + esc(p.name) + '</span></button>' : '') +
        (it.subscribe ? '<button type="button" class="linkish" data-once="1">Buy once instead<span class="sr-only"> for ' + esc(p.name) + '</span></button>' : '') +
        '<button type="button" class="linkish" data-later="1">Save for later<span class="sr-only"> ' + esc(p.name) + '</span></button>' +
        '</div></div>';
      html += '<div class="line-price">' + RB.priceHTML(l.total, 'price-sm') + '</div></div>';
    });
    html += '<div class="subtotal">Subtotal (' + count + (count === 1 ? ' item' : ' items') + '): <b>' + money(subtotal) + '</b></div></div>' + savedHTML() + '</div>';

    html += '<div class="sum-box">';
    html += '<p class="free-ship">Your order qualifies for FREE delivery.</p>';
    html += '<p style="font-size:18px;margin:0 0 12px">Subtotal (' + count + (count === 1 ? ' item' : ' items') + '): <b>' + money(subtotal) + '</b></p>';
    if (on(24)) html += '<p class="stock-low" style="margin:0 0 12px">Items in your cart are in high demand. 14 other people have them in their carts right now.</p>';
    html += '<a class="btn btn-cart btn-block" href="checkout">Proceed to checkout</a>';
    html += '<p class="fine">Tax and delivery are added at checkout.</p></div>';
    root.innerHTML = html;
  }
  render();

  root.addEventListener('click', function (e) {
    var row = e.target.closest('[data-i]');
    var btn = e.target.closest('button');
    if (!row || !btn) return;
    var items = RB.cart.items().filter(function (it) { return RB.byId(it.id); });
    var i = Number(row.getAttribute('data-i'));
    var it = items[i];
    var name = RB.byId(it.id).name;
    var focusSel = null;
    if (btn.hasAttribute('data-q')) {
      it.qty = Math.min(10, it.qty + Number(btn.getAttribute('data-q')));
      if (it.qty < 1) { items.splice(i, 1); focusSel = 'h1'; }
      else focusSel = '[data-i="' + i + '"] [data-q="' + btn.getAttribute('data-q') + '"]';
    } else if (btn.hasAttribute('data-del')) {
      items.splice(i, 1);
      focusSel = 'h1';
      if (!on(8)) setTimeout(function () { RB.say(name + ' removed from your cart.'); }, 400);
    } else if (btn.hasAttribute('data-noplan')) {
      it.protect = false; focusSel = '[data-i="' + i + '"] .line-price';
    } else if (btn.hasAttribute('data-once')) {
      it.subscribe = false; focusSel = '[data-i="' + i + '"] .line-price';
    } else if (btn.hasAttribute('data-later')) {
      items.splice(i, 1);
      RB.list.toggle(it.id, true);
      var opts = RB.store(OPTS_KEY) || {};
      opts[it.id] = { color: it.color || null, size: it.size || null };
      RB.store(OPTS_KEY, opts);
      focusSel = 'h1';
      if (!on(8)) setTimeout(function () { RB.say(name + ' saved for later.'); }, 400);
    } else return;
    RB.cart.save(items);
    render();
    if (!on(8) && focusSel) {
      var el = root.querySelector(focusSel) || root.querySelector('h1');
      if (el) { if (!/^(BUTTON|A)$/.test(el.tagName)) el.tabIndex = -1; el.focus(); }
    }
  });

  // Saved for later: move back to the cart, or delete from the list.
  root.addEventListener('click', function (e) {
    var row = e.target.closest('[data-saved]'), btn = e.target.closest('button');
    if (!row || !btn) return;
    var id = row.getAttribute('data-saved'), p = RB.byId(id), opts = RB.store(OPTS_KEY) || {}, o = opts[id] || {}, msg;
    if (btn.hasAttribute('data-move')) {
      RB.cart.add({ id: id, qty: 1, color: o.color || null, size: o.size || null, protect: false, subscribe: false });
      msg = p.name + ' moved to your cart.';
    } else if (btn.hasAttribute('data-unsave')) {
      msg = p.name + ' removed from your saved items.';
    } else return;
    RB.list.toggle(id, false);
    delete opts[id];
    RB.store(OPTS_KEY, opts);
    render();
    if (!on(8)) {
      setTimeout(function () { RB.say(msg); }, 400);
      var heading = root.querySelector('h1, .h1');
      if (heading) { heading.tabIndex = -1; heading.focus(); }
    }
  });
})();
