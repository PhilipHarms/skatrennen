import json
from PIL import Image
P={'o':'#1b1427','e':'#1b1427','s':'#f3c99b','S':'#d79a6c','t':'#c98d63','h':'#d4863a','H':'#9a5424','u':'#2f4aa0','U':'#1e2f6e','v':'#4a6ad0',
'w':'#f4ead2','W':'#cbbd9b','r':'#d63c3c','R':'#8e2431','y':'#f5c542','Y':'#b9852a','b':'#2f4aa0','B':'#1e2f6e','p':'#a8703e','P':'#6a4222',
'i':'#3f86e0','m':'#5a1420','M':'#8e2431','T':'#fbf6ea','q':'#ec9c88','x':'#e2dccb','X':'#b8b09a'}
moods=json.load(open('naunin.json'))
S=10
out=Image.new('RGB',(43*S*3+40,38*S*2+30),'#3a3456')
for i,(k,rows) in enumerate(moods.items()):
    im=Image.new('RGBA',(43,38),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c!='.': im.putpixel((x,y),tuple(int(P[c][j:j+2],16) for j in (1,3,5))+(255,))
    im=im.resize((43*S,38*S),Image.NEAREST)
    out.paste(im,((i%3)*(43*S+10)+10,(i//3)*(38*S+10)+10),im)
out.save('naunin.png')
