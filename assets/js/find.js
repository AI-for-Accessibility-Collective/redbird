// Search matching, shared by the search page and the suggestions under the search box.
// Forgiving like a real store: "USB C" = "usb-c", plurals, everyday words ("cord" finds cables)
// and one-letter typos ("chargr" finds chargers).
(function () {
  var SYNONYMS = {
    cord: 'cable', wire: 'cable', adapter: 'charger', plug: 'charger', block: 'charger', brick: 'charger',
    earphone: 'earbud', headset: 'headphone', sweatshirt: 'hoodie', hoody: 'hoodie', sneaker: 'shoe', runner: 'shoe',
    raincoat: 'jacket', coat: 'jacket', hat: 'beanie', backpack: 'daypack', bag: 'daypack', cup: 'mug', flask: 'bottle',
    light: 'lamp', throw: 'blanket', pan: 'skillet', teapot: 'kettle', tee: 'shirt', battery: 'bank', portable: 'bank',
    novel: 'book',
  };
  var POPULAR = ['usb-c charger', 'phone charger', 'usb-c cable', 'wireless earbuds', 'headphones', 'phone case', 'power bank',
    'electric kettle', 'coffee mugs', 'french press', 'cast iron skillet', 'bath towels', 'throw blanket', 'desk lamp', 'hoodie',
    't-shirts', 'running shoes', 'rain jacket', 'beanie', 'water bottle', 'daypack', 'yoga mat', 'camping lantern', 'books',
    'coffee beans', 'granola', 'olive oil', 'sparkling water', 'building blocks', 'puzzle'];

  function norm(t) {
    return String(t || '').toLowerCase().replace(/\busb[\s-]?c\b|\btype[\s-]?c\b/g, 'usbc').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function stem(w) {
    if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 3 && /[^s]s$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function words(t) { return norm(t).split(' ').filter(Boolean).map(stem); }
  // At most one letter added, dropped or changed, or two letters next to each other swapped.
  function oneOff(a, b) {
    if (Math.abs(a.length - b.length) > 1 || a === b) return a === b;
    if (a.length === b.length) {
      var diff = [];
      for (var k = 0; k < a.length; k++) if (a[k] !== b[k]) diff.push(k);
      if (diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]) return true;
    }
    var i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }

  var cache = {};
  function fieldsOf(p) {
    if (!cache[p.id]) {
      cache[p.id] = {
        name: words(p.name + ' ' + p.brand),
        title: words(p.title),
        other: words(p.cat + ' ' + (p.about || []).join(' ') + ' ' + (p.specs || []).map(function (s) { return s[2]; }).join(' ')),
      };
    }
    return cache[p.id];
  }
  // How well one query word matches a product: 0 means not at all.
  function wordScore(w, f, exact) {
    var alts = [w];
    if (SYNONYMS[w]) alts.push(SYNONYMS[w]);
    var best = 0;
    alts.forEach(function (a) {
      [['name', 3], ['title', 2], ['other', 1]].forEach(function (pair) {
        f[pair[0]].forEach(function (hw) {
          if (hw === a) best = Math.max(best, pair[1]);
          else if (a.length >= 3 && hw.indexOf(a) === 0) best = Math.max(best, pair[1] - 0.5);
          else if (a.length >= 4 && hw.length === a.length + 1 && hw.indexOf(a) === 1) best = Math.max(best, pair[1] - 1);
        });
      });
    });
    if (best || exact || w.length < 5) return { score: best, typo: null };
    // Only when nothing matched: the typed word with one letter off, in the name or title.
    var typo = null;
    f.name.concat(f.title).forEach(function (hw) { if (!typo && oneOff(w, hw)) typo = hw; });
    return { score: typo ? 1 : 0, typo: typo };
  }

  // opts.exact turns off typo fixing (the "Search instead for" link).
  function rank(query, products, opts) {
    var qs = words(query);
    if (!qs.length) return { results: products.map(function (p) { return { p: p, score: 0 }; }), corrected: null };
    var fixes = {};
    var results = products.map(function (p) {
      var f = fieldsOf(p), total = 0;
      for (var i = 0; i < qs.length; i++) {
        var r = wordScore(qs[i], f, opts && opts.exact);
        if (!r.score) return null;
        if (r.typo) fixes[qs[i]] = r.typo;
        total += r.score;
      }
      return { p: p, score: total };
    }).filter(Boolean);
    results.sort(function (a, b) { return b.score - a.score || b.p.reviews - a.p.reviews; });
    var corrected = Object.keys(fixes).length ? qs.map(function (w) { return fixes[w] || w; }).join(' ') : null;
    return { results: results, corrected: corrected };
  }

  // Up to 8 suggestions for the search box: popular searches first, then product names.
  function suggest(query) {
    var q = norm(query);
    if (!q) return [];
    var starts = function (text) {
      var n = norm(text);
      return n.indexOf(q) === 0 || n.indexOf(' ' + q) !== -1;
    };
    var out = POPULAR.filter(starts);
    (window.RB_CATALOG || []).forEach(function (p) {
      var name = p.name.split(',')[0].toLowerCase();
      if (starts(name) && out.indexOf(name) === -1) out.push(name);
    });
    return out.slice(0, 8);
  }

  window.RB_FIND = { norm: norm, rank: rank, suggest: suggest };
})();
