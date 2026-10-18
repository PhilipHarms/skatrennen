/* ===== Skat-Regeln und Wertung (reine Liste) ===== */
const GRUND = { karo: 9, herz: 10, pik: 11, kreuz: 12, grand: 24 };
const NULLSPIELE = {
  null: { wert: 23, name: 'Null' },
  hand: { wert: 35, name: 'Null Hand' },
  ouvert: { wert: 46, name: 'Null ouvert' },
  ouvertHand: { wert: 59, name: 'Null ouvert Hand' }
};
const REIZWERTE = [18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50, 54, 55, 59, 60,
  63, 66, 70, 72, 77, 80, 81, 84, 88, 90, 96, 99, 100, 108, 110, 117, 120, 121, 126, 130, 132,
  135, 140, 143, 144, 150, 153, 154, 156, 160, 162, 165, 168, 170, 176, 180, 187, 192, 198,
  204, 216, 240, 264];
const SUIT_LABEL = { karo: 'Karo', herz: 'Herz', pik: 'Pik', kreuz: 'Kreuz' };

/*
 * Ein Spiel g:
 *  type: 'farbe' | 'grand' | 'null' | 'ramsch' | 'pass' | 'frei'
 *  player: Spieler-ID (Alleinspieler, Ramsch-Verlierer/Durchmarschierer, frei)
 *  suit, spitzen (1..11), mit (bool), hand, achieved (0/1 Schneider/2 Schwarz),
 *  announced (0 keine/1 Schneider/2 Schwarz/3 Ouvert), nullVar, won, overbid, reiz,
 *  kontra (0/1 Kontra/2 Re), bock, ramschPts, durchmarsch, freiPts
 */
