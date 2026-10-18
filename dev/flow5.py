import json
from playwright.sync_api import sync_playwright
state = json.load(open('state_sample.json')) if False else None
with sync_playwright() as p:
    b = p.chromium.launch()
    for (label, hour, w) in [('day',14,560),('dusk',19,800)]:
        pg = b.new_page(viewport={'width':w,'height':900}, device_scale_factor=2)
        pg.add_init_script("""(() => { const R = Date; const fixed = new R(2026,9,17,%d,30,0).getTime(); const off = fixed - R.now();
          class D extends R { constructor(...a){ if(a.length===0){ super(R.now()+off);} else super(...a);} static now(){ return R.now()+off; } }
          window.Date = D; })();""" % hour)
        msgs=[]
        pg.on('pageerror', lambda e: msgs.append('PAGEERR: '+str(e)))
        pg.goto('file:///home/claude/skat/dev/test.html')
        st = {"v":1,"phase":"race","step":4,"introLine":2,"draft":{"names":["Anna","Ben","Carla","Philip"]},
         "players":[{"id":"pa","name":"Anna","char":"karo-koenig"},{"id":"pb","name":"Ben","char":"pik-bube"},{"id":"pc","name":"Carla","char":"herz-dame"},{"id":"pd","name":"Philip","char":"kreuz-dame"}],
         "startDealer":0,"games":[
          {"type":"grand","player":"pa","spitzen":4,"mit":True,"hand":True,"announced":2,"achieved":2,"won":True,"dealerId":"pd"},
          {"type":"grand","player":"pa","spitzen":2,"mit":True,"hand":True,"won":True,"dealerId":"pd"},
          {"type":"farbe","suit":"herz","player":"pc","spitzen":2,"mit":True,"won":True,"dealerId":"pd"},
          {"type":"farbe","suit":"herz","player":"pc","spitzen":2,"mit":True,"won":True,"dealerId":"pd"},
          {"type":"grand","player":"pc","spitzen":4,"mit":True,"hand":True,"won":True,"dealerId":"pd"},
          {"type":"null","nullVar":"null","player":"pd","won":False,"dealerId":"pd"}
         ],"settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True},"created":0,"finishedAt":None}
        pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st))
        pg.reload(); pg.wait_for_timeout(1800)
        pg.screenshot(path='f5_'+label+'.png', full_page=True)
        print(label, msgs)
        pg.close()
    b.close()
