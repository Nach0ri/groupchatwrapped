export type Format = "iphone" | "android";
export type Locale = "au" | "us";

export interface Message {
  ts: Date;
  sender: string;
  body: string;
}

export interface ParseResult {
  messages: Message[];
  format: Format;
  locale: Locale;
  systemFiltered: number;
  unmatchedLines: number;
}

export interface PerPersonStats {
  name: string;
  count: number;
  percent: number;
  latencyP50Sec: number | null;
  latencyP90Sec: number | null;
  latencyMaxSec: number | null;
  topEmojis: string[];
  totalEmojis: number;
  laughs: number;
  msgLenAvgChars: number;
  hourDist: number[];
  dowDist: number[];
  convStarters: number;
  longestGhostSec: number | null;
  beefCount: number;
}

export interface GroupStats {
  total: number;
  daysActive: number;
  startISO: string;
  endISO: string;
  peakDay: { dateISO: string; count: number };
  peakHour: { hour: number; count: number };
  topNgrams: { phrase: string; count: number }[];
}

export interface ComputedStats {
  perPerson: PerPersonStats[];
  group: GroupStats;
  format: Format;
  locale: Locale;
}

export interface VerdictResponse {
  group_verdict: string;
  per_person_roasts: Record<string, string>;
}
