"use client";

import { useState } from "react";
import { X } from "lucide-react";

const STEPS = {
  iphone: [
    "Open WhatsApp and tap the group chat you want to wrap.",
    "Tap the chat's name at the top to open chat info.",
    "Scroll all the way down and tap 'Export Chat'.",
    "Choose 'Without Media' (smaller file, faster upload).",
    "Save the .zip to Files / iCloud Drive / Notes.",
    "Drag that .zip onto the box up there. We'll handle the rest.",
  ],
  android: [
    "Open WhatsApp and tap the group chat you want to wrap.",
    "Tap the three-dot menu (top right) and pick 'More'.",
    "Tap 'Export chat'.",
    "Choose 'Without media'.",
    "Save the resulting _chat.txt file to your phone.",
    "Upload it via the box up there.",
  ],
};

export function HowToExportModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"iphone" | "android">("iphone");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-white/50 hover:text-white underline underline-offset-4 transition"
      >
        how do I export my chat?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to export your WhatsApp chat"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-float-up"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-6 sm:p-8 text-white max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              aria-label="close"
              className="absolute top-4 right-4 size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-2xl font-black tracking-tight">
              get your chat
            </h3>
            <p className="text-sm text-white/60 mt-1">
              WhatsApp lets you export any group chat as a .txt or .zip. takes
              30 seconds.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setTab("iphone")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition ${
                  tab === "iphone"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                iPhone
              </button>
              <button
                onClick={() => setTab("android")}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition ${
                  tab === "android"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Android
              </button>
            </div>

            <ol className="mt-6 flex flex-col gap-3 text-sm">
              {STEPS[tab].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 size-6 rounded-full bg-white/10 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-xs text-white/40">
              parsing happens in your browser. raw messages never leave your
              device.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
