# Packs extension/ into workshop/redbird-panel-extension.zip, which the site serves for people to
# download. The zip holds one folder, redbird-panel-extension/, which is what Load unpacked asks for.
#
#   python3 tools/zip-extension.py
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'extension')
OUT = os.path.join(ROOT, 'workshop', 'redbird-panel-extension.zip')

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for folder, _, files in sorted(os.walk(SRC)):
        for name in sorted(files):
            if name.startswith('.'):
                continue
            path = os.path.join(folder, name)
            z.write(path, os.path.join('redbird-panel-extension', os.path.relpath(path, SRC)))
print(OUT, os.path.getsize(OUT), 'bytes')
