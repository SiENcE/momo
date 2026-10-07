# CLAUDE.md

Wörterwiese: a learning game for children in 2nd grade (about 7–8 years), German and math. Momo the bunny guides short games (letters and sounds; tens and ones up to 100); earned stars buy seeds in a garden where the child grows food for Momo (a small Tamagotchi). All UI text is German and child-friendly; code, comments and commit messages are English.

## Run & test

- Run: open `index.html` directly in a browser (`file://` must keep working). No build step, no backend, no runtime dependencies, no network requests.
- `npm test`: logic tests (`tests/core.test.cjs`, Node's built-in runner, fast). Run after every change to `core.js`.
- `npm run test:browser`: Playwright on desktop and mobile viewports (about 3–4 minutes). Needs `npm install` and `npx playwright install chromium` once.
- Single browser test: `npx playwright test -g "<test name>" --project desktop`.
- Deploy package: `build-zip.bat` (or `build-zip.bat /nopause` in a terminal) writes `dist\woerterwiese.zip` with only the runtime files. **When adding a runtime file, add it to `FILES` in `build-zip.bat`** (folders such as `audio/` need their own copy line). Zip entries must use `/` separators, which is why `tools/make-zip.ps1` is used instead of `Compress-Archive`. Keep batch lines short: cmd reads batch files in 512-byte blocks and can mistake text in a very long line for a label.

## Architecture

Plain scripts loaded in this order: `core.js` → `garden.js` → `math.js` → `deutsch.js` → `report.js` → `app.js`.

- `core.js` (UMD; `window.Wiese` in the browser, `require` in tests): **all rules and data, no DOM.** Game list (`ACTIVITIES`), menu structure (`SUBJECTS` → `CATEGORIES` → games, `categoryOf`; the report's `AREAS` are derived from `CATEGORIES`), math games (`MATH_GAMES` = all games of the subject "mathe"; `numberWord`; set diagrams in `VENN_SETS`, chart topics in `GRAPH_TOPICS`), difficulty steps per game (`LEVELS`), question generators (`makeQuestion(mode, level, previous, random)`), progression (`progress`), round rules, German sounds (`LAUTE`), garden and pet logic (`CROPS`, `plant`/`water`/`harvest`, `petAt`/`feedPet`), unlocks, and `sanitizeState` for storage.
- `app.js`: views (home with subject cards, menu = categories of a subject or games of a category, game, result, garden), the game flow, stepped help, the speech queue, saving and the adult settings dialog.
- `math.js` (`window.WieseMath`): views of the math games only: `instruction(q)`, `markup(q, listen)`, `hint(q, n, picked, root, built)` (stepped help, returns text + speech), `reveal` (fills the `[data-reveal]` gap after a right answer) and `renderBuilt`. No rules here; tasks come from `core.makeQuestion`, the flow (answer, stars, speech) stays in `app.js`.
- `deutsch.js` (`window.WieseDeutsch`): the same interface (plus `MODES`) for the newer German games "syllables" and "extend". `app.js` picks the view module with `viewFor(mode)`; the older German games are still rendered in `app.js`.
- `garden.js` (`window.WieseGarden`): renders Momo's garden into `#garden-root`, plus the shared `momoSvg(mood)`, `petMessage` and `needsMarkup` helpers used by the home screen.
- `report.js` (`window.WieseReport.render(root, report)`): the parents' report view (`#report-view`, reached only via "Für Erwachsene → Lernstand ansehen"). All numbers come from `core.buildReport(state)`; `report.js` only renders (DOM built with `textContent`, no innerHTML).
- Learning statistics live in `state.stats` (aggregated counters: per game, per sound for type/initial, per ABC letter, per day; capped sizes). `solved()` calls `core.recordTask` inside the same `save()` as the stars. "ok" means solved on the first try. Keep stats aggregated – no raw event log.
- State lives in `localStorage["woerterwiese.v1"]` (key kept for migration; `version: 2`). Every write goes through `save(change)`, which re-reads storage under a Web Lock, applies `change`, writes and calls `refresh()`. Keep `sanitizeState` strict and migrate old versions rather than discarding them.

## Product rules (do not regress)

- **Never show the solution by default.** Help appears only after mistakes: first a spoken hint, then visible help (ABC strip or picture), and for typing a highlighted key after three misses. The reading text for adults (`#adult-cue`) only appears, collapsed, when no voice is available.
- **The child configures nothing.** No option controls in the game view; difficulty is automatic. Adults can override levels in "Für Erwachsene".
- **Dynamic progression** (`core.progress`): solved on the first try → one level harder; solved after mistakes → similar task on the same level, no star; two such tasks in a row → one level easier. A round needs 3 stars (`ROUND_GOAL`) and ends after at most 6 tasks (`ROUND_MAX_TASKS`). Levels are stored per game.
- **Letters are output as German sounds (Laute), never as letter names.** Browser TTS spells "mmm" as "Emm Emm Emm", so sounds are WAV files in `audio/laute/<letter>.wav`, played via `speak([..., { laut: "M" }])`. Never pass a single letter or a letter name as a string to the voice. ABC games speak without naming letters ("Welcher Buchstabe kommt danach?"). C, Q, V, X, Y (`AMBIGUOUS_LAUTE`) are never asked as sounds (their recordings say letter names); same-sounding keys count as right (`accept`). Blending words (`BLEND_WORDS.sounds`) list sounds as heard (Mond → MONT) and must not use those letters. These letters are taught in the "merk" game (Merkwörter: `MERK_WORDS` with `[bracketed]` spelling units, `MERK_RULES` with shown `text` and spoken `speech`). Its rule speech is the **only** place where letter names are spoken ("Fau", "Iks"), because these spellings cannot be heard.
- **Menu: subject → category → game.** Every game belongs to exactly one category. Leaving a game (✕, "Anderes Spiel") returns to its category.
- **Math:** numbers are spoken as words via `core.numberWord` (never digits to the voice). The number to find is never spoken or shown; help after mistakes as in the letter games (named wrong pick, then rod labels / Z-E labels / blocks / laid counts). Distractors are typical mistakes (swapped digits, pieces counted as ones, forgotten zero, rows/columns mixed up, ±1, ±10) via `numberOptions`, which fills up with near numbers at the ends of the range. `compare` repeats are checked on `q.key` (only three symbols). The math games follow workbook pages of 2nd grade (sets: ten frames, dice, tally marks, comparing sets, set diagrams with an intersection; tens and ones, number line, hundred chart, counting in steps, <, >, neighbours, calculating with tens, bar charts). Games with few possible answers (`compare`, `more`, `venn`) set `q.key`; `makeQuestion` then avoids repeating the whole task instead of the answer. Every thing in `VENN_SETS` must have exactly one clear region. Swapped picks count into `stats.math.swaps`. Each math question carries `explain` (text + speech) said after solving.
- **Syllables and lengthening:** every syllable in `SYLLABLE_WORDS` has at least two letters, so Momo can clap words syllable by syllable with the voice. In "extend" (Auslautverhärtung: Hund – Hunde) the ending letter is never spoken: wrong picks say "Dieser Buchstabe passt nicht", after solving the ending is played as a Laut file. With only two choices, its help (the lengthened word, spoken and shown with a gap) comes at the first mistake.
- **Clock:** German clock words ("halb 4" = 3:30, "Viertel nach/vor"); wrong answers only use times of the current level (`config.kinds`); `q.say` gives the spoken form of every choice.
- **Wrong picks are named.** ABC hints say which letter didn't fit (text shows the letter, the voice plays its sound and says "Der passt nicht …"). In "Wer fehlt?" every chosen letter is played as its sound (not for `AMBIGUOUS_LAUTE`).
- **Report charts** follow the dataviz rules: one series, data color `#3d8b4f` (the app green `#476e52` fails the chroma floor), columns ≤ 24px with 4px rounded tops, hairline baseline, tooltip on hover/focus plus a table view; stat tiles show deltas with arrow + words, never color alone.
- **Speech switch:** `settings.speech` (adults, "Für Erwachsene → Vorlesen") silences everything: `speak()` returns at once and shows the reading aid (`#adult-cue`), listen buttons are hidden via `body.speech-off`, the round still advances after the reading time. `autoSpeak` only controls automatic reading while speech is on.
- **Never cut Momo off.** `speak()` returns a promise that resolves when the whole queue has played (or was cancelled); after a correct answer the next task starts only when the praise has finished (capped at 12 s). Don't go back to fixed timers for advancing.
- Momo's needs fade slowly in real time but he never gets ill or leaves: no punishment, streaks or daily duties. Garden growth uses real timestamps (plants grow while the child plays a round).
- Kid-facing text: short sentences a 2nd grader can read, large touch targets (≥ 44px, letter keys larger), works at 320px width, respects `prefers-reduced-motion`.

## Sounds

- `audio/laute/*.wav` are human recordings from KDE's KLettres (`sounds/de/alpha`, GPL-2.0-or-later), imported by `node tools/import-klettres.cjs` (downloads, decodes Ogg in Playwright's Chromium, trims silence, evens out loudness, writes 22.05 kHz mono WAV because Safari cannot play Ogg). `audio/laute/QUELLE.md` and the GPL text must stay next to the files and ship in the zip. The import overwrites files; users may replace single files with their own recordings afterwards.
- Synthetic sounds were tried and rejected: browser TTS spells letters, and Windows SAPI phonemes sounded poor.
- Speech queue parts: strings → voice; `{ laut, gap, dot, highlight }` → sound file, with `gap` ms pause after a previous sound, lighting up `[data-dot]` or a `highlight` selector in `#task-area` while playing.
- If a file fails to load, the app says "Der Laut ganz am Anfang von <Beispielwort>" instead of a letter name.

## Testing notes

- Browser tests open games through the menu (`openGame`/`showGames` helpers in the specs).
- Browser tests read the current task through the read-only hook `window.WieseDebug` (`question`, `played` sound list); keep it in place.
- Speech is mocked in tests (`speechSynthesis.spoken` records texts). `tests/browser.spec.cjs` mocks *no* voices (fallback path); `tests/garden-speech.spec.cjs` mocks a German voice.
- After a correct answer the app advances automatically after `SUCCESS_DELAY` plus extra time for longer messages. Tests wait with `expect.poll` for the next question, not with fixed sleeps. Wait for the star counter before `page.reload()`, because saving is async.
- Garden timing tests use `page.clock.install()` before loading the page.
- The garden re-renders every second while visible. Do not rebuild interactive elements on each tick (it swallows taps); update in place or only when the content changes (see `renderSeeds`).

## Housekeeping

- `dist/` is build output (ignored).
- Not a git repository. `.backup-v1/` holds the pre-redesign version (ignored via `.gitignore`); leave it unless the user asks to remove it.
- Keep README.md (German, for parents and teachers) in sync when behaviour changes.
