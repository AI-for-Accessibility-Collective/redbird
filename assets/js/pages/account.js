// Your Account: tiles at the top, then each section.
(function () {
  var h = RB.h, esc = RB.esc, money = RB.money;
  var orders = RB.store('redbird:orders') || [];
  var subs = [];
  orders.forEach(function (o) {
    if (o.cancelled) return;
    o.lines.forEach(function (l) { if (l.subscribe) subs.push({ order: o, line: l }); });
  });
  var saved = RB.list.ids().map(RB.byId).filter(Boolean);

  var TILES = [
    ['order', 'Your Orders', 'Track, return, cancel or buy things again'],
    ['#security', 'Login & security', 'Edit your name, email and phone number'],
    ['#addresses', 'Your Addresses', 'Edit where your orders go'],
    ['#payments', 'Payment options', 'Edit or add payment methods'],
    ['#lists', 'Your Lists', 'Things you saved for later'],
    ['#subscriptions', 'Subscribe & Save', 'See and cancel repeat deliveries'],
    ['help', 'Customer Service', 'Shipping, returns and help'],
  ];
  var html = '<div class="acct">' + h(1, 'Your Account') + '<div class="acct-tiles">' + TILES.map(function (t) {
    return '<a class="acct-tile" href="' + t[0] + '"><b>' + esc(t[1]) + '</b><span>' + esc(t[2]) + '</span></a>';
  }).join('') + '</div>';
  // Signing out goes to the home page, which says so (this practice store has no sign-in page).
  html += '<p class="acct-signout">Not Jeff? <a href="./?signedout=1">Sign out</a></p>';

  html += '<section class="panel acct-sec" id="security">' + h(2, 'Login & security') +
    '<dl class="acct-dl"><dt>Name</dt><dd>Jeff Pesos</dd><dt>Email</dt><dd>jeff.pesos@example.com</dd>' +
    '<dt>Mobile phone</dt><dd>(650) 555-0142</dd><dt>Password</dt><dd>********</dd></dl></section>';

  html += '<section class="panel acct-sec" id="addresses">' + h(2, 'Your Addresses') +
    '<div class="addr"><p class="fine">Default</p><p><b>Jeff Pesos</b><br>508 Aria Lane<br>Palo Alto, CA 94301<br>United States</p></div></section>';

  html += '<section class="panel acct-sec" id="payments">' + h(2, 'Payment options') +
    '<div class="addr"><p><b>Visa ending in 7319</b><br>Expires 08/2028<br>Billing ZIP 94301</p><p class="fine">Default for orders</p></div></section>';

  html += '<section class="panel acct-sec" id="lists">' + h(2, 'Your Lists');
  html += saved.length
    ? '<div class="shelf-row">' + saved.map(function (p, i) {
      return '<div class="deal-card"><a href="product?id=' + p.id + '">' + RB.imgTag(p, i, '', true) + '<div class="deal-name">' + esc(p.name) + '</div></a>' +
        RB.priceHTML(p.price) + '<button type="button" class="linkish" data-unsave="' + p.id + '">Remove<span class="sr-only"> ' + esc(p.name) + '</span></button></div>';
    }).join('') + '</div>'
    : '<p>Your list is empty. Use the heart on a product, or "Add to List" on its page, to save it here.</p>';
  html += '</section>';

  html += '<section class="panel acct-sec" id="subscriptions">' + h(2, 'Subscribe & Save');
  html += subs.length
    ? '<ul class="subs">' + subs.map(function (s, i) {
      var next = new Date(s.order.today + 'T10:00:00'); next.setMonth(next.getMonth() + 6);
      return '<li><b>' + esc(s.line.name) + '</b><br>' + money(s.line.unit) + ' every 6 months. Next delivery around ' + RB.dayLong(next) + '.' +
        ' <button type="button" class="linkish" data-cancel-sub="' + i + '">Cancel subscription<span class="sr-only"> for ' + esc(s.line.name) + '</span></button></li>';
    }).join('') + '</ul>'
    : '<p>You have no repeat deliveries.</p>';
  html += '</section></div>';

  var main = RB.mount(html, { title: 'Your Account' });
  main.addEventListener('click', function (e) {
    var un = e.target.closest('[data-unsave]'), cs = e.target.closest('[data-cancel-sub]');
    if (un) {
      RB.list.toggle(un.getAttribute('data-unsave'), false);
      un.closest('.deal-card').remove();
      RB.say('Removed from your list.');
    } else if (cs) {
      var s = subs[Number(cs.getAttribute('data-cancel-sub'))];
      s.line.subscribe = false;
      RB.store('redbird:orders', orders);
      cs.closest('li').textContent = 'Subscription cancelled for ' + s.line.name + '. You will not get repeat deliveries.';
      RB.say('Subscription cancelled.');
    }
  });
})();
