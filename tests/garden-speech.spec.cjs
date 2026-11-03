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
        {
          name: "Test English",
          lang: "en-GB",
          voiceURI: "test-en",
          localService: true,
        },
      ];
      synth.cancel = () => {};
      // Which texts went to the English voice (with their language).
      synth.english = [];
      synth.speak = (utterance) => {
        synth.current = utterance;
        synth.spoken.push(utterance.text);
        if (utterance.lang?.startsWith("en")) synth.english.push(utterance.text);
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
  const carrot = C.CROPS[0];
  await page.clock.install();
  await load(page, {
    stars: carrot.cost + 1,
    totalStars: carrot.cost + 1,
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
  await expect(page.locator("#total-stars")).toHaveText("1");
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await expect(page.locator("#pet-bubble")).toContainText("Durst");
  // Nothing grows before watering.
  await page.clock.fastForward(2 * carrot.grow);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await bed(page, 0).click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "growing");
  await bed(page, 0).click();
  await expect(page.locator("#garden-status-text")).toContainText("wächst noch");
  await page.clock.fastForward(carrot.grow / 2 + 1000);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "dry");
  await bed(page, 0).click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "growing");
  await page.clock.fastForward(carrot.grow / 2 + 1000);
  await expect(bed(page, 0)).toHaveAttribute("data-state", "ripe");
  await bed(page, 0).click();
  await expect(bed(page, 0)).toHaveAttribute("data-state", "empty");
  await expect(page.locator('[data-food="carrot"]')).toContainText("2");
  await page.locator('[data-food="carrot"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("Mampf");
  await expect(page.locator('[data-food="carrot"]')).toContainText("1");
  const state = await stored(page);
  // One carrot, minus a little hunger while the carrot grew.
  expect(state.pet.full).toBeGreaterThan(20 + carrot.full - 1);
  expect(state.pet.full).toBeLessThanOrEqual(20 + carrot.full);
  expect(state.stars).toBe(1);
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
  await expect(page.locator("#garden-status-text")).toContainText(`${C.CROPS[0].cost} ⭐`);
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
    // Games that start in grade 3 show from grade 3 on.
    const grade = Math.min(...Object.keys(activity.grades).map(Number));
    await load(page, grade > 2 ? { settings: { autoSpeak: true, grade } } : {});
    await openGame(page, activity.id);
    const first = await page.evaluate(() => window.WieseDebug.question);
    // "type" plays its content as a sound file instead of the voice; math
    // games read their content (numbers as words) only where it is no answer;
    // English games hand their words to the English voice.
    const content = [first.speech]
      .flat()
      .filter((part) => typeof part === "string" || part?.en)
      .map((part) => part.en ?? part);
    const withContent = content.length > 0;
    await expect
      .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
      .toBe(1 + content.length);
    const texts = await page.evaluate(() => speechSynthesis.spoken);
    const q = await page.evaluate(() => window.WieseDebug.question);
    if (activity.id !== "neighbor")
      expect(texts[0]).toBe(
        await page.locator("#game-instruction").textContent(),
      );
    else expect(texts[0]).toMatch(/^Welcher Buchstabe (kommt|steht)/);
    if (withContent) expect(texts.slice(1)).toEqual(content);
    if (C.ENGLISH_GAMES.includes(activity.id))
      expect(await page.evaluate(() => speechSynthesis.english)).toEqual(
        [first.speech].flat().filter((part) => part?.en).map((part) => part.en),
      );
    if (["type", "blend"].includes(activity.id))
      await expect
        .poll(() => page.evaluate(() => window.WieseDebug.played.at(-1)))
        .toBe(activity.id === "type" ? q.answer : q.sounds.at(-1));
    await page.locator("#listen-button").click();
    await expect
      .poll(() => page.evaluate(() => speechSynthesis.spoken.length))
      .toBe(texts.length + 1 + content.length);
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
  await page.locator("#tab-speech").click();
  await expect(page.locator("#speech-on")).toBeChecked();
  await page.locator("#speech-on").uncheck();
  await expect(page.locator("#voice-select")).toBeDisabled();
  await expect(page.locator("#voice-en-select")).toBeDisabled();
  // The sound test stays silent too.
  await page.locator(".settings-more summary").click();
  await page.locator('[data-laut="M"]').click();
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
  await page.locator("#tab-speech").click();
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

test("English: the word goes to the English voice, help names wrong picks in English", async ({
  page,
}) => {
  await load(page, { levels: { enwords: 0 } });
  await openGame(page, "enwords");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.english))
    .toEqual([q.answer]);
  const wrong = q.choices.filter((x) => x !== q.answer);
  await page.locator(`#task-area [data-answer="${wrong[0]}"]`).click();
  await expect(page.locator("#feedback")).toContainText(`„${wrong[0]}“`);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.english))
    .toContain(wrong[0]);
  await expect(page.locator(".choice-caption").first()).toBeHidden();
  // Second mistake: the written words appear and every card is named.
  await page.locator(`#task-area [data-answer="${wrong[1]}"]`).click();
  await expect(page.locator(".english-choices")).toHaveClass(/labeled/);
  await page.locator(`#task-area [data-answer="${q.answer}"]`).click();
  await expect(page.locator("#feedback")).toContainText(`${q.answer} = ${q.de}`);
  await expect(page.locator("#total-stars")).toHaveText("0");
});

