# Wörterwiese 🌱

Ein freundliches Lernspiel für Deutsch und Mathe in der 2. Klasse (ab etwa 7 Jahren). Momo, der kleine Hase, begleitet kurze Übungen, die sich automatisch an das Kind anpassen. Mit den gesammelten Sternen pflanzt das Kind im Garten Futter für Momo – ohne Zeitdruck, Minuspunkte oder Werbung.

## Starten

**`index.html` im Browser öffnen.** Es gibt keinen Build-Schritt, kein Backend, keine Laufzeit-Abhängigkeiten und keine Anmeldung. Die Dateien `index.html`, `styles.css`, `garden.css`, `core.js`, `garden.js`, `math.js`, `deutsch.js`, `report.js`, `app.js` und der Ordner `audio/` müssen zusammen bleiben.

Am PC funktionieren Maus und Tastatur, am Handy Touch und die eingeblendeten Buchstabentasten. Für ein Handy die Dateien am besten auf einem statischen Webhost bereitstellen und dessen Adresse im Browser öffnen; mobile Dateibetrachter führen JavaScript nicht immer aus. Die Seite kann beispielsweise unverändert über GitHub Pages veröffentlicht werden.

## Online stellen

`build-zip.bat` doppelklicken. Es erstellt `dist\woerterwiese.zip` mit genau den Dateien, die der Webserver braucht (HTML, CSS, JavaScript und `audio/laute/`), ohne Tests, Werkzeuge und `node_modules`. Den Inhalt des ZIPs direkt in den Web-Ordner hochladen bzw. entpacken, sodass `index.html` dort liegt (auch ein Unterordner wie `/wortspiel/` geht). Es ist nur ein statischer Webspace nötig, keine Datenbank und kein PHP. Fortschritte werden pro Browser und Webadresse gespeichert; nach einem Umzug auf eine andere Adresse beginnt der Garten neu.

## So funktioniert es

Das Kind muss nichts einstellen. Auf der Startseite gibt es einen großen **Spielen**-Knopf, der das am längsten nicht gespielte Spiel startet. Darunter wählt das Kind in drei Schritten selbst:

1. **Fach:** Deutsch oder Mathe
2. **Bereich:** bei Deutsch *Laute üben*, *ABC üben*, *Richtig schreiben* und *Zu zweit*; bei Mathe *Mengen*, *Zehner und Einer*, *Zahlen finden*, *Vergleichen*, *Rechnen*, *Einmaleins*, *Geld und Uhr* und *Diagramme*
3. **Spiel** aus diesem Bereich

Das ✕ im Spiel und „Anderes Spiel“ führen zurück zum Bereich, „← Zurück“ eine Stufe höher.

- **Eine Runde = 3 Sterne.** Einen Stern gibt es, wenn eine Aufgabe beim ersten Versuch klappt. Eine Runde endet nach 3 Sternen oder spätestens nach 6 Aufgaben.
- **Dynamische Schwierigkeit:** Klappt eine Aufgabe sofort, ist die nächste eine Stufe schwerer. Nach einem Fehler folgt eine ähnliche Aufgabe auf derselben Stufe. Nach zwei Aufgaben mit Fehlern hintereinander wird es eine Stufe leichter. Die Stufe wird pro Spiel gespeichert, jedes Spiel wird mit dem Fortschritt schwerer.
- **Hilfe in Stufen statt sichtbarer Lösung:** Nach dem ersten Fehler gibt Momo einen Tipp (und liest ihn vor), nach dem zweiten erscheint eine ABC-Hilfe bzw. das Bild. Bei „Hören & tippen“ leuchtet nach drei Fehlversuchen der richtige Buchstabe. Falsch getippte Karten werden ausgegraut.
- Nach einer richtigen Antwort geht es automatisch weiter.

## Deutsch: die zwölf Spiele und ihre Stufen

