"use client";

import { useState } from "react";
import { CardShell } from "./CardShell";
import Link from "next/link";

interface FinalShareCardProps {
  onRestart?: () => void;
  onCreatePermalink?: () => Promise<string | null>;
  summaryHref?: string;
  permalinkBlocked?: boolean;
}

const FALLBACK_URL = "https://groupchatwrapped.vercel.app";

export function FinalShareCard({
  onRestart,
  onCreatePermalink,
  summaryHref = "/wrapped/summary",
  permalinkBlocked = false,
}: FinalShareCardProps) {
  const [permalink, setPermalink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "shared" | "failed">(
    "idle",
  );

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy || permalinkBlocked) return;
    setBusy(true);
    let url = permalink;
    if (!url && onCreatePermalink) {
      const created = await onCreatePermalink();
      if (created) {
        url = created;
        setPermalink(created);
      }
    }
    if (!url) url = FALLBACK_URL;

    let shared = false;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Group Chat Wrapped",
          text: url === FALLBACK_URL
            ? "wrap your WhatsApp group chat. see who's the yapper."
            : "look at this wrapped of our group chat",
          url,
        });
        shared = true;
      } catch {}
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(url);
        shared = true;
      } catch {}
    }
    setShareState(shared ? "shared" : "failed");
    setBusy(false);
    setTimeout(() => setShareState("idle"), 2200);
  };

  const buttonLabel = permalinkBlocked
    ? "AI is cooking the verdict…"
    : busy
      ? "creating share link…"
      : shareState === "shared"
        ? permalink
          ? "✓ link copied"
          : "✓ shared"
        : shareState === "failed"
          ? "couldn't share — try again"
          : "share my wrapped →";

  return (
    <CardShell
      gradient="linear-gradient(135deg, #FACC15 0%, #FB923C 60%, #F43F5E 100%)"
      cardLabel="That's a wrap"
      filename="gcw-final"
      textColor="text-zinc-900"
    >
      <div className="flex flex-col gap-2 animate-float-up">
        <p className="text-xs sm:text-sm uppercase tracking-widest opacity-70">
          send this to
        </p>
        <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] tracking-tighter">
          your group chat.
        </h2>
      </div>

      <div className="relative z-30 mt-8 sm:mt-10 flex flex-col gap-3 animate-float-up [animation-delay:120ms]">
        <button
          onClick={handleShare}
          disabled={permalinkBlocked || busy}
          className="rounded-full bg-zinc-900 text-white py-3.5 px-6 text-sm sm:text-base font-bold hover:bg-zinc-800 transition disabled:opacity-60"
        >
          {buttonLabel}
        </button>
        <Link
          href={summaryHref}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full border-2 border-zinc-900/20 py-3.5 px-6 text-sm sm:text-base font-bold text-center hover:bg-white/30 transition"
        >
          see detailed stats →
        </Link>
        <Link
          href="/"
          onClick={(e) => {
            e.stopPropagation();
            onRestart?.();
          }}
          className="rounded-full border-2 border-zinc-900/20 py-3.5 px-6 text-sm sm:text-base font-bold text-center hover:bg-white/30 transition"
        >
          wrap another chat
        </Link>
        {permalink && shareState === "shared" && (
          <p className="text-xs text-center opacity-70 break-all px-2">
            {permalink}
          </p>
        )}
      </div>
    </CardShell>
  );
}
