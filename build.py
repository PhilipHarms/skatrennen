"""Baut Naunins Skatrennen.

Ausgaben:
  dist/skatrennen.html  einzelne Datei fuer das Claude-Artifact
  dev/test.html         Testseite fuer Playwright
  docs/                 Web-App fuer GitHub Pages (Schriften lokal, Icons, offline)

Aufruf: python3 build.py
"""
import hashlib, json, os, re, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
ASSETS = os.path.join(ROOT, 'assets')
DOCS = os.path.join(ROOT, 'docs')
SCRIPTS = ['sprites.js', 'engine.js', 'logic.js', 'content.js', 'app-core.js', 'app-intro.js',
           'app-race.js', 'app-entry.js', 'app-sheets.js', 'app-podium.js', 'app-main.js']

CREAM = '#efe1bb'
NIGHT = '#15122a'
DOMAIN_FILE = os.path.join(ROOT, 'DOMAIN')  # eine Zeile, z. B. skat.example.de

shell = open(os.path.join(SRC, 'shell.html'), encoding='utf-8').read()
js = ''.join(open(os.path.join(SRC, f), encoding='utf-8').read() + '\n' for f in SCRIPTS)
js = js.replace("if (typeof module !== 'undefined') module.exports = { calcGame, seatInfo, computeStats, tierOf, REIZWERTE };", '')
script = '<script>\n"use strict";\n' + js + '</script>\n'
version = re.search(r"const APP_VERSION = '([^']+)'", js).group(1)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


# 1. Artifact und Testseite
artifact = shell + '\n' + script
write(os.path.join(ROOT, 'dist', 'skatrennen.html'), artifact)
write(os.path.join(ROOT, 'dev', 'test.html'),
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
      '<style>[hidden]{display:none!important}body{margin:0}</style></head><body>' + artifact + '</body></html>')

# 2. Web-App
FONTS = [
    ('Jacquard 24', 400, 'jacquard-24-latin-400-normal.woff2'),
    ('Pixelify Sans', 400, 'pixelify-sans-latin-400-normal.woff2'),
    ('Pixelify Sans', 600, 'pixelify-sans-latin-600-normal.woff2'),
    ('Pixelify Sans', 700, 'pixelify-sans-latin-700-normal.woff2'),
    ('Press Start 2P', 400, 'press-start-2p-latin-400-normal.woff2'),
]
font_css = ''.join(
    "@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(fonts/%s) format('woff2')}\n" % f
    for f in FONTS)

body = shell
body = re.sub(r'<title>.*?</title>\n?', '', body)
body = re.sub(r'<meta name="claude:[^>]*>\n?', '', body)
body = re.sub(r'<link rel="(preconnect|stylesheet)" href="https://fonts\.[^>]*>\n?', '', body)
style_m = re.search(r'<style>.*?</style>\n?', body, re.S)
style = style_m.group(0)
body = body.replace(style, '', 1)
assert 'googleapis' not in body and 'gstatic' not in body

head = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Skatrennen</title>
<meta name="description" content="Wer schreibt, der bleibt. Wer verliert, kriecht. Der Skat-Punktezähler von Prinz Naunin.">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="{NIGHT}">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Skatrennen">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="96x96" href="icons/favicon-96.png">
<link rel="icon" type="image/png" sizes="48x48" href="icons/favicon-48.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="preload" href="fonts/jacquard-24-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/pixelify-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/press-start-2p-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
{font_css}[hidden]{{display:none!important}}
body{{margin:0}}
</style>
{style}</head>
<body>
'''

site_js = f'''<script>
/* Statusleiste passend zum Bildschirm: Creme im Intro, Nacht auf der Rennbahn */
(function () {{
  var m = document.querySelector('meta[name="theme-color"]');
  function sync() {{ m.setAttribute('content', document.body.classList.contains('plain') ? '{CREAM}' : '{NIGHT}'); }}
  sync();
  new MutationObserver(sync).observe(document.body, {{ attributes: true, attributeFilter: ['class'] }});
}})();
/* Offline-Modus */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {{
  window.addEventListener('load', function () {{ navigator.serviceWorker.register('sw.js').catch(function () {{}}); }});
}}
</script>
'''

index = head + body + '\n' + script + site_js + '</body>\n</html>\n'

if os.path.isdir(DOCS):
    shutil.rmtree(DOCS)
os.makedirs(DOCS)
write(os.path.join(DOCS, 'index.html'), index)
shutil.copytree(os.path.join(ASSETS, 'fonts'), os.path.join(DOCS, 'fonts'))
shutil.copytree(os.path.join(ASSETS, 'icons'), os.path.join(DOCS, 'icons'))

manifest = {
    'name': 'Naunins Skatrennen',
    'short_name': 'Skatrennen',
    'description': 'Wer schreibt, der bleibt. Wer verliert, kriecht.',
    'lang': 'de',
    'start_url': './',
    'scope': './',
    'display': 'standalone',
    'orientation': 'portrait',
    'background_color': CREAM,
    'theme_color': NIGHT,
    'icons': [
        {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ],
}
write(os.path.join(DOCS, 'manifest.webmanifest'), json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
write(os.path.join(DOCS, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
write(os.path.join(DOCS, '.nojekyll'), '')
if os.path.exists(DOMAIN_FILE):
    domain = open(DOMAIN_FILE).read().strip()
    if domain:
        write(os.path.join(DOCS, 'CNAME'), domain + '\n')

# Service Worker: Cache-Name aus dem Inhalt, damit jedes Update sicher ankommt
files = []
for dp, _, fns in os.walk(DOCS):
    for fn in fns:
        rel = os.path.relpath(os.path.join(dp, fn), DOCS).replace(os.sep, '/')
        if rel in ('CNAME', '.nojekyll', 'robots.txt') or rel.endswith('.txt'):
            continue
        files.append(rel)
files.sort()
h = hashlib.sha256()
for rel in files:
    h.update(rel.encode()); h.update(open(os.path.join(DOCS, rel), 'rb').read())
cache = 'skatrennen-%s-%s' % (version, h.hexdigest()[:10])
precache = ['./'] + [f for f in files if f != 'index.html']
sw = open(os.path.join(SRC, 'sw.js'), encoding='utf-8').read()
sw = sw.replace('__CACHE__', cache).replace('__FILES__', json.dumps(precache))
write(os.path.join(DOCS, 'sw.js'), sw)

print('Version', version, '| Artifact', len(artifact), 'Zeichen | Web-App', len(index), 'Zeichen |', cache)