| Spiel              | Was wird geübt?                       | Wie es schwerer wird                                                          |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| Hören & tippen     | Laut hören, Buchstaben antippen       | A–H → I–P → Q–Z → ganzes ABC, 5 bis 26 Tasten, kleine Buchstaben, ähnliche Laute (B/P, D/T …) |
| Anlaut-Detektiv    | Anfangslaut eines gehörten Wortes     | 3 → 4 Karten, ohne Bild, ähnlich klingende Laute (M/N, B/P, D/T …); umgekehrt: Laut hören, Bild wählen |
| Laute-Zauber       | Einzelne Laute zu einem Wort verbinden („o – m – a“ → Oma) | 3 → 6 Laute, ähnliche Wörter (Rose/Hose/Dose), längere Pausen, später geschriebene Wörter lesen statt Bilder |
| Merkwörter         | Besondere Buchstaben C, Qu, V, X, Y in ganzen Wörtern: „?ogel“ – V, F oder W? | Qu → V (wie F) → x (wie ks) → C → y am Ende → V wie W → C/Y gemischt → alle → ohne Bild |
| Silben klatschen   | Silben zählen, fehlende Silbe finden („? – ge“ → Gei) | 1–2 Silben → bis 3 → bis 4 → nur hören, bis 5 → fehlende Silbe → lange Wörter |
| Wörter verlängern  | d oder t, g oder k, b oder p am Wortende: „Hun?“ – verlängern: Hunde | d/t → g/k und b/p → gemischt → ohne Bild → Eigenschaftswörter (gelb – gelbe) → alles |
| Wer fehlt?         | Lücken in einer ABC-Reihe füllen      | 4er- bis 8er-Reihen, 1 bis 3 Lücken, mehr Auswahl                             |
| ABC-Nachbarn       | Vorgänger, Nachfolger, „dazwischen“   | danach → davor → gemischt → dazwischen, 3 bis 5 Karten                        |
| ABC-Werkstatt      | Buchstaben ordnen                     | 3 bis 5 Buchstaben, mit Lücken, rückwärts                                     |
| Wörter-Rucksack 👥 | Wortketten nachsprechen               | 2 bis 5 Wörter, auch rückwärts                                                |
| Quatschwort-Echo 👥 | Fantasiewörter nachsprechen           | 2 bis 5 Silben, schwierige Lautverbindungen, zwei Wörter                      |
| Mitmach-Spiel 👥   | Bewegungsfolgen nachmachen            | 2 bis 5 Bewegungen, auch rückwärts                                            |

## Mathe: die achtzehn Spiele (Zahlenraum bis 100)

Die Aufgaben orientieren sich an typischen Arbeitsheft-Seiten der 2. Klasse.

**Mengen**

| Spiel              | Was wird geübt?                                    | Wie es schwerer wird |
| ------------------ | -------------------------------------------------- | -------------------- |
| Wie viele?         | Mengen erfassen: Zehner- und Zwanzigerfeld, zwei Würfel, Strichliste, durcheinander liegende Dinge | bis 10 → bis 20 → Würfel → Strichliste bis 20 → durcheinander → Strichliste bis 50 → „Wie viele fehlen bis 20?“ |
| Mehr oder weniger? | Zwei Mengen vergleichen: mehr, weniger, gleich viele, wie viele mehr | bis 10 → bis 20, mit „gleich viele“, Falle „groß heißt nicht viel“ (wenige große Dinge gegen viele kleine), Unterschied bestimmen |
| Mengen-Kreise      | Dinge nach zwei Merkmalen sortieren (Mengendiagramm mit Schnittmenge): rot/Obst, kann fliegen/Tier, im Wasser/Tier | ein Kreis (drin oder draußen) → zwei Kreise → auch die Mitte → andere Merkmale → zählen: „Wie viele sind im Kreis?“, „nur im Kreis“, „in beiden“, „in keinem“ |

Beim Vergleichen hilft Momo nach dem zweiten Fehler mit Paaren: Die Dinge ohne Partner leuchten auf. Bei den Mengen-Kreisen erscheinen dann die Beschriftungen der Felder („nur rot“, „beide“); beim Zählen leuchten die passenden Felder.

**Zehner und Einer**

| Spiel        | Was wird geübt?                                   | Wie es schwerer wird |
| ------------ | ------------------------------------------------- | -------------------- |
| Zahlen-Blick | Zehnerstangen und Einerwürfel ansehen, Zahl wählen | bis 20 → bis 50 → bis 99, Zahlendreher als Falle (74 statt 47), Einer manchmal vor den Zehnern, volle Zehner und 100 |
| Zahlenhaus   | Stellenwert: Wie viele Zehner/Einer hat 47? „4 Zehner und 7 Einer“ → Zahl | erst Zehner, dann Einer, gemischt, „7 Einer und 4 Zehner“ (umgekehrte Reihenfolge), Bündeln (3 Zehner und 12 Einer = 42), Zerlegen (47 = 40 + 7) |
| Zahlen bauen | Eine Zahl mit + und − im Zahlenhaus legen         | bis 20 → bis 99, Zahl nur hören, 10 mehr/weniger, 1 mehr/weniger, gemischt ohne sichtbare Startzahl |

