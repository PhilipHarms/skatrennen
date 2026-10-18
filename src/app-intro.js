/* ===== Intro: Bühne mit Prinz Naunin und Dialog ===== */
const easeOut = t => 1 - Math.pow(1 - t, 3);
const BOTTLE_PAL = { o: '#1b1427', y: '#f5c542', g: '#43a052', G: '#2a6a34', w: '#f4ead2' };
const BOTTLE_HOLD = ['..o.', '.oyo', '.ogo', 'oggo', 'owwo', 'oggo', 'oGgo', '.oo.'];
const BOTTLE_DRINK = ['....ooo.', '...ogggo', '..ogwgo.', '.oggGo..', 'oyggo...', 'oyoo....', '.o......'];

function rot90(rows) {
  const h = rows.length, w = rows[0].length, out = [];
  for (let x = 0; x < w; x++) { let r = ''; for (let y = h - 1; y >= 0; y--) r += rows[y][x]; out.push(r); }
  return out;
}
/* Drehbilder der Flasche im Uhrzeigersinn, 45 Grad je Bild */
const BOTTLE_SPIN = (() => {
  const h90 = rot90(BOTTLE_HOLD), h180 = rot90(h90), h270 = rot90(h180);
  const d90 = rot90(BOTTLE_DRINK), d180 = rot90(d90), d270 = rot90(d180);
  return [BOTTLE_HOLD, d180, h90, d270, h180, BOTTLE_DRINK, h270, d90];
})();
function spriteBottleSpin(i) {
  return cached('bspin|' + i, () => {
    const rows = BOTTLE_SPIN[i];
    const cv = newCanvas(rows[0].length, rows.length);
    drawRows(cv.getContext('2d'), rows, BOTTLE_PAL, 0, 0);
    return cv;
  });
}
const WAPPEN = [
  '...............oo...............',
  '..............owwo..............',
  '...............oo...............',
  '.........o....oyyo....o.........',
  '........oyo.o.oyyo.o.oyo........',
  '..ooo...oyooyooyyooyooyo...ooo..',
  '.oyyyo..oyooyooyyooyooyo..oyyyo.',
  'oyyyyo..oyyyyyyyyyyyyyyo..oyyyyo',
  'oyYyyo..oyyyryybbyyryyyo..oyyYyo',
  'oyyynooooYYYYYYYYYYYYYYoooonyyyo',
  '.oyyowwwwwwwwwwyyrrrrrrrrrroyyo.',
  '..ooowWwwwwwwwwyyrrrrrrrrrrooo..',
  '....owWwwwwwwwwyyrrrrrrrrrro....',
  '....owWwwooowwwyyrrwrwrrrrro....',
  '....owWwwooowwwyyrwwwwwrrrro....',
  '....owWwooooowwyyrwwwwwrrrro....',
  '....owWwowowowwyyrrwwwrrrrro....',
  '....owWwwwowwwwyyrrrwrrrrrro....',
  '....owWwwwwwwwwyyrrrrrrrrrro....',
  '....owWwwwwwwwwyyrrrrrrrrrro....',
  '....owWwwwwwwwwyyrrrrrrrrrro....',
  '....oyyyyyyyyyyyyyyyyyyyyyyo....',
  '....oyyyyyyyyyyyyyyyyyyyyyyo....',
  '....orrrrrrrrrryywwwwwwwwwwo....',
  '....orrrrrrrrrryywwwwwwwwwwo....',
  '.....orrrrwrrrryywwwowwwwwo.....',
  '.....orrrwwwrrryywwooowwwwo.....',
  '......orwwwwwrryywooooowwo......',
  '.......orwwwrrryywooooowo.......',
  '.......orrwrrrryywwwowwwo.......',
  '.......onrrrrrryywwwwwwno.......',
  '......onoorrrrryywwwwwoono......',
  '.....ono..orrrryywwwwo..ono.....',
  '....ono....orrryywwwo....ono....',
  '...ono......orryywwo......ono...',
  '..ono........oryywo........ono..',
  '...o..........oyyo..........o...',
  '...............oo...............'
];
const WAPPEN_PAL = { o: '#1b1427', y: '#f5c542', Y: '#b9852a', r: '#d63c3c', R: '#8e2431', w: '#f4ead2', W: '#cbbd9b', n: '#9a6238', b: '#2f4aa0' };
function drawWappen(cv) {
  cv.width = WAPPEN[0].length; cv.height = WAPPEN.length;
  drawRows(cv.getContext('2d'), WAPPEN, WAPPEN_PAL, 0, 0);
}
const CREAM = '#efe1bb';

function spriteHorse(suit) {
  return cached('horse|' + suit, () => {
    const cv = newCanvas(31, 28), ctx = cv.getContext('2d');
    const red = suit === 'herz' || suit === 'karo';
    const hp = Object.assign({}, SPR.base, red ? { c: '#d63c3c', C: '#8e2431' } : { c: '#2f4aa0', C: '#1e2f6e' });
    drawRows(ctx, SPR.horse.A, hp, 3, 10);
    return cv;
  });
}
function spriteBottle(rows) {
  return cached('bottle|' + rows.length, () => {
    const cv = newCanvas(rows[0].length, rows.length);
    drawRows(cv.getContext('2d'), rows, BOTTLE_PAL, 0, 0);
    return cv;
  });
}

