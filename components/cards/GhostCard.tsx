"use client";

import { CardShell } from "./CardShell";
import { fmtDuration } from "@/lib/format";
import type { PerPersonStats } from "@/types";

interface GhostCardProps {
  ghost: PerPersonStats;
  roast?: string;
}

export function GhostCard({ ghost, roast }: GhostCardProps) {
  return (
    <CardShell
      gradient="linear-gradient(135deg, #84CC16 0%, #22D3EE 60%, #06B6D4 100%)"
      cardLabel="The Ghost"
      filename={`gcw-ghost-${ghost.name.toLowerCase()}`}
      textColor="text-zinc-900"
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          ghost king
        </p>
        <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter break-words">
          {ghost.name}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-1 animate-float-up [animation-delay:120ms]">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          median reply time
        </p>
        <p className="text-[5.5rem] sm:text-[7rem] font-black leading-none tracking-tighter">
          {fmtDuration(ghost.latencyP50Sec)}
        </p>
      </div>

      <div className="mt-5 sm:mt-6 flex flex-col gap-1 text-xs sm:text-sm opacity-80 animate-float-up [animation-delay:240ms]">
        <p>longest ghost: {fmtDuration(ghost.longestGhostSec)}</p>
        <p>messages sent: {ghost.count.toLocaleString()}</p>
      </div>

      {roast && (
        <p className="mt-5 sm:mt-6 italic text-sm sm:text-base opacity-90 animate-float-up [animation-delay:360ms]">
          &ldquo;{roast}&rdquo;
        </p>
      )}
    </CardShell>
  );
}
