import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844})
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    st={"v":1,"phase":"race","step":"hello","introLine":0,"draft":{"slots":[]},
      "players":[{"id":"pa","name":"Anna","char":"herz-bube"},{"id":"pb","name":"Ben","char":"pik-dame"},{"id":"pc","name":"Carla","char":"karo-koenig"}],
      "startDealer":0,"games":[],"settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":2},"created":0,"finishedAt":None}
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st)); pg.reload(); pg.wait_for_timeout(300)
    bg = lambda: pg.evaluate("getComputedStyle(document.body).backgroundColor")
    print('race bg', bg())
    pg.click('#btn-settings'); pg.click('[data-a=intro]'); pg.wait_for_timeout(200)
    print('replay start bg', bg(), 'plain', pg.evaluate("document.body.classList.contains('plain')"))
    pg.click('#intro-start'); pg.wait_for_timeout(800); pg.click('#intro-skip'); pg.wait_for_timeout(300)
    print('after skip -> race bg', bg(), 'plain', pg.evaluate("document.body.classList.contains('plain')"))
    pg.click('#btn-settings'); pg.click('[data-a=fresh]'); pg.wait_for_timeout(100); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(300)
    print('neue Leute bg', bg(), 'step', pg.evaluate('Intro.step'))
    print(errs)
    b.close()
