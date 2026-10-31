// Runs on the Redbird store and wherever the panel is on. Keeps a copy of the person's profile, saved
// fixes, their own adapter and which adapters are on, so the panel on every site starts from the same
// ones. The panel keeps these in the browser's storage for each site, and a site can't read another
// site's storage.
(function () {
  if (window.rbCarryingKeys) return;
  window.rbCarryingKeys = true;
  var KEYS = ['redbird:me', 'redbird:profile', 'redbird:person', 'redbird:fixes', 'redbird:try',
    'redbird:my-adapter', 'redbird:settings', 'redbird:learned'];
  var last = null;
  function read() {
    var keys = {};
    KEYS.forEach(function (k) { keys[k] = localStorage.getItem(k); });
    return keys;
  }
  function carry() {
    var keys = read(), now = JSON.stringify(keys);
    if (last === null || now === last) return;
    var was = JSON.parse(last);
    last = now;
    // Each thing keeps its own time, so changing one doesn't replace the others on another site.
    chrome.storage.local.get('carried', function (d) {
      var c = d.carried || { keys: {}, times: {} }, at = Date.now();
      KEYS.forEach(function (k) { if (keys[k] != was[k]) { c.keys[k] = keys[k]; c.times[k] = at; } });
      c.at = at;
      chrome.storage.local.set({ carried: c });
      localStorage.setItem('redbird:carried-at', String(at));
    });
  }
  // Only a change counts as newer, so opening a page doesn't undo what was built somewhere else.
  chrome.storage.local.get('carried', function (d) {
    last = JSON.stringify((d.carried && d.carried.keys) || {});
    carry();
    addEventListener('pagehide', carry);
    document.addEventListener('visibilitychange', carry);
    setInterval(carry, 2000);
  });
})();