**Zahlen finden**

| Spiel          | Was wird geübt?                                  | Wie es schwerer wird |
| -------------- | ------------------------------------------------ | -------------------- |
| Zahlenstrahl   | Welche Zahl zeigt der Ballon?                    | 0–20 → 0–100 (volle Zehner, Fünfer) → Ausschnitte mit weniger Beschriftung |
| Hundertertafel | Fehlende Zahl in einem Ausschnitt (rechts 1 mehr, unten 10 mehr) | Reihe → Spalte → Kreuz → 3×3-Ausschnitt → schräge Ecken → nur eine Zahl gegeben |
| Weiterzählen   | Zahlenreihen fortsetzen oder Lücken füllen       | +1, −1, ±10, +2, ±5, Lücke in der Reihe, gemischte Schritte |

**Vergleichen**

| Spiel              | Was wird geübt?                         | Wie es schwerer wird |
| ------------------ | --------------------------------------- | -------------------- |
| Krokodil-Vergleich | < oder > („Das Krokodil frisst die größere Zahl“) | verschiedene Zehner → nahe Zahlen → gleiche Zehner → Zahlendreher (62/26) → mit = → „30 + 5“ gegen eine Zahl |
| Zahlen ordnen      | Zahlen der Größe nach antippen          | 3 bis 6 Zahlen, gleiche Zehner, Zahlendreher, von groß nach klein |
| Zahlen-Nachbarn    | Vorgänger, Nachfolger, dazwischen, Nachbarzehner | erst bis 50, dann über den Zehner (39 → 40), Nachbarzehner davor/danach, gemischt |

**Rechnen**

| Spiel          | Was wird geübt?                      | Wie es schwerer wird |
| -------------- | ------------------------------------ | -------------------- |
| Zehner rechnen | Mit Zehnerzahlen rechnen             | 50 + 30, 70 − 20, 52 + 30, 76 − 20, bis zum Nachbarzehner (32 + _ = 40), zurück (33 − _ = 30), gemischt |
| Über den Zehner | Plus und Minus mit Zehnerübergang, über den vollen Zehner | 7 + 5, 13 − 5, 38 + 5, 52 − 7, in Schritten (38 + 2 + 3), zweistellig ohne und mit Übergang (34 + 25, 38 + 25, 62 − 27), gemischt |

**Einmaleins**

| Spiel     | Was wird geübt?                           | Wie es schwerer wird |
| --------- | ----------------------------------------- | -------------------- |
| Malfelder | Malaufgaben aus Punktefeldern, Kernaufgaben, Nachbar- und Tauschaufgaben | Punkte zählen → passende Malaufgabe wählen → 2er, 5er, 10er → bis 5er → Nachbaraufgaben (6 · 5 = 5 · 5 + 5) → Tauschaufgaben → alle Reihen |

**Geld und Uhr**

| Spiel       | Was wird geübt?                       | Wie es schwerer wird |
| ----------- | ------------------------------------- | -------------------- |
| Geld zählen | Münzen und Scheine zählen, passend bezahlen, Rückgeld | Cent bis 20 → bis 100 → Euro bis 30 → bis 100 → passend bezahlen → Rückgeld von 50 ct oder 1 € → passend bezahlen in Euro |
| Uhr lesen   | Analoge Uhr ablesen                   | volle Stunden → halbe („halb 4“ ist 3:30) → Viertel nach/vor → auch Digitalzeit → 5-Minuten-Schritte → gemischt |

Bei der Uhr kommen falsche Antworten nur aus Uhrzeiten, die auf der Stufe schon dran waren. Typische Verwechslungen sind dabei: „halb 3“ statt „halb 4“, vertauschte Zeiger, eine Stunde daneben. Gesagt wird „Viertel nach“ und „Viertel vor“, nicht „viertel vier“.

**Diagramme**

| Spiel        | Was wird geübt?                                   | Wie es schwerer wird |
| ------------ | ------------------------------------------------- | -------------------- |
| Säulen lesen | Säulendiagramm mit einem Kästchen pro Kind (Lieblingsobst, -tiere, -sport) | Wert ablesen → am meisten/am wenigsten → Wie viele mehr? → Wie viele zusammen? |

