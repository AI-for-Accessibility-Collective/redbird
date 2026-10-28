// Copy buttons on the code blocks of the workshop pages.
(function () {
  var status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  document.body.appendChild(status);
  document.querySelectorAll('.code .copy').forEach(function (btn) {
    var label = btn.querySelector('span');
    btn.onclick = function () {
      var text = btn.closest('.code').querySelector('pre code').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
        label.textContent = 'Copied';
        status.textContent = 'Copied to the clipboard';
      }, function () {
        label.textContent = 'Select the code and copy it';
      });
      setTimeout(function () { label.textContent = 'Copy'; status.textContent = ''; }, 2000);
    };
  });
})();
// Side-by-side views: scale each 1280 px wide page down to its box.
(function () {
  function fit() {
    document.querySelectorAll('.frame').forEach(function (f) { f.style.setProperty('--k', f.clientWidth / 1280); });
  }
  fit();
  window.addEventListener('resize', fit);
})();
// "Download a blank folder" on the Keep building in code page (workshop/starter.js makes the zip).
(function () {
  var btn = document.querySelector('[data-starter]');
  if (!btn) return;
  var out = document.getElementById('starter-msg');
  function go() {
    window.RB_STARTER.download('my-adapter').then(function (text) { out.textContent = text; }, function (e) { out.textContent = 'Couldn’t make the folder: ' + e.message; });
  }
  btn.onclick = function () {
    out.textContent = 'Making the folder…';
    if (window.RB_STARTER) return go();
    var s = document.createElement('script');
    s.src = 'starter.js';
    s.onload = go;
    s.onerror = function () { out.textContent = 'Couldn’t load the folder maker. Reload the page and try again.'; };
    document.head.appendChild(s);
  };
})();
