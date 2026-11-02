const { test, expect } = require("@playwright/test");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const C = require("../core.js");
const appUrl = pathToFileURL(path.resolve(__dirname, "../index.html")).href;
// Home → subject → category: the games of a category are listed in the menu.
async function showGames(page, id) {
  const category = C.categoryOf(id);
  await page.locator(".brand").click();
  await page.locator(`[data-subject="${category.subject}"]`).click();
  await page.locator(`[data-category="${category.id}"]`).click();
}
async function openGame(page, id) {
  await showGames(page, id);
  await page.locator(`.activity-card[data-activity="${id}"]`).click();
}

// The adult area has tabs; the level list is grouped by subject.
async function adultTab(page, tab) {
  await page.locator(`#tab-${tab}`).click();
}
async function levelSelect(page, mode) {
  await adultTab(page, "levels");
  const subject = C.categoryOf(mode).subject;
  const group = page.locator(`[data-subject-levels="${subject}"]`);
  if (!(await group.evaluate((element) => element.open)))
    await group.locator("summary").click();
  return page.locator(`[data-level-for="${mode}"]`);
}
const together = (mode) => Boolean(C.ACTIVITIES.find((x) => x.id === mode)?.together);
// Speech without voices: the app must stay playable with an adult reading aloud.
async function installSpeechMock(page) {
  await page.addInitScript(() => {
    const synth = new EventTarget();
    synth.voices = [];
    synth.spoken = [];
    synth.getVoices = () => synth.voices;
    synth.cancel = () => {};
    synth.speak = (utterance) => {
      synth.spoken.push(utterance.text);
      queueMicrotask(() => {
        utterance.onstart?.();
        utterance.onend?.();
      });
    };
    Object.defineProperty(window, "speechSynthesis", {
      value: synth,
      configurable: true,
    });
  });
}
const question = (page) => page.evaluate(() => window.WieseDebug.question);
const task = (page, letter) =>
  page.locator(`#task-area [data-answer="${letter}"]`);

async function solve(page) {
  const q = await question(page);
  if (q.mode === "order")
    for (const letter of q.answer) await task(page, letter).click();
  else if (q.mode === "sort")
    for (const value of q.order) await task(page, value).click();
  else if (q.mode === "missing")
    for (const letter of q.answers) await task(page, letter).click();
  else if (together(q.mode)) await page.locator("#echo-done").click();
  else if (q.mode === "build") {
    await lay(page, q.target.tens - q.start.tens, q.target.ones - q.start.ones);
    await page.locator("#build-done").click();
  } else await task(page, q.answer).click();
  return q;
}
// Adds (or takes away) rods and cubes in the place-value house.
async function lay(page, tens, ones) {
  for (const [place, diff] of [["tens", tens], ["ones", ones]])
    for (let i = 0; i < Math.abs(diff); i++)
      await page
        .locator(`[data-build="${place}"][data-step="${diff > 0 ? 1 : -1}"]`)
        .click();
}
async function wrong(page) {
  const q = await question(page);
  if (together(q.mode)) return page.locator("#echo-retry").click();
  // The start never equals the target, so checking right away is wrong.
  if (q.mode === "build") return page.locator("#build-done").click();
  const options =
    q.keys ||
    q.cards ||
    q.pictures?.map((x) => x.initial) ||
    q.choices.map((x) => x.word ?? x);
  const avoid =
    q.mode === "order"
      ? [q.answer[0]]
      : q.mode === "sort"
        ? [q.order[0]]
        : q.answers || [q.answer];
  for (const candidate of options.filter((x) => !avoid.includes(x)))
    if (await task(page, candidate).isEnabled())
      return task(page, candidate).click();
  throw new Error("No wrong option left");
}
// Waits for the automatic advance to the next task.
async function nextTask(page, previous) {
  await expect
    .poll(async () => {
      const q = await question(page);
      return q && JSON.stringify(q) !== JSON.stringify(previous);
    })
    .toBe(true);
}

