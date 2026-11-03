# Momo 🐰

Momo ist eine freundliche Lern-App für Deutsch, Mathe und Englisch in der Grundschule (früher hieß sie „Wörterwiese“). Es gibt Spiele für die 1. und 2. Klasse (ab etwa 6 Jahren) und erste Spiele für die 3. und 4. Klasse (große Zahlen bis zur Million); weitere folgen. Momo, der kleine Hase, begleitet kurze Übungen, die sich automatisch an das Kind anpassen. Mit den gesammelten Sternen pflanzt das Kind im Garten Futter für Momo – ohne Zeitdruck, Minuspunkte oder Werbung.

## Starten

**`index.html` im Browser öffnen.** Es gibt keinen Build-Schritt, kein Backend, keine Laufzeit-Abhängigkeiten und keine Anmeldung. Die Dateien `index.html`, `styles.css`, `garden.css`, `core.js`, `garden.js`, `math.js`, `deutsch.js`, `english.js`, `report.js`, `app.js` und der Ordner `audio/` müssen zusammen bleiben.

Am PC funktionieren Maus und Tastatur, am Handy Touch und die eingeblendeten Buchstabentasten. Für ein Handy die Dateien am besten auf einem statischen Webhost bereitstellen und dessen Adresse im Browser öffnen; mobile Dateibetrachter führen JavaScript nicht immer aus. Die Seite kann beispielsweise unverändert über GitHub Pages veröffentlicht werden.

## Online stellen

`build-zip.bat` doppelklicken. Es erstellt `dist\woerterwiese.zip` mit genau den Dateien, die der Webserver braucht (HTML, CSS, JavaScript und `audio/laute/`), ohne Tests, Werkzeuge und `node_modules`. Den Inhalt des ZIPs direkt in den Web-Ordner hochladen bzw. entpacken, sodass `index.html` dort liegt (auch ein Unterordner wie `/wortspiel/` geht). Es ist nur ein statischer Webspace nötig, keine Datenbank und kein PHP. Fortschritte werden pro Browser und Webadresse gespeichert; nach einem Umzug auf eine andere Adresse beginnt der Garten neu.

## So funktioniert es

Beim ersten Start fragt Momo einmal: „In welche Klasse gehst du?“ Angeboten werden nur Klassen, für die es schon Spiele gibt. Erwachsene können die Klasse unter „Für Erwachsene → Überblick“ ändern.

**Die Klasse ist nur der Einstieg.** Jede Stufe eines Spiels gehört zu einer Klasse (z. B. „Uhr lesen“: volle und halbe Stunden = 1. Klasse, ab „halb 4“ = 2. Klasse). Ein Kind der 2. Klasse beginnt deshalb gleich bei den Aufgaben der 2. Klasse und muss nicht erst die Anfängeraufgaben lösen. Danach gilt die normale Anpassung: Klappt es, wird es schwerer – auch über die eigene Klasse hinaus –, klappt es nicht, wird es leichter, auch unter den Einstieg. Die Klasse des Kindes ändert sich dabei nicht. Im Lernstand sehen Erwachsene, wie viele Aufgaben aus welcher Klasse gelöst wurden und in welchen Spielen das Kind schon Aufgaben einer höheren Klasse übt.

| Klasse | Was dazugehört |
| --- | --- |
| 1. Klasse | die ersten Stufen von: Laute, Anlaute, Laute verbinden, ABC, Silben, Merken; Mengen, Zahlen bis 20, über die 10 rechnen, Geld bis 20 Cent, volle und halbe Stunden, Säulen lesen; Englisch |
| 2. Klasse | die höheren Stufen davon und zusätzlich Merkwörter, Wörter verlängern, doppelte Mitlaute und ie (Schreib-Detektiv), Nomen, Verben und Adjektive; Zahlenhaus, Hundertertafel, Weiterzählen, Vergleichen, Ordnen, Zahlen-Nachbarn, Zehner rechnen und Einmaleins |
| 3. Klasse | Deutsch: ck und tz, ä und äu durch verwandte Wörter, Wortarten ohne Bild und im Satz, Pronomen, Zeitformen (Gegenwart und Vergangenheit, auch unregelmäßig: gehen – ging). Mathe: Große Zahlen bis 1000, mit Hundertern rechnen (352 + 300, 370 + _ = 400), schriftlich plus und minus, Geteiltaufgaben, Weiterzählen in 100er-, 50er- und 25er-Schritten, Vergleichen bis 1000, Umrechnen (m und cm, € und ct, Stunden und Minuten) |
| 4. Klasse | Deutsch: ss oder ß, das oder dass, Verben als Nomen (das Schwimmen), Artikel, Perfekt mit habe oder bin, alle vier Zeitformen. Mathe: Große Zahlen bis zur Million, mit Tausendern rechnen, schriftlich bis zur Million und mit drei Zahlen, Zehnereinmaleins, Malnehmen durch Zerlegen, Teilen mit Rest, große Schritte, Vergleichen bis zur Million, kg, km und l, Brüche (½ kg, ¾ h) und Kommazahlen (2,50 €) |

