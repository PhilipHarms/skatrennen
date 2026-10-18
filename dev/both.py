from playwright.sync_api import sync_playwright
import time
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.goto('file:///home/claude/skat/dev/test.html'); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    pg.click('#intro-start'); pg.wait_for_timeout(300); pg.click('#intro-skip'); pg.wait_for_timeout(2500)
    t0 = time.time(); seen = []
    def snap():
        t = pg.inner_text('#intro-banner .sr')
        if not seen or seen[-1][1] != t: seen.append((round(time.time() - t0, 1), t))
    pg.type('#name-0', 'Jan', delay=120); pg.keyboard.press('Enter')
    for ch in 'Charlotte':
        pg.keyboard.type(ch); pg.wait_for_timeout(120); snap()
    for i in range(30): pg.wait_for_timeout(100); snap()
    for s in seen: print(s)
    b.close()
