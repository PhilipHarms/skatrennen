/* ===== Spielliste, Hausregeln, Auswertung ===== */
function openList() {
  const ps = S.players;
  const totals = {}; ps.forEach(p => { totals[p.id] = 0; });
  let rows = '';
  S.games.forEach((g, i) => {
    const r = calcGame(g);
    if (g.player && totals[g.player] !== undefined) totals[g.player] += r.points;
    const desc = g.type === 'pass' ? 'Eingepasst' : r.desc + (r.overbid && g.type !== 'frei' ? ', überreizt' : '') + (g.kontra === 1 ? ', Kontra' : g.kontra === 2 ? ', Re' : '') + (g.bock ? ', Bock' : '');
    rows += '<tr data-i="' + i + '" tabindex="0"><td class="nr">' + (i + 1) + '</td><td class="l desc-cell" title="' + esc(desc) + '">' + esc(desc) + '</td>' +
      ps.map(p => (g.player === p.id && g.type !== 'pass')
        ? '<td><span class="d ' + (r.points < 0 ? 'neg' : 'pos') + '">' + fmt(r.points) + '</span><span class="t">' + fmtScore(totals[p.id]) + '</span></td>'
        : '<td></td>').join('') + '</tr>';
  });
  const html = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="list-h">' +
    '<div class="sheet-head"><div style="flex:1;min-width:0"><h2 id="list-h">Spielliste</h2><div class="sub">' + S.games.length + ' Spiele. Antippen zum Ändern.</div></div>' +
    '<button class="xbtn" type="button" data-close aria-label="Schließen">×</button></div>' +
    '<div class="sheet-body">' + (S.games.length
      ? '<div class="listwrap"><table class="liste"><thead><tr><th class="l">Nr</th><th class="l">Spiel</th>' + ps.map(p => '<th>' + esc(p.name) + '</th>').join('') + '</tr></thead><tbody>' + rows +
        '</tbody><tfoot><tr><td></td><td class="l">Stand</td>' + ps.map(p => '<td>' + fmtScore(totals[p.id]) + '</td>').join('') + '</tr></tfoot></table></div>'
      : '<p class="note">Noch kein Spiel eingetragen. Der Zettel ist so leer wie mein Terminkalender.</p>') +
    '</div></div>';
  const w = Layer.open(html);
  $('[data-close]', w).addEventListener('click', () => Layer.close());
  $$('tbody tr', w).forEach(tr => {
    const go = () => { const i = +tr.dataset.i; Layer.close(); Entry.open(i); };
    tr.addEventListener('click', go);
    tr.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });
}