const Stage = {
  H: 84, GROUND: 44, FEET: 74, HX: 2,
  W: 0, scale: 1, kc: 1, running: false, last: 0, lastT: 0,
  scene: 'empty', t0: 0, fired: null, onDone: null,
  horse: null, nau: null, parts: [], cork: null, bubble: null, foamUntil: 0,
  figs: new Map(), cast: [], mode: 'row', dealerKey: null,

  get NX() { return this.HX + 32; },

  init() {
    this.wrap = $('#stage-wrap'); this.cv = $('#stage-cv'); this.ctx = this.cv.getContext('2d');
    this.ov = $('#stage-ov');
    this.buf = document.createElement('canvas'); this.bctx = this.buf.getContext('2d');
    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (!$('#scr-intro').hidden) { this.layout(); this.retarget(); } }, 120);
    });
    this.reset();
  },
  reset() {
    this.scene = 'empty'; this.parts = []; this.cork = null; this.onDone = null; this.foamUntil = 0;
    this.thrown = null; this.plain = true; this.reveal = null; this.onReveal = null;
    this.removeBubble();
    this.horse = { x: -60, flip: false, frame: 0, ride: true, jumpT: 0 };
    this.nau = { pose: 'ride', bottle: 'none', shake: 0, hop: null, throwT: 0, cheerT: 0, wand: null };
    this.figs.forEach(f => f.label.remove());
    this.figs.clear(); this.cast = []; this.mode = 'row'; this.dealerKey = null;
  },
  layout() {
    const cssW = this.wrap.clientWidth;
    if (!cssW) return;
    const dpr = window.devicePixelRatio || 1;
    const kCss = clamp(cssW / 195, 1.8, 3.2);
    this.scale = Math.max(1, Math.round(kCss * dpr));
    this.W = Math.ceil(cssW * dpr / this.scale);
    this.buf.width = this.W; this.buf.height = this.H;
    this.cv.width = this.W * this.scale; this.cv.height = this.H * this.scale;
    this.kc = this.scale / dpr;
    const cw = this.W * this.kc, ch = this.H * this.kc;
    this.cv.style.width = cw + 'px'; this.cv.style.height = ch + 'px';
    this.ov.style.width = cw + 'px'; this.ov.style.height = ch + 'px';
    this.wrap.style.height = ch + 'px';
  },
  start() {
    if (this.running) return;
    this.running = true;
    const loop = now => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      if (now - this.last < 30) return;
      this.last = now;
      this.draw(now);
    };
    requestAnimationFrame(loop);
  },
  stop() { this.running = false; },

  /* ---------- Intro-Animation ---------- */
  playIntro(onDone, onReveal, onWand) {
    this.reset();
    this.scene = 'anim'; this.t0 = performance.now(); this.fired = new Set();
    this.onDone = onDone; this.onReveal = onReveal; this.onWand = onWand;
    this.horse.x = this.W + 40; this.horse.flip = true;
    Sound.play('fanfare');
  },
  toIdle() {
    this.scene = 'idle'; this.parts = []; this.foamUntil = 0; this.onDone = null; this.onReveal = null;
    this.plain = false; this.reveal = null;
    this.removeBubble();
    this.horse = { x: this.HX, flip: false, frame: 0, ride: false, jumpT: 0 };
    this.nau = { pose: 'stand', bottle: 'none', shake: 0, hop: null, throwT: 0, cheerT: 0, wand: null };
    if (!this.cork || !this.cork.landed) this.cork = { x: this.NX + 25, y: this.FEET, landed: true };
    this.thrown = null;
  },
  animate(now) {
    const t = now - this.t0;
    const ev = (at, fn) => { if (t >= at && !this.fired.has(at)) { this.fired.add(at); fn(); } };
    const F = 1300, G = 1700, B = F + G;
    if (t < F) { this.horse.x = this.W + 40; }
    else if (t < B) {
      this.horse.x = this.W + 4 + (this.HX - this.W - 4) * easeOut((t - F) / G);
      this.horse.frame = Math.floor(t / 90) % 2;
      if (Math.random() < 0.6) this.parts.push({ x: this.horse.x + 26, y: this.FEET - 1, vx: 14 + Math.random() * 10, vy: -6 - Math.random() * 8, g: 20, life: 0.4, max: 0.4, c: '#c8b88a' });
    } else { this.horse.x = this.HX; this.horse.frame = 0; }
    ev(F, () => Sound.play('gallop'));
    ev(B + 250, () => { this.horse.flip = false; this.horse.jumpT = now; Sound.play('neigh'); });
    ev(B + 550, () => { this.horse.ride = false; this.nau.pose = 'hop'; this.nau.hop = { t0: now, dur: 480 }; Sound.play('hop'); });
    ev(B + 1030, () => { this.nau.pose = 'stand'; this.nau.hop = null; });
    ev(B + 1250, () => { this.nau.bottle = 'hold'; Sound.play('blip'); });
    ev(B + 1550, () => this.pop(now));
    ev(B + 2150, () => { this.nau.bottle = 'drink'; });
    ev(B + 2300, () => Sound.play('gulp'));
    ev(B + 2600, () => Sound.play('gulp'));
    ev(B + 2850, () => { this.nau.bottle = 'hold'; this.say('Ahh.', 1000); Sound.play('ahh'); });
    ev(B + 3350, () => this.throwBottle(now));
    ev(B + 4300, () => this.say('Moment mal. Hier fehlt ja die Rennbahn!', 1750));
    ev(B + 5850, () => {
      this.nau.wand = 'fwd'; Sound.play('blip');
      const cb = this.onWand; this.onWand = null; if (cb) cb();
    });
    ev(B + 6150, () => { this.nau.wand = 'up'; Sound.play('hop'); });
    ev(B + 6400, () => { this.nau.wand = 'fwd'; });
    ev(B + 6650, () => {
      this.nau.wand = 'up';
      const tip = this.wandTip(now);
      this.reveal = { t0: now, cx: tip.x, cy: tip.y, dur: 950 };
      Sound.play('magic');
      const cb = this.onReveal; this.onReveal = null; if (cb) cb();
    });
    ev(B + 7050, () => { this.nau.wand = 'fwd'; });
    ev(B + 7800, () => {
      this.nau.wand = null; this.scene = 'idle'; this.removeBubble();
      const cb = this.onDone; this.onDone = null; if (cb) cb();
    });
  },
  pop(now) {
    const top = this.FEET - 22;
    this.nau.shake = now + 450;
    this.cork = { x: this.NX + 15, y: top + 12, vx: 26, vy: -72, landed: false };
    this.foamUntil = now + 650;
    Sound.play('pop');
  },
  throwBottle(now) {
    const top = this.FEET - 22;
    this.nau.bottle = 'none'; this.nau.throwT = now;
    this.thrown = { x: this.NX + 15, y: top + 9, vx: -78, vy: -74, t0: now };
    Sound.play('throw');
  },
  wandTip(now) {
    const p = this.nauTop(now);
    return this.nau.wand === 'up' ? { x: p.x + 18, y: p.y + 4 } : { x: p.x + 20, y: p.y + 9 };
  },
  cheer() {
    const now = performance.now();
    this.nau.cheerT = now;
    let i = 0;
    this.figs.forEach(f => { f.hopT = now + (i++) * 90; });
  },

  /* ---------- Sprechblase über Naunin ---------- */
  say(text, ms) {
    this.removeBubble();
    const el = document.createElement('div');
    el.className = 'bubble'; el.textContent = text;
    this.ov.appendChild(el);
    this.bubble = el;
    clearTimeout(this.bubbleT);
    this.bubbleT = setTimeout(() => this.removeBubble(), ms || 1500);
  },
  removeBubble() { if (this.bubble) { this.bubble.remove(); this.bubble = null; } },

  /* ---------- Besetzung ---------- */
  setCast(list, mode, dealerKey) {
    this.mode = mode; this.dealerKey = dealerKey || null; this.cast = list;
    const keys = new Set(list.map(c => c.key));
    this.figs.forEach(f => {
      if (!keys.has(f.key) && !f.leaving) { f.leaving = true; f.tx = this.W + 16; f.ty = this.FEET; }
    });
    list.forEach(c => {
      let f = this.figs.get(c.key);
      if (!f) {
        const label = document.createElement('div');
        label.className = 'slabel';
        this.ov.appendChild(label);
        f = { key: c.key, x: this.W + 14, y: this.FEET, tx: this.W + 14, ty: this.FEET, flip: true, walking: true, char: c.char, label, hopT: 0, phase: Math.random() * 1000 };
        this.figs.set(c.key, f);
      }
      f.leaving = false;
      if (f.char !== c.char) { f.char = c.char; this.puff(f); }
      const dealer = this.dealerKey === c.key;
      const html = esc(c.name) + (dealer ? ' <b>GIBT</b>' : '');
      if (f.labelHtml !== html) { f.label.innerHTML = html; f.labelHtml = html; }
    });
    this.retarget();
  },
  tableGeo() {
    const left = this.NX + 21;
    const cx = Math.round((left + this.W) / 2) + 1;
    const rx = Math.max(24, Math.min(42, (this.W - left) / 2 - 14));
    return { cx, cy: 63, rx, ry: 10, left };
  },
  retarget() {
    const m = this.cast.length;
    if (this.mode === 'table') {
      const g = this.tableGeo();
      this.cast.forEach((c, i) => {
        const f = this.figs.get(c.key); if (!f) return;
        const a = (-90 + i * 360 / m) * Math.PI / 180;
        const sk = g.rx * 0.4;
        f.tx = clamp(g.cx + g.rx * Math.cos(a) + sk * Math.sin(a), g.left + 4, this.W - 12);
        f.ty = Math.round(g.cy + g.ry * Math.sin(a)); f.slot = i;
      });
    } else {
      const first = this.NX + 31;
      const spacing = m > 1 ? Math.min(24, (this.W - 12 - first) / (m - 1)) : 0;
      this.cast.forEach((c, i) => {
        const f = this.figs.get(c.key); if (!f) return;
        f.tx = first + i * spacing; f.ty = this.FEET; f.slot = i;
      });
    }
  },
  puff(f) {
    Sound.play('puff');
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      this.parts.push({ x: f.x, y: f.y - 10, vx: Math.cos(a) * 26, vy: Math.sin(a) * 18 - 6, g: -10, life: 0.45, max: 0.45, c: i % 2 ? '#e9e2ff' : '#b8b4cc' });
    }
  },

  /* ---------- Zeichnen ---------- */
  drawSprite(spr, x, y, flip) {
    const b = this.bctx;
    if (!flip) { b.drawImage(spr, x, y); return; }
    b.save(); b.translate(x + spr.width, y); b.scale(-1, 1); b.drawImage(spr, 0, 0); b.restore();
  },
  drawPlain() {
    const b = this.bctx, W = this.W;
    b.fillStyle = CREAM; b.fillRect(0, 0, W, this.H);
    b.fillStyle = '#d9c58f';
    for (let x = 0; x < W; x += 4) b.fillRect(x, this.FEET + 1, 3, 1);
  },
  drawBackground(now) {
    if (this.plain && !this.reveal) { this.drawPlain(); return; }
    this.drawLandscape(now);
    const rv = this.reveal;
    if (rv) {
      const p = clamp((now - rv.t0) / rv.dur, 0, 1);
      const maxR = Math.hypot(Math.max(rv.cx, this.W - rv.cx), Math.max(rv.cy, this.H - rv.cy)) + 3;
      const r = Math.floor(p * p * maxR / 2) * 2;
      const b = this.bctx;
      b.fillStyle = CREAM;
      for (let y = 0; y < this.H; y++) {
        const dy = y - rv.cy;
        if (Math.abs(dy) >= r) { b.fillRect(0, y, this.W, 1); continue; }
        const dx = Math.floor(Math.sqrt(r * r - dy * dy));
        b.fillRect(0, y, Math.max(0, rv.cx - dx), 1);
        b.fillRect(rv.cx + dx, y, this.W, 1);
      }
      for (let i = 0; i < 7; i++) {
        const a = Math.random() * Math.PI * 2;
        this.parts.push({ x: rv.cx + Math.cos(a) * r, y: rv.cy + Math.sin(a) * r, vx: 0, vy: 0, g: 0, life: 0.3, max: 0.3, c: i % 2 ? '#fff6c0' : '#f5c542' });
      }
      if (p >= 1) { this.reveal = null; this.plain = false; }
    }
  },
  drawLandscape(now) {
    const b = this.bctx, W = this.W, H = this.H, GR = this.GROUND;
    const pal = skyPalette(new Date());
    const bandH = Math.ceil(GR / 4);
    pal.bands.forEach((c, i) => { b.fillStyle = c; b.fillRect(0, i * bandH, W, bandH); });
    if (pal.stars) {
      for (let i = 0; i < 42; i++) {
        if ((i + Math.floor(now / 650)) % 9 === 0) continue;
        b.fillStyle = i % 6 ? '#d8d4f0' : '#f5c542';
        b.fillRect(Math.floor(hash2(i, 13) * W), Math.floor(hash2(i, 17) * (GR - 14)), 1, 1);
      }
    }
    const mx = Math.round(W * 0.5), my = 9;
    if (pal.moon || pal.stars) {
      b.fillStyle = '#f4ead2';
      for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 17 && !((xx - 2) * (xx - 2) + (yy + 1) * (yy + 1) <= 12)) b.fillRect(mx + xx, my + yy, 1, 1);
    } else if (pal.sun) {
      b.fillStyle = '#ffe28a';
      for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 14) b.fillRect(mx + xx, my + yy, 1, 1);
    }
    for (let x = 0; x < W; x++) {
      const hy = Math.round(GR - 6 - 2 * Math.sin(x * 0.05 + 1) - 1.5 * Math.sin(x * 0.15));
      b.fillStyle = pal.hill2; b.fillRect(x, hy, 1, GR - hy);
      const hy2 = Math.round(GR - 3 - 1.5 * Math.sin(x * 0.1 + 3));
      b.fillStyle = pal.hill; b.fillRect(x, hy2, 1, GR - hy2);
    }
    Race.drawCastle(b, W - 30, GR - 2, pal, now);
    /* Boden */
    b.fillStyle = '#4f8a3a'; b.fillRect(0, GR, W, H - GR);
    b.fillStyle = '#3c7a2c'; b.fillRect(0, GR, W, 1);
    b.fillStyle = '#9c7646'; b.fillRect(0, this.FEET - 4, W, 7);
    b.fillStyle = '#b8905a'; b.fillRect(0, this.FEET - 4, W, 1);
    b.fillStyle = '#87643a'; b.fillRect(0, this.FEET + 2, W, 1);
    for (let x = 1; x < W; x += 4) {
      const r = hash2(x, 41);
      const yy = GR + 2 + Math.floor(hash2(x, 43) * (this.FEET - GR - 9));
      if (r < 0.25) { b.fillStyle = '#3c7a2c'; b.fillRect(x, yy, 1, 2); b.fillRect(x + 1, yy + 1, 1, 1); }
      else if (r < 0.3) { b.fillStyle = ['#f4ead2', '#f5c542', '#e86a8a'][Math.floor(r * 100) % 3]; b.fillRect(x, yy, 1, 1); }
      if (hash2(x, 47) < 0.2) { b.fillStyle = '#87643a'; b.fillRect(x, this.FEET - 2 + Math.floor(r * 3), 1, 1); }
      const yb = this.FEET + 4 + Math.floor(hash2(x, 53) * (H - this.FEET - 5));
      if (hash2(x, 59) < 0.2) { b.fillStyle = '#3c7a2c'; b.fillRect(x, yb, 1, 2); }
    }
  },
  drawHalberd(x, feet) {
    const b = this.bctx;
    b.fillStyle = '#1b1427'; b.fillRect(x - 1, feet - 27, 3, 28);
    b.fillStyle = '#9a6238'; b.fillRect(x, feet - 24, 1, 25);
    b.fillStyle = '#1b1427'; b.fillRect(x + 1, feet - 25, 4, 7);
    b.fillStyle = '#f5c542'; b.fillRect(x, feet - 27, 1, 3); b.fillRect(x + 1, feet - 24, 3, 5); b.fillRect(x + 4, feet - 23, 1, 3);
    b.fillStyle = '#1b1427'; b.fillRect(x + 2, feet - 22, 1, 1);
    b.fillStyle = '#d63c3c'; b.fillRect(x + 1, feet - 17, 1, 3);
  },
  drawTable(g) {
    const b = this.bctx, cx = g.cx, cy = g.cy, tw = Math.round(g.rx * 0.5);
    b.fillStyle = '#1b1427';
    b.fillRect(cx - tw + 1, cy - 4, 2 * tw - 2, 1); b.fillRect(cx - tw, cy - 3, 2 * tw, 6);
    b.fillRect(cx - tw + 2, cy + 3, 3, 6); b.fillRect(cx + tw - 5, cy + 3, 3, 6);
    b.fillStyle = '#9a6238'; b.fillRect(cx - tw + 1, cy - 3, 2 * tw - 2, 3);
    b.fillStyle = '#c48a55'; b.fillRect(cx - tw + 3, cy - 3, 2 * tw - 6, 1);
    b.fillStyle = '#6a3f22'; b.fillRect(cx - tw + 1, cy, 2 * tw - 2, 2);
    b.fillStyle = '#5a3420'; b.fillRect(cx - tw + 3, cy + 3, 1, 5); b.fillRect(cx + tw - 4, cy + 3, 1, 5);
    /* Karten und Bierdeckel */
    b.fillStyle = '#fff8e6'; b.fillRect(cx - 4, cy - 3, 2, 2); b.fillRect(cx + 2, cy - 3, 2, 2);
    b.fillStyle = '#d63c3c'; b.fillRect(cx - 4, cy - 3, 1, 1);
    b.fillStyle = '#f4ead2'; b.fillRect(cx - tw + 4, cy - 2, 2, 1);
  },
  drawCards(hx, top) {
    const b = this.bctx;
    b.fillStyle = '#1b1427'; b.fillRect(hx - 1, top + 13, 5, 6);
    b.fillStyle = '#fff8e6'; b.fillRect(hx, top + 14, 3, 4);
    b.fillStyle = '#cbbd9b'; b.fillRect(hx, top + 17, 3, 1);
    b.fillStyle = '#d63c3c'; b.fillRect(hx + 1, top + 15, 1, 1);
  },
  draw(now) {
    const b = this.bctx, W = this.W;
    if (!W) return;
    const dt = Math.min(0.05, Math.max(0, (now - (this.lastT || now)) / 1000));
    this.lastT = now;
    if (this.scene === 'anim') this.animate(now);
    this.drawBackground(now);
    if (this.scene === 'empty') { this.blit(); return; }

    const FEET = this.FEET;
    const items = [];
    /* Pferd, Hellebarde, Naunin */
    const h = this.horse;
    if (this.plain && !this.reveal) {
      b.fillStyle = '#dccb98';
      if (h.x > -30 && h.x < W) b.fillRect(Math.round(h.x) + 6, FEET, 20, 1);
      if (!h.ride && this.nau.pose === 'stand') b.fillRect(this.NX + 4, FEET, 11, 1);
    }
    const hy = h.jumpT && now - h.jumpT < 170 ? -2 : 0;
    if (h.ride) {
      items.push({ y: FEET, draw: () => this.drawSprite(spriteRide(NAUNIN_ID, h.frame), Math.round(h.x), FEET - 27 + hy, h.flip) });
    } else {
      items.push({ y: FEET - 2, draw: () => this.drawHalberd(this.HX + 1, FEET - 1) });
      items.push({ y: FEET - 1, draw: () => this.drawSprite(spriteHorse('kreuz'), Math.round(h.x), FEET - 27 + hy, h.flip) });
      items.push({ y: FEET, draw: () => this.drawNaunin(now) });
    }
    /* Tisch */
    const tg = this.tableGeo();
    if (this.mode === 'table') items.push({ y: tg.cy, draw: () => this.drawTable(tg) });
    /* Figuren */
    const gone = [];
    this.figs.forEach(f => {
      const dx = f.tx - f.x, dy = f.ty - f.y, dist = Math.hypot(dx, dy);
      const step = 52 * dt;
      if (dist > 0.6) {
        f.walking = true;
        if (dist <= step) { f.x = f.tx; f.y = f.ty; } else { f.x += dx / dist * step; f.y += dy / dist * step; }
        if (Math.abs(dx) > 0.5) f.flip = dx < 0;
      } else {
        f.walking = false;
        if (f.leaving) { gone.push(f); return; }
        f.flip = this.mode === 'table' ? f.x > tg.cx + 1 : true;
      }
      items.push({ y: f.y, draw: () => this.drawFig(f, now) });
    });
    gone.forEach(f => { f.label.remove(); this.figs.delete(f.key); });
    items.sort((a, c) => a.y - c.y);
    items.forEach(it => it.draw());

    /* Schaum, Staub, Korken */
    if (now < this.foamUntil) {
      const top = FEET - 22;
      for (let i = 0; i < 3; i++) {
        this.parts.push({ x: this.NX + 15, y: top + 11, vx: 6 + Math.random() * 30, vy: -24 - Math.random() * 42, g: 80, life: 0.5 + Math.random() * 0.4, max: 0.9, c: ['#fff8e6', '#f4ead2', '#f5e6a0'][i] });
      }
    }
    this.parts = this.parts.filter(p => (p.life -= dt) > 0);
    this.parts.forEach(p => {
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      b.globalAlpha = Math.max(0.25, p.life / p.max);
      b.fillStyle = p.c; b.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    });
    b.globalAlpha = 1;
    const tb = this.thrown;
    if (tb) {
      tb.vy += 165 * dt; tb.x += tb.vx * dt; tb.y += tb.vy * dt;
      const spr = spriteBottleSpin(((8 - Math.floor((now - tb.t0) / 55) % 8) % 8));
      b.drawImage(spr, Math.round(tb.x - spr.width / 2), Math.round(tb.y - spr.height / 2));
      if (tb.x < -14 || tb.y > this.H + 10) {
        this.thrown = null;
        Sound.play('crash');
      }
    }
    const c = this.cork;
    if (c) {
      if (!c.landed) {
        c.vy += 170 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.y >= FEET && c.vy > 0) { c.y = FEET; c.landed = true; Sound.play('tap'); }
      }
      b.fillStyle = '#1b1427'; b.fillRect(Math.round(c.x) - 1, Math.round(c.y) - 2, 4, 3);
      b.fillStyle = '#c48a55'; b.fillRect(Math.round(c.x), Math.round(c.y) - 1, 2, 1);
    }
    this.blit();
    this.overlay(now, tg);
  },
  nauTop(now) {
    const FEET = this.FEET;
    const n = this.nau;
    if (n.pose === 'hop' && n.hop) {
      const p = clamp((now - n.hop.t0) / n.hop.dur, 0, 1);
      const x0 = this.HX, y0 = FEET - 27, x1 = this.NX, y1 = FEET - 22;
      return { x: Math.round(x0 + (x1 - x0) * p), y: Math.round(y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 10) };
    }
    const sh = now < n.shake ? (Math.floor(now / 40) % 2 ? 1 : -1) : 0;
    const cd = now - (n.cheerT || 0);
    const jump = n.cheerT && cd < 700 ? Math.round(Math.abs(Math.sin(cd / 350 * Math.PI)) * 4) : 0;
    return { x: this.NX + sh, y: FEET - 22 - jump };
  },
  drawNaunin(now) {
    const n = this.nau;
    const p = this.nauTop(now);
    const spr = spriteWalk('naunin-stand', 0);
    this.drawSprite(spr, p.x, p.y, false);
    if (n.pose === 'hop') return;
    const b = this.bctx;
    if (n.wand) {
      const up = n.wand === 'up';
      b.fillStyle = '#f5c542'; b.fillRect(p.x + 13, p.y + 18, 1, 1);
      b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 14, p.y + 18, 1, 1);
      if (up) {
        b.fillStyle = '#1b1427'; b.fillRect(p.x + 13, p.y + 7, 4, 7);
        b.fillStyle = '#f5c542'; b.fillRect(p.x + 14, p.y + 9, 1, 4);
        b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 15, p.y + 9, 1, 4);
        b.fillStyle = '#f3c99b'; b.fillRect(p.x + 14, p.y + 8, 2, 1);
        b.fillStyle = '#5a3420'; b.fillRect(p.x + 15, p.y + 7, 1, 1); b.fillRect(p.x + 16, p.y + 6, 1, 1); b.fillRect(p.x + 17, p.y + 5, 1, 1);
      } else {
        b.fillStyle = '#1b1427'; b.fillRect(p.x + 13, p.y + 12, 5, 3);
        b.fillStyle = '#f5c542'; b.fillRect(p.x + 13, p.y + 13, 2, 1);
        b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 15, p.y + 13, 1, 1);
        b.fillStyle = '#f3c99b'; b.fillRect(p.x + 16, p.y + 13, 1, 1);
        b.fillStyle = '#5a3420'; b.fillRect(p.x + 17, p.y + 12, 1, 1); b.fillRect(p.x + 18, p.y + 11, 1, 1); b.fillRect(p.x + 19, p.y + 10, 1, 1);
      }
      const tip = up ? { x: p.x + 18, y: p.y + 4 } : { x: p.x + 20, y: p.y + 9 };
      b.fillStyle = '#1b1427'; b.fillRect(tip.x - 2, tip.y - 1, 5, 3); b.fillRect(tip.x - 1, tip.y - 2, 3, 5);
      b.fillStyle = '#f5c542'; b.fillRect(tip.x - 1, tip.y, 3, 1); b.fillRect(tip.x, tip.y - 1, 1, 3);
      b.fillStyle = '#ffffff'; b.fillRect(tip.x, tip.y, 1, 1);
      if (Math.random() < 0.5) this.parts.push({ x: tip.x + (Math.random() - 0.5) * 6, y: tip.y + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 10, vy: -8, g: 0, life: 0.35, max: 0.35, c: Math.random() < 0.5 ? '#fff6c0' : '#f5c542' });
    }
    const drinking = n.bottle === 'drink';
    if (n.throwT && now - n.throwT < 300) {
      b.fillStyle = '#1b1427'; b.fillRect(p.x + 13, p.y + 7, 4, 7);
      b.fillStyle = '#f5c542'; b.fillRect(p.x + 14, p.y + 9, 1, 4);
      b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 15, p.y + 9, 1, 4);
      b.fillStyle = '#f3c99b'; b.fillRect(p.x + 14, p.y + 8, 2, 1);
    }
    if (drinking) {
      b.fillStyle = '#f5c542'; b.fillRect(p.x + 13, p.y + 18, 1, 1);
      b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 14, p.y + 18, 1, 1);
      b.fillStyle = '#1b1427'; b.fillRect(p.x + 13, p.y + 11, 4, 4);
      b.fillStyle = '#f5c542'; b.fillRect(p.x + 14, p.y + 13, 1, 2);
      b.fillStyle = '#2f4aa0'; b.fillRect(p.x + 15, p.y + 12, 1, 2);
      b.fillStyle = '#f3c99b'; b.fillRect(p.x + 14, p.y + 11, 2, 1);
      this.drawSprite(spriteBottle(BOTTLE_DRINK), p.x + 10, p.y + 6, false);
    } else if (n.bottle === 'hold') {
      this.drawSprite(spriteBottle(BOTTLE_HOLD), p.x + 13, p.y + 11, false);
      b.fillStyle = '#f3c99b'; b.fillRect(p.x + 13, p.y + 17, 2, 1);
    }
  },
  drawFig(f, now) {
    const hopDt = now - f.hopT;
    const hop = f.hopT && hopDt > 0 && hopDt < 320 ? Math.round(Math.sin(hopDt / 320 * Math.PI) * 5) : 0;
    const frame = f.walking ? Math.floor((now + f.phase) / 140) % 2 : 0;
    const spr = spriteWalk(f.char, frame);
    const left = Math.round(f.x - spr.width / 2);
    const top = Math.round(f.y) - (spr.height - 1) - hop - (f.walking && frame ? 1 : 0);
    this.drawSprite(spr, left, top, f.flip);
    if (this.dealerKey === f.key && !f.walking) this.drawCards(f.flip ? left + 3 : left + 13, top);
    f._top = top;
  },
  blit() {
    const c = this.ctx;
    c.imageSmoothingEnabled = false;
    c.drawImage(this.buf, 0, 0, this.W * this.scale, this.H * this.scale);
  },
  overlay(now, tg) {
    const kc = this.kc, ovW = this.W * kc;
    this.figs.forEach(f => {
      const el = f.label;
      const w = el.offsetWidth, hgt = el.offsetHeight;
      const front = this.mode === 'table' && f.ty > tg.cy + 2;
      let lx = clamp(f.x * kc - w / 2, 2, ovW - w - 2);
      let ly;
      if (front) ly = (f.y + 2) * kc;
      else {
        const stagger = this.mode === 'row' && f.slot % 2 === 1 ? 14 : 0;
        ly = ((f._top || f.y - 22) - 1) * kc - hgt - stagger;
      }
      ly = Math.max(1, ly);
      el.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)';
      el.style.opacity = f.leaving ? '0.4' : '1';
    });
    if (this.bubble) {
      const p = this.nauTop(now);
      const bw = this.bubble.offsetWidth;
      const left = clamp((p.x + 9) * kc - 18, 4, ovW - bw - 4);
      this.bubble.style.left = left.toFixed(1) + 'px';
      this.bubble.style.top = Math.max(this.bubble.offsetHeight + 2, (p.y - 2) * kc).toFixed(1) + 'px';
      this.bubble.style.setProperty('--ax', clamp((p.x + 11) * kc - left, 10, bw - 10).toFixed(1) + 'px');
    }
  }
};

