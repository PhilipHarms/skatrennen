"""Portraits 43x38 im Stil von Naunins Karte, aus Bausteinen zusammengesetzt."""
import json

W, H = 43, 38


class G:
    def __init__(self):
        self.g = [['.'] * W for _ in range(H)]

    def px(self, x, y, k):
        if 0 <= x < W and 0 <= y < H:
            self.g[y][x] = k

    def get(self, x, y):
        return self.g[y][x] if 0 <= x < W and 0 <= y < H else '.'

    def hl(self, x0, x1, y, k):
        for x in range(x0, x1 + 1):
            self.px(x, y, k)

    def vl(self, x, y0, y1, k):
        for y in range(y0, y1 + 1):
            self.px(x, y, k)

    def rect(self, x0, y0, x1, y1, k):
        for y in range(y0, y1 + 1):
            self.hl(x0, x1, y, k)


FACE = {8: (12, 27), 9: (11, 28), 10: (11, 28), 11: (11, 28), 12: (11, 28), 13: (11, 28), 14: (11, 28), 15: (11, 28),
        16: (11, 28), 17: (12, 27), 18: (12, 27), 19: (13, 26), 20: (14, 25), 21: (16, 23)}


# ---------- Körper ----------
def body_bube(g, c):
    s1, s2 = c.get('sleeves', ('r', 'b'))
    for y in range(26, 38):
        x0 = 1 if y > 28 else 3 + (28 - y)
        for x in range(x0, 11):
            g.px(x, y, ['y', s1, s2, s1][((x + (y // 3)) // 2) % 4])
    tun = c.get('tunic', 'r')
    dark = {'r': 'R', 'g': 'G', 'b': 'B'}[tun]
    g.rect(10, 25, 30, 37, tun)
    for y in range(25, 38):
        g.px(10, y, dark); g.px(30, y, dark)
    g.vl(12, 25, 37, 'y'); g.vl(13, 26, 37, 'Y'); g.vl(27, 25, 37, 'y'); g.vl(26, 26, 37, 'Y')
    pan = c.get('panel', 'b')
    g.rect(15, 25, 24, 37, pan)
    pdark = {'b': 'B', 'w': 'W', 'y': 'Y', 'r': 'R', 'g': 'G'}[pan]
    g.vl(15, 25, 37, pdark); g.vl(24, 25, 37, pdark)
    for (x, y) in c.get('pdots', []):
        g.px(x, y, c.get('pdotk', 'r'))
    for y in range(27, 38):
        g.hl(29, 31 if y < 30 else 32, y, tun)
    if c.get('strap'):
        for i, y in enumerate(range(22, 38)):
            g.px(29 - i, y, 'n'); g.px(30 - i, y, 'N')
        g.rect(19, 30, 21, 32, 'y'); g.px(20, 31, 'N')
    # Halskrause
    for y in range(22, 26):
        g.hl(9 if y > 22 else 11, 30 if y > 22 else 28, y, 'w')
    for x in range(9, 31):
        if x % 3 == 0: g.px(x, 25, 'W'); g.px(x, 23, 'W')
        if x % 3 == 1: g.px(x, 24, 'W')
    g.hl(10, 29, 26, 'W')
    for x in range(10, 30, 3): g.px(x, 26, 'w')
    if c.get('pip'):
        pip(g, c['pip'], 18, 28, c.get('pipk', 'r'))
        pip(g, c['pip'], 18, 33, c.get('pipk', 'r'))


def ermine(g, x0, x1, y0, y1, spot):
    g.rect(x0, y0, x1, y1, 'w')
    for y in range(y0, y1 + 1):
        if (y - y0) % 4 != 1: continue
        off = 1 if ((y - y0) // 4) % 2 else 3
        for x in range(x0 + off, x1, 4):
            g.px(x, y, spot); g.px(x, y + 1, spot); g.px(x - 1, y + 2, spot); g.px(x + 1, y + 2, spot)


def body_dame(g, c):
    bod = c.get('bodice', 'r')
    g.rect(1, 25, 41, 37, 'r')
    for y in range(25, 38):
        g.px(1, y, 'R')
    g.rect(1, 30, 6, 37, 'b'); g.vl(7, 30, 37, 'y')
    # Dekolleté und Hals
    g.rect(14, 20, 25, 25, 'S'); g.rect(15, 22, 24, 25, 's')
    # Hermelinkragen
    ermine(g, 7, 13, 23, 37, c.get('spot', 'o'))
    ermine(g, 26, 32, 23, 37, c.get('spot', 'o'))
    # Mieder
    g.rect(14, 26, 25, 37, bod)
    g.hl(14, 25, 26, 'y'); g.vl(14, 26, 37, 'y'); g.vl(25, 26, 37, 'y')
    for (x, y) in c.get('pdots', []):
        g.px(x, y, c.get('pdotk', 'r'))
    if c.get('pip'):
        pip(g, c['pip'], 18, 29, c.get('pipk', 'r'))
        pip(g, c['pip'], 18, 33, c.get('pipk', 'r'))
    # Perlenkette
    for x in range(15, 25):
        if x % 2: g.px(x, 23, 'w')
    g.px(15, 22, 'w'); g.px(24, 22, 'w')
    g.rect(19, 24, 20, 25, c.get('pend', 'r')); g.px(19, 24, 'y'); g.px(20, 24, 'y')


def body_koenig(g, c):
    g.rect(1, 24, 41, 37, 'r')
    for y in range(24, 38): g.px(1, y, 'R')
    g.rect(12, 25, 27, 37, c.get('tunic', 'b'))
    ermine(g, 3, 36, 22, 26, c.get('spot', 'o'))
    ermine(g, 3, 10, 27, 37, c.get('spot', 'o'))
    ermine(g, 29, 34, 27, 33, c.get('spot', 'o'))
    # goldene Kette
    for i, x in enumerate(range(12, 20)):
        g.px(x, 27 + i // 2, 'y')
    for i, x in enumerate(range(27, 19, -1)):
        g.px(x, 27 + i // 2, 'y')
    g.rect(18, 31, 21, 33, 'y'); g.px(19, 32, c.get('gem', 'r')); g.px(20, 32, c.get('gem', 'r'))
    g.vl(19, 34, 37, 'Y'); g.vl(20, 34, 37, 'y')
    g.rect(15, 20, 24, 22, 'S')


def pip(g, kind, ox, oy, k):
    rows = {
        'club': ['.XX.', 'XXXX', '.XX.', '.XX.'],
        'heart': ['X..X', 'XXXX', '.XX.', '....'],
        'diam': ['.XX.', 'XXXX', '.XX.', '....'],
        'spade': ['.XX.', 'XXXX', 'XXXX', '.XX.'],
    }[kind]
    for yy, r in enumerate(rows):
        for xx, ch in enumerate(r):
            if ch == 'X': g.px(ox + xx, oy + yy, k)


# ---------- Kopf ----------
def face(g, c):
    g.rect(15, 20, 24, 22, 'S')
    for y, (a, b) in FACE.items():
        g.hl(a, b, y, 's')
    for y in range(9, 20):
        g.px(FACE[y][1], y, 'S')
    g.vl(10, 12, 15, 's'); g.vl(29, 12, 15, 'S'); g.px(10, 13, 'S'); g.px(29, 13, 's')
    # Brauen, Augen
    g.hl(14, 17, 11, 'H'); g.hl(22, 25, 11, 'H')
    g.hl(14, 17, 12, 'o'); g.hl(22, 25, 12, 'o')
    for x, k in zip(range(14, 18), 'wiew'): g.px(x, 13, k)
    for x, k in zip(range(22, 26), 'wiew'): g.px(x, 13, k)
    if c.get('lashes'):
        g.px(13, 11, 'o'); g.px(26, 11, 'o')
    # Nase
    g.vl(20, 13, 16, 'S'); g.px(19, 16, 'S'); g.px(21, 16, 'S')
    if c.get('cheek', True):
        g.px(13, 16, 'q'); g.px(14, 16, 'q'); g.px(25, 16, 'q'); g.px(26, 16, 'q')
    m = c.get('mouth', 'smile')
    if m == 'big':
        g.px(14, 17, 'm'); g.px(25, 17, 'm'); g.hl(15, 24, 18, 'm'); g.hl(16, 23, 18, 'T')
        g.px(15, 18, 'm'); g.px(24, 18, 'm'); g.hl(16, 23, 19, 'm'); g.hl(17, 22, 20, 'R')
    elif m == 'smirk':
        g.hl(16, 22, 19, 'm'); g.px(23, 18, 'm'); g.px(24, 17, 'm'); g.hl(17, 21, 20, 'R')
    else:
        g.px(15, 18, 'm'); g.hl(16, 23, 19, 'm'); g.px(24, 18, 'm'); g.hl(17, 22, 20, 'R')
    if c.get('lipstick'):
        g.hl(17, 22, 19, 'r')


def beard(g, c):
    b = c.get('beard')
    if b == 'stubble':
        for (x, y) in [(15, 20), (24, 20), (17, 21), (20, 21), (22, 21), (19, 21), (13, 18), (26, 18), (14, 19), (25, 19)]:
            if g.get(x, y) in 'sS': g.px(x, y, 't')
    elif b == 'full':
        for y in range(16, 23):
            a, bb = FACE.get(y, (16, 23))
            for x in range(a, bb + 1):
                if g.get(x, y) in 'sStq': g.px(x, y, 'H' if (x + y) % 3 else 'h')
        g.hl(15, 24, 22, 'H'); g.hl(17, 22, 23, 'H')
        g.hl(15, 24, 17, 'h')
        g.hl(16, 23, 19, 'm'); g.hl(17, 22, 20, 'R')


def hair_back(g, c):
    st = c['hair']
    if st in ('longm', 'longf'):
        bottom = 27 if st == 'longm' else 30
        for y in range(9, bottom + 1):
            for x in (7, 8, 9, 10):
                g.px(x, y, 'H' if (x + y) % 4 == 0 else 'h')
            for x in (29, 30, 31, 32):
                g.px(x, y, 'H' if (x + y) % 4 == 1 else 'h')
        if st == 'longf':
            for y in range(24, 31, 2):
                g.px(6, y, 'h'); g.px(33, y + 1, 'h')
    elif st == 'shoulder':
        for y in range(9, 24):
            for x in (8, 9, 10):
                g.px(x, y, 'H' if (x + y) % 4 == 0 else 'h')
            for x in (29, 30, 31):
                g.px(x, y, 'H' if (x + y) % 4 == 1 else 'h')
        g.hl(8, 11, 24, 'h'); g.hl(28, 31, 24, 'h')


def hair_front(g, c):
    st = c['hair']
    if st == 'bald':
        g.hl(14, 25, 5, 's'); g.hl(12, 27, 6, 's'); g.hl(11, 28, 7, 's')
        g.px(15, 6, 'w'); g.px(16, 6, 'w'); g.px(16, 5, 'w')
        for y in range(5, 9): g.px(FACE[9][1], y, 'S') if y > 6 else None
        g.vl(11, 9, 13, 'H'); g.vl(28, 9, 13, 'H')
        return
    if st == 'short':
        g.hl(11, 28, 8, 'h')
        for x in range(13, 27, 3): g.px(x, 9, 'h'); g.px(x + 1, 9, 'h')
        g.vl(11, 9, 13, 'h'); g.vl(12, 9, 11, 'h'); g.vl(28, 9, 13, 'h'); g.vl(27, 9, 11, 'h')
        g.vl(11, 14, 15, 'H'); g.vl(28, 14, 15, 'H')
        g.px(10, 9, 'h'); g.px(10, 10, 'h'); g.px(10, 11, 'H'); g.px(29, 9, 'h'); g.px(29, 10, 'h'); g.px(29, 11, 'H')
        if not c.get('hat_covers'):
            g.hl(12, 27, 7, 'h'); g.hl(14, 25, 6, 'h'); g.px(16, 7, 'H'); g.px(22, 7, 'H')
    elif st == 'curly':
        g.hl(11, 28, 8, 'h'); g.hl(12, 27, 9, 'h')
        for x in range(12, 28, 2): g.px(x, 9, 'H'); g.px(x + 1, 10, 'h')
        for y in range(7, 17):
            for x in (8, 9, 10, 11):
                g.px(x, y, 'h' if (x + y) % 2 else 'H')
            for x in (28, 29, 30, 31):
                g.px(x, y, 'h' if (x + y) % 2 else 'H')
        for (x, y) in [(7, 9), (7, 12), (7, 15), (32, 10), (32, 13), (32, 16), (9, 17), (30, 17)]:
            g.px(x, y, 'h')
    elif st == 'side':
        g.hl(11, 28, 8, 'h'); g.hl(12, 27, 7, 'h'); g.hl(16, 27, 9, 'h'); g.hl(21, 27, 10, 'h')
        g.vl(15, 7, 8, 'H')
        g.vl(11, 9, 14, 'h'); g.vl(12, 9, 10, 'h'); g.vl(28, 9, 13, 'h')
        g.px(10, 10, 'h'); g.px(10, 11, 'h'); g.px(29, 10, 'h')
    elif st == 'swept':
        g.hl(14, 27, 3, 'h'); g.hl(12, 29, 4, 'h'); g.hl(11, 29, 5, 'h'); g.hl(11, 28, 6, 'h'); g.hl(11, 28, 7, 'h'); g.hl(11, 28, 8, 'h')
        for x in range(13, 28, 3): g.px(x, 4, 'H'); g.px(x + 1, 5, 'H'); g.px(x + 2, 6, 'H')
        g.px(29, 3, 'h'); g.px(30, 4, 'h')
        g.vl(11, 9, 13, 'h'); g.vl(28, 9, 12, 'h'); g.px(10, 10, 'h'); g.px(29, 10, 'h')
        g.vl(11, 14, 15, 'H'); g.vl(28, 13, 15, 'H')
    elif st in ('longm', 'longf', 'shoulder'):
        g.hl(11, 28, 8, 'h'); g.hl(12, 27, 7, 'h'); g.hl(14, 25, 6, 'h')
        g.vl(11, 9, 16, 'h'); g.vl(28, 9, 16, 'h'); g.vl(12, 9, 11, 'h'); g.vl(27, 9, 11, 'h')
        g.px(19, 7, 'H'); g.px(19, 8, 'H'); g.px(20, 8, 'H')
        g.hl(13, 18, 9, 'h'); g.hl(21, 26, 9, 'h')


def headgear(g, c):
    hg = c.get('hat', 'none')
    gem = c.get('gem', 'r')
    if hg == 'beret':
        g.hl(13, 27, 1, 'r'); g.hl(10, 30, 2, 'r'); g.hl(9, 31, 3, 'r'); g.hl(9, 31, 4, 'r'); g.hl(9, 31, 5, 'r')
        g.hl(10, 30, 6, 'R'); g.hl(11, 29, 7, 'R')
        g.hl(15, 21, 2, 'q'); g.hl(13, 17, 3, 'q')
        for x in range(21, 32): g.px(x, 5, 'R')
        g.rect(24, 3, 27, 6, 'y'); g.rect(25, 4, 26, 5, gem)
        # Feder
        for (x, y) in [(11, 1), (10, 0), (9, 0), (8, 0), (7, 0), (6, 1), (5, 1), (4, 2), (3, 3), (2, 4), (2, 5), (8, 1), (7, 1), (6, 2), (5, 2), (4, 3), (3, 4), (5, 3), (4, 4), (3, 5)]:
            g.px(x, y, 'w')
        for (x, y) in [(9, 1), (6, 3), (4, 5), (2, 6)]:
            g.px(x, y, 'W')
    elif hg == 'crown':
        g.hl(11, 28, 6, 'y'); g.hl(11, 28, 7, 'Y')
        for x in (11, 15, 19, 20, 24, 28):
            g.vl(x, 3, 5, 'y')
        for x in (12, 16, 23, 27):
            g.px(x, 5, 'y')
        for x in (11, 15, 24, 28):
            g.px(x, 2, 'y')
        g.px(19, 1, 'y'); g.px(20, 1, 'y'); g.hl(18, 21, 2, 'y')
        g.px(14, 6, gem); g.px(19, 6, c.get('gem2', gem)); g.px(20, 6, c.get('gem2', gem)); g.px(25, 6, gem)
    elif hg == 'capcrown':
        cap = c.get('cap', 'b')
        capd = {'b': 'B', 'r': 'R'}[cap]
        g.hl(14, 25, 1, cap); g.hl(12, 27, 2, cap); g.hl(11, 28, 3, cap); g.hl(11, 28, 4, cap); g.hl(11, 28, 5, capd)
        g.hl(15, 18, 2, 'u' if cap == 'b' else 'q')
        g.hl(11, 28, 6, 'y'); g.hl(11, 28, 7, 'Y')
        for x in (11, 19, 20, 28):
            g.vl(x, 3, 5, 'y')
        for x in (10, 12, 18, 21, 27, 29):
            g.px(x, 4, 'y')
        g.vl(19, 0, 2, 'y'); g.vl(20, 0, 2, 'y'); g.hl(18, 21, 1, 'y')
        g.px(14, 6, gem); g.px(25, 6, gem); g.px(19, 6, 'b' if gem == 'r' else 'r'); g.px(20, 6, 'b' if gem == 'r' else 'r')
    elif hg == 'roses':
        for x in range(10, 30):
            g.px(x, 7, 'g' if x % 3 else 'G')
        for (x, y) in [(10, 5), (14, 4), (19, 4), (24, 4), (28, 5)]:
            g.rect(x, y, x + 2, y + 2, 'r'); g.px(x + 1, y + 1, 'R'); g.px(x + 2, y, 'q')
        g.px(9, 8, 'g'); g.px(30, 8, 'g')
    elif hg == 'cap':
        cap = {1: (13, 26), 2: (10, 29), 3: (8, 31), 4: (7, 32), 5: (7, 32), 6: (8, 31)}
        for y, (a, b) in cap.items(): g.hl(a, b, y, 'u')
        g.hl(9, 30, 7, 'U'); g.hl(8, 31, 6, 'U')


def eyewear(g, c):
    e = c.get('glasses')
    if e == 'round':
        for (cx0) in (13, 21):
            g.hl(cx0 + 1, cx0 + 4, 11, 'y'); g.hl(cx0 + 1, cx0 + 4, 14, 'y')
            g.vl(cx0, 12, 13, 'y'); g.vl(cx0 + 5, 12, 13, 'y')
        g.hl(19, 20, 12, 'y'); g.px(12, 12, 'y'); g.px(11, 12, 'Y'); g.px(27, 12, 'Y'); g.px(28, 12, 'Y')
    elif e == 'black':
        for cx0 in (13, 21):
            g.hl(cx0, cx0 + 5, 11, 'o'); g.hl(cx0, cx0 + 5, 14, 'o')
            g.vl(cx0, 11, 14, 'o'); g.vl(cx0 + 5, 11, 14, 'o')
        g.hl(19, 20, 12, 'o'); g.hl(11, 12, 12, 'o'); g.hl(27, 28, 12, 'o')
        g.px(17, 12, 'l'); g.px(25, 12, 'l')
    elif e == 'sun':
        for cx0 in (13, 21):
            g.rect(cx0, 11, cx0 + 5, 14, 'k'); g.hl(cx0, cx0 + 5, 11, 'o')
            g.px(cx0 + 1, 12, 'l')
        g.hl(19, 20, 12, 'o'); g.hl(11, 12, 12, 'o'); g.hl(27, 28, 12, 'o')


def hand(g, c):
    sk = c.get('handk', 's')
    g.rect(31, 27, 36, 30, sk); g.vl(36, 27, 30, 'S' if sk == 's' else 'Z'); g.hl(31, 36, 30, 'S' if sk == 's' else 'Z')
    g.hl(30, 37, 31, 'w'); g.hl(30, 37, 32, 'W')
    if c['role'] == 'bube':
        g.rect(31, 33, 37, 37, c.get('tunic', 'r')); g.vl(37, 33, 37, {'r': 'R', 'g': 'G', 'b': 'B'}[c.get('tunic', 'r')])


def item(g, c):
    it = c['item']
    if it == 'halberd':
        pole = 'p' if c.get('pole', 'wood') == 'wood' else 'y'
        poled = 'P' if pole == 'p' else 'Y'
        g.vl(34, 4, 37, pole); g.vl(35, 4, 37, poled)
        g.px(34, 0, 'y'); g.px(35, 0, 'y'); g.hl(33, 36, 1, 'y'); g.hl(34, 35, 2, 'y'); g.hl(33, 36, 3, 'Y')
        blade = c.get('blade', 'b')
        bl = {3: (36, 37), 4: (36, 39), 5: (36, 40), 6: (36, 41), 7: (36, 41), 8: (36, 41), 9: (36, 41), 10: (36, 41), 11: (36, 40), 12: (36, 39), 13: (36, 37)}
        for y, (a, b) in bl.items(): g.hl(a, b, y, blade)
        for y, (a, b) in bl.items(): g.px(b, y, {'b': 'B', 'y': 'Y'}[blade])
        pip(g, c.get('bpip', 'heart'), 37, 6, c.get('bpipk', 'r'))
        g.px(33, 7, 'y'); g.px(32, 8, 'y'); g.px(33, 8, 'y'); g.px(33, 9, 'y')
    elif it == 'spear':
        g.vl(34, 8, 37, 'y'); g.vl(35, 8, 37, 'Y')
        sp = {0: (34, 35), 1: (33, 36), 2: (32, 37), 3: (32, 37), 4: (33, 36), 5: (33, 36), 6: (34, 35), 7: (34, 35)}
        for y, (a, b) in sp.items(): g.hl(a, b, y, 'y')
        g.rect(34, 2, 35, 4, 'r')
        g.hl(32, 37, 8, 'Y')
    elif it == 'scepter':
        g.vl(34, 9, 37, 'y'); g.vl(35, 9, 37, 'Y')
        g.hl(33, 36, 12, 'y'); g.hl(33, 36, 18, 'y')
        top = c.get('top', 'fleur')
        if top == 'heart':
            g.rect(32, 3, 37, 6, 'r'); g.px(32, 3, '.'); g.px(37, 3, '.'); g.px(34, 3, 'r'); g.px(35, 3, '.')
            g.hl(33, 36, 7, 'r'); g.hl(34, 35, 8, 'r'); g.px(33, 4, 'q')
            g.px(31, 5, 'y'); g.px(38, 5, 'y'); g.px(34, 1, 'y'); g.px(35, 1, 'y'); g.hl(34, 35, 2, 'y')
        elif top == 'spade':
            g.hl(34, 35, 2, 'o'); g.hl(33, 36, 3, 'o'); g.hl(32, 37, 4, 'o'); g.hl(32, 37, 5, 'o'); g.hl(33, 36, 6, 'o'); g.hl(34, 35, 7, 'y')
            g.px(31, 4, 'y'); g.px(38, 4, 'y')
        else:
            g.hl(34, 35, 1, 'y'); g.hl(33, 36, 2, 'y'); g.hl(34, 35, 3, 'y')
            g.hl(31, 32, 3, 'y'); g.hl(37, 38, 3, 'y'); g.px(31, 4, 'y'); g.px(38, 4, 'y'); g.px(32, 5, 'y'); g.px(37, 5, 'y')
            g.hl(33, 36, 4, 'y'); g.hl(33, 36, 5, 'y'); g.px(34, 4, 'b'); g.px(35, 4, 'b')
            g.hl(32, 37, 6, 'y'); g.hl(32, 37, 7, 'Y'); g.hl(34, 35, 8, 'y')
    elif it == 'flower':
        col = c.get('bloom', 'r')
        cold = {'r': 'R', 'w': 'W'}[col]
        g.vl(34, 9, 30, 'g'); g.px(35, 15, 'g'); g.hl(35, 37, 14, 'g'); g.hl(36, 38, 13, 'G')
        g.hl(31, 33, 19, 'g'); g.hl(30, 32, 18, 'G')
        g.rect(31, 3, 37, 8, col)
        g.px(31, 3, '.'); g.px(37, 3, '.'); g.px(31, 8, '.'); g.px(37, 8, '.')
        g.hl(32, 36, 2, col); g.hl(32, 36, 9, col)
        g.px(33, 4, cold); g.px(35, 7, cold); g.px(36, 4, cold)
        g.rect(33, 5, 35, 6, 'y' if col == 'w' else 'R'); g.px(34, 5, 'Y' if col == 'w' else 'y')


def outline(g):
    src = [r[:] for r in g.g]
    for y in range(H):
        for x in range(W):
            if src[y][x] == '.':
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < W and 0 <= yy < H and src[yy][xx] not in '.o':
                        g.g[y][x] = 'o'
                        break


def build(c):
    g = G()
    hair_back(g, c)
    {'bube': body_bube, 'dame': body_dame, 'koenig': body_koenig}[c['role']](g, c)
    face(g, c)
    beard(g, c)
    hair_front(g, c)
    headgear(g, c)
    eyewear(g, c)
    item(g, c)
    hand(g, c)
    outline(g)
    return [''.join(r) for r in g.g]


P = {
    'herz-bube': dict(role='bube', hair='curly', h='#a87a4a', H='#6e4a28', i='#3f86e0', hat='beret', gem='r', glasses='round', beard='stubble', mouth='smile',
                      sleeves=('r', 'b'), tunic='r', panel='w', pip='heart', pipk='r', item='halberd', blade='b', bpip='heart', bpipk='r', hat_covers=True),
    'karo-bube': dict(role='bube', hair='short', h='#b08a5a', H='#7a5a34', i='#3f86e0', hat='beret', gem='r', glasses='sun', beard='stubble', mouth='smirk',
                      sleeves=('b', 'y'), tunic='r', panel='y', pip='diam', pipk='r', strap=True, item='spear', hat_covers=True),
    'pik-bube': dict(role='bube', hair='bald', h='#c8a07a', H='#9a7050', i='#6a9ad0', hat='none', beard='stubble', mouth='smile',
                     sleeves=('b', 'y'), tunic='g', panel='g', pip='spade', pipk='y', handk='z', item='halberd', pole='gold', blade='b', bpip='spade', bpipk='o'),
    'herz-dame': dict(role='dame', hair='short', h='#b8925a', H='#8a6a3a', i='#3f86e0', hat='crown', gem='r', mouth='big', bodice='r', pend='r', pip='heart', pipk='w', item='flower', bloom='r', hat_covers=True),
    'karo-dame': dict(role='dame', hair='shoulder', h='#e0b860', H='#b08840', i='#3f86e0', hat='crown', gem='r', mouth='smile', lashes=True, lipstick=True,
                      bodice='w', pend='r', pip='diam', pipk='r', item='flower', bloom='r'),
    'kreuz-dame': dict(role='dame', hair='longm', h='#8a5a34', H='#5a3820', i='#7a5a30', hat='roses', beard='full', mouth='smile', cheek=False,
                       bodice='r', pend='r', pip='club', pipk='o', item='flower', bloom='r'),
    'pik-dame': dict(role='dame', hair='longf', h='#d8a860', H='#a87838', i='#3f86e0', hat='crown', gem='b', mouth='smile', lashes=True, lipstick=True,
                     bodice='b', pend='r', pip='spade', pipk='o', item='flower', bloom='w'),
    'herz-koenig': dict(role='koenig', hair='side', h='#8a6038', H='#5a3c20', i='#6a5030', hat='capcrown', cap='b', gem='r', glasses='black', mouth='smirk',
                        tunic='b', item='scepter', top='heart'),
    'karo-koenig': dict(role='koenig', hair='short', h='#7a5a3a', H='#4e3820', i='#6a5030', hat='capcrown', cap='r', gem='b', beard='stubble', mouth='smirk',
                        tunic='b', spot='r', item='scepter', top='fleur', hat_covers=True),
    'kreuz-koenig': dict(role='koenig', hair='swept', h='#c09050', H='#8a6030', i='#3f86e0', hat='crown', gem='b', gem2='r', mouth='big', beard='stubble',
                         tunic='b', item='scepter', top='fleur'),
    'pik-koenig': dict(role='koenig', hair='swept', h='#d8b070', H='#a88040', i='#3f86e0', hat='capcrown', cap='b', gem='r', mouth='smirk',
                       tunic='b', item='scepter', top='spade'),
}

if __name__ == '__main__':
    out = {}
    for k, c in P.items():
        out[k] = {'rows': build(c), 'h': c['h'], 'H': c['H'], 'i': c['i']}
    json.dump(out, open('/home/claude/skat/dev/portraits.json', 'w'))
    from PIL import Image
    PAL = {'o': '#1b1427', 'e': '#1b1427', 's': '#f3c99b', 'S': '#d79a6c', 't': '#c98d63', 'u': '#2f4aa0', 'U': '#1e2f6e', 'v': '#4a6ad0',
           'w': '#f4ead2', 'W': '#cbbd9b', 'r': '#d63c3c', 'R': '#8e2431', 'y': '#f5c542', 'Y': '#b9852a', 'b': '#2f4aa0', 'B': '#1e2f6e',
           'p': '#a8703e', 'P': '#6a4222', 'm': '#5a1420', 'M': '#8e2431', 'T': '#fbf6ea', 'q': '#ec9c88', 'g': '#2f8a4c', 'G': '#1d5a33',
           'k': '#2a2a3a', 'l': '#bfe0ff', 'n': '#9a6238', 'N': '#4a3226', 'z': '#a4a2b4', 'Z': '#5a5870'}
    S = 6
    ids = list(P)
    img = Image.new('RGB', (4 * (W * S + 14) + 14, 3 * (H * S + 14) + 14), '#efe1bb')
    for n, k in enumerate(ids):
        pal = dict(PAL); pal['h'] = out[k]['h']; pal['H'] = out[k]['H']; pal['i'] = out[k]['i']
        ox = 14 + (n % 4) * (W * S + 14); oy = 14 + (n // 4) * (H * S + 14)
        for y, row in enumerate(out[k]['rows']):
            for x, ch in enumerate(row):
                if ch != '.':
                    col = tuple(int(pal[ch][j:j + 2], 16) for j in (1, 3, 5))
                    for dy in range(S):
                        for dx in range(S):
                            img.putpixel((ox + x * S + dx, oy + y * S + dy), col)
    img.save('/home/claude/skat/dev/portraits.png')
    print('ok', img.size)
