"use client";

import { CardShell } from "./CardShell";
import type { PerPersonStats } from "@/types";

interface UnhingedCardProps {
  person: PerPersonStats;
  roast?: string;
}

export function UnhingedCard({ person, roast }: UnhingedCardProps) {
  return (
    <CardShell
      gradient="linear-gradient(135deg, #18181B 0%, #7F1D1D 40%, #DB2777 100%)"
      cardLabel="Most Unhinged"
      filename={`gcw-unhinged-${person.name.toLowerCase()}`}
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          feral but lovable
        </p>
        <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter break-words">
          {person.name}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-3 animate-float-up [animation-delay:120ms]">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {person.swearCount}
          </span>
          <span className="text-sm sm:text-base opacity-70">
            {person.swearCount === 1 ? "swear" : "swears"}
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {person.allCapsCount}
          </span>
          <span className="text-sm sm:text-base opacity-70">ALL CAPS rants</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {person.exclaimCount}
          </span>
          <span className="text-sm sm:text-base opacity-70">
            exclamation marks
          </span>
        </div>
      </div>

      {roast && (
        <p className="mt-5 sm:mt-6 italic text-sm sm:text-base opacity-95 animate-float-up [animation-delay:360ms]">
          &ldquo;{roast}&rdquo;
        </p>
      )}
    </CardShell>
  );
}
