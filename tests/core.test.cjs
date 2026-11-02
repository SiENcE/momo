const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../core.js");

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const index = (letter) => C.ALPHABET.indexOf(letter);

test("every level of every game generates valid, non-repeating questions", () => {
  for (const activity of C.ACTIVITIES) {
    assert.ok(C.LEVELS[activity.id].length >= 6, activity.id);
    for (let level = 0; level <= C.maxLevel(activity.id); level++) {
      let previous = null;
      const random = seeded(42 + level);
      for (let i = 0; i < 80; i++) {
        const q = C.makeQuestion(activity.id, level, previous, random);
        assert.ok(q.answer);
        assert.equal(q.level, level);
        // Merkwörter share letters (Vogel, Vater), so they must not repeat the word;
        // comparisons only have <, > and =, so they must not repeat the pair.
        if (activity.id === "merk")
          assert.notEqual(q.word, previous?.word, `merk/${level}`);
        else if (q.key != null)
          assert.notEqual(q.key, previous?.key, `${activity.id}/${level}`);
        else assert.notEqual(q.answer, previous?.answer, `${activity.id}/${level}`);
        const options =
          q.pictures?.map((x) => x.initial) ||
          q.choices?.map((x) => x.word ?? x);
        if (options) {
          const config = C.LEVELS[activity.id][level];
          // Merkwörter carry their own three choices per word.
          assert.equal(options.length, config.choices ?? 3);
          assert.equal(new Set(options).size, options.length);
          for (const letter of q.answers || [q.answer])
            assert.ok(options.includes(letter));
        }
        previous = q;
      }
    }
  }
});

test("levels and options are clamped; unknown games fail explicitly", () => {
  assert.equal(C.makeQuestion("type", 99).level, C.maxLevel("type"));
  assert.equal(C.makeQuestion("type", -3).level, 0);
  assert.equal(C.makeQuestion("type", "x").level, 0);
  assert.throws(() => C.makeQuestion("unknown"), /Unbekanntes Spiel/);
});

test("typing keys contain the answer, grow with the level and cover the alphabet", () => {
  const random = seeded(4);
  let previousKeys = 0;
  for (let level = 0; level <= C.maxLevel("type"); level++) {
    const config = C.LEVELS.type[level];
    const q = C.makeQuestion("type", level, null, random);
    assert.equal(q.keys.length, config.keys);
    assert.ok(q.keys.includes(q.answer));
    assert.ok(config.range.includes(q.answer));
    assert.ok(!C.AMBIGUOUS_LAUTE.includes(q.answer));
    assert.deepEqual(q.speech, { laut: q.answer });
    if (config.range === C.ALPHABET) {
      assert.ok(q.keys.length >= previousKeys);
      previousKeys = q.keys.length;
    }
  }
  const found = new Set();
  for (let i = 0; i < 500; i++)
    found.add(C.makeQuestion("type", 7, null, random).answer);
  assert.equal(found.size, 26 - C.AMBIGUOUS_LAUTE.length);
});

test("every letter has a German sound (Laut), never a letter name", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  for (const letter of C.ALPHABET) {
    const laut = C.LAUTE[letter];
    assert.ok(laut.say && laut.example, letter);
    assert.ok(
      fs.existsSync(
        path.join(__dirname, "../audio/laute", letter.toLowerCase() + ".wav"),
      ),
      `audio/laute/${letter.toLowerCase()}.wav fehlt`,
    );
  }
  // Same-sounding letters on the keyboard count as right (F/V, K/C, Z/C …).
  const random = seeded(12);
  for (let i = 0; i < 300; i++) {
    const q = C.makeQuestion("type", 7, null, random);
    for (const letter of q.accept) assert.ok(C.AMBIGUOUS_LAUTE.includes(letter));
    if (q.answer === "F") assert.deepEqual(q.accept, ["V"]);
  }
});

test("ABC workshop answers are alphabetical (or reversed), shuffled, gapped when asked", () => {
  for (let level = 0; level <= C.maxLevel("order"); level++) {
    const config = C.LEVELS.order[level];
    const random = seeded(8 + level);
    for (let i = 0; i < 40; i++) {
      const q = C.makeQuestion("order", level, null, random);
      assert.equal(q.answer.length, config.count);
      assert.notEqual(q.cards.join(""), q.answer);
      assert.deepEqual([...q.cards].sort(), [...q.answer].sort());
      for (let j = 1; j < q.answer.length; j++) {
        const step = index(q.answer[j]) - index(q.answer[j - 1]);
        if (config.gaps) assert.ok(step > 0);
        else assert.equal(step, config.reverse ? -1 : 1);
      }
      if (config.gaps)
        assert.ok(index(q.answer.at(-1)) - index(q.answer[0]) > config.count - 1);
      for (const letter of q.answer) assert.ok(q.help.includes(letter));
    }
  }
});

test("neighbors match their direction and never cross the alphabet's ends", () => {
  for (let level = 0; level <= C.maxLevel("neighbor"); level++) {
    const random = seeded(123 + level);
    for (let i = 0; i < 60; i++) {
      const q = C.makeQuestion("neighbor", level, null, random);
      if (q.dir === "after") assert.equal(index(q.answer), index(q.target) + 1);
      else if (q.dir === "before")
        assert.equal(index(q.answer), index(q.target) - 1);
      else {
        assert.equal(index(q.left) + 1, index(q.answer));
        assert.equal(index(q.right) - 1, index(q.answer));
      }
      if (q.dir !== "between") assert.ok(!q.choices.includes(q.target));
    }
  }
  assert.equal(C.makeQuestion("neighbor", 0, null, seeded(1)).dir, "after");
  assert.equal(C.makeQuestion("neighbor", 2, null, seeded(1)).dir, "before");
});

test("missing letters leave exactly the configured gaps in a real ABC row", () => {
  for (let level = 0; level <= C.maxLevel("missing"); level++) {
    const config = C.LEVELS.missing[level];
    const random = seeded(3 + level);
    for (let i = 0; i < 30; i++) {
      const q = C.makeQuestion("missing", level, null, random);
      assert.equal(q.row.length, config.length);
      assert.equal(q.row.filter((x) => x === null).length, config.gaps);
      assert.ok(C.ALPHABET.includes(q.full));
      assert.equal(q.answers.join(""), q.answer);
      for (const choice of q.choices)
        assert.ok(!q.row.includes(choice), "visible letters are no choices");
    }
  }
});

test("initial sounds: clear words, easy levels avoid and hard levels use similar sounds", () => {
  for (const item of C.WORDS) {
    assert.equal(item.word[0].toUpperCase(), item.initial);
    assert.ok(!/^(sch|sp|st|ch|ei|eu|au|qu)/i.test(item.word), item.word);
  }
  const random = seeded(9);
  for (let i = 0; i < 100; i++) {
    const easy = C.makeQuestion("initial", 0, null, random);
    assert.ok(!easy.choices.includes(C.CONFUSABLE[easy.answer]));
    assert.equal(easy.picture, true);
    const hard = C.makeQuestion("initial", C.maxLevel("initial"), null, random);
    assert.ok(hard.choices.includes(C.CONFUSABLE[hard.answer]));
    assert.equal(hard.picture, false);
  }
});

