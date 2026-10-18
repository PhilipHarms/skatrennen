import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844})
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    st={"v":1,"phase":"race","step":"hello","introLine":0,"draft":{"slots":[]},
      "players":[{"id":"pa","name":"Anna","char":"herz-bube"},{"id":"pb","name":"Ben","char":"pik-dame"},{"id":"pc","name":"Carla","char":"karo-koenig"}],
      "startDealer":0,"games":[{"type":"frei","manual":True,"player":"pa","freiPts":48,"dealerId":"pa"}],
      "settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":2},"created":0,"finishedAt":None}
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st)); pg.reload(); pg.wait_for_timeout(400)
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-a=intro]'); pg.wait_for_timeout(300)
    print('screen:', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"), '| start visible:', pg.is_visible('#intro-start'))
    pg.click('#intro-start'); pg.wait_for_timeout(6800)
    for i in range(2): pg.click('#dlg-next'); pg.wait_for_timeout(150)
    print('last button:', pg.inner_text('#dlg-next'))
    pg.click('#dlg-next'); pg.wait_for_timeout(300)
    print('back to:', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"), '| games kept:', pg.evaluate('S.games.length'), '| phase', pg.evaluate('S.phase'))
    # Überspringen im Wiederholungsmodus
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-a=intro]'); pg.wait_for_timeout(200)
    pg.click('#intro-start'); pg.wait_for_timeout(500); pg.click('#intro-skip'); pg.wait_for_timeout(300)
    print('skip ->', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"), '| games kept:', pg.evaluate('S.games.length'))
    print(errs)
    b.close()
