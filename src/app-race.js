/* ===== Rennbahn ===== */
const FONT3 = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
  '-': ['000', '000', '111', '000', '000'], '+': ['000', '010', '111', '010', '000']
};
function drawNum(b, str, x, y, color, shadow) {
  str = String(str);
  const w = str.length * 4 - 1;
  let cx = Math.round(x - w / 2);
  for (const ch of str) {
    const gl = FONT3[ch];
    if (gl) for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) if (gl[yy][xx] === '1') {
      if (shadow) { b.fillStyle = shadow; b.fillRect(cx + xx + 1, y + yy + 1, 1, 1); }
      b.fillStyle = color; b.fillRect(cx + xx, y + yy, 1, 1);
    }
    cx += 4;
  }
  return w;
}
function hash2(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177 | 0; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

function skyPalette(d) {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 7.5 && h < 17.5) return { bands: ['#4f8fe0', '#68a6ec', '#86bcf2', '#a8d2f6'], sun: true, hill: '#3f7a4a', hill2: '#56935a', castle: '#7d7a96', castle2: '#5f5c7a', win: '#2b2840', label: '#1b1427', lshadow: '#e8f4ff' };
  if (h >= 17.5 && h < 20.5) return { bands: ['#2c2c6a', '#6a3f7e', '#c0607a', '#f0a070'], sun: false, dusk: true, hill: '#2e3f4a', hill2: '#3f5560', castle: '#3b3150', castle2: '#2a2240', win: '#f5c542', label: '#fff1d0', lshadow: '#1b1427' };
  if (h >= 5 && h < 7.5) return { bands: ['#232456', '#4a3f78', '#a07090', '#f0b890'], sun: false, dusk: true, hill: '#2a3a46', hill2: '#3a4e5a', castle: '#3b3150', castle2: '#2a2240', win: '#f5c542', label: '#fff1d0', lshadow: '#1b1427' };
  return { bands: ['#0c0a22', '#14123a', '#1d1b4a', '#28265c'], stars: true, moon: isLate(d), hill: '#141a2e', hill2: '#1c243a', castle: '#211c3c', castle2: '#17132c', win: '#f5c542', label: '#e9e2ff', lshadow: '#0c0a22' };
}

const TIER_LABEL = { walk: 'zu Fu\u00df', ride: 'zu Pferd', unicorn: 'auf dem Einhorn', glow: 'auf dem Einhorn und leuchtet', zombie: 'kriecht als Zombie', swamp: 'versinkt im Moor' };

