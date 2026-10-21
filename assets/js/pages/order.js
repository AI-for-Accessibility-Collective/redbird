// Orders. With ?id= it is the thank-you page right after checkout, with ?id=&details=1 (and for
// older orders) the order details page, and without an id "Your Orders".
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var orders = RB.store('redbird:orders') || [];
  var id = RB.param('id');
  var ADDRESS = ['Jeff Pesos', '508 Aria Lane', 'Palo Alto, CA 94301'];
  // Older orders on the account, so it looks lived in. They aren't saved in redbird:orders, so
  // checks that read the browser's orders (like the agent task) only see orders placed here.
  var PAST = [
    { id: '508-1990287-2018413', placed: '2026-10-03', delivered: '2026-10-07', to: 'Jeff Pesos', lines: [['kestrel-65w-gan', 1], ['rb-usbc-cable-6ft', 2]] },
    { id: '508-1990164-2018250', placed: '2026-09-12', delivered: '2026-09-15', to: 'Carol Pesos', gift: 'Happy birthday, Mom! Love, Jeff', lines: [['fernway-throw-blanket', 1, 'Oatmeal']] },
    { id: '508-1990093-2018177', placed: '2026-08-22', delivered: '2026-08-26', to: 'Jeff Pesos', lines: [['tidewell-french-press', 1], ['grocery-coffee-beans', 2]] },
  ].map(function (o) {
    var goods = 0;
    o.lines = o.lines.map(function (l) { var p = RB.byId(l[0]); goods += p.price * l[1]; return { id: p.id, name: p.name, qty: l[1], color: l[2] || null }; });
    o.goods = goods; o.tax = Math.round(goods * 0.09375 * 100) / 100; o.total = Math.round((goods + o.tax) * 100) / 100;
    return o;
  });

  function day(iso, opts) { return new Date(iso + 'T10:00:00').toLocaleDateString('en-US', opts || { weekday: 'long', month: 'long', day: 'numeric' }); }
  function placedOn(o) { return day(o.today, { month: 'long', day: 'numeric', year: 'numeric' }); }
  // Issue 31: the arrival date is hidden behind a count of business days.
  function arrival(o) {
    var d = o.delivery;
    if (on(31)) return 'Estimated delivery: ' + d.days[0] + (d.days[0] === d.days[1] ? '' : '–' + d.days[1]) + ' business days';
    return 'Arriving ' + (d.first === d.last ? day(d.first) : day(d.first) + ' – ' + day(d.last));
  }
  function itemDetails(l) {
    var bits = [];
    if (l.color) bits.push('Color: ' + esc(l.color));
    if (l.size) bits.push('Size: ' + esc(l.size));
    if (l.qty > 1) bits.push('Qty: ' + l.qty);
    var html = bits.length ? '<div class="fine">' + bits.join(' | ') + '</div>' : '';
    if (l.subscribe) {
      // Issue 32: an abbreviation nobody explains.
      html += '<div class="fine">' + (on(32) ? 'S&amp;S: every 6 mo.' : 'Subscribe &amp; Save: sent and charged again every 6 months') + '</div>';
    }
    if (l.plan) html += '<div class="fine">Includes a 2-year protection plan (' + money(l.plan) + ')</div>';
    return html;
  }
  function thumbs(o) {
    return '<div class="ord-thumbs">' + o.lines.map(function (l, i) {
      var p = RB.byId(l.id);
      return p ? '<a href="product?id=' + p.id + '">' + RB.imgTag(p, i, '', false, l.color) + '</a>' : '';
    }).join('') + '</div>';
  }
  function summary(o) {
    var row = function (k, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + k + '</td><td>' + v + '</td></tr>'; };
    return '<table class="ord-sum">' + row('Items:', money(o.goods)) + (o.plans ? row('Protection plans:', money(o.plans)) : '') +
      row('Delivery:', o.shipping ? money(o.shipping) : 'FREE') + row('Tax:', money(o.tax)) + row('Order total:', money(o.total), 'total') + '</table>';
  }

  // ── Thank-you page ────────────────────────────────────────────────────────
  function thanksHTML(o) {
    var html = '<div class="ord-wrap"><div class="ord-main">';
    html += '<div class="panel ord-thanks"><p class="ok"><span aria-hidden="true">✓</span> Order placed, thank you!</p>' +
      '<p>Confirmation will be sent to your email.</p>' +
      '<p><b>Shipping to ' + ADDRESS[0] + ',</b> ' + ADDRESS[1] + ', ' + ADDRESS[2] + '</p><hr>' +
      h(1, esc(arrival(o)), 'ord-when') + thumbs(o) +
      (o.swapped ? '<p class="notice-quiet">' + (on(32) ? 'Incl. substituted item(s).' : 'One item replaced a sold-out item.') + '</p>' : '') +
      '<p><a href="order">Review or edit your recent orders ›</a></p></div>';
    var keep = RB_CATALOG.filter(function (p) { return p.cat === (RB.byId(o.lines[0].id) || {}).cat && !o.lines.some(function (l) { return l.id === p.id; }); }).slice(0, 6);
    html += '<section class="panel" style="margin-top:16px">' + h(2, 'Keep shopping for') + '<div class="shelf-row">' + keep.map(function (p, i) {
      return '<a class="deal-card" href="product?id=' + p.id + '">' + RB.imgTag(p, i, '', true) + '<div class="deal-name">' + esc(RB.titleOf(p)) + '</div>' +
        RB.starsHTML(p, false) + RB.priceHTML(p.price) + '</a>';
    }).join('') + '</div></section></div>';
    html += '<aside class="panel ord-side"' + (on(11) ? '' : ' aria-label="Order summary"') + '>' + h(2, 'Order summary') +
      '<p class="fine">Order # ' + esc(o.id) + '</p>' + summary(o) + '<p class="fine">Paid with ' + esc(o.payment) + '</p></aside></div>';
    return html;
  }

  // ── Order details ─────────────────────────────────────────────────────────
  // The same layout as the thank-you page, for looking an order up later. Older orders (PAST)
  // have a delivered date instead of a delivery estimate.
  function detailsHTML(o) {
    var past = !o.delivery;
    var placed = past ? day(o.placed, { month: 'long', day: 'numeric', year: 'numeric' }) : placedOn(o);
    var status = o.cancelled ? 'Cancelled' : past ? 'Delivered ' + day(o.delivered, { month: 'long', day: 'numeric' }) : arrival(o);
    var html = '<div class="ord-wrap"><div class="ord-main"><div class="panel ord-details">' + h(1, 'Order details', 'ord-title') +
      '<p class="fine">Ordered on ' + placed + ' <span aria-hidden="true">·</span> Order # ' + esc(o.id) + '</p>' +
      '<p><b>Shipping to ' + esc(o.to || ADDRESS[0]) + ',</b> ' + ADDRESS[1] + ', ' + ADDRESS[2] + '</p>' +
      (o.gift ? '<p class="fine">Gift message: “' + esc(o.gift) + '”</p>' : '') + '<hr>' +
      h(2, esc(status), 'ord-when') +
      (o.swapped ? '<p class="notice-quiet">' + (on(32) ? 'Incl. substituted item(s).' : 'One item replaced a sold-out item.') + '</p>' : '');
    o.lines.forEach(function (l, i) {
      var p = RB.byId(l.id);
      html += '<div class="ord-line">' + (p ? '<a href="product?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + RB.imgTag(p, i, '', true, l.color) + '</a>' : '') +
        '<div><a href="product?id=' + l.id + '">' + esc(l.name) + '</a>' + itemDetails(l) +
        (p ? '<button type="button" class="btn btn-cart ord-again" data-again="' + esc(l.id) + '" data-color="' + esc(l.color || '') + '" data-size="' + esc(l.size || '') + '">Buy it again</button>' : '') +
        '</div></div>';
    });
    html += '<p><a href="order">Back to Your Orders</a></p></div></div>';
    html += '<aside class="panel ord-side"' + (on(11) ? '' : ' aria-label="Order summary"') + '>' + h(2, 'Order summary') +
      summary(o) + '<p class="fine">Paid with ' + esc(o.payment || 'Visa ending in 7319') + '</p></aside></div>';
    return html;
  }

  // ── Your Orders ───────────────────────────────────────────────────────────
  function orderCard(o) {
    var html = '<section class="ord-card"' + (on(11) ? '' : ' aria-label="Order ' + esc(o.id) + '"') + '><div class="ord-head">' +
      '<div><span>Order placed</span>' + placedOn(o) + '</div><div><span>Total</span>' + money(o.total) + '</div>' +
      '<div><span>Ship to</span>' + ADDRESS[0] + '</div><div class="ord-num"><span>Order # ' + esc(o.id) + '</span><a href="order?id=' + esc(o.id) + '&amp;details=1">View order details</a></div></div>';
    html += '<div class="ord-body"><div>' + h(2, o.cancelled ? 'Cancelled' : esc(arrival(o)), 'ord-status');
    if (o.cancelled) html += '<p class="fine">You were not charged for this order.</p>';
    o.lines.forEach(function (l, i) {
      var p = RB.byId(l.id);
      html += '<div class="ord-line">' + (p ? '<a href="product?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + RB.imgTag(p, i, '', true, l.color) + '</a>' : '') +
        '<div><a href="product?id=' + l.id + '">' + esc(l.name) + '</a>' + itemDetails(l) +
        (p ? '<button type="button" class="btn btn-cart ord-again" data-again="' + esc(l.id) + '" data-color="' + esc(l.color || '') + '" data-size="' + esc(l.size || '') + '">Buy it again</button>' : '') +
        '</div></div>';
    });
    html += '</div><div class="ord-actions">';
    if (!o.cancelled) {
      html += '<button type="button" class="btn btn-plain btn-block" data-track="' + esc(o.id) + '">Track package</button>' +
        '<button type="button" class="btn btn-plain btn-block" data-cancel="' + esc(o.id) + '">Cancel items</button>' +
        '<p class="fine ord-track" id="track-' + esc(o.id) + '" hidden>Not shipped yet. We will email you when it ships.</p>';
    }
    return html + '</div></div></section>';
  }
  function pastCard(o) {
    var html = '<section class="ord-card"' + (on(11) ? '' : ' aria-label="Order ' + esc(o.id) + '"') + '><div class="ord-head">' +
      '<div><span>Order placed</span>' + day(o.placed, { month: 'long', day: 'numeric', year: 'numeric' }) + '</div><div><span>Total</span>' + money(o.total) + '</div>' +
      '<div><span>Ship to</span>' + esc(o.to) + '</div><div class="ord-num"><span>Order # ' + esc(o.id) + '</span><a href="order?id=' + esc(o.id) + '&amp;details=1">View order details</a></div></div>';
    html += '<div class="ord-body"><div>' + h(2, 'Delivered ' + day(o.delivered, { month: 'long', day: 'numeric' }), 'ord-status');
    if (o.gift) html += '<p class="fine">Gift message: “' + esc(o.gift) + '”</p>';
    o.lines.forEach(function (l, i) {
      var p = RB.byId(l.id);
      html += '<div class="ord-line"><a href="product?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + RB.imgTag(p, i, '', true, l.color) + '</a>' +
        '<div><a href="product?id=' + l.id + '">' + esc(l.name) + '</a>' + itemDetails(l) +
        '<button type="button" class="btn btn-cart ord-again" data-again="' + esc(l.id) + '" data-color="' + esc(l.color || '') + '" data-size="">Buy it again</button></div></div>';
    });
    html += '</div><div class="ord-actions"><a class="btn btn-plain btn-block" href="help#returns">Return or replace items</a>' +
      '<a class="btn btn-plain btn-block" href="product?id=' + o.lines[0].id + '#write-review">Write a product review</a></div></div></section>';
    return html;
  }
  function listHTML() {
    var n = orders.length + PAST.length;
    var html = '<div class="ord-list">' + h(1, 'Your Orders') + '<p class="fine">' + n + ' orders placed in 2026</p>';
    return html + orders.map(orderCard).join('') + PAST.map(pastCard).join('') + '</div>';
  }

  var order = id ? orders.concat(PAST).find(function (o) { return o.id === id; }) : null;
  var main;
  if (id && !order) {
    RB.mount('<div class="ord-list panel">' + h(1, 'We couldn’t find that order') + '<p>It may have been placed in a different browser. <a href="order">See your orders</a>.</p></div>', { title: 'Order not found' });
    return;
  }
  // Right after checkout it's the thank-you page; from Your Orders (and for older orders) it's the details page.
  var showDetails = order && (RB.param('details') === '1' || PAST.indexOf(order) !== -1);
  main = RB.mount(!order ? listHTML() : showDetails ? detailsHTML(order) : thanksHTML(order),
    { title: !order ? 'Your Orders' : showDetails ? 'Order details' : 'Thank you' });

  main.addEventListener('click', function (e) {
    var cancel = e.target.closest('[data-cancel]'), track = e.target.closest('[data-track]'), again = e.target.closest('[data-again]');
    if (cancel) {
      var o = orders.find(function (x) { return x.id === cancel.getAttribute('data-cancel'); });
      o.cancelled = true;
      RB.store('redbird:orders', orders);
      main.innerHTML = listHTML();
      if (!on(8)) RB.say('Order ' + o.id + ' cancelled.');
      var heading = main.querySelector('h1, .h1');
      if (heading && !on(8)) { heading.tabIndex = -1; heading.focus(); }
    } else if (track) {
      main.querySelector('#track-' + track.getAttribute('data-track')).hidden = false;
    } else if (again) {
      var p = RB.byId(again.getAttribute('data-again'));
      RB.cart.add({ id: p.id, qty: 1, color: again.getAttribute('data-color') || null, size: again.getAttribute('data-size') || null });
      RB.addedToast(p, 1);
    }
  });
})();