// A fresh start asks for the grade first; grade 2 has every game.
async function chooseGrade(page, grade = 2) {
  await page.locator(`[data-grade="${grade}"]`).click();
  await expect(page.locator("[data-subject]").first()).toBeVisible();
}
// Most tests start like a save from before the grade choice: grade 2 with
// every game, all levels at the first one.
test.beforeEach(async ({ page }) => {
  await installSpeechMock(page);
  await page.goto(appUrl);
  await page.evaluate(() =>
    localStorage.setItem("woerterwiese.v1", JSON.stringify({ version: 2 })),
  );
  await page.reload();
  await expect(page.locator("[data-subject]").first()).toBeVisible();
});

for (const activity of C.ACTIVITIES) {
  test(`three-star round with rising difficulty: ${activity.title}`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openGame(page, activity.id);
    for (let i = 0; i < 3; i++) {
      await expect(page.locator("#game-level")).toHaveText(`Stufe ${i + 1}`);
      const q = await solve(page);
      expect(q.level).toBe(i);
      await expect(page.locator("#total-stars")).toHaveText(String(i + 1));
      await expect(page.locator("#feedback")).toHaveClass(/correct/);
      if (i < 2) await nextTask(page, q);
    }
    await expect(page.locator("#result-view")).toBeVisible();
    await expect(page.locator("#result-title")).toHaveText("Super gemacht!");
    await expect(page.locator("#result-stars .earned")).toHaveCount(3);
    await expect(page.locator("#result-description")).toContainText("Stufe 4");
    await page.reload();
    await expect(page.locator("#total-stars")).toHaveText("3");
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("woerterwiese.v1")),
    );
    expect(stored.rounds).toBe(1);
    expect(stored.totalStars).toBe(3);
    expect(stored.levels[activity.id]).toBe(3);
    await showGames(page, activity.id);
    await expect(
      page.locator(`.activity-card[data-activity="${activity.id}"]`),
    ).toContainText("Stufe 4");
    expect(errors).toEqual([]);
  });
}

test("nothing gives the solution away by default", async ({ page }) => {
  // Opens every game with choices through the menu.
  test.setTimeout(60000);
  await page.evaluate(() => {
    window.speechSynthesis.voices = [
      { name: "Deutsch", lang: "de-DE", voiceURI: "de", localService: true },
      { name: "English", lang: "en-GB", voiceURI: "en", localService: true },
    ];
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  const english = C.ENGLISH_GAMES.filter((mode) => !together(mode));
  for (const mode of ["type", "initial", "blend", "missing", "neighbor", "order", ...C.MATH_GAMES, ...english]) {
    await page.locator(".brand").click();
    await openGame(page, mode);
    await expect(page.locator("#adult-cue")).toBeHidden();
    await expect(page.locator("#game-view select, #game-view input")).toHaveCount(0);
    if (["missing", "neighbor", "order"].includes(mode))
      await expect(page.locator("#abc-help")).toBeHidden();
    await expect(page.locator(".mini-tip")).toHaveCount(0);
    if (C.MATH_GAMES.includes(mode)) {
      await expect(page.locator("#math-help")).toBeHidden();
      await expect(page.locator(".place-count").first()).toBeHidden();
      const q = await question(page);
      // The number to find is nowhere on screen except on its answer card.
      if (mode === "bundle") await expect(page.locator(".rod-label").first()).toBeHidden();
      if (["line", "chart", "steps", "adjacent", "calc"].includes(mode)) {
        const shown = await page.evaluate(() =>
          [
            ...document.querySelectorAll(
              "#task-area :is(.number-tile, .hundred-cell, .equation, .line-label:not(.help-label))",
            ),
          ]
            .filter((element) => !element.closest(".math-help"))
            .flatMap((element) => element.textContent.match(/\d+/g) || []),
        );
        expect(shown).not.toContain(q.answer);
      }
      if (mode === "line") await expect(page.locator(".help-label").first()).toBeHidden();
      if (mode === "steps") await expect(page.locator(".step-arrow").first()).toBeHidden();
      if (mode === "graph") await expect(page.locator(".bar-value").first()).toBeHidden();
    }
    // English: the written words under the pictures appear only as help.
    if (english.includes(mode)) {
      await expect(page.locator(".choice-caption").first()).toBeHidden();
      if (mode === "enpattern") await expect(page.locator("[data-reveal]")).toHaveText("?");
    }
    if (mode === "blend") {
      // Only dots show the sounds; picture captions stay hidden.
      await expect(page.locator(".sound-dots")).toHaveText("");
      await expect(page.locator(".choice-caption").first()).toBeHidden();
    }
  }
});

test("a mistake brings stepped help, no star, and a similar task on the same level", async ({
  page,
}) => {
  await openGame(page, "neighbor");
  await wrong(page);
  await expect(page.locator("#feedback")).toHaveClass(/try-again/);
  await expect(page.locator("#abc-help")).toBeHidden();
  await wrong(page);
  await expect(page.locator("#abc-help")).toBeVisible();
  const q = await solve(page);
  await expect(page.locator("#feedback")).toContainText("noch einmal");
  await expect(page.locator("#total-stars")).toHaveText("0");
  await expect(page.locator("#game-stars .earned")).toHaveCount(0);
  await nextTask(page, q);
  const similar = await question(page);
  expect(similar.level).toBe(0);
  expect(similar.mode).toBe("neighbor");
  // A second task with mistakes cannot go below the easiest level.
  await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("1");
});

test("two tasks with mistakes in a row make the next one easier", async ({
  page,
}) => {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("woerterwiese.v1") || "null");
    localStorage.setItem(
      "woerterwiese.v1",
      JSON.stringify({ ...(raw || {}), version: 2, levels: { missing: 4 } }),
    );
  });
  await page.reload();
  await openGame(page, "missing");
  await expect(page.locator("#game-level")).toHaveText("Stufe 5");
  for (let i = 0; i < 2; i++) {
    await wrong(page);
    const q = await solve(page);
    await nextTask(page, q);
  }
  await expect(page.locator("#game-level")).toHaveText("Stufe 4");
});

