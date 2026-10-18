import json, math
W, H = 32, 38
g = [['.'] * W for _ in range(H)]
def px(x, y, k):
    if 0 <= x < W and 0 <= y < H: g[y][x] = k
def line(x0, y0, x1, y1, k):
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n + 1):
        px(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), k)
# gekreuzte Hellebarden hinter dem Schild
line(3, 35, 27, 9, 'n'); line(28, 35, 4, 9, 'n')
for (bx, by, d) in [(27, 9, 1), (4, 9, -1)]:
    px(bx, by - 1, 'y'); px(bx, by - 2, 'y'); px(bx, by - 3, 'y')
    for dy in range(-3, 2):
        px(bx + d, by + dy, 'y'); px(bx + 2 * d, by + dy, 'y')
    px(bx + 3 * d, by - 2, 'y'); px(bx + 3 * d, by - 1, 'y'); px(bx + 3 * d, by, 'y')
    px(bx + 2 * d, by - 1, 'Y')
# Schild
top, left, right = 10, 5, 26
cx = (left + right) / 2
rows = {}
for y in range(top, 37):
    if y <= 23: a, b = left, right
    else:
        k = (y - 23) / 13
        inset = round((k ** 1.5) * ((right - left) / 2))
        a, b = left + inset, right - inset
    if a > b: break
    rows[y] = (a, b)
midx0, midx1 = 15, 16
midy0, midy1 = 21, 22
for y, (a, b) in rows.items():
    for x in range(a, b + 1):
        top_half = y < midy0
        left_half = x < midx0
        if midx0 <= x <= midx1 or midy0 <= y <= midy1: k = 'y'
        elif top_half and left_half: k = 'w'
        elif top_half and not left_half: k = 'r'
        elif not top_half and left_half: k = 'r'
        else: k = 'w'
        px(x, y, k)
# Glanzkante
for y in range(top + 1, 23): px(left + 1, y, 'W' if g[y][left + 1] == 'w' else 'R' if g[y][left+1]=='r' else g[y][left+1])
glyphs = {
    'club':  ['.XXX.', '.XXX.', 'XXXXX', 'X.X.X', '..X..'],
    'heart': ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'],
    'diam':  ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'],
    'spade': ['..X..', '.XXX.', 'XXXXX', 'XXXXX', '..X..'],
}
def glyph(name, ox, oy, k):
    for yy, r in enumerate(glyphs[name]):
        for xx, c in enumerate(r):
            if c == 'X': px(ox + xx, oy + yy, k)
glyph('club', 8, 13, 'o'); glyph('heart', 18, 13, 'w')
glyph('diam', 8, 25, 'w'); glyph('spade', 18, 25, 'o')
# Krone
for x in range(9, 23): px(x, 8, 'y'); px(x, 9, 'Y')
for x in range(9, 23): px(x, 7, 'y')
for (x, hgt) in [(9, 3), (12, 2), (15, 4), (16, 4), (19, 2), (22, 3)]:
    for y in range(7 - hgt, 7): px(x, y, 'y')
px(15, 1, 'w'); px(16, 1, 'w')
px(12, 8, 'r'); px(19, 8, 'r'); px(15, 8, 'b'); px(16, 8, 'b')
# Kontur
src = [r[:] for r in g]
for y in range(H):
    for x in range(W):
        if src[y][x] == '.':
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                xx, yy = x+dx, y+dy
                if 0 <= xx < W and 0 <= yy < H and src[yy][xx] not in '.o':
                    g[y][x] = 'o'; break
# Schildrand innen
for y, (a, b) in rows.items():
    pass
out = [''.join(r) for r in g]
json.dump(out, open('wappen.json', 'w'))
from PIL import Image
P = {'o':'#1b1427','y':'#f5c542','Y':'#b9852a','r':'#d63c3c','R':'#8e2431','w':'#f4ead2','W':'#cbbd9b','n':'#9a6238','b':'#2f4aa0'}
S = 10
img = Image.new('RGB', (W*S, H*S), '#efe1bb')
for y, r in enumerate(out):
    for x, k in enumerate(r):
        if k != '.':
            c = tuple(int(P[k][i:i+2], 16) for i in (1,3,5))
            for dy in range(S):
                for dx in range(S): img.putpixel((x*S+dx, y*S+dy), c)
img.save('wappen.png'); print('\n'.join(out))
