"""Generator fuer die Kartenfiguren im Stil der Illustrationen.
Gesicht nach rechts, Leinwand 19x23. Ausgabe: chars.json + Vorschau."""
import json

W, H = 19, 23
OY = 1  # alles eine Zeile tiefer, damit oben Platz fuer Kontur ist


class Grid:
    def __init__(self):
        self.g = [['.'] * W for _ in range(H)]

    def px(self, x, y, k):
        y += OY
        if 0 <= x < W and 0 <= y < H:
            self.g[y][x] = k

    def get(self, x, y):
        y += OY
        if 0 <= x < W and 0 <= y < H:
            return self.g[y][x]
        return '.'

    def hl(self, x0, x1, y, k):
        for x in range(x0, x1 + 1):
            self.px(x, y, k)

    def vl(self, x, y0, y1, k):
        for y in range(y0, y1 + 1):
            self.px(x, y, k)

    def rect(self, x0, y0, x1, y1, k):
        for y in range(y0, y1 + 1):
            self.hl(x0, x1, y, k)

    def outline(self):
        src = [r[:] for r in self.g]
        for y in range(H):
            for x in range(W):
                if src[y][x] == '.':
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        xx, yy = x + dx, y + dy
                        if 0 <= xx < W and 0 <= yy < H and src[yy][xx] not in '.o':
                            self.g[y][x] = 'o'
                            break

    def rows(self):
        return [''.join(r) for r in self.g]


# ---------------- Teile ----------------

def face(g, c):
    # Gesicht nach rechts
    g.hl(6, 11, 6, 's')
    g.hl(5, 12, 7, 's')
    g.hl(5, 12, 8, 's'); g.px(13, 8, 's')
    g.hl(5, 12, 9, 's')
    g.hl(6, 12, 10, 's')
    g.hl(8, 10, 11, 'S')
    g.px(6, 8, 'S'); g.px(6, 9, 'S')  # Ohr
    g.px(12, 9, 'S'); g.px(12, 7, 'S')
    # Auge, Braue
    g.px(10, 8, 'e')
    g.hl(10, 11, 7, 'H')
    # Mund
    m = c.get('mouth', 'smile')
    if m == 'big':
        g.hl(10, 11, 10, 'T'); g.px(9, 10, 'R'); g.px(12, 10, 'R')
    elif m == 'smirk':
        g.px(11, 10, 'R'); g.px(12, 9, 'R')
    else:
        g.hl(10, 11, 10, 'R'); g.px(12, 9, 'S')
    # Wangen
    if c.get('cheek'):
        g.px(9, 9, 'q')


def beard(g, c):
    b = c.get('beard')
    if b == 'stubble':
        for (x, y) in [(6, 10), (7, 10), (11, 10), (7, 9), (8, 11), (10, 11)]:
            if g.get(x, y) in 'sS':
                g.px(x, y, 't')
    elif b == 'full':
        for x in range(6, 12):
            if g.get(x, 10) != 'R' and g.get(x, 10) != 'T':
                g.px(x, 10, 'H')
        g.hl(7, 11, 11, 'H'); g.px(6, 9, 'h'); g.px(7, 9, 'H')


def eyewear(g, c):
    e = c.get('glasses')
    if e == 'round':
        g.px(9, 8, 'Y'); g.px(10, 8, 'e'); g.px(11, 8, 'l'); g.px(12, 8, 'Y')
        g.hl(10, 11, 9, 'Y'); g.hl(7, 8, 8, 'Y')
    elif e == 'black':
        g.hl(9, 12, 7, 'o'); g.px(9, 8, 'o'); g.px(10, 8, 'e'); g.px(11, 8, 'l'); g.px(12, 8, 'o')
        g.hl(7, 8, 7, 'o')
    elif e == 'sun':
        g.hl(9, 12, 7, 'o'); g.hl(9, 11, 8, 'o'); g.px(12, 8, 'o'); g.hl(7, 8, 7, 'o')
        g.px(10, 8, 'Z')


