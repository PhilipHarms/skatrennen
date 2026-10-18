"""Web-App: Schriften, Manifest, Offline-Modus."""
import subprocess, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', '/home/claude/skat/docs'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        pg = ctx.new_page(); errs = []; fails = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('requestfailed', lambda r: fails.append(r.url))
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1500)
        print('Schriften:', pg.evaluate("Promise.all(['16px \"Jacquard 24\"','16px \"Pixelify Sans\"','bold 16px \"Pixelify Sans\"','16px \"Press Start 2P\"'].map(f=>document.fonts.load(f).then(r=>f+': '+(r.length?'ok':'FEHLT'))))"))
        print('Manifest:', pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(m=>m.name+' / '+m.icons.length+' Icons')"))
        print('Theme Intro:', pg.evaluate("document.querySelector('meta[name=theme-color]').content"))
        pg.wait_for_function("navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready.then(()=>true)", timeout=8000)
        pg.evaluate("navigator.serviceWorker.ready"); pg.reload(); pg.wait_for_timeout(1000)
        print('SW aktiv:', pg.evaluate("!!navigator.serviceWorker.controller"), '| Caches:', pg.evaluate("caches.keys()"))
        pg.click('#intro-start'); pg.wait_for_timeout(300); pg.click('#intro-skip'); pg.wait_for_timeout(2500)
        for i, n in enumerate(['Anna', 'Ben', 'Carla']): pg.fill('#name-%d' % i, n)
        for i in range(3): pg.click('#dlg-next'); pg.wait_for_timeout(2700)
        pg.click('[data-d="0"]'); pg.wait_for_timeout(2500); pg.click('#dlg-next'); pg.wait_for_timeout(3600)
        print('Theme Rennbahn:', pg.evaluate("document.querySelector('meta[name=theme-color]').content"))
        pg.screenshot(path='/home/claude/skat/dev/z_pwa_race.png')
        srv.terminate(); srv.wait(); ctx.set_offline(True)
        pg.reload(); pg.wait_for_timeout(1500)
        print('Offline neu geladen:', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"), '| Spieler:', pg.evaluate("S.players.map(p=>p.name).join(',')"), '| Schrift offline:', pg.evaluate("document.fonts.check('16px \"Press Start 2P\"')"))
        pg.click('#btn-enter'); pg.wait_for_timeout(200); pg.click('#entry-body [data-k=player] >> nth=0'); pg.fill('#fp', '48'); pg.click('#entry-ok'); pg.wait_for_timeout(800)
        print('Offline eingetragen:', pg.evaluate('S.games.length'))
        pg.screenshot(path='/home/claude/skat/dev/z_pwa_offline.png')
        print('Fehler:', errs, '| Fehlgeschlagen (ohne Absicht):', [u for u in fails if 'localhost' in u][:5])
        b.close()
finally:
    srv.poll() is None and srv.terminate()
