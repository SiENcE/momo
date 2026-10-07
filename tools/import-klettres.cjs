// Imports the German sound (Laut) recordings of KDE's KLettres into
// audio/laute/<letter>.wav. They are human recordings of sounds ("mmm",
// "sss"), not letter names. License: GPL-2.0-or-later (see audio/laute/QUELLE.md).
//
//   node tools/import-klettres.cjs
//
// Ogg is converted to WAV because Safari (iPad) cannot play Ogg Vorbis.
// Silence is trimmed and loudness evened out so that hissing sounds (f, s)
// are as audible as vowels. Decoding uses Chromium from the Playwright dev
// dependency. Existing files are overwritten; own recordings go in afterwards.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const SOURCE =
  "https://invent.kde.org/education/klettres/-/raw/master/sounds/de/alpha/";
const LICENSE_URL =
  "https://invent.kde.org/education/klettres/-/raw/master/LICENSES/GPL-2.0-or-later.txt";
const TARGET = path.resolve(__dirname, "../audio/laute");
// KLettres has umlauts as ae/oe/ue and ß as sz.
const LETTERS = [..."abcdefghijklmnopqrstuvwxyz", "ae", "oe", "ue", "sz"];
const RATE = 22050;
const TARGET_RMS = 0.14;
const PEAK_LIMIT = 0.86;
const PAD_SECONDS = 0.04;
const FADE_SECONDS = 0.015;

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function polish(samples) {
  const frame = Math.floor(RATE / 100);
  const energy = [];
  for (let i = 0; i + frame <= samples.length; i += frame) {
    let sum = 0;
    for (let j = i; j < i + frame; j++) sum += samples[j] ** 2;
    energy.push(Math.sqrt(sum / frame));
  }
  const loudest = Math.max(...energy);
  const active = energy.map((value) => value > loudest * 0.06);
  const pad = Math.round(PAD_SECONDS * RATE);
  const start = Math.max(0, active.indexOf(true) * frame - pad);
  const end = Math.min(
    samples.length,
    (active.lastIndexOf(true) + 1) * frame + pad,
  );
  const sound = Float64Array.from(samples.slice(start, end));
  let sum = 0;
  let peak = 0;
  for (const value of sound) {
    sum += value ** 2;
    peak = Math.max(peak, Math.abs(value));
  }
  const gain = Math.min(
    TARGET_RMS / Math.sqrt(sum / sound.length),
    PEAK_LIMIT / peak,
  );
  const fade = Math.round(FADE_SECONDS * RATE);
  for (let i = 0; i < sound.length; i++)
    sound[i] *= gain * Math.min(1, i / fade, (sound.length - 1 - i) / fade);
  return sound;
}

function wav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVEfmt ", 8, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) =>
    buffer.writeInt16LE(
      Math.max(-32768, Math.min(32767, Math.round(value * 32767))),
      44 + i * 2,
    ),
  );
  return buffer;
}

(async () => {
  fs.mkdirSync(TARGET, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const letter of LETTERS) {
    const ogg = await download(`${SOURCE}${letter}.ogg`);
    const samples = await page.evaluate(
      async ({ base64, rate }) => {
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        // decodeAudioData resamples to the context's rate.
        const context = new OfflineAudioContext(1, rate, rate);
        const buffer = await context.decodeAudioData(bytes.buffer);
        return Array.from(buffer.getChannelData(0));
      },
      { base64: ogg.toString("base64"), rate: RATE },
    );
    const sound = polish(samples);
    fs.writeFileSync(path.join(TARGET, `${letter}.wav`), wav(sound));
    console.log(
      `${letter.padEnd(3)} ${String(Math.round((sound.length / RATE) * 1000)).padStart(4)} ms`,
    );
  }
  await browser.close();
  fs.writeFileSync(
    path.join(TARGET, "GPL-2.0-or-later.txt"),
    await download(LICENSE_URL),
  );
  console.log("Fertig:", TARGET);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
