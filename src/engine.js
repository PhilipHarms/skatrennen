/* ===== Sprite-Engine ===== */
const ROLE_NAME = { bube: 'Bube', dame: 'Dame', koenig: 'König' };
const CHARS = ['herz-bube', 'karo-bube', 'pik-bube', 'herz-dame', 'karo-dame', 'kreuz-dame', 'pik-dame',
  'herz-koenig', 'karo-koenig', 'kreuz-koenig', 'pik-koenig'].map(id => {
  const [suit, role] = id.split('-');
  return { id, suit, role };
});
const CHAR_BY_ID = Object.fromEntries(CHARS.map(c => [c.id, c]));
const NAUNIN_ID = 'kreuz-bube';
CHAR_BY_ID[NAUNIN_ID] = { id: NAUNIN_ID, suit: 'kreuz', role: 'bube' };
function charName(id) {
  const c = CHAR_BY_ID[id];
  return c ? SPR.suits[c.suit].name + '-' + ROLE_NAME[c.role] : '';
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

/* Palette einer Figur, wahlweise als Zombie */
function charPalette(chId, zombie) {
  const d = SPR.chars[chId];
  const p = Object.assign({}, SPR.cardPal, { h: d.h, H: d.H });
  if (zombie) {
    for (const k of Object.keys(p)) if (k !== 'o') p[k] = mixHex(p[k], '#5a6450', 0.45);
    Object.assign(p, { s: '#93c46c', S: '#5f8f48', t: '#4f7a3a', q: '#93c46c', e: '#ff4a4a' });
    p.h = mixHex(d.h, '#4b5a3a', 0.6); p.H = mixHex(d.H, '#3a4a2a', 0.6);
  }
  return p;
}

function newCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function drawRows(ctx, rows, pal, ox, oy) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const k = row[x];
      if (k === '.' || k === ' ') continue;
      const col = pal[k];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

const spriteCache = new Map();
function cached(key, fn) {
  let v = spriteCache.get(key);
  if (!v) { v = fn(); spriteCache.set(key, v); }
  return v;
}

/* Laufende Figur 19x23 */
function spriteWalk(chId, frame, zombie) {
  return cached('w|' + chId + '|' + frame + '|' + (zombie ? 1 : 0), () => {
    const d = SPR.chars[chId];
    const rows = frame === 0 ? d.A : d.B;
    const cv = newCanvas(rows[0].length, rows.length), ctx = cv.getContext('2d');
    drawRows(ctx, rows, charPalette(chId, !!zombie), 0, 0);
    return cv;
  });
}

/* Reiter auf Pferd 31x28, Schabracke in Farbe der Farbe */
function spriteRide(chId, frame, unicorn) {
  return cached('r|' + chId + '|' + frame + '|' + (unicorn ? 1 : 0), () => {
    const ch = CHAR_BY_ID[chId], d = SPR.chars[chId];
    const cv = newCanvas(31, 28), ctx = cv.getContext('2d');
    const red = ch.suit === 'herz' || ch.suit === 'karo';
    const hp = Object.assign({}, SPR.base, red ? { c: '#d63c3c', C: '#8e2431' } : { c: '#2f4aa0', C: '#1e2f6e' });
    if (unicorn) Object.assign(hp, { n: '#f4f0ff', N: '#ffffff', B: '#c98ae0' });
    drawRows(ctx, frame === 0 ? SPR.horse.A : SPR.horse.B, hp, 3, 10);
    if (unicorn) {
      ctx.fillStyle = '#1b1427'; ctx.fillRect(25, 8, 2, 3); ctx.fillRect(26, 7, 2, 2); ctx.fillRect(27, 6, 2, 2);
      ctx.fillStyle = '#f5c542'; ctx.fillRect(25, 9, 1, 1); ctx.fillRect(26, 8, 1, 1); ctx.fillRect(27, 7, 1, 1);
      ctx.fillStyle = '#fff6c0'; ctx.fillRect(25, 10, 1, 1);
    }
    const pal = charPalette(chId, false);
    const dy = frame === 0 ? 0 : 1;
    drawRows(ctx, d.A.slice(0, 20), pal, 0, dy);
    /* Bein am Pferd */
    ctx.fillStyle = pal.o; ctx.fillRect(7, 19 + dy, 4, 6);
    ctx.fillStyle = pal.B; ctx.fillRect(8, 19 + dy, 2, 4);
    ctx.fillStyle = pal.N; ctx.fillRect(8, 23 + dy, 3, 1);
    return cv;
  });
}

/* Kriechender Zombie 28x16 */
function spriteCrawl(chId, frame) {
  return cached('c|' + chId + '|' + frame, () => {
    const d = SPR.chars[chId];
    const rows = frame === 0 ? d.cA : d.cB;
    const cv = newCanvas(rows[0].length, rows.length), ctx = cv.getContext('2d');
    drawRows(ctx, rows, charPalette(chId, true), 0, 0);
    return cv;
  });
}

/* Silhouette für Leuchten */
function silhouette(src, color) {
  return cached('sil|' + color + '|' + (src._id || (src._id = Math.random().toString(36).slice(2))), () => {
    const cv = newCanvas(src.width, src.height), ctx = cv.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, cv.width, cv.height);
    return cv;
  });
}

/* Portrait einer Figur, gleiche Maße wie Naunins Karte */
function spritePortrait(chId) {
  if (chId === NAUNIN_ID) return spriteNaunin('idle');
  return cached('p|' + chId, () => {
    const d = SPR.portraits[chId];
    const pal = Object.assign({}, SPR.nauninPal, {
      h: d.h, H: d.H, i: d.i, g: '#2f8a4c', G: '#1d5a33', k: '#2a2a3a', l: '#bfe0ff', n: '#9a6238', N: '#4a3226', z: '#a4a2b4', Z: '#5a5870'
    });
    const cv = newCanvas(d.rows[0].length, d.rows.length);
    drawRows(cv.getContext('2d'), d.rows, pal, 0, 0);
    return cv;
  });
}
const ROLE_LETTER = { bube: 'B', dame: 'D', koenig: 'K' };
const SUIT_SYM = { kreuz: '\u2663', pik: '\u2660', herz: '\u2665', karo: '\u2666' };
/* Spielkarte mit Portrait als DOM-Element */
function portraitCard(chId, nz) {
  const c = CHAR_BY_ID[chId];
  const el = document.createElement('div');
  el.className = 'pcard';
  el.style.setProperty('--nz', nz || 1.4);
  const red = c.suit === 'herz' || c.suit === 'karo';
  el.innerHTML = '<span class="idx"' + (red ? ' style="color:var(--red)"' : '') + '>' + ROLE_LETTER[c.role] + '<b>' + SUIT_SYM[c.suit] + '</b></span>';
  const cv = document.createElement('canvas');
  cv.className = 'px'; cv.width = 43; cv.height = 38;
  cv.getContext('2d').drawImage(spritePortrait(chId), 0, 0);
  el.appendChild(cv);
  return el;
}

/* Naunin-Portrait mit Mimik: 'idle' | 'talk' | 'blink' | 'yawn' | 'tape' */
function spriteNaunin(mood) {
  return cached('n|' + mood, () => {
    const rows = SPR.naunin[mood] || SPR.naunin.idle;
    const cv = newCanvas(rows[0].length, rows.length), ctx = cv.getContext('2d');
    drawRows(ctx, rows, SPR.nauninPal, 0, 0);
    return cv;
  });
}
