import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    st={"v":1,"phase":"race","step":"hello","introLine":0,"draft":{"slots":[]},
      "players":[{"id":"pa","name":"Anna","char":"herz-bube"},{"id":"pb","name":"Ben","char":"pik-dame"},{"id":"pc","name":"Carla","char":"karo-koenig"}],
      "startDealer":0,"games":[],"settings":{"pferd":300,"glanz":600,"sound":False,"kiebitz":True,"manual":True,"rev":2},"created":0,"finishedAt":None}
    pg.evaluate("s => localStorage.setItem('naunin-skatrennen-v1', s)", json.dumps(st)); pg.reload(); pg.wait_for_timeout(400)
    def go(steps, label, shot=None):
        pg.click('#btn-enter'); pg.wait_for_timeout(150)
        for s in steps:
            if s.startswith('key:'): pg.keyboard.press(s[4:])
            else: pg.click('#entry-body '+s)
            pg.wait_for_timeout(30)
        if shot: pg.screenshot(path=shot)
        print(label, '|', pg.inner_text('#pv-desc'), '|', pg.inner_text('#pv-pts'), '| ok', pg.is_enabled('#entry-ok'))
        pg.click('#entry-ok'); pg.wait_for_timeout(1600)
        print('   naunin:', pg.inner_text('#scr-race .sr'))
    go(['[data-k=player] >> nth=0','[data-k=qv][data-v="72"]','[data-k=tag][data-v=grand]','[data-k=tag][data-v=hand]'], 'Grand Hand 72', 'e_sheet.png')
    go(['[data-k=player] >> nth=1','[data-k=num][data-v="3"]','[data-k=num][data-v="6"]','[data-k=mres][data-v=lost2]','[data-k=tag][data-v=kontra]'], 'Verloren 36 x2 Kontra')
    go(['[data-k=player] >> nth=2','[data-k=tag][data-v=ramsch]','[data-k=qv][data-v="40"]'], 'Ramsch 40')
    go(['[data-k=player] >> nth=0','[data-k=tag][data-v=null]','[data-k=tag][data-v=durch]'], 'Null Durchmarsch')
    go(['[data-k=player] >> nth=1','key:4','key:8'], 'Tastatur 48 ohne Etikett')
    print('stats', pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(stats()).map(([k,v])=>[pname(k),[v.score,v.played,v.grands,v.durchmarsch,v.ramschLost]])))"))
    pg.click('#btn-list'); pg.wait_for_timeout(200)
    print('liste:', pg.evaluate("[...document.querySelectorAll('.desc-cell')].map(e=>e.textContent).join(' / ')"))
    pg.click('tbody tr >> nth=1'); pg.wait_for_timeout(200)
    print('edit restore:', pg.inner_text('.mdisplay'), pg.evaluate("Entry.e.mRes"), pg.evaluate("JSON.stringify(Entry.e.tags)"))
    print(errs)
    b.close()
