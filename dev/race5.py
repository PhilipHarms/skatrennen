import json
from playwright.sync_api import sync_playwright
def state(scores, phase='race'):
    names=['Anna','Ben','Carla','Dora','Emil','Fritz'][:len(scores)]
    chars=['herz-bube','pik-dame','karo-koenig','kreuz-dame','pik-bube','herz-koenig']
    players=[{"id":"p%d"%i,"name":n,"char":chars[i]} for i,n in enumerate(names)]
    games=[{"type":"frei","manual":True,"player":"p%d"%i,"freiPts":sc,"mVal":abs(sc),"mRes":"won" if sc>0 else "minus","dealerId":"p0"} for i,sc in enumerate(scores) if sc]
    return {"v":1,"phase":phase,"step":"hello","introLine":0,"draft":{"slots":[]},"players":players,"startDealer":0,"games":games,
            "settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":2},"created":0,"finishedAt":None}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(state([-150,-40,0,250,350,700])))
    pg.reload(); pg.wait_for_timeout(1500)
    print('settings migrated', pg.evaluate('JSON.stringify(S.settings)'))
    pg.locator('#race-wrap').screenshot(path='r6_tiers.png')
    # Frischer Start: Einlauf
    pg.evaluate("revanche()"); pg.wait_for_timeout(900)
    pg.locator('#race-wrap').screenshot(path='r6_runin.png')
    pg.wait_for_timeout(2500)
    pg.locator('#race-wrap').screenshot(path='r6_after.png')
    pg.click('#btn-settings'); pg.wait_for_timeout(300)
    pg.screenshot(path='r6_settings.png')
    print(errs)
    b.close()