test("English: 'Was fehlt?' lights up every said word as help", async ({ page }) => {
  await load(page, { levels: { enmissing: 0 } });
  await openGame(page, "enmissing");
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.english))
    .toEqual(q.said);
  await page.locator(`#task-area [data-answer="${q.said[0]}"]`).click();
  await expect(page.locator("#feedback")).toContainText("hat Momo gesagt");
  await page.locator(`#task-area [data-answer="${q.said[1]}"]`).click();
  await expect(page.locator("#feedback")).toContainText("leuchtet");
});

test("English without an English voice: a reading aid for adults instead", async ({ page }) => {
  await load(page);
  await page.evaluate(() => {
    speechSynthesis.getVoices = () => [
      { name: "Test Deutsch", lang: "de-DE", voiceURI: "test", localService: true },
    ];
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await openGame(page, "ennumbers");
  await expect(page.locator("#speech-notice")).toContainText("englische Stimme");
  await expect(page.locator("#adult-cue")).toBeVisible();
  const q = await page.evaluate(() => window.WieseDebug.question);
  await expect(page.locator("#cue-text")).toContainText(C.EN_NUMBERS[Number(q.answer)]);
  // The German instruction is still read, the English word never by the German voice.
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => speechSynthesis.english)).toEqual([]);
});

test("drag food to Momo: he eats it; dropped elsewhere nothing happens", async ({ page }) => {
  await load(page, { food: { strawberry: 2 }, totalStars: 30, pet: { full: 30, joy: 30, updatedAt: 0 } });
  await garden(page);
  const drag = async (to) => {
    const food = await page.locator('[data-food="strawberry"]').boundingBox();
    await page.mouse.move(food.x + food.width / 2, food.y + food.height / 2);
    await page.mouse.down();
    await page.mouse.move(food.x + 30, food.y - 30, { steps: 4 });
    await page.mouse.move(to.x, to.y, { steps: 8 });
    await page.mouse.up();
  };
  await drag({ x: 5, y: 5 });
  await expect(page.locator("#garden-status-text")).toContainText("Zieh das Futter");
  expect((await stored(page)).food.strawberry).toBe(2);
  const momo = await page.locator("#garden-momo").boundingBox();
  await drag({ x: momo.x + momo.width / 2, y: momo.y + momo.height / 2 });
  await expect(page.locator("#garden-status-text")).toContainText("Mampf");
  await expect(page.locator('[data-food="strawberry"]')).toContainText("1");
  expect((await stored(page)).food.strawberry).toBe(1);
});

test("Momo's wish: the wished food makes him extra happy", async ({ page }) => {
  await page.clock.install({ time: 5 * C.WISH_WINDOW + 1000 });
  await load(page, { food: { carrot: 1 }, totalStars: 0, pet: { full: 40, joy: 40, updatedAt: 0 } });
  await garden(page);
  // With only carrots unlocked, Momo wishes for a carrot.
  await expect(page.locator("#momo-wish")).toBeVisible();
  await expect(page.locator("#momo-wish")).toHaveText("🥕");
  await page.locator('[data-food="carrot"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("gewünscht");
  await expect(page.locator("#momo-wish")).toBeHidden();
  const state = await stored(page);
  expect(Math.round(state.pet.joy)).toBe(40 + C.CROPS[0].joy + 15);
});

test("treasure chest: buying needs two taps; Momo wears it; the ball cheers him up", async ({
  page,
}) => {
  await load(page, { stars: 40, totalStars: 40, pet: { full: 50, joy: 40, updatedAt: 0 } });
  await garden(page);
  await page.locator('[data-item="cap"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("noch einmal");
  await expect(page.locator("#total-stars")).toHaveText("40");
  await page.locator('[data-item="cap"]').click();
  await expect(page.locator("#total-stars")).toHaveText("10");
  await expect(page.locator('[data-item="cap"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#garden-momo-art .wear-head")).toHaveText("🧢");
  // Momo wears it on the home screen too.
  await page.locator(".brand").click();
  await expect(page.locator("#home-momo .wear-head")).toHaveText("🧢");
  await garden(page);
  await page.locator('[data-item="cap"]').click();
  await expect(page.locator("#garden-momo-art .wear-head")).toHaveCount(0);
  // Too expensive: nothing is bought.
  await page.locator('[data-item="crown"]').click();
  await expect(page.locator("#garden-status-text")).toContainText("brauchst du");
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("woerterwiese.v1"));
    raw.wardrobe.owned.push("ball");
    localStorage.setItem("woerterwiese.v1", JSON.stringify(raw));
  });
  await page.reload();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await garden(page);
  await page.locator("#garden-ball").click();
  await expect(page.locator("#garden-status-text")).toContainText("Ball");
  await expect.poll(async () => Math.round((await stored(page)).pet.joy)).toBe(46);
});

test("adult area: tabs switch with click and arrow keys", async ({ page }) => {
  await load(page);
  await page.locator("#parents-button").click();
  await expect(page.locator("#panel-overview")).toBeVisible();
  await page.locator("#tab-overview").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-levels")).toBeFocused();
  await expect(page.locator("#panel-levels")).toBeVisible();
  await expect(page.locator("#panel-overview")).toBeHidden();
  await expect(page.locator(".level-subject")).toHaveCount(C.SUBJECTS.length);
  // Subjects start collapsed, so the list stays short.
  await expect(page.locator('[data-level-for="type"]')).toBeHidden();
  await page.keyboard.press("End");
  await expect(page.locator("#panel-data")).toBeVisible();
  await page.locator("#tab-speech").click();
  await expect(page.locator("#voice-en-select option")).toHaveCount(2);
  await page.locator("#test-voice-en").click();
  await expect
    .poll(() => page.evaluate(() => speechSynthesis.english.length))
    .toBe(1);
});