def hair(g, c):
    st = c['hair']
    if st == 'bald':
        g.hl(6, 11, 5, 's'); g.hl(7, 10, 4, 's'); g.px(9, 4, 'w'); g.px(8, 5, 'S')
        g.px(5, 6, 's'); g.px(5, 7, 'S')
        return
    if st == 'curly':
        for (x, y) in [(4, 6), (4, 7), (4, 8), (5, 6), (5, 9), (4, 9), (5, 10), (6, 10), (3, 7), (3, 9)]:
            g.px(x, y, 'h')
        for (x, y) in [(5, 7), (5, 8), (4, 10), (3, 8)]:
            g.px(x, y, 'H')
        g.hl(6, 11, 6, 'h'); g.px(7, 6, 'H'); g.px(10, 6, 'H'); g.px(12, 6, 'h')
    elif st == 'short':
        g.vl(5, 6, 8, 'h'); g.px(4, 7, 'h'); g.px(5, 9, 'H')
        g.hl(6, 10, 6, 'h'); g.px(8, 6, 'H')
    elif st == 'swept':
        g.vl(5, 6, 8, 'h'); g.px(4, 7, 'h'); g.px(5, 9, 'H')
        g.hl(6, 11, 6, 'h'); g.hl(7, 12, 5, 'h'); g.px(13, 5, 'h'); g.px(9, 5, 'H')
    elif st == 'side':
        g.vl(5, 6, 9, 'h'); g.vl(4, 7, 8, 'H'); g.hl(6, 11, 6, 'h'); g.px(11, 6, 'H')
    elif st == 'longm':
        for y in range(6, 14):
            g.px(4, y, 'h'); g.px(5, y, 'h' if y % 3 else 'H')
        g.vl(3, 8, 13, 'H'); g.vl(6, 10, 13, 'h')
        g.hl(6, 11, 6, 'h'); g.px(8, 6, 'H')
    elif st == 'longf':
        for y in range(6, 15):
            g.px(4, y, 'h'); g.px(5, y, 'H' if y % 3 == 0 else 'h')
        g.vl(3, 8, 14, 'h'); g.vl(6, 10, 14, 'h')
        g.hl(6, 11, 6, 'h'); g.px(9, 6, 'H')
        g.vl(12, 7, 11, 'h'); g.vl(13, 9, 12, 'h'); g.px(12, 8, 'H')
    elif st == 'shoulder':
        for y in range(6, 12):
            g.px(4, y, 'h'); g.px(5, y, 'h')
        g.vl(3, 8, 12, 'H'); g.vl(6, 10, 12, 'h')
        g.hl(6, 11, 6, 'h'); g.px(9, 6, 'H')
        g.vl(12, 7, 10, 'h'); g.px(13, 9, 'h'); g.px(13, 10, 'H')


