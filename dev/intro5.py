from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
    y0 = pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top")
    pg.screenshot(path='k0.png')
    pg.click('#intro-start')
    shots = [5750, 6050, 6350, 6700]
    for t in shots:
        while pg.evaluate('performance.now()-Stage.t0') < t: pg.wait_for_timeout(20)
        pg.locator('#stage-wrap').screenshot(path='k_%d.png'%t)
    pg.wait_for_timeout(900)
    y1 = pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top")
    pg.screenshot(path='k1.png')
    tops=[]
    for i in range(3):
        pg.wait_for_timeout(1200)
        tops.append(pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top"))
        pg.click('#dlg-next'); pg.wait_for_timeout(60)
        tops.append(pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top"))
    pg.wait_for_timeout(1500)
    pg.screenshot(path='k2.png')
    print('stage top: start', y0, 'dialog', y1, 'during lines', tops)
    print('shards', pg.evaluate('Stage.shards.length'), 'thrown', pg.evaluate('Stage.thrown'))
    print(errs)
    b.close()
