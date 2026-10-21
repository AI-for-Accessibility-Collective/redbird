// Customer Service: a topic search and the help sections the rest of the store links to.
(function () {
  var h = RB.h;
  var TOPICS = [
    ['shipping', 'Shipping & delivery',
      '<p>Most orders ship free. You can see the delivery date for every option on the product page and at checkout.</p>' +
      '<table class="help-table"><tr><th scope="col">Option</th><th scope="col">Arrives</th><th scope="col">Cost</th></tr>' +
      '<tr><td>Standard delivery</td><td>5–7 business days</td><td>Free</td></tr>' +
      '<tr><td>Redbird Fast items</td><td>2 business days</td><td>Free</td></tr>' +
      '<tr><td>Fast delivery (where offered)</td><td>2 business days</td><td>$5.99</td></tr>' +
      '<tr><td>Items that ship from overseas</td><td>12–20 business days</td><td>Free</td></tr></table>' +
      '<p>Business days are Monday to Friday. We deliver to the 50 US states.</p>'],
    ['returns', 'Returns & replacements',
      '<ul><li>You can return most items within 30 days of delivery.</li><li>Start a return from <a href="order">Your Orders</a>. Shipping it back is free.</li>' +
      '<li>Your refund goes back to the card you paid with, within 10 business days of us getting the item.</li>' +
      '<li>Opened personal care items and gift cards can’t be returned.</li></ul>'],
    ['payment', 'Payment, pricing & tax',
      '<p>We take Visa, Mastercard, American Express and Discover. Sales tax for Palo Alto, CA is 9.375% and is added at checkout, on the items but not on delivery.</p>'],
    ['subscribe', 'Subscribe & Save',
      '<p>Subscribe & Save sends an item again on a schedule, every 6 months, and charges your card each time. You save 5%. ' +
      'You can cancel any time in <a href="account#subscriptions">Your Account</a>. We email you before each delivery.</p>'],
    ['protection', 'Protection plans',
      '<p>A protection plan covers breakdowns from normal use for 2 years after the store’s own warranty ends. It is optional and you can cancel it within 30 days for a full refund.</p>'],
    ['accessibility', 'Accessibility',
      '<p>We want everyone to be able to shop at Redbird, including people who use a screen reader, a keyboard, magnification or voice control. ' +
      'If something on the site is hard to use or doesn’t work with your setup, tell us at the contact details below and we will help you finish your order.</p>'],
    ['terms', 'Conditions of use',
      '<p>By placing an order you agree to pay for it and to our returns policy above. Prices and availability can change until you place your order.</p>'],
    ['privacy', 'Privacy notice',
      '<p>Redbird is a practice store made for a workshop. Nothing here is really sold or shipped, and the name, address and card on the account are made up.</p>' +
      '<ul><li>Your cart, orders, saved list and settings are kept only in this browser. Add <code>?reset=1</code> to any address to empty the cart and orders.</li>' +
      '<li>If you try an adapter that uses AI, the text or photo it works on is sent through our server to Google Gemini to get an answer. Redbird doesn’t save it.</li>' +
      '<li>Please don’t type a real card number or other personal details into the store.</li></ul>'],
    ['contact', 'Contact us',
      '<p>Email: help@redbird.example<br>Phone: 1-800-555-0199, every day from 6 am to 10 pm Pacific time</p>'],
  ];
  var html = '<div class="help">' + h(1, 'Redbird Customer Service') +
    '<label class="sr-only" for="help-q">Search help topics</label><input id="help-q" class="qa-search" placeholder="Search help topics, like “returns”">' +
    '<p id="help-status" class="fine" role="status"></p>' +
    '<nav class="help-nav" aria-label="Help topics"><ul>' + TOPICS.map(function (t) { return '<li><a href="#' + t[0] + '">' + t[1] + '</a></li>'; }).join('') + '</ul></nav>' +
    TOPICS.map(function (t) { return '<section class="panel help-sec" id="' + t[0] + '">' + h(2, t[1]) + t[2] + '</section>'; }).join('') + '</div>';
  var main = RB.mount(html, { title: 'Customer Service' });

  var q = main.querySelector('#help-q');
  q.addEventListener('input', function () {
    var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    main.querySelectorAll('.help-sec').forEach(function (s) {
      var hit = words.every(function (w) { return s.textContent.toLowerCase().indexOf(w) !== -1; });
      s.hidden = !hit; if (hit) shown++;
    });
    main.querySelector('#help-status').textContent = words.length ? shown + (shown === 1 ? ' topic matches' : ' topics match') : '';
  });
})();