def headgear(g, c):
    hg = c['hat']
    gem = c.get('gem', 'r')
    if hg == 'beret':
        g.hl(7, 12, 1, 'r')
        g.hl(5, 13, 2, 'r')
        g.hl(4, 14, 3, 'r'); g.hl(4, 14, 4, 'r')
        g.hl(5, 13, 5, 'R')
        g.hl(8, 11, 1, 'r'); g.px(12, 2, 'r')
        g.hl(9, 12, 4, 'R'); g.px(14, 4, 'R')
        g.px(11, 2, 'y'); g.px(12, 3, 'y'); g.px(10, 3, 'y'); g.px(11, 4, 'y'); g.px(11, 3, gem)
        # Feder nach hinten
        for (x, y) in [(6, 1), (5, 1), (4, 0), (3, 0), (2, 1), (1, 2), (2, 2), (3, 1), (1, 3), (2, 3), (3, 2)]:
            g.px(x, y, 'w')
        for (x, y) in [(4, 1), (3, 3), (1, 4)]:
            g.px(x, y, 'W')
    elif hg in ('crown', 'capcrown'):
        cap = c.get('cap', 'b')
        if hg == 'capcrown':
            g.hl(6, 11, 1, cap); g.hl(5, 12, 2, cap); g.hl(5, 12, 3, cap)
            g.px(8, 0, 'y'); g.px(9, 0, 'y')
        for x in (5, 7, 9, 11, 12):
            if hg == 'crown':
                g.vl(x if x != 12 else 12, 2, 3, 'y')
        if hg == 'crown':
            for x in (6, 8, 10):
                g.px(x, 3, 'y')
            g.px(5, 1, 'y'); g.px(9, 1, 'y'); g.px(12, 1, 'y')
        else:
            for x in (5, 8, 12):
                g.px(x, 1, 'y'); g.px(x, 2, 'y')
        g.hl(5, 12, 4, 'y'); g.hl(5, 12, 5, 'Y')
        g.px(7, 4, gem); g.px(10, 4, c.get('gem2', gem))
    elif hg == 'cap':
        g.hl(6, 12, 2, 'b')
        g.hl(4, 14, 3, 'b'); g.hl(6, 9, 3, 'u')
        g.hl(4, 14, 4, 'b'); g.px(5, 4, 'u')
        g.hl(5, 12, 5, 'B')
    elif hg == 'tiara':
        g.hl(6, 11, 5, 'y'); g.px(6, 4, 'y'); g.px(8, 3, 'y'); g.px(8, 4, 'y'); g.px(10, 4, 'y'); g.px(11, 4, 'y')
        g.px(8, 5, gem); g.px(10, 5, gem)
    elif hg == 'roses':
        for x, k in zip(range(4, 13), 'gr rgrgr'.replace(' ', 'r') + 'g'):
            g.px(x, 5, k)
        g.px(5, 4, 'r'); g.px(6, 4, 'R'); g.px(9, 4, 'r'); g.px(12, 4, 'r'); g.px(4, 6, 'r'); g.px(3, 7, 'g')
    elif hg == 'none':
        pass


def body_bube(g, c, frame):
    sl1, sl2 = c.get('sleeves', ('r', 'b'))
    panel = c.get('panel', 'w')
    # Halskrause
    g.hl(5, 12, 12, 'w')
    for x in range(5, 13, 2):
        g.px(x, 12, 'W')
    # Ärmel und Wams
    for y in range(13, 18):
        g.px(3, y, sl1); g.px(4, y, sl2)
        g.px(13, y, sl2); g.px(14, y, sl1)
        g.hl(5, 12, y, c.get('tunic', 'r'))
        g.px(6, y, 'y'); g.px(11, y, 'y')
        g.hl(7, 10, y, panel)
    if c.get('tunic2'):
        for y in range(13, 18):
            g.px(5, y, c['tunic2']); g.px(12, y, c['tunic2'])
    for (x, y) in c.get('dots', []):
        g.px(x, y, c.get('dotk', 'r'))
    if c.get('strap'):
        for i, y in enumerate(range(12, 18)):
            g.px(11 - i, y, 'n')
        g.px(8, 15, 'y')
    # Hände
    hand = c.get('hand', 's')
    g.px(3, 18, hand); g.px(13, 17, hand); g.px(14, 17, hand)
    g.hl(4, 13, 18, 'Y')
    # Beine
    if frame == 0:
        g.vl(6, 19, 20, 'B'); g.vl(7, 19, 20, 'B'); g.vl(10, 19, 20, 'B'); g.vl(11, 19, 20, 'B')
        g.hl(5, 7, 21, 'N'); g.hl(10, 12, 21, 'N')
    else:
        g.vl(7, 19, 20, 'B'); g.vl(8, 19, 20, 'B'); g.vl(9, 19, 20, 'B'); g.vl(10, 19, 20, 'B')
        g.hl(6, 8, 21, 'N'); g.hl(9, 11, 21, 'N')


def ermine(g, x0, x1, y, c):
    spot = c.get('spot', 'o')
    g.hl(x0, x1, y, 'w')
    for x in range(x0 + (y % 2), x1 + 1, 3):
        g.px(x, y, spot)


