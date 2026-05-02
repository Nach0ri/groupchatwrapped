import type { Format, Locale } from "@/types";

const IPHONE_RE =
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\]\s/;
const ANDROID_RE =
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\s+-\s/;

export function detectFormat(text: string): Format | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 25);
  let iphoneHits = 0;
  let androidHits = 0;
  for (const line of lines) {
    if (IPHONE_RE.test(line)) iphoneHits++;
    else if (ANDROID_RE.test(line)) androidHits++;
  }
  if (iphoneHits === 0 && androidHits === 0) return null;
  return iphoneHits >= androidHits ? "iphone" : "android";
}

export function detectLocale(text: string, format: Format): Locale {
  const re = format === "iphone" ? IPHONE_RE : ANDROID_RE;
  const lines = text.split(/\r?\n/);
  let usEvidence = 0;
  let auEvidence = 0;
  let scanned = 0;
  for (const line of lines) {
    if (scanned > 80) break;
    const m = line.match(re);
    if (!m) continue;
    scanned++;
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (a > 12) auEvidence++;
    else if (b > 12) usEvidence++;
  }
  if (usEvidence > auEvidence) return "us";
  return "au";
}

export const REGEX = { IPHONE_RE, ANDROID_RE };
