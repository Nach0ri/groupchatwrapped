import type { Format, Locale, Message, ParseResult } from "@/types";
import { detectFormat, detectLocale, REGEX } from "./detectFormat";
import { isSystemMessage } from "./systemMessages";

const FULL_IPHONE_RE =
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\]\s+([^:]+):\s+([\s\S]*)$/;
const FULL_ANDROID_RE =
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\s+-\s+([^:]+):\s+([\s\S]*)$/;

function buildDate(
  d1: string,
  d2: string,
  yr: string,
  hh: string,
  mm: string,
  ss: string | undefined,
  meridian: string | undefined,
  locale: Locale,
): Date {
  let day: number;
  let month: number;
  if (locale === "us") {
    month = parseInt(d1, 10);
    day = parseInt(d2, 10);
  } else {
    day = parseInt(d1, 10);
    month = parseInt(d2, 10);
  }
  let year = parseInt(yr, 10);
  if (year < 100) year += 2000;
  let hour = parseInt(hh, 10);
  const minute = parseInt(mm, 10);
  const second = ss ? parseInt(ss, 10) : 0;
  if (meridian) {
    const m = meridian.toLowerCase();
    if (m === "pm" && hour < 12) hour += 12;
    if (m === "am" && hour === 12) hour = 0;
  }
  return new Date(year, month - 1, day, hour, minute, second);
}

export function parseChat(text: string): ParseResult {
  const format = detectFormat(text);
  if (!format) {
    return {
      messages: [],
      format: "android",
      locale: "au",
      systemFiltered: 0,
      unmatchedLines: 0,
    };
  }
  const locale = detectLocale(text, format);
  const re = format === "iphone" ? FULL_IPHONE_RE : FULL_ANDROID_RE;
  const startRe = format === "iphone" ? REGEX.IPHONE_RE : REGEX.ANDROID_RE;

  const lines = text.split(/\r?\n/);
  const messages: Message[] = [];
  let systemFiltered = 0;
  let unmatchedLines = 0;
  let current: Message | null = null;

  const finalize = () => {
    if (!current) return;
    if (isSystemMessage(current.body)) systemFiltered++;
    else messages.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/‎|‏/g, "");
    if (!line.trim()) continue;
    if (startRe.test(line)) {
      const m = line.match(re);
      if (!m) {
        unmatchedLines++;
        continue;
      }
      finalize();
      const senderRaw = format === "iphone" ? m[8] : m[7];
      const bodyRaw = format === "iphone" ? m[9] : m[8];
      const ssIdx = format === "iphone" ? m[6] : undefined;
      const meridianIdx = format === "iphone" ? m[7] : m[6];
      const ts = buildDate(
        m[1],
        m[2],
        m[3],
        m[4],
        m[5],
        ssIdx,
        meridianIdx,
        locale,
      );
      current = {
        ts,
        sender: senderRaw.trim(),
        body: bodyRaw,
      };
    } else {
      if (current) {
        current.body += "\n" + line;
      } else {
        unmatchedLines++;
      }
    }
  }
  finalize();

  return { messages, format, locale, systemFiltered, unmatchedLines };
}