const Race = {
  k: null, SKY: 30, LANE: 32, ML: 14, MR: 20,
  figs: new Map(), view: { lo: -80, hi: 400 }, viewT: { lo: -80, hi: 400 },
  running: false, lastDraw: 0, W: 0, H: 0, scale: 1, kc: 1,

  init() {
    this.k = new Kiebitz($('#scr-race [data-kiebitz]'));
    this.wrap = $('#race-wrap'); this.cv = $('#race-cv'); this.ctx = this.cv.getContext('2d');
    this.ov = $('#race-ov');
    this.buf = document.createElement('canvas'); this.bctx = this.buf.getContext('2d');
    $('#btn-list').innerHTML = pixelIcon(ICONS.list, '#efe7d3');
    $('#btn-settings').innerHTML = pixelIcon(ICONS.gear, '#efe7d3');
    $('#btn-enter').addEventListener('click', () => { Sound.play('tap'); Entry.open(null); });
    $('#btn-undo').addEventListener('click', () => { Sound.play('tap'); this.askUndo(); });
    $('#btn-eval').addEventListener('click', () => { Sound.play('tap'); askEvaluate(); });
    $('#btn-list').addEventListener('click', () => { Sound.play('tap'); openList(); });
    $('#btn-settings').addEventListener('click', () => { Sound.play('tap'); openSettings(); });
    $('#btn-sound').addEventListener('click', () => { S.settings.sound = !S.settings.sound; saveState(); this.updateToggles(); Sound.play('blip'); });
    $('#btn-mute').addEventListener('click', () => {
      S.settings.kiebitz = !S.settings.kiebitz; saveState(); this.updateToggles();
      this.k.refresh();
      if (S.settings.kiebitz) this.k.say(TXT.naunin.muteOff); else this.k.say(TXT.naunin.muteOn, { force: true });
      if (!S.settings.kiebitz) $$('.bubble', this.ov).forEach(b => b.remove());
    });
    let rt = null;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S.phase === 'race') this.layout(); }, 120); });
    this.updateToggles();
  },
  updateToggles() {
    const s = $('#btn-sound'), m = $('#btn-mute');
    s.innerHTML = pixelIcon(S.settings.sound ? ICONS.sound : ICONS.mute, '#efe7d3');
    s.setAttribute('aria-pressed', String(S.settings.sound));
    m.innerHTML = pixelIcon(S.settings.kiebitz ? ICONS.beak : ICONS.beakTape, '#efe7d3');
    m.setAttribute('aria-pressed', String(S.settings.kiebitz));
    m.title = S.settings.kiebitz ? 'Kiebitz, halt’s Maul' : 'Kiebitz darf wieder reden';
    m.setAttribute('aria-label', m.title);
    s.title = S.settings.sound ? 'Ton aus' : 'Ton an';
  },

  show(fresh) {
    showScreen('race');
    this.build();
    this.layout();
    this.updateUI();
    this.start();
    if (!fresh) this.k.say(pick('wb', TXT.welcomeBack));
    else this.runIn();
  },
  build() {
    this.figs.clear();
    this.ov.innerHTML = '';
    const st = stats();
    S.players.forEach((p, i) => {
      const label = document.createElement('div');
      label.className = 'flabel';
      this.ov.appendChild(label);
      const sc = st[p.id].score;
      this.figs.set(p.id, { id: p.id, lane: i, disp: sc, from: sc, to: sc, t0: 0, dur: 0, label, phase: Math.random() * 3000, tier: tierOf(sc, S.settings), lastX: 0 });
    });
    this.snapView();
  },
  /* Start: alle laufen von links an die Startlinie, Naunin schwenkt die Flagge */
  runIn() {
    const now = performance.now();
    const span = this.view.hi - this.view.lo;
    let i = 0;
    for (const f of this.figs.values()) {
      f.entering = true; f.from = this.view.lo - span * 0.22; f.disp = f.from;
      f.t0 = now + 350 + i * 140; f.dur = 1500; i++;
    }
    this.flagT = now;
    setTimeout(() => Sound.play('gallop'), 350);
  },
  layout() {
    const cssW = this.wrap.clientWidth;
    if (!cssW) return;
    const dpr = window.devicePixelRatio || 1;
    const kCss = clamp(cssW / 195, 1.8, 3.2);
    this.scale = Math.max(1, Math.round(kCss * dpr));
    this.W = Math.ceil(cssW * dpr / this.scale);
    this.H = this.SKY + S.players.length * this.LANE + 9;
    this.buf.width = this.W; this.buf.height = this.H;
    this.cv.width = this.W * this.scale; this.cv.height = this.H * this.scale;
    this.kc = this.scale / dpr;
    const cw = this.W * this.kc, ch = this.H * this.kc;
    this.cv.style.width = cw + 'px'; this.cv.style.height = ch + 'px';
    this.ov.style.width = cw + 'px'; this.ov.style.height = ch + 'px';
    this.wrap.style.height = ch + 'px';
    this.draw(performance.now());
  },
  targetView() {
    let mn = 0, mx = 0;
    for (const f of this.figs.values()) { mn = Math.min(mn, f.to, f.entering ? f.to : f.disp); mx = Math.max(mx, f.to, f.entering ? f.to : f.disp); }
    const span = Math.max(mx - mn, 200);
    return { lo: mn - span * 0.12 - 22, hi: mx + span * 0.2 + 20 };
  },
  snapView() { const t = this.targetView(); this.view = { lo: t.lo, hi: t.hi }; this.viewT = t; },
  X(v) { return this.ML + (v - this.view.lo) / (this.view.hi - this.view.lo) * (this.W - this.ML - this.MR); },
  start() {
    if (this.running) return;
    this.running = true;
    const loop = now => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      const moving = this.anyMoving(now) || Math.abs(this.view.lo - this.viewT.lo) + Math.abs(this.view.hi - this.viewT.hi) > 0.5;
      if (!moving && now - this.lastDraw < 100) return;
      this.lastDraw = now;
      this.draw(now);
    };
    requestAnimationFrame(loop);
  },
  stop() { this.running = false; },
  anyMoving(now) { for (const f of this.figs.values()) if (f.dur && now - f.t0 < f.dur) return true; return false; },

  /* Punkte neu übernehmen und Figuren laufen lassen */
  sync() {
    const st = stats();
    const now = performance.now();
    let maxDur = 0;
    for (const f of this.figs.values()) {
      const target = st[f.id].score;
      if (target !== f.to || f.disp !== target) {
        f.from = f.disp; f.to = target; f.t0 = now;
        f.dur = clamp(800 + Math.abs(target - f.from) * 3, 900, 2400);
        maxDur = Math.max(maxDur, f.dur);
      }
    }
    this.viewT = this.targetView();
    this.updateUI();
    return maxDur;
  },
  updateUI() {
    const st = stats();
    const n = S.players.length;
    const si = curSeat();
    const dealer = S.players[si.dealer], vh = S.players[si.active[0]];
    let status = 'Spiel <b>' + (S.games.length + 1) + '</b> \u00b7 Geber <b>' + esc(dealer.name) + '</b> · Vorhand <b>' + esc(vh.name) + '</b>';
    if (n > 3) status += ' · Pause <b>' + esc(listNames(si.out.map(i => S.players[i].name))) + '</b>';
    this.k.setStatus(status);
    /* Labels */
    S.players.forEach((p, i) => {
      const f = this.figs.get(p.id); if (!f) return;
      const out = si.out.includes(i);
      f.out = out; f.dealer = i === si.dealer;
      const sc = st[p.id].score;
      f.label.className = 'flabel' + (out ? ' out' : '');
      f.label.innerHTML = (f.dealer ? '<span class="deal" title="gibt"></span>' : '') + esc(p.name) + ' <span class="sc' + (sc < 0 ? ' neg' : '') + '">' + fmtScore(sc) + '</span>';
      f.streak = st[p.id].streak;
      f._lx = -1;
    });
    /* Rangliste */
    const order = S.players.slice().sort((a, b) => st[b.id].score - st[a.id].score);
    const box = $('#standings');
    box.innerHTML = '';
    let rank = 0, prev = null;
    order.forEach((p, idx) => {
      const s = st[p.id];
      if (prev === null || s.score !== prev) rank = idx + 1;
      prev = s.score;
      const tier = tierOf(s.score, S.settings);
      const row = document.createElement('div');
      row.className = 'st-row';
      const tags = (s.streak >= 3 ? '<span class="tag fire">' + s.streak + ' IN FOLGE</span>' : '') + (s.streak <= -3 ? '<span class="tag rain">PECH</span>' : '');
      row.innerHTML = '<span class="rk">' + rank + '</span><span class="sp"></span>' +
        '<span class="nm"><b>' + esc(p.name) + tags + '</b><small>' + esc(charName(p.char)) + ', ' + TIER_LABEL[tier] + '</small></span>' +
        '<span class="pts"><span class="' + (s.score < 0 ? 'neg' : '') + '">' + fmtScore(s.score) + '</span>' +
        (S.games.length ? '<small>' + spiele(s.played) + '</small>' : '') + '</span>';
      $('.sp', row).appendChild(spriteEl(spriteWalk(p.char, 0, s.score < 0), 2));
      box.appendChild(row);
    });
    $('#btn-undo').disabled = !S.games.length;
    $('#btn-enter').textContent = S.settings.manual ? 'Punkte eintragen' : 'Spiel eintragen';
  },

  /* ---------- Zeichnen ---------- */
  draw(now) {
    const b = this.bctx, W = this.W, H = this.H, SKY = this.SKY, LANE = this.LANE;
    if (!W) return;
    this.view.lo += (this.viewT.lo - this.view.lo) * 0.1;
    this.view.hi += (this.viewT.hi - this.view.hi) * 0.1;
    const date = new Date();
    const pal = skyPalette(date);
    /* Himmel */
    const bandH = Math.ceil(SKY / 4);
    pal.bands.forEach((c, i) => { b.fillStyle = c; b.fillRect(0, i * bandH, W, bandH); });
    if (pal.stars) {
      for (let i = 0; i < 34; i++) {
        const sx = Math.floor(hash2(i, 3) * W), sy = Math.floor(hash2(i, 7) * (SKY - 12));
        if ((i + Math.floor(now / 700)) % 9 === 0) continue;
        b.fillStyle = i % 5 === 0 ? '#f5c542' : '#d8d4f0';
        b.fillRect(sx, sy, 1, 1);
      }
    }
    if (pal.moon) {
      const mx = Math.round(W * 0.16), my = 8;
      b.fillStyle = '#f4ead2';
      for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 17) b.fillRect(mx + xx, my + yy, 1, 1);
      b.fillStyle = pal.bands[0];
      for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if ((xx - 2) * (xx - 2) + (yy + 1) * (yy + 1) <= 12) b.fillRect(mx + xx, my + yy, 1, 1);
    }
    if (pal.sun) {
      const mx = Math.round(W * 0.16), my = 9;
      b.fillStyle = '#ffe28a';
      for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 14) b.fillRect(mx + xx, my + yy, 1, 1);
      const ph = Math.floor(now / 400) % 2;
      b.fillStyle = '#f5c542';
      [[0, -7], [0, 6], [-7, 0], [6, 0], [-5, -5], [4, -5], [-5, 4], [4, 4]].forEach(([dx, dy], i) => { if ((i + ph) % 2) b.fillRect(mx + dx, my + dy, 1, 1); });
    }
    /* Hügel und Burg */
    for (let x = 0; x < W; x++) {
      const hy = Math.round(SKY - 5 - 2 - 2 * Math.sin(x * 0.06) - 1.5 * Math.sin(x * 0.17 + 1));
      b.fillStyle = pal.hill2; b.fillRect(x, hy, 1, SKY - hy);
      const hy2 = Math.round(SKY - 3 - 1.5 * Math.sin(x * 0.11 + 2));
      b.fillStyle = pal.hill; b.fillRect(x, hy2, 1, SKY - hy2);
    }
    this.drawCastle(b, W - 30, SKY - 3, pal, now);
    /* Bahnen */
    const zx = Math.round(this.X(0));
    S.players.forEach((p, i) => {
      const y0 = SKY + i * LANE;
      const even = i % 2 === 0;
      b.fillStyle = even ? '#4f8a3a' : '#5a9542'; b.fillRect(zx, y0, W - zx, LANE);
      b.fillStyle = even ? '#34402a' : '#3a4630'; b.fillRect(0, y0, zx, LANE);
      b.fillStyle = '#2c5a24'; b.fillRect(zx, y0, W - zx, 1);
      b.fillStyle = '#232c1c'; b.fillRect(0, y0, zx, 1);
      const py = y0 + LANE - 8;
      b.fillStyle = '#9c7646'; b.fillRect(zx, py, W - zx, 5);
      b.fillStyle = '#b8905a'; b.fillRect(zx, py, W - zx, 1);
      b.fillStyle = '#4a3c2a'; b.fillRect(0, py, zx, 5);
      b.fillStyle = '#5a4a32'; b.fillRect(0, py, zx, 1);
      for (let x = 2; x < W; x += 5) {
        const r = hash2(x, i + 11);
        const yy = y0 + 3 + Math.floor(hash2(x, i + 29) * (LANE - 13));
        if (x >= zx) {
          if (r < 0.22) { b.fillStyle = '#3c7a2c'; b.fillRect(x, yy, 1, 2); b.fillRect(x + 1, yy + 1, 1, 1); }
          else if (r < 0.26) { b.fillStyle = ['#f4ead2', '#f5c542', '#e86a8a'][Math.floor(r * 100) % 3]; b.fillRect(x, yy, 1, 1); b.fillStyle = '#3c7a2c'; b.fillRect(x, yy + 1, 1, 1); }
          else if (r > 0.985) { b.fillStyle = '#2f6a26'; b.fillRect(x - 1, yy + 1, 4, 2); b.fillRect(x, yy, 2, 1); }
          if (hash2(x, i + 47) < 0.18) { b.fillStyle = '#87643a'; b.fillRect(x, py + 2 + Math.floor(r * 3), 1, 1); }
        } else {
          if (r < 0.2) { b.fillStyle = '#5c6a36'; b.fillRect(x, yy, 1, 3); b.fillStyle = '#7a6a3a'; b.fillRect(x, yy - 1, 1, 1); }
          else if (r < 0.27) {
            const ph = Math.floor((now + x * 97) / 350) % 6;
            if (ph < 3) { b.fillStyle = '#6a7a4a'; b.fillRect(x, yy + 4 - ph, 1, 1); }
          } else if (r > 0.975 && x < zx - 6) {
            b.fillStyle = '#7a7890'; b.fillRect(x, yy, 3, 5); b.fillRect(x + 1, yy - 1, 1, 1);
            b.fillStyle = '#4a4860'; b.fillRect(x + 1, yy + 1, 1, 3); b.fillRect(x, yy + 2, 3, 1);
          }
        }
      }
    });
    /* Fußleiste */
    const fy = SKY + S.players.length * this.LANE;
    b.fillStyle = '#1e1812'; b.fillRect(0, fy, W, H - fy);
    b.fillStyle = '#2e241a'; b.fillRect(0, fy, W, 1);
    /* Meilensteine */
    const span = this.view.hi - this.view.lo;
    const steps = [25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
    let step = steps.find(s => span / s <= 5) || 10000;
    for (let v = Math.ceil(this.view.lo / step) * step; v <= this.view.hi; v += step) {
      if (v === 0) continue;
      const x = Math.round(this.X(v));
      if (x < 6 || x > W - 6) continue;
      for (let i = 0; i < S.players.length; i++) {
        const y0 = SKY + i * this.LANE;
        b.fillStyle = v < 0 ? '#2a2418' : '#6a4a2a';
        b.fillRect(x, y0 + this.LANE - 11, 1, 4);
        b.fillStyle = v < 0 ? '#3a3424' : '#8a6438';
        b.fillRect(x - 1, y0 + this.LANE - 11, 3, 1);
      }
      drawNum(b, v, x, H - 7, v < 0 ? '#ff8a7a' : '#e6d6a8');
    }
    /* Startlinie */
    for (let y = SKY; y < fy; y += 2) {
      b.fillStyle = (y / 2) % 2 ? '#f4ead2' : '#1b1427'; b.fillRect(zx, y, 1, 2);
      b.fillStyle = (y / 2) % 2 ? '#1b1427' : '#f4ead2'; b.fillRect(zx + 1, y, 1, 2);
    }
    b.fillStyle = '#1b1427'; b.fillRect(zx, SKY - 14, 1, 14);
    b.fillStyle = '#f5c542'; b.fillRect(zx + 1, SKY - 14, 9, 7);
    b.fillStyle = '#b9852a'; b.fillRect(zx + 1, SKY - 8, 9, 1);
    drawNum(b, '0', zx + 5, SKY - 13, '#1b1427');
    b.fillStyle = '#1e1812'; b.fillRect(zx - 3, H - 8, 8, 8);
    drawNum(b, '0', zx + 1, H - 7, '#f5c542');
    this.drawNaunin(b, zx, SKY, now);
    /* Figuren */
    const frames = [];
    S.players.forEach((p, i) => {
      const f = this.figs.get(p.id); if (!f) return;
      let moving = false;
      if (f.dur) {
        const t = (now - f.t0) / f.dur;
        if (t >= 1) { f.disp = f.to; f.dur = 0; f.entering = false; }
        else if (t < 0) { f.disp = f.from; moving = false; }
        else { const e = f.entering ? t : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); f.disp = f.from + (f.to - f.from) * e; moving = true; }
      }
      let tier = tierOf(Math.round(f.disp), S.settings);
      if (tier === 'swamp' && moving) tier = 'zombie';
      if (f.entering) tier = 'walk';
      f.tier = tier;
      const x = this.X(f.disp);
      const yb = SKY + i * this.LANE + this.LANE - 4;
      const uni = tier === 'unicorn' || (tier === 'glow' && Math.round(f.disp) >= (S.settings.einhorn || 300));
      let spr, bob = 0;
      if (tier === 'zombie') spr = spriteCrawl(p.char, moving ? Math.floor(now / 240) % 2 : Math.floor((now + f.phase) / 1200) % 2);
      else if (tier === 'swamp') spr = spriteWalk(p.char, 0, true);
      else if (tier === 'walk') { const fr = moving ? Math.floor(now / 130) % 2 : 0; spr = spriteWalk(p.char, fr); bob = moving ? -(fr) : 0; }
      else { const fr = moving ? Math.floor(now / 110) % 2 : 0; spr = spriteRide(p.char, fr, uni); bob = moving ? -fr : 0; }
      let sx = Math.round(x - spr.width / 2), sy = yb - spr.height + 1 + bob;
      if (tier === 'swamp') {
        const sink = Math.floor((now + f.phase) / 700) % 2;
        sy = yb - 14 + sink;
        if (f.out) b.globalAlpha = 0.5;
        this.drawSwamp(b, Math.round(x), yb, spr, sx, sy, now, f.phase);
        b.globalAlpha = 1;
        frames.push({ f, x, top: sy });
        return;
      }
      if (uni) this.drawRainbow(b, sx, sy, now, f.phase, moving, f.to < f.from);
      /* Staub */
      if (moving && tier !== 'zombie') {
        const ph = Math.floor(now / 90) % 3;
        b.fillStyle = 'rgba(230,214,170,0.7)';
        const dir = f.to >= f.from ? -1 : 1;
        const bx = dir < 0 ? sx - 2 : sx + spr.width + 1;
        b.fillRect(bx + dir * ph, yb - 1 - (ph % 2), 2, 1);
        b.fillRect(bx + dir * (ph + 2), yb - 2, 1, 1);
      }
      if (f.out) b.globalAlpha = 0.5;
      if (tier === 'glow') {
        const pulse = 0.45 + 0.35 * Math.sin(now / 260 + f.phase);
        const sil = silhouette(spr, '#ffe070');
        b.globalAlpha = (f.out ? 0.5 : 1) * pulse;
        b.drawImage(sil, sx - 1, sy); b.drawImage(sil, sx + 1, sy); b.drawImage(sil, sx, sy - 1); b.drawImage(sil, sx, sy + 1);
        b.globalAlpha = f.out ? 0.5 : 1;
      }
      if (f.streak >= 3) this.drawFire(b, sx, sy, spr, now, f.phase);
      b.drawImage(spr, sx, sy);
      if (tier === 'glow') {
        const k = Math.floor((now + f.phase) / 180);
        for (let j = 0; j < 3; j++) {
          const rx = sx + Math.floor(hash2(k, j) * (spr.width + 6)) - 3, ry = sy + Math.floor(hash2(j, k) * spr.height);
          b.fillStyle = j ? '#fff6c0' : '#f5c542'; b.fillRect(rx, ry, 1, 1);
        }
      }
      if (f.streak <= -3) this.drawCloud(b, Math.round(x), sy - 6, now, f.phase);
      if (f.out) {
        const zz = Math.floor((now + f.phase) / 500) % 3;
        b.fillStyle = '#e9e2ff';
        const zx2 = sx + spr.width - 2 + zz, zy2 = sy - 2 - zz * 2;
        b.fillRect(zx2, zy2, 3, 1); b.fillRect(zx2 + 1, zy2 + 1, 1, 1); b.fillRect(zx2, zy2 + 2, 3, 1);
      }
      b.globalAlpha = 1;
      frames.push({ f, x, top: sy });
    });
    /* Ausgabe */
    const c = this.ctx;
    c.imageSmoothingEnabled = false;
    c.drawImage(this.buf, 0, 0, W * this.scale, H * this.scale);
    /* Overlay */
    const kc = this.kc, ovW = W * kc;
    frames.forEach(({ f, x, top }) => {
      const lx = clamp(x * kc, 4 + f.label.offsetWidth / 2, ovW - 4 - f.label.offsetWidth / 2);
      const ly = Math.max((top - (f.streak <= -3 ? 9 : 0)) * kc - 3, f.label.offsetHeight + 1);
      if (Math.abs(lx - (f._lx || 0)) > 0.3 || Math.abs(ly - (f._ly || 0)) > 0.3) {
        f.label.style.transform = 'translate(' + (lx - f.label.offsetWidth / 2).toFixed(1) + 'px,' + (ly - f.label.offsetHeight).toFixed(1) + 'px)';
        f._lx = lx; f._ly = ly;
      }
      if (f.bubble) {
        const bw = f.bubble.offsetWidth;
        const left = clamp(x * kc - bw / 2, 4, ovW - bw - 4);
        const btop = ly - f.label.offsetHeight - 4;
        f.bubble.style.left = left.toFixed(1) + 'px';
        f.bubble.style.top = Math.max(btop, f.bubble.offsetHeight + 2).toFixed(1) + 'px';
        f.bubble.style.setProperty('--ax', clamp(x * kc - left, 10, bw - 10).toFixed(1) + 'px');
      }
    });
  },
  drawCastle(b, x, y, pal, now) {
    const c1 = pal.castle, c2 = pal.castle2;
    b.fillStyle = c1;
    b.fillRect(x + 4, y - 12, 20, 12);
    b.fillRect(x, y - 18, 7, 18); b.fillRect(x + 21, y - 18, 7, 18);
    b.fillRect(x + 11, y - 22, 6, 10);
    for (let i = 0; i < 4; i++) { b.fillRect(x + i * 2, y - 20, 1, 2); b.fillRect(x + 21 + i * 2, y - 20, 1, 2); }
    for (let i = 0; i < 10; i++) if (i % 2 === 0) b.fillRect(x + 4 + i * 2, y - 14, 2, 2);
    b.fillRect(x + 11, y - 24, 1, 2); b.fillRect(x + 13, y - 24, 1, 2); b.fillRect(x + 15, y - 24, 1, 2);
    b.fillStyle = c2;
    b.fillRect(x + 6, y - 1, 16, 1); b.fillRect(x + 12, y - 6, 4, 6);
    b.fillStyle = pal.win;
    b.fillRect(x + 3, y - 13, 1, 2); b.fillRect(x + 24, y - 13, 1, 2); b.fillRect(x + 13, y - 19, 2, 2);
    /* Fahne */
    const ph = Math.floor(now / 300) % 2;
    b.fillStyle = '#1b1427'; b.fillRect(x + 14, y - 31, 1, 9);
    b.fillStyle = '#d63c3c'; b.fillRect(x + 15, y - 31, 5, 2); b.fillRect(x + 15, y - 29, 4 + ph, 1);
    b.fillStyle = '#f5c542'; b.fillRect(x + 16, y - 30, 1, 1);
  },
  drawNaunin(b, zx, SKY, now) {
    let nx = zx + 12;
    if (nx + 26 > this.W - 32) nx = zx - 30;
    const hopDt = now - (this.nauHopT || -1e9);
    const hop = hopDt < 360 ? Math.round(Math.sin(hopDt / 360 * Math.PI) * 4) : 0;
    const top = SKY - 23 - hop;
    const waving = now - (this.flagT || -1e9) < 2600;
    b.drawImage(spriteWalk('naunin-stand', 0), nx, top);
    /* Hand und Zielflagge */
    b.fillStyle = '#f5c542'; b.fillRect(nx + 13, top + 18, 1, 1);
    b.fillStyle = '#2f4aa0'; b.fillRect(nx + 14, top + 18, 1, 1);
    const up = waving && Math.floor(now / 160) % 2 === 0;
    const hx = nx + 15, hy = up ? top + 9 : top + 13;
    b.fillStyle = '#1b1427'; b.fillRect(nx + 13, hy - 1, 4, top + 16 - hy);
    b.fillStyle = '#f5c542'; b.fillRect(nx + 14, hy, 1, top + 15 - hy);
    b.fillStyle = '#f3c99b'; b.fillRect(hx, hy, 1, 1);
    b.fillStyle = '#5a3420'; b.fillRect(hx + 1, hy - 9, 1, 10);
    const fw = 7, fh = 5, fy = hy - 9 + (up ? 0 : 1);
    b.fillStyle = '#1b1427'; b.fillRect(hx + 2, fy - 1, fw + 2, fh + 2);
    for (let yy = 0; yy < fh; yy++) for (let xx = 0; xx < fw; xx++) {
      const wv = waving ? Math.round(Math.sin(now / 90 + xx * 0.9)) : 0;
      b.fillStyle = (xx + yy) % 2 ? '#1b1427' : '#f4ead2';
      b.fillRect(hx + 3 + xx, fy + yy + wv, 1, 1);
    }
  },
  drawSwamp(b, x, yb, spr, sx, sy, now, ph) {
    /* Moorloch */
    b.fillStyle = '#1b1427'; b.fillRect(x - 9, yb - 3, 18, 1); b.fillRect(x - 12, yb - 2, 24, 3); b.fillRect(x - 9, yb + 1, 18, 1);
    b.fillStyle = '#3a3a22'; b.fillRect(x - 11, yb - 2, 22, 2); b.fillRect(x - 8, yb, 16, 1);
    b.fillStyle = '#5a5a32'; b.fillRect(x - 7, yb - 2, 12, 1);
    /* versinkende Figur, nur der Kopf schaut heraus */
    const vis = Math.max(1, yb - 2 - sy);
    b.drawImage(spr, 0, 0, spr.width, vis, sx, sy, spr.width, vis);
    b.fillStyle = '#3a3a22'; b.fillRect(sx + 2, yb - 2, spr.width - 4, 1);
    b.fillStyle = '#5a5a32'; b.fillRect(sx + 4, yb - 2, 3, 1);
    /* Arm winkt um Hilfe */
    if (Math.floor((now + ph) / 900) % 3 === 0) {
      b.fillStyle = '#1b1427'; b.fillRect(x + 8, yb - 8, 3, 7);
      b.fillStyle = '#93c46c'; b.fillRect(x + 9, yb - 7, 1, 5); b.fillRect(x + 9, yb - 9, 1, 1);
    }
    /* Blasen */
    for (let k = 0; k < 3; k++) {
      const p = ((now / 900) + k * 0.37 + ph / 1000) % 1;
      const bx = x - 8 + k * 7, by = Math.round(yb - 2 - p * 7);
      if (p < 0.85) { b.fillStyle = '#9ab070'; b.fillRect(bx, by, 1, 1); }
      else { b.fillStyle = '#cfe0a0'; b.fillRect(bx - 1, by, 1, 1); b.fillRect(bx + 1, by, 1, 1); b.fillRect(bx, by - 1, 1, 1); }
    }
    /* Fliege */
    const a = now / 160 + ph;
    b.fillStyle = '#1b1427'; b.fillRect(Math.round(x + Math.cos(a) * 7), Math.round(sy - 4 + Math.sin(a * 1.7) * 2), 1, 1);
    if (Math.floor(now / 80) % 2) { b.fillStyle = '#c8d0e0'; b.fillRect(Math.round(x + Math.cos(a) * 7), Math.round(sy - 5 + Math.sin(a * 1.7) * 2), 1, 1); }
  },
  drawRainbow(b, sx, sy, now, ph, moving, left) {
    const cols = ['#d63c3c', '#f08a24', '#f5c542', '#2f8a4c', '#2f4aa0', '#8a4ac0'];
    const len = moving ? 16 : 7;
    const y0 = sy + 13;
    for (let i = 0; i < cols.length; i++) {
      b.fillStyle = cols[i];
      for (let k = 0; k < len; k++) {
        const wave = Math.round(Math.sin((now / 140) + k * 0.6 + ph) * (moving ? 1 : 0.6));
        const xx = left ? sx + 30 + k : sx + 2 - k;
        if (k > len - 4 && (k + Math.floor(now / 90)) % 2) continue;
        b.fillRect(xx, y0 + i + wave, 1, 1);
      }
    }
    if (Math.floor((now + ph) / 200) % 2) { b.fillStyle = '#fff6c0'; b.fillRect(left ? sx + 30 + len : sx + 2 - len, y0 + 2, 1, 1); }
  },
  drawFire(b, sx, sy, spr, now, ph) {
    const baseY = sy + Math.floor(spr.height * 0.8);
    for (let j = 0; j < 7; j++) {
      const fx = sx + 2 - j * 2;
      const flick = Math.floor((Math.sin(now / 60 + j * 1.3 + ph) + 1) * 1.6);
      const hgt = Math.max(0, 10 - j * 1.4 + flick) | 0;
      for (let k = 0; k < hgt; k++) {
        const rel = k / hgt;
        b.fillStyle = rel < 0.3 ? '#fff1a0' : rel < 0.6 ? '#f5c542' : rel < 0.85 ? '#f08a24' : '#d63c3c';
        b.fillRect(fx - Math.floor(k / 3), baseY - k, 2, 1);
      }
    }
    for (let q = 0; q < 3; q++) {
      const t = (now / 80 + q * 9 + ph) % 14;
      b.fillStyle = q ? '#f08a24' : '#fff1a0';
      b.fillRect(sx - 3 - Math.floor(t), baseY - 8 - Math.floor(t * 0.6), 1, 1);
    }
  },
  drawCloud(b, cx, cy, now, ph) {
    b.fillStyle = '#5d6480'; b.fillRect(cx - 6, cy - 1, 13, 3); b.fillRect(cx - 4, cy - 3, 8, 2); b.fillRect(cx - 1, cy - 4, 4, 1);
    b.fillStyle = '#8a92b0'; b.fillRect(cx - 4, cy - 3, 3, 1); b.fillRect(cx - 5, cy - 1, 4, 1);
    b.fillStyle = '#7fb0f0';
    for (let j = 0; j < 4; j++) {
      const dy = Math.floor((now / 55 + j * 7 + ph) % 9);
      b.fillRect(cx - 5 + j * 3, cy + 3 + dy, 1, 2);
    }
  },

  /* ---------- Sprechblasen ---------- */
  bubble(id, text, ms) {
    if (!S.settings.kiebitz || !text) return;
    const f = this.figs.get(id); if (!f) return;
    if (f.bubble) { f.bubble.remove(); clearTimeout(f.bubbleT); }
    const el = document.createElement('div');
    el.className = 'bubble';
    el.textContent = text;
    this.ov.appendChild(el);
    f.bubble = el;
    this.draw(performance.now());
    f.bubbleT = setTimeout(() => {
      el.classList.add('fade');
      setTimeout(() => { el.remove(); if (f.bubble === el) f.bubble = null; }, 420);
    }, ms || 3400);
  },

  /* ---------- Nach einem Spiel ---------- */
  afterGame(g, before, after) {
    const res = calcGame(g);
    const dur = this.sync();
    const name = g.player ? pname(g.player) : '';
    const N = TXT.naunin;
    /* Ton */
    if (Math.abs(res.points) >= 100) this.nauHopT = performance.now();
    if (res.points >= 100) Sound.play('bigup');
    else if (res.points > 0) Sound.play('up');
    else if (res.points <= -150) Sound.play('bigdown');
    else if (res.points < 0) Sound.play('down');
    else Sound.play('blip');
    /* Naunin */
    const nLines = [nauninLine(g, res, name)];
    const post = [];
    let postFig = null;
    if (g.player && before[g.player] && after[g.player]) {
      const b0 = before[g.player], a0 = after[g.player];
      const t0 = tierOf(b0.score, S.settings), t1 = tierOf(a0.score, S.settings);
      const v = { name };
      if (t0 !== t1) {
        if (t1 === 'swamp') { post.push(fill(pick('nsw', N.swamp), v)); postFig = pick('fsw', TXT.fig.toSwamp); setTimeout(() => Sound.play('zombie'), dur); }
        else if (t1 === 'zombie' && t0 === 'swamp') { post.push(fill(pick('nusw', N.unswamp), v)); postFig = pick('fusw', TXT.fig.fromSwamp); }
        else if (t1 === 'zombie') { post.push(fill(pick('nz', N.zombie), v)); postFig = pick('fz', TXT.fig.toZombie); setTimeout(() => Sound.play('zombie'), dur); }
        else if (t0 === 'zombie' || t0 === 'swamp') { post.push(fill(pick('nuz', N.unzombie), v)); postFig = pick('ffz', TXT.fig.fromZombie); }
        else if (t1 === 'glow') { post.push(fill(pick('ng', N.glow), v)); postFig = pick('fg', TXT.fig.toGlow); setTimeout(() => Sound.play('shine'), dur); }
        else if (t1 === 'unicorn' && (t0 === 'walk' || t0 === 'ride')) { post.push(fill(pick('nuc', N.unicorn), v)); postFig = pick('fuc', TXT.fig.toUnicorn); setTimeout(() => Sound.play('magic'), dur * 0.6); }
        else if (t1 === 'ride' && t0 === 'walk') { post.push(fill(pick('nr', N.ride), v)); postFig = pick('fr', TXT.fig.toRide); setTimeout(() => Sound.play('horse'), dur * 0.6); }
        else if (t1 === 'ride' && (t0 === 'unicorn' || t0 === 'glow')) { post.push(fill(pick('nuu', N.ununicorn), v)); postFig = pick('fuu', TXT.fig.lostUnicorn); }
        else if (t1 === 'walk') { post.push(fill(pick('nur', N.unride), v)); postFig = pick('flh', TXT.fig.lostHorse); }
      }
      if (a0.streak === 3) { post.push(fill(pick('nf', N.fire), v)); postFig = postFig || pick('ff', TXT.fig.fire); }
      if (a0.streak === -3) { post.push(fill(pick('nc', N.cloud), v)); postFig = postFig || pick('fc', TXT.fig.cloud); }
    }
    if (isLate() && !Race.lateSaid) { Race.lateSaid = true; post.push(pick('late', N.late)); }
    setTimeout(() => {
      this.k.say(nLines[0]);
      post.forEach(t => this.k.say(t, { queue: true }));
    }, 120);
    /* Figuren */
    if (g.player) {
      const line = figLine(g, res);
      setTimeout(() => this.bubble(g.player, line, 3000), 200);
      if (postFig) setTimeout(() => this.bubble(g.player, postFig, 3000), Math.max(dur + 200, 3300));
      const si = seatInfo(S.players.length, S.startDealer, S.games.length - 1);
      const others = si.active.map(i => S.players[i].id).filter(id => id !== g.player);
      if (others.length && g.type !== 'pass' && (g.type !== 'frei' || g.manual) && Math.random() < 0.6 && (res.points < 0 || res.points >= 60)) {
        const who = others[Math.floor(Math.random() * others.length)];
        const pool = res.points < 0 ? TXT.react.afterLoss : TXT.react.afterWin;
        setTimeout(() => this.bubble(who, fill(pick('re' + (res.points < 0), pool), { name }), 2600), 1500);
      }
    }
  },
  askUndo() {
    if (!S.games.length) return;
    const g = S.games[S.games.length - 1];
    const res = calcGame(g);
    const what = g.type === 'pass' ? 'Eingepasst' : res.desc + ' für ' + pname(g.player) + ', ' + fmt(res.points);
    confirmDialog('Letztes Spiel streichen? ' + what + '.', 'Streichen', 'Lassen', () => {
      S.games.pop(); saveState();
      this.sync();
      Sound.play('down');
      this.k.say(pick('undo', TXT.naunin.undo));
    }, { danger: true });
  }
};

