import json
from playwright.sync_api import sync_playwright
html = open('/home/claude/skat/dist/skatrennen.html').read()
doc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>' + html + '</body></html>'
open('/home/claude/skat/dev/test.html','w').write(doc)
state = {"v":1,"phase":"race","step":4,"introLine":2,"draft":{"names":["Anna","Ben","Carla","Philip"]},
 "players":[{"id":"pa","name":"Anna","char":"karo-koenig"},{"id":"pb","name":"Ben","char":"pik-bube"},{"id":"pc","name":"Carla","char":"herz-dame"},{"id":"pd","name":"Philip","char":"kreuz-koenig"}],
 "startDealer":0,"games":[],"settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True},"created":0,"finishedAt":None}
def G(**k): return k
gs=[]
for i in range(3): gs.append(G(type='grand',player='pa',spitzen=2,mit=True,hand=False,announced=0,achieved=0,won=True,kontra=0,bock=False,dealerId='pd'))
gs.append(G(type='farbe',suit='herz',player='pb',spitzen=1,mit=True,won=False,dealerId='pa'))
gs.append(G(type='farbe',suit='pik',player='pb',spitzen=2,mit=False,won=False,dealerId='pa'))
gs.append(G(type='null',nullVar='ouvert',player='pb',won=False,dealerId='pa'))
gs.append(G(type='farbe',suit='kreuz',player='pc',spitzen=3,mit=True,hand=True,won=True,dealerId='pb'))
gs.append(G(type='grand',player='pc',spitzen=4,mit=True,hand=True,achieved=1,won=True,dealerId='pb'))
gs.append(G(type='grand',player='pc',spitzen=3,mit=True,hand=True,achieved=1,won=True,dealerId='pb'))
gs.append(G(type='ramsch',player='pd',ramschPts=40,dealerId='pc'))
state['games']=gs
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=3)
    msgs=[]
    pg.on('console', lambda m: msgs.append(m.type+': '+m.text))
    pg.on('pageerror', lambda e: msgs.append('PAGEERR: '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("s => { localStorage.setItem('naunin-skatrennen-v1', s); }", json.dumps(state))
    pg.reload(); pg.wait_for_timeout(2500)
    pg.screenshot(path='r1.png', full_page=True)
    pg.locator('#race-wrap').screenshot(path='r1_track.png')
    # enter game for Philip: Herz ohne 1 lost -> deeper minus
    pg.click('#btn-enter'); pg.wait_for_timeout(300)
    pg.click('#entry-body [data-k=showAll]'); pg.wait_for_timeout(100)
    pg.click('#entry-body [data-v="pd"]')
    pg.click('#entry-body [data-v="farbe:herz"]'); pg.click('#entry-body [data-v="m1"]'); pg.click('#entry-body [data-k=won][data-v=false]')
    pg.click('#entry-ok'); pg.wait_for_timeout(800)
    pg.locator('#race-wrap').screenshot(path='r2_moving.png')
    pg.wait_for_timeout(2500)
    pg.locator('#race-wrap').screenshot(path='r3_track.png')
    pg.click('#btn-list'); pg.wait_for_timeout(300)
    pg.screenshot(path='r4_list.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.click('#btn-settings'); pg.wait_for_timeout(300)
    pg.screenshot(path='r5_settings.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.click('#btn-eval'); pg.wait_for_timeout(300)
    pg.screenshot(path='r6_eval.png')
    pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(2500)
    pg.screenshot(path='r7_podium.png', full_page=True)
    print('\n'.join(m for m in msgs if 'ERR_TUNNEL' not in m))
    b.close()
