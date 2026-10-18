/* ===== Kern: Zustand, Helfer, Ton, Kiebitz ===== */
const LS_KEY = 'naunin-skatrennen-v1';
const APP_VERSION = '1.3';
const DEFAULT_SETTINGS = { pferd: 200, einhorn: 300, glanz: 600, sumpf: -100, sound: true, kiebitz: true, manual: true, rev: 3 };
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const fmtScore = n => (n < 0 ? '−' : '') + Math.abs(n);
const spiele = n => n + (n === 1 ? ' Spiel' : ' Spiele');
const uid = () => 'p' + Math.random().toString(36).slice(2, 8);

function newState() {
  return {
    v: 1, phase: 'onboarding', step: 0, introLine: 0,
    draft: { slots: [] },
    players: [], startDealer: 0, games: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    created: Date.now(), finishedAt: null
  };
}
let S = loadState() || newState();
const savedRev = (S.settings && S.settings.rev) || 1;
S.settings = Object.assign({}, DEFAULT_SETTINGS, S.settings || {});
if (savedRev < 2) { S.settings.manual = true; }
if (savedRev < 3 && S.settings.pferd === 300) S.settings.pferd = 200;
S.settings.rev = 3;
function saveState() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* Speichern nicht möglich */ } }
function loadState() {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}

const playerById = id => S.players.find(p => p.id === id);
const pname = id => (playerById(id) || {}).name || '?';

/* Zufallsauswahl ohne schnelle Wiederholung */
const bags = new Map();
function pick(key, arr) {
  if (!arr || !arr.length) return '';
  let bag = bags.get(key);
  if (!bag || !bag.length) {
    bag = arr.map((_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    bags.set(key, bag);
  }
  return arr[bag.pop()];
}
function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ''));
}
function listNames(names) {
  if (names.length <= 1) return names.join('');
  return names.slice(0, -1).join(', ') + ' und ' + names[names.length - 1];
}

/* Spielverlauf-Hilfen */
function curSeat() { return seatInfo(S.players.length, S.startDealer, S.games.length); }
function stats() { return computeStats(S.players, S.games); }
function isLate(d) { const h = (d || new Date()).getHours(); return h >= 23 || h < 5; }

