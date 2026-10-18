"""Kompletter Durchlauf durch Version 1.3 auf Handybreite."""
import json, time
from playwright.sync_api import sync_playwright

LOG = []
def log(*a):
    LOG.append(' '.join(str(x) for x in a)); print(*a)

def screen(pg):
    return pg.evaluate("['intro','race','podium'].find(s=>!document.getElementById('scr-'+s).hidden)")

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' and 'TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/skat/dev/test.html')
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)

    # 1. Intro komplett ansehen
    log('1 Start:', screen(pg), '| plain', pg.evaluate("document.body.classList.contains('plain')"))
    pg.click('#intro-start')
    t0 = time.time()
    pg.wait_for_selector('#intro-banner:not([hidden])', timeout=20000)
    log('  Banner nach', round(time.time() - t0, 1), 's | Skip sichtbar:', pg.is_visible('#intro-skip'))
    for i in range(3):
        pg.wait_for_timeout(2600); pg.click('#dlg-next')
    pg.wait_for_timeout(400)
    log('  Schritt:', pg.evaluate('Intro.step'))

    # 2. Namen, Figuren mit Portraits, Sitzordnung, Geber
    for i, n in enumerate(['Anna', 'Ben', 'Carla']):
        pg.fill('#name-%d' % i, n)
    pg.click('#add-name'); pg.fill('#name-3', 'Dora')
    pg.wait_for_timeout(2500)
    log('  Figuren auf der Bühne:', pg.evaluate('Stage.figs.size'))
    pg.click('#dlg-next'); pg.wait_for_timeout(2600)
    log('  Portraits in der Figurenwahl:', pg.evaluate("document.querySelectorAll('#dlg-body .fsp-card canvas').length"))
    pg.screenshot(path='z_figs.png', full_page=True)
    pg.click('#dlg-body .fig-row >> nth=0 >> button'); pg.wait_for_timeout(200)
    pg.click('#dlg-body .picker .pick >> nth=10'); pg.wait_for_timeout(600)
    log('  Anna hat jetzt:', pg.evaluate('S.players[0].char'))
    pg.click('#dlg-next'); pg.wait_for_timeout(2600)
    pg.click('.seatchips [data-i="1"]'); pg.click('.seatchips [data-i="3"]'); pg.wait_for_timeout(1800)
    log('  Sitzordnung:', pg.evaluate("S.players.map(p=>p.name).join(' > ')"))
    pg.click('#dlg-next'); pg.wait_for_timeout(2600)
    say_before = pg.inner_text('#intro-banner .sr')
    pg.click('[data-d="2"]'); pg.wait_for_timeout(2500)
    log('  Geber-Text:', pg.inner_text('#intro-banner .sr'))
    pg.click('#dlg-next')
    t0 = time.time()
    pg.wait_for_timeout(1200)
    log('  Prost-Text sichtbar:', pg.inner_text('#intro-banner .sr'), '| Screen:', screen(pg))
    pg.wait_for_function("!document.getElementById('scr-race').hidden", timeout=10000)
    log('  Wechsel zur Rennbahn nach', round(time.time() - t0, 1), 's')
    pg.wait_for_timeout(700)
    pg.locator('#race-wrap').screenshot(path='z_runin.png')
    pg.wait_for_timeout(2000)

    # 3. Spiele eintragen (Standard: selbst eintragen)
    def manual(player_nth, pts, tags, label):
        pg.click('#btn-enter'); pg.wait_for_timeout(150)
        pg.click('#entry-body [data-k=player] >> nth=%d' % player_nth)
        for t in tags:
            pg.click('#entry-body [data-k=tag][data-v=%s]' % t); pg.wait_for_timeout(25)
        if pts is not None:
            pg.click('#entry-body [data-k=freiSign][data-v="%d"]' % (1 if pts > 0 else -1))
            pg.fill('#fp', str(abs(pts)))
        txt = pg.inner_text('#pv-desc') + ' ' + pg.inner_text('#pv-pts')
        pg.click('#entry-ok'); pg.wait_for_timeout(1300)
        log('  ' + label + ':', txt, '| Naunin:', pg.inner_text('#scr-race .sr')[:70])
    pg.click('#btn-enter'); pg.wait_for_timeout(200)
    pg.locator('.sheet').screenshot(path='z_entry.png'); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    manual(0, 96, ['grand'], 'Grand 96')
    manual(1, 72, ['grand', 'hand'], 'Grand Hand 72')
    manual(2, -96, [], 'Minus 96')
    manual(0, 72, ['grand'], 'Grand 72')
    manual(1, None, ['ramsch'], 'Ramsch (nur Etikett, dann 60)') if False else manual(1, -60, ['ramsch'], 'Ramsch 60')
    manual(2, None, ['durch'], 'Durchmarsch per Etikett')
    manual(0, 96, [], 'ohne Etikett 96')
    # Rechner für ein Spiel
    pg.click('#btn-enter'); pg.wait_for_timeout(150)
    pg.click('#entry-body [data-k=mode]'); pg.wait_for_timeout(100)
    pg.click('#entry-body [data-k=player] >> nth=0'); pg.click('#entry-body [data-v="farbe:kreuz"]'); pg.click('#entry-body [data-v="o2"]'); pg.click('#entry-body [data-k=hand]')
    log('  Rechner:', pg.inner_text('#pv-desc'), pg.inner_text('#pv-pts')); pg.click('#entry-ok'); pg.wait_for_timeout(1200)
    log('  Standard danach wieder:', 'Rechner' if not pg.evaluate('S.settings.manual') else 'selbst eintragen', '| Knopf:', pg.inner_text('#btn-enter'))
    pg.click('#btn-enter'); pg.wait_for_timeout(150); pg.click('#entry-body [data-k=mode]'); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    st = pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(stats()).map(([k,v])=>[pname(k),v.score])))")
    log('  Stand:', st, '| Stufen:', pg.evaluate("S.players.map(p=>tierOf(stats()[p.id].score,S.settings)).join(',')"))
    pg.wait_for_timeout(2500)
    pg.locator('#race-wrap').screenshot(path='z_race.png')
    # Rückgängig, Liste
    pg.click('#btn-undo'); pg.wait_for_timeout(200); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(400)
    log('  Nach Rückgängig Spiele:', pg.evaluate('S.games.length'))
    pg.click('#btn-list'); pg.wait_for_timeout(250)
    log('  Liste:', pg.evaluate("[...document.querySelectorAll('.desc-cell')].map(e=>e.textContent).join(' | ')"))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)

    # 4. Auswerten, Siegerehrung mit Champagner und Galerie
    pg.click('#btn-eval'); pg.wait_for_timeout(250)
    log('  Auswerten-Dialog:', pg.inner_text('.modal p')[:90])
    pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(3300)
    pg.locator('.podium-wrap').screenshot(path='z_podium.png')
    log('4 Siegerehrung:', screen(pg), '| Galerie-Bilder:', pg.evaluate("document.querySelectorAll('.gal-item').length"), '| Titel:', pg.evaluate("[...document.querySelectorAll('.ut .tt')].map(e=>e.textContent).join(', ')"))
    pg.screenshot(path='z_podium_full.png', full_page=True)
    pg.click('#podium-cv'); pg.wait_for_timeout(2600)
    pg.locator('.podium-wrap').screenshot(path='z_podium_replay.png')

    # 5. Revanche, dann Neue Leute, dann Intro-Wiederholung
    pg.click('#btn-revanche'); pg.wait_for_timeout(600)
    log('5 Revanche:', screen(pg), 'Spiele', pg.evaluate('S.games.length'))
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-a=fresh]'); pg.wait_for_timeout(150); pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(1500)
    log('  Neue Leute:', screen(pg), pg.evaluate('Intro.step'), 'Namen:', pg.evaluate("S.draft.slots.map(s=>s.name).join(',')"))
    # 6. Gestrige Siegerehrung -> Dieselben Leute?
    s = json.loads(pg.evaluate("localStorage.getItem('naunin-skatrennen-v1')"))
    s['phase'] = 'podium'; s['finishedAt'] = 1760700000000
    pg.evaluate("x => localStorage.setItem('naunin-skatrennen-v1', x)", json.dumps(s)); pg.reload(); pg.wait_for_timeout(400)
    pg.click('#intro-start'); pg.wait_for_timeout(400); pg.click('#intro-skip'); pg.wait_for_timeout(2500)
    log('6 Gestern:', pg.evaluate('Intro.step'), '|', pg.inner_text('#intro-banner .sr')[:80])
    pg.click('[data-a=yes]'); t0 = time.time()
    pg.wait_for_function("!document.getElementById('scr-race').hidden", timeout=10000)
    log('  Gleiche Runde -> Rennbahn nach', round(time.time() - t0, 1), 's')

    # 7. Intro-Knopf: frischer Start
    pg.wait_for_timeout(2500)
    log('7 Runde:', screen(pg), pg.evaluate("S.players.map(p=>p.name).join(',')"))
    pg.click('#btn-enter'); pg.wait_for_timeout(150); pg.click('#entry-body [data-k=player] >> nth=0'); pg.fill('#fp', '48'); pg.click('#entry-ok'); pg.wait_for_timeout(800)
    pg.evaluate("S.settings.pferd = 150; saveState()")
    pg.click('#btn-settings'); pg.wait_for_timeout(200); pg.click('[data-a=intro]'); pg.wait_for_timeout(300)
    log('  Intro-Knopf fragt nach:', pg.inner_text('.modal p')[:60])
    pg.click('.modal [data-a=ok]'); pg.wait_for_timeout(600)
    log('  Danach:', screen(pg), '| Startknopf:', pg.is_visible('#intro-start'), '| Spieler:', pg.evaluate('S.players.length'), '| Spiele:', pg.evaluate('S.games.length'), '| Namen:', repr(pg.evaluate("S.draft.slots.map(s=>s.name).join(',')")), '| Pferd ab:', pg.evaluate('S.settings.pferd'))
    pg.click('#intro-start'); pg.wait_for_timeout(500); pg.click('#intro-skip'); pg.wait_for_timeout(2500)
    log('  Intro übersprungen:', pg.evaluate('Intro.step'))

    log('Fehler:', errs)
    b.close()
