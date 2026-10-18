# Naunins Skatrennen

Wer schreibt, der bleibt. Wer verliert, kriecht.

Ein Skat-Punktezähler im 8-Bit-Look für eine Runde an einem Handy. Prinz Naunin, Kreuz-Bube und Kiebitz, moderiert, die Spieler laufen als Figuren über eine Rennbahn, und am Ende gibt es eine Siegerehrung mit Champagnerdusche.

Alles läuft im Browser. Es gibt keinen Server und keine Datenbank: Spielstand und Namen bleiben im Speicher des Handys.

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/` | Quellcode: `shell.html` (Styles und Markup), die Skripte und `sw.js` (Offline-Modus) |
| `assets/` | Schriften (lokal, OFL-Lizenz) und App-Icons |
| `docs/` | Die fertige Web-App. GitHub Pages veröffentlicht diesen Ordner |
| `dev/` | Testskripte (Playwright) und Hilfsskripte, z. B. `make_icons.py` |
| `releases/` | Eingefrorene ältere Versionen als einzelne HTML-Dateien |

## Bauen

```
python3 build.py
```

Das erzeugt `docs/` neu. Danach committen und pushen, GitHub Pages veröffentlicht automatisch. Der Offline-Speicher bekommt bei jeder Änderung einen neuen Namen, damit Updates auf den Handys sicher ankommen.

## Eigene Domain

Den Domainnamen in eine Datei `DOMAIN` im Hauptordner schreiben (eine Zeile, z. B. `skat.example.de`) und neu bauen. Dann entsteht `docs/CNAME`. Beim Domain-Anbieter für eine Subdomain einen CNAME-Eintrag auf `philipharms.github.io` setzen.

## Tests

```
cd dev && python3 full.py   # kompletter Abend von Intro bis Siegerehrung
cd dev && python3 pwa.py    # Schriften, Manifest, Offline-Modus
```