test("blending: recorded unambiguous sounds, growing words, similar and written choices", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  for (const item of C.BLEND_WORDS)
    for (const sound of item.sounds) {
      assert.ok(!C.AMBIGUOUS_LAUTE.includes(sound), item.word);
      assert.ok(
        fs.existsSync(
          path.join(__dirname, "../audio/laute", sound.toLowerCase() + ".wav"),
        ),
      );
    }
  for (let level = 0; level <= C.maxLevel("blend"); level++) {
    const config = C.LEVELS.blend[level];
    const random = seeded(30 + level);
    for (let i = 0; i < 40; i++) {
      const q = C.makeQuestion("blend", level, null, random);
      assert.ok(q.sounds.length >= config.min && q.sounds.length <= config.max);
      assert.equal(q.written, Boolean(config.written));
      assert.deepEqual(
        q.speech.map((part) => part.laut),
        q.sounds,
      );
      assert.ok(q.speech.every((part, dot) => part.dot === dot && part.gap === config.gap));
      assert.equal(new Set(q.choices.map((x) => x.icon)).size, q.choices.length);
    }
  }
  // Similar choices share sounds with the answer (Rose, Hose, Dose …).
  const random = seeded(77);
  let shared = 0;
  for (let i = 0; i < 50; i++) {
    const q = C.makeQuestion("blend", 2, null, random);
    const answer = C.BLEND_WORDS.find((x) => x.word === q.answer).sounds;
    for (const choice of q.choices.filter((x) => x.word !== q.answer)) {
      const sounds = C.BLEND_WORDS.find((x) => x.word === choice.word).sounds;
      if ([...sounds].some((sound, j) => answer[j] === sound)) shared++;
    }
  }
  assert.ok(shared >= 80, `only ${shared} similar distractors`);
});

test("initial sounds in reverse: hear a sound, pick the picture", () => {
  const levels = C.LEVELS.initial
    .map((config, level) => ({ config, level }))
    .filter((x) => x.config.reverse);
  assert.ok(levels.length >= 2);
  const random = seeded(21);
  for (const { config, level } of levels)
    for (let i = 0; i < 60; i++) {
      const q = C.makeQuestion("initial", level, null, random);
      assert.deepEqual(q.speech, { laut: q.answer });
      const initials = q.pictures.map((x) => x.initial);
      assert.equal(new Set(initials).size, config.choices);
      assert.equal(initials.filter((x) => x === q.answer).length, 1);
      const twin = C.CONFUSABLE[q.answer];
      if (config.confusable && C.WORDS.some((x) => x.initial === twin))
        assert.ok(initials.includes(twin));
    }
});

test("Merkwörter teach C, Qu, V, X and Y through words with a rule", () => {
  const rules = new Set(C.LEVELS.merk.flatMap((level) => level.rules));
  for (const rule of Object.keys(C.MERK_RULES)) assert.ok(rules.has(rule), rule);
  for (const letter of C.AMBIGUOUS_LAUTE)
    assert.ok(
      C.MERK_WORDS.some((item) => item.spelled.toUpperCase().includes(`[${letter}`)),
      `no Merkwort for ${letter}`,
    );
  for (const item of C.MERK_WORDS) {
    assert.match(item.spelled, /^[^[\]]*\[[^[\]]+\][^[\]]*$/);
    assert.ok(C.MERK_RULES[item.rule], item.spelled);
    assert.equal(new Set(item.choices).size, 3);
  }
  for (let level = 0; level <= C.maxLevel("merk"); level++) {
    const config = C.LEVELS.merk[level];
    const random = seeded(50 + level);
    for (let i = 0; i < 30; i++) {
      const q = C.makeQuestion("merk", level, null, random);
      assert.equal(q.before + q.answer + q.after, q.word);
      assert.ok(q.choices.includes(q.answer));
      assert.ok(config.rules.includes(q.rule));
      assert.equal(q.group, C.MERK_RULES[q.rule].group);
      assert.equal(q.speech, q.word);
      assert.equal(q.picture, config.picture !== false);
    }
  }
  // Statistics per Merkwort group feed the report.
  const state = C.defaultState();
  const now = new Date(2026, 9, 14, 18).getTime();
  for (let i = 0; i < 4; i++)
    C.recordTask(state, { mode: "merk", level: 1, startLevel: 0, firstTry: false, mistakes: 1, ms: 1000, group: "v" }, now - i);
  for (let i = 0; i < 3; i++)
    C.recordTask(state, { mode: "merk", level: 1, startLevel: 0, firstTry: true, mistakes: 0, ms: 1000, group: "qu" }, now - i);
  assert.deepEqual(state.stats.merk, { v: { seen: 4, ok: 0 }, qu: { seen: 3, ok: 3 } });
  const report = C.buildReport(C.sanitizeState(JSON.parse(JSON.stringify(state))), now);
  assert.deepEqual(report.merk.map((x) => x.title), ["Qu", "V"]);
  assert.ok(report.focus.some((text) => text.includes("Merkwörter mit V")));
  assert.ok(report.strengths.some((text) => text.includes("Merkwörter mit Qu")));
  assert.ok(report.tips.some((text) => text.includes("Vogel, Vater")));
});

test("memory, echo and movement chains grow and can be reversed", () => {
  const random = seeded(5);
  for (let level = 0; level <= C.maxLevel("memory"); level++) {
    const config = C.LEVELS.memory[level];
    const q = C.makeQuestion("memory", level, null, random);
    assert.equal(q.words.length, config.length);
    assert.deepEqual(
      q.expected,
      config.reverse ? [...q.words].reverse() : q.words,
    );
    assert.equal(q.speech, q.words.join(". ") + ".");
  }
  for (let level = 0; level <= C.maxLevel("movement"); level++) {
    const q = C.makeQuestion("movement", level, null, random);
    assert.equal(q.moves.length, C.LEVELS.movement[level].length);
  }
  for (let level = 0; level <= C.maxLevel("echo"); level++) {
    const config = C.LEVELS.echo[level];
    const q = C.makeQuestion("echo", level, null, random);
    assert.equal(q.parts.length, config.words || 1);
    for (const part of q.parts)
      assert.equal(part.split(" – ").length, config.syllables);
  }
});

test("progression: harder after a first-try success, similar after a mistake, easier after two", () => {
  assert.deepEqual(C.progress("type", 2, true, 1), {
    level: 3,
    missStreak: 0,
    change: "up",
  });
  assert.deepEqual(C.progress("type", C.maxLevel("type"), true), {
    level: C.maxLevel("type"),
    missStreak: 0,
    change: "same",
  });
  const first = C.progress("type", 4, false, 0);
  assert.deepEqual(first, { level: 4, missStreak: 1, change: "repeat" });
  assert.deepEqual(C.progress("type", 4, false, first.missStreak), {
    level: 3,
    missStreak: 0,
    change: "down",
  });
  assert.equal(C.progress("type", 0, false, 1).level, 0);
});

test("rounds end after three stars or six tasks", () => {
  assert.equal(C.ROUND_GOAL, 3);
  assert.equal(C.roundFinished(2, 5), false);
  assert.equal(C.roundFinished(3, 3), true);
  assert.equal(C.roundFinished(1, 6), true);
});

test("storage sanitization migrates version 1 and tolerates hostile data", () => {
  for (const raw of [null, [], "oops", { version: 7 }])
    assert.deepEqual(C.sanitizeState(raw), C.defaultState());
  const migrated = C.sanitizeState({
    version: 1,
    stars: 12,
    rounds: 2,
    settings: { voice: "v", rate: 0.65, autoSpeak: false, lowercase: true },
  });
  assert.equal(migrated.stars, 12);
  assert.equal(migrated.totalStars, 12);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.settings.rate, 0.65);
  const clean = C.sanitizeState({
    version: 2,
    stars: -1,
    totalStars: 1e9,
    levels: { type: 99, order: -4, nope: 3 },
    pet: { full: 500, joy: "x", updatedAt: 5 },
    food: { carrot: 3, poison: 9, salad: -2 },
    plots: [{ crop: "carrot", step: 7, phase: "boom", since: 10 }, "x"],
    settings: { rate: 3, lowercase: "yes" },
  });
  assert.equal(clean.stars, 0);
  assert.equal(clean.totalStars, 1000000);
  assert.equal(clean.levels.type, C.maxLevel("type"));
  assert.equal(clean.levels.order, 0);
  assert.equal(clean.levels.nope, undefined);
  assert.equal(clean.pet.full, 100);
  assert.equal(clean.pet.joy, C.defaultState().pet.joy);
  assert.deepEqual(clean.food, { carrot: 3 });
  assert.deepEqual(clean.plots[0], {
    crop: "carrot",
    step: 0,
    phase: "dry",
    since: 10,
  });
  assert.deepEqual(clean.plots[1], { crop: null });
  assert.equal(clean.plots.length, C.BEDS.length);
  assert.equal(clean.settings.rate, 0.8);
  assert.equal(clean.settings.lowercase, false);
});

