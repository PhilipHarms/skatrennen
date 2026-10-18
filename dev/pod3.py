import json
from playwright.sync_api import sync_playwright
def state(scores):
    names=['Anna','Ben','Carla','Dora','Emil','Fritz'][:len(scores)]
    chars=['herz-bube','pik-dame','karo-koenig','kreuz-dame','pik-bube','herz-koenig']
    players=[{"id":"p%d"%i,"name":n,"char":chars[i]} for i,n in enumerate(names)]
    games=[{"type":"frei","manual":True,"player":"p%d"%i,"freiPts":sc,"mVal":abs(sc),"mRes":"won" if sc>0 else "minus","dealerId":"p0"} for i,sc in enumerate(scores) if sc]
    games.append({"type":"frei","manual":True,"player":"p0","freiPts":72,"mVal":72,"mRes":"won","tags":["grand","hand"],"dealerId":"p1"})
    games.append({"type":"frei","manual":True,"player":"p0","freiPts":-72,"mVal":72,"mRes":"minus","dealerId":"p1"})
    return {"v":1,"phase":"podium","step":"hello","introLine":0,"draft":{"slots":[]},"players":players,"startDealer":0,"games":games,
            "settings":{"pferd":200,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":3},"created":0,"finishedAt":None}
with sync_playwright() as p:
    b = p.chromium.launch()
    for tag, scores in [('tie2', [100,0,0]), ('four', [240,120,120,-60]), ('tie1', [150,150,40,10,-30])]:
        pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.goto('file:///home/claude/skat/dev/test.html')
        pg.evaluate("s => { const o=JSON.parse(s); o.finishedAt=Date.now(); localStorage.setItem('naunin-skatrennen-v1', JSON.stringify(o)); }", json.dumps(state(scores)))
        pg.reload(); pg.wait_for_timeout(3200)
        pg.locator('.podium-wrap').screenshot(path='q_%s_pod.png'%tag)
        if tag=='four': pg.screenshot(path='q_four_full.png', full_page=True)
        print(tag, 'say:', pg.inner_text('#scr-podium .sr'), errs)
        pg.close()
    b.close()