Spiele ohne eigene Stufen für die 3. oder 4. Klasse starten dort auf den Stufen der 2. Klasse und werden von dort aus schwerer. „Schriftlich rechnen“, „Umrechnen“ und „Zeitformen“ beginnen erst in der 3. Klasse.

Spiele, die erst in einer höheren Klasse beginnen (z. B. Zahlenhaus oder Einmaleins), erscheinen für jüngere Kinder, sobald sie in einem passenden Spiel alle Aufgaben ihrer Klasse geschafft haben – also dort auf den Stufen der höheren Klasse angekommen sind. Passend heißt: ein Spiel aus demselben Bereich (Zahlen-Blick oder Zahlen bauen öffnen das Zahlenhaus, Silben klatschen öffnet Merkwörter und Wörter verlängern). Hat der Bereich kein solches Spiel (Vergleichen, Einmaleins, Messen), reicht ein Spiel desselben Fachs. „Schriftlich rechnen“ öffnet sich zum Beispiel, wenn „Zehner rechnen“ bei den Hunderter-Aufgaben der 3. Klasse angekommen ist, „Zeitformen“ über die „Wortarten“. Das Kind sieht dann auf der Ergebnis-Seite „Neu: Spiel …!“. Einmal geöffnete Spiele bleiben offen, auch wenn es später wieder leichter wird.

Sonst muss das Kind nichts einstellen. Auf der Startseite gibt es einen großen **Spielen**-Knopf, der das am längsten nicht gespielte Spiel startet. Darunter wählt das Kind in drei Schritten selbst:

1. **Fach:** Deutsch, Mathe oder Englisch
2. **Bereich:** bei Deutsch *Laute üben*, *ABC üben*, *Richtig schreiben*, *Wörter und Sätze* und *Zu zweit*; bei Mathe *Mengen*, *Zehner und Einer*, *Große Zahlen*, *Zahlen finden*, *Vergleichen*, *Rechnen*, *Einmaleins*, *Messen*, *Geld und Uhr* und *Diagramme*; bei Englisch *Hören und zeigen*, *Farben und Zahlen* und *Zu zweit*
3. **Spiel** aus diesem Bereich

Das ✕ im Spiel und „Anderes Spiel“ führen zurück zum Bereich, „← Zurück“ eine Stufe höher.

- **Eine Runde = 3 Sterne.** Einen Stern gibt es, wenn eine Aufgabe beim ersten Versuch klappt. Eine Runde endet nach 3 Sternen oder spätestens nach 6 Aufgaben.
- **Dynamische Schwierigkeit:** Klappt eine Aufgabe sofort, ist die nächste eine Stufe schwerer. Nach einem Fehler folgt eine ähnliche Aufgabe auf derselben Stufe. Nach zwei Aufgaben mit Fehlern hintereinander wird es eine Stufe leichter. Die Stufe wird pro Spiel gespeichert, jedes Spiel wird mit dem Fortschritt schwerer.
- **Hilfe in Stufen statt sichtbarer Lösung:** Nach dem ersten Fehler gibt Momo einen Tipp (und liest ihn vor), nach dem zweiten erscheint eine ABC-Hilfe bzw. das Bild. Bei „Hören & tippen“ leuchtet nach drei Fehlversuchen der richtige Buchstabe. Falsch getippte Karten werden ausgegraut.
- Nach einer richtigen Antwort geht es automatisch weiter.

## Deutsch: die fünfzehn Spiele und ihre Stufen