function openSettings() {
  const st = S.settings;
  const html = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="set-h">' +
    '<div class="sheet-head"><div style="flex:1"><h2 id="set-h">Hausregeln</h2><div class="sub">Gilt für diesen Tisch</div></div>' +
    '<button class="xbtn" type="button" data-close aria-label="Schließen">×</button></div>' +
    '<div class="sheet-body">' +
    '<div class="set-row"><span><label for="set-pferd"><b>Pferd ab</b></label><small>Ab diesem Punktestand wird geritten</small></span><input id="set-pferd" class="numin" type="number" inputmode="numeric" min="10" max="5000" value="' + st.pferd + '"></div>' +
    '<div class="set-row"><span><label for="set-einhorn"><b>Einhorn ab</b></label><small>Aus dem Pferd wird ein Einhorn mit Regenbogen</small></span><input id="set-einhorn" class="numin" type="number" inputmode="numeric" min="20" max="9999" value="' + st.einhorn + '"></div>' +
    '<div class="set-row"><span><label for="set-glanz"><b>Leuchten ab</b></label><small>Ab hier strahlt die Figur golden</small></span><input id="set-glanz" class="numin" type="number" inputmode="numeric" min="20" max="9999" value="' + st.glanz + '"></div>' +
    '<div class="set-row"><span><b>Im Minus</b><small>Wer unter null f\u00e4llt, kriecht als Zombie</small></span></div>' +
    '<div class="set-row"><span><label for="set-sumpf"><b>Moor ab</b></label><small>Ab hier versinkt die Figur im Moor</small></span><input id="set-sumpf" class="numin" type="number" inputmode="numeric" max="-1" value="' + st.sumpf + '"></div>' +
    '<div class="set-row"><span><b>Spiel ausrechnen lassen</b><small>Statt Punkte selbst einzutragen das Spiel antippen: Farbe, Spitzen, Hand und so weiter</small></span><button type="button" class="chip' + (!st.manual ? ' on' : '') + '" data-t="calc" aria-pressed="' + !st.manual + '">' + (!st.manual ? 'An' : 'Aus') + '</button></div>' +
    '<div class="set-row"><span><b>Ton</b><small>Chiptune-Geräusche</small></span><button type="button" class="chip' + (st.sound ? ' on' : '') + '" data-t="sound" aria-pressed="' + st.sound + '">' + (st.sound ? 'An' : 'Aus') + '</button></div>' +
    '<div class="set-row"><span><b>Kiebitz</b><small>Kommentare von Naunin und den Figuren</small></span><button type="button" class="chip' + (st.kiebitz ? ' on' : '') + '" data-t="kiebitz" aria-pressed="' + st.kiebitz + '">' + (st.kiebitz ? 'Redet' : 'Maulkorb') + '</button></div>' +
    '<div class="sec" style="margin-top:6px"><span class="lbl">Prinz Naunin</span>' +
    '<button type="button" class="btn dark" data-a="intro">Intro noch mal ansehen</button></div>' +
    '<div class="sec" style="margin-top:6px"><span class="lbl">Neu anfangen</span>' +
    '<button type="button" class="btn dark" data-a="revanche">Neues Spiel, gleiche Runde</button>' +
    '<button type="button" class="btn red" data-a="fresh">Ganz neu, andere Leute</button></div>' +
    '<p class="note">Der Spielstand bleibt auf diesem Gerät gespeichert, auch wenn der Akku schlappmacht.</p>' +
    '<p class="note" style="font-family:var(--f-num);font-size:9px;letter-spacing:1px">VERSION ' + APP_VERSION + '</p>' +
    '</div></div>';
  const w = Layer.open(html);
  $('[data-close]', w).addEventListener('click', () => Layer.close());
  const apply = () => {
    const p = parseInt($('#set-pferd', w).value, 10), g = parseInt($('#set-glanz', w).value, 10);
    const ein = parseInt($('#set-einhorn', w).value, 10), su = parseInt($('#set-sumpf', w).value, 10);
    if (p > 0) S.settings.pferd = p;
    if (ein > 0) S.settings.einhorn = Math.max(ein, S.settings.pferd + 1);
    if (g > 0) S.settings.glanz = Math.max(g, S.settings.pferd + 1);
    if (su < 0) S.settings.sumpf = su;
    saveState(); Race.updateUI();
  };
  $('#set-pferd', w).addEventListener('change', apply);
  $('#set-glanz', w).addEventListener('change', apply);
  $('#set-einhorn', w).addEventListener('change', apply);
  $('#set-sumpf', w).addEventListener('change', apply);
  $$('[data-t]', w).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.t;
    if (k === 'calc') S.settings.manual = !S.settings.manual; else S.settings[k] = !S.settings[k];
    saveState();
    const on = k === 'calc' ? !S.settings.manual : S.settings[k];
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    b.textContent = k === 'kiebitz' ? (on ? 'Redet' : 'Maulkorb') : (on ? 'An' : 'Aus');
    Race.updateToggles(); Race.k.refresh(); Race.updateUI(); Sound.play('tap');
  }));
  $('[data-a=intro]', w).addEventListener('click', () => { Sound.play('tap'); Layer.close(); Intro.show({ replay: true }); });
  $('[data-a=revanche]', w).addEventListener('click', () => confirmDialog('Neues Spiel mit denselben Leuten? Die Punkte von jetzt verschwinden.', 'Neu anfangen', 'Abbrechen', revanche, { danger: true }));
  $('[data-a=fresh]', w).addEventListener('click', () => confirmDialog('Ganz neu anfangen? Spieler, Sitzordnung und Punkte werden zurückgesetzt.', 'Zurücksetzen', 'Abbrechen', freshStart, { danger: true }));
}

function askEvaluate() {
  if (!S.games.length) { Race.k.say(TXT.evaluate.empty, { force: true }); return; }
  const n = S.players.length;
  let text = TXT.evaluate.ask;
  const rest = S.games.length % n;
  if (rest) {
    const st = stats();
    const counts = S.players.map(p => st[p.id].deals);
    const mx = Math.max.apply(null, counts);
    const few = S.players.filter(p => st[p.id].deals < mx).map(p => p.name);
    if (few.length) text += ' ' + fill(TXT.evaluate.unequal, { names: listNames(few), verb: few.length > 1 ? 'haben' : 'hat', k: n - rest === 1 ? 'ein Spiel' : (n - rest) + ' Spiele' });
  }
  confirmDialog(text, 'Auswerten', 'Weiterspielen', goPodium);
}
function goPodium() {
  S.phase = 'podium'; S.finishedAt = Date.now(); saveState();
  Podium.show(true);
}
function revanche() {
  S.startDealer = (S.startDealer + S.games.length) % S.players.length;
  S.games = []; S.phase = 'race'; S.finishedAt = null; saveState();
  Race.show(true);
  Race.k.say('Revanche! Alle wieder auf null. Ich mag Wiederholungen, da weiß ich schon, wer verliert.');
}
function freshStart() {
  const old = S.players.slice();
  const settings = S.settings;
  S = newState();
  S.settings = settings;
  S.players = old;
  S.draft = { slots: old.map(p => ({ id: p.id, name: p.name, char: p.char })) };
  S.step = 'names';
  saveState();
  Intro.show({ quick: true, step: 'names' });
}
