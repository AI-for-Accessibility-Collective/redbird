// Page not found: shown for unknown addresses (404.html) and unknown product ids.
(function () {
  var h = RB.h;
  window.RB_NOT_FOUND = function () {
    RB.mount('<div class="nf panel">' + h(1, 'Sorry, we couldn’t find that page') +
      '<p>Try searching, or go to <a href="./">Redbird’s home page</a>.</p>' +
      '<form class="nf-search" action="search" role="search"><label class="sr-only" for="nf-q">Search Redbird</label>' +
      '<input id="nf-q" name="q" placeholder="Search Redbird"><button type="submit" class="btn btn-cart">Search</button></form></div>', { title: 'Page not found' });
  };
  if (document.body.dataset.page === 'notfound') window.RB_NOT_FOUND();
})();