/* ---------- Dialog und Ablauf ---------- */
const Intro = {
  k: null, opts: {}, step: 'hello', sel: null, pickFor: null, finishing: false,
  init() {
    Stage.init();
    let ft = null;
    window.addEventListener('resize', () => { clearTimeout(ft); ft = setTimeout(() => { if (!$('#scr-intro').hidden) this.fitBanner(); }, 150); });
    if (document.fonts && document.fonts.ready) {
      const refit = () => { if (!$('#scr-intro').hidden) this.fitBanner(); };
      document.fonts.ready.then(refit);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
    }
    drawWappen($('#wappen'));
    this.k = new Kiebitz($('#intro-banner'));
    $('#intro-banner').addEventListener('click', () => {
      if (this.finishing) { Sound.play('tap'); this.goRace(); return; }
      if (this.step === 'hello' && !$('#dlg-next').disabled) { Sound.play('tap'); this.next(); }
    });
    $('#intro-start').addEventListener('click', e => { e.stopPropagation(); this.begin(); });
    $('#stage-wrap').addEventListener('click', e => {
      if (Stage.scene === 'empty' && !e.target.closest('button')) this.begin();
    });
    $('#intro-skip').addEventListener('click', e => { e.stopPropagation(); Sound.play('tap'); this.skip(); });
    $('#dlg-next').addEventListener('click', () => { Sound.play('tap'); this.next(); });
    $('#dlg-back').addEventListener('click', () => { Sound.play('tap'); this.back(); });
  },
  show(opts) {
    this.opts = opts || {};
    this.finishing = false; this.sel = null; this.pickFor = null;
    this.ensureDraft();
    showScreen('intro');
    this.fitBanner();
    Stage.reset(); Stage.layout(); Stage.start();
    $('#intro-dialog').hidden = true;
    $('#intro-banner').hidden = true; $('#intro-top').classList.remove('talking');
    if (this.opts.quick) {
      $('#intro-start').hidden = true; $('#intro-skip').hidden = true;
      Stage.toIdle(); this.setPlain(false);
      this.openDialog(this.opts.step || 'names');
      return;
    }
    $('#intro-start').hidden = false; $('#intro-skip').hidden = true;
    this.setPlain(true);
  },
  /* Banner so hoch wie die längste Zeile bei dieser Breite: kein Springen, kein Leerraum */
  bannerTexts() {
    const names = S.players.length >= 3 ? S.players.map(p => p.name) : ['Maximilian', 'Friederike', 'Konstantin', 'Wilhelmine'];
    const longest = names.reduce((a, c) => (c.length > a.length ? c : a), 'Maximilian');
    return TXT.intro.concat(...Object.values(TXT.nameJokes), [TXT.names, TXT.figures, TXT.seats, TXT.dealer, TXT.sameNo, TXT.prost, TXT.namesWarn.few, TXT.namesWarn.dup,
      fill(TXT.same, { names: listNames(names), dealer: longest }),
      fill(TXT.dealerPicked, { dealer: longest, vh: longest })]);
  },
  fitBanner() {
    const top = $('#intro-top'), bn = $('#intro-banner');
    if (!top || !top.clientWidth) return;
    const probe = bn.cloneNode(true);
    probe.removeAttribute('id'); probe.hidden = false; probe.classList.remove('pop');
    probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;height:auto;box-sizing:border-box;width:' + top.clientWidth + 'px';
    top.appendChild(probe);
    const say = $('.say', probe);
    say.style.minHeight = '0';
    let max = 0;
    this.bannerTexts().forEach(t => { say.textContent = t; max = Math.max(max, probe.offsetHeight); });
    probe.remove();
    bn.style.height = max + 'px';
    top.style.minHeight = Math.max(max, $('.title-block', top).offsetHeight) + 'px';
  },
  setPlain(on, fade) {
    const sc = $('#scr-intro'), bd = document.body;
    clearTimeout(this.fadeT);
    sc.classList.toggle('fading', !!fade); bd.classList.toggle('fading', !!fade);
    sc.classList.toggle('plain', on); bd.classList.toggle('plain', on);
    if (fade) this.fadeT = setTimeout(() => { sc.classList.remove('fading'); bd.classList.remove('fading'); }, 1000);
  },
  begin() {
    if (Stage.scene !== 'empty') return;
    Sound.ensure();
    $('#intro-start').hidden = true;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { Stage.toIdle(); this.setPlain(false); this.openDialog('hello'); return; }
    $('#intro-skip').hidden = false;
    const w = $('#wappen'); w.classList.remove('blow'); void w.offsetWidth; w.classList.add('blow');
    Stage.playIntro(() => this.openDialog('hello'), () => this.setPlain(false, true), () => { $('#intro-skip').hidden = true; });
  },
  skip() {
    this.setPlain(false);
    if (this.opts.replay) { this.endReplay(); return; }
    if (Stage.scene !== 'idle') Stage.toIdle();
    this.openDialog(this.afterHello());
  },
  endReplay() {
    this.opts = {};
    if (S.phase === 'race') Race.show(false);
    else if (S.phase === 'podium') Podium.show(false);
    else { if (Stage.scene !== 'idle') Stage.toIdle(); this.setPlain(false); this.openDialog(this.afterHello()); }
  },
  afterHello() {
    if (this.opts.offerSame && this.canOfferSame()) return 'same';
    return ['names', 'figs', 'seats', 'dealer'].includes(S.step) ? S.step : 'names';
  },
  canOfferSame() { return S.players.length >= 3 && S.players.every(p => p.char); },
  openDialog(step) {
    const bn = $('#intro-banner');
    if (bn.hidden) {
      bn.hidden = false; $('#intro-top').classList.add('talking');
      bn.classList.remove('pop'); void bn.offsetWidth; bn.classList.add('pop');
    }
    $('#intro-dialog').hidden = false;
    if (step === 'hello') S.introLine = 0;
    this.go(step, true);
  },
  go(step, speak) {
    this.step = step;
    if (step !== 'hello') S.step = step;
    saveState();
    $('#intro-skip').hidden = true;
    this.render(speak);
  },
  say(t) { this.k.say(t, { force: true }); },

  ensureDraft() {
    if (typeof S.step !== 'string') S.step = 'hello';
    if (!S.draft) S.draft = {};
    if (!Array.isArray(S.draft.slots)) {
      const names = (S.draft.names || []).filter(n => n && n.trim());
      S.draft.slots = names.map(n => {
        const p = S.players.find(q => q.name.toLowerCase() === n.trim().toLowerCase());
        return { id: p ? p.id : uid(), name: n, char: p ? p.char : null };
      });
    }
    while (S.draft.slots.length < 3) S.draft.slots.push({ id: uid(), name: '', char: null });
  },
  slotsFromPlayers() {
    S.draft.slots = S.players.map(p => ({ id: p.id, name: p.name, char: p.char }));
    while (S.draft.slots.length < 3) S.draft.slots.push({ id: uid(), name: '', char: null });
  },
  freeChar(exceptId) {
    const used = new Set(S.draft.slots.filter(s => s.id !== exceptId && s.char).map(s => s.char));
    const free = CHARS.map(c => c.id).filter(id => !used.has(id));
    return free[Math.floor(Math.random() * free.length)] || CHARS[0].id;
  },
  reasonFor(chId) {
    const c = CHAR_BY_ID[chId];
    return TXT.suitReason[c.suit] + ' ' + pick('role-' + c.role, TXT.roleReason[c.role]);
  },
  castFromSlots() {
    return S.draft.slots.filter(s => s.name.trim()).map(s => ({ key: s.id, char: s.char, name: s.name.trim() }));
  },
  castFromPlayers() { return S.players.map(p => ({ key: p.id, char: p.char, name: p.name })); },

  render(speak) {
    const body = $('#dlg-body');
    const step = this.step;
    const back = $('#dlg-back'), next = $('#dlg-next'), nav = $('#dlg-nav');
    nav.hidden = step === 'same';
    back.hidden = step === 'hello' || (step === 'names' && !(this.opts.offerSame && this.canOfferSame()));
    next.textContent = step === 'dealer' ? 'Los geht\u2019s'
      : (step === 'hello' && this.opts.replay && S.introLine >= TXT.intro.length - 1 && S.phase !== 'onboarding') ? 'Zur\u00fcck zum Spiel' : 'Weiter';
    body.hidden = step === 'hello';
    body.innerHTML = '';

    if (step === 'hello') {
      if (speak) this.say(TXT.intro[S.introLine] || TXT.intro[0]);
      Stage.setCast([], 'row');
    }
    if (step === 'same') {
      const n = S.players.length;
      const nd = ((S.startDealer + S.games.length) % n + n) % n;
      this.nextDealer = nd;
      if (speak) this.say(fill(TXT.same, { names: listNames(S.players.map(p => p.name)), dealer: S.players[nd].name }));
      body.innerHTML = '<div class="panel"><h2>Letzte Runde</h2><div class="same-list" id="same-list"></div>' +
        '<div class="row" style="margin-top:12px"><button class="btn" type="button" data-a="yes">Gleiche Runde</button>' +
        '<button class="btn dark" type="button" data-a="no">Neue Leute</button></div></div>';
      const list = $('#same-list', body);
      S.players.forEach(p => {
        const it = document.createElement('div'); it.className = 'same-item';
        it.appendChild(spriteEl(spriteWalk(p.char, 0), 2));
        const s = document.createElement('span'); s.textContent = p.name; it.appendChild(s);
        list.appendChild(it);
      });
      $('[data-a=yes]', body).addEventListener('click', () => { Sound.play('tap'); S.startDealer = nd; this.finish(); });
      $('[data-a=no]', body).addEventListener('click', () => {
        Sound.play('tap'); this.slotsFromPlayers(); saveState();
        this.go('names', false); this.say(TXT.sameNo);
      });
      Stage.setCast(this.castFromPlayers(), 'table', S.players[nd].id);
    }
    if (step === 'names') {
      if (speak) this.say(TXT.names);
      this.renderNames(body);
      Stage.setCast(this.castFromSlots(), 'row');
    }
    if (step === 'figs') {
      if (speak) this.say(TXT.figures);
      this.renderFigures(body);
      Stage.setCast(this.castFromPlayers(), 'row');
    }
    if (step === 'seats') {
      if (speak) this.say(TXT.seats);
      this.renderSeats(body);
      Stage.setCast(this.castFromPlayers(), 'table');
    }
    if (step === 'dealer') {
      if (speak) this.say(TXT.dealer);
      this.renderDealer(body);
      Stage.setCast(this.castFromPlayers(), 'table', S.players[S.startDealer] ? S.players[S.startDealer].id : null);
    }
  },
  renderNames(body) {
    const slots = S.draft.slots;
    body.innerHTML = '<div class="panel"><h2>Wer spielt mit?</h2><div class="name-list">' +
      slots.map((s, i) => '<div class="name-row"><span class="nr">' + (i + 1) + '</span>' +
        '<input id="name-' + i + '" type="text" maxlength="14" autocomplete="off" autocapitalize="words" placeholder="Name" value="' + esc(s.name) + '" aria-label="Name Spieler ' + (i + 1) + '">' +
        (slots.length > 3 ? '<button class="xbtn" type="button" data-rm="' + i + '" aria-label="Spieler entfernen">×</button>' : '') + '</div>').join('') +
      '</div>' + (slots.length < 6 ? '<button class="addbtn" type="button" id="add-name">+ Noch jemand</button>' : '') +
      '<p class="hint">Drei bis sechs Leute. Bei vier und mehr setzt reihum der Geber aus, ab fünf auch noch jemand.</p></div>';
    $$('input', body).forEach((inp, i) => {
      inp.addEventListener('input', () => {
        const s = S.draft.slots[i];
        s.name = inp.value;
        if (s.name.trim() && !s.char) s.char = this.freeChar(s.id);
        if (!s.name.trim()) s.char = null;
        saveState();
        Stage.setCast(this.castFromSlots(), 'row');
        this.checkNameJoke(s, false);
      });
      inp.addEventListener('blur', () => this.checkNameJoke(S.draft.slots[i], true));
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); const nx = $('#name-' + (i + 1)); if (nx) nx.focus(); else this.next(); }
      });
    });
    $$('[data-rm]', body).forEach(b => b.addEventListener('click', () => {
      S.draft.slots.splice(+b.dataset.rm, 1); saveState(); this.render(false);
    }));
    const add = $('#add-name', body);
    if (add) add.addEventListener('click', () => {
      S.draft.slots.push({ id: uid(), name: '', char: null }); saveState(); this.render(false);
      $('#name-' + (S.draft.slots.length - 1)).focus();
    });
  },
  /* Bestimmte Namen bekommen einen Spruch: nach kurzer Tipp-Pause oder beim Verlassen des Feldes,
     jeder Name einmal pro Eingabe. */
  checkNameJoke(s, now) {
    if (!s) return;
    if (!this.jokeDone) this.jokeDone = new Map();
    clearTimeout(this.jokeT);
    const key = jokeKeyOf(s.name);
    if (!key) { this.jokeDone.delete(s.id); return; }
    if (this.jokeDone.get(s.id) === key) return;
    const fire = () => {
      if (jokeKeyOf(s.name) !== key || this.jokeDone.get(s.id) === key || this.step !== 'names') return;
      this.jokeDone.set(s.id, key);
      this.say(nextNameJoke(key));
    };
    if (now) fire(); else this.jokeT = setTimeout(fire, 1000);
  },
  renderFigures(body) {
    body.innerHTML = '<div class="panel"><h2>Eure Figuren</h2><div class="fig-list" id="figlist"></div></div>';
    const list = $('#figlist', body);
    S.players.forEach(p => {
      const row = document.createElement('div');
      row.className = 'fig-row';
      row.innerHTML = '<div class="fsp-card"></div>' +
        '<div class="ftxt"><div class="fname">' + esc(p.name) + '</div><div class="fchar">' + esc(charName(p.char)) + '</div><div class="freason">' + esc(p.reason || '') + '</div></div>' +
        '<button class="btn small dark" type="button">' + (this.pickFor === p.id ? 'Fertig' : 'Tauschen') + '</button>';
      $('.fsp-card', row).appendChild(portraitCard(p.char, 1.15));
      $('button', row).addEventListener('click', () => { Sound.play('tap'); this.pickFor = this.pickFor === p.id ? null : p.id; this.renderFigures(body); });
      if (this.pickFor === p.id) {
        const pk = document.createElement('div');
        pk.className = 'picker';
        CHARS.forEach(c => {
          const owner = S.players.find(q => q.char === c.id);
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'pick' + (owner && owner.id === p.id ? ' cur' : '');
          b.appendChild(spriteEl(spriteWalk(c.id, 0), 2));
          const t = document.createElement('span'); t.textContent = charName(c.id); b.appendChild(t);
          if (owner && owner.id !== p.id) { const o = document.createElement('span'); o.className = 'taken'; o.textContent = owner.name; b.appendChild(o); }
          b.addEventListener('click', () => {
            Sound.play('tap');
            if (owner && owner.id !== p.id) { owner.char = p.char; owner.reason = this.reasonFor(owner.char); }
            p.char = c.id; p.reason = this.reasonFor(c.id);
            this.pickFor = null; saveState(); this.renderFigures(body);
            Stage.setCast(this.castFromPlayers(), 'row');
          });
          pk.appendChild(b);
        });
        row.appendChild(pk);
      }
      list.appendChild(row);
    });
  },
  renderSeats(body) {
    const ps = S.players;
    body.innerHTML = '<div class="panel"><h2>Sitzordnung im Uhrzeigersinn</h2><div class="seatchips">' +
      ps.map((p, i) => '<button type="button" class="chip' + (this.sel === i ? ' on' : '') + '" data-i="' + i + '"><small>' + (i + 1) + '</small>' + esc(p.name) + '</button>').join('<span class="arr" aria-hidden="true">→</span>') +
      '<span class="arr" aria-hidden="true">↻</span></div>' +
      '<p class="hint">' + (this.sel !== null ? esc(ps[this.sel].name) + ' ausgewählt. Jetzt antippen, mit wem getauscht wird.' : 'Zwei Namen antippen, um die Plätze zu tauschen. Gegeben wird in dieser Reihenfolge.') + '</p></div>';
    $$('[data-i]', body).forEach(b => b.addEventListener('click', () => {
      Sound.play('tap');
      const i = +b.dataset.i;
      if (this.sel === null) this.sel = i;
      else if (this.sel === i) this.sel = null;
      else { const t = S.players[this.sel]; S.players[this.sel] = S.players[i]; S.players[i] = t; this.sel = null; saveState(); }
      this.renderSeats(body);
      Stage.setCast(this.castFromPlayers(), 'table');
    }));
  },
  renderDealer(body) {
    const ps = S.players, n = ps.length, d = S.startDealer;
    const pos = i => {
      const rel = ((i - d) % n + n) % n;
      if (rel === 0) return n === 3 ? 'GIBT, HH' : 'GIBT';
      return rel <= 3 ? ['', 'VH', 'MH', 'HH'][rel] : 'PAUSE';
    };
    body.innerHTML = '<div class="panel"><h2>Wer gibt zuerst?</h2><div class="chips">' +
      ps.map((p, i) => '<button type="button" class="chip' + (i === d ? ' on' : '') + '" data-d="' + i + '">' + esc(p.name) + ' <small>' + pos(i) + '</small></button>').join('') +
      '</div><p class="hint">Danach wandert das Geben im Uhrzeigersinn weiter. VH, MH und HH stehen für Vorhand, Mittelhand und Hinterhand im ersten Spiel.</p></div>';
    $$('[data-d]', body).forEach(b => b.addEventListener('click', () => {
      Sound.play('tap');
      const i = +b.dataset.d;
      S.startDealer = i; saveState();
      this.renderDealer(body);
      Stage.setCast(this.castFromPlayers(), 'table', S.players[i].id);
      this.say(fill(TXT.dealerPicked, { dealer: S.players[i].name, vh: S.players[(i + 1) % n].name }));
    }));
  },
  next() {
    const step = this.step;
    if (step === 'hello') {
      if (S.introLine < TXT.intro.length - 1) { S.introLine++; saveState(); this.render(true); return; }
      if (this.opts.replay) { this.endReplay(); return; }
      this.go(this.afterHello(), true); return;
    }
    if (step === 'names') {
      const filled = S.draft.slots.filter(s => s.name.trim());
      if (filled.length < 3) { this.say(TXT.namesWarn.few); return; }
      const low = filled.map(s => s.name.trim().toLowerCase());
      if (new Set(low).size !== low.length) { this.say(TXT.namesWarn.dup); return; }
      const old = S.players;
      S.players = filled.map(s => {
        const prev = old.find(p => p.id === s.id);
        const char = s.char || this.freeChar(s.id);
        s.char = char;
        return { id: s.id, name: s.name.trim(), char, reason: prev && prev.char === char && prev.reason ? prev.reason : this.reasonFor(char) };
      });
      if (S.startDealer >= S.players.length) S.startDealer = 0;
      this.sel = null; this.pickFor = null;
      this.fitBanner();
      this.go('figs', true); return;
    }
    if (step === 'figs') { this.pickFor = null; this.sel = null; this.go('seats', true); return; }
    if (step === 'seats') { this.sel = null; this.go('dealer', true); return; }
    if (step === 'dealer') { this.finish(); }
  },
  back() {
    const step = this.step;
    this.sel = null; this.pickFor = null;
    if (step === 'names' && this.opts.offerSame && this.canOfferSame()) { this.go('same', true); return; }
    if (step === 'figs') { this.slotsFromPlayers(); this.go('names', true); return; }
    if (step === 'seats') { this.go('figs', true); return; }
    if (step === 'dealer') { this.go('seats', true); return; }
  },
  finish() {
    if (this.finishing) return;
    this.finishing = true;
    $('#dlg-next').disabled = true;
    $$('#dlg-body button').forEach(b => { b.disabled = true; });
    this.say(TXT.prost);
    Stage.cheer();
    Sound.play('up');
    /* Drei Sekunden zum Lesen; Antippen des Banners geht sofort weiter */
    const wait = 3000;
    this.finishT = setTimeout(() => this.goRace(), wait);
  },
  goRace() {
    if (!this.finishing) return;
    clearTimeout(this.finishT);
    this.finishing = false;
    $('#dlg-next').disabled = false;
    S.step = 'hello';
    startGame();
  }
};

function jokeKeyOf(name) {
  const k = (name || '').trim().toLowerCase();
  if (TXT.nameJokes[k]) return k;
  return TXT.nameAlias[k] || null;
}

function nextNameJoke(key) {
  const KEY = 'naunin-skatrennen-witze';
  const list = TXT.nameJokes[key];
  let all = {};
  try { all = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { all = {}; }
  const first = !Array.isArray(all[key]);
  let bag = (all[key] || []).filter(i => i >= 0 && i < list.length);
  if (!bag.length) {
    bag = list.map((_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (first) bag = [0].concat(bag.filter(i => i !== 0));
  }
  const pick = bag.shift();
  all[key] = bag;
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* egal */ }
  return list[pick];
}

function startGame() {
  S.phase = 'race'; S.games = []; S.finishedAt = null; S.lateSaid = false;
  saveState();
  Race.show(true);
  const d = S.players[curSeat().dealer];
  Race.k.say(fill(TXT.start, { dealer: d ? d.name : '' }));
}
