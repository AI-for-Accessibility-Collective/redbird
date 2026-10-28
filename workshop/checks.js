// Ready-made checks for the planted problems the workshop guide suggests building fixes for. Each one
// tries the fix the way the person would (presses Enter, types a price, lets the cart timer run out,
// makes a payment fail) instead of only looking at the page. They don't place orders, and anything
// they add to the cart is taken out again.
//
//   RB_CHECKS[19](win)  → Promise of [{ ok, says }], or [] when the problem isn't on that page
//
// The workshop panel runs them in its hidden copy of the page after each new version, and the starter
// folder's tests (tools/test.mjs) run them on the page with the adapter on. win is that page's window.
(function () {
  function pause(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function text(el) { return (el && el.textContent || '').replace(/\s+/g, ' ').trim(); }
  // Roughly what a screen reader says: labels first, alt text for images, nothing that is aria-hidden.
  function spoken(el, doc) {
    if (el.nodeType === 3) return el.nodeValue;
    if (el.nodeType !== 1 || el.getAttribute('aria-hidden') === 'true' || /^(SCRIPT|STYLE)$/.test(el.tagName)) return '';
    var label = el.getAttribute('aria-label');
    if (label && label.trim()) return label;
    var by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map(function (id) { return text(doc.getElementById(id)); }).join(' ');
    if (el.tagName === 'IMG') return el.getAttribute('alt') || '';
    return Array.prototype.map.call(el.childNodes, function (n) { return spoken(n, doc); }).join(' ');
  }
  function nameOf(el, doc) {
    var s = el.getAttribute('aria-label') || '';
    if (!s && el.getAttribute('aria-labelledby')) s = spoken(el, doc);
    if (!s && el.labels && el.labels.length) s = Array.prototype.map.call(el.labels, function (l) { return spoken(l, doc); }).join(' ');
    return s.replace(/\s+/g, ' ').trim();
  }
  function shown(el) { return !!el && el.getClientRects().length > 0 && el.ownerDocument.defaultView.getComputedStyle(el).visibility !== 'hidden'; }
  function press(el, key) {
    ['keydown', 'keyup'].forEach(function (type) {
      el.dispatchEvent(new el.ownerDocument.defaultView.KeyboardEvent(type, { key: key, code: key === ' ' ? 'Space' : key, bubbles: true, cancelable: true }));
    });
  }
  function reachable(el) { return el.tagName === 'BUTTON' || el.tagName === 'A' || (el.getAttribute('role') === 'button' && el.tabIndex >= 0); }
  function cartCount(w) {
    try { return (JSON.parse(w.localStorage.getItem('redbird:cart') || '[]') || []).reduce(function (a, x) { return a + (x.qty || 0); }, 0); } catch (e) { return 0; }
  }
  // A price card's amount, from the store's own pieces ($, 18, 99).
  function priceOf(card) {
    var p = card.querySelector('.price');
    if (!p) return null;
    var whole = p.querySelector('.whole'), cents = p.querySelector('.cents');
    var v = whole ? parseFloat(text(whole).replace(/\D/g, '') + '.' + (cents ? text(cents).replace(/\D/g, '') : '0')) : parseFloat(text(p).replace(/[^\d.]/g, ''));
    return isNaN(v) ? null : v;
  }
  function setValue(input, value) {
    var w = input.ownerDocument.defaultView;
    var set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
    set.call(input, value);
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
    input.dispatchEvent(new w.Event('change', { bubbles: true }));
  }

  var CHECKS = {
    // "Add to cart" can be reached with Tab and pressed with Enter.
    3: function (w) {
      var d = w.document, buttons = Array.prototype.slice.call(d.querySelectorAll('[data-buy="cart"], .btn-cart[data-add]')).filter(shown).slice(0, 2);
      if (!buttons.length) return Promise.resolve([]);
      var cart = w.localStorage.getItem('redbird:cart');
      return buttons.reduce(function (p, b) {
        return p.then(function (out) {
          if (!reachable(b)) return out.concat({ ok: false, says: '“' + text(b) + '” can’t be reached with Tab (it isn’t a button and has no tabindex="0")' });
          var before = cartCount(w);
          b.focus();
          // A real button presses itself on Enter, which a script can't fake, so it gets clicked instead.
          if (b.tagName === 'BUTTON') b.click(); else press(b, 'Enter');
          return pause(600).then(function () {
            var added = cartCount(w) > before;
            var close = d.querySelector('.added-close');
            if (close) close.click();
            return out.concat(added ? { ok: true, says: 'Tab reaches “' + text(b) + '”, and Enter adds the item to the cart' }
              : { ok: false, says: 'Tab reaches “' + text(b) + '”, but pressing Enter doesn’t add the item to the cart' });
          });
        });
      }, Promise.resolve([])).then(function (out) {
        if (cart === null) w.localStorage.removeItem('redbird:cart'); else w.localStorage.setItem('redbird:cart', cart);
        return out;
      });
    },

    // Every sponsored result says it is an ad, also to a screen reader.
    7: function (w) {
      var d = w.document, ads = Array.prototype.slice.call(d.querySelectorAll('.sponsored-img')).filter(function (img) { return img.closest('.card'); });
      if (!ads.length) return Promise.resolve([]);
      var bad = ads.filter(function (img) { return !/\b(ad|ads|advert|advertisement|sponsored|promoted)\b/i.test(spoken(img.closest('.card'), d)); });
      return Promise.resolve([bad.length
        ? { ok: false, says: bad.length + ' of ' + ads.length + ' sponsored results don’t say they are an ad to a screen reader' }
        : { ok: true, says: 'All ' + ads.length + ' sponsored results say they are an ad, to a screen reader too' }]);
    },

    // The price filter can be set without dragging, and the results change to match.
    18: function (w) {
      var d = w.document, slider = d.querySelector('.drag-slider');
      if (!slider) return Promise.resolve([]);
      var area = slider.closest('aside, section, form, .filters, .side') || slider.parentElement;
      var box = Array.prototype.slice.call(d.querySelectorAll('input')).filter(function (i) {
        return shown(i) && /^(number|text|)$/.test(i.type) && !i.closest('.search, header') &&
          /max/i.test([i.name, i.id, i.placeholder, i.getAttribute('aria-label'), i.labels && i.labels[0] && text(i.labels[0])].join(' '));
      })[0];
      var limit = 20;
      var tried;
      if (box) {
        setValue(box, String(limit));
        press(box, 'Enter');
        if (box.form) box.form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
        tried = 'typing $' + limit + ' as the maximum price';
      } else {
        var knob = Array.prototype.slice.call(slider.querySelectorAll('[role=slider], .knob')).filter(function (k) { return k.tabIndex >= 0; }).pop();
        if (!knob) return Promise.resolve([{ ok: false, says: 'There is no box to type a price and no slider handle the keyboard can reach' }]);
        knob.focus();
        for (var i = 0; i < 15; i++) press(knob, 'ArrowLeft');
        var label = d.querySelector('#slider-label');
        var m = label && text(label).match(/\$\s?(\d+)\D+\$\s?(\d+)/);
        limit = m ? Number(m[2]) : limit;
        tried = 'moving the maximum handle with the arrow keys';
      }
      return pause(1500).then(function () {
        var cards = Array.prototype.slice.call(d.querySelectorAll('.card')).filter(function (c) { return shown(c) && !area.contains(c); });
        var over = cards.filter(function (c) { var p = priceOf(c); return p != null && p > limit + 0.5; });
        if (!cards.length) return [{ ok: true, says: 'After ' + tried + ', no results are shown, so none cost more' }];
        return [over.length
          ? { ok: false, says: 'After ' + tried + ', ' + over.length + ' of ' + cards.length + ' results still cost more than $' + limit }
          : { ok: true, says: 'After ' + tried + ', every result shown costs $' + limit + ' or less' }];
      });
    },

    // The cart timer doesn't stop the order: it's stopped, or there's a way to get more time.
    19: function (w) {
      var d = w.document, hold = d.getElementById('hold'), place = d.getElementById('place-error');
      if (!hold || !place) return Promise.resolve([]);
      var more = Array.prototype.slice.call(d.querySelectorAll('button, a, [role=button]')).some(function (el) {
        return shown(el) && /more time|extend|add time|keep (my )?cart|stop the timer/i.test(text(el) + ' ' + (el.getAttribute('aria-label') || ''));
      });
      if (more) return Promise.resolve([{ ok: true, says: 'There is a button to get more time' }]);
      // Let the store's clock run past the 5 minutes, then put it back.
      var real = w.Date.now;
      w.Date.now = function () { return real.call(w.Date) + 6 * 60 * 1000; };
      return pause(2500).then(function () {
        w.Date.now = real;
        var ran = /expired|hold_timeout|hold ran out|ran out/i.test(text(place));
        return [ran ? { ok: false, says: 'When the 5 minutes run out, the order still can’t be placed (it says “' + text(place).slice(0, 80) + '”)' }
          : { ok: true, says: 'When the 5 minutes run out, the order can still be placed' }];
      });
    },

    // Every photo thumbnail can be reached with Tab, and Enter or a click switches the big photo.
    22: function (w) {
      var d = w.document, thumbs = Array.prototype.slice.call(d.querySelectorAll('.thumbs .thumb, .thumbs [data-shot]')), big = d.getElementById('main-img');
      if (thumbs.length < 2 || !big) return Promise.resolve([]);
      var t = thumbs[1], img = t.querySelector('img'), want = img && img.getAttribute('src');
      if (!reachable(t)) return Promise.resolve([{ ok: false, says: 'The photo thumbnails can’t be reached with Tab' }]);
      t.focus();
      if (t.tagName === 'BUTTON') t.click(); else press(t, 'Enter');
      return pause(500).then(function () {
        var now = big.getAttribute('src');
        var ok = want && now && now.split('/').pop() === want.split('/').pop();
        var first = thumbs[0];
        if (first.tagName === 'BUTTON') first.click(); else press(first, 'Enter');
        return [ok ? { ok: true, says: 'Tab reaches the thumbnails, and pressing one switches the big photo' }
          : { ok: false, says: 'Tab reaches the thumbnails, but pressing one doesn’t switch the big photo' }];
      });
    },

    // The offers checkbox is one plain question, where a tick means yes.
    29: function (w) {
      var d = w.document, box = d.getElementById('offers');
      if (!box) return Promise.resolve([]);
      var name = nameOf(box, d);
      var negative = /\bnot\b|don[’']t|do not|uncheck|unsubscribe|opt out|no longer/i.test(name);
      return Promise.resolve([negative || !name
        ? { ok: false, says: 'The checkbox reads “' + name.slice(0, 120) + '”, which isn’t one plain question where a tick means yes' }
        : { ok: true, says: 'The checkbox reads “' + name.slice(0, 120) + '”' }]);
    },

    // Each kind of payment error says in plain words what went wrong and what to do next.
    30: function (w) {
      var d = w.document, num = d.getElementById('cc-num'), place = d.getElementById('place'), pay = d.getElementById('pay-error');
      var fresh = d.querySelector('input[name="pay"][value="new"]');
      if (!num || !place || !pay || !fresh) return Promise.resolve([]);
      var CODE = /ERR_|Error \d|[A-Z]{3,}_[A-Z_]+|\bAVS\b|resp\. code/;
      var NEXT = /\b(check|type|try|use|pay with|choose|go back|enter|re-?enter|update|contact)\b/i;
      var CASES = [
        { what: 'a wrong card number', num: '4242 4242 4242 4241', exp: '12/30', zip: '94301', about: /number|digits/i },
        { what: 'a ZIP code that doesn’t match the card', num: '4242 4242 4242 4242', exp: '12/30', zip: '10001', about: /zip|postal|billing address/i },
        { what: 'an expired card', num: '4242 4242 4242 4242', exp: '01/20', zip: '94301', about: /expir|date/i },
      ];
      fresh.checked = true;
      fresh.dispatchEvent(new w.Event('change', { bubbles: true }));
      var said = [];
      return CASES.reduce(function (p, c) {
        return p.then(function (out) {
          setValue(num, c.num); setValue(d.getElementById('cc-exp'), c.exp); setValue(d.getElementById('cc-zip'), c.zip);
          place.click();
          var waited = 0;
          return (function look() {
            return pause(500).then(function () {
              waited += 500;
              var says = text(pay);
              if ((!says || CODE.test(says)) && waited < 8000) return look();
              // Something else stopped the order first (an item sold out, or the cart hold ran out).
              if (!says) return out;
              var ok = !CODE.test(says) && c.about.test(says) && NEXT.test(says) && said.indexOf(says) === -1;
              said.push(says);
              return out.concat({ ok: ok, says: 'With ' + c.what + ', the error says “' + says.slice(0, 140) + '”' +
                (ok ? '' : CODE.test(says) ? ', which still has an error code' : !c.about.test(says) ? ', which isn’t about what went wrong' : said.indexOf(says) !== said.length - 1 ? ', the same as another error' : ', which doesn’t say what to do next') });
            });
          })();
        });
      }, Promise.resolve([]));
    },
  };

  window.RB_CHECKS = CHECKS;
})();
