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

async function load(page, saved = {}, autoSpeak = true) {
  await page.addInitScript(
    ({ saved, autoSpeak }) => {
      if (!localStorage.getItem("woerterwiese.v1"))
        localStorage.setItem(
          "woerterwiese.v1",
          JSON.stringify({ version: 2, settings: { autoSpeak }, ...saved }),
        );
      const synth = new EventTarget();
      synth.spoken = [];
      synth.hold = false;
      // Milliseconds an utterance takes; tests can make some texts slow.
      synth.durationFor = () => 10;
      synth.getVoices = () => [
        {
          name: "Test Deutsch",
          lang: "de-DE",
          voiceURI: "test",
          localService: true,
        },
      ];
      synth.cancel = () => {};
      synth.speak = (utterance) => {
        synth.current = utterance;
        synth.spoken.push(utterance.text);
        utterance.onstart?.();
        if (!synth.hold)
          setTimeout(() => utterance.onend?.(), synth.durationFor(utterance.text));
      };
      Object.defineProperty(window, "speechSynthesis", {
        value: synth,
        configurable: true,
      });
      window.SpeechSynthesisUtterance = class {
        constructor(text) {
          this.text = text;
        }
      };
    },
    { saved, autoSpeak },
  );
  await page.goto(appUrl);
}
const garden = (page) =>
  page.locator('.nav-button[data-view="garden"]').click();
const bed = (page, index) => page.locator(`[data-bed="${index}"]`);
const stored = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("woerterwiese.v1")));

test("plant with stars, water twice, harvest and feed Momo", async ({
  page,
}) => {
  await page.clock.install();
  await load(page, {
    stars: 3,
    totalStars: 3,
    pet: { full: 20, joy: 50, updatedAt: 0 },
  });
  await expect(page.locator("#garden-alert")).toBeVisible();
  await garden(page);
  await expect(page.locator("#pet-bubble")).toContainText("Hunger");
  await expect(page.locator(".food-empty")).toBeVisible();
  await bed(page, 0).click();
  await expect(page.locator("#seed-picker")).toBeVisible();
  await expect(page.locator("[data-seed]")).toHaveCount(1);
  await page.locator('[data-seed="carrot"]').click();
  await expect(page.locator("#seed-picker")).toBeHidden();
  await expect(page.locator("#total-stars")).toHaveText("2");
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await expect(page.locator("#pet-bubble")).toContainText("Durst");
  // Nothing grows before watering.
  await page.clock.runFor(120000);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await bed(page, 0).click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "growing");
  await bed(page, 0).click();
  await expect(page.locator("#garden-status-text")).toContainText("wächst noch");
  await page.clock.runFor(31000);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await bed(page, 0).click();
  await page.clock.runFor(31000);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "ripe");
  await bed(page, 0).click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "empty");
  await expect(page.locator('[data-food="carrot"]')).toContainText("2");
  await page.locator('[data-food="carrot"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("Mampf");
  await expect(page.locator('[data-food="carrot"]')).toContainText("1");
  const state = await stored(page);
  expect(Math.round(state.pet.full)).toBe(40);
  expect(state.stars).toBe(2);
  expect(state.food.carrot).toBe(1);
});

test("seeds cost stars; locked beds and seeds unlock with progress", async ({
  page,
}) => {
  await load(page, { stars: 0, totalStars: 0 });
  await garden(page);
  await expect(page.locator('.bed:not([data-state="locked"])')).toHaveCount(3);
  await expect(bed(page, 3)).toBeDisabled();
  await expect(bed(page, 3)).toContainText("ab 10");
  await expect(bed(page, 4)).toBeHidden();
  await bed(page, 1).click();
  await expect(page.locator("#garden-status-text")).toContainText(
    "noch keine Sterne",
  );
  await expect(page.locator('[data-seed="carrot"]')).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.locator('[data-seed="carrot"]').click({ force: true });
  await expect(page.locator("#garden-status-text")).toContainText("1 ⭐");
  await expect(bed(page, 1)).toHaveAttribute("data-state", "empty");
  await page.locator("#close-seeds").click();
  await expect(page.locator("#seed-picker")).toBeHidden();
  await expect(page.locator("#next-unlock")).toContainText("Salat");

  await page.evaluate(() =>
    localStorage.setItem(
      "woerterwiese.v1",
      JSON.stringify({ version: 2, stars: 20, totalStars: 200 }),
    ),
  );
  await page.reload();
  await garden(page);
  await expect(page.locator('.bed:not([data-state="locked"])')).toHaveCount(
    C.BEDS.length,
  );
  await expect(page.locator(".garden-decor")).toHaveCount(C.DECOR.length);
  await bed(page, 5).click();
  await expect(page.locator("[data-seed]")).toHaveCount(C.CROPS.length);
  await expect(page.locator("#next-unlock")).toContainText("alles");
});

