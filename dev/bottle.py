from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width':900,'height':400})
    pg.goto('file:///home/claude/skat/dev/test.html'); pg.wait_for_timeout(400)
    pg.evaluate("""() => {
      document.body.innerHTML = '<canvas id=z width=900 height=400 style="image-rendering:pixelated;background:#5a8f3c"></canvas>';
      const z = document.getElementById('z').getContext('2d'); z.imageSmoothingEnabled = false;
      const off = document.createElement('canvas'); off.width=150; off.height=50; const o = off.getContext('2d');
      o.fillStyle='#5a8f3c'; o.fillRect(0,0,150,50);
      Stage.bctx = o;
      const modes = ['none','hold','drink'];
      modes.forEach((m,i) => {
        Stage.nau = {pose:'stand', bottle:m, sipUntil:0, shake:0};
        Stage.FEET = 40; Stage.HX = i*45 - 30;
        Stage.drawNaunin(performance.now());
      });
      z.drawImage(off,0,0,900,300);
    }""")
    pg.screenshot(path='bottle_big.png')
    b.close()