def body_koenig(g, c, frame):
    # Hermelinkragen
    ermine(g, 3, 14, 12, c); ermine(g, 3, 14, 13, c)
    g.px(3, 14, 'w'); g.px(14, 14, 'w'); g.px(4, 14, c.get('spot', 'o'))
    tunic = c.get('tunic', 'b')
    for y in range(14, 21):
        g.hl(3, 14, y, 'r')
        g.hl(6, 11, y, tunic)
        g.px(5, y, 'R'); g.px(12, y, 'R')
    g.vl(8, 14, 19, 'y'); g.vl(9, 14, 19, 'Y')
    g.px(7, 15, 'y'); g.px(10, 17, 'y')
    g.hl(6, 11, 18, 'y')
    g.hl(3, 14, 20, 'R')
    # Hände
    g.px(13, 17, 's'); g.px(14, 17, 's')
    g.px(3, 17, 's')
    # Füße
    if frame == 0:
        g.hl(5, 7, 21, 'N'); g.hl(10, 12, 21, 'N')
    else:
        g.hl(7, 11, 21, 'N')
    # Reichsapfel oder Schild in der hinteren Hand
    pass


def body_dame(g, c, frame):
    bod = c.get('bodice', 'r')
    # Kette
    g.hl(6, 11, 12, 's')
    for x in (6, 8, 10):
        g.px(x, 12, 'w')
    g.px(9, 13, c.get('pend', 'r'))
    # Hermelin-Revers und Mieder
    for y in range(13, 18):
        g.hl(3, 14, y, 'r')
        g.hl(7, 10, y, bod)
        g.px(5, y, 'w'); g.px(6, y, 'w'); g.px(11, y, 'w'); g.px(12, y, 'w')
    for y in (14, 16):
        g.px(5, y, c.get('spot', 'o')); g.px(12, y, c.get('spot', 'o'))
    for (x, y) in c.get('dots', []):
        g.px(x, y, c.get('dotk', 'r'))
    g.px(9, 13, c.get('pend', 'r'))
    g.px(3, 14, 'b'); g.px(14, 14, 'b'); g.px(3, 16, 'y'); g.px(14, 16, 'y')
    # Rock
    off = 0 if frame == 0 else 1
    g.hl(3 + off, 14 + off, 18, 'r'); g.hl(2 + off, 14 + off, 19, 'r'); g.hl(2 + off, 15 + off, 20, 'r')
    g.hl(2 + off, 15 + off, 21, 'R')
    g.px(8 + off, 19, 'y'); g.px(5 + off, 20, 'y'); g.px(12 + off, 20, 'y')
    # Hände
    g.px(13, 17, 's'); g.px(14, 17, 's'); g.px(3, 18, 's')


def item(g, c):
    it = c['item']
    if it == 'halberd':
        pole = c.get('pole', 'n')
        g.vl(15, 3, 21, pole)
        blade = c.get('blade', 'b')
        for (x, y) in [(16, 4), (17, 4), (16, 5), (17, 5), (18, 5), (16, 6), (17, 6), (18, 6), (16, 7), (17, 7), (16, 8)]:
            g.px(x, y, blade)
        g.px(17, 5, 'w')
        g.px(17, 6, c.get('pip', 'r'))
        g.px(14, 6, 'y'); g.px(14, 5, 'y')
        g.vl(15, 0, 2, 'y'); g.px(15, 2, 'Y')
        if c.get('tassel'):
            g.vl(16, 10, 12, 'r')
    elif it == 'spear':
        g.vl(15, 4, 21, 'y'); g.vl(16, 6, 20, 'Y')
        g.px(15, 0, 'y'); g.hl(14, 16, 1, 'y'); g.hl(14, 16, 2, 'y'); g.px(15, 3, 'y')
        g.px(15, 1, 'r'); g.px(15, 2, 'r')
    elif it == 'scepter':
        g.vl(15, 6, 20, 'y'); g.vl(16, 8, 19, 'Y')
        top = c.get('top', 'fleur')
        if top == 'heart':
            g.px(14, 3, 'r'); g.px(16, 3, 'r'); g.hl(14, 16, 4, 'r'); g.px(15, 5, 'r'); g.px(13, 4, 'y'); g.px(17, 4, 'y')
        elif top == 'spade':
            g.px(15, 2, 'o'); g.hl(14, 16, 3, 'o'); g.hl(14, 16, 4, 'o'); g.px(15, 5, 'y'); g.px(13, 3, 'y'); g.px(17, 3, 'y')
        else:
            g.px(15, 2, 'y'); g.hl(14, 16, 3, 'y'); g.px(13, 4, 'y'); g.px(17, 4, 'y'); g.px(15, 4, 'b'); g.px(15, 5, 'y')
    elif it == 'flower':
        col = c.get('bloom', 'r')
        g.vl(15, 9, 17, 'g')
        g.px(16, 12, 'g'); g.px(14, 13, 'g'); g.px(17, 11, 'G')
        g.hl(14, 16, 6, col); g.hl(14, 16, 7, col); g.hl(14, 16, 8, col)
        g.px(15, 5, col); g.px(13, 7, col); g.px(17, 7, col)
        g.px(15, 7, 'y' if col == 'w' else 'R')


