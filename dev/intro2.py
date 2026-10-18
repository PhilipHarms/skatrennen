import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    # A) Überspringen direkt nach Start
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    pg.click('#intro-start'); pg.wait_for_timeout(700); pg.click('#intro-skip'); pg.wait_for_timeout(400)
    print('A skip ->', pg.evaluate('Intro.step'), '| skip hidden:', pg.is_hidden('#intro-skip'), '| scene', pg.evaluate('Stage.scene'))
    # B) Spiel läuft -> Reload landet direkt auf der Rennbahn
    st={"v":1,"phase":"race","step":"hello","introLine":0,"draft":{"slots":[]},
      "players":[{"id":"pa","name":"Anna","char":"herz-bube"},{"id":"pb","name":"Ben","char":"pik-dame"},{"id":"pc","name":"Carla","char":"karo-koenig"},{"id":"pd","name":"Dora","char":"kreuz-dame"}],
      "startDealer":1,"games":[{"type":"frei","manual":True,"player":"pa","freiPts":48,"dealerId":"pb"},{"type":"frei","manual":True,"player":"pc","freiPts":-60,"dealerId":"pc"}],
      "settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":2},"created":0,"finishedAt":None}
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st)); pg.reload(); pg.wait_for_timeout(500)
    print('B running game ->', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"))
    # C) Siegerehrung von gestern -> Intro mit "Dieselben Leute?"
    st['phase']='podium'; st['finishedAt']=1760700000000
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st)); pg.reload(); pg.wait_for_timeout(500)
    print('C stale podium ->', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"))
    pg.click('#intro-start'); pg.wait_for_timeout(300); pg.click('#intro-skip'); pg.wait_for_timeout(2600)
    print('C step:', pg.evaluate('Intro.step'))
    pg.screenshot(path='j_same.png')
    pg.click('[data-a=yes]'); pg.wait_for_timeout(2200)
    print('C after yes:', pg.evaluate('S.phase'), 'games', pg.evaluate('S.games.length'), 'dealer', pg.evaluate('S.players[curSeat().dealer].name'))
    # D) frisches Podest (unter 6h) -> Podest
    st['finishedAt']=None
    pg.evaluate("s => { const o=JSON.parse(s); o.finishedAt=Date.now(); localStorage.setItem('naunin-skatrennen-v1', JSON.stringify(o)); }", json.dumps(st)); pg.reload(); pg.wait_for_timeout(500)
    print('D fresh podium ->', pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)"))
    # E) Neue Leute -> Intro schnell bei Namen, Figuren schon da
    pg.click('#btn-newround'); pg.wait_for_timeout(200); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(2600)
    print('E new people ->', pg.evaluate('Intro.step'), 'figs on stage', pg.evaluate('Stage.figs.size'))
    pg.click('#dlg-next'); pg.wait_for_timeout(200); pg.click('#dlg-next'); pg.wait_for_timeout(2800)
    pg.locator('#stage-wrap').screenshot(path='j_table4.png')
    print('\n'.join(errs))
    b.close()
