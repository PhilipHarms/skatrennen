from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
    pg.screenshot(path='m0_start.png')
    y0 = pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top")
    pg.click('#intro-start')
    marks = [2400, 4700, 6000, 7600, 9700, 10450, 10750, 11100]
    for t in marks:
        while pg.evaluate('performance.now()-Stage.t0') < t: pg.wait_for_timeout(15)
        pg.screenshot(path='m_%d.png'%t, clip={'x':0,'y':0,'width':390,'height':420})
    pg.wait_for_timeout(1200)
    y1 = pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top")
    pg.screenshot(path='m9_dialog.png')
    print('stage top', y0, y1, '| plain class', pg.evaluate("document.body.classList.contains('plain')"), '| step', pg.evaluate('Intro.step'))
    print(errs)
    b.close()