function nauninLine(g, res, name) {
  const N = TXT.naunin;
  if (hasTags(g)) { const pts = res.points; g = manualAsGame(g); res = Object.assign({}, res, { points: pts, overbid: g.overbid }); }
  const v = { name, pts: Math.abs(res.points), abs: Math.abs(res.points), reiz: g.reiz || '' };
  const won = res.points > 0;
  let key;
  if (g.type === 'pass') key = 'pass';
  else if (g.type === 'frei' && g.manual) key = Math.abs(res.points) >= 120 ? (won ? 'bigWon' : 'bigLost') : (won ? 'won' : 'lost');
  else if (g.type === 'frei') key = 'frei';
  else if (g.type === 'ramsch') key = g.durchmarsch ? 'durchmarsch' : 'ramsch';
  else if (g.type === 'null' && g.durchmarsch) key = 'nullDurchmarsch';
  else if (res.overbid) key = 'overbid';
  else if (g.kontra === 2 && Math.random() < 0.6) key = 're';
  else if (g.bock && Math.random() < 0.35) key = 'bock';
  else if (g.type === 'null') key = won ? 'nullWon' : (String(g.nullVar).indexOf('ouvert') === 0 ? 'nullOuvertLost' : 'nullLost');
  else if (won && ((g.achieved || 0) >= 2 || (g.hand && (g.announced || 0) >= 2))) key = 'schwarzWon';
  else if (!won && (g.achieved || 0) >= 1) key = 'schneiderLost';
  else if (won && g.achieved === 1 && Math.random() < 0.5) key = 'schneiderWon';
  else if (g.kontra === 1 && Math.random() < 0.6) key = won ? 'kontraWon' : 'kontraLost';
  else {
    const opts = [];
    if (g.type === 'grand') opts.push(won ? 'grandWon' : 'grandLost');
    if (g.hand) opts.push(won ? 'handWon' : 'handLost');
    if (Math.abs(res.points) >= 120) opts.push(won ? 'bigWon' : 'bigLost');
    if (typeof g.mit === 'boolean') opts.push(won ? (g.mit ? 'wonMit' : 'wonOhne') : (g.mit ? 'lostMit' : 'lostOhne'));
    opts.push(won ? 'won' : 'lost');
    key = opts[Math.floor(Math.random() * Math.min(opts.length, 3))];
  }
  return fill(pick('n-' + key, N[key]), v);
}

