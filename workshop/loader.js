// Runs adapters from workshop/adapters/ on the store, without installing the extension.
//
//   ?try=swatch-names                  run one adapter
//   ?try=swatch-names,calm-urgency     run several
//   ?profile=sam                       hand them the profile in workshop/profiles/sam.json
//   ?try=none                          stop running them
//
// Both are remembered in this browser, like ?issues=. A panel in the bottom-left corner lists
// what's running and lets you switch each adapter off and on to compare.
// The page has to be served over http (GitHub Pages, or `python3 tools/serve.py`), not opened
// as a file, because browsers block loading modules from file:// pages.
(function () {
  var base = document.currentScript.src.replace(/loader\.js.*$/, '');
  var qs = new URLSearchParams(location.search);
  function remember(key, param) {
    var v = qs.get(param);
    try {
      if (v) localStorage.setItem(key, v);
      else v = localStorage.getItem(key);
    } catch (e) { /* private window */ }
    return v && v !== 'none' ? v : '';
  }
  var names = remember('redbird:try', 'try').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var profileName = remember('redbird:profile', 'profile');
  if (!names.length) return;

  var profile = profileName
    ? fetch(base + 'profiles/' + profileName + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    : Promise.resolve(null);

  profile.then(function (prof) {
    var options = { profile: prof, today: window.RB ? RB.today() : new Date(), rewrite: rewrite, fallback: storeFallback };
    return Promise.all(names.map(function (name) {
      return import(base + 'adapters/' + name + '.js').then(function (mod) {
        var adapter = Object.keys(mod).map(function (k) { return mod[k]; }).find(function (v) { return v && typeof v.enable === 'function'; });
        if (!adapter) throw new Error('no export with an enable() function');
        adapter.enable(options);
        return { name: name, adapter: adapter };
      }).catch(function (e) {
        console.warn('[workshop] ' + name + ':', e);
        return { name: name, error: e.message || String(e) };
      });
    })).then(function (loaded) { panel(prof, options, loaded); });
  });

  // ── AI rewrite for adapters that need one (reading-level) ─────────────────
  // Uses a Gemini API key typed into the panel. It stays in this browser's storage.
  function rewrite(text, instructions) {
    var key = '';
    try { key = localStorage.getItem('redbird:gemini-key') || ''; } catch (e) {}
    if (!key) return Promise.resolve(null);
    var body = { contents: [{ parts: [{ text: instructions + '\n\n' + text }] }] };
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).then(function (r) { return r.json(); }).then(function (d) {
      var t = d && d.candidates && d.candidates[0] && d.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('');
      return t ? t.trim() : null;
    }).catch(function () { return null; });
  }
  // Without a key, product descriptions fall back to the store's own plain version,
  // so the reading-level demo still works offline. Other text is left alone.
  function storeFallback(text) {
    var p = (window.RB_CATALOG || []).find(function (x) { return x.jargon === text.trim(); });
    return p ? p.plain : null;
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  function panel(prof, options, loaded) {
    var css = document.createElement('style');
    css.textContent =
      '.ws-panel{position:fixed;left:12px;bottom:12px;z-index:85;background:#1d1d1d;color:#f3f3f3;border-radius:10px;' +
      'font:14px/1.4 "Source Sans 3",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:300px}' +
      '.ws-panel button.ws-head{all:unset;cursor:pointer;display:block;padding:8px 14px;font-weight:700}' +
      '.ws-panel button.ws-head:focus-visible{outline:3px solid #e8c766;border-radius:10px}' +
      '.ws-body{padding:0 14px 12px}.ws-body p{margin:4px 0 8px;color:#cfcfcf}.ws-body label{display:flex;gap:8px;align-items:center;margin:4px 0}' +
      '.ws-body input[type=password]{width:100%;margin-top:4px;padding:5px 8px;border-radius:6px;border:0}.ws-err{color:#ffb4b4}';
    document.head.appendChild(css);
    var box = document.createElement('aside');
    box.className = 'ws-panel';
    box.setAttribute('aria-label', 'Workshop adapters');
    var html = '<button type="button" class="ws-head" aria-expanded="true">Workshop adapters</button><div class="ws-body">' +
      '<p>Profile: ' + (prof ? prof.name : 'none') + '</p>';
    loaded.forEach(function (l, i) {
      html += l.error
        ? '<p class="ws-err">' + l.name + ' did not load: ' + l.error + '</p>'
        : '<label><input type="checkbox" data-i="' + i + '" checked> ' + l.name + '</label>';
    });
    if (names.indexOf('reading-level') !== -1) {
      html += '<label style="display:block">Gemini API key (optional, stays in this browser)<input type="password" id="ws-key" autocomplete="off"></label>';
    }
    box.innerHTML = html + '</div>';
    document.body.appendChild(box);
    var head = box.querySelector('.ws-head'), body = box.querySelector('.ws-body');
    head.onclick = function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
    };
    box.querySelectorAll('input[data-i]').forEach(function (cb) {
      cb.onchange = function () {
        var a = loaded[Number(cb.getAttribute('data-i'))].adapter;
        if (cb.checked) a.enable(options); else a.disable();
      };
    });
    var keyBox = box.querySelector('#ws-key');
    if (keyBox) {
      try { keyBox.value = localStorage.getItem('redbird:gemini-key') || ''; } catch (e) {}
      keyBox.onchange = function () { try { localStorage.setItem('redbird:gemini-key', keyBox.value.trim()); } catch (e) {} };
    }
  }
})();