CHARS = {
    'herz-bube': dict(role='bube', hair='curly', h='#a87a4a', H='#6e4a28', hat='beret', gem='r', glasses='round', beard='stubble', mouth='smile',
                      sleeves=('r', 'b'), tunic='r', tunic2='b', panel='w', dots=[(8, 14), (9, 14), (8, 16), (9, 16)], item='halberd', blade='b', pip='r'),
    'karo-bube': dict(role='bube', hair='short', h='#b08a5a', H='#7a5a34', hat='beret', gem='r', glasses='sun', beard='stubble', mouth='smirk',
                      sleeves=('b', 'y'), tunic='r', tunic2='b', panel='y', dots=[(8, 14), (9, 16)], strap=True, item='spear'),
    'pik-bube': dict(role='bube', hair='bald', h='#c8a07a', H='#9a7050', hat='none', beard='stubble', mouth='smile',
                     sleeves=('r', 'b'), tunic='g', panel='g', dots=[(8, 14), (9, 16)], dotk='y', hand='z', item='halberd', pole='y', blade='b', pip='o'),
    'herz-dame': dict(role='dame', hair='short', h='#b8925a', H='#8a6a3a', hat='crown', gem='r', mouth='big', bodice='r', pend='r', item='flower', bloom='r'),
    'karo-dame': dict(role='dame', hair='shoulder', h='#e0b860', H='#b08840', hat='crown', gem='r', mouth='smile', cheek=True, bodice='w', pend='r',
                      dots=[(8, 14), (9, 15), (8, 16)], item='flower', bloom='r'),
    'kreuz-dame': dict(role='dame', hair='longm', h='#8a5a34', H='#5a3820', hat='roses', beard='full', mouth='smile', bodice='r', pend='r',
                       dots=[(8, 14), (9, 16)], dotk='y', item='flower', bloom='r'),
    'pik-dame': dict(role='dame', hair='longf', h='#d8a860', H='#a87838', hat='crown', gem='b', mouth='smile', cheek=True, bodice='b', pend='r', item='flower', bloom='w'),
    'herz-koenig': dict(role='koenig', hair='side', h='#8a6038', H='#5a3c20', hat='capcrown', cap='b', gem='r', glasses='black', mouth='smirk',
                        tunic='b', orb='r', item='scepter', top='heart'),
    'karo-koenig': dict(role='koenig', hair='short', h='#7a5a3a', H='#4e3820', hat='capcrown', cap='r', gem='b', mouth='smirk', beard='stubble',
                        tunic='b', spot='r', orb='b', item='scepter', top='fleur'),
    'kreuz-koenig': dict(role='koenig', hair='swept', h='#c09050', H='#8a6030', hat='crown', gem='b', gem2='r', mouth='big', beard='stubble',
                         tunic='b', shield=True, item='scepter', top='fleur'),
    'pik-koenig': dict(role='koenig', hair='swept', h='#d8b070', H='#a88040', hat='capcrown', cap='b', gem='r', mouth='smirk',
                       tunic='b', orb='b', item='scepter', top='fleur'),
    'kreuz-bube': dict(role='bube', hair='short', h='#d4863a', H='#9a5424', hat='cap', mouth='big', beard='stubble',
                       sleeves=('b', 'y'), tunic='r', panel='b', dots=[(8, 14), (9, 14), (8, 16), (9, 16)], dotk='y',
                       item='halberd', blade='y', pip='o', tassel=True),
    'naunin-stand': dict(role='bube', hair='short', h='#d4863a', H='#9a5424', hat='cap', mouth='big', beard='stubble',
                         sleeves=('b', 'y'), tunic='r', panel='b', dots=[(8, 14), (9, 14), (8, 16), (9, 16)], dotk='y', item='none'),
}


