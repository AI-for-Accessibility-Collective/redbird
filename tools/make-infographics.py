#!/usr/bin/env python3
"""Draw one infographic per product: the photo on the left and the three "About this item"
points on the right, written into the image the way real listings do it. Free, no AI.

    python3 tools/make-infographics.py

With issue 1 on, these images have no useful alt text, so their facts are lost to a screen
reader. With issues off, the alt text repeats the three points.
Writes assets/img/gallery/<id>-info.webp. Needs Source Sans 3 installed (fonts.google.com).
"""
import json, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = [pathlib.Path.home() / 'Library/Fonts', pathlib.Path('/Library/Fonts')]
CARDINAL, INK, MUTED = (140, 21, 21), (31, 31, 31), (86, 89, 89)


def font(name, size):
    for d in FONTS:
        if (d / name).exists():
            return ImageFont.truetype(str(d / name), size)
    raise SystemExit(f'install {name} first')


def wrap(draw, text, f, width):
    lines, line = [], ''
    for word in text.split():
        test = (line + ' ' + word).strip()
        if draw.textlength(test, font=f) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    return lines + [line]


def draw_one(p):
    W = 1000
    photo = Image.open(ROOT / f'outputs/originals/{p["id"]}.png').convert('RGB')
    # Fill the canvas with the photo's own background color, then fade the photo's edges into it.
    edge = list(photo.resize((64, 64)).get_flattened_data())
    border = [edge[i] for i in range(64)] + [edge[64 * 63 + i] for i in range(64)]
    bg = tuple(sorted(c[k] for c in border)[len(border) // 2] for k in range(3))
    img = Image.new('RGB', (W, W), bg)
    photo = photo.resize((700, 700))
    mask = Image.new('L', (700, 700), 0)
    ImageDraw.Draw(mask).rounded_rectangle([50, 50, 650, 650], 120, fill=255)
    img.paste(photo, (-60, 250), mask.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(img)

    title = p['name'].split(', ')[0].replace(p['brand'], '').strip() or p['name']
    title = title[0].upper() + title[1:]
    tf, bf, nf, sf = font('SourceSans3-Bold.ttf', 52), font('SourceSans3-SemiBold.ttf', 32), font('SourceSans3-Bold.ttf', 30), font('SourceSans3-SemiBold.ttf', 24)
    d.text((48, 52), p['brand'].upper(), font=sf, fill=CARDINAL)
    y = 86
    for line in wrap(d, title, tf, 900)[:2]:
        d.text((48, y), line, font=tf, fill=INK)
        y += 60
    d.rectangle([48, y + 14, 148, y + 20], fill=CARDINAL)

    rows = [wrap(d, point, bf, 268) for point in p['about'][:3]]
    height = sum(max(54, len(r) * 40) for r in rows) + 44 * (len(rows) - 1) + 80
    top = max(y + 70, 560 - height // 2)
    shadow = Image.new('L', (W, W), 0)
    ImageDraw.Draw(shadow).rounded_rectangle([566, top + 8, 958, top + height + 8], 24, fill=60)
    img.paste((0, 0, 0), (0, 0), shadow.filter(ImageFilter.GaussianBlur(14)))
    d.rounded_rectangle([560, top, 952, top + height], 24, fill='white')
    y = top + 40
    for i, lines in enumerate(rows, 1):
        d.ellipse([588, y, 642, y + 54], fill=CARDINAL)
        d.text((615, y + 27), str(i), font=nf, fill='white', anchor='mm')
        for j, line in enumerate(lines):
            d.text((660, y + 6 + j * 40), line, font=bf, fill=INK)
        y += max(54, len(lines) * 40) + 44
    d.text((W - 48, W - 44), 'redbird', font=sf, fill=MUTED, anchor='rs')

    png = ROOT / f'outputs/originals/gallery/{p["id"]}-info.png'
    png.parent.mkdir(parents=True, exist_ok=True)
    img.save(png)
    out = ROOT / f'assets/img/gallery/{p["id"]}-info.webp'
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['cwebp', '-quiet', '-q', '86', '-resize', '800', '0', str(png), '-o', str(out)], check=True)


catalog = json.loads(subprocess.check_output(['node', '-e', 'global.window={};require("./assets/js/catalog.js");console.log(JSON.stringify(window.RB_CATALOG))'], cwd=ROOT))
for p in catalog:
    draw_one(p)
print(f'drew {len(catalog)} infographics')