test("cuddling Momo cheers him up a little; a full Momo refuses food", async ({
  page,
}) => {
  await load(page, {
    pet: { full: 98, joy: 10, updatedAt: 0 },
    food: { strawberry: 2 },
  });
  await garden(page);
  await expect(page.locator("#pet-bubble")).toContainText("langweilig");
  await page.locator("#garden-momo").click();
  await expect(page.locator("#garden-status-text")).toContainText("kuschelt");
  await page.locator('[data-food="strawberry"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("pappsatt");
  const state = await stored(page);
  expect(state.food.strawberry).toBe(2);
  expect(Math.round(state.pet.joy)).toBe(14);
});

test("a finished round makes Momo happier", async ({ page }) => {
  await load(page, { pet: { full: 50, joy: 40, updatedAt: 0 } });
  await openGame(page, "memory");
  for (let i = 0; i < 3; i++) {
    const q = await page.evaluate(() => window.WieseDebug.question);
    await page.locator("#echo-done").click();
    if (i < 2)
      await expect
        .poll(() => page.evaluate(() => window.WieseDebug.question?.answer))
        .not.toBe(q.answer);
  }
  await expect(page.locator("#result-view")).toBeVisible();
  const state = await stored(page);
  expect(Math.round(state.pet.joy)).toBe(50);
});

for (const activity of C.ACTIVITIES) {
  test(`instruction is read before content: ${activity.id}`, async ({
    page,
  }) => {
    await load(page);
    await openGame(page, activity.id);
    const first = await page.evaluate(() => window.WieseDebug.question);
    // "type" plays its content as a sound file instead of the voice; math
    // games read their content (numbers as words) only where it is no answer.
    const withContent =
      ["initial", "merk", "memory", "echo", "movement"].includes(activity.id) ||
      (C.MATH_GAMES.includes(activity.id) && Boolean(first.speech));
    await expect
      .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
      .toBe(withContent ? 2 : 1);
    const texts = await page.evaluate(() => speechSynthesis.spoken);
    const q = await page.evaluate(() => window.WieseDebug.question);
    if (activity.id !== "neighbor")
      expect(texts[0]).toBe(
        await page.locator("#game-instruction").textContent(),
      );
    else expect(texts[0]).toMatch(/^Welcher Buchstabe (kommt|steht)/);
    if (withContent) expect(texts[1]).toBe(q.speech);
    if (["type", "blend"].includes(activity.id))
      await expect
        .poll(() => page.evaluate(() => window.WieseDebug.played.at(-1)))
        .toBe(activity.id === "type" ? q.answer : q.sounds.at(-1));
    await page.locator("#listen-button").click();
    await expect
      .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
      .toBe(texts.length + (withContent ? 2 : 1));
  });
}

test("letters are played as German sounds, never spoken as letter names", async ({
  page,
}) => {
  await load(page);
  await openGame(page, "type");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played))
    .toEqual([q.answer]);
  // The sound file played to its end: no spoken fallback was needed.
  await page.waitForTimeout(1200);
  const spoken = await page.evaluate(() => speechSynthesis.spoken);
  expect(spoken.join(" ")).not.toContain("Der Laut ganz am Anfang");
  await page.locator("#content-listen").click();
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.length))
    .toBe(2);
  // Wrong key: the hint is spoken, then the sound is played again.
  const wrongKey = q.keys.find((x) => x !== q.answer && !q.accept.includes(x));
  await page.locator(`#task-area [data-answer="${wrongKey}"]`).click();
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.length))
    .toBe(3);
  for (const text of await page.evaluate(() => speechSynthesis.spoken))
    for (const name of ["Emm", "Enn", "Ess", "Eff", "Ell", "Err", "Kah", "Hah", "Jott"])
      expect(text).not.toContain(name);
});

