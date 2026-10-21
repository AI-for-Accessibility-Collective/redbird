// Which planted accessibility issues are turned on. ISSUES.md lists all of them by number.
//
//   ?issues=on      every planted issue (the default)
//   ?issues=off     none, so the store is usable with a screen reader or keyboard
//   ?issues=6,24    only issues 6 and 24, handy when testing one adapter
//
// The choice is remembered in this browser until you change it again.
(function () {
  var TOTAL = 34;
  var KEY = 'redbird:issues';
  var param = new URLSearchParams(location.search).get('issues');
  var value = param;
  try {
    if (param) localStorage.setItem(KEY, param);
    else value = localStorage.getItem(KEY);
  } catch (e) { /* private window: fall back to the default */ }
  value = (value || 'on').toLowerCase();

  var on = [];
  if (value === 'on') for (var i = 1; i <= TOTAL; i++) on.push(i);
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
