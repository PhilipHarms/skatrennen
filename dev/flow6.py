from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    msgs=[]
    pg.on('pageerror', lambda e: msgs.append('PAGEERR: '+str(e)))
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    for i in range(3): pg.click('#onb-next'); pg.wait_for_timeout(80)
    pg.fill('#name-0','Anna'); pg.fill('#name-1','Ben'); pg.fill('#name-2','Carla')
    for i in range(4): pg.click('#onb-next'); pg.wait_for_timeout(120)
    def enter(steps, label, shot=None):
        pg.click('#btn-enter'); pg.wait_for_timeout(150)
        for s in steps:
            if s.startswith('fill:'):
                sel,val=s[5:].split('=',1); pg.fill(sel,val)
            else: pg.click('#entry-body '+s)
            pg.wait_for_timeout(40)
        if shot: pg.screenshot(path=shot)
        ok = pg.is_enabled('#entry-ok')
        print(label, ok, pg.inner_text('#pv-desc'), '|', pg.inner_text('#pv-pts'))
        if ok: pg.click('#entry-ok')
        else: pg.keyboard.press('Escape')
        pg.wait_for_timeout(250)
    enter(['[data-k=player] >> nth=0','[data-v="null"]','[data-v="hand"]','[data-k=nres][data-v=durch]'], 'Null Hand Durchmarsch', 'f6_null.png')
    enter(['[data-v="ramsch"]','[data-k=player] >> nth=1','[data-k=durchmarsch]'], 'Ramsch Durchmarsch')
    # manual mode on
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-t=manual]'); pg.wait_for_timeout(100); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    print('button:', pg.inner_text('#btn-enter'))
    enter(['[data-k=player] >> nth=2','fill:#fp=72'], 'Manuell +72', 'f6_manual.png')
    enter(['[data-k=player] >> nth=0','[data-k=freiSign][data-v="-1"]','fill:#fp=96'], 'Manuell -96')
    enter(['[data-k=mpass]'], 'Manuell eingepasst')
    enter(['[data-k=mode]','[data-k=player] >> nth=0','[data-v="grand"]','[data-v="m1"]'], 'Umschalten auf Rechner: Grand mit 1')
    print('scores', pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(stats()).map(([k,v])=>[pname(k),[v.score,v.played,v.durchmarsch,v.streak]])))"))
    print('list:', pg.evaluate("S.games.map(g=>calcGame(g).desc+' '+calcGame(g).points).join(' / ')"))
    # edit manual game via list
    pg.click('#btn-list'); pg.wait_for_timeout(200); pg.click('tbody tr >> nth=2'); pg.wait_for_timeout(200)
    print('edit manual shows fp:', pg.is_visible('#fp'), pg.input_value('#fp'))
    pg.keyboard.press('Escape')
    pg.wait_for_timeout(1500)
    pg.screenshot(path='f6_race.png', full_page=True)
    print('\n'.join(msgs))
    b.close()
