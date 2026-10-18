import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    msgs=[]
    pg.on('pageerror', lambda e: msgs.append('PAGEERR: '+str(e)))
    pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
    # 3 Spieler
    for i in range(3): pg.click('#onb-next'); pg.wait_for_timeout(100)
    pg.fill('#name-0','Anna'); pg.fill('#name-1','Ben'); pg.fill('#name-2','Carla')
    for i in range(4): pg.click('#onb-next'); pg.wait_for_timeout(150)
    print('phase', pg.evaluate('S.phase'), pg.evaluate('JSON.stringify(curSeat())'))
    def enter(steps, label):
        pg.click('#btn-enter'); pg.wait_for_timeout(150)
        for s in steps:
            if s.startswith('fill:'):
                sel,val=s[5:].split('=',1); pg.fill(sel,val)
            else: pg.click('#entry-body '+s)
            pg.wait_for_timeout(40)
        ok = pg.is_enabled('#entry-ok')
        pv = pg.inner_text('#pv-desc') + ' | ' + pg.inner_text('#pv-pts')
        print(label, ok, pv)
        if ok: pg.click('#entry-ok')
        else: pg.keyboard.press('Escape')
        pg.wait_for_timeout(250)
    enter(['[data-k=player] >> nth=0','[data-v="null"]','[data-v="ouvert"]'], 'Null ouvert')
    enter(['[data-v="ramsch"]','[data-k=player] >> nth=1','fill:#rp=38'], 'Ramsch 38')
    enter(['[data-v="ramsch"]','[data-k=player] >> nth=2','[data-k=durchmarsch]','[data-k=bock]'], 'Durchmarsch Bock')
    enter(['[data-v="pass"]'], 'Eingepasst')
    enter(['[data-v="frei"]','[data-k=player] >> nth=0','[data-k=freiSign][data-v="-1"]','fill:#fp=25'], 'Frei -25')
    enter(['[data-k=player] >> nth=1','[data-v="farbe:pik"]','[data-k=moreSp]','[data-v="m6"]','[data-k=overbid]'], 'Pik mit 6 ueberreizt?')
    enter(['[data-k=player] >> nth=1','[data-v="grand"]','[data-v="m1"]','[data-k=kontra][data-v="2"]','[data-k=won][data-v=false]'], 'Grand Re verloren')
    print('scores', pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(stats()).map(([k,v])=>[pname(k),v.score])))"))
    # edit game 1 via list
    pg.click('#btn-list'); pg.wait_for_timeout(200)
    pg.click('tbody tr >> nth=0'); pg.wait_for_timeout(200)
    pg.click('#entry-body [data-k=nres][data-v=lost]'); pg.click('#entry-ok'); pg.wait_for_timeout(200)
    print('after edit', pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(stats()).map(([k,v])=>[pname(k),v.score])))"))
    # undo
    pg.click('#btn-undo'); pg.wait_for_timeout(150); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(200)
    print('games after undo', pg.evaluate('S.games.length'))
    # mute
    pg.click('#btn-mute'); pg.wait_for_timeout(1500)
    enter(['[data-k=player] >> nth=0','[data-v="farbe:herz"]','[data-v="o1"]'], 'Herz ohne 1 (stumm)')
    pg.wait_for_timeout(800)
    print('bubbles while muted', pg.evaluate("document.querySelectorAll('.bubble').length"), '| say:', pg.inner_text('#scr-race .say'))
    pg.click('#btn-mute'); pg.wait_for_timeout(300)
    pg.screenshot(path='f4_race3.png', full_page=True)
    # evaluate & podium with 3 players
    pg.click('#btn-eval'); pg.wait_for_timeout(200); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(1500)
    pg.screenshot(path='f4_podium3.png', full_page=True)
    pg.click('#btn-revanche'); pg.wait_for_timeout(500)
    print('after revanche', pg.evaluate('S.phase'), pg.evaluate('S.games.length'), pg.evaluate('S.startDealer'))
    # 6 players fresh
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-a=fresh]'); pg.wait_for_timeout(200); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(300)
    print('fresh step', pg.evaluate('S.step'), pg.evaluate('JSON.stringify(S.draft.names)'))
    pg.click('#add-name'); pg.fill('#name-3','Dora'); pg.click('#add-name'); pg.fill('#name-4','Emil'); pg.click('#add-name'); pg.fill('#name-5','Fritz')
    for i in range(4): pg.click('#onb-next'); pg.wait_for_timeout(150)
    print('6p', pg.evaluate('S.phase'), pg.evaluate('JSON.stringify(curSeat())'), pg.evaluate('S.players.map(p=>p.char).join(",")'))
    pg.wait_for_timeout(500)
    pg.screenshot(path='f4_race6.png', full_page=True)
    print('\n'.join(msgs))
    b.close()
