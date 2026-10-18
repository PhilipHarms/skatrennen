import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=3)
    msgs=[]
    pg.on('pageerror', lambda e: msgs.append('PAGEERR: '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.wait_for_timeout(1500)
    print(pg.evaluate("JSON.stringify({phase:S.phase, W:Podium.W, H:Podium.H, running:Podium.running, cw: Podium.cv.width, ch: Podium.cv.height, style: Podium.cv.style.cssText, pw: Podium.cv.parentElement.clientWidth})"))
    print(pg.evaluate("(()=>{try{Podium.draw(performance.now()); return 'ok'}catch(e){return e.stack}})()"))
    print(msgs)
    b.close()
