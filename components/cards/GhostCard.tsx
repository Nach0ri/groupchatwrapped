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
        <p className="text-sm uppercase tracking-widest opacity-70">
          ghost king
        </p>
        <h2 className="text-7xl font-black leading-none tracking-tighter">
          {ghost.name}
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-2 animate-float-up [animation-delay:120ms]">
        <p className="text-sm uppercase tracking-widest opacity-70">
          median reply time
        </p>
        <p className="text-[7rem] font-black leading-none tracking-tighter">
          {fmtDuration(ghost.latencyP50Sec)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-1 text-sm opacity-80 animate-float-up [animation-delay:240ms]">
        <p>longest ghost: {fmtDuration(ghost.longestGhostSec)}</p>
        <p>messages sent: {ghost.count.toLocaleString()}</p>
      </div>

      {roast && (
        <p className="mt-6 italic text-base opacity-90 animate-float-up [animation-delay:360ms]">
          "{roast}"
        </p>
      )}
    </CardShell>
  );
}
