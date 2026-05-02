"use client";

import { CardShell } from "./CardShell";
import type { PerPersonStats } from "@/types";

interface YapperCardProps {
  yapper: PerPersonStats;
  totalMessages: number;
  roast?: string;
}

export function YapperCard({ yapper, totalMessages, roast }: YapperCardProps) {
  const pct = yapper.percent.toFixed(0);
  return (
    <CardShell
      gradient="linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)"
      cardLabel="The Yapper"
      filename={`gcw-yapper-${yapper.name.toLowerCase()}`}
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-sm uppercase tracking-widest opacity-60">
          biggest yapper
        </p>
        <h2 className="text-7xl font-black leading-none tracking-tighter">
          {yapper.name}
        </h2>
      </div>

      <div className="mt-10 flex items-baseline gap-3 animate-float-up [animation-delay:120ms]">
        <span className="text-[7rem] font-black leading-none tracking-tighter">
          {pct}%
        </span>
        <span className="text-xl opacity-70">of all messages</span>
      </div>

      <div className="mt-6 flex flex-col gap-2 text-sm opacity-80 animate-float-up [animation-delay:240ms]">
        <p>
          {yapper.count.toLocaleString()} of {totalMessages.toLocaleString()}{" "}
          messages came from this one.
        </p>
        {yapper.topEmojis.length > 0 && (
          <p>top emojis: {yapper.topEmojis.join(" ")}</p>
        )}
      </div>

      {roast && (
        <p className="mt-6 italic text-base opacity-90 animate-float-up [animation-delay:360ms]">
          "{roast}"
        </p>
      )}
    </CardShell>
  );
}