Die gesuchte Zahl wird nie vorgelesen oder angezeigt. Zahlen spricht Momo immer als Wörter („siebenundvierzig“). Als falsche Antworten kommen typische Fehler vor: vertauschte Ziffern, alle Teile als Einer gezählt (4 + 7 = 11), die Null vergessen (50 + 30 = 8), Zeilen und Spalten der Hundertertafel verwechselt oder ein Zehner daneben. Nach dem ersten Fehler sagt Momo, welche Zahl nicht passt, und gibt einen Tipp. Nach dem zweiten erscheint sichtbare Hilfe: Beschriftung 10, 20, 30 an den Stangen, Z/E im Zahlenhaus, mehr Zahlen am Zahlenstrahl, die ganze Hundertertafel, die Schritte (+2) zwischen den Zahlen, Zehner und Einer beim Vergleichen, ein Zehnerfeld beim Ergänzen oder nummerierte Kästchen im Diagramm. Nach dem Lösen erscheint die Antwort in der Lücke, und Momo erklärt sie noch einmal („47 = 4 Zehner und 7 Einer“, „52 + 30 = 82“).

Die Spiele mit 👥 spielt ihr gemeinsam: Ein Erwachsener entscheidet mit „Hat geklappt“ oder „Noch nicht ganz“. Es gibt keine Mikrofonaufnahme und keine Spracherkennung.

Buchstaben werden als **Laute** ausgegeben („mmm“), nie als Buchstabennamen („Emm“) – so wie in der Grundschule mit der Anlauttabelle. Im Anlautspiel wird das **ganze Wort** gesprochen und nach dem Lösen der Anfangslaut vorgespielt; nach zwei Fehlern spielt Momo die Laute der übrigen Karten zum Vergleichen vor. Die Wortauswahl vermeidet Anfänge wie „Sch“, „Sp“, „St“ und „Ei“. Beim Laute-Zauber leuchtet zu jedem Laut ein Punkt auf; nach zwei Fehlern spielt Momo die Laute ohne Pausen, sodass sie zum Wort verschmelzen. Bei den ABC-Spielen sagt die Stimme keine Buchstaben, sondern nur „Welcher Buchstabe kommt danach?“. Bei „Wer fehlt?“ hört das Kind den Laut jedes gewählten Buchstabens. Nach einem Fehler sagt Momo bei den ABC-Spielen klar, dass der gewählte Buchstabe nicht passt und ein anderer richtig ist („R passt nicht. Ein anderer Buchstabe gehört in die Lücke …“).

## Laute (Tondateien)

Browser-Stimmen können keine einzelnen Laute sprechen: Aus „mmm“ wird „Emm Emm Emm“, aus „b“ wird „Be“. Deshalb liegen die Laute als Tondateien in `audio/laute/` (`a.wav` … `z.wav`).

- Es sind Aufnahmen einer Lehrkraft aus dem freien KDE-Lernprogramm **KLettres** (Lizenz GPL-2.0 oder später). Herkunft, Lizenz und Änderungen stehen in `audio/laute/QUELLE.md`; diese Datei und der Lizenztext müssen beim Veröffentlichen mitkommen (`build-zip.bat` erledigt das).
- `node tools/import-klettres.cjs` lädt die Originale von invent.kde.org, wandelt sie von Ogg in WAV um (Safari auf iPad/iPhone spielt kein Ogg), kürzt Stille und gleicht die Lautstärke an. Es überschreibt vorhandene Dateien.
- **Bitte unter „Für Erwachsene → Laute anhören“ probehören.** Jede Datei lässt sich durch eine eigene Aufnahme ersetzen: als WAV-Datei unter demselben Namen ablegen, z. B. `m.wav`. Kurz und deutlich, Verschlusslaute (b, d, g, k, p, t) mit ganz kurzem Nachklang („bə“).
- C, Q, V, X und Y werden im Spiel **Merkwörter** über ganze Wörter gelernt – so wie in der Grundschule: Momo spricht das Wort, das Kind findet die fehlende Schreibung (z. B. „?ogel“: V, F oder W?). Nach zwei Fehlern erscheint die Merkregel als Tipp, nach dem Lösen sagt Momo sie noch einmal („Man hört f, schreibt aber V“). Hier nennt die Stimme ausnahmsweise Buchstabennamen, weil man diese Schreibungen nicht hören kann. Im Lernstand erscheinen die Merkwörter als eigener Bereich.
- C, Q, V, X und Y werden nicht als Einzellaut abgefragt: Sie sind mehrdeutig oder Lautverbindungen (Q = kw, X = ks), und die Aufnahmen dazu sprechen den Buchstabennamen. Tippt ein Kind beim Laut /f/ auf V, zählt das als richtig („So klingt auch V. Meistens schreibt man aber F.“).
- Fehlt eine Datei, sagt die Stimme ersatzweise „Der Laut ganz am Anfang von Maus“ – nie den Buchstabennamen.