test("rounds end after six tasks even without three stars", async ({ page }) => {
  // Six tasks with the success pause (word + sound) take longer than the default.
  test.setTimeout(60000);
  await openGame(page, "initial");
  for (let i = 0; i < 6; i++) {
    await wrong(page);
    const q = await solve(page);
    if (i < 5) await nextTask(page, q);
  }
  await expect(page.locator("#result-view")).toBeVisible();
  await expect(page.locator("#result-title")).toHaveText("Gut geübt!");
  await expect(page.locator("#result-stars .earned")).toHaveCount(0);
});

test("typing: physical keys, gentle retries, highlighted key after three misses, no double reward", async ({
  page,
}) => {
  await page.locator("#start-button").click();
  const q = await question(page);
  expect(q.mode).toBe("type");
  const others = q.keys.filter((x) => x !== q.answer);
  for (const letter of others.slice(0, 3))
    await page.keyboard.press(letter.toLowerCase());
  await expect(page.locator("#feedback")).toHaveClass(/try-again/);
  await expect(task(page, others[0])).toBeDisabled();
  await expect(task(page, q.answer)).toHaveClass(/hint/);
  await page.keyboard.press(q.answer.toLowerCase());
  await page.keyboard.press(q.answer.toLowerCase());
  await expect(page.locator("#feedback")).toHaveClass(/correct/);
  await expect(page.locator("#total-stars")).toHaveText("0");
  await nextTask(page, q);
  await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("1");
});

test("adults can override levels, show lowercase and reset everything", async ({
  page,
}) => {
  await page.locator("#parents-button").click();
  await (await levelSelect(page, "order")).selectOption("6");
  await adultTab(page, "speech");
  await page.locator("#lowercase").check();
  await page.locator("#speech-rate").selectOption("0.65");
  await page.locator("#auto-speak").uncheck();
  await page.locator("#close-settings").click();
  await openGame(page, "order");
  await expect(page.locator("#game-level")).toHaveText("Stufe 7");
  const q = await question(page);
  expect(q.reverse).toBe(true);
  await expect(task(page, q.answer[0])).toHaveText(q.answer[0].toLowerCase());
  await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("1");
  await page.reload();
  await page.locator("#parents-button").click();
  // The dialog always opens on the overview.
  await expect(page.locator("#panel-overview")).toBeVisible();
  await expect(page.locator("#panel-speech")).toBeHidden();
  await adultTab(page, "speech");
  await expect(page.locator("#lowercase")).toBeChecked();
  await expect(page.locator("#speech-rate")).toHaveValue("0.65");
  await expect(page.locator("#auto-speak")).not.toBeChecked();
  await expect(await levelSelect(page, "order")).toHaveValue("7");
  await adultTab(page, "data");
  await page.locator("#reset-progress").click();
  await page.locator("#cancel-reset").click();
  await expect(page.locator("#total-stars")).toHaveText("1");
  await page.locator("#reset-progress").click();
  await page.locator("#confirm-reset").click();
  await expect(page.locator("#total-stars")).toHaveText("0");
  await expect(page.locator("#settings-dialog")).not.toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("woerterwiese.v1")),
  );
  expect(stored.levels.order).toBe(0);
  expect(stored.settings.lowercase).toBe(true);
});