/* ===== Pixel-Icons ===== */
function pixelIcon(rows, color) {
  const h = rows.length, w = rows[0].length;
  let r = '';
  rows.forEach((row, y) => { for (let x = 0; x < w; x++) if (row[x] !== '.') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" fill="' + color + '" aria-hidden="true">' + r + '</svg>';
}
const ICONS = {
  list: ['..........', '.XXXXXXXX.', '.X......X.', '.X.XX.XXX.', '.X......X.', '.X.XX.XXX.', '.X......X.', '.X.XX.XXX.', '.X......X.', '.XXXXXXXX.'],
  sound: ['....X.....', '...XX..X..', '..XXX...X.', 'XXXXX.X..X', 'XXXXX..X.X', 'XXXXX..X.X', 'XXXXX.X..X', '..XXX...X.', '...XX..X..', '....X.....'],
  mute: ['....X.....', '...XX.....', '..XXX.....', 'XXXXX.X..X', 'XXXXX..XX.', 'XXXXX..XX.', 'XXXXX.X..X', '..XXX.....', '...XX.....', '....X.....'],
  beak: ['..XXXX....', '.XXXXXX...', 'XX.XXXXX..', 'XXXXXXXXXX', 'XXXXXXXXX.', 'XXXXXXX...', '.XXXXXXXXX', '..XXXXXX..', '...XX.....', '...XX.....'],
  beakTape: ['..XXXX....', '.XXXXXX...', 'XX.XXXXX..', 'XXXXXXXXXX', 'XXXXX.....', 'XXXX.X.X.X', '.XXXXXXXXX', '..XXXXXX..', '...XX.....', '...XX.....'],
  gear: ['....XX....', '.X.XXXX.X.', '.XXXXXXXX.', '..XX..XX..', 'XXX....XXX', 'XXX....XXX', '..XX..XX..', '.XXXXXXXX.', '.X.XXXX.X.', '....XX....']
};

/* ===== Ton: 8-Bit über WebAudio ===== */
const Sound = {
  ctx: null,
  ensure() {
    if (!S.settings.sound) return null;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { this.ctx = null; }
    return this.ctx;
  },
  tone(freq, start, dur, type, vol) {
    const ctx = this.ctx; if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  slide(f0, f1, start, dur, type, vol) {
    const ctx = this.ctx; if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    const t = ctx.currentTime + start;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(start, dur, vol, freq) {
    const ctx = this.ctx; if (!ctx) return;
    if (!this.nbuf) {
      const len = Math.floor(ctx.sampleRate * 0.7);
      this.nbuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.nbuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource(); src.buffer = this.nbuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = 0.8;
    const g = ctx.createGain(); const t = ctx.currentTime + start;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.02);
  },
  seq(notes, step, type, vol) { notes.forEach((f, i) => { if (f) this.tone(f, i * step, step * 0.95, type, vol); }); },
  play(name) {
    if (!this.ensure()) return;
    const N = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, C6: 1047, G3: 196, E3: 165, C3: 131, A3: 220 };
    switch (name) {
      case 'tap': this.tone(880, 0, 0.04, 'square', 0.025); break;
      case 'up': this.seq([N.C5, N.E5, N.G5], 0.07, 'square', 0.04); break;
      case 'bigup': this.seq([N.C5, N.E5, N.G5, N.C6, 0, N.G5, N.C6], 0.08, 'square', 0.045); break;
      case 'down': this.seq([N.G4, N.E4, N.C4], 0.1, 'triangle', 0.08); break;
      case 'bigdown': this.seq([N.G4, N.F4, N.E4, N.D4, N.C4, 0, N.C3], 0.14, 'sawtooth', 0.035); break;
      case 'blip': this.tone(660, 0, 0.06, 'square', 0.03); break;
      case 'horse': this.seq([N.G5, 0, N.G5, N.E5, 0, N.G5, 0, N.G5, N.E5], 0.06, 'square', 0.03); break;
      case 'zombie': this.seq([N.E3, N.C3, N.A3 / 2], 0.18, 'sawtooth', 0.04); break;
      case 'shine': this.seq([N.C6, N.G5, N.C6, N.E5 * 2], 0.05, 'triangle', 0.05); break;
      case 'fanfare': this.seq([N.G4, N.C5, N.E5, N.G5, 0, N.E5, N.G5, N.G5, N.G5, 0, N.C6], 0.12, 'square', 0.05);
        this.seq([N.C4, 0, N.G3, 0, N.C4, 0, N.G3, 0, N.C4, 0, N.E4], 0.12, 'triangle', 0.06); break;
      case 'splat': this.tone(120, 0, 0.12, 'sawtooth', 0.04); break;
      case 'gallop':
        for (let i = 0; i < 14; i++) { const t = i * 0.13; this.tone(i % 2 ? 520 : 390, t, 0.05, 'square', 0.025); this.noise(t, 0.04, 0.05, 1200); }
        break;
      case 'neigh': this.slide(700, 1150, 0, 0.12, 'square', 0.03); this.slide(1150, 480, 0.12, 0.36, 'square', 0.03); break;
      case 'hop': this.slide(300, 720, 0, 0.12, 'square', 0.035); break;
      case 'pop': this.noise(0, 0.08, 0.25, 2500); this.slide(1400, 300, 0, 0.12, 'square', 0.05); this.noise(0.08, 0.55, 0.06, 5000); break;
      case 'gulp': this.slide(260, 140, 0, 0.12, 'square', 0.05); break;
      case 'ahh': this.slide(520, 330, 0, 0.5, 'triangle', 0.09); break;
      case 'puff': this.noise(0, 0.15, 0.08, 900); break;
      case 'magic':
        this.seq([523, 659, 784, 1047, 1319, 1568, 2093], 0.065, 'triangle', 0.06);
        this.seq([1568, 0, 2093, 0, 2637], 0.05, 'square', 0.015);
        this.noise(0.05, 0.7, 0.03, 7000); break;
      case 'throw': this.slide(900, 260, 0, 0.3, 'triangle', 0.05); this.noise(0, 0.25, 0.04, 1500); break;
      case 'crash': this.noise(0, 0.35, 0.22, 4200); this.tone(2400, 0, 0.06, 'square', 0.03); this.tone(3100, 0.05, 0.05, 'square', 0.025); this.tone(1900, 0.1, 0.06, 'square', 0.02); break;
    }
  }
};

/* ===== Bildschirm wach halten ===== */
let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible' && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
document.addEventListener('pointerdown', () => { keepAwake(); Sound.ensure(); }, { once: true });

/* ===== Kiebitz: Prinz Naunin spricht ===== */
class Kiebitz {
  constructor(root) {
    this.root = root;
    this.cv = $('canvas', root);
    this.ctx = this.cv.getContext('2d');
    this.sayEl = $('.say', root);
    this.srEl = $('.sr', root);
    this.statusEl = $('.status', root);
    this.mood = 'idle';
    this.queue = [];
    this.busy = false;
    this.typing = null;
    this.draw();
    this.idleLoop();
  }
  muted() { return !S.settings.kiebitz; }
  draw() {
    let m = this.mood;
    if (this.muted()) m = 'tape';
    this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    this.ctx.drawImage(spriteNaunin(m), 0, 0);
  }
  idleLoop() {
    const tick = () => {
      if (!this.typing && document.visibilityState === 'visible' && this.root.offsetParent) {
        const r = Math.random();
        if (isLate() && r < 0.12) { this.mood = 'yawn'; this.draw(); setTimeout(() => { this.mood = 'idle'; this.draw(); }, 1300); }
        else { this.mood = 'blink'; this.draw(); setTimeout(() => { if (!this.typing) { this.mood = 'idle'; this.draw(); } }, 140); }
      }
      setTimeout(tick, 2600 + Math.random() * 3200);
    };
    setTimeout(tick, 2000);
  }
  setStatus(html) { if (this.statusEl) { this.statusEl.innerHTML = html; this.statusEl.hidden = !html; } }
  /* force: auch bei Maulkorb sprechen (Onboarding) */
  say(text, opts) {
    opts = opts || {};
    if (!opts.queue) { this.queue = []; this.stopTyping(); }
    if (this.muted() && !opts.force) {
      if (!opts.queue) this.type('Mmmpf.', true);
      return;
    }
    this.queue.push(text);
    if (!this.busy) this.next();
  }
  next() {
    const t = this.queue.shift();
    if (t === undefined) { this.busy = false; return; }
    this.busy = true;
    this.type(t, false, () => setTimeout(() => this.next(), 1600));
  }
  stopTyping() {
    if (this.typing) { clearInterval(this.typing); this.typing = null; }
    this.busy = false;
  }
  type(text, silent, done) {
    this.stopTyping();
    this.busy = !silent;
    if (this.srEl) this.srEl.textContent = text;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { this.sayEl.textContent = text; this.mood = 'idle'; this.draw(); if (done) done(); return; }
    let i = 0; let tick = 0;
    this.sayEl.innerHTML = '<span class="cursor"></span><span class="ghost">' + esc(text) + '</span>';
    this.typing = setInterval(() => {
      i += 1; tick++;
      this.sayEl.innerHTML = esc(text.slice(0, i)) + (i < text.length ? '<span class="cursor"></span><span class="ghost">' + esc(text.slice(i)) + '</span>' : '');
      if (!silent) { this.mood = (tick % 4 < 2 && text[i - 1] !== ' ') ? 'talk' : 'idle'; this.draw(); }
      if (i >= text.length) {
        clearInterval(this.typing); this.typing = null;
        this.mood = 'idle'; this.draw();
        if (done) done();
      }
    }, 24);
  }
  refresh() { this.draw(); }
}

/* ===== Sprite als skaliertes Canvas-Element ===== */
function spriteEl(src, scale, cls) {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  c.className = 'px' + (cls ? ' ' + cls : '');
  c.style.width = src.width * scale + 'px';
  c.style.height = src.height * scale + 'px';
  c.getContext('2d').drawImage(src, 0, 0);
  return c;
}
function figureSprite(chId, tier) {
  if (tier === 'zombie') return spriteCrawl(chId, 0);
  if (tier === 'swamp') return spriteWalk(chId, 0, true);
  if (tier === 'unicorn' || tier === 'glow') return spriteRide(chId, 0, true);
  if (tier === 'ride') return spriteRide(chId, 0);
  return spriteWalk(chId, 0);
}

/* ===== Overlay: Sheets und Dialoge ===== */
const Layer = {
  el: null,
  open(html, opts) {
    this.close();
    const wrap = document.createElement('div');
    wrap.innerHTML = '<div class="backdrop' + (opts && opts.modal ? ' modal-bd' : '') + '"></div>' + html;
    this.el = wrap;
    $('#layer').appendChild(wrap);
    $('.backdrop', wrap).addEventListener('click', () => { if (!opts || !opts.sticky) this.close(); });
    document.body.style.overflow = 'hidden';
    this.onClose = opts && opts.onClose;
    return wrap;
  },
  close() {
    if (this.el) { this.el.remove(); this.el = null; document.body.style.overflow = ''; if (this.onClose) { const f = this.onClose; this.onClose = null; f(); } }
  }
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') Layer.close(); });

function confirmDialog(text, okLabel, cancelLabel, onOk, opts) {
  const html = '<div class="modal" role="dialog" aria-modal="true">' +
    '<div class="mtxt"><div class="pcard" style="--nz:1.2"><span class="idx">B<b>&clubs;</b></span><canvas class="px" width="43" height="38"></canvas></div><p>' + esc(text) + '</p></div>' +
    '<div class="row"><button class="btn dark" data-a="no" type="button">' + esc(cancelLabel) + '</button>' +
    '<button class="btn' + (opts && opts.danger ? ' red' : '') + '" data-a="ok" type="button">' + esc(okLabel) + '</button></div></div>';
  const w = Layer.open(html, { modal: true });
  const cv = $('canvas', w); cv.getContext('2d').drawImage(spriteNaunin(S.settings.kiebitz ? 'idle' : 'tape'), 0, 0);
  $('[data-a=no]', w).addEventListener('click', () => { Sound.play('tap'); Layer.close(); });
  $('[data-a=ok]', w).addEventListener('click', () => { Sound.play('tap'); Layer.close(); onOk(); });
  $('[data-a=ok]', w).focus();
}