## Momos Garten

Momo ist ein kleines Haustier, um das sich das Kind kümmert:

- Momo hat zwei Anzeigen: **Satt** und **Fröhlich**. Beide sinken langsam mit der echten Zeit (vollständig erst nach ein bis zwei Tagen). Momo wird nie krank und läuft nie weg.
- Mit Sternen kauft das Kind **Samen** (Möhre 1 ⭐, Salat 2 ⭐, Erdbeere 3 ⭐, Kürbis 4 ⭐, Apfel 5 ⭐) und pflanzt sie in ein Beet.
- Ein Beet muss **zweimal gegossen** werden und wächst dazwischen in echter Zeit (eine Möhre braucht 1 Minute, ein Kürbis 5 Minuten). Danach wird **geerntet** und Momo gefüttert. Ohne Wasser wächst nichts, aber es verwelkt auch nichts.
- Streicheln macht Momo ein bisschen fröhlicher; eine geschaffte Runde freut ihn mehr.
- Mit insgesamt gesammelten Sternen werden neue Samen, bis zu sechs Beete und Gartenschätze (Schmetterling, Sonnenblume, Häuschen, Regenbogen …) freigeschaltet.
- Ein Ausrufezeichen am „Garten“-Knopf zeigt, wenn etwas reif ist, Durst hat oder Momo Hunger hat.

## Für Erwachsene

Über „Für Erwachsene“ unten auf der Seite lassen sich die Sprachausgabe ganz ein- und ausschalten sowie Stimme, Tempo, automatisches Vorlesen und Kleinbuchstaben einstellen. Dort kann auch die Stufe jedes Spiels von Hand gesetzt werden, falls die automatische Stufe nicht passt. Nach etwa fünf Minuten Spielzeit schlägt Momo eine Pause vor.

### Lernstand

Unter „Für Erwachsene → Lernstand ansehen“ gibt es eine laufend aktualisierte Auswertung (für Kinder nicht in der Navigation):

- **Kennzahlen der letzten 7 Tage** mit Vergleich zur Vorwoche: gelöste Aufgaben, Anteil beim ersten Versuch richtig, gespielte Tage, Spielzeit.
- **Aktivität der letzten 14 Tage** als Säulendiagramm (mit Tabellenansicht).
- **Stärken** und **„Hier lohnt sich Üben“**, dazu konkrete **Ideen für zu Hause** – etwa bei verwechselten Lauten wie B/P ein Tipp, wie man den Unterschied spürbar macht.
- **Bereiche** (Laute hören, ABC & Reihenfolge, Merkwörter, Merken & Nachsprechen, Zehner & Einer) und eine **Tabelle aller Spiele** mit erreichter Stufe, Stufenverlauf, Trend und zuletzt gespielt.
- **Laute und ABC-Buchstaben**, die sicher sitzen oder noch geübt werden sollten, sowie wiederholte Verwechslungen.
- **Zahlendreher** in den Mathe-Spielen (z. B. 74 statt 47), mit einem Tipp für zu Hause, wenn sie öfter vorkommen.

Gezählt wird pro gelöster Aufgabe; „beim ersten Versuch richtig“ ist der Maßstab für Sicherheit. Die Seite lässt sich drucken, z. B. für ein Gespräch mit der Lehrkraft. Die Auswertung ist eine Beobachtungshilfe, keine Diagnose.

Fortschritt, Stufen, Beete, Lernstand und Einstellungen werden nur lokal im Browser gespeichert. Ein Fortschritt aus der alten Version (nur Sterne) wird übernommen.

## Sprachausgabe

Die App nutzt die vorhandene `speechSynthesis`-API mit einer deutschen Stimme. In **„Für große Menschen“** lassen sich Stimme, Tempo, automatisches Vorlesen und Groß-/Kleinschreibung einstellen. Lokale deutsche Stimmen werden bevorzugt.