| Spiel              | Was wird geübt?                       | Wie es schwerer wird                                                          |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| Hören & tippen     | Laut hören, Buchstaben antippen       | A–H → I–P → Q–Z → ganzes ABC, 5 bis 26 Tasten, kleine Buchstaben, ähnliche Laute (B/P, D/T …) |
| Anlaut-Detektiv    | Anfangslaut eines gehörten Wortes     | 3 → 4 Karten, ohne Bild, ähnlich klingende Laute (M/N, B/P, D/T …); umgekehrt: Laut hören, Bild wählen |
| Laute-Zauber       | Einzelne Laute zu einem Wort verbinden („o – m – a“ → Oma) | 3 → 6 Laute, ähnliche Wörter (Rose/Hose/Dose), längere Pausen, später geschriebene Wörter lesen statt Bilder |
| Merkwörter         | Besondere Buchstaben C, Qu, V, X, Y in ganzen Wörtern: „?ogel“ – V, F oder W? | Qu → V (wie F) → x (wie ks) → C → y am Ende → V wie W → C/Y gemischt → alle → ohne Bild |
| Silben klatschen   | Silben zählen, fehlende Silbe finden („? – ge“ → Gei) | 1–2 Silben → bis 3 → bis 4 → nur hören, bis 5 → fehlende Silbe → lange Wörter |
| Wörter verlängern  | d oder t, g oder k, b oder p am Wortende: „Hun?“ – verlängern: Hunde | d/t → g/k und b/p → gemischt → ohne Bild → Eigenschaftswörter (gelb – gelbe) → alles |
| Schreib-Detektiv   | Rechtschreibregeln an einer Lücke: „So?e“ – nn oder n? | doppelte Mitlaute (Sonne, Hose) und i/ie mit Bild (2. Klasse) → ck/k, tz/z, ä/e und äu/eu mit verwandtem Wort (Bäume – Baum) (3. Klasse) → ss/ß, das/dass im Satz, alles gemischt (4. Klasse) |
| Wortarten          | Nomen, Verb, Adjektiv bestimmen, später Pronomen und Artikel | einzelne Wörter mit Bild: Nomen/Verb, Nomen/Adjektiv, alle drei (2. Klasse) → ohne Bild, im Satz, Pronomen (3. Klasse) → Verben als Nomen („das Schwimmen“, „beim Lesen“), Gefühle als Nomen, Artikel (4. Klasse) |
| Zeitformen         | Verbformen in Sätzen: „Heute spiele ich Fußball. Gestern … ich Fußball.“ | Vergangenheit regelmäßig (spielte), unregelmäßig (ging), Gegenwart oder Vergangenheit? (3. Klasse) → Perfekt (habe gespielt, bin gegangen), habe oder bin?, alle vier Zeitformen benennen (4. Klasse) |
| Wer fehlt?         | Lücken in einer ABC-Reihe füllen      | 4er- bis 8er-Reihen, 1 bis 3 Lücken, mehr Auswahl                             |
| ABC-Nachbarn       | Vorgänger, Nachfolger, „dazwischen“   | danach → davor → gemischt → dazwischen, 3 bis 5 Karten                        |
| ABC-Werkstatt      | Buchstaben ordnen                     | 3 bis 5 Buchstaben, mit Lücken, rückwärts                                     |
| Wörter-Rucksack 👥 | Wortketten nachsprechen               | 2 bis 5 Wörter, auch rückwärts                                                |
| Quatschwort-Echo 👥 | Fantasiewörter nachsprechen           | 2 bis 5 Silben, schwierige Lautverbindungen, zwei Wörter                      |
| Mitmach-Spiel 👥   | Bewegungsfolgen nachmachen            | 2 bis 5 Bewegungen, auch rückwärts                                            |

## Mathe: die dreiundzwanzig Spiele (Zahlenraum bis 100, in der 3. und 4. Klasse bis 1000 und bis zur Million)

Die Aufgaben orientieren sich an typischen Arbeitsheft-Seiten der 2. Klasse.

**Mengen**

| Spiel              | Was wird geübt?                                    | Wie es schwerer wird |
| ------------------ | -------------------------------------------------- | -------------------- |
| Wie viele?         | Mengen erfassen: Zehner- und Zwanzigerfeld, zwei Würfel, Strichliste, durcheinander liegende Dinge | bis 10 → bis 20 → Würfel → Strichliste bis 20 → durcheinander → Strichliste bis 50 → „Wie viele fehlen bis 20?“ |
| Mehr oder weniger? | Zwei Mengen vergleichen: mehr, weniger, gleich viele, wie viele mehr | bis 10 → bis 20, mit „gleich viele“, Falle „groß heißt nicht viel“ (wenige große Dinge gegen viele kleine), Unterschied bestimmen |
| Mengen-Kreise      | Dinge nach zwei Merkmalen sortieren (Mengendiagramm mit Schnittmenge): rot/Obst, kann fliegen/Tier, im Wasser/Tier | ein Kreis (drin oder draußen) → zwei Kreise → auch die Mitte → andere Merkmale → zählen: „Wie viele sind im Kreis?“, „nur im Kreis“, „in beiden“, „in keinem“ |

