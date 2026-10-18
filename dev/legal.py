import subprocess, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3', '-m', 'http.server', '8766', '-d', '/home/claude/skat/docs'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8766/'); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
        pg.click('#intro-start'); pg.wait_for_timeout(300); pg.click('#intro-skip'); pg.wait_for_timeout(2500)
        for i, n in enumerate(['Jonathan', 'Zauni', 'Gunnar']):
            pg.type('#name-%d' % i, n, delay=50); pg.wait_for_timeout(1300); print(n + ':', pg.inner_text('#intro-banner .sr'))
        pg.fill('#name-2', ''); pg.type('#name-2', 'tine', delay=50); pg.wait_for_timeout(1300); print('tine:', pg.inner_text('#intro-banner .sr'))
        for i in range(3): pg.click('#dlg-next'); pg.wait_for_timeout(2700)
        pg.click('[data-d="0"]'); pg.wait_for_timeout(2500); pg.click('#dlg-next'); pg.wait_for_timeout(3800)
        pg.click('#btn-settings'); pg.wait_for_timeout(300)
        pg.click('[data-a=legal]'); pg.wait_for_timeout(400)
        pg.screenshot(path='z_legal.png')
        pg.evaluate("document.querySelector('.legal').scrollTop = 9999"); pg.wait_for_timeout(200)
        pg.screenshot(path='z_legal2.png')
        print('Fehler:', errs)
        b.close()
finally:
    srv.terminate()
