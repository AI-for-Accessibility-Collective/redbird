#!/usr/bin/env python3
"""Write assets/js/images.js: every extra photo in assets/img/gallery/, per product, with the
alt text the store uses when planted issues are off. Run it after adding photos to
assets/img/gallery/ or running make-infographics.py.

    python3 tools/make-image-list.py
"""
import json, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
REVIEWS = json.loads((ROOT / 'tools/review-photos.json').read_text())

catalog = json.loads(subprocess.check_output(['node', '-e', 'global.window={};require("./assets/js/catalog.js");console.log(JSON.stringify(window.RB_CATALOG))'], cwd=ROOT))
shots = {}
for line in (ROOT / 'tools/gallery-shots.tsv').read_text().splitlines():
    if line.strip():
        pid, *rest = line.split('\t')
        shots[pid] = rest

out = {}
for p in catalog:
    pid, name = p['id'], p['name']
    have = lambda kind: (ROOT / f'assets/img/gallery/{pid}-{kind}.webp').exists()
    src = lambda kind: f'assets/img/gallery/{pid}-{kind}.webp'
    entry = {'gallery': [], 'colors': {}, 'reviews': []}
    angle, use, detail = shots.get(pid, ['', '', ''])
    alts = {
        'angle': f'{name}, ' + ('seen ' if angle.startswith('from') else '') + angle,
        'use': f'{name} {use}',
        'detail': f'Close-up of {detail}',
        'info': f'Key features of the {name}: ' + ' '.join(f'{i}. {a}.' for i, a in enumerate(p['about'][:3], 1)),
    }
    for kind in ('angle', 'use', 'detail', 'info'):
        if have(kind):
            entry['gallery'].append({'src': src(kind), 'alt': alts[kind]})
    for sw in (p.get('swatches') or [])[1:]:
        kind = 'color-' + sw['name'].lower().replace(' / ', '-').replace(' ', '-')
        if have(kind):
            entry['colors'][sw['name']] = src(kind)
    for i, scene in enumerate(REVIEWS.get(pid, []), 1):
        if have(f'review{i}'):
            entry['reviews'].append({'src': src(f'review{i}'), 'alt': f'Customer photo of the {name} {scene}'})
    out[pid] = entry

js = ('// Made by tools/make-image-list.py from the files in assets/img/gallery/. Do not edit by hand.\n'
      '// gallery: extra photos in display order. colors: a photo for each color after the first.\n'
      '// reviews: customer photos. Each alt is what the store uses with planted issues off.\n'
      'window.RB_IMAGES = ' + json.dumps(out, indent=1) + ';\n')
(ROOT / 'assets/js/images.js').write_text(js)
n = sum(len(e['gallery']) + len(e['colors']) + len(e['reviews']) for e in out.values())
print(f'listed {n} extra photos for {len(out)} products')