Bei den Mengen-Kreisen tragen die Kreise ein Schild mit Bild (🔴 rot, 🧺 Obst, 🪶 kann fliegen, 🐾 Tier, 💧 im Wasser). Bei der ersten Aufgabe und immer, wenn die Kreise eine neue Regel bekommen, sagt Momo sie mit der Aufgabe an („Blauer Kreis: rot. Oranger Kreis: Obst. Mitte: beides.“), damit auch Kinder, die noch nicht lesen, wissen, worum es geht.

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
| Weiterzählen   | Zahlenreihen fortsetzen oder Lücken füllen       | +1, −1, ±10, +2, ±5, Lücke in der Reihe, gemischte Schritte (2. Klasse) → 100er-, 20er-, 25er-, 50er-Schritte bis 1000 (3. Klasse) → 1000er-Schritte, große Schritte bis zur Million (4. Klasse) |

**Vergleichen**

| Spiel              | Was wird geübt?                         | Wie es schwerer wird |
| ------------------ | --------------------------------------- | -------------------- |
| Krokodil-Vergleich | < oder > („Das Krokodil frisst die größere Zahl“) | verschiedene Zehner → nahe Zahlen → gleiche Zehner → Zahlendreher (62/26) → mit = → „30 + 5“ gegen eine Zahl (2. Klasse) → bis 1000 mit Zahlendrehern (3. Klasse) → bis zur Million, auch verschieden lange Zahlen (9876 gegen 12 345) (4. Klasse) |
| Zahlen ordnen      | Zahlen der Größe nach antippen          | 3 bis 6 Zahlen, gleiche Zehner, Zahlendreher, von groß nach klein |
| Zahlen-Nachbarn    | Vorgänger, Nachfolger, dazwischen, Nachbarzehner | erst bis 50, dann über den Zehner (39 → 40), Nachbarzehner davor/danach, gemischt |

**Rechnen**

| Spiel          | Was wird geübt?                      | Wie es schwerer wird |
| -------------- | ------------------------------------ | -------------------- |
| Zehner rechnen | Mit Zehnerzahlen rechnen, später mit Hundertern und Tausendern | 50 + 30, 70 − 20, 52 + 30, 76 − 20, bis zum Nachbarzehner (32 + _ = 40), zurück (33 − _ = 30), gemischt (2. Klasse) → 300 + 400, 352 + 300, bis zum Nachbarhunderter (370 + _ = 400) (3. Klasse) → 3000 + 4000, bis zum Nachbartausender, 300 000 + 400 000 (4. Klasse) |
| Über den Zehner | Plus und Minus mit Zehnerübergang, über den vollen Zehner | 7 + 5, 13 − 5, 38 + 5, 52 − 7, in Schritten (38 + 2 + 3), zweistellig ohne und mit Übergang (34 + 25, 38 + 25, 62 − 27), gemischt |
| Schriftlich rechnen | Schriftliche Addition und Subtraktion untereinander, mit Stellentafel-Spalten und Überträgen | plus mit einem, dann mehreren Überträgen, minus (bis 1000, 3. Klasse) → bis 100 000, drei Zahlen plus, plus und minus bis zur Million (4. Klasse) |

Beim schriftlichen Rechnen zeigt Momo für das Ergebnis ein Kästchen pro Spalte, so verrät die Länge nichts. Falsche Antworten sind die typischen Fehler: Übertrag vergessen, beim Minus die kleinere von der größeren Ziffer abgezogen, Übertrag beim Minus vergessen. Nach dem zweiten Fehler erscheinen die Überträge klein über dem Strich, nach dem dritten rechnet Momo die Einer-Spalte vor.

**Einmaleins**

