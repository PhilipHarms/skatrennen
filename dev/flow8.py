import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    # 1) alter Stand mit manual:false soll umgestellt werden
    old={"v":1,"phase":"race","step":4,"introLine":2,"draft":{"names":["A","B","C"]},
      "players":[{"id":"pa","name":"Anna","char":"herz-bube"},{"id":"pb","name":"Ben","char":"pik-dame"},{"id":"pc","name":"Carla","char":"karo-koenig"}],
      "startDealer":0,"games":[],"settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":False},"created":0,"finishedAt":None}
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(old))
    pg.reload(); pg.wait_for_timeout(500)
    print('migrated:', pg.evaluate('S.settings.manual'), pg.evaluate('S.settings.rev'), '|', pg.inner_text('#btn-enter'))
    pg.click('#btn-enter'); pg.wait_for_timeout(200)
    pg.screenshot(path='f8_sheet.png')
    pg.click('#entry-body [data-k=mode]'); pg.wait_for_timeout(100); pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    print('after switch to calc:', pg.evaluate('S.settings.manual'), '|', pg.inner_text('#btn-enter'))
    # 2) Nach Reload bleibt calc (keine erneute Migration)
    pg.reload(); pg.wait_for_timeout(500)
    print('after reload:', pg.evaluate('S.settings.manual'))
    pg.click('#btn-settings'); pg.wait_for_timeout(200)
    print('settings chip:', pg.inner_text('[data-t=calc]'))
    pg.click('[data-t=calc]'); pg.wait_for_timeout(100)
    print('after toggle:', pg.evaluate('S.settings.manual'), pg.inner_text('[data-t=calc]'))
    pg.screenshot(path='f8_settings.png')
    # 3) frischer Start
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    print('fresh default manual:', pg.evaluate('S.settings.manual'))
    print(errs)
    b.close()
