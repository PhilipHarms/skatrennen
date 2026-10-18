/* ===== Start ===== */
const STALE_MS = 6 * 3600 * 1000;
function showScreen(name) {
  ['intro', 'race', 'podium'].forEach(s => { $('#scr-' + s).hidden = s !== name; });
  if (name !== 'race') Race.stop();
  if (name !== 'podium') Podium.stop();
  if (name !== 'intro') { Stage.stop(); document.body.classList.remove('plain'); }
  window.scrollTo(0, 0);
}
(function boot() {
  Intro.init(); Race.init(); Podium.init();
  const ready = S.players.length >= 3 && S.players.every(p => p.char);
  if (S.phase === 'race' && ready) Race.show(false);
  else if (S.phase === 'podium' && ready && !(S.finishedAt && Date.now() - S.finishedAt > STALE_MS)) Podium.show(false);
  else {
    const offerSame = S.phase === 'podium' && ready;
    S.phase = 'onboarding';
    Intro.show({ offerSame });
  }
})();