| Spiel     | Was wird geübt?                           | Wie es schwerer wird |
| --------- | ----------------------------------------- | -------------------- |
| Malfelder | Malaufgaben aus Punktefeldern, Kernaufgaben, Nachbar- und Tauschaufgaben, Teilen | Punkte zählen → passende Malaufgabe wählen → 2er, 5er, 10er → bis 5er → Nachbaraufgaben (6 · 5 = 5 · 5 + 5) → Tauschaufgaben → alle Reihen (2. Klasse) → Geteiltaufgaben (42 : 7), „_ · 7 = 42“ (3. Klasse) → Zehnereinmaleins (3 · 40, 120 : 4), zerlegen (4 · 23 = 4 · 20 + 4 · 3), Teilen mit Rest (23 : 5 = 4 R 3) (4. Klasse) |

**Messen** (ab der 3. Klasse)

| Spiel     | Was wird geübt?                           | Wie es schwerer wird |
| --------- | ----------------------------------------- | -------------------- |
| Umrechnen | Größen in die kleinere oder größere Einheit umrechnen | 3 m = 300 cm, 2 € = 200 ct, 400 cm = 4 m, Stunden, Minuten, Sekunden, 3 m 25 cm = 325 cm (3. Klasse) → kg, km, l, ½ kg, ¼ h, ¾ l, Kommazahlen (2,50 € = 250 ct, 1,5 km = 1500 m), alles gemischt (4. Klasse) |

Falsche Antworten beim Umrechnen: die falsche Umrechnungszahl (1 h = 100 min, also ½ h = 50 min), eine Null zu viel oder zu wenig, Zahlen einfach nebeneinander geschrieben (3 m 5 cm = 35 cm). Nach dem zweiten Fehler zeigt Momo die Umrechnung (1 m = 100 cm), nach dem dritten die Rechnung (3 · 100 cm).

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

**Große Zahlen** (ab der 2. Klasse, bis zur Million)

| Spiel        | Was wird geübt?                                   | Wie es schwerer wird |
| ------------ | ------------------------------------------------- | -------------------- |
| Immer zehn   | Das Prinzip unseres Zahlensystems: 10 gleiche Teile ergeben das nächste, größere Teil. Einer (Würfel) → Zehner (Stange) → Hunderter (Platte) → Tausender (großer Würfel) → Zehntausender → Hunderttausender → Million. Wie viel sind 10 Hunderter? Wie heißt das neue Teil? Wie viele Einer hat ein Tausender? | 10 Einer, 10 Zehner (2. Klasse) → Hunderter und Tausender (3. Klasse) → bis zur Million (4. Klasse) → alles gemischt |
| Stellentafel | Zahlen in der Stellentafel (M, HT, ZT, T, H, Z, E) mit Plättchen lesen, aus „3 Tausender, 5 Zehner, 2 Einer“ die Zahl bilden, eine Stelle ablesen, zerlegen (3052 = 3000 + 50 + 2) | bis 100 (2. Klasse) → bis 1000, auch mit Nullen (3. Klasse) → bis 100 000 → bis zur Million (4. Klasse) |
| Zahlen legen | Selbst Plättchen in die Stellentafel legen (+ und − unter jeder Spalte), dann „Fertig“. Liegen 10 Plättchen in einer Spalte, bündelt Momo sie zu einem Plättchen in der nächsten Spalte („10 Zehner → 1 Hunderter“); wer aus einer leeren Spalte wegnimmt, bekommt einen Tausch („1 Hunderter → 10 Zehner“). Aufgaben: eine Zahl legen (gezeigt oder nur gehört) und „Hier liegt 3999. Lege 1 mehr!“ | bis 100 legen, 1 oder 10 mehr (2. Klasse) → bis 1000 mit Nullen, 100 mehr/weniger, nur hören (3. Klasse) → bis 100 000, große Schritte bis zur Million, nur hören (4. Klasse) |

Die Bilder zeigen das Muster, das sich wiederholt: Würfel, Stange, Platte – und dann wieder Würfel (der Tausender ist ein großer Würfel aus 1000 kleinen), Stange, Platte. Genauso wiederholen sich die Namen: Einer, Zehner, Hunderter – Tausender, Zehntausender, Hunderttausender. In der Stellentafel trennt ein dicker Strich die Dreiergruppen, so wie die Lücke in 452 318. Typische Fehler sind als falsche Antworten dabei: die Null vergessen (3052 → 352), eine Stelle verrutscht (300 statt 3000), Ziffern vertauscht, alle Plättchen zusammengezählt, „10 Hunderter = 100“. Nach dem zweiten Fehler zeigt Momo die Treppe der Stellen mit „×10“ dazwischen bzw. die Ziffern unter der Stellentafel; leere Stellen werden als Nullen markiert. Beim Legen nennt Momo nach dem zweiten Fehler die Spalte, in der es noch zu viele oder zu wenige sind; die Hälfte der „mehr/weniger“-Aufgaben braucht Bündeln oder Tauschen.

