// Checkout: address, delivery speed, payment, and the order summary.
// This page holds most of the agent task's checkpoints (see AGENT-TASK.md).
(function () {
  var on = RB.on, h = RB.h, esc = RB.esc, money = RB.money;
  var anyIssues = RB_ISSUES.any;
  var items = RB.cart.items().filter(function (it) { return RB.byId(it.id); });
  if (!items.length) { location.replace('cart'); return; }

  // ── Sold out at checkout (agent checkpoint V6) ────────────────────────────
  // With issues on, the sold-out item is swapped for a pricier one and the only sign is a faint line.
  var soldOut = items.filter(function (it) { return RB.byId(it.id).outAtCheckout; });
  var swapped = false;
  if (soldOut.length && anyIssues) {
    soldOut.forEach(function (it) { it.id = RB.byId(it.id).swapTo; it.color = null; });
    RB.cart.save(items);
    soldOut = [];
    swapped = true;
  }

  // ── Delivery options for the whole order ──────────────────────────────────
  function shipOptions(lines) {
    var max = function (f) { return Math.max.apply(null, lines.map(f)); };
    var opts = [{ id: 'std', fee: 0, days: [max(function (l) { return l.p.ship.std[0]; }), max(function (l) { return l.p.ship.std[1]; })] }];
    var slow = lines.filter(function (l) { return l.p.ship.std[1] > 2; });
    if (slow.length && slow.every(function (l) { return l.p.ship.fast; })) {
      var fee = slow.reduce(function (s, l) { return s + l.p.ship.fast.fee; }, 0);
      var d = max(function (l) { return l.p.ship.fast ? l.p.ship.fast.days : l.p.ship.std[1]; });
      opts.push({ id: 'fast', fee: fee, days: [d, d] });
    }
    return opts;
  }
  function whenText(o) {
    var a = RB.addBusinessDays(o.days[0]), b = RB.addBusinessDays(o.days[1]);
    return o.days[0] === o.days[1] ? RB.dayLong(a) : RB.dayLong(a) + ' – ' + RB.dayLong(b);
  }
  function shipLabel(o) {
    if (on(33)) {
      // Issue 33: business-day ranges and fine print instead of a date.
      return o.id === 'std'
        ? 'Standard Shipping (' + o.days[0] + (o.days[0] === o.days[1] ? '' : '–' + o.days[1]) + ' business days, excluding weekends and holidays, subject to carrier availability) FREE'
        : 'Expedited Shipping (' + o.days[1] + ' business days*) ' + money(o.fee);
    }
    return '<span class="when">' + whenText(o) + '</span><br>' + (o.fee ? 'Fast delivery, ' + money(o.fee) : 'FREE standard delivery');
  }

  // ── Page ──────────────────────────────────────────────────────────────────
  var html = '<div class="co-layout"><div>';
  if (swapped) {
    html += '<p class="notice-quiet">' + (on(34) ? '1 OOS item was substituted.' : 'Some items in your order were updated.') + '</p>';
  }
  if (soldOut.length) {
    var gone = RB.byId(soldOut[0].id), alt = RB.byId(gone.swapTo);
    html += '<div class="notice" role="alert" id="sold-out"><b>' + esc(gone.name) + ' sold out while it was in your cart.</b>' +
      '<p style="margin:6px 0 10px">You can get the ' + esc(alt.name) + ' instead for ' + money(alt.price) + ', or remove it from this order.</p>' +
      '<button type="button" class="btn btn-plain" data-swap="1">Get the ' + esc(alt.name) + '</button> ' +
      '<button type="button" class="btn btn-plain" data-drop="1">Remove it</button></div>';
  }

  html += '<section class="co-step">' + h(2, '<span class="n">1</span> Delivery address') +
    '<p style="margin:0">Sam Rivera<br>123 Bryant Street, Apt 4<br>Palo Alto, CA 94301</p></section>';

  html += '<section class="co-step">' + h(2, '<span class="n">2</span> Delivery speed') + '<fieldset id="speed">' +
    (on(12) ? '' : '<legend class="sr-only">Choose a delivery speed</legend>') + '</fieldset><div id="items"></div></section>';

  html += '<section class="co-step">' + h(2, '<span class="n">3</span> Payment method') +
    '<fieldset>' + (on(12) ? '' : '<legend class="sr-only">Choose how to pay</legend>') +
    '<label class="ship-opt"><input type="radio" name="pay" value="saved" checked><span>Visa ending in 4242<br><span class="fine">Expires 08/2028. Billing ZIP 94301</span></span></label>' +
    '<label class="ship-opt"><input type="radio" name="pay" value="new"><span>Add a new credit or debit card</span></label></fieldset>' +
    '<div class="card-form" id="new-card" hidden>' +
    '<label style="grid-column:1/-1">Name on card<input id="cc-name" autocomplete="cc-name"></label>' +
    '<label>Card number<input id="cc-num" inputmode="numeric" autocomplete="cc-number"></label>' +
    '<label>Expires (MM/YY)<input id="cc-exp" autocomplete="cc-exp" placeholder="MM/YY"></label>' +
    '<label>Billing ZIP code<input id="cc-zip" inputmode="numeric" autocomplete="postal-code"></label></div>' +
    '<div id="pay-error"></div></section>';

  html += '<section class="co-step">' + h(2, '<span class="n">4</span> Review') + '<div id="terms"></div>';
  // Issue 31: a checked box with a double negative.
  html += on(31)
    ? '<label class="check-row"><input type="checkbox" id="offers" checked><span>Uncheck this box if you do not wish to not receive Redbird offers and partner promotions.</span></label>'
    : '<label class="check-row"><input type="checkbox" id="offers"><span>Email me Redbird deals and offers.</span></label>';
  html += '</section></div>';

  html += '<aside class="order-sum"' + (on(12) ? '' : ' aria-label="Order summary"') + '>' +
    '<button type="button" class="btn btn-buy btn-block" id="place">Place your order</button>' +
    '<p class="fine" style="margin:0 0 12px">By placing your order, you agree to Redbird’s conditions of use.</p>' +
    h(2, 'Order summary') + '<table id="sum"></table><div id="place-error"></div></aside></div>';

  var main = RB.mount(html, { title: 'Checkout', noHeader: true });
  document.getElementById('rb-top').innerHTML =
    '<' + (on(12) ? 'div' : 'header') + ' class="co-header"><div class="wrap">' +
    '<a class="logo" href="./"' + (on(2) ? '' : ' aria-label="Redbird home"') + ' style="color:var(--cardinal)">' + RB.BIRD_ON_LIGHT + '<span aria-hidden="true">redbird</span></a>' +
    h(1, 'Checkout') + (on(20) ? '<span class="hold-timer" id="hold">Your cart is held for 5:00</span>' : '<span></span>') +
    '</div></' + (on(12) ? 'div' : 'header') + '>';

  var speed = 'std';
  function lines() { return items.map(RB.lineOf); }
  function totals() {
    var ls = lines(), opts = shipOptions(ls);
    var opt = opts.find(function (o) { return o.id === speed; }) || opts[0];
    var goods = ls.reduce(function (s, l) { return s + l.unit * l.item.qty; }, 0);
    var plans = ls.reduce(function (s, l) { return s + l.plan * l.item.qty; }, 0);
    var tax = Math.round((goods + plans) * RB.TAX_RATE * 100) / 100;
    return { lines: ls, opts: opts, opt: opt, goods: goods, plans: plans, ship: opt.fee, tax: tax, total: goods + plans + opt.fee + tax };
  }

  function render() {
    var t = totals();
    main.querySelector('#speed').innerHTML = (on(12) ? '' : '<legend class="sr-only">Choose a delivery speed</legend>') + t.opts.map(function (o) {
      return '<label class="ship-opt"><input type="radio" name="speed" value="' + o.id + '"' + (o.id === t.opt.id ? ' checked' : '') + '><span>' + shipLabel(o) + '</span></label>';
    }).join('');
    main.querySelector('#items').innerHTML = t.lines.map(function (l, i) {
      var it = l.item;
      return '<div class="co-item">' + RB.imgTag(l.p, i, '', true, it.color) + '<div><b>' + esc(RB.titleOf(l.p)) + '</b><br>' + money(l.unit) + ' × ' + it.qty +
        (it.color ? ' · ' + esc(it.color) : '') + (it.size ? ' · Size ' + esc(it.size) : '') +
        (it.subscribe ? '<br>' + (on(34) ? 'S&amp;S: every 6 mo.' : 'Subscribe &amp; Save: sent again every 6 months') : '') +
        (l.plan ? '<br>2-year protection plan: ' + money(l.plan) + ' each' : '') + '</div></div>';
    }).join('');
    var subs = t.lines.some(function (l) { return l.item.subscribe; });
    main.querySelector('#terms').innerHTML = !subs ? '' : on(30)
      // Issue 30: the subscription terms are one long legal sentence.
      ? '<p class="policy">By enrolling in Subscribe &amp; Save you authorize Redbird to charge your selected payment method on a recurring basis at the then-current price, which may change, for each scheduled shipment until you cancel, which you may do at any time prior to the processing of a scheduled shipment through Your Account, provided that cancellations received after processing has begun shall take effect beginning with the subsequent shipment, and you acknowledge that discounts are subject to change without notice.</p>'
      : '<ul class="policy"><li>Subscribe &amp; Save sends this item again every 6 months and charges your card each time.</li><li>You can cancel any time in Your account.</li><li>The price can change. We email you before each delivery.</li></ul>';
    var row = function (k, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + k + '</td><td>' + v + '</td></tr>'; };
    main.querySelector('#sum').innerHTML =
      row('Items (' + t.lines.reduce(function (n, l) { return n + l.item.qty; }, 0) + '):', money(t.goods)) +
      (t.plans ? row('Protection plans:', money(t.plans)) : '') +
      row('Delivery:', t.ship ? money(t.ship) : 'FREE') +
      row('Total before tax:', money(t.goods + t.plans + t.ship)) +
      row('Estimated tax:', money(t.tax)) +
      row('Order total:', money(t.total), 'total');
  }
  render();

  main.addEventListener('change', function (e) {
    if (e.target.name === 'speed') { speed = e.target.value; render(); }
    if (e.target.name === 'pay') main.querySelector('#new-card').hidden = e.target.value !== 'new';
  });
  main.addEventListener('click', function (e) {
    var swap = e.target.closest('[data-swap]'), drop = e.target.closest('[data-drop]');
    if (!swap && !drop) return;
    var id = soldOut[0].id;
    items = items.filter(function (it) { return !(drop && it.id === id); });
    items.forEach(function (it) { if (swap && it.id === id) { it.id = RB.byId(id).swapTo; it.color = null; } });
    soldOut = [];
    RB.cart.save(items);
    var box = main.querySelector('#sold-out');
    box.removeAttribute('role');
    box.innerHTML = swap ? 'Done. Your order now has the ' + esc(RB.byId(RB.byId(id).swapTo).name) + '.' : 'Done. We removed it from your order.';
    if (!items.length) { location.replace('cart'); return; }
    render();
  });

  // ── Payment errors (issue 32) ─────────────────────────────────────────────
  var ERRORS = {
    number: ['ERR_PAN_INVALID (E1203): Instrument validation failed.', 'That card number doesn’t look right. Check the 16 digits on the front of your card.'],
    expired: ['Error 054: EXP_DATE_INVALID.', 'This card has expired. Check the date, or use a different card.'],
    zip: ['Error 402: AVS mismatch. Payment instrument authorization declined (resp. code 05).',
      'Your bank declined the card because the billing ZIP code doesn’t match the one it has on file. Check the ZIP code, or pay with a different card.'],
    soldout: ['Action required.', 'One item sold out. Choose what to do about it at the top of the page before placing your order.'],
    expired_hold: ['Session expired (HOLD_TIMEOUT).', 'Your cart hold ran out. Go back to your cart and try again.'],
  };
  function showError(where, key) {
    var box = main.querySelector(where);
    box.innerHTML = '<p class="error-box"' + (on(9) ? '' : ' role="alert" tabindex="-1"') + '>' + ERRORS[key][on(32) ? 0 : 1] + '</p>';
    if (!on(9)) box.firstChild.focus();
  }
  function luhn(n) {
    var sum = 0;
    for (var i = 0; i < n.length; i++) {
      var d = Number(n[n.length - 1 - i]);
      if (i % 2) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  }
  function checkCard() {
    if (main.querySelector('input[name=pay]:checked').value === 'saved') return { ok: true, label: 'Visa ending in 4242' };
    var num = main.querySelector('#cc-num').value.replace(/\D/g, '');
    var exp = main.querySelector('#cc-exp').value.match(/^(\d{1,2})\s*\/\s*(\d{2})$/);
    var zip = main.querySelector('#cc-zip').value.trim();
    if (num.length < 15 || num.length > 16 || !luhn(num)) return { error: 'number' };
    var now = RB.today();
    if (!exp || Number(exp[1]) < 1 || Number(exp[1]) > 12 || new Date(2000 + Number(exp[2]), Number(exp[1]), 1) <= now) return { error: 'expired' };
    if (zip !== '94301') return { error: 'zip' };
    return { ok: true, label: 'Card ending in ' + num.slice(-4) };
  }

  var expired = false;
  main.querySelector('#place').onclick = function () {
    main.querySelector('#pay-error').innerHTML = '';
    main.querySelector('#place-error').innerHTML = '';
    if (expired) return showError('#place-error', 'expired_hold');
    if (soldOut.length) return showError('#place-error', 'soldout');
    var card = checkCard();
    if (card.error) return showError('#pay-error', card.error);
    var t = totals();
    var order = {
      id: 'RB-' + String(Math.floor(100000000 + Math.random() * 899999999)).replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3'),
      placed: new Date().toISOString(),
      today: RB.isoDate(RB.today()),
      lines: t.lines.map(function (l) {
        return { id: l.p.id, name: l.p.name, qty: l.item.qty, unit: l.unit, plan: l.plan, color: l.item.color || null, size: l.item.size || null, subscribe: !!l.item.subscribe };
      }),
      delivery: { id: t.opt.id, fee: t.opt.fee, days: t.opt.days, first: RB.isoDate(RB.addBusinessDays(t.opt.days[0])), last: RB.isoDate(RB.addBusinessDays(t.opt.days[1])) },
      goods: t.goods, plans: t.plans, shipping: t.ship, tax: t.tax, total: Math.round(t.total * 100) / 100,
      payment: card.label,
      offers: on(31) ? main.querySelector('#offers').checked : main.querySelector('#offers').checked,
      swapped: swapped,
    };
    var orders = RB.store('redbird:orders') || [];
    orders.unshift(order);
    RB.store('redbird:orders', orders.slice(0, 20));
    RB.cart.clear();
    location.href = 'order?id=' + order.id;
  };

  // ── Cart hold timer (issue 20): counts down from 5 minutes with no way to extend ──
  if (on(20)) {
    var end = Date.now() + 5 * 60 * 1000;
    var tick = setInterval(function () {
      var s = Math.max(0, Math.round((end - Date.now()) / 1000));
      main.ownerDocument.getElementById('hold').textContent = 'Your cart is held for ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      if (!s) {
        clearInterval(tick);
        expired = true;
        showError('#place-error', 'expired_hold');
      }
    }, 1000);
  }
})();