test("parents see a continuous report of progress, strengths and weaknesses", async ({
  page,
}) => {
  await openGame(page, "neighbor");
  await wrong(page);
  await expect(page.locator("#feedback")).toContainText("ist es nicht");
  let q = await solve(page);
  await nextTask(page, q);
  q = await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("1");
  await page.locator("#leave-game").click();
  await page.locator("#parents-button").click();
  await page.locator("#open-report").click();
  await expect(page.locator("#report-view")).toBeVisible();
  await expect(page.locator(".stat-value").first()).toHaveText("2");
  await expect(page.locator(".stat-value").nth(1)).toHaveText("50 %");
  await expect(page.locator(".chart-column")).toHaveCount(14);
  await expect(page.locator(".report-notice")).toBeVisible();
  const row = page.locator(".game-table tbody tr", { hasText: "ABC-Nachbarn" });
  await expect(row.locator("td").nth(4)).toHaveText("2");
  await expect(row.locator("td").nth(5)).toHaveText("heute");
  await page.locator(".chart-column").last().focus();
  await expect(page.locator(".chart-tooltip")).toContainText("2 Aufgaben");
  await page.locator(".chart-table summary").click();
  await expect(page.locator(".chart-table tbody tr")).toHaveCount(14);
  // Kids never land here by accident: no nav entry, and reset clears it.
  await expect(page.locator('.nav-button[data-view="report"]')).toHaveCount(0);
  await page.locator("#parents-button").click();
  await adultTab(page, "data");
  await page.locator("#reset-progress").click();
  await page.locator("#confirm-reset").click();
  await page.locator("#parents-button").click();
  await page.locator("#open-report").click();
  await expect(page.locator(".stat-value").first()).toHaveText("0");
});

test("without a voice, a collapsed reading aid for adults appears", async ({
  page,
}) => {
  await page.locator("#start-button").click();
  await expect(page.locator("#speech-notice")).toBeVisible();
  await expect(page.locator("#adult-cue")).toBeVisible();
  await expect(page.locator("#adult-cue")).not.toHaveAttribute("open");
  await page.evaluate(() => {
    speechSynthesis.voices = [
      { name: "Deutsch Test", lang: "de-DE", voiceURI: "test", localService: true },
    ];
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await expect(page.locator("#speech-notice")).toBeHidden();
  await expect(page.locator("#adult-cue")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
    .toBe(1);
  // The sound itself comes from a file and plays with or without a voice.
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.length))
    .toBeGreaterThanOrEqual(1);
});

test("blocked and malformed storage do not prevent playing", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem("woerterwiese.v1", "not json"),
  );
  await page.reload();
  await expect(page.locator("#total-stars")).toHaveText("0");
  await chooseGrade(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
  });
  await page.locator("#start-button").click();
  const q = await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("1");
  await expect(page.locator("#storage-warning")).toBeVisible();
  await nextTask(page, q);
  await solve(page);
  await expect(page.locator("#total-stars")).toHaveText("2");
});

test("version 1 progress is kept", async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "woerterwiese.v1",
      JSON.stringify({ version: 1, stars: 27, rounds: 5, settings: {} }),
    ),
  );
  await page.reload();
  await expect(page.locator("#total-stars")).toHaveText("27");
  await page.locator('.nav-button[data-view="garden"]').click();
  await expect(page.locator(".garden-decor")).toHaveCount(2);
  await expect(page.locator('.bed:not([data-state="locked"])')).toHaveCount(4);
});