Die gesuchte Zahl wird nie vorgelesen oder angezeigt. Zahlen spricht Momo immer als Wörter („siebenundvierzig“). Als falsche Antworten kommen typische Fehler vor: vertauschte Ziffern, alle Teile als Einer gezählt (4 + 7 = 11), die Null vergessen (50 + 30 = 8), Zeilen und Spalten der Hundertertafel verwechselt oder ein Zehner daneben. Nach dem ersten Fehler sagt Momo, welche Zahl nicht passt, und gibt einen Tipp. Nach dem zweiten erscheint sichtbare Hilfe: Beschriftung 10, 20, 30 an den Stangen, Z/E im Zahlenhaus, mehr Zahlen am Zahlenstrahl, die ganze Hundertertafel, die Schritte (+2) zwischen den Zahlen, Zehner und Einer beim Vergleichen, ein Zehnerfeld beim Ergänzen oder nummerierte Kästchen im Diagramm. Nach dem Lösen erscheint die Antwort in der Lücke, und Momo erklärt sie noch einmal („47 = 4 Zehner und 7 Einer“, „52 + 30 = 82“).

Die Spiele mit 👥 spielt ihr gemeinsam: Ein Erwachsener entscheidet mit „Hat geklappt“ oder „Noch nicht ganz“. Es gibt keine Mikrofonaufnahme und keine Spracherkennung.

Buchstaben werden als **Laute** ausgegeben („mmm“), nie als Buchstabennamen („Emm“) – so wie in der Grundschule mit der Anlauttabelle. Im Anlautspiel wird das **ganze Wort** gesprochen und nach dem Lösen der Anfangslaut vorgespielt; nach zwei Fehlern spielt Momo die Laute der übrigen Karten zum Vergleichen vor. Die Wortauswahl vermeidet Anfänge wie „Sch“, „Sp“, „St“ und „Ei“. Beim Laute-Zauber leuchtet zu jedem Laut ein Punkt auf; nach zwei Fehlern spielt Momo die Laute ohne Pausen, sodass sie zum Wort verschmelzen. Bei den ABC-Spielen sagt die Stimme keine Buchstaben, sondern nur „Welcher Buchstabe kommt danach?“. Bei „Wer fehlt?“ hört das Kind den Laut jedes gewählten Buchstabens. Beim Schreib-Detektiv werden die Karten (nn, ie, ß …) nie vorgelesen: Momo spricht nur das ganze Wort (bei das/dass den ganzen Satz) und erklärt nach dem Lösen die Regel („Der Selbstlaut ist kurz, darum doppelt.“, „Bäume kommt von Baum.“). Bei den Wortarten steht das gesuchte Wort in Großbuchstaben, damit die Schreibweise nichts verrät; nach einem Fehler schlägt Momo die Proben vor (der/die/das davor? ich davor? sehr davor?), nach dem Lösen erscheint das Wort richtig geschrieben. Nach einem Fehler sagt Momo bei den ABC-Spielen klar, dass der gewählte Buchstabe nicht passt und ein anderer richtig ist („R passt nicht. Ein anderer Buchstabe gehört in die Lücke …“).

## Englisch: die sieben Spiele

Englisch ist in Klasse 1 und 2 vor allem ein Hör-Fach: Kinder hören Wörter, zeigen auf Bilder und machen mit, lesen und schreiben aber noch kaum. Genau so arbeitet das Spiel – angelehnt an Seiten aus dem Englischbuch (Schulsachen, Spielzeug, Farben, Zahlen, Muster-Reihen, „Colour and say“). Die Anweisungen spricht Momo auf Deutsch, die englischen Wörter eine **englische Stimme**. Die Bilder sind Emojis, Farben und Formen werden gezeichnet; das Kind muss nichts Englisches lesen.

