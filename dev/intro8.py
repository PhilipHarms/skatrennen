from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w,h,tag) in [(777,930,'desk'),(390,844,'phone')]:
        pg = b.new_page(viewport={'width':w,'height':h}, device_scale_factor=2)
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.goto('file:///home/claude/skat/dev/test.html')
        pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
        pos=[pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top")]
        pg.screenshot(path='n_%s_start.png'%tag)
        pg.click('#intro-start'); pg.wait_for_timeout(300); pg.click('#intro-skip'); pg.wait_for_timeout(200)
        # zurück zu hello: replay erzwingt hello, hier per openDialog
        pg.evaluate("Intro.openDialog('hello')"); pg.wait_for_timeout(3500)
        pos.append(pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top"))
        pg.screenshot(path='n_%s_hello.png'%tag)
        for i in range(3): pg.click('#dlg-next'); pg.wait_for_timeout(2500); pos.append(pg.evaluate("document.getElementById('stage-wrap').getBoundingClientRect().top"))
        bh = pg.evaluate("document.getElementById('intro-banner').offsetHeight")
        print(tag, 'stage tops', pos, 'banner h', bh, errs)
        pg.close()
    b.close()
