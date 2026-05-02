import type { RoleKey } from "@/types";

export const SYSTEM_PROMPT = `You are writing the verdict screen for a Spotify-Wrapped-style web app that analyses WhatsApp group chats. Output is JSON only — no preamble, no markdown, no code fences.

REGISTER
Gen Z Australian, group-chat-meme energy. Sound like the funniest person in the chat ribbing their friends. Never sound like an analyst or a copywriter.

ALLOWED slang (use sparingly, never all in one line): aura, lowkey, tweaking, no thoughts, the way, it's giving, deadass, fr, no shot, real, mid, delulu, slay, cooked, locked in.

BANNED phrases: "according to the data", "interestingly", "it appears", "in conclusion", "showcases", "demonstrates", "fascinating", "noteworthy", "the data shows", "based on", "moreover", "furthermore". Anything that smells like an essay.

RULES
- Roasts are AFFECTIONATE — friends ribbing friends, never mean.
- Each roast must reference something specific from THE PERSON'S stats AND their role (yapper / ghost / beef starter / nonchalant / unhinged). The role-roast and per-person-roast for the same person should land different angles, not repeat.
- No emoji in output unless it's the punchline. Max 1 per line.
- No targeting of protected attributes (race, gender, sexuality, religion, disability).
- No swearing harder than "damn" or "hell".
- Group verdict: 2-3 sentences, total under 280 chars.
- Each role roast: ONE line, under 60 chars. Sharp and specific to the role.
- Each per-person roast: ONE line, under 60 chars. Specific to that person's overall stats.

ROLE GUIDANCE
- yapper: lean into volume / dominance of conversation
- ghost: lean into reply latency, longest gap, message count
- beef_starter: they sent a message right before a long silence — frame it as them killing the vibe / reading the room wrong / ending the convo accidentally
- nonchalant: their lowercase, low-emoji, no-laughs energy. They're the chillest one in the chat.
- unhinged: their swears + ALL CAPS rants. Frame affectionately, like "feral but lovable"

JSON SCHEMA
{
  "group_verdict": "<string>",
  "per_person_roasts": {
    "<exact name from stats>": "<string>"
  },
  "role_roasts": {
    "yapper": "<string>",
    "ghost": "<string>",
    "beef_starter": "<string>" (omit key if no beef_starter provided),
    "nonchalant": "<string>" (omit key if no nonchalant provided),
    "unhinged": "<string>" (omit key if no unhinged provided)
  }
}

Output the JSON object only. Begin with { and end with }.`;

export interface PromptStats {
  group: {
    total: number;
    daysActive: number;
    peakHour: number;
  };
  perPerson: {
    name: string;
    count: number;
    percent: number;
    latencyP50Min: number | null;
    topEmojis: string[];
    laughs: number;
    longestGhostMin: number | null;
    beefCount: number;
    msgLenAvgChars: number;
    swearCount: number;
    allCapsCount: number;
    lowercaseRatio: number;
  }[];
  roles: Partial<Record<RoleKey, { name: string; note: string }>>;
}

export function buildUserPrompt(stats: PromptStats): string {
  const lines: string[] = [];
  lines.push(
    `GROUP: ${stats.group.total} messages over ${stats.group.daysActive} days. Peak hour: ${stats.group.peakHour}h.`,
  );
  lines.push("");
  lines.push("PER PERSON:");
  for (const p of stats.perPerson) {
    const lat =
      p.latencyP50Min === null
        ? "no replies"
        : p.latencyP50Min < 1
          ? `${Math.round(p.latencyP50Min * 60)}s replies`
          : p.latencyP50Min < 60
            ? `${p.latencyP50Min.toFixed(0)}min replies`
            : `${(p.latencyP50Min / 60).toFixed(1)}h replies`;
    const emojis = p.topEmojis.length ? p.topEmojis.join("") : "no emojis";
    const ghost =
      p.longestGhostMin === null
        ? ""
        : p.longestGhostMin > 60
          ? `, ghosted ${(p.longestGhostMin / 60).toFixed(1)}h once`
          : "";
    const extra: string[] = [];
    if (p.swearCount > 0) extra.push(`${p.swearCount} swears`);
    if (p.allCapsCount > 0) extra.push(`${p.allCapsCount} ALL CAPS rants`);
    if (p.lowercaseRatio >= 0.9) extra.push(`${(p.lowercaseRatio * 100).toFixed(0)}% all-lowercase`);
    if (p.beefCount > 0) extra.push(`killed convo ${p.beefCount} times`);
    lines.push(
      `- ${p.name}: ${p.count} msgs (${p.percent.toFixed(0)}%), ${lat}, top emojis ${emojis}, ${p.laughs} laughs, avg ${Math.round(p.msgLenAvgChars)} chars${ghost}${extra.length ? `. ${extra.join(", ")}` : ""}`,
    );
  }
  lines.push("");
  lines.push("ROLES (write a role_roast for each provided):");
  for (const [role, info] of Object.entries(stats.roles)) {
    if (!info) continue;
    lines.push(`- ${role}: ${info.name} — ${info.note}`);
  }
  lines.push("");
  lines.push("Write the verdict JSON now.");
  return lines.join("\n");
}

export function fallbackVerdict(
  names: string[],
  roles: Partial<Record<RoleKey, { name: string }>> = {},
): {
  group_verdict: string;
  per_person_roasts: Record<string, string>;
  role_roasts: Partial<Record<RoleKey, string>>;
} {
  const fallbacks = [
    "lives in the chat rent free",
    "would die without this groupchat",
    "the silent observer energy",
    "always typing, never sending",
    "perpetually 5 minutes late",
  ];
  const roasts: Record<string, string> = {};
  for (let i = 0; i < names.length; i++) {
    roasts[names[i]] = fallbacks[i % fallbacks.length];
  }
  const roleFallbacks: Partial<Record<RoleKey, string>> = {
    yapper: "running the entire show solo",
    ghost: "checks in every solar eclipse",
    beef_starter: "drops mic, kills convo, repeats",
    nonchalant: "absolutely unbothered, mid king",
    unhinged: "feral but the chat needs it",
  };
  const role_roasts: Partial<Record<RoleKey, string>> = {};
  for (const key of Object.keys(roles) as RoleKey[]) {
    if (roleFallbacks[key]) role_roasts[key] = roleFallbacks[key];
  }
  return {
    group_verdict:
      "your group chat is exactly what it needs to be — chaos, laughs, and one person who never replies on time.",
    per_person_roasts: roasts,
    role_roasts,
  };
}