| Spiel | Was das Kind tut | Stufen (Auszug) |
| --- | --- | --- |
| 🎧 Hör und zeig | hört ein Wort („cat“) und tippt das Bild an | Tiere → Spielzeug und Schulsachen → Essen → Körper und Kleidung → Familie und draußen → alles gemischt (6 Bilder) → ähnlich klingende Wörter (cat – hat – cap, mouse – mouth – house) |
| 🙈 Was fehlt? | Momo nennt alle Bilder bis auf eins – welches fehlt? | 3 → 6 Bilder, zuletzt mit ähnlich klingenden Wörtern |
| 🔁 Muster-Reihe | Momo spricht eine Bilderreihe (plane, car, plane, car …) – was kommt als Nächstes? | AB → AAB/ABB → ABC → AABB/ABAC → lange Muster (ABCD) |
| 🎨 Farben und Formen | hört „red“, „a circle“, „a green triangle“ oder „three blue stars“ und tippt die passende Karte an | 4 → 10 Farben, Formen, Farbe + Form, Zahl + Farbe + Form bis 10 |
| 🔢 Zahlen auf Englisch | hört „seven“ und tippt die Zahl an | 1–5 als Würfelbild, 1–10, Dinge zählen, bis 12, 11–20, „three oder thirteen?“ |
| 🙋 Mach mit! 👥 | Momo sagt „Clap your hands! – Touch your nose!“, das Kind macht es nach | 1 → 4 Befehle, eigene Stufen nur mit „Touch your …!“ |
| 🗣️ Sag es auf Englisch 👥 | sieht ein Bild und sagt das englische Wort; ein Erwachsener entscheidet | 1 Bild pro Thema, dann 2 und 3 Bilder |

- **Hilfe in Stufen wie in den anderen Fächern:** Ein falsch angetipptes Bild wird auf Englisch benannt („Das ist hat – Hut“). Ab dem zweiten Fehler nennt Momo alle übrigen Karten nacheinander, sie leuchten dabei auf, und die englischen Wörter erscheinen klein unter den Bildern. Bei „Was fehlt?“ leuchten dann alle genannten Bilder – das fehlende bleibt dunkel. Bei der Muster-Reihe werden die sich wiederholenden Teile markiert.
- Nach dem Lösen sagt Momo die Übersetzung („cat heißt Katze“).
- **Ohne englische Stimme** erscheint ein Hinweis und ein zugeklappter Vorlesetext mit dem englischen Wort für Erwachsene. Englische Stimmen sind auf den meisten Geräten vorhanden oder lassen sich in den Spracheinstellungen des Systems nachinstallieren.

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
- Mit Sternen kauft das Kind **Samen** (Möhre 3 ⭐, Salat 4 ⭐, Erdbeere 6 ⭐, Kürbis 8 ⭐, Apfel 10 ⭐) und pflanzt sie in ein Beet.
- Ein Beet muss **zweimal gegossen** werden und wächst dazwischen in echter Zeit (eine Möhre braucht 4 Minuten, ein Apfel 15 Minuten). Danach wird **geerntet**. Ohne Wasser wächst nichts, aber es verwelkt auch nichts.
- **Füttern:** Das Kind zieht das Futter mit dem Finger (oder der Maus) zu Momo – oder tippt es an, dann fliegt es zu ihm. Momo macht den Mund auf, hält das Futter und isst es Biss für Biss. Jedes Futter macht nur ein Stück satt, Momo braucht also mehrere Ernten.
- **Momos Wunsch:** Eine Denkblase zeigt, worauf Momo gerade Lust hat (der Wunsch wechselt alle paar Stunden). Bekommt er genau das, freut er sich besonders.
- **Streicheln:** Antippen oder mit dem Finger über Momo streichen macht ihn ein bisschen fröhlicher; eine geschaffte Runde freut ihn mehr.
- **Momos Schatzkiste:** Übrige Sterne kann das Kind für Sachen ausgeben, die Momo anzieht (Blume, Schleife, Schal, Sonnenbrille, Kappe, Zauberhut, Krone; 8–70 ⭐), und für einen **Ball**: Wird er angetippt, rollt er weg und Momo hoppelt hinterher. Kaufen braucht zwei Tipper, damit keine Sterne aus Versehen weg sind. Angezogenes kann jederzeit zurück in die Kiste.
- Mit insgesamt gesammelten Sternen werden neue Samen, bis zu sechs Beete und Gartenschätze (Schmetterling, Sonnenblume, Häuschen, Regenbogen …) freigeschaltet.
- **Warum es nicht zu leicht ist:** In 5 Minuten schafft ein Kind leicht 15–30 Aufgaben und damit viele Sterne. Deshalb kosten Samen mehr, wachsen in echter Zeit und machen nur wenig satt; die Beete und das Warten sind die Grenze, nicht die Sterne. Was übrig bleibt, landet in der Schatzkiste.
- Ein Ausrufezeichen am „Garten“-Knopf zeigt, wenn etwas reif ist, Durst hat oder Momo Hunger hat.