function calcGame(g) {
  const r = { points: 0, value: 0, stufen: 0, grund: 0, desc: '', formula: '', valid: false, overbid: false };
  if (!g || !g.type) return r;
  const mult = (g.kontra === 2 ? 4 : g.kontra === 1 ? 2 : 1) * (g.bock ? 2 : 1);
  const multTxt = (g.kontra === 2 ? ' × 4 Re' : g.kontra === 1 ? ' × 2 Kontra' : '') + (g.bock ? ' × 2 Bock' : '');

  if (g.type === 'pass') {
    r.valid = true; r.desc = 'Eingepasst'; r.formula = 'Keine Punkte, neu geben';
    return r;
  }
  if (g.type === 'frei') {
    const p = Math.round(Number(g.freiPts) || 0);
    r.valid = !!g.player && p !== 0;
    r.points = p; r.value = Math.abs(p);
    r.desc = g.manual ? (tagsLabel(g.tags) || 'Selbst eingetragen') : 'Freie Eingabe';
    r.formula = g.manual && g.mRes === 'lost2' ? (g.mVal || Math.abs(p) / 2) + ' \u00d7 \u22122 verloren' : (p > 0 ? '+' : '\u2212') + Math.abs(p);
    r.overbid = !!(g.manual && g.tags && g.tags.includes('ueber'));
    return r;
  }
  if (g.type === 'ramsch') {
    const bockF = g.bock ? 2 : 1;
    if (g.durchmarsch) {
      r.points = 120 * bockF; r.value = 120;
      r.desc = 'Ramsch, Durchmarsch';
      r.formula = 'Durchmarsch 120' + (g.bock ? ' × 2 Bock' : '');
      r.valid = !!g.player;
    } else {
      const p = Math.abs(Math.round(Number(g.ramschPts) || 0));
      r.points = -p * bockF; r.value = p;
      r.desc = 'Ramsch';
      r.formula = 'Ramsch −' + p + (g.bock ? ' × 2 Bock' : '');
      r.valid = !!g.player && p > 0;
    }
    return r;
  }
  if (g.type === 'null') {
    const nv = NULLSPIELE[g.nullVar];
    if (!nv) return r;
    if (g.durchmarsch) {
      r.value = 120; r.desc = nv.name + ', Durchmarsch';
      r.points = 120 * mult;
      r.formula = 'Durchmarsch 120' + multTxt;
      r.valid = !!g.player;
      return r;
    }
    r.value = nv.wert; r.desc = nv.name;
    r.points = (g.won ? 1 : -2) * nv.wert * mult;
    r.formula = nv.wert + multTxt + (g.won ? '' : ' × −2 verloren');
    r.valid = !!g.player && typeof g.won === 'boolean';
    return r;
  }
  /* Farbspiel oder Grand */
  const grund = g.type === 'grand' ? GRUND.grand : GRUND[g.suit];
  if (!grund || !g.spitzen || typeof g.mit !== 'boolean') return r;
  const maxSp = g.type === 'grand' ? 4 : 11;
  const spitzen = Math.max(1, Math.min(maxSp, g.spitzen));
  const ann = g.hand ? (g.announced || 0) : 0;
  const ach = g.achieved || 0;
  const parts = [];
  let stufen = spitzen + 1; // Spitzen + Spiel
  parts.push((g.mit ? 'mit ' : 'ohne ') + spitzen);
  if (g.hand) { stufen++; parts.push('Hand'); }
  if (ach >= 1 || ann >= 1) { stufen++; parts.push('Schneider'); }
  if (ann >= 1) { stufen++; parts.push('angesagt'); }
  if (ach >= 2 || ann >= 2) { stufen++; parts.push('Schwarz'); }
  if (ann >= 2) { stufen++; parts.push('angesagt'); }
  if (ann >= 3) { stufen++; parts.push('ouvert'); }
  let value = stufen * grund;
  let won = !!g.won;
  if (g.overbid && g.reiz && g.reiz > value) {
    value = Math.ceil(g.reiz / grund) * grund;
    won = false;
    r.overbid = true;
  }
  r.value = value; r.stufen = stufen; r.grund = grund;
  r.points = (won ? 1 : -2) * value * mult;
  const name = g.type === 'grand' ? 'Grand' : SUIT_LABEL[g.suit];
  const dp = [(g.mit ? 'mit ' : 'ohne ') + spitzen];
  if (g.hand && ann < 3) dp.push('Hand');
  if (ann === 2) dp.push('Schwarz angesagt');
  else if (ann === 1) { dp.push('Schneider angesagt'); if (ach >= 2) dp.push('Schwarz'); }
  else if (ann === 0) { if (ach >= 2) dp.push('Schwarz'); else if (ach === 1) dp.push('Schneider'); }
  r.desc = (ann === 3 ? name + ' ouvert ' : name + ' ') + dp.join(', ');
  r.formula = r.overbid
    ? 'überreizt (' + g.reiz + ') → ' + value + multTxt + ' × −2'
    : stufen + ' × ' + grund + ' = ' + value + multTxt + (won ? '' : ' × −2 verloren');
  r.won = won;
  r.valid = !!g.player && typeof g.won === 'boolean';
  return r;
}

/* Etiketten für selbst eingetragene Spiele */
const TAGS = [['grand', 'Grand'], ['null', 'Null'], ['ramsch', 'Ramsch'], ['hand', 'Hand'], ['schneider', 'Schneider'], ['schwarz', 'Schwarz'],
  ['kontra', 'Kontra'], ['re', 'Re'], ['bock', 'Bock'], ['durch', 'Durchmarsch'], ['ueber', '\u00dcberreizt']];
const TAG_LABEL = Object.fromEntries(TAGS);
const TAG_GROUPS = [['grand', 'null', 'ramsch'], ['schneider', 'schwarz'], ['kontra', 're']];
function tagsLabel(tags) { return (tags || []).map(t => TAG_LABEL[t] || t).join(', '); }
/* Selbst eingetragenes Spiel mit Etiketten als gedachtes Spiel, für Sprüche und Statistik */
function manualAsGame(g) {
  const t = new Set(g.tags || []);
  const g2 = {
    player: g.player, won: (g.freiPts || 0) > 0, hand: t.has('hand'), announced: 0,
    achieved: t.has('schwarz') ? 2 : t.has('schneider') ? 1 : 0,
    kontra: t.has('re') ? 2 : t.has('kontra') ? 1 : 0, bock: t.has('bock'), overbid: t.has('ueber'), fromTags: true
  };
  if (t.has('ramsch')) { g2.type = 'ramsch'; g2.durchmarsch = t.has('durch'); }
  else if (t.has('null')) { g2.type = 'null'; g2.nullVar = 'null'; g2.durchmarsch = t.has('durch'); }
  else if (t.has('grand')) g2.type = 'grand';
  else if (t.has('durch')) { g2.type = 'ramsch'; g2.durchmarsch = true; }
  else g2.type = 'farbe';
  return g2;
}
const hasTags = g => g && g.type === 'frei' && g.manual && g.tags && g.tags.length > 0;

