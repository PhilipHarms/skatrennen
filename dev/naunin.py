W,H=43,38
def blank(): return [['.']*W for _ in range(H)]
g=blank()
def px(x,y,k):
    if 0<=x<W and 0<=y<H: g[y][x]=k
def hl(x0,x1,y,k):
    for x in range(x0,x1+1): px(x,y,k)
def vl(x,y0,y1,k):
    for y in range(y0,y1+1): px(x,y,k)
def rect(x0,y0,x1,y1,k):
    for y in range(y0,y1+1): hl(x0,x1,y,k)

# --- Torso ---
# sleeve left with stripes
for y in range(26,38):
    x0 = 1 if y>28 else 3 + (28-y)
    for x in range(x0,11):
        k = ['y','r','b','r'][((x+ (y//3))//2)%4]
        px(x,y,k)
# body red
rect(10,25,30,37,'r')
for y in range(25,38): px(10,y,'R'); px(30,y,'R')
# yellow trims
vl(12,25,37,'y'); vl(13,26,37,'Y')
vl(27,25,37,'y'); vl(26,26,37,'Y')
# blue center panel
rect(15,25,24,37,'b')
vl(15,25,37,'B'); vl(24,25,37,'B')
vl(19,25,37,'r'); vl(20,25,37,'R')
for y in (28,31,34,37):
    hl(17,22,y,'y'); px(16,y,'Y'); px(23,y,'Y')
# right shoulder puff
for y in range(27,38):
    hl(29,31 if y<30 else 32,y,'r')
# --- Ruff ---
for y in range(22,26):
    hl(9 if y>22 else 11, 30 if y>22 else 28, y,'w')
for x in range(9,31):
    if x%3==0: px(x,25,'W'); px(x,23,'W')
    if x%3==1: px(x,24,'W')
hl(10,29,26,'W')
for x in range(10,30,3): px(x,26,'w')
# --- Neck & Head ---
rect(15,20,24,22,'S')
# face
face = {8:(12,27),9:(11,28),10:(11,28),11:(11,28),12:(11,28),13:(11,28),14:(11,28),15:(11,28),16:(11,28),17:(12,27),18:(12,27),19:(13,26),20:(14,25),21:(16,23)}
for y,(a,b) in face.items(): hl(a,b,y,'s')
# shading right side of face
for y in range(9,20): px(face[y][1],y,'S')
# ears
vl(10,12,15,'s'); vl(29,12,15,'S'); px(10,13,'S'); px(29,13,'s')
# hair under cap, sideburns
hl(11,28,8,'h')
for x in range(13,27,3): px(x,9,'h'); px(x+1,9,'h')
vl(11,9,13,'h'); vl(12,9,11,'h'); vl(28,9,13,'h'); vl(27,9,11,'h')
vl(11,14,15,'H'); vl(28,14,15,'H')
px(10,9,'h'); px(10,10,'h'); px(10,11,'H'); px(29,9,'h'); px(29,10,'h'); px(29,11,'H')
# brows
hl(14,17,11,'H'); hl(22,25,11,'H')
# eyes
hl(14,17,12,'o'); hl(22,25,12,'o')
px(14,13,'w'); px(15,13,'i'); px(16,13,'i'); px(17,13,'w')
px(22,13,'w'); px(23,13,'i'); px(24,13,'i'); px(25,13,'w')
px(15,13,'i'); px(16,13,'e'); px(23,13,'i'); px(24,13,'e')
# nose
vl(20,13,16,'S'); px(19,16,'S'); px(21,16,'S')
# cheeks
px(13,16,'q'); px(26,16,'q'); px(14,16,'q'); px(25,16,'q')
# smile
px(14,17,'m'); px(25,17,'m')
hl(15,24,18,'m')
hl(16,23,18,'T')
px(15,18,'m'); px(24,18,'m')
hl(16,23,19,'m')
hl(17,22,20,'R')
# stubble
for (x,y) in [(15,20),(24,20),(17,21),(20,21),(22,21),(19,21)]:
    if g[y][x] in 'sS': px(x,y,'t')
# --- Cap ---
cap = {1:(13,26),2:(10,29),3:(8,31),4:(7,32),5:(7,32),6:(8,31)}
for y,(a,b) in cap.items(): hl(a,b,y,'u')
hl(9,30,7,'U')
for x in range(9,31,2): px(x,7,'v')
hl(8,31,6,'U')
hl(12,18,2,'v'); hl(10,15,3,'v'); px(9,4,'v')
for x in range(7,33): 
    if g[5][x]=='u' and x>20: px(x,5,'U')
# --- Halberd ---
vl(34,4,37,'p'); vl(35,4,37,'P')
# fleur tip
px(34,0,'y'); px(35,0,'y'); hl(33,36,1,'y'); hl(34,35,2,'y'); px(32,2,'Y'); px(37,2,'Y'); px(32,1,'y'); px(37,1,'y'); hl(33,36,3,'Y')
# axe blade on right
blade = {3:(36,37),4:(36,39),5:(36,40),6:(36,41),7:(36,41),8:(36,41),9:(36,41),10:(36,41),11:(36,40),12:(36,39),13:(36,37)}
for y,(a,b) in blade.items(): hl(a,b,y,'y')
for y,(a,b) in blade.items(): px(b,y,'Y')
club=['.XXX.','.XXX.','XXXXX','X.X.X','..X..']
for yy,row in enumerate(club):
    for xx,c in enumerate(row):
        if c=='X': px(36+xx,6+yy,'o')
# back spike left of pole
px(33,7,'y'); px(32,8,'y'); px(33,8,'y'); px(33,9,'y')
# collar ring & tassel
hl(33,36,14,'y'); hl(33,36,15,'Y')
vl(36,16,17,'r'); hl(35,37,18,'r'); hl(35,37,19,'R'); hl(35,37,20,'r'); px(35,21,'R'); px(37,21,'R')
# hand holding pole
rect(31,27,36,30,'s'); vl(36,27,30,'S'); hl(31,36,30,'S')
hl(30,37,31,'w'); hl(30,37,32,'W')
rect(31,33,37,37,'r'); vl(37,33,37,'R')
vl(34,27,30,'p'); vl(35,27,29,'s')
for y in (27,28,29): px(33,y,'S')

# --- auto outline ---
src=[row[:] for row in g]
for y in range(H):
    for x in range(W):
        if src[y][x]=='.':
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                xx,yy=x+dx,y+dy
                if 0<=xx<W and 0<=yy<H and src[yy][xx] not in '.o':
                    g[y][x]='o'; break
# internal outlines: face/hair separation under cap
hl(12,27,7,'U')
base=[''.join(r) for r in g]

def variant(edits):
    rows=[list(r) for r in base]
    for (x,y,k) in edits: rows[y][x]=k
    return [''.join(r) for r in rows]

talk=[]
for x in range(15,25): talk.append((x,18,'m'))
for x in range(16,24): talk.append((x,18,'T'))
for x in range(16,24): talk.append((x,19,'M'))
for x in range(17,23): talk.append((x,20,'m'))
for x in (16,23): talk.append((x,20,'s'))
for x in range(17,23): talk.append((x,21,'R'))
blink=[]
for x in list(range(14,18))+list(range(22,26)):
    blink.append((x,12,'s')); blink.append((x,13,'o'))
yawn=list(blink)
for y in range(17,22):
    for x in range(16,24): yawn.append((x,y,'m'))
for y in range(18,21):
    for x in range(17,23): yawn.append((x,y,'M'))
for x in range(17,23): yawn.append((x,18,'T'))
tape=[]
for y in (17,18,19):
    for x in range(12,28): tape.append((x,y,'x' if y<19 else 'X'))
for (x,y) in [(13,16),(14,20),(26,16),(25,20)]: tape.append((x,y,'x'))
moods={'idle':base,'talk':variant(talk),'blink':variant(blink),'yawn':variant(yawn),'tape':variant(tape)}
import json
open('/home/claude/skat/dev/naunin.json','w').write(json.dumps(moods))
print('\n'.join(base))
