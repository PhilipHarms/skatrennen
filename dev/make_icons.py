"""Erzeugt die App-Icons aus dem Naunin-Portrait des Spiels."""
from playwright.sync_api import sync_playwright
from PIL import Image
import base64, io
OUT = '/home/claude/skat/assets/icons/'
CREAM = (0xef, 0xe1, 0xbb, 255)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto('file:///home/claude/skat/dev/test.html'); pg.wait_for_timeout(300)
    d = pg.evaluate("spriteNaunin('idle').toDataURL()")
    b.close()
src = Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')
W, H = src.size  # 43 x 38

def icon(size, frac, name):
    k = max(1, int(size * frac / W))
    im = Image.new('RGBA', (size, size), CREAM)
    sp = src.resize((W * k, H * k), Image.NEAREST)
    im.alpha_composite(sp, ((size - W * k) // 2, size - H * k))
    im.convert('RGB').save(OUT + name, optimize=True)
    print(name, 'Skalierung', k)

icon(512, 0.94, 'icon-512.png')
icon(192, 0.96, 'icon-192.png')
icon(180, 0.96, 'apple-touch-icon.png')
icon(512, 0.76, 'maskable-512.png')
# Favicon: 48er-Raster, ein Pixel pro Pixel
fav = Image.new('RGBA', (48, 48), CREAM); fav.alpha_composite(src, ((48 - W) // 2, 48 - H)); fav.convert('RGB').save(OUT + 'favicon-48.png')
fav.resize((96, 96), Image.NEAREST).convert('RGB').save(OUT + 'favicon-96.png')
