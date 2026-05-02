"use client";

import { CardShell } from "./CardShell";
import Link from "next/link";

interface FinalShareCardProps {
  onRestart?: () => void;
}

export function FinalShareCard({ onRestart }: FinalShareCardProps) {
  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = "https://groupchatwrapped.vercel.app";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Group Chat Wrapped",
          text: "wrap your WhatsApp group chat. see who's the yapper.",
          url,
        });
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <CardShell
      gradient="linear-gradient(135deg, #FACC15 0%, #FB923C 60%, #F43F5E 100%)"
      cardLabel="Share"
      filename="gcw-final"
      textColor="text-zinc-900"
    >
      <div className="flex flex-col gap-3 animate-float-up">
        <p className="text-sm uppercase tracking-widest opacity-70">
          that's a wrap.
        </p>
        <h2 className="text-7xl font-black leading-[0.85] tracking-tighter">
          send this to your group chat.
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-3 animate-float-up [animation-delay:120ms]">
        <button
          onClick={onShare}
          className="rounded-full bg-zinc-900 text-white py-4 px-6 text-base font-bold hover:bg-zinc-800 transition"
        >
          share this site →
        </button>
        <Link
          href="/"
          onClick={(e) => {
            e.stopPropagation();
            onRestart?.();
          }}
          className="rounded-full border-2 border-zinc-900/20 py-4 px-6 text-base font-bold text-center hover:bg-white/30 transition"
        >
          wrap another chat
        </Link>
      </div>

      <p className="mt-8 text-xs opacity-70 animate-float-up [animation-delay:240ms]">
        groupchatwrapped.vercel.app
      </p>
    </CardShell>
  );
}
