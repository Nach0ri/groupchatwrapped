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
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-60">
          biggest yapper
        </p>
        <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter break-words">
          {yapper.name}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-1 animate-float-up [animation-delay:120ms]">
        <span className="text-[5.5rem] sm:text-[7rem] font-black leading-none tracking-tighter">
          {pct}%
        </span>
        <span className="text-base sm:text-xl opacity-70">
          of all messages
        </span>
      </div>

      <div className="mt-5 sm:mt-6 flex flex-col gap-1.5 text-xs sm:text-sm opacity-80 animate-float-up [animation-delay:240ms]">
        <p>
          {yapper.count.toLocaleString()} of {totalMessages.toLocaleString()}{" "}
          messages came from this one.
        </p>
        {yapper.topEmojis.length > 0 && (
          <p>top emojis: {yapper.topEmojis.join(" ")}</p>
        )}
      </div>

      {roast && (
        <p className="mt-5 sm:mt-6 italic text-sm sm:text-base opacity-90 animate-float-up [animation-delay:360ms]">
          &ldquo;{roast}&rdquo;
        </p>
      )}
    </CardShell>
  );
}
