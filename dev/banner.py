import subprocess, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3', '-m', 'http.server', '8772', '-d', '/home/claude/skat/docs'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
def info(pg):
    return pg.evaluate("""() => { const t = document.getElementById('intro-top'), b = document.getElementById('intro-banner'), st = document.getElementById('stage-wrap');
      return 'top ' + t.offsetHeight + ' | banner ' + b.offsetHeight + ' (min ' + b.style.minHeight + ') | ragt in Bühne: ' + Math.max(0, Math.round(b.getBoundingClientRect().bottom - st.getBoundingClientRect().top)) + 'px'; }""")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for W, H in [(390, 664), (1200, 900)]:
            ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=W < 500, has_touch=W < 500)
            pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('http://localhost:8772/'); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
            pg.click('#intro-start'); pg.wait_for_selector('#intro-banner:not([hidden])', timeout=20000); pg.wait_for_timeout(4500)
            print(W, 'hello:', info(pg)); pg.screenshot(path='b_%d_hello.png' % W)
            for i in range(3): pg.click('#dlg-next'); pg.wait_for_timeout(3200)
            print(W, 'names:', info(pg)); pg.screenshot(path='b_%d_names.png' % W)
            pg.type('#name-0', 'Charlotte', delay=40); pg.wait_for_timeout(2600)
            print(W, 'charlotte:', info(pg)); pg.screenshot(path='b_%d_joke.png' % W)
            for i, n in enumerate(['Charlotte', 'Jan', 'Gunnar']): pg.fill('#name-%d' % i, n)
            pg.click('#dlg-next'); pg.wait_for_timeout(4000)
            print(W, 'figs:', info(pg)); pg.screenshot(path='b_%d_figs.png' % W)
            print('Fehler:', errs); ctx.close()
        b.close()
finally:
    srv.terminate()