test("Momo gets hungry slowly, never below zero, and food and cuddles help", () => {
  const hour = 3600000;
  const fresh = C.petAt({ full: 50, joy: 50, updatedAt: 0 }, 1000);
  assert.deepEqual(fresh, { full: 50, joy: 50, updatedAt: 1000 });
  const later = C.petAt(fresh, 1000 + 10 * hour);
  assert.equal(Math.round(later.full), 20);
  assert.equal(Math.round(later.joy), 30);
  assert.equal(C.petMood(later), "hungry");
  assert.equal(C.petAt(fresh, 1000 + 1000 * hour).full, 0);
  assert.equal(C.petMood({ full: 80, joy: 80 }), "happy");
  assert.equal(C.petMood({ full: 50, joy: 10 }), "sad");

  const state = C.defaultState();
  state.pet = { full: 20, joy: 20, updatedAt: 1000 };
  assert.equal(C.feedPet(state, "carrot", 1000), "none");
  state.food.carrot = 1;
  // At 1000 ms Momo wishes for a carrot (the only crop yet): extra joy.
  assert.equal(C.feedPet(state, "carrot", 1000), "wish");
  assert.equal(state.pet.full, 20 + C.CROPS[0].full);
  assert.equal(state.pet.joy, 20 + C.CROPS[0].joy + 15);
  assert.equal(state.food.carrot, undefined);
  state.food.carrot = 2;
  state.pet.full = 99;
  assert.equal(C.feedPet(state, "carrot", 1000), "full");
  assert.equal(state.food.carrot, 2);
  state.pet.joy = 20;
  for (let i = 0; i < 50; i++) C.cuddlePet(state, 1000);
  assert.equal(state.pet.joy, 60, "cuddling alone only goes so far");
  C.cheerPet(state, 1000, 10);
  assert.equal(state.pet.joy, 70);
});

test("beds: buy seeds with stars, water twice, harvest food", () => {
  const state = C.defaultState();
  const carrot = C.CROPS[0];
  assert.equal(C.plant(state, 0, "carrot", 0), "stars");
  state.stars = carrot.cost + 1;
  assert.equal(C.plant(state, 0, "salad", 0), "locked");
  assert.equal(C.plant(state, 3, "carrot", 0), "locked");
  assert.equal(C.plant(state, 0, "carrot", 0), "planted");
  assert.equal(state.stars, 1);
  assert.equal(C.plant(state, 0, "carrot", 0), "busy");
  // Without water nothing grows.
  assert.equal(C.plotAt(state.plots[0], 10 * carrot.grow).phase, "dry");
  assert.equal(C.water(state, 0, 1000), "watered");
  assert.equal(C.water(state, 0, 1000), "no");
  assert.equal(C.plotProgress(state.plots[0], 1000 + carrot.grow / 4), 0.25);
  const half = 1000 + carrot.grow / 2;
  assert.deepEqual(C.plotAt(state.plots[0], half), {
    crop: "carrot",
    step: 1,
    phase: "dry",
    since: half,
  });
  assert.equal(C.harvest(state, 0, half), null);
  assert.equal(C.water(state, 0, half), "watered");
  assert.equal(C.plotAt(state.plots[0], half + carrot.grow / 2).phase, "ripe");
  assert.equal(C.harvest(state, 0, half + carrot.grow / 2), carrot);
  assert.equal(state.food.carrot, carrot.yield);
  assert.deepEqual(state.plots[0], { crop: null });
});

test("garden economy: a session of stars buys a few plants, not a full larder", () => {
  // About 25 stars (a 10-minute session) buy at most 8 carrot plants …
  assert.ok(Math.floor(25 / C.CROPS[0].cost) <= 8);
  for (const crop of C.CROPS) {
    // … and every crop needs real time to grow and fills Momo only a little.
    assert.ok(crop.grow >= 4 * 60000, crop.id);
    assert.ok(crop.full * crop.yield <= 60, crop.id);
  }
  // Prices rise with the unlock.
  const costs = C.CROPS.map((x) => x.cost);
  assert.deepEqual([...costs].sort((a, b) => a - b), costs);
});

test("Momo wishes for one food at a time; the wish changes over time", () => {
  const state = C.defaultState();
  state.totalStars = 1000;
  state.pet = { full: 20, joy: 20, updatedAt: 0 };
  const now = 5 * C.WISH_WINDOW + 10;
  const wish = C.petWish(state, now);
  assert.ok(C.CROPS.includes(wish));
  const other = C.CROPS.find((x) => x !== wish);
  state.food = { [wish.id]: 1, [other.id]: 1 };
  assert.equal(C.feedPet(state, other.id, now), "eaten");
  assert.equal(C.feedPet(state, wish.id, now), "wish");
  assert.equal(C.petWish(state, now), null, "a fulfilled wish waits for the next window");
  const wishes = new Set();
  for (let i = 0; i < 20; i++) wishes.add(C.petWish(state, (6 + i) * C.WISH_WINDOW)?.id);
  assert.ok(wishes.size >= 3);
});

test("treasure chest: buy with stars, wear one thing per slot, play ball", () => {
  const state = C.defaultState();
  state.pet = { full: 50, joy: 50, updatedAt: 1 };
  assert.equal(C.playPet(state, 1), "no");
  assert.equal(C.buyItem(state, "cap"), "stars");
  state.stars = 200;
  assert.equal(C.buyItem(state, "cap"), "bought");
  assert.deepEqual(state.wardrobe.worn, ["cap"]);
  assert.equal(C.buyItem(state, "cap"), "owned");
  assert.equal(C.buyItem(state, "crown"), "bought");
  assert.deepEqual(state.wardrobe.worn, ["crown"], "one hat at a time");
  C.buyItem(state, "scarf");
  assert.deepEqual(state.wardrobe.worn.sort(), ["crown", "scarf"]);
  assert.equal(C.wearItem(state, "scarf"), "off");
  assert.equal(C.wearItem(state, "cap"), "worn");
  assert.deepEqual(state.wardrobe.worn, ["cap"]);
  assert.equal(C.buyItem(state, "ball"), "bought");
  assert.ok(!state.wardrobe.worn.includes("ball"));
  assert.equal(state.stars, 200 - 30 - 70 - 18 - 15);
  for (let i = 0; i < 20; i++) C.playPet(state, 1);
  assert.equal(state.pet.joy, 85, "playing alone only goes so far");
  const clean = C.sanitizeState(
    JSON.parse(JSON.stringify({ version: 2, ...state, wardrobe: { owned: ["cap", "crown", "x"], worn: ["cap", "crown", "ball"] } })),
  );
  assert.deepEqual(clean.wardrobe, { owned: ["cap", "crown"], worn: ["cap"] });
});