test("multiple tabs keep all earned stars and a reset wins", async ({
  context,
  page,
}) => {
  const second = await context.newPage();
  await installSpeechMock(second);
  await second.goto(appUrl);
  await page.locator("#start-button").click();
  await second.locator("#start-button").click();
  await Promise.all([solve(page), solve(second)]);
  await expect(page.locator("#total-stars")).toHaveText("2");
  await expect(second.locator("#total-stars")).toHaveText("2");
  await page.locator("#leave-game").click();
  await page.locator("#parents-button").click();
  await adultTab(page, "data");
  await page.locator("#reset-progress").click();
  await page.locator("#confirm-reset").click();
  await second.locator("#leave-game").click();
  await second.locator("#parents-button").click();
  await adultTab(second, "speech");
  await second.locator("#lowercase").check();
  await expect(second.locator("#total-stars")).toHaveText("0");
  await page.reload();
  await expect(page.locator("#total-stars")).toHaveText("0");
});

test("five minutes of active play offer a break without losing stars", async ({
  page,
}) => {
  await page.clock.install();
  await page.reload();
  await page.locator("#start-button").click();
  await solve(page);
  await page.clock.runFor(301000);
  await expect(page.locator("#pause-banner")).toBeVisible();
  await page.locator("#take-break").click();
  await expect(page.locator("#home-view")).toBeVisible();
  await expect(page.locator("#total-stars")).toHaveText("1");
});

