from playwright.sync_api import sync_playwright
import base64
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto('file:///home/claude/skat/dev/test.html'); pg.wait_for_timeout(400)
    info=pg.evaluate("""() => {
      const n=spriteNaunin('idle'); const w=document.getElementById('wappen');
      const pc=portraitCard('kreuz-bube');
      return {n:[n.width,n.height], w:[w.width,w.height], pc:[pc.width,pc.height], moods:Object.keys(SPR.naunin)}
    }""")
    print(info)
    for name,expr in [('naunin',"spriteNaunin('idle')"),('wappen',"document.getElementById('wappen')")]:
        d=pg.evaluate("() => { const s=%s; const c=document.createElement('canvas'); c.width=s.width*6; c.height=s.height*6; const x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(s,0,0,c.width,c.height); return c.toDataURL(); }" % expr)
        open('icons/try_%s.png'%name,'wb').write(base64.b64decode(d.split(',')[1]))
    b.close()