test("English: pictures fit the words, no German letter names, voices get English parts", () => {
  const random = seeded(11);
  const icons = new Set(C.EN_WORDS.map((x) => x.icon));
  assert.equal(icons.size, C.EN_WORDS.length, "every picture is unambiguous");
  for (const group of C.EN_SIMILAR)
    for (const word of group) assert.ok(C.EN_WORDS.some((x) => x.en === word), word);
  const english = (speech) => [speech].flat().filter((part) => part?.en).map((part) => part.en);
  for (const mode of C.ENGLISH_GAMES)
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 40; i++) {
        const q = C.makeQuestion(mode, level, null, random);
        // German strings never carry the English answer.
        for (const part of [q.speech].flat().filter((x) => typeof x === "string"))
          assert.ok(!part.includes(q.answer), `${mode}: ${part}`);
        if (mode === "enwords") assert.deepEqual(english(q.speech), [q.answer]);
        if (mode === "enmissing") {
          assert.equal(english(q.speech).length, q.choices.length - 1);
          assert.ok(!english(q.speech).includes(q.answer));
        }
        if (mode === "enpattern") {
          assert.equal(english(q.speech).length, q.row.length);
          assert.equal(q.answer, q.row[q.row.length - q.period]);
        }
        if (mode === "ennumbers") assert.deepEqual(english(q.speech), [C.EN_NUMBERS[Number(q.answer)]]);
        if (mode === "encolors") {
          const answer = q.items.find((x) => x.value === q.answer);
          assert.deepEqual(english(q.speech), [answer.en]);
          // Every card has its own English name.
          assert.equal(new Set(q.items.map((x) => x.en)).size, q.items.length);
        }
        if (mode === "ensay") assert.equal(q.speech, null, "the child says it, Momo does not");
        if (q.explain) assert.ok(english(q.explain.speech).length >= 1);
      }
  const level = C.LEVELS.ennumbers.findIndex((x) => x.similar);
  let teens = 0;
  for (let i = 0; i < 100; i++) {
    const q = C.makeQuestion("ennumbers", level, null, random);
    const n = Number(q.answer);
    if (q.choices.includes(String(n + 10)) || q.choices.includes(String(n - 10))) teens++;
  }
  assert.ok(teens > 50, "three and thirteen are offered together");
  const colours = C.makeQuestion("encolors", C.LEVELS.encolors.findIndex((x) => x.ask === "count"), null, seeded(3));
  assert.match(colours.items[0].de, /^(ein|zwei|drei|vier|fünf) /);
});

test("unlocks, beds and the recommended game follow progress", () => {
  assert.equal(C.bedCount(0), 3);
  assert.equal(C.bedCount(10), 4);
  assert.equal(C.bedCount(1000), C.BEDS.length);
  assert.deepEqual(
    C.availableCrops(0).map((x) => x.id),
    ["carrot"],
  );
  assert.equal(C.availableCrops(1000).length, C.CROPS.length);
  assert.deepEqual(C.newlyUnlocked(0, 5), []);
  const salad = C.CROPS.find((x) => x.id === "salad").unlock;
  assert.ok(C.newlyUnlocked(salad - 1, salad).some((x) => x.name === "Salat-Samen"));
  assert.equal(C.nextUnlock(0).at, C.UNLOCKS[0].at);
  assert.equal(C.nextUnlock(100000), null);
  const state = C.defaultState();
  assert.equal(C.recommendedGame(state), "type");
  state.lastPlayed = Object.fromEntries(C.ACTIVITIES.map((x, i) => [x.id, 10 + i]));
  state.lastPlayed.initial = 3;
  state.lastPlayed.memory = 1;
  assert.equal(C.recommendedGame(state), "initial");
  assert.ok(!C.ACTIVITIES.find((x) => x.id === C.recommendedGame(state)).together);
});

test("learning statistics count tasks, sounds, confusions, levels and days", () => {
  const state = C.defaultState();
  const day = 86400000;
  const start = new Date(2026, 9, 1, 10).getTime();
  const task = (mode, firstTry, extra = {}) => ({
    mode,
    level: 0,
    startLevel: 0,
    firstTry,
    mistakes: firstTry ? 0 : 1,
    ms: 30000,
    letters: [],
    confusions: [],
    ...extra,
  });
  C.recordTask(state, task("type", true, { letters: ["B"], level: 1 }), start);
  C.recordTask(
    state,
    task("type", false, { letters: ["P"], confusions: [["P", "B"]], level: 1 }),
    start + 1000,
  );
  C.recordTask(state, task("type", false, { letters: ["B"], confusions: [["B", "P"]], level: 0 }), start + 2000);
  C.recordTask(state, task("missing", true, { letters: ["K", "L"] }), start + day);
  const game = state.stats.games.type;
  assert.equal(game.tasks, 3);
  assert.equal(game.ok, 1);
  assert.equal(game.mistakes, 2);
  assert.deepEqual(game.recent, [1, 0, 0]);
  assert.deepEqual(
    game.levels.map(([, level]) => level),
    [0, 1, 0],
  );
  assert.deepEqual(state.stats.sounds.B, { seen: 2, ok: 1, wrong: { P: 1 } });
  assert.deepEqual(state.stats.sounds.P, { seen: 1, ok: 0, wrong: { B: 1 } });
  assert.deepEqual(state.stats.abc.K, { seen: 1, ok: 1 });
  assert.equal(state.stats.days[C.dayKey(start)].tasks, 3);
  assert.equal(state.stats.days[C.dayKey(start + day)].tasks, 1);
  // Long tasks are capped so a forgotten tab does not count as playing time.
  C.recordTask(state, task("memory", true, { ms: 3600000 }), start + day);
  assert.equal(state.stats.games.memory.ms, 180000);
  for (let i = 0; i < 40; i++)
    C.recordTask(state, task("blend", i % 2 === 0), start + i * day);
  assert.equal(state.stats.games.blend.recent.length, 20);
  assert.ok(Object.keys(state.stats.days).length <= 90);
  // Survives storage, drops hostile entries.
  const stored = JSON.parse(JSON.stringify(state));
  stored.stats.sounds["<img>"] = { seen: 5, ok: 9 };
  stored.stats.sounds.B.wrong.B = 3;
  stored.stats.games.type.levels.push([1, 99]);
  stored.stats.days["gestern"] = { tasks: 1 };
  const clean = C.sanitizeState(stored);
  assert.equal(clean.stats.sounds["<img>"], undefined);
  assert.deepEqual(clean.stats.sounds.B.wrong, { P: 1 });
  assert.equal(clean.stats.games.type.levels.length, 3);
  assert.equal(clean.stats.days.gestern, undefined);
  assert.deepEqual(C.sanitizeState({ version: 2, stats: "x" }).stats, C.defaultState().stats);
});

test("the parents' report finds strengths, weak sounds, confusions and tips", () => {
  const state = C.defaultState();
  const now = new Date(2026, 9, 14, 18).getTime();
  const day = 86400000;
  let n = 0;
  const add = (mode, letters, firstTry, confusions = [], when = now) =>
    C.recordTask(
      state,
      { mode, level: 2, startLevel: 0, firstTry, mistakes: firstTry ? 0 : 1, ms: 60000, letters, confusions },
      when - n++ * 1000,
    );
  for (let i = 0; i < 6; i++) add("type", ["M"], true);
  for (let i = 0; i < 4; i++) add("type", ["B"], false, [["B", "P"]]);
  for (let i = 0; i < 6; i++) add("missing", ["F", "G"], true);
  for (let i = 0; i < 3; i++) add("type", ["S"], true, [], now - 8 * day);
  state.levels.type = 2;
  const report = C.buildReport(state, now);
  assert.equal(report.enoughData, true);
  assert.equal(report.kpis.tasks, 16);
  assert.equal(report.kpis.tasksBefore, 3);
  assert.equal(report.kpis.activeDays, 2);
  assert.equal(report.activity.length, 14);
  assert.equal(report.activity.at(-1).key, C.dayKey(now));
  const type = report.games.find((game) => game.id === "type");
  assert.equal(type.tasks, 13);
  assert.equal(type.level, 2);
  assert.deepEqual(report.sounds.strong.map((x) => x.letter), ["M", "S"]);
  assert.deepEqual(report.sounds.weak.map((x) => x.letter), ["B"]);
  assert.deepEqual(report.sounds.confusions, [{ a: "B", b: "P", count: 4 }]);
  assert.deepEqual(report.abc.strong.map((x) => x.letter), ["F", "G"]);
  assert.ok(report.strengths.some((text) => text.startsWith("ABC & Reihenfolge")));
  assert.ok(report.focus.some((text) => text.includes("B und P")));
  assert.ok(report.tips.some((text) => text.includes("Luftstoß")));
  assert.ok(report.tips.some((text) => text.includes("Noch nicht ausprobiert")));
  // Little data: the report says so instead of drawing conclusions.
  assert.equal(C.buildReport(C.defaultState(), now).enoughData, false);
  assert.deepEqual(C.buildReport(C.defaultState(), now).focus, []);
});