test("home, garden and every game fit the viewport without horizontal scrolling", async ({
  page,
}, testInfo) => {
  // Every game is opened through the menu and photographed: this takes a while.
  test.setTimeout(120000);
  const noOverflow = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  await noOverflow();
  await page.screenshot({
    path: `test-results/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.evaluate(() =>
    localStorage.setItem(
      "woerterwiese.v1",
      JSON.stringify({
        version: 2,
        levels: {
          type: 9,
          order: 8,
          neighbor: 7,
          missing: 7,
          initial: 6,
          memory: 6,
          echo: 6,
          movement: 5,
          bundle: 5,
          place: 8,
          build: 6,
          line: 6,
          chart: 5,
          steps: 6,
          compare: 5,
          sort: 6,
          adjacent: 6,
          calc: 6,
          graph: 6,
          count: 4,
          more: 6,
          venn: 5,
          cross: 7,
          times: 6,
          money: 6,
          clock: 6,
          syllables: 5,
          extend: 5,
          enwords: 6,
          enmissing: 5,
          enpattern: 6,
          encolors: 8,
          ennumbers: 3,
          ensimon: 6,
          ensay: 5,
        },
      }),
    ),
  );
  await page.reload();
  for (const activity of C.ACTIVITIES) {
    await openGame(page, activity.id);
    await noOverflow();
    await page.screenshot({
      path: `test-results/${activity.id}-${testInfo.project.name}.png`,
    });
    await page.locator("#leave-game").click();
  }
  for (const subject of C.SUBJECTS) {
    await page.locator(".brand").click();
    await page.locator(`[data-subject="${subject.id}"]`).click();
    await noOverflow();
  }
  await page.screenshot({
    path: `test-results/menu-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.locator('.nav-button[data-view="garden"]').click();
  await noOverflow();
  await page.screenshot({
    path: `test-results/garden-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("first start asks for the grade; it sets the entry point and the games shown", async ({
  page,
}) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#home-grid-title")).toHaveText("In welche Klasse gehst du?");
  await expect(page.locator("#home-momo-says")).toContainText("In welche Klasse");
  await expect(page.locator("#start-button")).toBeHidden();
  await expect(page.locator("#grade-note")).toBeVisible();
  await expect(page.locator("[data-subject]")).toHaveCount(0);
  // Only grades with games are offered to the child.
  await expect(page.locator("[data-grade]")).toHaveCount(C.availableGrades().length);
  await chooseGrade(page, 1);
  await expect(page.locator("#home-grid-title")).toContainText("1. Klasse");
  await expect(page.locator("#start-button")).toBeVisible();
  await expect(page.locator("#grade-note")).toBeHidden();
  await page.locator('[data-subject="mathe"]').click();
  await expect(page.locator("[data-category]")).toHaveCount(C.categoriesFor("mathe", 1).length);
  await expect(page.locator('[data-category="times"]')).toHaveCount(0);
  await page.locator('[data-category="tens"]').click();
  await expect(page.locator("#menu-grid .activity-card")).toHaveCount(2);
  await expect(page.locator('.activity-card[data-activity="place"]')).toHaveCount(0);
  await expect(page.locator('.activity-card[data-activity="bundle"]')).toContainText("Stufe 1");
  // Adults see the grade, can't pick one without games, and see every level
  // with its grade: the child may climb beyond its own grade.
  await page.locator("#parents-button").click();
  await expect(page.locator("#grade-select")).toHaveValue("1");
  await expect(page.locator("#grade-select option")).toHaveCount(C.GRADES.length);
  const bundle = await levelSelect(page, "bundle");
  await expect(bundle.locator("option")).toHaveCount(C.maxLevel("bundle") + 1);
  await expect(bundle.locator("option").last()).toContainText("(Kl. 2)");
  await expect(page.locator('[data-level-for="times"]')).toHaveCount(0);
  await adultTab(page, "overview");
  await page.locator("#grade-select").selectOption("2");
  await expect(page.locator("#grade-status")).toContainText("2. Klasse");
  await page.locator("#close-settings").click();
  // The open category now lists the games of grade 2, starting at its levels.
  await expect(page.locator("#menu-grid .activity-card")).toHaveCount(3);
  await expect(page.locator('.activity-card[data-activity="bundle"]')).toContainText(
    `Stufe ${C.gradeStart("bundle", 2) + 1}`,
  );
  await page.reload();
  await expect(page.locator("#home-grid-title")).toContainText("2. Klasse");
});

test("a first grader climbs past grade 1 and opens the games of grade 2", async ({
  page,
}) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await chooseGrade(page, 1);
  await openGame(page, "bundle");
  for (let i = 0; i < 3; i++) {
    const q = await solve(page);
    await expect(page.locator("#total-stars")).toHaveText(String(i + 1));
    if (i < 2) await nextTask(page, q);
  }
  await expect(page.locator("#result-view")).toBeVisible();
  // No cap: the game went on into the levels of grade 2.
  await expect(page.locator("#result-description")).toContainText("Stufe 4");
  await expect(page.locator("#unlocked-rewards")).toContainText("Zahlenhaus");
  await page.locator("#other-game").click();
  await expect(page.locator("#menu-title")).toHaveText("Zehner und Einer");
  await expect(page.locator('.activity-card[data-activity="place"]')).toBeVisible();
  // The child's grade stays the same.
  await page.locator(".brand").click();
  await expect(page.locator("#home-grid-title")).toContainText("1. Klasse");
});

test("menu: subject, then category, then game – and back the same way", async ({
  page,
}) => {
  await expect(page.locator("[data-subject]")).toHaveCount(C.SUBJECTS.length);
  await page.locator('[data-subject="mathe"]').click();
  await expect(page.locator("#menu-title")).toHaveText("Mathe");
  await expect(page.locator("#menu-title")).toBeFocused();
  await page.locator('[data-category="tens"]').click();
  await expect(page.locator("#menu-title")).toHaveText("Zehner und Einer");
  await expect(page.locator("#menu-grid .activity-card")).toHaveCount(3);
  await page.locator('.activity-card[data-activity="place"]').click();
  await expect(page.locator("#game-title")).toHaveText("Zahlenhaus");
  // Leaving a game goes back to its category, not to the start.
  await page.locator("#leave-game").click();
  await expect(page.locator("#menu-title")).toHaveText("Zehner und Einer");
  await page.locator("#menu-back").click();
  await expect(page.locator("#menu-title")).toHaveText("Mathe");
  await page.locator("#menu-back").click();
  await expect(page.locator("#home-view")).toBeVisible();
  await page.locator('[data-subject="deutsch"]').click();
  await expect(page.locator("[data-category]")).toHaveCount(
    C.CATEGORIES.filter((x) => x.subject === "deutsch").length,
  );
  await page.locator('[data-category="hearing"]').click();
  await expect(page.locator("#menu-grid .activity-card")).toHaveCount(3);
});

test("math: a wrong number is named, help comes in steps, swapped digits are counted", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "woerterwiese.v1",
      JSON.stringify({ version: 2, levels: { place: 4 } }),
    ),
  );
  await page.reload();
  await openGame(page, "place");
  const q = await question(page);
  expect(q.kind).toBe("swapped");
  await task(page, q.swap).click();
  await expect(page.locator("#feedback")).toContainText(`${q.swap} passt nicht`);
  await expect(page.locator("#feedback")).toContainText("Einer zuerst");
  await expect(page.locator("#math-help")).toBeHidden();
  await wrong(page);
  await expect(page.locator("#math-help .blocks")).toBeVisible();
  await expect(page.locator("#math-help .rod")).toHaveCount(q.tens);
  await solve(page);
  await expect(page.locator("#feedback")).toContainText(
    `${q.number} = ${q.tens} Zehner und ${q.ones} Einer`,
  );
  await expect(page.locator("#total-stars")).toHaveText("0");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("woerterwiese.v1")).stats.math.swaps,
      ),
    )
    .toBe(1);
});

test("math: lay a number with rods and cubes, with stepped help", async ({
  page,
}) => {
  await openGame(page, "build");
  const q = await question(page);
  await expect(page.locator(".number-target")).toHaveText(q.answer);
  await expect(page.locator('[data-build="tens"][data-step="-1"]')).toBeDisabled();
  await lay(page, 1, 0);
  await expect(page.locator("#built-tens .rod")).toHaveCount(1);
  await page.locator("#build-done").click();
  await expect(page.locator("#feedback")).toContainText("Stimmen die Zehner");
  await expect(page.locator(".place-count").first()).toBeHidden();
  await page.locator("#build-done").click();
  // Second miss: the counts appear and Momo says which place is off.
  await expect(page.locator("#count-tens")).toBeVisible();
  await expect(page.locator("#feedback")).toContainText(
    q.target.tens > 1 ? "Bei den Zehnern sind es noch zu wenige" : "Bei den Einern",
  );
  await lay(page, q.target.tens - 1, q.target.ones);
  await page.locator("#build-done").click();
  await expect(page.locator("#feedback")).toHaveClass(/correct/);
  await expect(page.locator("#feedback")).toContainText(`${q.number} =`);
  await expect(page.locator("#total-stars")).toHaveText("0");
});

// Second mistake: each new math game shows its own visible help.
const MATH_HELP = {
  line: [0, ".number-line.helping"],
  chart: [0, "#math-help .hundred-chart"],
  steps: [0, ".step-arrow"],
  compare: [4, ".compare-help"],
  sort: [0, ".order-cards.marked"],
  adjacent: [0, "#math-help .number-line"],
  calc: [0, "#math-help .blocks"],
  graph: [0, ".box-n:not([hidden])"],
  count: [1, ".frames.helping"],
  more: [5, ".set-item.extra"],
  venn: [2, ".zone-a .zone-caption"],
  cross: [0, "#math-help .number-line"],
  times: [2, "#math-help .dot-field"],
  money: [0, ".money-help"],
  clock: [0, ".clock-legend"],
};
for (const [mode, [level, help]] of Object.entries(MATH_HELP))
  test(`math help in steps and the answer shown in its gap: ${mode}`, async ({ page }) => {
    await page.evaluate(
      ({ mode, level }) =>
        localStorage.setItem(
          "woerterwiese.v1",
          JSON.stringify({ version: 2, levels: { [mode]: level } }),
        ),
      { mode, level },
    );
    await page.reload();
    await openGame(page, mode);
    await wrong(page);
    await expect(page.locator("#feedback")).toContainText(
      { sort: "noch nicht dran", venn: "passt es nicht hin" }[mode] || "passt nicht",
    );
    await expect(page.locator(help).first()).toBeHidden();
    await wrong(page);
    await expect(page.locator(help).first()).toBeVisible();
    const q = await solve(page);
    await expect(page.locator("#feedback")).toHaveClass(/correct/);
    await expect(page.locator("#feedback")).toContainText(q.explain.text);
    if (await page.locator("#task-area [data-reveal]").count())
      await expect(page.locator("#task-area [data-reveal]")).toHaveText(q.answer);
    await expect(page.locator("#total-stars")).toHaveText("0");
  });
