// About Redbird, careers and sustainability.
(function () {
  var h = RB.h;
  var html = '<div class="help">' + h(1, 'About Redbird') +
    '<section class="panel help-sec" id="about">' + h(2, 'Who we are') +
    '<p>Redbird is an online store for everyday things: chargers and headphones, kitchen basics, clothes, outdoor gear, books, groceries and toys. ' +
    'We started in Palo Alto with a small warehouse, and the goal was to get most things people need to them in two days.</p>' +
    '<p>Redbird Basics is our own brand. It covers the things people buy again and again, like chargers, cables, coffee and towels, at a fair price.</p></section>' +
    '<section class="panel help-sec" id="careers">' + h(2, 'Careers') +
    '<p>We are hiring in Palo Alto and at our warehouse in Fremont.</p>' +
    '<ul class="jobs"><li><b>Warehouse associate</b>, Fremont, full time</li><li><b>Customer service specialist</b>, remote (US), full time</li>' +
    '<li><b>Front-end engineer, accessibility</b>, Palo Alto, full time</li><li><b>Product photographer</b>, Palo Alto, part time</li></ul>' +
    '<p>To apply, email careers@redbird.example with the job title in the subject line.</p></section>' +
    '<section class="panel help-sec" id="sustainability">' + h(2, 'Sustainability') +
    '<ul><li>Our boxes are made from recycled cardboard and we stopped using plastic air pillows in 2025.</li>' +
    '<li>Orders to the same address on the same day ship together in one box.</li>' +
    '<li>Returned items that still work are resold as “Like new” or donated.</li></ul></section></div>';
  RB.mount(html, { title: 'About Redbird' });
})();