test("every game sits in exactly one category of a subject", () => {
  const listed = C.CATEGORIES.flatMap((category) => category.games);
  assert.deepEqual([...listed].sort(), C.ACTIVITIES.map((x) => x.id).sort());
  for (const category of C.CATEGORIES)
    assert.ok(C.SUBJECTS.some((subject) => subject.id === category.subject));
  assert.equal(C.categoryOf("type").id, "hearing");
  assert.equal(C.categoryOf("build").subject, "mathe");
  assert.equal(C.categoryOf("nope"), null);
});

test("numbers are spoken as German words", () => {
  const words = { 0: "null", 1: "eins", 11: "elf", 16: "sechzehn", 17: "siebzehn", 21: "einundzwanzig", 30: "dreißig", 47: "siebenundvierzig", 99: "neunundneunzig", 100: "hundert" };
  for (const [n, word] of Object.entries(words)) assert.equal(C.numberWord(Number(n)), word);
  // Up to a million, as one word like in writing (101000: "hunderteintausend").
  const big = {
    101: "hunderteins",
    312: "dreihundertzwölf",
    1000: "tausend",
    3052: "dreitausendzweiundfünfzig",
    21000: "einundzwanzigtausend",
    101000: "hunderteintausend",
    452318: "vierhundertzweiundfünfzigtausenddreihundertachtzehn",
    1000000: "eine Million",
  };
  for (const [n, word] of Object.entries(big)) assert.equal(C.numberWord(Number(n)), word);
  assert.equal(C.numberWord(1000001), "1000001");
  assert.equal(C.formatNumber(9999), "9999");
  assert.equal(C.formatNumber(452318), "452 318");
});

test("math tasks fit tens and ones and offer the typical mistakes", () => {
  const random = seeded(7);
  for (let level = 0; level <= C.maxLevel("bundle"); level++)
    for (let i = 0; i < 60; i++) {
      const config = C.LEVELS.bundle[level];
      const q = C.makeQuestion("bundle", level, null, random);
      assert.equal(q.tens * 10 + q.ones, q.number);
      assert.ok(q.number >= config.min && q.number <= config.max);
      if (config.swap && q.tens !== q.ones && q.ones) assert.ok(q.choices.includes(q.swap));
      // The number itself is never spoken: that would give the answer away.
      assert.equal(q.speech, undefined);
    }
  for (let level = 0; level <= C.maxLevel("place"); level++)
    for (let i = 0; i < 60; i++) {
      const config = C.LEVELS.place[level];
      const q = C.makeQuestion("place", level, null, random);
      assert.ok(config.ask.includes(q.kind));
      assert.equal(q.tens * 10 + q.ones, q.number);
      if (q.kind === "tens") assert.equal(q.answer, String(q.tens));
      else if (q.kind === "ones") assert.equal(q.answer, String(q.ones));
      else if (q.kind === "split")
        assert.equal(q.answer, String(q.findTens ? q.tens * 10 : q.ones));
      else assert.equal(q.answer, String(q.number));
      if (q.kind === "bundle") assert.ok(q.ones >= 10 && q.number <= 99);
      else assert.ok(q.ones <= 9 && q.tens !== q.ones);
      assert.ok(q.choices.includes(q.swap));
    }
  for (let level = 0; level <= C.maxLevel("build"); level++)
    for (let i = 0; i < 60; i++) {
      const config = C.LEVELS.build[level];
      const q = C.makeQuestion("build", level, null, random);
      assert.equal(q.target.tens * 10 + q.target.ones, q.number);
      assert.ok(q.target.tens <= 9 && q.target.ones <= 9);
      assert.equal(q.hidden, Boolean(config.hidden));
      if (config.change) {
        assert.ok(config.change.includes(q.delta));
        assert.equal(q.startNumber + q.delta, q.number);
        // ±1 stays within the same ten.
        if (Math.abs(q.delta) === 1) assert.equal(q.start.tens, q.target.tens);
      } else {
        assert.deepEqual(q.start, { tens: 0, ones: 0 });
        assert.equal(q.speech, C.numberWord(q.number));
      }
    }
});

test("number line, hundred chart and counting in steps are consistent", () => {
  const random = seeded(11);
  const each = (mode, check) => {
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 60; i++) check(C.makeQuestion(mode, level, null, random), C.LEVELS[mode][level]);
  };
  each("line", (q, config) => {
    assert.equal(q.to - q.from, config.span);
    assert.ok(q.number > q.from && q.number < q.to);
    // The balloon never sits on a written number.
    assert.ok(!q.labels.includes(q.number));
    if (config.at === "tens") assert.equal(q.number % 10, 0);
    if (config.at === "fives") assert.equal(q.number % 10, 5);
    for (const x of q.choices.map(Number)) assert.ok(x >= q.from && x <= q.to);
    assert.ok(q.base < q.number && q.number - q.base <= 5);
    assert.ok(!q.helpLabels.includes(q.number));
  });
  each("chart", (q) => {
    const cells = q.grid.flat();
    assert.equal(cells.filter((cell) => cell.state === "gap").length, 1);
    assert.equal(cells.find((cell) => cell.state === "gap").n, q.number);
    for (const row of q.grid) {
      // A row of the hundred chart never wraps: same tens row, one apart.
      for (let i = 1; i < row.length; i++) assert.equal(row[i].n - row[i - 1].n, 1);
      assert.equal(new Set(row.map((cell) => Math.floor((cell.n - 1) / 10))).size, 1);
    }
    for (let r = 1; r < q.grid.length; r++) assert.equal(q.grid[r][0].n - q.grid[r - 1][0].n, 10);
    for (const cell of cells) assert.ok(cell.n >= 1 && cell.n <= 100);
    assert.ok(cells.some((cell) => cell.state === "shown"));
  });
  each("steps", (q, config) => {
    assert.ok(config.steps.includes(q.step));
    for (let i = 1; i < q.sequence.length; i++) assert.equal(q.sequence[i] - q.sequence[i - 1], q.step);
    for (const x of q.sequence) assert.ok(x >= 1 && x <= 100);
    assert.equal(q.answer, String(q.sequence[q.gap]));
    // Distractors are never numbers already shown in the row.
    for (const x of q.choices.map(Number))
      if (x !== q.number) assert.ok(!q.sequence.includes(x));
    assert.ok(!/\d/.test(q.speech));
  });
});

test("comparing, ordering and neighbours follow the number order", () => {
  const random = seeded(12);
  const each = (mode, check) => {
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 60; i++) check(C.makeQuestion(mode, level, null, random), C.LEVELS[mode][level]);
  };
  each("compare", (q, config) => {
    const { value: a } = q.left;
    const { value: b } = q.right;
    assert.equal(q.answer, a < b ? "<" : a > b ? ">" : "=");
    if (!config.equal) assert.notEqual(a, b);
    if (q.kind === "swapped" && a !== b) assert.equal(b, (a % 10) * 10 + Math.floor(a / 10));
    if (q.kind === "sameTens" && a !== b) assert.equal(Math.floor(a / 10), Math.floor(b / 10));
    if (q.swap) assert.notEqual(q.swap, q.answer);
  });
  each("sort", (q, config) => {
    const numbers = q.order.map(Number);
    assert.equal(numbers.length, config.count);
    assert.equal(new Set(numbers).size, numbers.length);
    for (let i = 1; i < numbers.length; i++)
      assert.ok(config.reverse ? numbers[i] < numbers[i - 1] : numbers[i] > numbers[i - 1]);
    assert.deepEqual([...q.cards].sort(), [...q.order].sort());
    assert.notDeepEqual(q.cards, q.order);
    if (config.swap)
      assert.ok(numbers.some((x) => x % 10 && numbers.includes((x % 10) * 10 + Math.floor(x / 10)) && x % 11));
  });
  each("adjacent", (q) => {
    const n = q.number;
    const expected = {
      after: n + 1,
      before: n - 1,
      between: n,
      tenBelow: Math.floor(n / 10) * 10,
      tenAbove: Math.floor(n / 10) * 10 + 10,
    }[q.kind];
    assert.equal(q.answer, String(expected));
    if (q.kind.startsWith("ten")) assert.notEqual(n % 10, 0);
    assert.ok(q.line.from <= Math.min(n, expected) && q.line.to >= Math.max(n, expected));
  });
});

