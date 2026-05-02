import type { Format } from "@/types";

interface Persona {
  name: string;
  weight: number;
  msgLengthRange: [number, number];
  emojiRate: number;
  laughRate: number;
  replySpeedSec: [number, number];
  ghostingChance: number;
}

const SLANG = [
  "yo",
  "lol",
  "bro",
  "no way",
  "lmaoooo",
  "stop",
  "the way",
  "lowkey",
  "no thoughts",
  "deadass",
  "wait",
  "nah",
  "fr",
  "bet",
  "ok bet",
  "real",
  "literally",
  "i'm screaming",
  "pls",
  "tweaking",
  "aura",
  "mid",
];

const EMOJIS = ["😂", "💀", "🥹", "🙏", "🔥", "✨", "😭", "👀", "🤡", "😩", "🫶", "🥲", "🤣"];

const FILLER = [
  "anyone wanna grab food",
  "i can't with this lecture",
  "where r u guys rn",
  "did u see that",
  "i'll be there in 5",
  "nooo i missed it",
  "this song is so bad",
  "i need a coffee",
  "what time again",
  "running late",
  "no signal sorry",
  "haha bro chill",
  "wait that's actually wild",
  "ok last one promise",
  "did u finish the assignment",
  "i'm done for tonight",
  "ok goodnight team",
  "y'all up?",
];

const PERSONAS: Persona[] = [
  {
    name: "Mia",
    weight: 0.45,
    msgLengthRange: [4, 22],
    emojiRate: 0.55,
    laughRate: 0.4,
    replySpeedSec: [10, 240],
    ghostingChance: 0.05,
  },
  {
    name: "Jay",
    weight: 0.05,
    msgLengthRange: [2, 10],
    emojiRate: 0.05,
    laughRate: 0.05,
    replySpeedSec: [600, 7200],
    ghostingChance: 0.4,
  },
  {
    name: "Ash",
    weight: 0.3,
    msgLengthRange: [3, 18],
    emojiRate: 0.3,
    laughRate: 0.25,
    replySpeedSec: [30, 1200],
    ghostingChance: 0.15,
  },
  {
    name: "Riley",
    weight: 0.2,
    msgLengthRange: [3, 15],
    emojiRate: 0.4,
    laughRate: 0.3,
    replySpeedSec: [60, 1800],
    ghostingChance: 0.1,
  },
];

function pickPersona(rng: () => number): Persona {
  const r = rng();
  let acc = 0;
  for (const p of PERSONAS) {
    acc += p.weight;
    if (r <= acc) return p;
  }
  return PERSONAS[PERSONAS.length - 1];
}

function makeSeededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickFrom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generateBody(persona: Persona, rng: () => number): string {
  const wordCount = randInt(rng, persona.msgLengthRange[0], persona.msgLengthRange[1]);
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    if (rng() < 0.25) words.push(pickFrom(rng, SLANG));
    else words.push(pickFrom(rng, FILLER).split(" ")[randInt(rng, 0, 2)] ?? "lol");
  }
  let body = words.join(" ");
  if (rng() < persona.laughRate) {
    const laugh = pickFrom(rng, ["haha", "lmao", "lolll", "hahahah", "omg", "i'm dying"]);
    body += " " + laugh;
  }
  if (rng() < persona.emojiRate) {
    const count = randInt(rng, 1, 3);
    for (let i = 0; i < count; i++) body += pickFrom(rng, EMOJIS);
  }
  return body;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatLine(format: Format, ts: Date, sender: string, body: string): string {
  const dd = pad2(ts.getDate());
  const mm = pad2(ts.getMonth() + 1);
  const yy = pad2(ts.getFullYear() % 100);
  let h = ts.getHours();
  const meridian = h >= 12 ? "pm" : "am";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const min = pad2(ts.getMinutes());
  const sec = pad2(ts.getSeconds());
  if (format === "iphone") {
    return `[${dd}/${mm}/${yy}, ${h}:${min}:${sec} ${meridian}] ${sender}: ${body}`;
  }
  return `${dd}/${mm}/${yy}, ${h}:${min} ${meridian} - ${sender}: ${body}`;
}

interface SynthOptions {
  format?: Format;
  count?: number;
  seed?: number;
  startDate?: Date;
  spanDays?: number;
  includeSystemMessages?: boolean;
  groupName?: string;
}

export function generateSyntheticChat(opts: SynthOptions = {}): string {
  const format: Format = opts.format ?? "iphone";
  const count = opts.count ?? 240;
  const rng = makeSeededRng(opts.seed ?? 42);
  const span = opts.spanDays ?? 30;
  const start = opts.startDate ?? new Date(2026, 3, 1, 9, 0, 0);
  const groupName = opts.groupName ?? "Hack Squad";
  const includeSys = opts.includeSystemMessages ?? true;

  const lines: string[] = [];

  if (includeSys) {
    const t0 = new Date(start.getTime() - 60_000);
    lines.push(
      formatLine(
        format,
        t0,
        "",
        "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.",
      ).replace(/^\[.*?\] : /, (s) => s.replace(": ", "")) ,
    );
    lines.push(
      formatLine(format, t0, "Mia", `created group "${groupName}"`).replace(
        ": ",
        " ",
      ),
    );
    lines.push(formatLine(format, t0, "Mia", "added Jay"));
    lines.push(formatLine(format, t0, "Mia", "added Ash"));
    lines.push(formatLine(format, t0, "Mia", "added Riley"));
  }

  let cursor = start.getTime();
  const endTime = start.getTime() + span * 86_400_000;
  let lastPersona: Persona | null = null;

  for (let i = 0; i < count; i++) {
    const persona = pickPersona(rng);
    const gapSec =
      lastPersona && lastPersona.name === persona.name
        ? randInt(rng, 5, 90)
        : randInt(rng, persona.replySpeedSec[0], persona.replySpeedSec[1]);
    cursor += gapSec * 1000;
    if (cursor > endTime) cursor = endTime - randInt(rng, 60_000, 600_000);
    const ts = new Date(cursor);
    const body = generateBody(persona, rng);
    lines.push(formatLine(format, ts, persona.name, body));
    lastPersona = persona;
    if (includeSys && rng() < 0.02) {
      const mediaTs = new Date(cursor + 1000);
      lines.push(formatLine(format, mediaTs, persona.name, "<Media omitted>"));
    }
  }

  return lines.join("\n") + "\n";
}
