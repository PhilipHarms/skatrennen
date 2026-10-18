/* ===== Spiel eintragen ===== */
function seatFromDealer(d) {
  const n = S.players.length;
  const active = [(d + 1) % n, (d + 2) % n, (d + 3) % n];
  const out = []; for (let i = 0; i < n; i++) if (!active.includes(i)) out.push(i);
  return { dealer: d, active, out };
}
const SUITSYM = { karo: '♦', herz: '♥', pik: '♠', kreuz: '♣' };

const Entry = {
  e: null, editIdx: null, si: null, root: null,
  open(editIdx) {
    const n = S.players.length;
    const isEdit = editIdx !== null && editIdx !== undefined;
    const orig = isEdit ? S.games[editIdx] : null;
    let d;
    if (orig && orig.dealerId) { d = S.players.findIndex(p => p.id === orig.dealerId); if (d < 0) d = 0; }
    else d = seatInfo(n, S.startDealer, isEdit ? editIdx : S.games.length).dealer;
    this.si = seatFromDealer(d);
    this.editIdx = isEdit ? editIdx : null;
    this.e = Object.assign({ type: null, player: null, won: true, kontra: 0, bock: false, achieved: 0, announced: 0, hand: false, overbid: false, reiz: null, showAll: false, moreSp: false, freiSign: 1, freiAbs: '', ramschPts: '' },
      orig ? JSON.parse(JSON.stringify(orig)) : {});
    if (orig && orig.type === 'frei') { this.e.freiSign = orig.freiPts < 0 ? -1 : 1; this.e.freiAbs = Math.abs(orig.freiPts); }
    if (orig && orig.player && !this.si.active.map(i => S.players[i].id).includes(orig.player)) this.e.showAll = true;
    if (orig && orig.spitzen > 4) this.e.moreSp = true;
    this.manual = orig ? !!orig.manual : !!S.settings.manual;
    if (this.manual && !orig) { this.e.type = 'frei'; this.e.manual = true; }
    this.e.tags = orig && orig.tags ? orig.tags.slice() : [];
    const nr = isEdit ? editIdx + 1 : S.games.length + 1;
    const html = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="entry-h">' +
      '<div class="sheet-head"><div style="flex:1;min-width:0"><h2 id="entry-h">' + (isEdit ? 'Spiel ' + nr + ' ändern' : 'Spiel ' + nr) + '</h2>' +
      '<div class="sub">Geber ' + esc(S.players[d].name) + (n > 3 ? ', Pause ' + esc(listNames(this.si.out.map(i => S.players[i].name))) : '') + '</div></div>' +
      '<button class="xbtn" type="button" data-close aria-label="Schließen">×</button></div>' +
      '<div class="sheet-body" id="entry-body"></div>' +
      '<div class="sheet-foot"><div class="preview"><div class="pv-desc" id="pv-desc"></div><div class="pv-pts" id="pv-pts"></div></div>' +
      '<button class="btn" id="entry-ok" type="button">' + (isEdit ? 'Speichern' : 'Eintragen') + '</button></div></div>';
    const keyH = ev => {
      if (ev.key !== 'Enter' || !this.manual) return;
      ev.preventDefault();
      if (!$('#entry-ok', this.root).disabled) this.submit();
    };
    document.addEventListener('keydown', keyH);
    const w = Layer.open(html, { onClose: () => document.removeEventListener('keydown', keyH) });
    this.root = w;
    $('[data-close]', w).addEventListener('click', () => Layer.close());
    $('#entry-ok', w).addEventListener('click', () => this.submit());
    const body = $('#entry-body', w);
    body.addEventListener('click', ev => this.onClick(ev));
    body.addEventListener('input', ev => this.onInput(ev));
    body.addEventListener('change', ev => this.onInput(ev));
    this.render();
  },
  chip(k, v, label, on, extra) {
    return '<button type="button" class="chip' + (extra || '') + (on ? ' on' : '') + '" data-k="' + k + '" data-v="' + esc(String(v)) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + label + '</button>';
  },
  render() {
    const e = this.e, body = $('#entry-body', this.root);
    const keepScroll = body.scrollTop;
    const n = S.players.length;
    let h = '';
    if (this.manual) { this.renderManual(body, keepScroll); return; }
    /* Wer */
    if (e.type !== 'pass') {
      const all = e.showAll || e.type === 'frei';
      const label = e.type === 'ramsch' ? (e.durchmarsch ? 'Wer ist durchmarschiert?' : 'Wer hat verloren?') : e.type === 'null' && e.durchmarsch ? 'Wer ist durchmarschiert?' : e.type === 'frei' ? 'Für wen?' : 'Wer spielt?';
      h += '<div class="sec"><span class="lbl">' + label + '</span><div class="chips">';
      const idxs = all ? S.players.map((_, i) => i) : this.si.active;
      const pos = ['VH', 'MH', 'HH'];
      idxs.forEach(i => {
        const p = S.players[i];
        const ai = this.si.active.indexOf(i);
        h += this.chip('player', p.id, esc(p.name) + (ai >= 0 ? ' <small>' + pos[ai] + '</small>' : ' <small>PAUSE</small>'), e.player === p.id);
      });
      if (n > 3 && e.type !== 'frei') h += this.chip('showAll', !e.showAll, e.showAll ? 'Nur die drei' : 'Andere', false);
      h += '</div></div>';
    }
    /* Was */
    h += '<div class="sec"><span class="lbl">Was wurde gespielt?</span><div class="typegrid">';
    ['karo', 'herz', 'pik', 'kreuz'].forEach(s => {
      h += this.chip('pick', 'farbe:' + s, '<span class="sym" style="color:var(--s-' + s + ')">' + SUITSYM[s] + '</span>' + SUIT_LABEL[s] + '<small>' + GRUND[s] + '</small>', e.type === 'farbe' && e.suit === s);
    });
    h += this.chip('pick', 'grand', '<span class="sym" style="font-size:13px;letter-spacing:-1px"><span style="color:var(--s-kreuz)">♣</span><span style="color:var(--s-pik)">♠</span><span style="color:var(--s-herz)">♥</span><span style="color:var(--s-karo)">♦</span></span>Grand<small>24</small>', e.type === 'grand');
    h += this.chip('pick', 'null', '<span class="sym" style="font-family:var(--f-num);font-size:14px">0</span>Null<small>23+</small>', e.type === 'null');
    h += this.chip('pick', 'ramsch', '<span class="sym" style="font-family:var(--f-num);font-size:14px">R</span>Ramsch<small>FREI</small>', e.type === 'ramsch');
    h += this.chip('pick', 'pass', '<span class="sym" style="font-family:var(--f-num);font-size:14px">·</span>Eingepasst<small>0</small>', e.type === 'pass');
    h += '</div><div class="chips">' + this.chip('pick', 'frei', 'Freie Eingabe <small>KORREKTUR</small>', e.type === 'frei') + '</div></div>';
    /* Details */
    if (e.type === 'farbe' || e.type === 'grand') {
      const max = e.type === 'grand' ? 4 : (e.moreSp ? 11 : 4);
      h += '<div class="sec"><span class="lbl">Spitzen</span>';
      [true, false].forEach(mit => {
        h += '<div class="sp-row"><span class="sp-l">' + (mit ? 'mit' : 'ohne') + '</span>';
        for (let k = 1; k <= max; k++) h += this.chip('sp', (mit ? 'm' : 'o') + k, String(k), e.mit === mit && e.spitzen === k, ' sq');
        h += '</div>';
      });
      if (e.type === 'farbe' && !e.moreSp) h += '<div class="chips">' + this.chip('moreSp', true, 'Mehr als 4 Spitzen', false) + '</div>';
      h += '</div>';
      h += '<div class="sec"><span class="lbl">Ansagen</span><div class="chips">' + this.chip('hand', !e.hand, 'Hand', e.hand) + '</div>';
      if (e.hand) {
        h += '<div class="chips">' + this.chip('announced', 0, 'Keine Ansage', !e.announced) + this.chip('announced', 1, 'Schneider angesagt', e.announced === 1) +
          this.chip('announced', 2, 'Schwarz angesagt', e.announced === 2) + this.chip('announced', 3, 'Ouvert', e.announced === 3) + '</div>';
      }
      h += '</div>';
      h += '<div class="sec"><span class="lbl">Ergebnis</span><div class="chips">' + this.chip('won', true, 'Gewonnen', e.won === true) + this.chip('won', false, 'Verloren', e.won === false) + '</div>';
      h += '<div class="chips">' + this.chip('achieved', 0, 'Kein Schneider', !e.achieved) + this.chip('achieved', 1, 'Schneider', e.achieved === 1) + this.chip('achieved', 2, 'Schwarz', e.achieved === 2) + '</div>';
      h += '<p class="note">Schneider und Schwarz zählen, egal welche Seite sie kassiert.</p>';
      h += '<div class="chips" style="align-items:center">' + this.chip('overbid', !e.overbid, 'Überreizt', e.overbid);
      if (e.overbid) {
        h += '<label class="sr" for="reiz">Gereizt bis</label><select id="reiz" class="numin" data-in="reiz">' +
          REIZWERTE.map(r => '<option value="' + r + '"' + (r === e.reiz ? ' selected' : '') + '>bis ' + r + '</option>').join('') + '</select>';
      }
      h += '</div></div>';
    }
    if (e.type === 'null') {
      h += '<div class="sec"><span class="lbl">Welcher Null?</span><div class="chips">';
      Object.entries(NULLSPIELE).forEach(([k, v]) => { h += this.chip('nullVar', k, v.name + ' <small>' + v.wert + '</small>', e.nullVar === k); });
      h += '</div></div>';
      h += '<div class="sec"><span class="lbl">Ergebnis</span><div class="chips">' + this.chip('nres', 'won', 'Gewonnen', !e.durchmarsch && e.won === true) + this.chip('nres', 'lost', 'Verloren', !e.durchmarsch && e.won === false) +
        this.chip('nres', 'durch', 'Durchmarsch <small>+120</small>', !!e.durchmarsch) + '</div>' +
        '<p class="note">' + (e.durchmarsch ? 'Alle Stiche geholt statt keinen. Das gibt +120.' : 'Durchmarsch hei\u00dft: alle Stiche geholt. Das gibt +120.') + '</p></div>';
    }
    if (e.type === 'farbe' || e.type === 'grand' || e.type === 'null') {
      h += '<div class="sec"><span class="lbl">Kontra, Re, Bock</span><div class="chips">' + this.chip('kontra', 0, 'Kein Kontra', !e.kontra) +
        this.chip('kontra', 1, 'Kontra <small>×2</small>', e.kontra === 1) + this.chip('kontra', 2, 'Re <small>×4</small>', e.kontra === 2) + '</div>' +
        '<div class="chips">' + this.chip('bock', !e.bock, 'Bock <small>×2</small>', e.bock) + '</div></div>';
    }
    if (e.type === 'ramsch') {
      h += '<div class="sec"><span class="lbl">Ramsch</span><div class="chips">' + this.chip('durchmarsch', !e.durchmarsch, 'Durchmarsch <small>+120</small>', e.durchmarsch) + this.chip('bock', !e.bock, 'Bock <small>×2</small>', e.bock) + '</div>';
      if (!e.durchmarsch) {
        h += '<label for="rp" class="lbl" style="font-family:var(--f-body);font-size:15px;text-transform:none;letter-spacing:0;color:var(--parch-ink)">Minuspunkte' + (e.player ? ' für ' + esc(pname(e.player)) : '') + '</label>' +
          '<input id="rp" class="numin" data-in="ramschPts" type="number" inputmode="numeric" min="1" max="999" placeholder="z. B. 47" value="' + esc(e.ramschPts) + '">';
        h += '<p class="note">Nur der Verlierer bekommt Minuspunkte. Durchmarsch gibt es nur mit allen 120 Augen.</p>';
      } else h += '<p class="note">Alle Stiche, alle 120 Augen. Das gibt +120 für den Durchmarschierer.</p>';
      h += '</div>';
    }
    if (e.type === 'pass') h += '<p class="note">Keiner wollte spielen. Keine Punkte, der Geber rückt weiter.</p>';
    if (e.type === 'frei') {
      h += '<div class="sec"><span class="lbl">Punkte</span><div class="chips" style="align-items:center">' + this.chip('freiSign', 1, 'Plus', e.freiSign === 1, ' sq') + this.chip('freiSign', -1, 'Minus', e.freiSign === -1, ' sq') +
        '<label class="sr" for="fp">Punkte</label><input id="fp" class="numin" data-in="freiAbs" type="number" inputmode="numeric" min="1" max="9999" placeholder="0" value="' + esc(e.freiAbs) + '"></div>' +
        '<p class="note">Für Hausregeln und Korrekturen. Zählt nicht in Serien und Ehrentitel.</p></div>';
    }
    if (this.editIdx === null) h += '<button type="button" class="linkbtn" data-k="mode" data-v="manual" style="color:var(--parch-ink)">Ab jetzt wieder selbst eintragen</button>';
    if (this.editIdx !== null) h += '<button type="button" class="linkbtn" data-del>Dieses Spiel löschen</button>';
    body.innerHTML = h;
    body.scrollTop = keepScroll;
    const del = $('[data-del]', body);
    if (del) del.addEventListener('click', () => this.askDelete());
    this.preview();
  },
  whoBlock(label) {
    const e = this.e, n = S.players.length;
    let h = '<div class="sec"><span class="lbl">' + label + '</span><div class="chips">';
    const idxs = e.showAll ? S.players.map((_, i) => i) : this.si.active;
    const pos = ['VH', 'MH', 'HH'];
    idxs.forEach(i => {
      const p = S.players[i];
      const ai = this.si.active.indexOf(i);
      h += this.chip('player', p.id, esc(p.name) + (ai >= 0 ? ' <small>' + pos[ai] + '</small>' : ' <small>PAUSE</small>'), e.player === p.id);
    });
    if (n > 3) h += this.chip('showAll', !e.showAll, e.showAll ? 'Nur die drei' : 'Andere', false);
    return h + '</div></div>';
  },
  renderManual(body, keepScroll) {
    const e = this.e;
    const isPass = e.type === 'pass';
    let h = '';
    if (!isPass) h += this.whoBlock('Wer hat gespielt?');
    h += '<div class="sec"><span class="lbl">Punkte</span>';
    if (!isPass) {
      h += '<div class="chips" style="align-items:center">' + this.chip('freiSign', 1, 'Plus', e.freiSign === 1, ' sq') + this.chip('freiSign', -1, 'Minus', e.freiSign === -1, ' sq') +
        '<label class="sr" for="fp">Punkte</label><input id="fp" class="numin" data-in="freiAbs" type="number" inputmode="numeric" min="1" max="9999" placeholder="0" value="' + esc(e.freiAbs) + '"></div>';
    } else h += '<p class="note">Keiner hat gespielt. Keine Punkte, der Geber r\u00fcckt weiter.</p>';
    h += '<div class="chips">' + this.chip('mpass', !isPass, 'Eingepasst', isPass) + '</div></div>';
    if (!isPass) {
      h += '<div class="sec"><span class="lbl">Was war\u2019s? Freiwillig, aber Naunin freut sich</span><div class="chips tagchips">' +
        TAGS.map(([k, lbl]) => this.chip('tag', k, lbl, e.tags.includes(k))).join('') + '</div></div>';
    }
    if (this.editIdx === null) h += '<button type="button" class="linkbtn" data-k="mode" data-v="calc" style="color:var(--parch-ink)">Spiel ausrechnen lassen</button>';
    else h += '<button type="button" class="linkbtn" data-del>Dieses Spiel l\u00f6schen</button>';
    body.innerHTML = h;
    body.scrollTop = keepScroll;
    const del = $('[data-del]', body);
    if (del) del.addEventListener('click', () => this.askDelete());
    this.preview();
  },
  toggleTag(k) {
    const e = this.e, has = e.tags.includes(k);
    if (has) { e.tags = e.tags.filter(t => t !== k); return; }
    const grp = TAG_GROUPS.find(gp => gp.includes(k));
    if (grp) e.tags = e.tags.filter(t => !grp.includes(t));
    e.tags.push(k);
    if (k === 'ramsch' && !e.tags.includes('durch')) e.freiSign = -1;
    if (k === 'durch') { e.freiAbs = '120'; e.freiSign = 1; }
    if (k === 'ueber') e.freiSign = -1;
  },
  parse(v) { if (v === 'true') return true; if (v === 'false') return false; if (/^-?\d+$/.test(v)) return Number(v); return v; },
  onClick(ev) {
    const c = ev.target.closest('[data-k]'); if (!c) return;
    Sound.play('tap');
    const e = this.e, k = c.dataset.k, v = this.parse(c.dataset.v);
    if (k === 'mode') {
      this.manual = v === 'manual';
      S.settings.manual = this.manual; saveState(); Race.updateUI();
      e.type = this.manual ? 'frei' : null; e.manual = this.manual; e.durchmarsch = false;
      this.render(); return;
    }
    if (k === 'mpass') { e.type = v ? 'pass' : 'frei'; e.manual = true; this.render(); return; }
    if (k === 'tag') { this.toggleTag(v); this.render(); return; }
    if (k === 'nres') { e.durchmarsch = v === 'durch'; e.won = v !== 'lost'; this.render(); return; }
    if (k === 'pick') {
      const prev = e.type;
      if (String(v).indexOf('farbe:') === 0) { e.type = 'farbe'; e.suit = v.split(':')[1]; }
      else { e.type = v; }
      if (e.type === 'grand' && e.spitzen > 4) e.spitzen = null;
      if (prev !== e.type && (e.type === 'ramsch' || e.type === 'frei')) { e.won = true; }
      if (prev !== e.type) { e.durchmarsch = false; e.manual = false; }
      if (e.type === 'null' && !e.nullVar) e.nullVar = null;
    } else if (k === 'sp') {
      e.mit = v[0] === 'm'; e.spitzen = Number(v.slice(1));
    } else if (k === 'hand') {
      e.hand = v; if (!v) e.announced = 0;
    } else if (k === 'overbid') {
      e.overbid = v;
      if (v && !e.reiz) {
        const tmp = calcGame(Object.assign({}, e, { overbid: false, player: e.player || 'x' }));
        e.reiz = REIZWERTE.find(r => r > tmp.value) || 18;
      }
    } else if (k === 'showAll') {
      e.showAll = v;
    } else {
      e[k] = v;
    }
    this.render();
  },
  onInput(ev) {
    const t = ev.target; const k = t.dataset && t.dataset.in; if (!k) return;
    this.e[k] = k === 'reiz' ? Number(t.value) : t.value;
    this.preview();
  },
  build() {
    const e = this.e;
    const g = { type: e.type };
    if (e.type === 'farbe' || e.type === 'grand') {
      Object.assign(g, { player: e.player, spitzen: e.spitzen, mit: e.mit, hand: !!e.hand, announced: e.hand ? (e.announced || 0) : 0, achieved: e.achieved || 0, won: e.won, overbid: !!e.overbid, reiz: e.overbid ? e.reiz : null, kontra: e.kontra || 0, bock: !!e.bock });
      if (e.type === 'farbe') g.suit = e.suit;
    } else if (e.type === 'null') {
      Object.assign(g, { player: e.player, nullVar: e.nullVar, won: e.durchmarsch ? true : e.won, durchmarsch: !!e.durchmarsch, kontra: e.kontra || 0, bock: !!e.bock });
    } else if (e.type === 'ramsch') {
      Object.assign(g, { player: e.player, durchmarsch: !!e.durchmarsch, ramschPts: e.durchmarsch ? 0 : Math.abs(parseInt(e.ramschPts, 10) || 0), bock: !!e.bock });
    } else if (e.type === 'frei' && e.manual) {
      Object.assign(g, { player: e.player, freiPts: (e.freiSign || 1) * Math.abs(parseInt(e.freiAbs, 10) || 0), manual: true });
      if (e.tags.length) g.tags = e.tags.slice();
    } else if (e.type === 'frei') {
      Object.assign(g, { player: e.player, freiPts: (e.freiSign || 1) * Math.abs(parseInt(e.freiAbs, 10) || 0) });
    } else if (e.type === 'pass' && e.manual) {
      g.manual = true;
    }
    return g;
  },
  preview() {
    const g = this.build();
    const r = calcGame(g);
    const d = $('#pv-desc', this.root), p = $('#pv-pts', this.root), ok = $('#entry-ok', this.root);
    let hint = '';
    if (!g.type) hint = 'Erst Spieler und Spiel wählen';
    else if (g.type !== 'pass' && !g.player) hint = g.type === 'ramsch' ? 'Wer hat verloren?' : 'Wer spielt?';
    else if ((g.type === 'farbe' || g.type === 'grand') && !g.spitzen) hint = 'Mit oder ohne wie viele?';
    else if (g.type === 'null' && !g.nullVar) hint = 'Welcher Null?';
    else if (g.type === 'ramsch' && !g.durchmarsch && !g.ramschPts) hint = 'Wie viele Minuspunkte?';
    else if (g.type === 'frei' && !g.freiPts) hint = 'Wie viele Punkte?';
    if (this.manual && g.type === 'frei' && !g.player) hint = 'Wer hat gespielt?';
    if (hint || !r.valid) {
      d.textContent = hint || 'Angaben fehlen';
      p.textContent = '···'; p.className = 'pv-pts';
      ok.disabled = true;
    } else {
      d.textContent = (g.player ? pname(g.player) + ': ' : '') + (g.type === 'pass' ? r.formula : g.manual ? (g.tags ? r.desc + ' \u00b7 ' : '') + r.formula : r.desc + ' \u00b7 ' + r.formula);
      p.textContent = g.type === 'pass' ? '0' : fmt(r.points);
      p.className = 'pv-pts' + (r.points < 0 ? ' neg' : r.points > 0 ? ' pos' : '');
      ok.disabled = false;
    }
  },
  submit() {
    const g = this.build();
    const r = calcGame(g);
    if (!r.valid) return;
    const isEdit = this.editIdx !== null;
    const before = stats();
    if (isEdit) {
      const orig = S.games[this.editIdx];
      g.dealerId = orig.dealerId; g.ts = orig.ts;
      S.games[this.editIdx] = g;
    } else {
      g.dealerId = S.players[this.si.dealer].id; g.ts = Date.now();
      S.games.push(g);
    }
    saveState();
    const after = stats();
    Layer.close();
    if (isEdit) { Race.sync(); Sound.play('blip'); Race.k.say(pick('ed', TXT.naunin.edited)); }
    else Race.afterGame(g, before, after);
  },
  askDelete() {
    const i = this.editIdx;
    confirmDialog('Spiel ' + (i + 1) + ' löschen? Die Geber-Reihenfolge danach verschiebt sich dann um eins.', 'Löschen', 'Behalten', () => {
      S.games.splice(i, 1); saveState(); Race.sync(); Sound.play('down');
      Race.k.say(pick('undo', TXT.naunin.undo));
    }, { danger: true });
  }
};