test("a missing sound file falls back to an example word, not a letter name", async ({
  page,
}) => {
  await page.route("**/audio/laute/*.wav", (route) => route.abort());
  await load(page);
  await openGame(page, "type");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-1)))
    .toBe(`Der Laut ganz am Anfang von ${C.LAUTE[q.answer].example}.`);
});

test("praise is spoken to the end before the next task appears", async ({
  page,
}) => {
  await load(page);
  await page.evaluate(() => {
    speechSynthesis.durationFor = (text) =>
      text.includes("kniffliger") ? 3500 : 10;
  });
  await openGame(page, "missing");
  const q = await page.evaluate(() => window.WieseDebug.question);
  for (const letter of q.answers)
    await page.locator(`#task-area [data-answer="${letter}"]`).click();
  await expect(page.locator("#feedback")).toContainText("kniffliger");
  await page.waitForTimeout(2800);
  expect(
    await page.evaluate(() => window.WieseDebug.question.answer),
  ).toBe(q.answer);
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.question.answer), {
      timeout: 4000,
    })
    .not.toBe(q.answer);
});

test("blending plays one sound per dot and melts them after mistakes", async ({
  page,
}) => {
  await load(page);
  await openGame(page, "blend");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect(page.locator(".sound-dot")).toHaveCount(q.sounds.length);
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played))
    .toEqual(q.sounds);
  const wrongWords = q.choices.filter((x) => x.word !== q.answer);
  await page.locator(`#task-area [data-answer="${wrongWords[0].word}"]`).click();
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.length))
    .toBe(q.sounds.length * 2);
  await page.locator(`#task-area [data-answer="${wrongWords[1].word}"]`).click();
  await expect(page.locator("#feedback")).toContainText("schneller");
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.length))
    .toBe(q.sounds.length * 3);
  await page.locator(`#task-area [data-answer="${q.answer}"]`).click();
  await expect(page.locator("#blend-stage")).toContainText(q.answer);
  await expect(page.locator("#total-stars")).toHaveText("0");
});

test("anlaut help plays the sounds of the remaining cards", async ({ page }) => {
  await load(page, { levels: { initial: 2 } });
  await openGame(page, "initial");
  const q = await page.evaluate(() => window.WieseDebug.question);
  const wrong = q.choices.filter((x) => x !== q.answer);
  await page.locator(`#task-area [data-answer="${wrong[0]}"]`).click();
  await page.locator(`#task-area [data-answer="${wrong[1]}"]`).click();
  await expect(page.locator("#feedback")).toContainText("Laute der Karten");
  const remaining = q.choices.filter((x) => !wrong.slice(0, 2).includes(x));
  await expect
    .poll(() =>
      page.evaluate((n) => window.WieseDebug.played.slice(-n), remaining.length),
    )
    .toEqual(remaining);
});

test("reverse anlaut: hear the sound, pick the picture; names appear as help", async ({
  page,
}) => {
  await load(page, { levels: { initial: 3 } });
  await openGame(page, "initial");
  const q = await page.evaluate(() => window.WieseDebug.question);
  expect(q.reverse).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played))
    .toEqual([q.answer]);
  await expect(page.locator(".picture-button")).toHaveCount(3);
  await expect(page.locator(".choice-caption").first()).toBeHidden();
  const wrong = q.pictures.filter((x) => x.initial !== q.answer);
  await page.locator(`#task-area [data-answer="${wrong[0].initial}"]`).click();
  await page.locator(`#task-area [data-answer="${wrong[1].initial}"]`).click();
  await expect(page.locator(".choice-caption").first()).toBeVisible();
  await page.locator(`#task-area [data-answer="${q.answer}"]`).click();
  await expect(page.locator("#feedback")).toContainText(`${q.word} fängt mit`);
});