/* Wer gibt, wer spielt, wer setzt aus */
function seatInfo(n, startDealer, gameIndex) {
  const d = ((startDealer + gameIndex) % n + n) % n;
  const active = [(d + 1) % n, (d + 2) % n, (d + 3) % n];
  const out = [];
  for (let i = 0; i < n; i++) if (!active.includes(i)) out.push(i);
  return { dealer: d, active, out };
}

/* Ob ein Spiel für den Spieler als gewonnen zählt (für Serien und Titel) */
function gameOutcome(g, res) {
  if (g.type === 'pass') return 0;
  if (g.type === 'frei') return g.manual ? Math.sign(res.points) : 0;
  if (g.type === 'ramsch') return g.durchmarsch ? 1 : -1;
  return res.points > 0 ? 1 : -1;
}

/* Spielstand und Statistik aus der Historie */
function computeStats(players, games) {
  const st = {};
  for (const p of players) st[p.id] = {
    score: 0, played: 0, won: 0, lost: 0, grands: 0, nullLost: 0, nullWon: 0, overbid: 0,
    ramschLost: 0, durchmarsch: 0, best: null, min: 0, streak: 0, deals: 0, lastDelta: 0
  };
  games.forEach((g, i) => {
    if (g.dealerId && st[g.dealerId]) st[g.dealerId].deals++;
    const res = calcGame(g);
    const s = st[g.player];
    if (!s) return;
    s.score += res.points;
    s.lastDelta = res.points;
    s.min = Math.min(s.min, s.score);
    const gg = hasTags(g) ? manualAsGame(g) : g;
    const out = gg.fromTags && gg.type === 'ramsch' ? (gg.durchmarsch ? 1 : -1) : gameOutcome(g, res);
    if (gg.type === 'farbe' || gg.type === 'grand' || gg.type === 'null' || (gg.type === 'frei' && gg.manual)) {
      s.played++;
      if (out > 0) s.won++; else s.lost++;
      if (gg.type === 'grand' && out > 0) s.grands++;
      if (gg.type === 'null') { if (out > 0) s.nullWon++; else s.nullLost++; if (gg.durchmarsch) s.durchmarsch++; }
      if (res.overbid) s.overbid++;
      if (out > 0 && (!s.best || res.points > s.best.points)) s.best = { points: res.points, desc: g.type === 'frei' ? tagsLabel(g.tags) : res.desc, nr: i + 1 };
    }
    if (gg.type === 'ramsch') { if (gg.durchmarsch) s.durchmarsch++; else s.ramschLost++; }
    if (out > 0) s.streak = s.streak > 0 ? s.streak + 1 : 1;
    else if (out < 0) s.streak = s.streak < 0 ? s.streak - 1 : -1;
  });
  return st;
}

function tierOf(score, settings) {
  const sumpf = settings.sumpf != null ? settings.sumpf : -100;
  const einhorn = settings.einhorn != null ? settings.einhorn : 300;
  if (score <= sumpf) return 'swamp';
  if (score < 0) return 'zombie';
  if (score >= settings.glanz) return 'glow';
  if (score >= einhorn) return 'unicorn';
  if (score >= settings.pferd) return 'ride';
  return 'walk';
}

if (typeof module !== 'undefined') module.exports = { calcGame, seatInfo, computeStats, tierOf, REIZWERTE, manualAsGame };
