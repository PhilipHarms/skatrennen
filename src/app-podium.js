/* ===== Siegerehrung ===== */
function ranking() {
  const st = stats();
  return S.players.slice().sort((a, b) => st[b.id].score - st[a.id].score).map(p => ({ p, s: st[p.id] }));
}

/* Gleichstände zusammenfassen: Platzziffern wie im Sport (1, 2, 2, 4) */
function rankGroups(rank) {
  const groups = [];
  rank.forEach((r, i) => {
    const g = groups[groups.length - 1];
    if (g && g.score === r.s.score) g.members.push(r);
    else groups.push({ place: i + 1, score: r.s.score, members: [r] });
  });
  return groups;
}

function honors(st) {
  const T = TXT.titles, ps = S.players, out = [];
  const top = (fn, min) => {
    let best = null, val = -Infinity, tie = false;
    ps.forEach(p => { const v = fn(st[p.id]); if (v > val) { val = v; best = p; tie = false; } else if (v === val) tie = true; });
    return best && val >= min ? { p: best, v: val, tie } : null;
  };
  const used = {};
  const add = (key, r, vars) => {
    if (!r) return;
    if ((used[r.p.id] || 0) >= 2) return;
    used[r.p.id] = (used[r.p.id] || 0) + 1;
    out.push({ title: T[key].title, name: r.p.name, line: fill(T[key].line, vars) });
  };
  const b = top(s => s.best ? s.best.points : -Infinity, 1);
  if (b) add(st[b.p.id].best.desc ? 'best' : 'bestManual', b, { desc: st[b.p.id].best.desc, pts: st[b.p.id].best.points });
  const g = top(s => s.grands, 1); if (g) add('grand', g, { n: g.v });
  const pe = top(s => s.lost, 2); if (pe) add('pech', pe, { n: pe.v, spiele: spiele(pe.v) });
  const played = ps.map(p => st[p.id].played);
  if (Math.max.apply(null, played) > 0 && Math.min.apply(null, played) !== Math.max.apply(null, played)) {
    const m = top(s => -s.played, -Infinity); if (m && !m.tie) add('mauer', m, { n: -m.v, spiele: spiele(-m.v) });
  }
  const h = top(s => s.overbid, 1); if (h) add('hoch', h, { n: h.v });
  const ph = top(s => (s.min < 0 && s.score > 0) ? s.score - s.min : -Infinity, 1);
  if (ph) add('phoenix', ph, { min: fmtScore(st[ph.p.id].min), final: fmtScore(st[ph.p.id].score) });
  const z = top(s => -s.min, 1); if (z) add('zombie', z, { min: fmtScore(st[z.p.id].min) });
  const nn = top(s => s.nullLost, 1); if (nn) add('nullnr', nn, { n: nn.v });
  const ra = top(s => s.ramschLost, 1); if (ra) add('ramsch', ra, { n: ra.v });
  const du = top(s => s.durchmarsch, 1); if (du) add('durch', du, { n: du.v });
  return out.slice(0, 6);
}

