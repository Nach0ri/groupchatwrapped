"use client";

import { CardShell } from "./CardShell";

interface VerdictCardProps {
  verdict?: string;
  loading?: boolean;
  failed?: boolean;
}

const PLACEHOLDER =
  "your group chat is exactly what it needs to be. mostly chaos, a few real moments, and one person who never replies on time.";

export function VerdictCard({ verdict, loading, failed }: VerdictCardProps) {
  const text = verdict ?? (failed ? PLACEHOLDER : "");
  return (
    <CardShell
      gradient="linear-gradient(135deg, #D946EF 0%, #A855F7 50%, #6366F1 100%)"
      cardLabel="The Verdict"
      filename="gcw-verdict"
    >
      <div className="flex flex-col gap-3 animate-float-up">
        <p className="text-sm uppercase tracking-widest opacity-70">
          official verdict
        </p>
        <h2 className="text-5xl font-black leading-[0.9] tracking-tight">
          your vibe is —
        </h2>
      </div>

      <div className="mt-10 min-h-[10rem] animate-float-up [animation-delay:120ms]">
        {loading && !verdict ? (
          <div className="flex flex-col gap-3">
            <div className="h-4 rounded bg-white/20 animate-pulse w-full" />
            <div className="h-4 rounded bg-white/20 animate-pulse w-[90%]" />
            <div className="h-4 rounded bg-white/20 animate-pulse w-[80%]" />
            <div className="h-4 rounded bg-white/20 animate-pulse w-[60%]" />
            <p className="mt-4 text-xs opacity-60 italic">
              the AI is cooking…
            </p>
          </div>
        ) : (
          <p className="text-2xl font-medium leading-snug">{text}</p>
        )}
      </div>
    </CardShell>
  );
}