test("'Wer fehlt?' plays the sound of a chosen letter and names a wrong pick", async ({
  page,
}) => {
  await load(page, { levels: { missing: 3 } });
  await openGame(page, "missing");
  const q = await page.evaluate(() => window.WieseDebug.question);
  expect(q.answers.length).toBe(2);
  const wrong = q.choices.find((x) => !q.answers.includes(x));
  await page.locator(`#task-area [data-answer="${wrong}"]`).click();
  await expect(page.locator("#feedback")).toContainText(`${wrong} passt nicht`);
  await expect(page.locator("#feedback")).toContainText(
    "Ein anderer Buchstabe gehört in eine der Lücken",
  );
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-1)))
    .toContain("passt nicht");
  if (!C.AMBIGUOUS_LAUTE.includes(wrong))
    expect(await page.evaluate(() => window.WieseDebug.played)).toContain(wrong);
  const spoken = (await page.evaluate(() => speechSynthesis.spoken)).join(" ");
  expect(spoken).not.toContain(` ${wrong} `);
  for (const letter of q.answers) {
    await page.locator(`#task-area [data-answer="${letter}"]`).click();
    if (!C.AMBIGUOUS_LAUTE.includes(letter))
      await expect
        .poll(() => page.evaluate(() => window.WieseDebug.played))
        .toContain(letter);
  }
  await expect(page.locator("#feedback")).toHaveClass(/correct/);
});

test("Merkwörter: the gap is filled, the rule shown as tip and said after solving", async ({
  page,
}) => {
  await load(page, { levels: { merk: 1 } });
  await openGame(page, "merk");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect(page.locator(".merk-word")).toHaveText(`${q.before}?${q.after}`);
  await expect(page.locator("#merk-tip")).toBeHidden();
  const wrong = q.choices.filter((x) => x !== q.answer);
  await page.locator(`#task-area [data-answer="${wrong[0]}"]`).click();
  await expect(page.locator("#feedback")).toContainText("Merkwort");
  await page.locator(`#task-area [data-answer="${wrong[1]}"]`).click();
  await expect(page.locator("#merk-tip")).toBeVisible();
  await expect(page.locator("#merk-tip")).toContainText("Vogel, Vater");
  await page.locator(`#task-area [data-answer="${q.answer}"]`).click();
  await expect(page.locator(".merk-word")).toHaveText(q.word);
  await expect(page.locator("#feedback")).toContainText(`${q.word}:`);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-1)))
    .toContain("schreibt aber Fau");
  await expect(page.locator("#total-stars")).toHaveText("0");
});

test("mistakes are spoken as hints; content can be replayed alone", async ({
  page,
}) => {
  await load(page);
  await openGame(page, "initial");
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
    .toBe(2);
  const q = await page.evaluate(() => window.WieseDebug.question);
  await page.locator("#content-listen").click();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-1)))
    .toBe(q.word);
  const wrongLetter = q.choices.find((x) => x !== q.answer);
  await page.locator(`#task-area [data-answer="${wrongLetter}"]`).click();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-2)))
    .toContain("Anfang");
});

test("automatic narration can be disabled", async ({ page }) => {
  await load(page, {}, false);
  await openGame(page, "memory");
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => speechSynthesis.spoken)).toEqual([]);
  await page.locator("#listen-button").click();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
    .toBe(2);
});

test("leaving a game cancels queued speech even if old callbacks arrive", async ({
  page,
}) => {
  await load(page);
  await page.evaluate(() => {
    speechSynthesis.hold = true;
  });
  await openGame(page, "memory");
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
    .toBe(1);
  await page.locator("#leave-game").click();
  await page.evaluate(() => speechSynthesis.current.onend());
  await page.waitForTimeout(850);
  expect(await page.evaluate(() => speechSynthesis.spoken.length)).toBe(1);
});