const Podium = {
  k: null, running: false, conf: [], toms: [], splats: [],
  init() {
    this.k = new Kiebitz($('#scr-podium [data-kiebitz]'));
    this.cv = $('#podium-cv'); this.ctx = this.cv.getContext('2d');
    this.buf = document.createElement('canvas'); this.bctx = this.buf.getContext('2d');
    $('#btn-continue').addEventListener('click', () => {
      Sound.play('tap'); S.phase = 'race'; S.finishedAt = null; saveState();
      Race.show(true); Race.k.say('Doch noch nicht genug? Na gut. Ich hatte eh nichts vor.');
    });
    $('#btn-revanche').addEventListener('click', () => { Sound.play('tap'); revanche(); });
    $('#btn-newround').addEventListener('click', () => { Sound.play('tap'); confirmDialog('Neue Leute an den Tisch? Spieler und Sitzordnung werden neu festgelegt.', 'Neue Runde', 'Abbrechen', freshStart); });
    let rt = null;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (S.phase === 'podium') this.layout(); }, 120); });
    this.cv.addEventListener('click', () => { Sound.ensure(); this.replayChamp(); });
  },
  show(celebrate) {
    showScreen('podium');
    this.rank = ranking();
    this.groups = rankGroups(this.rank);
    this.plan();
    this.renderGallery();
    this.renderUrkunde();
    this.layout();
    this.conf = []; this.toms = []; this.splats = []; this.parts = []; this.neck = null;
    this.t0 = performance.now(); this.champT0 = this.t0 + (celebrate ? 0 : -600);
    this.fired = new Set();
    this.start();
    const top = this.groups[0].members.map(m => m.p.name);
    if (top.length > 1) this.k.say(fill(pick('podt', TXT.evaluate.podiumTie), { first: listNames(top) }));
    else this.k.say(fill(pick('pod', TXT.evaluate.podium), { first: top[0] }));
    if (this.pranger) this.k.say(fill(TXT.evaluate.pranger, { last: this.pranger.p.name }), { queue: true });
    else if (this.jesters.length) this.k.say(fill(TXT.evaluate.fool, { last: listNames(this.jesters.map(j => j.p.name)) }), { queue: true });
    if (celebrate) setTimeout(() => Sound.play('fanfare'), 250);
  },
  /* Wer steht wo: Podest nach Gruppen, Fußvolk, Pranger */
  plan() {
    const n = this.rank.length, G = this.groups.slice();
    this.pranger = null; this.jesters = [];
    const lastG = G[G.length - 1];
    if (n >= 4 && G.length >= 2 && lastG.members.length === 1) { this.pranger = lastG.members[0]; G.pop(); }
    this.podGroups = G.slice(0, 3);
    this.crowd = [];
    G.slice(3).forEach(g => g.members.forEach(m => this.crowd.push(m)));
    if (!this.pranger && this.podGroups.length === 3 && G.length === 3) this.jesters = this.podGroups[2].members.slice();
  },
  layout() {
    const wrapW = this.cv.parentElement.clientWidth;
    if (!wrapW) return;
    const dpr = window.devicePixelRatio || 1;
    const kCss = clamp(wrapW / 200, 1.6, 3.2);
    this.scale = Math.max(1, Math.round(kCss * dpr));
    this.W = Math.ceil(wrapW * dpr / this.scale);
    this.H = 112;
    this.buf.width = this.W; this.buf.height = this.H;
    this.cv.width = this.W * this.scale; this.cv.height = this.H * this.scale;
    this.cv.style.height = (this.H * this.scale / dpr) + 'px';
    this.cv.style.width = (this.W * this.scale / dpr) + 'px';
    this.cv.parentElement.style.overflow = 'hidden';
  },
  start() {
    if (this.running) return;
    this.running = true;
    let last = 0;
    const loop = now => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      if (now - last < 45) return;
      last = now;
      this.draw(now);
    };
    requestAnimationFrame(loop);
  },
  stop() { this.running = false; },
  renderUrkunde() {
    const st = stats();
    const d = new Date(S.finishedAt || Date.now());
    const date = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    const el = $('#urkunde');
    let h = '<h2>Urkunde</h2><div class="u-sub">Skatabend vom ' + esc(date) + ', ' + spiele(S.games.length) + '</div>';
    const hs = honors(st);
    if (hs.length) {
      h += '<div class="u-titles"><h3>Ehrentitel</h3>' + hs.map(t => '<div class="ut"><span class="tt">' + esc(t.title) + '</span><span class="tn">' + esc(t.name) + '</span><span class="tl">' + esc(t.line) + '</span></div>').join('') + '</div>';
    }
    h += '<div class="sig"><div><div class="sg">Prinz Naunin</div><small>Kreuz-Bube, Kiebitz und Zeremonienmeister</small></div><div class="seal" aria-hidden="true">&clubs;</div></div>';
    if (!hs.length) h += '<p class="note" style="text-align:center">Keine Ehrentitel heute. Es war schlicht zu langweilig.</p>';
    el.innerHTML = h;
  },
  renderGallery() {
    const st = stats();
    const hs = honors(st);
    const byName = {};
    hs.forEach(t => { (byName[t.name] = byName[t.name] || []).push(t.title); });
    const el = $('#galerie');
    el.innerHTML = '<h2>Ahnengalerie</h2><div class="gal-grid"></div>';
    const grid = $('.gal-grid', el);
    this.groups.forEach(g => {
      g.members.forEach(m => {
        const it = document.createElement('figure');
        const win = g.place === 1, shame = this.pranger && this.pranger.p.id === m.p.id;
        it.className = 'gal-item' + (win ? ' win' : '') + (shame ? ' shame' : '');
        const fr = document.createElement('div'); fr.className = 'gal-frame';
        const cv = document.createElement('canvas'); cv.className = 'px'; cv.width = 43; cv.height = 38;
        cv.getContext('2d').drawImage(spritePortrait(m.p.char), 0, 0);
        fr.appendChild(cv); it.appendChild(fr);
        const pl = document.createElement('figcaption'); pl.className = 'plaque';
        const label = win ? (g.members.length > 1 ? 'GETEILTER SIEG' : 'SIEGER') : shame ? 'AM PRANGER' : g.place + '. PLATZ';
        pl.innerHTML = '<small>' + label + '</small><b>' + esc(m.p.name) + '</b><span class="pts">' + fmtScore(m.s.score) + '</span>' +
          (byName[m.p.name] ? '<i>' + esc(byName[m.p.name][0]) + '</i>' : '');
        it.appendChild(pl);
        grid.appendChild(it);
      });
    });
  },
  draw(now) {
    const b = this.bctx, W = this.W, H = this.H;
    if (!W) return;
    const t = now - this.t0;
    const pal = skyPalette(new Date());
    const GY = H - 16;
    const bandH = Math.ceil(GY / 5);
    const bands = pal.bands.concat([pal.bands[3]]);
    bands.forEach((c, i) => { b.fillStyle = c; b.fillRect(0, i * bandH, W, bandH); });
    if (pal.stars) for (let i = 0; i < 40; i++) {
      if ((i + Math.floor(now / 600)) % 8 === 0) continue;
      b.fillStyle = i % 6 ? '#d8d4f0' : '#f5c542'; b.fillRect(Math.floor(hash2(i, 5) * W), Math.floor(hash2(i, 9) * (GY - 30)), 1, 1);
    }
    if (pal.moon) { b.fillStyle = '#f4ead2'; for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 26 && (x - 3) * (x - 3) + (y + 1) * (y + 1) > 18) b.fillRect(18 + x, 12 + y, 1, 1); }
    /* Burg groß */
    const cx = Math.round(W / 2);
    b.save(); b.translate(cx - 28, GY - 18); b.scale(2, 2);
    Race.drawCastle(b, 0, 9, pal, now);
    b.restore();
    /* Wimpelketten */
    const flags = ['#d63c3c', '#f5c542', '#2f8a4c', '#45425c', '#eea02c', '#2f4aa0'];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const fx = cx + side * (34 + i * 8);
        const fy = 18 + Math.round(Math.pow(i - 4, 2) * -0.4 + 6);
        b.fillStyle = '#1b1427'; b.fillRect(fx, fy - 1, 8 * side, 1);
        b.fillStyle = flags[i % flags.length];
        b.fillRect(fx + (side < 0 ? -5 : 1), fy, 4, 2); b.fillRect(fx + (side < 0 ? -4 : 2), fy + 2, 2, 2);
      }
    }
    /* Boden */
    b.fillStyle = '#4f8a3a'; b.fillRect(0, GY, W, H - GY);
    b.fillStyle = '#3c7a2c'; b.fillRect(0, GY, W, 1);
    for (let x = 0; x < W; x += 3) if (hash2(x, 77) < 0.4) { b.fillStyle = '#3c7a2c'; b.fillRect(x, GY + 2 + Math.floor(hash2(x, 3) * 10), 1, 2); }
    /* Podest nach Gruppen */
    const pg = this.podGroups || [];
    const bw = g => Math.max(24, g.members.length * 16 + 8);
    const hts = [24, 16, 10];
    const blocks = [];
    if (pg[0]) blocks.push({ gi: 0, x: cx, w: bw(pg[0]), h: hts[0] });
    if (pg[1]) blocks.push({ gi: 1, x: cx - Math.round(bw(pg[0]) / 2 + bw(pg[1]) / 2), w: bw(pg[1]), h: hts[1] });
    if (pg[2]) blocks.push({ gi: 2, x: cx + Math.round(bw(pg[0]) / 2 + bw(pg[2]) / 2), w: bw(pg[2]), h: hts[2] });
    if (blocks.length) {
      const l = Math.min.apply(null, blocks.map(k => k.x - k.w / 2)) - 6, rr = Math.max.apply(null, blocks.map(k => k.x + k.w / 2)) + 6;
      b.fillStyle = '#9c7646'; b.fillRect(Math.round(l), GY + 6, Math.round(rr - l), 6);
    }
    const placed = [];
    blocks.forEach(bl => {
      const top = GY + 6 - bl.h, x0 = Math.round(bl.x - bl.w / 2);
      b.fillStyle = '#1b1427'; b.fillRect(x0 - 1, top - 1, bl.w + 2, bl.h + 1);
      b.fillStyle = '#8f8cab'; b.fillRect(x0, top, bl.w, bl.h);
      b.fillStyle = '#b4b2cc'; b.fillRect(x0, top, bl.w, 2);
      b.fillStyle = '#6a6788'; b.fillRect(x0, top + bl.h - 2, bl.w, 2);
      for (let yy = top + 5; yy < top + bl.h - 2; yy += 5) { b.fillStyle = '#7d7a9a'; b.fillRect(x0, yy, bl.w, 1); }
      const g = pg[bl.gi];
      drawNum(b, String(g.place), bl.x, top + 4, ['#f5c542', '#e0e4f0', '#d08a4a'][bl.gi], '#1b1427');
      const m = g.members.length;
      g.members.forEach((ent, j) => placed.push({ ent, gi: bl.gi, x: Math.round(bl.x + (j - (m - 1) / 2) * 16), y: top, slot: j }));
    });
    this.winSpots = placed.filter(p => p.gi === 0);
    /* Fußvolk */
    (this.crowd || []).forEach((ent, k) => placed.push({ ent, gi: 9, x: 32 + k * 20, y: GY + 8, ground: true, slot: k }));
    /* Pranger */
    let pr = null;
    if (this.pranger) { pr = { ent: this.pranger, gi: -1, x: W - 22, y: GY + 8 }; placed.push(pr); }
    const jesterIds = new Set((this.jesters || []).map(j => j.p.id));
    placed.forEach(pl => {
      const ent = pl.ent;
      const zombie = ent.s.score < 0;
      let fr = 0, dy = 0;
      if (pl.gi === 0) { const ph = Math.floor((t + pl.slot * 120) / 160) % 4; dy = ph === 1 ? -3 : ph === 2 ? -2 : 0; fr = ph % 2; }
      else if (pl === pr) { fr = 0; }
      else { fr = Math.floor((t + (pl.slot || 0) * 300 + pl.gi * 200) / 420) % 2; dy = pl.ground && fr ? -1 : 0; }
      const spr = spriteWalk(ent.p.char, fr, zombie);
      const sx = Math.round(pl.x - spr.width / 2), sy = pl.y - spr.height + 1 + dy;
      pl.sx = sx; pl.sy = sy;
      if (pl.gi === 0) {
        const wet = this.wetUntil && now < this.wetUntil;
        const pulse = wet ? 0.8 : 0.4 + 0.4 * Math.sin(now / 250);
        const sil = silhouette(spr, wet ? '#fff8e6' : '#ffe070');
        b.globalAlpha = pulse;
        b.drawImage(sil, sx - 1, sy); b.drawImage(sil, sx + 1, sy); b.drawImage(sil, sx, sy - 1);
        b.globalAlpha = 1;
      }
      b.drawImage(spr, sx, sy);
      if (pl.gi === 0) this.drawCrown(b, pl.x, sy - 7 + Math.round(Math.sin(now / 300 + pl.slot)), now);
      if (pl.gi === 1 || pl.gi === 2) {
        b.fillStyle = '#1b1427'; b.fillRect(pl.x - 2, sy + 14, 4, 4);
        b.fillStyle = pl.gi === 1 ? '#e0e4f0' : '#d08a4a'; b.fillRect(pl.x - 1, sy + 15, 2, 2);
      }
      if (jesterIds.has(ent.p.id)) this.drawJester(b, pl.x, sy, now);
    });
    /* Prinz Naunin mit Champagner */
    this.drawNaunin(b, now, GY + 8);
    if (pr) this.drawPillory(b, pr, now);
    /* Konfetti */
    if (this.conf.length < 46 && Math.random() < 0.6) this.conf.push({ x: Math.random() * W, y: -2, vx: (Math.random() - 0.5) * 0.4, vy: 0.4 + Math.random() * 0.5, c: flags[Math.floor(Math.random() * flags.length)], ph: Math.random() * 6 });
    this.conf.forEach(c => {
      c.x += c.vx + Math.sin(now / 300 + c.ph) * 0.2; c.y += c.vy;
      b.fillStyle = c.c;
      b.fillRect(Math.round(c.x), Math.round(c.y), Math.floor(now / 200 + c.ph) % 2 ? 2 : 1, 1);
    });
    this.conf = this.conf.filter(c => c.y < H);
    this.drawParts(b, now, GY + 8);
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.buf, 0, 0, W * this.scale, H * this.scale);
  },
  /* ---------- Prinz Naunin: Säbel und Champagnerdusche ---------- */
  champ(now) {
    const t = now - this.champT0;
    const ev = (at, fn) => { if (t >= at && !this.fired.has(at)) { this.fired.add(at); fn(); } };
    ev(900, () => Sound.play('blip'));
    ev(1500, () => Sound.play('hop'));
    ev(1950, () => {
      Sound.play('pop'); this.tone2();
      this.neck = { x: 25, y: 0, vx: 34, vy: -70, landed: false, rel: true };
      this.foamUntil = now + 500;
    });
    ev(2300, () => { this.sprayUntil = now + 2600; Sound.ensure() && Sound.noise(0, 2.4, 0.035, 5200); });
    ev(5100, () => Sound.play('gulp'));
    ev(5400, () => Sound.play('gulp'));
    ev(5800, () => Sound.play('ahh'));
    let st = 'none';
    if (t >= 900) st = 'hold';
    if (t >= 1500 && t < 2150) st = 'sabre';
    if (t >= 2150 && t < 2300) st = 'hold';
    if (t >= 2300 && t < 4900) st = 'spray';
    if (t >= 4900 && t < 5800) st = 'drink';
    return { st, t };
  },
  tone2() { if (Sound.ensure()) { Sound.tone(2600, 0, 0.05, 'square', 0.03); Sound.tone(3300, 0.04, 0.05, 'square', 0.02); } },
  replayChamp() {
    const now = performance.now();
    this.champT0 = now - 800; this.fired = new Set(); this.neck = null; this.parts = [];
  },
  drawNaunin(b, now, feet) {
    const { st, t } = this.champ(now);
    const px = 3, py = feet - 22;
    this.nauPos = { x: px, y: py };
    const shake = st === 'spray' ? (Math.floor(now / 50) % 2) : 0;
    b.drawImage(spriteWalk('naunin-stand', 0), px, py);
    const bottlePal = BOTTLE_PAL;
    const R = (x, y, w, h, c) => { b.fillStyle = c; b.fillRect(x, y, w, h); };
    if (st === 'hold' || st === 'sabre') {
      b.drawImage(spriteBottle(BOTTLE_HOLD), px + 13, py + 11);
      R(px + 13, py + 17, 2, 1, '#f3c99b');
      if (this.neck) { R(px + 14, py + 10, 3, 2, '#43a052'); }
    }
    if (st === 'sabre') {
      /* Säbel gleitet am Flaschenhals entlang */
      const k = clamp((t - 1500) / 450, 0, 1);
      const bx = px + 4 + Math.round(k * 12), by = py + 12 - Math.round(k * 2);
      R(bx - 1, by - 1, 10, 3, '#1b1427');
      R(bx, by, 8, 1, '#dfe6f0'); R(bx + 7, by, 1, 1, '#ffffff');
      R(bx - 2, by - 1, 2, 3, '#f5c542');
    }
    if (st === 'spray' || st === 'drink') {
      R(px + 13, py + 18, 1, 1, '#f5c542'); R(px + 14, py + 18, 1, 1, '#2f4aa0');
    }
    if (st === 'spray') {
      R(px + 13, py + 12, 5, 3, '#1b1427');
      R(px + 13, py + 13, 2, 1, '#f5c542'); R(px + 15, py + 13, 1, 1, '#2f4aa0'); R(px + 16, py + 13, 1, 1, '#f3c99b');
      b.drawImage(spriteBottleSpin(1), px + 15 + shake, py + 7);
      const mx = px + 22 + shake, my = py + 7;
      const tgt = (this.winSpots && this.winSpots.length) ? this.winSpots[Math.floor((now / 600) % this.winSpots.length)] : { x: this.W / 2, sy: 40 };
      const tx = tgt.x + Math.sin(now / 120) * 3, ty = (tgt.sy || 40) + 3;
      for (let i = 0; i < 4; i++) {
        const T = 0.45 + Math.random() * 0.12, g = 140;
        this.parts.push({ x: mx, y: my, vx: (tx - mx) / T + (Math.random() - 0.5) * 18, vy: (ty - my) / T - 0.5 * g * T + (Math.random() - 0.5) * 14, g, life: 0.9, max: 0.9, s: i < 2 ? 2 : 1, c: ['#fff8e6', '#f5e6a0', '#f4ead2', '#ffffff'][i] });
      }
      this.wetUntil = now + 1500;
    }
    if (st === 'drink') {
      R(px + 13, py + 11, 4, 4, '#1b1427'); R(px + 14, py + 13, 1, 2, '#f5c542'); R(px + 15, py + 12, 1, 2, '#2f4aa0'); R(px + 14, py + 11, 2, 1, '#f3c99b');
      b.drawImage(spriteBottle(BOTTLE_DRINK), px + 10, py + 6);
    }
    if (this.foamUntil && now < this.foamUntil) {
      for (let i = 0; i < 3; i++) this.parts.push({ x: px + 16, y: py + 10, vx: 4 + Math.random() * 26, vy: -30 - Math.random() * 40, g: 90, life: 0.6, max: 0.6, c: ['#fff8e6', '#f4ead2', '#f5e6a0'][i] });
    }
    if (this.neck && this.neck.rel) { this.neck.x = px + 16; this.neck.y = py + 10; this.neck.rel = false; }
  },
  drawParts(b, now, feet) {
    const dt = Math.min(0.06, Math.max(0, (now - (this.lastT || now)) / 1000)); this.lastT = now;
    this.parts = this.parts.filter(p => (p.life -= dt) > 0 && p.y < this.H);
    if (this.parts.length > 500) this.parts.splice(0, this.parts.length - 500);
    this.parts.forEach(p => {
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      b.globalAlpha = Math.max(0.3, p.life / p.max);
      b.fillStyle = p.c; b.fillRect(Math.round(p.x), Math.round(p.y), p.s || 1, p.s ? 1 : 1);
    });
    b.globalAlpha = 1;
    const n = this.neck;
    if (n) {
      if (!n.landed) { n.vy += 170 * dt; n.x += n.vx * dt; n.y += n.vy * dt; if (n.y >= feet && n.vy > 0) { n.y = feet; n.landed = true; } }
      b.fillStyle = '#1b1427'; b.fillRect(Math.round(n.x) - 1, Math.round(n.y) - 2, 4, 3);
      b.fillStyle = '#43a052'; b.fillRect(Math.round(n.x), Math.round(n.y) - 1, 1, 1);
      b.fillStyle = '#f5c542'; b.fillRect(Math.round(n.x) + 1, Math.round(n.y) - 1, 1, 1);
    }
  },
  drawCrown(b, x, y, now) {
    b.fillStyle = '#1b1427'; b.fillRect(x - 5, y - 1, 11, 7);
    b.fillStyle = '#f5c542';
    b.fillRect(x - 4, y + 2, 9, 3);
    b.fillRect(x - 4, y, 1, 2); b.fillRect(x, y - 1, 1, 3); b.fillRect(x + 4, y, 1, 2);
    b.fillStyle = '#b9852a'; b.fillRect(x - 4, y + 4, 9, 1);
    b.fillStyle = '#d8343f'; b.fillRect(x, y + 3, 1, 1);
    b.fillStyle = '#2f8a4c'; b.fillRect(x - 3, y + 3, 1, 1); b.fillRect(x + 3, y + 3, 1, 1);
    if (Math.floor(now / 220) % 3 === 0) { b.fillStyle = '#fff6c0'; b.fillRect(x + 6, y - 2, 1, 1); b.fillRect(x - 6, y + 1, 1, 1); }
  },
  drawJester(b, x, sy, now) {
    const ph = Math.floor(now / 300) % 2;
    b.fillStyle = '#1b1427'; b.fillRect(x - 7, sy - 1, 15, 5);
    b.fillStyle = '#d63c3c'; b.fillRect(x - 6, sy, 6, 3); b.fillRect(x - 8, sy - 2 - ph, 2, 3);
    b.fillStyle = '#2f8a4c'; b.fillRect(x, sy, 6, 3); b.fillRect(x + 6, sy - 2 + ph, 2, 3);
    b.fillStyle = '#f5c542'; b.fillRect(x - 9, sy - 3 - ph, 2, 2); b.fillRect(x + 7, sy - 3 + ph, 2, 2);
  },
  drawPillory(b, pr, now) {
    const x = pr.x, by = pr.sy + 13;
    b.fillStyle = '#1b1427'; b.fillRect(x - 1, by, 4, pr.y - by);
    b.fillStyle = '#8a5a34'; b.fillRect(x, by, 2, pr.y - by);
    b.fillStyle = '#1b1427'; b.fillRect(x - 12, by - 1, 26, 6);
    b.fillStyle = '#a8703e'; b.fillRect(x - 11, by, 24, 4);
    b.fillStyle = '#6a4222'; b.fillRect(x - 11, by + 3, 24, 1);
    b.fillStyle = '#f3c99b'; b.fillRect(x - 9, by + 1, 2, 2); b.fillRect(x + 9, by + 1, 2, 2);
    /* Tomaten */
    if (Math.random() < 0.035 && this.toms.length < 3) {
      const fromLeft = Math.random() < 0.5;
      this.toms.push({ x: fromLeft ? -2 : this.W + 2, y: 60 + Math.random() * 20, tx: x + (Math.random() * 10 - 5), ty: pr.sy + 4 + Math.random() * 10, t: 0 });
    }
    this.toms.forEach(tm => {
      tm.t += 0.03;
      const k = Math.min(1, tm.t);
      const px = tm.x + (tm.tx - tm.x) * k, py = tm.y + (tm.ty - tm.y) * k - Math.sin(k * Math.PI) * 26;
      b.fillStyle = '#d63c3c'; b.fillRect(Math.round(px), Math.round(py), 2, 2);
      b.fillStyle = '#2f8a4c'; b.fillRect(Math.round(px), Math.round(py) - 1, 1, 1);
      if (k >= 1) {
        tm.done = true;
        for (let j = 0; j < 4; j++) this.splats.push({ x: Math.round(tm.tx + (Math.random() * 6 - 3)), y: Math.round(tm.ty + (Math.random() * 4 - 2)) });
        if (this.splats.length > 40) this.splats.splice(0, this.splats.length - 40);
        if (this.splats.length < 16) Sound.play('splat');
      }
    });
    this.toms = this.toms.filter(tm => !tm.done);
    b.fillStyle = '#c8303a';
    this.splats.forEach(s => b.fillRect(s.x, s.y, 1, 1));
  }
};
