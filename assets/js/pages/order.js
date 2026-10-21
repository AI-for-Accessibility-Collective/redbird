// Orders. With ?id= it is the thank-you page right after checkout; without it, "Your Orders".
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var orders = RB.store('redbird:orders') || [];
  var id = RB.param('id');
  var ADDRESS = ['Sam Rivera', '123 Bryant Street, Apt 4', 'Palo Alto, CA 94301'];

  function day(iso, opts) { return new Date(iso + 'T10:00:00').toLocaleDateString('en-US', opts || { weekday: 'long', month: 'long', day: 'numeric' }); }
  function placedOn(o) { return day(o.today, { month: 'long', day: 'numeric', year: 'numeric' }); }
  // Issue 33: the arrival date is hidden behind a count of business days.
  function arrival(o) {
    var d = o.delivery;
    if (on(33)) return 'Estimated delivery: ' + d.days[0] + (d.days[0] === d.days[1] ? '' : '–' + d.days[1]) + ' business days';
    return 'Arriving ' + (d.first === d.last ? day(d.first) : day(d.first) + ' – ' + day(d.last));
  }
  function itemDetails(l) {
    var bits = [];
    if (l.color) bits.push('Color: ' + esc(l.color));
    if (l.size) bits.push('Size: ' + esc(l.size));
    if (l.qty > 1) bits.push('Qty: ' + l.qty);
    var html = bits.length ? '<div class="fine">' + bits.join(' | ') + '</div>' : '';
    if (l.subscribe) {
      // Issue 34: an abbreviation nobody explains.
      html += '<div class="fine">' + (on(34) ? 'S&amp;S: every 6 mo.' : 'Subscribe &amp; Save: sent and charged again every 6 months') + '</div>';
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
      (o.swapped ? '<p class="notice-quiet">' + (on(34) ? 'Incl. substituted item(s).' : 'One item replaced a sold-out item.') + '</p>' : '') +
      '<p><a href="order">Review or edit your recent orders ›</a></p></div>';
    var keep = RB_CATALOG.filter(function (p) { return p.cat === (RB.byId(o.lines[0].id) || {}).cat && !o.lines.some(function (l) { return l.id === p.id; }); }).slice(0, 6);
    html += '<section class="panel" style="margin-top:16px">' + h(2, 'Keep shopping for') + '<div class="shelf-row">' + keep.map(function (p, i) {
      return '<a class="deal-card" href="product?id=' + p.id + '">' + RB.imgTag(p, i, '', true) + '<div class="deal-name">' + esc(RB.titleOf(p)) + '</div>' +
        RB.starsHTML(p, false) + RB.priceHTML(p.price) + '</a>';
    }).join('') + '</div></section></div>';
    html += '<aside class="panel ord-side"' + (on(12) ? '' : ' aria-label="Order summary"') + '>' + h(2, 'Order summary') +
      '<p class="fine">Order # ' + esc(o.id) + '</p>' + summary(o) + '<p class="fine">Paid with ' + esc(o.payment) + '</p></aside></div>';
    return html;
  }

  // ── Your Orders ───────────────────────────────────────────────────────────
  function orderCard(o) {
    var html = '<section class="ord-card"' + (on(12) ? '' : ' aria-label="Order ' + esc(o.id) + '"') + '><div class="ord-head">' +
      '<div><span>Order placed</span>' + placedOn(o) + '</div><div><span>Total</span>' + money(o.total) + '</div>' +
      '<div><span>Ship to</span>' + ADDRESS[0] + '</div><div class="ord-num"><span>Order # ' + esc(o.id) + '</span><a href="order?id=' + esc(o.id) + '">View order details</a></div></div>';
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
  function listHTML() {
    var html = '<div class="ord-list">' + h(1, 'Your Orders') + '<p class="fine">' + orders.length + (orders.length === 1 ? ' order' : ' orders') + ' placed in 2026</p>';
    if (!orders.length) return html + '<div class="panel"><p>You have not placed any orders yet.</p><p><a href="./">Continue shopping</a></p></div></div>';
    return html + orders.map(orderCard).join('') + '</div>';
  }

  var order = id ? orders.find(function (o) { return o.id === id; }) : null;
  var main;
  if (id && !order) {
    RB.mount('<div class="ord-list panel">' + h(1, 'We couldn’t find that order') + '<p>It may have been placed in a different browser. <a href="order">See your orders</a>.</p></div>', { title: 'Order not found' });
    return;
  }
  main = RB.mount(order ? thanksHTML(order) : listHTML(), { title: order ? 'Thank you' : 'Your Orders' });

  main.addEventListener('click', function (e) {
    var cancel = e.target.closest('[data-cancel]'), track = e.target.closest('[data-track]'), again = e.target.closest('[data-again]');
    if (cancel) {
      var o = orders.find(function (x) { return x.id === cancel.getAttribute('data-cancel'); });
      o.cancelled = true;
      RB.store('redbird:orders', orders);
      main.innerHTML = listHTML();
      if (!on(8)) RB.say('Order ' + o.id + ' cancelled.');
      var heading = main.querySelector('h1, .h1');
      if (heading && !on(9)) { heading.tabIndex = -1; heading.focus(); }
    } else if (track) {
      main.querySelector('#track-' + track.getAttribute('data-track')).hidden = false;
    } else if (again) {
      var p = RB.byId(again.getAttribute('data-again'));
      RB.cart.add({ id: p.id, qty: 1, color: again.getAttribute('data-color') || null, size: again.getAttribute('data-size') || null });
      RB.addedToast(p, 1);
    }
  });
})();
