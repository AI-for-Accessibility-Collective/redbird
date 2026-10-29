// Runs on the Redbird store. Keeps a copy of the person's profile, saved fixes, their own adapter
// and which adapters are on, so the panel on other sites starts from the same ones. The panel keeps
// these in the browser's storage for each site, and a site can't read another site's storage.
(function () {
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
    last = now;
    chrome.storage.local.set({ carried: { at: Date.now(), keys: keys } });
  }
  // Only a change counts as newer, so opening Redbird doesn't undo what was built on another site.
  chrome.storage.local.get('carried', function (d) {
    last = d.carried ? JSON.stringify(d.carried.keys) : '';
    carry();
    addEventListener('pagehide', carry);
    document.addEventListener('visibilitychange', carry);
    setInterval(carry, 2000);
  });
})();
