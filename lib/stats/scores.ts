import type { GroupStats, PerPersonStats } from "@/types";

const MIN_MSGS_FOR_VOTE = 5;
const MIN_PERCENT_FOR_VIBE_AWARD = 10;

function eligible(perPerson: PerPersonStats[]): PerPersonStats[] {
  return perPerson.filter((p) => p.count >= MIN_MSGS_FOR_VOTE);
}

function vibeEligible(perPerson: PerPersonStats[]): PerPersonStats[] {
  return perPerson.filter(
    (p) => p.count >= MIN_MSGS_FOR_VOTE && p.percent >= MIN_PERCENT_FOR_VIBE_AWARD,
  );
}

export function pickYapper(perPerson: PerPersonStats[]): PerPersonStats {
  return perPerson[0];
}

export function pickGhost(
  perPerson: PerPersonStats[],
): PerPersonStats | null {
  const candidates = perPerson.filter(
    (p) => p.count >= 3 && p.latencyP50Sec !== null,
  );
  if (!candidates.length) return null;
  return [...candidates].sort(
    (a, b) => (b.latencyP50Sec ?? 0) - (a.latencyP50Sec ?? 0),
  )[0];
}

export function pickBeefStarter(
  perPerson: PerPersonStats[],
): PerPersonStats | null {
  const candidates = eligible(perPerson).filter((p) => p.beefCount > 0);
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => b.beefCount - a.beefCount)[0];
}

interface ScoredPerson {
  person: PerPersonStats;
  score: number;
}

export function pickNonchalant(
  perPerson: PerPersonStats[],
): ScoredPerson | null {
  const yapper = pickYapper(perPerson);
  const ghost = pickGhost(perPerson);
  const candidates = perPerson.filter(
    (p) =>
      p.count >= 15 &&
      p.name !== yapper.name &&
      (!ghost || p.name !== ghost.name),
  );
  if (!candidates.length) return null;
  const scored = candidates
    .map((p) => {
      const emojiPerMsg = p.totalEmojis / p.count;
      const laughPerMsg = p.laughs / p.count;
      const exclaimPerMsg = p.exclaimCount / p.count;
      const noEmojiBonus = Math.max(0, 1 - emojiPerMsg * 4);
      const noLaughBonus = Math.max(0, 1 - laughPerMsg * 4);
      const noBangBonus = Math.max(0, 1 - exclaimPerMsg * 2);
      const lowerBonus = p.lowercaseMsgRatio;
      const score =
        noEmojiBonus * 1.2 +
        noLaughBonus * 1.0 +
        noBangBonus * 0.6 +
        lowerBonus * 0.8;
      return { person: p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0];
}

export function pickUnhinged(
  perPerson: PerPersonStats[],
): ScoredPerson | null {
  const yapper = pickYapper(perPerson);
  const candidates = vibeEligible(perPerson).filter(
    (p) => p.name !== yapper.name && p.swearCount + p.allCapsCount > 0,
  );
  if (!candidates.length) return null;
  const scored = candidates
    .map((p) => ({
      person: p,
      score: p.swearCount * 4 + p.allCapsCount * 1 + p.exclaimCount * 0.05,
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0];
}

export function pickPhraseOfYear(
  group: GroupStats,
): { phrases: { phrase: string; count: number }[]; render: boolean } {
  const top = group.topNgrams;
  if (!top.length) return { phrases: [], render: false };
  const leader = top[0];
  if (leader.count < 5) return { phrases: [], render: false };
  const second = top[1]?.count ?? 0;
  const dominantRatio = second === 0 ? Infinity : leader.count / second;

  if (dominantRatio >= 2.5) {
    return { phrases: [leader], render: true };
  }
  if (dominantRatio >= 1.5) {
    const picks = top.filter((p) => p.count >= leader.count * 0.7).slice(0, 3);
    return { phrases: picks, render: true };
  }
  if (leader.count >= 8) {
    const picks = top.filter((p) => p.count >= leader.count * 0.6).slice(0, 3);
    return { phrases: picks, render: true };
  }
  return { phrases: [], render: false };
}
