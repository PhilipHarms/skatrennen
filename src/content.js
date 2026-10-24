/* ===== Texte: Prinz Naunin (Kiebitz) und die Figuren ===== */
const TXT = {
  intro: [
    'So ist es besser. Ich bin Prinz Naunin, Kreuz-Bube und h\u00f6chster Trumpf im ganzen Blatt. Pardon, ich hab schon mal vorgegl\u00fcht.',
    'Ich schaue euch heute beim Skat \u00fcber die Schulter. Ungefragt. Man nennt das Kiebitz.',
    'Keine Sorge, ich z\u00e4hle mit. Ihr sollt euch ja aufs Verlieren konzentrieren k\u00f6nnen.'
  ],
  names: 'Wer sitzt am Tisch? Mindestens drei. Wenn ihr mehr seid, setzt der Geber aus, wie es sich gehört.',
  /* Sprüche zu bestimmten Namen. Der erste kommt immer zuerst, danach gemischt */
  nameJokes: {
    jan: [
      'Jan? Ich kenn nur Remke!',
      'Jan. Drei Buchstaben. So viele Stiche macht er an einem guten Abend.',
      'Ah, Jan. Ich mache schon mal Platz f\u00fcr die Minuspunkte.',
      'Jan spielt mit? Dann wissen wir ja, wer heute den Ramsch nach Hause tr\u00e4gt.',
      'Jan. Ein Name wie ein Nullspiel: kurz, und meistens geht es schief.',
      'Jan? Ich hatte auf jemanden Gef\u00e4hrlichen gehofft.',
      'Jan ist da. Haltet eure Karten fest. Und euren Prosecco.',
      'Jan. Gut, dass ich mitz\u00e4hle. Jan z\u00e4hlt n\u00e4mlich gern gro\u00dfz\u00fcgig.',
      'Jan? Ich schreibe ihn schon mal unten in die Liste. Spart nachher Zeit.',
      'Jan. Der Einzige hier, der schon bei 18 ins Schwitzen kommt.'
    ],
    charlotte: [
      'Charlotte? Rieche ich hier Marie Johanna?',
      'Charlotte? Oder eher Karl Otto?',
      'Ohje, die ist schlau, zieht euch warm an.'
    ],
    naunin: [
      'Naunin? Was f\u00fcr ein edler Name.',
      'Naunin? Das ist bestimmt ein Pfundskerl!',
      'Naunin! Sicheeeer. Nix!',
      'Naunin? Ey, der hei\u00dft ja wie ich!'
    ],
    philip: [
      'Philip? Welcher denn? Davon gibt\u2019s doch so viele\u2026',
      'Philip? Klingt royal!',
      'Philip? Bleib mir weg mit dem, der hat mir das Ganze hier eingebrockt!'
    ],
    till: [
      'Till? Jetzt geht\u2019s bestimmt um Geld!',
      'Till? Sind wir hier beim Preisskat?',
      'Till! Wie stehen die Aktien?',
      'Till! Spielt Ludo auch mit?'
    ],
    matteo: [
      'Wer hat denn den Olli-Schulz-Klon eingeladen?',
      'Matti! Kennen wir uns nicht aus Kampen?',
      'Matteo! Ich hab da \u2019ne Frage zu dem Fonds, den du mir verkauft hast.',
      'Ahhh, der Herr Vermieter!',
      'Hey, warum wird mein Depot pl\u00f6tzlich rot?'
    ],
    fritz: [
      'Ah, ein Meyer!',
      'Her mit dem Fernet!'
    ],
    jonathan: [
      'Jonathan! Ein biblischer Name. Beten hilft beim Skat aber auch nicht.',
      'Jonathan? Der Name hat mehr Buchstaben, als du heute Spiele gewinnst.',
      'Jonathan. Klingt nach jemandem, der beim Reizen erst mal die Regeln googelt.',
      'Jonathan? Kurz Jonny. Und genauso kurz bleibt dein Vorsprung.'
    ],
    zauni: [
      'Zauni! Servus. Hier wird Skat gespielt, nicht Schnapsen.',
      'Zauni? Ein \u00d6sterreicher gegen lauter Piefkes. Ich halte zu den Piefkes.',
      'Zauni ist da. Gleich wird jedes verlorene Spiel als Schm\u00e4h verkauft.',
      'Zauni! Kleiner Hinweis: Bei uns hei\u00dft der Bube Bube. Nicht Unter.',
      'Zauni? Sch\u00f6n. Wer verliert, bringt n\u00e4chstes Mal Kaiserschmarrn mit.'
    ],
    gunnar: [
      'Gunnar? Klingt nach Wikinger. Mal sehen, wie viele Stiche du heute pl\u00fcnderst.',
      'Gunnar! Klingt wie ein Ikea-Regal. Aufbauen dauert, und am Ende fehlt immer was.',
      'Gunnar ist da. Pl\u00fcndern ist hier \u00fcbrigens nur mit Trumpf erlaubt.',
      'Gunnar? Nordisches Gem\u00fct. Wenn er verliert, merkt man es nicht mal.'
    ],
    tine: [
      'Tine? Klingt harmlos. Genau das ist der Trick.',
      'Tine! Klein, aber gemein. Passt auf eure Asse auf.',
      'Tine! Die Einzige hier, die Kontra sagt und es auch so meint.',
      'Tine ist da. Ich lege schon mal die Krone bereit. F\u00fcr sie, nicht f\u00fcr euch.'
    ]
  },
  /* Andere Schreibweisen, die denselben Spruch bekommen */
  nameAlias: { matti: 'matteo' },
  namesWarn: {
    few: 'Drei. Mindestens drei. Ich kann ja nicht mitspielen, so gern ich würde.',
    dup: 'Zwei Leute mit demselben Namen? Gebt euch Spitznamen. Gemeine, bitte.'
  },
  seats: 'Jetzt die Sitzordnung, im Uhrzeigersinn. Tippt zwei an, um sie zu tauschen.',
  dealer: 'Und wer gibt zuerst? Danach geht es reihum im Uhrzeigersinn.',
  dealerPicked: '{dealer} gibt zuerst. Vorhand ist dann {vh}. Mischen nicht vergessen.',
  figures: 'Jeder hat eine Figur bekommen. Ich habe nach Gutd\u00fcnken verteilt. Beschwerden nehme ich nicht an. Tauschen d\u00fcrft ihr trotzdem.',
  start: 'Auf die Pl\u00e4tze. {dealer} gibt, die Rennbahn ist frei.',
  prost: 'Prost! M\u00f6ge der Bessere gewinnen. Also ich. Aber ich spiele ja nicht.',
  same: 'Euch kenne ich doch. {names}. Dieselben Leute wie letztes Mal? Dann gibt {dealer}.',
  sameNo: 'Neue Gesichter? Na gut. Wer sitzt diesmal am Tisch?',
  welcomeBack: [
    'Ah, ihr seid zurück. Ich habe alles behalten. Leider auch eure Fehler.',
    'Weiter geht’s. Ich habe die Punkte bewacht. Keiner hat geschummelt. Glaube ich.'
  ],

  roleReason: {
    bube: ['Bube. Zählt zwei Augen, sticht aber fast alles. Wie ich, nur schlechter.', 'Bube. Fast so wichtig wie ich. Fast.'],
    dame: ['Dame. Zählt drei Augen, sieht dafür gut aus.', 'Dame. Beim Skat unterschätzt, wie im echten Leben.'],
    koenig: ['König. Vier Augen wert, mehr erwartet auch keiner.', 'König. Viel Krone, wenig Trumpf.']
  },
  suitReason: {
    kreuz: 'Kreuz, meine Farbe. Benimm dich.',
    pik: 'Pik, grün wie die Hoffnung auf einen Sieg.',
    herz: 'Herz, weil du so ein gutes hast. Angeblich.',
    karo: 'Karo, die kleinste Farbe. Irgendwer muss sie ja nehmen.'
  },

  dealerLine3: ['{dealer} gibt. Und mischt bitte, als ginge es um etwas.', '{dealer} gibt. Achtzehn, zwanzig, ihr wisst Bescheid.', '{dealer} gibt. Ich schaue genau hin.'],
  dealerLineN: ['{dealer} gibt, {out} schaut zu und hält hoffentlich den Mund. Das ist mein Job.', '{dealer} gibt. {out} setzt aus und darf mir Gesellschaft leisten.', '{dealer} gibt, {out} hat Pause. Glückwunsch, da kann man nichts verlieren.'],

  naunin: {
    wonMit: ['Mit mir an der Spitze gewinnt man eben. Gern geschehen, {name}.', '{name} hatte mich auf der Hand. Da kann ja nichts schiefgehen.', 'Kreuz-Bube auf der Hand, Sieg in der Tasche. Ich wiederhole mich, ich weiß.'],
    wonOhne: ['Ohne mich gewonnen. Das nehme ich persönlich.', '{name} gewinnt ohne den Kreuz-Buben. Glück ist keine Strategie.', 'Ohne mich. Ich bin nicht beleidigt. Ein bisschen.'],
    lostMit: ['Mich auf der Hand und trotzdem verloren. Ich schäme mich für dich, {name}.', 'Der höchste Trumpf war bei dir, {name}. Der Verstand offenbar nicht.'],
    lostOhne: ['Ohne mich verloren. Überraschung: keine.', '{name} spielt ohne mich und verliert. Ich sag ja nichts. Ich denk’s nur.', 'Ohne den Alten verloren. Wer hätte das gedacht. Ich.'],
    grandWon: ['Ein Grand, {pts} Punkte. Und wer ist der höchste Bube im Grand? Richtig.', 'Grand gewonnen. {name} darf heute aufrecht gehen.'],
    grandLost: ['Grand verloren. Große Oper, kleines Publikum.', '{name} spielt Grand und verliert {abs}. Größenwahn ist auch eine Leistung.'],
    nullWon: ['Null gewonnen. Das Spiel für Leute, die gern nichts haben.', '{name} bekommt nichts und freut sich. Bescheidenheit, die sich lohnt.'],
    nullLost: ['Null verloren. Ein Stich zu viel, {abs} Punkte zu wenig.', 'Beim Null ist ein Stich einer zu viel. Hat dir das keiner gesagt, {name}?'],
    nullOuvertLost: ['Null ouvert verloren. Alle haben deine Karten gesehen. Und gelacht.'],
    overbid: ['Passe ist übrigens auch ein Wort. Und es kostet nichts.', '{name} hat bis {reiz} gereizt. Mit dem Blatt. Mutig.', 'Überreizt. Gier frisst Hirn, wie man bei Hofe sagt.'],
    schwarzWon: ['Schwarz! Die anderen haben ihre Karten nur zum Festhalten bekommen.'],
    schneiderWon: ['Schneider. Die Gegenspieler sollten über einen Berufswechsel nachdenken.', 'Unter dreißig Augen für die Gegner. Das gibt Gerede im Dorf.'],
    schneiderLost: ['{name} wurde selbst geschneidert. Das ist eine ganz eigene Kunst.'],
    handWon: ['Hand gespielt und gewonnen. Den Skat brauchte {name} nicht. Mich schon.', 'Ohne Skataufnahme gewonnen. Ich bin beeindruckt. Steht so im Protokoll.'],
    handLost: ['Hand gespielt, Hand vor die Stirn.', 'Ein Blick in den Skat hätte geholfen, {name}. Nur so ein Gedanke.'],
    kontraWon: ['Kontra gegen {name}, und {name} gewinnt trotzdem. Das hat sich f\u00fcr die anderen nicht gelohnt.', 'Kontra gesagt, Lehrgeld bezahlt. So mag ich das.'],
    kontraLost: ['Kontra! Und {name} hat es verdient.', 'Wer Kontra kriegt, sollte zuhören. {name} hat nicht zugehört.'],
    re: ['Re! Jetzt wird’s persönlich.'],
    bock: ['Bock! Doppelt hält besser. Oder tut doppelt weh.'],
    ramsch: ['Ramsch. Wenn keiner will, verlieren alle. {name} am meisten.', '{name} hat beim Ramsch alles eingesammelt. Auch die Schande.', 'Ramsch. {abs} Augen für {name}. Ich hätte geschoben.'],
    durchmarsch: ['Durchmarsch! {name} hat alle Stiche. So sieht Tyrannei aus. Ich bin beeindruckt.'],
    nullDurchmarsch: ['Null angesagt und alle Stiche geholt. Konsequent falsch und trotzdem 120 Punkte.', '{name} wollte keinen Stich und hat alle bekommen. Durchmarsch! Ich verstehe die Welt nicht mehr.'],
    pass: ['Alle passen. Ritter waren auch schon mal mutiger.', 'Eingepasst. Keiner traut sich. Ich hätte gespielt. Ich spiele immer.', 'Eingepasst. Ich notiere: Feigheit, einstimmig.'],
    frei: ['Freie Eingabe. Ich frag lieber nicht, wofür.', 'Hausregel, nehme ich an. Ich schreib’s auf und denke mir meinen Teil.'],
    bigWon: ['{pts} Punkte. Bringt mir einen Stuhl. Einen vergoldeten.', '{pts} für {name}. Das gibt ein Lied. Ein schlechtes, aber immerhin.'],
    bigLost: ['Minus {abs}. Das hört man bis in den Burggraben.', '{name} verliert {abs}. Ich lasse schon mal ein Grab ausheben.'],
    won: ['{name} gewinnt {pts}. Ich hätte mehr rausgeholt. Aber gut.', '+{pts} für {name}. Ordentlich. Langweilig, aber ordentlich.'],
    lost: ['{name} verliert {abs}. Ich notiere: Mut ja, Verstand nein.', 'Minus {abs} für {name}. Das wird ein langer Abend.'],
    ride: ['{name} reitet jetzt. Frag nicht, wo das Pferd herkommt.', '{name} sitzt hoch zu Ross. Hochmut kommt vor dem Fall, sagt man bei Hofe.'],
    swamp: ['{name} versinkt im Moor. Ich werfe kein Seil.', 'Minus hundert. {name} ist jetzt Moorleiche. Sehr stimmungsvoll.', '{name} blubbert nur noch. Ich verstehe trotzdem jedes Wort.'],
    unswamp: ['{name} zieht sich aus dem Morast. Riecht noch etwas.', '{name} krabbelt aus dem Moor. Ich h\u00e4tte gewettet, der bleibt da.'],
    unicorn: ['Ein Einhorn f\u00fcr {name}. Kitschig, aber verdient.', '{name} reitet jetzt ein Einhorn. Ich bin neidisch. Ein bisschen.', 'Regenbogen und Glitzer f\u00fcr {name}. Mir wird \u00fcbel vor Neid.'],
    ununicorn: ['{name}s Einhorn ist zu jemand W\u00fcrdigerem geflogen.', 'Das Einhorn hat {name} verlassen. Es mag keine Verlierer.'],
    unride: ['{name} hat das Pferd verloren. Es ist zu jemand Vernünftigerem gelaufen.'],
    glow: ['{name} leuchtet. Entweder Ruhm oder Fieber.', '{name} strahlt. Ich finde das übertrieben.'],
    zombie: ['{name} kriecht jetzt. Willkommen im Sumpf.', '{name} ist im Minus und damit offiziell untot.'],
    unzombie: ['{name} ist von den Toten auferstanden. Wer hat das erlaubt?', '{name} kriecht aus dem Sumpf. Bitte die Füße abtreten.'],
    fire: ['Drei in Folge. {name} brennt. Jemand sollte löschen.', '{name} ist heiß gelaufen. Ich meine das spielerisch.'],
    cloud: ['Drei verloren in Folge. Über {name} regnet es. Nur über {name}.', '{name} hat jetzt eine eigene Regenwolke. Die geht so schnell nicht weg.'],
    late: ['Nach elf. Ich bin ein Bube, keine Eule.', 'Es ist spät. Die Könige gähnen schon.', 'Mitternacht naht. Um diese Zeit reizt man nur noch aus Trotz.'],
    undo: ['Rückgängig. Wenn das im echten Leben auch ginge.', 'Gestrichen. Ich hab’s trotzdem gesehen.'],
    edited: ['Nachträglich korrigiert. Ich sag nichts. Ich schreib’s nur auf.'],
    muteOn: 'Na schön. Ich halte den Mund.',
    muteOff: 'Da bin ich wieder. Hab ich was verpasst? Bestimmt was Peinliches.'
  },

  fig: {
    winSmall: ['Kleinvieh macht auch Mist.', 'Läuft. Langsam, aber es läuft.', 'Ein Sieg ist ein Sieg.', 'Bescheiden gewonnen ist auch gewonnen.'],
    winMid: ['Das war Können.', 'Ich hab’s euch ja gesagt.', 'Schreibt das auf. Groß.', 'Wer schreibt, der bleibt.'],
    winBig: ['Verneigt euch.', 'Das gibt ein Denkmal.', 'Ich nehme Glückwünsche in bar.', 'Merkt euch diesen Moment.'],
    grand: ['Grand! Vier Buben, ein Plan.', 'Grand. Farbe ist was für Anfänger.'],
    hand: ['Den Skat brauch ich nicht.', 'Ohne Skat, mit Stil.'],
    schneider: ['Geschneidert! Maß genommen, fertig.', 'Unter dreißig. Schämt euch ein bisschen.'],
    schwarz: ['Schwarz! Nicht ein Stich für euch.', 'Alle Stiche. Alle.'],
    nullWin: ['Nichts genommen, alles gewonnen.', 'Null Stiche, volles Genie.'],
    nullOuvertWin: ['Hosen runter und trotzdem gewonnen.', 'Offen gespielt, nichts zu verbergen.'],
    kontraWin: ['Kontra? Danke für die Extrapunkte.', 'Wer Kontra sagt, muss auch zahlen.'],
    lose: ['Das war Taktik.', 'Ich wollte euch nur in Sicherheit wiegen.', 'Rückwärts ist auch eine Richtung.', 'Zählt das wirklich?', 'Die Karten waren gegen mich.', 'Nächstes Mal. Ganz bestimmt.'],
    loseBig: ['Ich brauche einen Moment.', 'Das war teuer.', 'Kann man das rückgängig machen? Ach so.'],
    grandLose: ['Vier Buben im Kopf, keiner in der Hand.', 'Großer Name, kleines Ergebnis.'],
    handLose: ['Hätte ich mal in den Skat geschaut.', 'Hand gespielt. Hand vor die Stirn.'],
    nullLose: ['Null gespielt. Null verstanden.', 'Einen Stich. Einen einzigen.', 'Ausgerechnet die Sieben.'],
    nullOuvertLose: ['Hosen runter, und alle haben gelacht.', 'Offen verloren. Jetzt wissen es alle.'],
    overbid: ['Bei 18 hätte ich aufhören sollen.', 'Ich hab mich verzählt. Absichtlich.', 'Reizen ist ein Gefühl. Meins war falsch.'],
    schneiderLose: ['Selbst geschneidert. Sitzt aber nicht.', 'Unter dreißig. Bitte nicht weitererzählen.'],
    kontraLose: ['Kontra gehört. Nicht zugehört.', 'Das Kontra war berechtigt. Leider.'],
    ramsch: ['Alles mitgenommen. Leider auch die Augen.', 'Ich sammle halt gern.', 'Ramsch ist kein Spiel. Ramsch ist eine Strafe.'],
    durchmarsch: ['Durchmarsch! Alle Stiche, keine Gnade.', 'Hundertzwanzig. Ich bin eine Naturgewalt.'],
    nullDurchmarsch: ['Plan B hat funktioniert.', 'Wenn schon, denn schon.', 'Null Stiche war mir zu wenig.'],
    freiPlus: ['Punkte sind Punkte.', 'Frag nicht.'],
    freiMinus: ['Das musste wohl sein.', 'Ich will nicht drüber reden.'],
    toRide: ['Ein Pferd! Wo kommt das her?', 'Hü!', 'Ab jetzt nur noch zu Pferd.'],
    toGlow: ['Ich leuchte. Ist das normal?', 'Ich bin erleuchtet.'],
    toZombie: ['Punkte... Punkte...', 'Ich bin nicht tot. Ich bin nur im Minus.', 'Mir geht’s gut. Ich krieche nur gern.'],
    fromZombie: ['Ich lebe! Ich lebe!', 'Zurück von den Toten.'],
    toSwamp: ['Blubb.', 'Hilfe! Ach, egal.', 'Hier unten ist es warm.', 'Ich seh nur noch Matsch.'],
    fromSwamp: ['Luft!', 'Ich bin wieder da. Fast.'],
    toUnicorn: ['Glitzer!', 'Ich bin wundersch\u00f6n.', 'Platz da, Einhorn!', 'Seht ihr den Regenbogen?'],
    lostUnicorn: ['Mein Einhorn! Komm zur\u00fcck!', 'Wieder nur ein Pferd. Wie gew\u00f6hnlich.'],
    lostHorse: ['Mein Pferd! Wo ist mein Pferd?'],
    fire: ['Ich bin nicht zu stoppen!', 'Heiß, heiß, heiß!'],
    cloud: ['Warum immer ich?', 'Ich hab doch nichts gemacht.']
  },
  react: {
    afterLoss: ['Haha.', 'Das tat weh. Mir nicht.', 'Weiter so, {name}!', 'Ich hab nichts gesagt.', 'Herrlich.', 'Mein Beileid. Nicht.'],
    afterWin: ['Glück.', 'Pures Glück.', 'Das waren die Karten, nicht du.', 'Angeber.', 'Ich hätte Kontra sagen sollen.']
  },

  evaluate: {
    ask: 'Wirklich auswerten? Feiglinge hören auf, wenn sie vorne liegen.',
    unequal: '{names} {verb} seltener gegeben als die anderen. Unfair, aber euer Problem. Bis zur vollen Runde fehlen noch {k}.',
    empty: 'Auswerten? Es wurde noch kein einziges Spiel gespielt. Selbst für eure Verhältnisse ist das wenig.',
    podiumTie: ['Gleichstand an der Spitze: {first}. Geteilter Ruhm ist halber Ruhm.', '{first} teilen sich den Sieg. Wie romantisch. Die Dusche gibt es trotzdem nur einmal.'],
    podium: ['Der Sieger: {first}. Ich hätte es besser gemacht, aber gut.', '{first} gewinnt. Applaus. Nicht zu laut, ich hab Kopfweh.'],
    pranger: '{last} darf an den Pranger. Ist Tradition. Tomaten liegen bereit.',
    fool: '{last} bekommt die Narrenkappe. Steht dir.'
  },

  titles: {
    grand: { title: 'Ritter vom Grand', line: '{n}× Grand gewonnen. Vier Buben, kein Zweifel.' },
    best: { title: 'Glückspilz des Abends', line: 'Größtes Spiel: {desc}, +{pts}.' },
    bestManual: { title: 'Gl\u00fcckspilz des Abends', line: 'Gr\u00f6\u00dftes Spiel des Abends: +{pts}.' },
    mauer: { title: 'Der Mauerer', line: 'Nur {spiele} gemacht. Sicher ist sicher.' },
    pech: { title: 'Pechvogel', line: '{spiele} verloren. Respekt für die Ausdauer.' },
    hoch: { title: 'Der Hochstapler', line: '{n}× überreizt. Gier frisst Hirn.' },
    nullnr: { title: 'Nullnummer', line: '{n}× Null verloren. Ausgerechnet die Sieben.' },
    ramsch: { title: 'Ramschkönig', line: '{n}× beim Ramsch alles kassiert.' },
    zombie: { title: 'Zombie des Abends', line: 'Tiefpunkt bei {min}. Gekrochen, nicht gestorben.' },
    phoenix: { title: 'Phönix aus dem Sumpf', line: 'Von {min} auf {final}. Wer hat das erlaubt?' },
    durch: { title: 'Der Tyrann', line: '{n}× Durchmarsch. Keine Gnade.' }
  }
};