function figLine(g, res) {
  const F = TXT.fig;
  if (hasTags(g)) { const pts = res.points; g = manualAsGame(g); res = Object.assign({}, res, { points: pts, overbid: g.overbid }); }
  const won = res.points > 0;
  const r = Math.random;
  let key;
  if (g.type === 'pass') return '';
  if (g.type === 'frei' && g.manual) key = won ? (res.points < 40 ? 'winSmall' : res.points < 100 ? 'winMid' : 'winBig') : (Math.abs(res.points) >= 150 ? 'loseBig' : 'lose');
  else if (g.type === 'frei') key = won ? 'freiPlus' : 'freiMinus';
  else if (g.type === 'ramsch') key = g.durchmarsch ? 'durchmarsch' : 'ramsch';
  else if (g.type === 'null' && g.durchmarsch) key = 'nullDurchmarsch';
  else if (won) {
    if ((g.achieved || 0) >= 2 || (g.hand && (g.announced || 0) >= 2)) key = 'schwarz';
    else if (g.achieved === 1 && r() < 0.5) key = 'schneider';
    else if (g.type === 'null') key = String(g.nullVar).indexOf('ouvert') === 0 ? 'nullOuvertWin' : 'nullWin';
    else if (g.type === 'grand' && r() < 0.6) key = 'grand';
    else if (g.hand && r() < 0.5) key = 'hand';
    else if (g.kontra && r() < 0.6) key = 'kontraWin';
    else key = res.points < 40 ? 'winSmall' : res.points < 100 ? 'winMid' : 'winBig';
  } else {
    if (res.overbid) key = 'overbid';
    else if (g.type === 'null') key = String(g.nullVar).indexOf('ouvert') === 0 ? 'nullOuvertLose' : 'nullLose';
    else if (g.kontra && r() < 0.5) key = 'kontraLose';
    else if ((g.achieved || 0) >= 1) key = 'schneiderLose';
    else if (g.type === 'grand' && r() < 0.6) key = 'grandLose';
    else if (g.hand && r() < 0.6) key = 'handLose';
    else key = Math.abs(res.points) >= 150 ? 'loseBig' : 'lose';
  }
  return pick('f-' + key, F[key]);
}
