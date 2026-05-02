"use client";

import { CardShell } from "./CardShell";
import { fmtDateRange, fmtNumber } from "@/lib/format";
import type { GroupStats } from "@/types";

interface TitleCardProps {
  group: GroupStats;
}

export function TitleCard({ group }: TitleCardProps) {
  return (
    <CardShell
      gradient="linear-gradient(135deg, #FB7185 0%, #F97316 50%, #FACC15 100%)"
      cardLabel="2026"
      filename="gcw-title"
    >
      <div className="flex flex-col items-center text-center gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          your group chat,
        </p>
        <h2 className="text-[4.5rem] sm:text-[6rem] font-black leading-[0.85] tracking-tighter">
          wrapped.
        </h2>
      </div>

      <div className="mt-10 sm:mt-12 flex flex-col items-center text-center gap-6 animate-float-up [animation-delay:120ms]">
        <div>
          <p className="text-6xl sm:text-7xl font-black leading-none tracking-tighter">
            {fmtNumber(group.total)}
          </p>
          <p className="text-sm sm:text-base opacity-80 mt-1">
            messages this season
          </p>
        </div>

        <div>
          <p className="text-xl sm:text-2xl font-bold">
            {group.daysActive.toLocaleString()} days
          </p>
          <p className="text-xs sm:text-sm opacity-80">
            {fmtDateRange(group.startISO, group.endISO)}
          </p>
        </div>
      </div>

      <p className="mt-8 sm:mt-10 text-center text-xs opacity-60 italic animate-float-up [animation-delay:240ms]">
        tap to begin →
      </p>
    </CardShell>
  );
}
