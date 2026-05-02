import type { ComputedStats } from "@/types";
import { parseChat } from "@/lib/parser/parseChat";
import { computePerPerson } from "./perPerson";
import { computeGroup } from "./group";

export function computeStats(text: string): ComputedStats & {
  systemFiltered: number;
  unmatchedLines: number;
} {
  const parsed = parseChat(text);
  const perPerson = computePerPerson(parsed.messages);
  const group = computeGroup(parsed.messages);
  return {
    perPerson,
    group,
    format: parsed.format,
    locale: parsed.locale,
    systemFiltered: parsed.systemFiltered,
    unmatchedLines: parsed.unmatchedLines,
  };
}