## Für Erwachsene

„Für Erwachsene“ unten auf der Seite ist in vier Reiter geteilt:

- **Überblick:** die Klasse (den Einstieg) wählen, den Lernstand öffnen und das Wichtigste zum Spiel. Klassen ohne Spiele wären ausgegraut (zurzeit haben alle vier Klassen Spiele). Beim Wechsel rücken Spiele, die noch unter dem Einstieg der neuen Klasse stehen, auf diesen Einstieg vor; höhere Stufen bleiben erhalten.
- **Stufen:** die Stufe jedes Spiels von Hand setzen, falls die automatische Stufe nicht passt. Hinter jeder Stufe steht ihre Klasse („Kl. 2“). Die Spiele sind nach Fach (aufklappbar) und Bereich gruppiert.
- **Vorlesen:** Sprachausgabe ganz ein- und ausschalten, deutsche und englische Stimme, Tempo, automatisches Vorlesen, Kleinbuchstaben und die Laute zum Probehören.
- **Daten:** Datenschutz und „Fortschritt zurücksetzen“.

Nach etwa fünf Minuten Spielzeit schlägt Momo eine Pause vor.

### Lernstand

Unter „Für Erwachsene → Lernstand ansehen“ gibt es eine laufend aktualisierte Auswertung (für Kinder nicht in der Navigation):

- **Kennzahlen der letzten 7 Tage** mit Vergleich zur Vorwoche: gelöste Aufgaben, Anteil beim ersten Versuch richtig, gespielte Tage, Spielzeit.
- **Aktivität der letzten 14 Tage** als Säulendiagramm (mit Tabellenansicht).
- **Stärken** und **„Hier lohnt sich Üben“**, dazu konkrete **Ideen für zu Hause** – etwa bei verwechselten Lauten wie B/P ein Tipp, wie man den Unterschied spürbar macht.
- **Bereiche** (Laute hören, ABC & Reihenfolge, Merkwörter, Merken & Nachsprechen, Zehner & Einer, Englisch …) und eine **Tabelle aller Spiele** mit erreichter Stufe, Stufenverlauf, Trend und zuletzt gespielt.
- **Laute und ABC-Buchstaben**, die sicher sitzen oder noch geübt werden sollten, sowie wiederholte Verwechslungen.
- **Zahlendreher** in den Mathe-Spielen (z. B. 74 statt 47), mit einem Tipp für zu Hause, wenn sie öfter vorkommen.

Gezählt wird pro gelöster Aufgabe; „beim ersten Versuch richtig“ ist der Maßstab für Sicherheit. Die Seite lässt sich drucken, z. B. für ein Gespräch mit der Lehrkraft. Die Auswertung ist eine Beobachtungshilfe, keine Diagnose.

Fortschritt, Stufen, Beete, Lernstand und Einstellungen werden nur lokal im Browser gespeichert. Ein Fortschritt aus der alten Version (nur Sterne) wird übernommen. Spielstände aus der Zeit vor der Klassen-Auswahl werden der 2. Klasse zugeordnet und behalten alle Spiele und Stufen.

## Sprachausgabe

Die App nutzt die vorhandene `speechSynthesis`-API mit einer deutschen Stimme für Momo und – nur für die englischen Wörter – einer englischen Stimme (britisches Englisch wird bevorzugt). Unter **„Für Erwachsene → Vorlesen“** lassen sich beide Stimmen, Tempo, automatisches Vorlesen und Groß-/Kleinschreibung einstellen. Lokale Stimmen werden bevorzugt.

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
- `english.js`: Ansichten und Hilfen der Englisch-Spiele (Bildkarten, gezeichnete Farben und Formen, Würfelbilder, Muster-Reihen)
- `garden.js` / `garden.css`: Momos Garten mit Pflanzen, Gießen, Ernten, Füttern per Ziehen, Wunsch, Ball und Schatzkiste
- `report.js`: Lernstand-Seite für Eltern
- `audio/laute/`: die Laute als Tondateien
- `tools/`: Import der Laute aus KLettres, ZIP-Hilfe für `build-zip.bat`
- `build-zip.bat`: packt alles für den Webserver nach `dist\momo.zip`
- `tests/`: Logik- und Browser-Regressionstests
