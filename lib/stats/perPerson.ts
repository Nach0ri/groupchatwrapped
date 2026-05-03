import type { Message, PerPersonStats } from "@/types";

const EMOJI_RE = /\p{Extended_Pictographic}/gu;
const LAUGH_TOKENS = [
  /\bhaha+\b/gi,
  /\blo+l+\b/gi,
  /\blma+o+\b/gi,
  /\brofl\b/gi,
  /\bahaha+\b/gi,
];
const LAUGH_EMOJIS = ["😂", "🤣", "💀"];

const SWEAR_RE =
  /\b(fuck(?:ing|ed|er)?|shit(?:ty|ting)?|bitch(?:es|ing)?|asshole|damn|dammit|bastard|bullshit|motherfucker|cunt|piss(?:ed)?|dick(?:head)?|prick|wanker|crap|hell|wtf|stfu|fck|sht)\b/gi;
const ALL_CAPS_WORD_RE = /[A-Z]{5,}/;
const LETTER_RE = /[A-Za-z]/;
const TWO_HOURS = 2 * 60 * 60;
const SIX_HOURS = 6 * 60 * 60;

function quantile(sorted: number[], q: number): number | null {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}

function countLaughs(body: string): number {
  let count = 0;
  for (const re of LAUGH_TOKENS) {
    const m = body.match(re);
    if (m) count += m.length;
  }
  for (const e of LAUGH_EMOJIS) {
    let i = 0;
    while ((i = body.indexOf(e, i)) !== -1) {
      count++;
      i += e.length;
    }
  }
  return count;
}

function isAllLowercase(body: string): boolean {
  if (!LETTER_RE.test(body)) return false;
  for (const ch of body) {
    if (ch >= "A" && ch <= "Z") return false;
  }
  return true;
}

export function computePerPerson(messages: Message[]): PerPersonStats[] {
  if (!messages.length) return [];

  const bySender = new Map<string, Message[]>();
  for (const m of messages) {
    if (!bySender.has(m.sender)) bySender.set(m.sender, []);
    bySender.get(m.sender)!.push(m);
  }

  const total = messages.length;
  const result: PerPersonStats[] = [];

  for (const [name, msgs] of bySender.entries()) {
    const count = msgs.length;
    const percent = (count / total) * 100;

    const latencies: number[] = [];
    let convStarters = 0;
    let beefCount = 0;
    let longestGhost: number | null = null;

    let totalChars = 0;
    let totalEmojis = 0;
    const emojiCounts = new Map<string, number>();
    let laughs = 0;
    let swearCount = 0;
    let allCapsCount = 0;
    let lowercaseMsgs = 0;
    let exclaimCount = 0;
    const hourDist = new Array(24).fill(0);
    const dowDist = new Array(7).fill(0);

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.sender !== name) continue;

      totalChars += m.body.length;
      const emojis = m.body.match(EMOJI_RE);
      if (emojis) {
        totalEmojis += emojis.length;
        for (const e of emojis) emojiCounts.set(e, (emojiCounts.get(e) ?? 0) + 1);
      }
      laughs += countLaughs(m.body);

      const swears = m.body.match(SWEAR_RE);
      if (swears) swearCount += swears.length;

      if (m.body.length > 12 && ALL_CAPS_WORD_RE.test(m.body)) {
        const letters = m.body.match(/[A-Za-z]/g) ?? [];
        const upper = m.body.match(/[A-Z]/g) ?? [];
        if (letters.length >= 10 && upper.length / letters.length >= 0.65) {
          allCapsCount++;
        }
      }

      if (isAllLowercase(m.body)) lowercaseMsgs++;

      let bangs = 0;
      for (const ch of m.body) if (ch === "!") bangs++;
      exclaimCount += bangs;

      const h = m.ts.getHours();
      const dow = (m.ts.getDay() + 6) % 7;
      hourDist[h]++;
      dowDist[dow]++;

      const prev = messages[i - 1];
      if (prev && prev.sender !== name) {
        const dt = (m.ts.getTime() - prev.ts.getTime()) / 1000;
        if (dt >= 0 && dt < 24 * 60 * 60) latencies.push(dt);
        if (dt > TWO_HOURS) convStarters++;
      } else if (!prev) {
        convStarters++;
      }

      const next = messages[i + 1];
      if (next) {
        const gap = (next.ts.getTime() - m.ts.getTime()) / 1000;
        if (next.sender !== name) {
          if (longestGhost === null || gap > longestGhost) longestGhost = gap;
        }
        if (gap > SIX_HOURS && next.sender !== name) beefCount++;
      }
    }

    latencies.sort((a, b) => a - b);
    const topEmojis = [...emojiCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([e]) => e);

    result.push({
      name,
      count,
      percent,
      latencyP50Sec: quantile(latencies, 0.5),
      latencyP90Sec: quantile(latencies, 0.9),
      latencyMaxSec: latencies.length ? latencies[latencies.length - 1] : null,
      topEmojis,
      totalEmojis,
      laughs,
      msgLenAvgChars: totalChars / count,
      hourDist,
      dowDist,
      convStarters,
      longestGhostSec: longestGhost,
      beefCount,
      swearCount,
      allCapsCount,
      lowercaseMsgRatio: lowercaseMsgs / count,
      exclaimCount,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}
