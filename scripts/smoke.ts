import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateSyntheticChat } from "../lib/parser/synthetic";
import { computeStats } from "../lib/stats/compute";

function fmtSec(s: number | null): string {
  if (s === null) return "n/a";
  if (s < 60) return `${s.toFixed(0)}s`;
  if (s < 3600) return `${(s / 60).toFixed(1)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

function header(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));
}

function runOne(label: string, format: "iphone" | "android", seed: number) {
  header(`SMOKE: ${label}`);
  const text = generateSyntheticChat({
    format,
    count: 240,
    seed,
    spanDays: 30,
    includeSystemMessages: true,
  });
  const lines = text.split("\n").filter(Boolean).length;
  console.log(`generated ${lines} lines (${text.length} chars)`);

  const stats = computeStats(text);

  console.log(
    `\nformat=${stats.format} locale=${stats.locale} ` +
      `systemFiltered=${stats.systemFiltered} unmatched=${stats.unmatchedLines}`,
  );
  console.log(
    `group: total=${stats.group.total} days=${stats.group.daysActive} ` +
      `peak=${stats.group.peakDay.dateISO}@${stats.group.peakDay.count} ` +
      `hour=${stats.group.peakHour.hour}h@${stats.group.peakHour.count}`,
  );

  console.log("\nper-person:");
  for (const p of stats.perPerson) {
    console.log(
      `  ${p.name.padEnd(7)} count=${String(p.count).padEnd(4)} ` +
        `${p.percent.toFixed(1)}% ` +
        `lat50=${fmtSec(p.latencyP50Sec).padEnd(6)} ` +
        `lat90=${fmtSec(p.latencyP90Sec).padEnd(6)} ` +
        `top=${p.topEmojis.join("") || "-"} ` +
        `laughs=${p.laughs} ` +
        `len=${p.msgLenAvgChars.toFixed(0)}c ` +
        `ghost=${fmtSec(p.longestGhostSec)} ` +
        `beef=${p.beefCount} ` +
        `starters=${p.convStarters}`,
    );
  }

  console.log("\ntop n-grams:");
  for (const ng of stats.group.topNgrams) {
    console.log(`  "${ng.phrase}" × ${ng.count}`);
  }

  // assertions
  const senders = new Set(stats.perPerson.map((p) => p.name));
  const expected = new Set(["Mia", "Jay", "Ash", "Riley"]);
  for (const e of expected) {
    if (!senders.has(e)) throw new Error(`missing sender: ${e}`);
  }
  if (stats.format !== format) {
    throw new Error(`format mismatch: got ${stats.format}, expected ${format}`);
  }
  if (stats.systemFiltered === 0) {
    throw new Error("expected systemFiltered > 0 (synthetic includes E2E + adds)");
  }
  if (stats.unmatchedLines > 5) {
    throw new Error(`too many unmatched lines: ${stats.unmatchedLines}`);
  }
  const total = stats.perPerson.reduce((a, p) => a + p.count, 0);
  if (total !== stats.group.total) {
    throw new Error(
      `per-person total ${total} != group total ${stats.group.total}`,
    );
  }
  console.log("\n✓ assertions passed");
  return text;
}

const iphoneText = runOne("iPhone format", "iphone", 42);
runOne("Android format", "android", 99);

// also save the iPhone synthetic to public/samples for the UI to ship
const samplePath = join(process.cwd(), "public", "samples", "sample-chat.txt");
writeFileSync(samplePath, iphoneText, "utf8");
console.log(`\n✓ wrote sample to ${samplePath}`);

console.log("\nALL SMOKE TESTS PASSED");
