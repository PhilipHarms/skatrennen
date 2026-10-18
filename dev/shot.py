import sys
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv)>3 else 1420
h = int(sys.argv[4]) if len(sys.argv)>4 else 1120
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':w,'height':h}, device_scale_factor=1)
    msgs=[]
    pg.on('console', lambda m: msgs.append(m.type+': '+m.text))
    pg.on('pageerror', lambda e: msgs.append('ERR: '+str(e)))
    pg.goto(url)
    pg.wait_for_timeout(500)
    pg.screenshot(path=out, full_page=False)
    for m in msgs: print(m)
    b.close()