def build(cid, frame):
    c = CHARS[cid]
    g = Grid()
    if c['role'] == 'bube':
        body_bube(g, c, frame)
    elif c['role'] == 'dame':
        body_dame(g, c, frame)
    else:
        body_koenig(g, c, frame)
    hair_back_first = c['hair'] in ('longm', 'longf', 'shoulder')
    if hair_back_first:
        hair(g, c)
    face(g, c)
    beard(g, c)
    if not hair_back_first:
        hair(g, c)
    else:
        # vordere Strähne über Gesichtsrand
        if c['hair'] in ('longf', 'shoulder'):
            g.vl(12, 7, 9, 'h')
    eyewear(g, c)
    headgear(g, c)
    item(g, c)
    g.outline()
    return g.rows()


if __name__ == '__main__':
    out = {}
    for cid, c in CHARS.items():
        out[cid] = {'A': build(cid, 0), 'B': build(cid, 1), 'h': c['h'], 'H': c['H']}
    json.dump(out, open('/home/claude/skat/dev/chars.json', 'w'))
    # Vorschau
    from PIL import Image
    P = {'o': '#1b1427', 'e': '#1b1427', 's': '#f3c99b', 'S': '#d79a6c', 't': '#b8805a', 'r': '#d63c3c', 'R': '#8e2431',
         'b': '#2f4aa0', 'B': '#1e2f6e', 'y': '#f5c542', 'Y': '#b9852a', 'w': '#f4ead2', 'W': '#cbbd9b', 'g': '#2f8a4c',
         'G': '#1d5a33', 'u': '#4a6ad0', 'z': '#a4a2b4', 'Z': '#5a5870', 'n': '#9a6238', 'N': '#4a3226', 'T': '#fbf6ea', 'q': '#ec9c88', 'l': '#bfe0ff'}
    S = 8
    ids = list(CHARS)
    img = Image.new('RGB', (len(ids) * (W * S + 12) + 12, 2 * (H * S + 12) + 12), '#5a8f3c')
    for i, cid in enumerate(ids):
        for f, key in enumerate(['A', 'B']):
            pal = dict(P); pal['h'] = out[cid]['h']; pal['H'] = out[cid]['H']
            for y, row in enumerate(out[cid][key]):
                for x, k in enumerate(row):
                    if k != '.':
                        col = pal[k]
                        for dy in range(S):
                            for dx in range(S):
                                img.putpixel((12 + i * (W * S + 12) + x * S + dx, 12 + f * (H * S + 12) + y * S + dy), tuple(int(col[j:j + 2], 16) for j in (1, 3, 5)))
    img.save('/home/claude/skat/dev/chars.png')
    print('ok', img.size)


# ---------------- Kriechender Zombie (28x16) ----------------
CW, CH = 28, 16


