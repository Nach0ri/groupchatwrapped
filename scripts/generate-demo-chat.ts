import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { computeStats } from "../lib/stats/compute";

const root = process.cwd();
try {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.+?)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const SYSTEM_PROMPT = `You are generating a realistic WhatsApp group chat transcript for a product demo. The chat is between 5 long-distance friends in their early 20s who met at university and scattered after graduation. Output ONLY the chat lines in the exact iPhone WhatsApp export format. No preamble, no explanation, no system messages.

Format every line as:
[DD/MM/YY, H:MM:SS am/pm] Name: message body

Use 12-hour times with am/pm lowercase. Use exact sender names: Priya, Maya, Sam, Daniel, Yuki. One message per line. Output begins directly with the first [03/05/26, ...] line.`;

const USER_PROMPT = `Generate ~400 WhatsApp messages spanning 03/05/26 to 23/05/26 (21 days).

THE CAST (and their voices):

Priya — Perth (UTC+8). 23, recent grad working in marketing. The org-hub of the chat. ~45% of all messages (~180 msgs). Replies fast (1-3min median). Lots of laughs, lots of emojis (🥹 😭 🤣 ✨ 🫶). Lowercase by default. Plans things, sends voice notes, asks questions. Active mostly 7am-11pm Perth time.

Maya — Melbourne (UTC+10). 23, doing a thesis. Chaotic. ~25% of messages (~100). Vents at 3am Melbourne time when stressed (write 6-10 messages timestamped between 12am and 4am). Uses ALL CAPS when emotional (write 8-12 ALL-CAPS messages, things like "WHY IS MY ADVISOR LIKE THIS" or "I CANNOT"). Some mild swears (5-8 messages: shit, damn, hell, bullshit). Heavy emoji user. Says "the way" a lot (5+ times).

Sam — London (UTC+1). 23, working in finance. Just got dumped Day 1, processing for ~2 weeks then meets someone new. ~15% of messages (~60). Active in AU mornings (London evenings). Uses lots of "lol", "lmao", "haha". Self-deprecating. Says "the way" too.

Daniel — Sydney (UTC+10). 24, software engineer. ~10% of messages (~40). DEADPAN. ALL lowercase, never uses emoji, never uses exclamation marks. Replies with one or two words: "lol", "yeah", "real", "true", "mid", "no", "that's wild". His messages should appear right BEFORE convos go quiet for 6+ hours (8-10 of those vibe-kill moments). He's not mean, just terse.

Yuki — Tokyo (UTC+9). 23, in grad school. ~5% of messages (~20). Drops in once a day max, usually polite check-ins or quick reactions. Slightly more formal than the others. Active mostly Tokyo evenings (Australia/UK awkward times).

ARC OVER 21 DAYS:

Days 1-3 (3-5 May): Sam reveals breakup. Group rallies, mostly Priya organizing emotional support. Maya makes inappropriate jokes. Daniel says one thing then disappears.

Days 4-8 (6-10 May): Group plans Priya's birthday weekend in Melbourne (she's flying over). Logistics chaos. Restaurant booking debates. Whether Sam will fly in.

Days 9-14 (11-16 May): Scattered chatter. Maya has thesis breakdowns at 3am. Priya birthday weekend recap (with photos referenced via "<Media omitted>"). Sam mentions a Tinder match.

Days 15-18 (17-20 May): Sam meets Alex (the rebound). Group teases mercilessly. Daniel says "mid" when shown Alex's photo. Maya sends 11pm messages of escalating concern.

Days 19-21 (21-23 May): Planning a 5-way video call. Time zone chaos. Yuki finally proposes a workable time. Group makes it happen Day 21, multiple "<Media omitted>" referencing screenshots.

VOICE & STYLE NOTES:
- Lowercase mostly. Maya uses ALL CAPS when emotional.
- Gen Z slang sparingly: "fr", "deadass", "no thoughts", "lowkey", "the way", "tweaking", "delulu", "no shot", "real", "mid".
- Common abbreviations: rn, ngl, tbh, imo, omw, wdym, idk
- Inside-joke phrase: "the way" — must appear 15-25 times across all senders
- Other phrases the group repeats: "no thoughts head empty" (4-6 times), "it's giving" (3-5 times)
- About 15-20 messages should be "<Media omitted>" (photos shared)
- Some emotional moments, some random bits, real chat-feel
- Realistic timestamps: each person's activity should match their timezone
- Don't include anything cringe-corporate. NO "haha just got back from the gym".

CRITICAL OUTPUT RULES:
1. Output ONLY chat lines. No preamble like "Here is the chat:" or "Sure, I'll generate".
2. First line must start with "[03/05/26".
3. Every line is a complete message with timestamp.
4. Multi-line messages are okay but RARE — wrap them on separate lines WITHOUT a timestamp on the wrapped line.
5. Sender names: exactly Priya, Maya, Sam, Daniel, Yuki.
6. Must read like a real chat. Don't write narrator descriptions.
7. Aim for ~400 messages total.

Begin now:`;

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  console.log("calling Opus 4.7 to generate demo chat (streaming)...");
  const client = new Anthropic({ apiKey });
  let raw = "";
  let chunks = 0;
  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: USER_PROMPT }],
  });
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      raw += event.delta.text;
      chunks++;
      if (chunks % 30 === 0) process.stdout.write(".");
    }
  }
  process.stdout.write("\n");

  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  console.log(`got ${lines.length} non-empty lines, ${raw.length} chars`);

  const valid = lines.filter((l) => /^\[\d{1,2}\/\d{1,2}\/\d{2,4},/.test(l));
  console.log(`${valid.length} lines match WhatsApp iPhone format`);

  if (valid.length < 200) {
    console.error("not enough valid lines, aborting");
    console.log("raw output preview:");
    console.log(raw.slice(0, 800));
    process.exit(1);
  }

  const e2eHeader = `[03/05/26, 6:59:00 am] Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.`;
  const finalText = e2eHeader + "\n" + valid.join("\n") + "\n";

  const outPath = join(root, "public", "samples", "sample-chat.txt");
  writeFileSync(outPath, finalText, "utf8");
  console.log(`✓ wrote ${valid.length + 1} lines to ${outPath}`);

  console.log("\nrunning stats compute on generated chat...");
  const stats = computeStats(finalText);
  console.log(`format=${stats.format} locale=${stats.locale}`);
  console.log(`total=${stats.group.total} days=${stats.group.daysActive}`);
  console.log("per-person:");
  for (const p of stats.perPerson) {
    console.log(
      `  ${p.name.padEnd(7)} ${String(p.count).padStart(3)} msgs  ${p.percent.toFixed(0).padStart(2)}%  ` +
        `lat50=${p.latencyP50Sec ? Math.round(p.latencyP50Sec / 60) + "min" : "n/a"}  ` +
        `swears=${p.swearCount}  caps=${p.allCapsCount}  ` +
        `lower=${(p.lowercaseMsgRatio * 100).toFixed(0)}%  ` +
        `beef=${p.beefCount}`,
    );
  }
  console.log(
    "\ntop n-grams:",
    stats.group.topNgrams
      .slice(0, 8)
      .map((n) => `"${n.phrase}"×${n.count}`)
      .join(", "),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