test("reduced motion keeps Momo still but the garden playable at 320px", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await load(page, { stars: 5, totalStars: 5 });
  await garden(page);
  const before = await page.locator("#garden-momo").getAttribute("style");
  await page.waitForTimeout(600);
  expect(await page.locator("#garden-momo").getAttribute("style")).toBe(before);
  await bed(page, 0).click();
  await page.locator('[data-seed="carrot"]').click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("syllables are clapped and words lengthened as help", async ({ page }) => {
  await load(page, { levels: { syllables: 0 } });
  await openGame(page, "syllables");
  const q = await page.evaluate(() => window.WieseDebug.question);
  const wrongCount = q.choices.filter((x) => x !== q.answer);
  await page.locator(`#task-area [data-answer="${wrongCount[0]}"]`).click();
  await page.locator(`#task-area [data-answer="${wrongCount[1]}"]`).click();
  // Second mistake: Momo claps the word, one syllable after the other.
  await expect
    .poll(async () => {
      const spoken = await page.evaluate(() => speechSynthesis.spoken);
      return spoken.join("|").includes(q.syllables.join("|"));
    })
    .toBe(true);
  await openGame(page, "extend");
  const e = await page.evaluate(() => window.WieseDebug.question);
  const other = e.choices.find((x) => x !== e.answer);
  await page.locator(`#task-area [data-answer="${other}"]`).click();
  await expect(page.locator("#extend-help")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken))
    .toContain(`${e.long}.`);
  // Letters never go to the voice, not even the wrong pick.
  for (const text of await page.evaluate(() => speechSynthesis.spoken))
    expect(text).not.toMatch(/(^|\s)[a-zA-Z](\s|[.,!?]|$)/);
  await page.locator(`#task-area [data-answer="${e.answer}"]`).click();
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.played.at(-1)))
    .toBe(e.answer.toUpperCase());
});

test("numbers are spoken as words, and the number to find never", async ({
  page,
}) => {
  await load(page);
  await openGame(page, "place");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken))
    .toEqual(["Wie viele Zehner hat die Zahl?", C.numberWord(q.number)]);
  await openGame(page, "bundle");
  const blocks = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.at(-1)))
    .toBe("Welche Zahl ist das? Zähle die Zehner und die Einer.");
  await page.locator(`#task-area [data-answer="${blocks.answer}"]`).click();
  await expect(page.locator("#feedback")).toContainText(
    new RegExp(`^${blocks.explain.text.replace(/[.+]/g, "\\$&")} .*kniffliger`),
  );
  // Same order as the text: first the tens and ones, then the praise.
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.slice(-2)))
    .toEqual([
      blocks.explain.speech,
      expect.stringContaining("Jetzt wird es ein bisschen kniffliger"),
    ]);
  for (const text of await page.evaluate(() => speechSynthesis.spoken))
    expect(text).not.toMatch(/\d/);
});

test("adults can switch all speech off and on again", async ({ page }) => {
  await load(page);
  await page.locator("#parents-button").click();
  await expect(page.locator("#speech-on")).toBeChecked();
  await page.locator("#speech-on").uncheck();
  await expect(page.locator("#voice-select")).toBeDisabled();
  // The sound test stays silent too.
  await page.locator('[data-laut="M"]').click({ force: true });
  await page.locator("#close-settings").click();
  await openGame(page, "type");
  // Neither the voice nor the recorded sounds play; the reading aid shows.
  await expect(page.locator("#adult-cue")).toBeVisible();
  await expect(page.locator("#speech-notice")).toContainText("ausgeschaltet");
  await expect(page.locator("#listen-button")).toBeHidden();
  await expect(page.locator("#content-listen")).toBeHidden();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => speechSynthesis.spoken)).toEqual([]);
  expect(await page.evaluate(() => window.WieseDebug.played)).toEqual([]);
  // A right answer still moves on to the next task.
  const q = await page.evaluate(() => window.WieseDebug.question);
  await page.locator(`#task-area [data-answer="${q.answer}"]`).click();
  await expect(page.locator("#total-stars")).toHaveText("1");
  await expect
    .poll(() => page.evaluate(() => window.WieseDebug.question.answer !== undefined && JSON.stringify(window.WieseDebug.question)))
    .not.toBe(JSON.stringify(q));
  expect((await stored(page)).settings.speech).toBe(false);
  // Switched on again (also after a reload), Momo reads the next task.
  await page.reload();
  await page.locator("#parents-button").click();
  await expect(page.locator("#speech-on")).not.toBeChecked();
  await page.locator("#speech-on").check();
  await page.locator("#close-settings").click();
  await openGame(page, "initial");
  await expect(page.locator("#adult-cue")).toBeHidden();
  await expect(page.locator("#listen-button")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
    .toBeGreaterThan(0);
});
