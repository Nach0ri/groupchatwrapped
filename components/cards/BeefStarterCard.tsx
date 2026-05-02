"use client";

import { CardShell } from "./CardShell";
import type { PerPersonStats } from "@/types";

interface BeefStarterCardProps {
  beefStarter: PerPersonStats;
  roast?: string;
}

export function BeefStarterCard({ beefStarter, roast }: BeefStarterCardProps) {
  return (
    <CardShell
      gradient="linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #F59E0B 100%)"
      cardLabel="The Vibe Killer"
      filename={`gcw-beef-${beefStarter.name.toLowerCase()}`}
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          killed the vibe
        </p>
        <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter break-words">
          {beefStarter.name}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-1 animate-float-up [animation-delay:120ms]">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          ended the convo
        </p>
        <p className="text-[5.5rem] sm:text-[7rem] font-black leading-none tracking-tighter">
          {beefStarter.beefCount}
        </p>
        <p className="text-base sm:text-xl opacity-80">
          {beefStarter.beefCount === 1 ? "time" : "times"}
        </p>
      </div>

      <p className="mt-5 sm:mt-6 text-xs sm:text-sm opacity-80 animate-float-up [animation-delay:240ms]">
        sent a message right before everyone went silent for 6+ hours.
      </p>

      {roast && (
        <p className="mt-5 sm:mt-6 italic text-sm sm:text-base opacity-95 animate-float-up [animation-delay:360ms]">
          &ldquo;{roast}&rdquo;
        </p>
      )}
    </CardShell>
  );
}
