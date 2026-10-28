// Downloads the starter folder: a folder for one adapter that a coding agent like Claude Code or
// Codex can keep changing, with a server that runs the store with it and tests (starter/ in the
// repository). The zip is made here in the browser, so the files are always the current ones.
//
//   RB_STARTER.download('star-ratings')                                      a blank folder
//   RB_STARTER.download('star-ratings', { 'adapter.js': code, 'fix.json': json })   with a fix in it
//
// Used by the workshop panel ("Keep building in code" under a fix) and the Keep building in code guide.
(function () {
  var here = document.currentScript.src.replace(/[^/]*$/, ''); // .../workshop/
  var STARTER = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'package.json', 'adapter.js', 'fix.json', 'feedback.md', 'gitignore',
    'tools/dev.mjs', 'tools/test.mjs', 'checks/README.md'];
  // The workshop's example adapters, for the coding agent to learn from.
  var EXAMPLES = ['swatch-names', 'calm-urgency', 'reading-level', 'real-arrival-dates', 'pause-moving-things'];

  function get(url, path) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(path + ' is missing');
      return r.text();
    }).then(function (text) { return { path: path, text: text }; });
  }
  function download(name, files) {
    files = files || {};
    var from = new URL('../starter/', here).href;
    return Promise.all(STARTER.map(function (p) { return get(from + p, p); })
      .concat(EXAMPLES.map(function (n) { return get(here + 'adapters/' + n + '.js', 'examples/' + n + '.js'); }))
      .concat(get(new URL('../ISSUES.md', here).href, 'issues.md')))
      .then(function (list) {
        list.forEach(function (x) {
          if (files[x.path] != null) x.text = files[x.path];
          if (x.path === 'gitignore') x.path = '.gitignore'; // the store's host won't serve a file whose name starts with a dot
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(zip(list.map(function (x) { return { path: name + '/' + x.path, text: x.text }; })));
        a.download = name + '.zip';
        a.hidden = true;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
        return 'Downloaded ' + name + '.zip. Unzip it, open the folder in Claude Code or Codex, and say: “Read AGENTS.md and start the store.”';
      });
  }

  // A zip file with no compression: a header before each file, and a list of the files at the end.
  var CRC = null;
  function crc32(bytes) {
    if (!CRC) {
      CRC = [];
      for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; }
    }
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = CRC[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], list = [], offset = 0, d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.path), data = enc.encode(f.text), crc = crc32(data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); // version, UTF-8 names
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
      parts.push(h, name, data);
      var e = new DataView(new ArrayBuffer(46));
      e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x0800, true);
      e.setUint16(12, time, true); e.setUint16(14, date, true); e.setUint32(16, crc, true);
      e.setUint32(20, data.length, true); e.setUint32(24, data.length, true); e.setUint16(28, name.length, true); e.setUint32(42, offset, true);
      list.push(e, name);
      offset += 30 + name.length + data.length;
    });
    var size = list.reduce(function (a, x) { return a + x.byteLength; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, size, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(list, [end]), { type: 'application/zip' });
  }

  window.RB_STARTER = { download: download };
})();