test("calculating with tens and reading bar charts", () => {
  const random = seeded(13);
  for (let level = 0; level <= C.maxLevel("calc"); level++)
    for (let i = 0; i < 60; i++) {
      const q = C.makeQuestion("calc", level, null, random);
      assert.equal(q.result, q.minus ? q.a - q.b : q.a + q.b);
      assert.ok(q.result >= 1 && q.result <= 100);
      if (q.op.startsWith("T")) assert.ok(q.a % 10 === 0 && q.b % 10 === 0);
      if (q.op.startsWith("N")) assert.ok(q.a % 10 !== 0 && q.b % 10 === 0);
      if (q.fill) {
        // Exactly to the neighbouring ten.
        assert.equal(q.result % 10, 0);
        assert.equal(q.answer, String(q.b));
        assert.ok(q.b >= 1 && q.b <= 9);
      } else assert.equal(q.answer, String(q.result));
      assert.ok(!/\d/.test(q.speech));
    }
  for (let level = 0; level <= C.maxLevel("graph"); level++)
    for (let i = 0; i < 60; i++) {
      const config = C.LEVELS.graph[level];
      const q = C.makeQuestion("graph", level, null, random);
      const values = q.bars.map((bar) => bar.value);
      assert.equal(q.bars.length, config.bars);
      assert.equal(new Set(values).size, values.length);
      const byValue = (value) => q.bars.find((bar) => bar.value === value).word;
      if (q.kind === "most") assert.equal(q.answer, byValue(Math.max(...values)));
      if (q.kind === "least") assert.equal(q.answer, byValue(Math.min(...values)));
      if (q.kind === "value") assert.equal(q.answer, String(q.bars[q.target].value));
      if (q.kind === "diff")
        assert.equal(q.answer, String(q.bars[q.pair[0]].value - q.bars[q.pair[1]].value));
      if (q.kind === "sum") assert.equal(q.answer, String(values.reduce((a, b) => a + b, 0)));
      assert.ok(q.question.endsWith("?"));
    }
});

test("sets: counting, comparing and sorting into rings", () => {
  const random = seeded(14);
  const each = (mode, check) => {
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 60; i++) check(C.makeQuestion(mode, level, null, random), C.LEVELS[mode][level]);
  };
  each("count", (q, config) => {
    if (q.show === "dice") {
      assert.equal(q.answer, String(q.dice[0] + q.dice[1]));
      for (const pips of q.dice) assert.ok(pips >= 1 && pips <= 6);
    } else if (q.show === "missing") {
      assert.equal(Number(q.answer) + q.number, 20);
      assert.ok(q.choices.includes(String(q.number)));
    } else {
      assert.equal(q.answer, String(q.number));
      if (config.max) assert.ok(q.number <= config.max);
    }
    if (q.show === "scatter") {
      assert.equal(q.points.length, q.number);
      assert.equal(new Set(q.points.map((p) => `${Math.floor(p.x / (100 / 6))},${Math.floor(p.y / 25)}`)).size, q.number);
    }
    if (q.show === "tally")
      assert.ok(q.choices.includes(String(Math.floor(q.number / 5) + (q.number % 5))));
  });
  each("more", (q, config) => {
    assert.ok(q.left >= 1 && q.right >= 1 && q.left <= config.max && q.right <= config.max);
    const bigger = q.left > q.right ? "links" : q.left < q.right ? "rechts" : "gleich";
    if (q.kind === "more") assert.equal(q.answer, bigger);
    if (q.kind === "fewer")
      assert.equal(q.answer, { links: "rechts", rechts: "links", gleich: "gleich" }[bigger]);
    if (q.kind === "diff") assert.equal(q.answer, String(Math.abs(q.left - q.right)));
    if (!config.equal) assert.notEqual(q.left, q.right);
    else if (q.left !== q.right) assert.ok(Math.abs(q.left - q.right) >= config.gap);
    // The trap: the side with fewer things is drawn bigger.
    if (config.trap && bigger !== "gleich") assert.notEqual(q.bigSide, bigger);
  });
  each("venn", (q, config) => {
    assert.equal(q.rings.length, config.rings);
    if (q.ask === "place") {
      const { a, b } = q.item;
      const zone = config.rings === 1 ? (a ? "a" : "none") : a && b ? "both" : a ? "a" : b ? "b" : "none";
      assert.equal(q.answer, zone);
      if (config.noBoth) assert.notEqual(q.answer, "both");
      assert.ok(!q.placed.includes(q.item));
    } else {
      const inRing = (x) => (q.ring === 0 ? x.a : x.b);
      const expected = {
        ring: q.placed.filter(inRing).length,
        only: q.placed.filter((x) => inRing(x) && x.zone !== "both").length,
        both: q.placed.filter((x) => x.zone === "both").length,
        none: q.placed.filter((x) => x.zone === "none").length,
      }[q.ask];
      assert.equal(q.answer, String(expected));
      for (const zone of ["a", "b", "both", "none"]) assert.ok(q.placed.some((x) => x.zone === zone));
    }
  });
  // Every thing in a set diagram has exactly one clear place.
  for (const set of C.VENN_SETS) {
    assert.equal(new Set(set.items.map((x) => x[2])).size, set.items.length);
    for (const zone of [[1, 1], [1, 0], [0, 1], [0, 0]])
      assert.ok(set.items.filter((x) => x[3] === zone[0] && x[4] === zone[1]).length >= 3);
  }
});

test("across the ten, times tables, money and the clock", () => {
  const random = seeded(15);
  const each = (mode, check) => {
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 60; i++) check(C.makeQuestion(mode, level, null, random), C.LEVELS[mode][level]);
  };
  each("cross", (q, config) => {
    assert.equal(q.result, q.minus ? q.a - q.b : q.a + q.b);
    assert.ok(q.result >= 1 && q.result <= 100);
    // The two steps add up to the second number, the first ends on a full ten.
    assert.equal(Math.abs(q.steps[0]) + Math.abs(q.steps[1]), q.b);
    if (!q.op.endsWith("N")) assert.equal((q.a + q.steps[0]) % 10, 0);
    if (["E+E", "N+E", "step+"].includes(q.op)) assert.ok((q.a % 10) + q.b > 10);
    if (["E-E", "N-E", "step-"].includes(q.op)) assert.ok(q.a % 10 < q.b);
    if (q.op === "N+N") assert.equal((q.a % 10) + (q.b % 10) >= 10, config.carry);
    assert.equal(q.answer, String(q.op.startsWith("step") ? Math.abs(q.steps[1]) : q.result));
    assert.ok(!/\d/.test(q.speech));
  });
  each("times", (q, config) => {
    assert.ok(config.rows.includes(q.cols));
    assert.equal(q.number, q.rows * q.cols);
    if (q.ask === "task") {
      assert.equal(q.answer, `${q.rows} · ${q.cols}`);
      // The swapped task would also be right, so it is never offered.
      if (q.rows !== q.cols) assert.ok(!q.choices.includes(`${q.cols} · ${q.rows}`));
      for (const choice of q.choices) assert.ok(q.say[choice] && !/\d/.test(q.say[choice]));
    } else assert.equal(q.answer, String(q.rows * q.cols));
    if (q.ask === "neighbor") assert.equal(Math.abs(q.rows - q.core), 1);
  });
  each("money", (q, config) => {
    if (q.ask === "count") {
      assert.equal(q.coins.reduce((a, b) => a + b, 0), Number(q.answer));
      assert.ok(q.coins.length <= 6 && q.coins.every((coin) => config.coins.includes(coin)));
    }
    if (q.ask === "pay") {
      const right = q.sets.filter((set) => set.coins.reduce((a, b) => a + b, 0) === q.price);
      assert.equal(right.length, 1);
      assert.equal(q.answer, right[0].id);
      for (const set of q.sets) assert.equal(set.coins.reduce((a, b) => a + b, 0), set.total);
    }
    if (q.ask === "change") assert.equal(Number(q.answer) + q.price, q.paid);
  });
  each("clock", (q, config) => {
    assert.ok(q.hour >= 1 && q.hour <= 12 && q.minute % 5 === 0);
    assert.equal(new Set(q.choices).size, q.choices.length);
    for (const choice of q.choices) assert.ok(q.say[choice] && !/\d/.test(q.say[choice]));
    if (!q.digital && q.minute === 30) assert.equal(q.answer, `halb ${(q.hour % 12) + 1}`);
    if (!config.kinds.includes("five"))
      for (const choice of q.choices) assert.ok(!/(^| )\d+ (nach|vor) /.test(choice), choice);
  });
});

