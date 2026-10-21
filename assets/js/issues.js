// Which planted accessibility issues are turned on. ISSUES.md lists all of them by number.
//
//   ?issues=on      every planted issue (the default)
//   ?issues=off     none, so the store is usable with a screen reader or keyboard
//   ?issues=6,24    only issues 6 and 24, handy when testing one adapter
//   ?issues=agent   everything except the issues that stop an AI agent (see below)
//
// The choice is remembered in this browser until you change it again.
(function () {
  var TOTAL = 36;
  var KEY = 'redbird:issues';
  var param = new URLSearchParams(location.search).get('issues');
  var value = param;
  try {
    // A page shown inside another page (the workshop's side-by-side view) doesn't save its settings,
    // so the four views don't overwrite each other or the store you open next.
    if (param) { if (window.top === window) localStorage.setItem(KEY, param); }
    else value = localStorage.getItem(KEY);
  } catch (e) { /* private window: fall back to the default */ }
  value = (value || 'on').toLowerCase();

  // ?issues=agent is for running an AI agent and the verification layer on the store: every issue
  // except the ones that keep changing the page (19 checkout timer, 24 countdowns, 33 video,
  // 34 auto-scrolling rows, 35 ticker), which stop the checker from reading a settled page, and
  // the two "Add to cart" problems (3, 21) that an agent can't click past.
  var NOT_FOR_AGENTS = [3, 19, 21, 24, 33, 34, 35];
  var on = [];
  if (value === 'on') for (var i = 1; i <= TOTAL; i++) on.push(i);
  else if (value === 'agent') for (var j = 1; j <= TOTAL; j++) { if (NOT_FOR_AGENTS.indexOf(j) === -1) on.push(j); }
  else if (value !== 'off') on = value.split(',').map(Number).filter(function (n) { return n >= 1 && n <= TOTAL; });

  document.documentElement.setAttribute('data-planted', on.join(' '));
  window.RB_ISSUES = {
    total: TOTAL,
    value: value,
    list: on,
    has: function (n) { return on.indexOf(n) !== -1; },
    any: on.length > 0,
  };
})();
