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