test("syllables and lengthening never hand a single letter to the voice", () => {
  for (const [, spelled] of C.SYLLABLE_WORDS)
    for (const syllable of spelled.split("-")) assert.ok(syllable.length >= 2, spelled);
  for (const [, word, long] of C.EXTEND_WORDS) {
    assert.ok("dtgkb".includes(word.at(-1)), word);
    assert.ok(long.length > word.length);
  }
  const random = seeded(16);
  for (const mode of ["syllables", "extend"])
    for (let level = 0; level <= C.maxLevel(mode); level++)
      for (let i = 0; i < 60; i++) {
        const config = C.LEVELS[mode][level];
        const q = C.makeQuestion(mode, level, null, random);
        if (mode === "syllables") {
          assert.ok(config.sizes.includes(q.syllables.length));
          if (q.ask === "count") assert.equal(q.answer, String(q.syllables.length));
          else assert.equal(q.answer, q.syllables[q.gap]);
        } else {
          assert.equal(q.stem + q.answer, q.word);
          assert.deepEqual([...q.choices].sort().join(""), [q.answer, { d: "t", t: "d", g: "k", k: "g", b: "p" }[q.answer]].sort().join(""));
          // The ending is played as a sound file after solving, not spoken.
          assert.deepEqual(q.explain.speech.at(-1), { laut: q.answer.toUpperCase() });
        }
        assert.equal(q.speech, q.word);
      }
});

test("swapped tens and ones are counted and reported", () => {
  const state = C.defaultState();
  const now = new Date(2026, 9, 14, 18).getTime();
  for (let i = 0; i < 3; i++)
    C.recordTask(state, { mode: "place", level: 1, startLevel: 0, firstTry: false, mistakes: 1, ms: 1000, letters: [], swaps: 1 }, now);
  C.recordTask(state, { mode: "type", level: 1, startLevel: 0, firstTry: false, mistakes: 1, ms: 1000, letters: ["M"], swaps: 4 }, now);
  assert.equal(state.stats.math.swaps, 3);
  const clean = C.sanitizeState(JSON.parse(JSON.stringify(state)));
  assert.equal(clean.stats.math.swaps, 3);
  const report = C.buildReport(clean, now);
  assert.equal(report.math.tasks, 3);
  assert.ok(report.focus.some((text) => text.startsWith("Zahlendreher: 3×")));
  assert.ok(report.areas.some((area) => area.id === "tens" && area.tasks === 3));
});

test("shuffle preserves its input", () => {
  const input = ["A", "B", "C"];
  const result = C.shuffle(input, seeded(1));
  assert.deepEqual(input, ["A", "B", "C"]);
  assert.notEqual(input, result);
  assert.deepEqual(result.sort(), input);
});


test("grades: every game names the first level of each of its grades", () => {
  const ids = C.GRADES.map((x) => x.id);
  for (const activity of C.ACTIVITIES) {
    const steps = Object.entries(activity.grades).map(([g, from]) => [Number(g), from]);
    assert.ok(steps.length, `${activity.id} has no grade`);
    steps.sort((a, b) => a[0] - b[0]);
    // The lowest grade starts at the first level; later grades start later.
    assert.equal(steps[0][1], 0, activity.id);
    for (let i = 0; i < steps.length; i++) {
      assert.ok(ids.includes(steps[i][0]), `${activity.id}: unknown grade ${steps[i][0]}`);
      assert.ok(steps[i][1] <= C.maxLevel(activity.id), activity.id);
      if (i) assert.ok(steps[i][1] > steps[i - 1][1], activity.id);
    }
    // Level grades never go down with harder levels.
    for (let level = 1; level <= C.maxLevel(activity.id); level++)
      assert.ok(C.levelGrade(activity.id, level) >= C.levelGrade(activity.id, level - 1), activity.id);
  }
  const available = C.availableGrades().map((x) => x.id);
  // Grades 3 and 4 so far only through "Große Zahlen".
  assert.deepEqual(available, [1, 2, 3, 4]);
  assert.equal(C.levelGrade("tenfold", C.gradeStart("tenfold", 4)), 4);
  assert.equal(C.levelGrade("placetable", C.maxLevel("placetable")), 4);
  // Grade 2 offers every game, grade 1 the ones that start in grade 1.
  assert.ok(C.ACTIVITIES.every((x) => C.inGrade(x.id, 2)));
  for (const id of ["merk", "extend", "place", "chart", "calc", "times"])
    assert.equal(C.inGrade(id, 1), false, id);
  for (const grade of available) {
    for (const subject of C.subjectsFor(grade))
      for (const category of C.categoriesFor(subject.id, grade)) {
        assert.ok(category.games.length);
        assert.ok(category.games.every((id) => C.inGrade(id, grade)));
      }
    assert.ok(C.ACTIVITIES.some((x) => !x.together && C.inGrade(x.id, grade)));
  }
  assert.ok(C.ACTIVITIES.every((x) => C.inGrade(x.id, 0)));
  assert.equal(C.levelGrade("clock", 0), 1);
  assert.equal(C.levelGrade("clock", 2), 2);
  assert.equal(C.levelGrade("times", 0), 2);
  assert.equal(C.gradeStart("clock", 1), 0);
  assert.equal(C.gradeStart("clock", 2), 2);
  // A later grade without own levels starts where the game's last grade starts.
  assert.equal(C.gradeStart("clock", 3), 2);
});

test("the grade is only the entry point: progression goes beyond it and below it", () => {
  // No cap: a first grader climbs into the levels of grade 2 …
  assert.equal(C.levelGrade("bundle", C.progress("bundle", 0, true).level), 2);
  assert.equal(C.progress("clock", C.maxLevel("clock"), true).level, C.maxLevel("clock"));
  // … and a second grader who struggles steps down below the grade's start.
  const start = C.gradeStart("clock", 2);
  assert.equal(C.progress("clock", start, false, 1).level, start - 1);
  assert.equal(C.levelGrade("clock", start - 1), 1);

  const state = C.defaultState();
  assert.equal(state.settings.grade, 0);
  state.levels.type = 7;
  assert.equal(C.setGrade(state, 2), true);
  assert.equal(state.settings.grade, 2);
  // Second graders skip the beginner levels, progress above is kept.
  assert.equal(state.levels.clock, C.gradeStart("clock", 2));
  assert.equal(state.levels.times, 0);
  assert.equal(state.levels.type, 7);
  // Going back to grade 1 never lowers a level.
  assert.equal(C.setGrade(state, 1), true);
  assert.equal(state.levels.clock, C.gradeStart("clock", 2));
  assert.equal(C.setGrade(state, 5), false);
  assert.equal(C.setGrade(state, "2"), false);
  assert.equal(state.settings.grade, 1);
  const first = C.defaultState();
  C.setGrade(first, 1);
  assert.ok(C.inGrade(C.recommendedGame(first), 1));
  first.lastPlayed = Object.fromEntries(C.ACTIVITIES.map((x) => [x.id, 10]));
  first.lastPlayed.merk = 1;
  assert.notEqual(C.recommendedGame(first), "merk");
});

