"use client";

import { useState } from "react";
import { CardShell } from "./CardShell";
import Link from "next/link";

interface FinalShareCardProps {
  onRestart?: () => void;
  onCreatePermalink?: () => Promise<string | null>;
  summaryHref?: string;
}

export function FinalShareCard({
  onRestart,
  onCreatePermalink,
  summaryHref = "/wrapped/summary",
}: FinalShareCardProps) {
  const [permalinkState, setPermalinkState] = useState<
    "idle" | "creating" | "ready" | "failed"
  >("idle");
  const [permalink, setPermalink] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "shared">("idle");

  const fallbackUrl = "https://groupchatwrapped.vercel.app";

  const onShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = permalink ?? fallbackUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Group Chat Wrapped",
          text: permalink
            ? "look at this wrapped of our group chat"
            : "wrap your WhatsApp group chat. see who's the yapper.",
          url,
        });
        setShareState("shared");
        setTimeout(() => setShareState("idle"), 2000);
      } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("shared");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {}
  };

  const onMakePermalink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCreatePermalink) return;
    setPermalinkState("creating");
    const url = await onCreatePermalink();
    if (!url) {
      setPermalinkState("failed");
      return;
    }
    setPermalink(url);
    setPermalinkState("ready");
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

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

      <div className="mt-8 sm:mt-10 flex flex-col gap-3 animate-float-up [animation-delay:120ms]">
        <button
          onClick={onShare}
          className="rounded-full bg-zinc-900 text-white py-3.5 px-6 text-sm sm:text-base font-bold hover:bg-zinc-800 transition"
        >
          {shareState === "shared"
            ? "✓ shared"
            : permalink
              ? "share my wrapped →"
              : "share this site →"}
        </button>
        {onCreatePermalink && permalinkState !== "ready" && (
          <button
            onClick={onMakePermalink}
            disabled={permalinkState === "creating"}
            className="rounded-full border-2 border-zinc-900/20 py-3 px-6 text-xs sm:text-sm font-bold text-zinc-900 hover:bg-white/30 transition disabled:opacity-60"
          >
            {permalinkState === "creating"
              ? "creating link…"
              : permalinkState === "failed"
                ? "permalink unavailable"
                : "create permalink to my wrapped"}
          </button>
        )}
        {permalink && (
          <p className="text-xs text-center opacity-70 break-all">
            {permalink}
          </p>
        )}
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
        <Link
          href={summaryHref}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-center opacity-60 hover:opacity-100 underline underline-offset-4 mt-1"
        >
          see all stats →
        </Link>
      </div>
    </CardShell>
  );
}
