import type { GroupStats, Message } from "@/types";

const STOPWORDS = new Set([
  "a","an","and","or","but","of","in","on","at","to","for","with","by","from",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","because","while",
  "lol","lmao","haha","hahaha","ya","ok","okay","yeah","yo",
]);

function tokenize(body: string): string[] {
  return body
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeGroup(messages: Message[]): GroupStats {
  if (!messages.length) {
    const now = new Date();
    return {
      total: 0,
      daysActive: 0,
      startISO: now.toISOString(),
      endISO: now.toISOString(),
      peakDay: { dateISO: isoDate(now), count: 0 },
      peakHour: { hour: 0, count: 0 },
      topNgrams: [],
    };
  }

  const start = messages[0].ts;
  const end = messages[messages.length - 1].ts;
  const daysActive = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000),
  );

  const byDay = new Map<string, number>();
  const byHour = new Array(24).fill(0);
  const ngramCounts = new Map<string, number>();

  for (const m of messages) {
    const dKey = isoDate(m.ts);
    byDay.set(dKey, (byDay.get(dKey) ?? 0) + 1);
    byHour[m.ts.getHours()]++;
    const tokens = tokenize(m.body);
    for (let n = 2; n <= 4; n++) {
      for (let i = 0; i + n <= tokens.length; i++) {
        const phrase = tokens.slice(i, i + n).join(" ");
        ngramCounts.set(phrase, (ngramCounts.get(phrase) ?? 0) + 1);
      }
    }
  }

  let peakDay: { dateISO: string; count: number } = {
    dateISO: isoDate(start),
    count: 0,
  };
  for (const [dateISO, count] of byDay.entries()) {
    if (count > peakDay.count) peakDay = { dateISO, count };
  }

  let peakHour = { hour: 0, count: 0 };
  for (let h = 0; h < 24; h++) {
    if (byHour[h] > peakHour.count) peakHour = { hour: h, count: byHour[h] };
  }

  const topNgrams = [...ngramCounts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({ phrase, count }));

  return {
    total: messages.length,
    daysActive,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    peakDay,
    peakHour,
    topNgrams,
  };
}
