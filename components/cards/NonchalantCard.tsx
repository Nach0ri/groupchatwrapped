"use client";

import { CardShell } from "./CardShell";
import type { PerPersonStats } from "@/types";

interface NonchalantCardProps {
  person: PerPersonStats;
  roast?: string;
}

export function NonchalantCard({ person, roast }: NonchalantCardProps) {
  const emojiPerMsg = person.totalEmojis / person.count;
  const lowercasePct = Math.round(person.lowercaseMsgRatio * 100);
  return (
    <CardShell
      gradient="linear-gradient(135deg, #1E293B 0%, #475569 50%, #64748B 100%)"
      cardLabel="Unbothered"
      filename={`gcw-nonchalant-${person.name.toLowerCase()}`}
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          most nonchalant
        </p>
        <h2 className="text-6xl sm:text-7xl font-black leading-none tracking-tighter break-words">
          {person.name}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-3 animate-float-up [animation-delay:120ms]">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {lowercasePct}%
          </span>
          <span className="text-sm sm:text-base opacity-70">
            all lowercase
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {person.laughs}
          </span>
          <span className="text-sm sm:text-base opacity-70">
            {person.laughs === 1 ? "haha" : "haha's"}
          </span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black leading-none tracking-tighter">
            {emojiPerMsg.toFixed(2)}
          </span>
          <span className="text-sm sm:text-base opacity-70">emojis per msg</span>
        </div>
      </div>

      {roast && (
        <p className="mt-5 sm:mt-6 italic text-sm sm:text-base opacity-90 animate-float-up [animation-delay:360ms]">
          &ldquo;{roast}&rdquo;
        </p>
      )}
    </CardShell>
  );
}