test("games of a higher grade open once a related game has passed the child's grade", () => {
  const state = C.defaultState();
  C.setGrade(state, 1);
  assert.ok(!C.openGames(state).includes("place"));
  assert.deepEqual(C.unlockedBy(state, "place"), []);
  // Zahlen-Blick past its grade-1 levels opens the Zahlenhaus in the same category …
  state.levels.bundle = C.gradeStart("bundle", 2);
  assert.deepEqual(C.unlockedBy(state, "place"), ["bundle"]);
  assert.ok(C.isOpen("place", 1, state));
  assert.ok(C.openGames(state).includes("place"));
  // … but not the Merkwörter of German.
  assert.ok(!C.isOpen("merk", 1, state));
  assert.ok(!C.isOpen("place", 1));
  // A category without grade-1 games opens through any game of the subject.
  assert.ok(C.isOpen("times", 1, state));
  assert.ok(C.categoriesFor("mathe", 1, state).some((x) => x.id === "times"));
  assert.ok(C.subjectsFor(1, state).length === C.subjectsFor(1).length);
  // Stepping back down does not close it again: the highest level counts.
  C.recordTask(state, { mode: "bundle", level: state.levels.bundle, startLevel: 0, firstTry: true, mistakes: 0, ms: 1000 }, 5);
  state.levels.bundle = 0;
  assert.ok(C.isOpen("place", 1, state));
  const saved = C.sanitizeState(JSON.parse(JSON.stringify(state)));
  assert.equal(saved.reached.bundle, C.gradeStart("bundle", 2));
  assert.ok(C.isOpen("place", 1, saved));
  // Older saves take the highest level from the level history.
  const old = C.sanitizeState({
    version: 2,
    settings: { grade: 1 },
    stats: { games: { syllables: { tasks: 3, ok: 3, levels: [[1, 0], [2, 5], [3, 1]] } } },
    reached: { syllables: 2, nope: 9, type: "x" },
  });
  assert.deepEqual(old.reached, { syllables: 5 });
  assert.ok(C.isOpen("merk", 1, old));
  assert.ok(C.isOpen("extend", 1, old));
});

test("the grade is stored strictly and old saves keep all games of grade 2", () => {
  assert.equal(C.sanitizeState(null).settings.grade, 0);
  const old = C.sanitizeState({ version: 2, levels: { clock: 0 } });
  assert.equal(old.settings.grade, 2);
  // Old saves keep their levels: the child already has its own progress.
  assert.equal(old.levels.clock, 0);
  assert.equal(C.sanitizeState({ version: 1, settings: { rate: 0.8 } }).settings.grade, 2);
  assert.equal(C.sanitizeState({ version: 2, settings: { grade: 1 } }).settings.grade, 1);
  assert.equal(C.sanitizeState({ version: 2, settings: { grade: 0 } }).settings.grade, 0);
  for (const grade of [5, 9, "1", null, 1.5])
    assert.equal(C.sanitizeState({ version: 2, settings: { grade } }).settings.grade, 0);
  // A first grader may store levels of grade 2.
  const ahead = C.sanitizeState({ version: 2, levels: { clock: 6 }, settings: { grade: 1 } });
  assert.equal(ahead.levels.clock, 6);
  const stats = C.sanitizeState({
    version: 2,
    stats: { grades: { 1: { tasks: 4, ok: 9 }, 2: { tasks: -1 }, 7: { tasks: 3, ok: 1 }, x: 1 } },
  }).stats.grades;
  assert.deepEqual(stats, { 1: { tasks: 4, ok: 4 } });
});

test("statistics count tasks by the grade of their level and the report shows how far the child is", () => {
  const now = Date.UTC(2026, 3, 10, 12);
  const state = C.defaultState();
  C.setGrade(state, 1);
  const task = (mode, level, firstTry = true) => ({
    mode,
    level,
    startLevel: level,
    firstTry,
    mistakes: firstTry ? 0 : 1,
    ms: 4000,
  });
  C.recordTask(state, task("clock", 0), now);
  C.recordTask(state, task("clock", 1), now);
  C.recordTask(state, task("clock", 2, false), now);
  C.recordTask(state, task("times", 0), now);
  assert.deepEqual(state.stats.grades, { 1: { tasks: 2, ok: 2 }, 2: { tasks: 2, ok: 1 } });
  state.levels.clock = 3;
  const report = C.buildReport(state, now);
  assert.equal(report.grade, "1. Klasse");
  const ids = report.games.map((x) => x.id);
  // Games of grade 1, plus a grade-2 game that was played anyway.
  assert.ok(ids.includes("times"));
  assert.ok(!ids.includes("calc"));
  assert.equal(report.games.find((x) => x.id === "clock").grade, 2);
  assert.equal(report.games.find((x) => x.id === "clock").maxLevel, C.maxLevel("clock"));
  const second = report.gradeLevels.find((x) => x.id === 2);
  assert.equal(second.tasks, 2);
  assert.equal(second.rate, 0.5);
  assert.ok(second.games.includes("Uhr lesen"));
  assert.ok(report.strengths.some((x) => x.startsWith("Schon Aufgaben der 2. Klasse") && x.includes("Uhr lesen")));
  for (const area of report.areas) assert.ok(area.progress >= 0 && area.progress <= 1, area.id);
});

test("big numbers: bundling ten makes the next place, the chart reads with zeros", () => {
  const random = seeded(11);
  const noDigits = (text, where) => assert.ok(!/\d/.test(text || ""), `${where}: ${text}`);
  for (let level = 0; level <= C.maxLevel("tenfold"); level++)
    for (let i = 0; i < 60; i++) {
      const q = C.makeQuestion("tenfold", level, null, random);
      const config = C.LEVELS.tenfold[level];
      noDigits(q.explain.speech, `tenfold/${level}`);
      if (q.kind === "count") {
        assert.ok(q.small >= config.from && q.big <= config.to && q.big > q.small);
        assert.equal(Number(q.answer), 10 ** (q.big - q.small));
      } else {
        assert.ok(q.from >= config.from && q.from + 1 <= config.to);
        const next = C.PLACES[q.from + 1];
        if (q.kind === "name") assert.equal(q.answer, next.name);
        else {
          assert.equal(Number(q.answer), next.value);
          // Typical mistakes: just one piece, a zero too many.
          assert.ok(q.choices.includes(String(C.PLACES[q.from].value)));
        }
      }
    }
  for (let level = 0; level <= C.maxLevel("placetable"); level++)
    for (let i = 0; i < 60; i++) {
      const q = C.makeQuestion("placetable", level, null, random);
      const config = C.LEVELS.placetable[level];
      noDigits(q.speech, `placetable/${level}`);
      noDigits(q.explain.speech, `placetable/${level}`);
      assert.ok(q.number >= 1 && q.number <= 1000000);
      assert.equal(Number([...q.digits].reverse().join("")), q.number);
      assert.ok(q.places >= q.digits.length && q.places === Math.max(config.places, q.digits.length));
      if (config.digits) assert.ok(config.digits.includes(q.digits.length));
      if (q.kind === "digit") assert.equal(q.answer, String(q.digits[q.at]));
      if (q.kind === "split") {
        assert.ok(q.parts.length >= 2);
        assert.equal(q.parts.reduce((a, b) => a + b, 0), q.number);
        assert.equal(q.answer, String(q.parts[q.gap]));
      }
      if (q.kind === "read" || q.kind === "compose") {
        assert.equal(q.answer, String(q.number));
        // A forgotten zero is always among the cards.
        if (String(q.number).includes("0")) assert.ok(q.choices.includes(q.zeroSlip), `${q.number}`);
      }
    }
  const q = C.makeQuestion("placetable", 6, null, seeded(3));
  assert.equal(q.shown, C.formatNumber(q.number));
});
