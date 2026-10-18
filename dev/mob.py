import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3', '-m', 'http.server', '8767', '-d', '/home/claude/skat/docs'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 664}, device_scale_factor=3, is_mobile=True, has_touch=True,
                            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1')
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8767/'); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
        pg.tap('#intro-start'); pg.wait_for_timeout(300); pg.tap('#intro-skip'); pg.wait_for_timeout(2500)
        for i, n in enumerate(['Charlotte', 'Jan', 'Gunnar']): pg.fill('#name-%d' % i, n)
        pg.wait_for_timeout(300); pg.tap('#dlg-next'); pg.wait_for_timeout(3500)
        pg.screenshot(path='z_mob_figs.png')
        print(pg.evaluate("""() => { const bn=document.getElementById("intro-banner"), s=bn.querySelector(".say"), top=document.getElementById("intro-top"); console.log(1);
          return {topW: top.clientWidth, bnW: bn.offsetWidth, sayW: s.offsetWidth, bnStyleH: bn.style.height, bnH: bn.offsetHeight, scroll: bn.scrollHeight, say: s.offsetHeight, font: getComputedStyle(s).fontSize + ' ' + getComputedStyle(s).fontFamily} }"""))
        print("refit:", pg.evaluate("Intro.fitBanner(), [document.getElementById(\"intro-banner\").offsetHeight, document.getElementById(\"intro-banner\").scrollHeight]"))
        print("Fehler:", errs); b.close()
finally:
    srv.terminate()
