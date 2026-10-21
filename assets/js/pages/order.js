// Order confirmation: what was bought, when it arrives, and what it cost.
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var orders = RB.store('redbird:orders') || [];
  var id = RB.param('id');
  var order = orders.find(function (o) { return o.id === id; }) || (id ? null : orders[0]);

  if (!order) {
    RB.mount('<div class="done panel">' + h(1, 'We couldn’t find that order') +
      '<p>It may have been placed in a different browser. <a href="./">Go back to the store</a>.</p></div>', { title: 'Order not found' });
    return;
  }

  function day(iso) { return RB.dayLong(new Date(iso + 'T10:00:00')); }
  function render() {
    var d = order.delivery;
    var when = on(33)
      ? 'Estimated delivery: ' + d.days[0] + (d.days[0] === d.days[1] ? '' : '–' + d.days[1]) + ' business days'
      : 'Arriving ' + (d.first === d.last ? day(d.first) : day(d.first) + ' – ' + day(d.last));
    var html = '<div class="done"><div class="panel">';
    if (order.cancelled) {
      html += h(1, 'Order cancelled') + '<p>Order ' + esc(order.id) + ' is cancelled. You won’t be charged.</p>';
    } else {
      html += '<p class="ok">✓ Order placed, thanks!</p>' + h(1, esc(when), 'arrive') +
        '<p>Order number <b>' + esc(order.id) + '</b>. We sent a confirmation to sam.rivera@example.com.</p>';
    }
    html += '</div><div class="panel" style="margin-top:16px">' + h(2, 'What you bought');
    order.lines.forEach(function (l, i) {
      var p = RB.byId(l.id);
      html += '<div class="co-item">' + (p ? RB.imgTag(p, i, '', true) : '') + '<div><b>' + esc(l.name) + '</b><br>' + money(l.unit) + ' × ' + l.qty +
        (l.color ? ' · ' + esc(l.color) : '') + (l.size ? ' · Size ' + esc(l.size) : '');
      if (l.subscribe) {
        var next = new Date(order.today + 'T10:00:00');
        next.setMonth(next.getMonth() + 6);
        html += '<br>' + (on(34) ? 'S&amp;S. Next: ' + RB.dayShort(next) : 'Subscribe &amp; Save: we’ll send and charge for this again around ' + RB.dayLong(next) + '.');
      }
      if (l.plan) html += '<br>2-year protection plan, ' + money(l.plan) + ' each';
      html += '</div></div>';
    });
    if (order.swapped) html += '<p class="notice-quiet">' + (on(34) ? 'Incl. substituted item(s).' : 'One item in this order replaced a sold-out item.') + '</p>';
    html += '</div><div class="panel" style="margin-top:16px">' + h(2, 'Payment') + '<table class="spec-table" style="max-width:420px">' +
      '<tr><td>Items</td><td>' + money(order.goods) + '</td></tr>' +
      (order.plans ? '<tr><td>Protection plans</td><td>' + money(order.plans) + '</td></tr>' : '') +
      '<tr><td>Delivery</td><td>' + (order.shipping ? money(order.shipping) : 'FREE') + '</td></tr>' +
      '<tr><td>Tax</td><td>' + money(order.tax) + '</td></tr>' +
      '<tr><td><b>Order total</b></td><td><b>' + money(order.total) + '</b></td></tr>' +
      '<tr><td>Paid with</td><td>' + esc(order.payment) + '</td></tr></table>';
    html += '<p style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><a class="btn btn-cart" href="./">Continue shopping</a>' +
      (order.cancelled ? '' : '<button type="button" class="btn btn-plain" id="cancel">Cancel this order</button>') + '</p></div></div>';
    return html;
  }

  var main = RB.mount(render(), { title: 'Order ' + order.id });
  main.addEventListener('click', function (e) {
    if (!e.target.closest('#cancel')) return;
    order.cancelled = true;
    RB.store('redbird:orders', orders);
    main.innerHTML = render();
    var h1 = main.querySelector('h1, .h1');
    if (h1 && !on(9)) { h1.tabIndex = -1; h1.focus(); }
  });
})();
