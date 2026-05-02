"use client";

import { CardShell } from "./CardShell";

interface PhraseOfYearCardProps {
  phrases: { phrase: string; count: number }[];
}

export function PhraseOfYearCard({ phrases }: PhraseOfYearCardProps) {
  if (!phrases.length) return null;
  const single = phrases.length === 1;
  return (
    <CardShell
      gradient="linear-gradient(135deg, #064E3B 0%, #059669 50%, #84CC16 100%)"
      cardLabel="Word of the Season"
      filename="gcw-phrase"
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          {single ? "the chat said this so much" : "phrases that defined the chat"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:gap-6 animate-float-up [animation-delay:120ms]">
        {phrases.map((p, i) => (
          <div key={p.phrase} className="flex flex-col">
            <span
              className={`font-black leading-[0.95] tracking-tighter break-words ${
                single
                  ? "text-5xl sm:text-7xl"
                  : i === 0
                    ? "text-4xl sm:text-6xl"
                    : "text-3xl sm:text-5xl"
              }`}
            >
              &ldquo;{p.phrase}&rdquo;
            </span>
            <span className="text-sm sm:text-base opacity-70 mt-1">
              {p.count} times
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