def crawl(cid, frame, walk_rows):
    c = CHARS[cid]
    g = [['.'] * CW for _ in range(CH)]

    def px(x, y, k):
        if 0 <= x < CW and 0 <= y < CH:
            g[y][x] = k

    main = c.get('tunic', 'r') if c['role'] == 'bube' else 'r'
    dark = {'r': 'R', 'g': 'G', 'b': 'B'}[main]
    # Körper
    for x in range(5, 21): px(x, 11, main)
    for x in range(3, 22): px(x, 12, main)
    for x in range(3, 22): px(x, 13, dark)
    px(10, 12, 'y'); px(15, 12, 'y'); px(10, 11, 'y')
    # Kragen
    if c['role'] == 'bube':
        for x in range(17, 21): px(x, 11, 'w')
    else:
        for x in range(14, 21): px(x, 11, 'w')
        for x in range(15, 21, 3): px(x, 11, c.get('spot', 'o'))
    # Beine
    if frame == 0:
        for x in range(1, 4): px(x, 12, 'B'); px(x, 13, 'B')
        px(0, 12, 'N'); px(0, 13, 'N'); px(0, 14, 'N'); px(1, 14, 'N')
    else:
        for x in range(1, 4): px(x, 12, 'B')
        px(1, 11, 'B'); px(0, 10, 'N'); px(0, 11, 'N'); px(2, 13, 'B')
    # Arm
    if frame == 0:
        for x in range(21, 26): px(x, 13, main)
        px(26, 13, 's'); px(26, 14, 's'); px(25, 14, 's')
    else:
        for x in range(21, 26): px(x, 12, main)
        px(26, 11, 's'); px(26, 12, 's'); px(25, 11, 's')
    # Kopf aus der Laufgrafik (ohne Gegenstand)
    for y in range(0, 13):
        row = walk_rows[y]
        for x in range(0, 15):
            k = row[x]
            if k not in '.o':
                px(x + 12, y - 1, k)
    # Kontur
    src = [r[:] for r in g]
    for y in range(CH):
        for x in range(CW):
            if src[y][x] == '.':
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < CW and 0 <= yy < CH and src[yy][xx] not in '.o':
                        g[y][x] = 'o'
                        break
    return [''.join(r) for r in g]


if __name__ == '__main__':
    data = json.load(open('/home/claude/skat/dev/chars.json'))
    for cid in CHARS:
        data[cid]['cA'] = crawl(cid, 0, data[cid]['A'])
        data[cid]['cB'] = crawl(cid, 1, data[cid]['B'])
        data[cid]['role'] = CHARS[cid]['role']
    json.dump(data, open('/home/claude/skat/dev/chars.json', 'w'))
    from PIL import Image
    P = {'o': '#1b1427', 'e': '#ff4a4a', 's': '#93c46c', 'S': '#5f8f48', 't': '#4f7a3a', 'r': '#a05050', 'R': '#6a3038',
         'b': '#4a5a8a', 'B': '#2e3858', 'y': '#c8a85a', 'Y': '#8a7040', 'w': '#c8c4b0', 'W': '#9a9682', 'g': '#4a7a4a',
         'G': '#2e5030', 'u': '#6a7aa0', 'z': '#a4a2b4', 'Z': '#5a5870', 'n': '#7a5a40', 'N': '#3a2a22', 'T': '#e0dccc', 'q': '#93c46c', 'l': '#a0b0c0'}
    S = 6
    ids = list(CHARS)
    img = Image.new('RGB', (4 * (CW * S + 10) + 10, 8 * (CH * S + 10) + 10), '#34402a')
    for i, cid in enumerate(ids):
        for f, key in enumerate(['cA', 'cB']):
            if f: continue
            pal = dict(P); pal['h'] = '#5a6a40'; pal['H'] = '#3a4a2a'
            ox = 10 + (i % 4) * (CW * S + 10); oy = 10 + (i // 4) * (CH * S + 10) * 2
            for k2, key2 in enumerate(['cA', 'cB']):
                for y, row in enumerate(data[cid][key2]):
                    for x, k in enumerate(row):
                        if k != '.':
                            col = pal[k]
                            for dy in range(S):
                                for dx in range(S):
                                    img.putpixel((ox + x * S + dx, oy + k2 * (CH * S + 4) + y * S + dy), tuple(int(col[j:j + 2], 16) for j in (1, 3, 5)))
    img.save('/home/claude/skat/dev/crawl.png')
    print('crawl ok')