- Bei jeder Aufgabe wird zuerst **die Aufgabenanweisung** vorgelesen. Bei Hörspielen folgt nach einer kurzen Pause der Buchstabe, das Wort oder die Wortkette.
- Die kleine 🔊-Taste neben der Anweisung wiederholt Anweisung und Inhalt, die große „Anhören“-Taste nur den Inhalt. Tipps nach Fehlern werden ebenfalls vorgelesen. Automatisches Vorlesen ist in den Einstellungen abschaltbar.
- Mit dem Schalter **„Sprachausgabe (Stimme und Laute)“** wird das Spiel ganz still: keine Stimme, keine Laute, keine 🔊-Tasten. Stattdessen erscheint bei jeder Aufgabe der zugeklappte Vorlesetext für Erwachsene. Hörspiele wie „Hören & tippen“ gehen dann nur mit einem Erwachsenen, der vorliest.
- Die Verfügbarkeit und Aussprache hängen von Browser, Betriebssystem und installierten Stimmen ab. Bitte insbesondere Fantasiewörter und die Laute vorab probehören.
- Auf manchen Handys muss zunächst aktiv auf „Anhören“ getippt werden.
- Wenn keine deutsche Stimme verfügbar ist oder das Vorlesen scheitert, erscheint ein zugeklappter „Für Erwachsene: Vorlesetext“. Ist eine Stimme da, wird er gar nicht angezeigt – so sieht das Kind keine Lösung.
- Die Spieledateien brauchen keine Internetverbindung. Eine ausgewählte Sprachstimme kann dennoch einen Online-Dienst des Geräte- oder Browseranbieters verwenden. Für reines Offline-Spiel eine lokal installierte Stimme oder gemeinsames Vorlesen verwenden.
- Das Spiel selbst lädt keine externen Schriften, Bilder, Analyse-Skripte oder andere Ressourcen.

## Pädagogischer Rahmen

Das Spiel ist eine Übungshilfe, kein diagnostisches oder therapeutisches Angebot. Beobachtet entspannt, welche Zugänge helfen: Hören, Bilder, sichtbare Reihenfolgen oder Bewegung. Anhaltende Schwierigkeiten beim Merken und Nachsprechen könnt ihr mit Lehrkraft, Kinderarzt oder einer geeigneten Fachperson besprechen.

## Entwicklung & Tests

Die App selbst benötigt kein npm. Nur die automatisierten Browsertests verwenden Playwright als Entwicklungsabhängigkeit.

```sh
npm install
npm test
npx playwright install chromium
npm run test:browser
```

`npm test` prüft Aufgaben, Stufen, Progression, Momo und die Beete mit Nodes eingebautem Test-Runner. Die Playwright-Tests öffnen `index.html` direkt, spielen auf Desktop- und Smartphone-Viewports, prüfen Speicherung, Navigation und die Sprach-Fallbacks. Die automatischen Sprachtests simulieren die Browser-API; sie können die tatsächliche Verständlichkeit einer Systemstimme nicht beurteilen. Das bitte auf dem Zielgerät gemeinsam probehören.

### Dateien

- `index.html`: Startseite mit Fach-Auswahl, Menü (Bereiche und Spiele), Spielansicht, Ergebnis, Garten und Einstellungen für Erwachsene
- `styles.css`: responsives Layout, Touch-Bedienung, Fokusmarkierungen und reduzierte Bewegung
- `core.js`: Stufen und Aufgabengeneratoren, Progression, Momo, Beete, Freischaltungen und Speicher-Validierung
- `app.js`: Spielablauf, Hilfe in Stufen, sequenzielles Vorlesen, Speicherung und Einstellungen
- `math.js`: Ansichten und Hilfen der Mathe-Spiele (Zehnerstangen, Zahlenstrahl, Hundertertafel, Geld, Uhr, Diagramme)
- `deutsch.js`: Ansichten und Hilfen der Spiele „Silben klatschen“ und „Wörter verlängern“
- `garden.js` / `garden.css`: Momos Garten mit Pflanzen, Gießen, Ernten und Füttern
- `report.js`: Lernstand-Seite für Eltern
- `audio/laute/`: die Laute als Tondateien
- `tools/`: Import der Laute aus KLettres, ZIP-Hilfe für `build-zip.bat`
- `build-zip.bat`: packt alles für den Webserver nach `dist\woerterwiese.zip`
- `tests/`: Logik- und Browser-Regressionstests
