"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readChatFromFile } from "@/lib/parser/unzip";
import { computeStats } from "@/lib/stats/compute";

const STORAGE_KEY = "gcw_stats_v1";

const LOADING_LINES = [
  "counting the haha's…",
  "ranking the ghosters…",
  "tallying emoji crimes…",
  "sniffing out beef…",
  "computing aura…",
];

export function Uploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLine, setBusyLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);

  const cycleBusyLine = useCallback(() => {
    let i = 0;
    return setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      setBusyLine(LOADING_LINES[i]);
    }, 600);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      const ticker = cycleBusyLine();
      try {
        const text = await readChatFromFile(file);
        await new Promise((r) => setTimeout(r, 50));
        const stats = computeStats(text);
        if (!stats.perPerson.length) {
          throw new Error(
            "couldn't parse any messages — make sure this is a WhatsApp export.",
          );
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        router.push("/wrapped");
      } catch (err) {
        setError(err instanceof Error ? err.message : "something broke. try again.");
        setBusy(false);
      } finally {
        clearInterval(ticker);
      }
    },
    [router, cycleBusyLine],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onPickSample = useCallback(async () => {
    setBusy(true);
    const ticker = cycleBusyLine();
    try {
      const res = await fetch("/samples/sample-chat.txt");
      const text = await res.text();
      const stats = computeStats(text);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      router.push("/wrapped");
    } catch (err) {
      setError(err instanceof Error ? err.message : "couldn't load sample.");
      setBusy(false);
    } finally {
      clearInterval(ticker);
    }
  }, [router, cycleBusyLine]);

  if (busy) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="size-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-lg text-white/70 animate-float-up">{busyLine}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed cursor-pointer transition-colors px-6 py-12 ${
          dragOver
            ? "border-white bg-white/10"
            : "border-white/20 bg-white/5 hover:bg-white/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.zip,application/zip,text/plain"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="text-5xl">💬</div>
        <div className="text-center">
          <div className="text-lg font-semibold">drop your _chat.txt</div>
          <div className="text-sm text-white/60">or .zip from iPhone export</div>
        </div>
      </label>

      <button
        onClick={onPickSample}
        className="text-sm text-white/60 hover:text-white underline underline-offset-4"
      >
        or try a sample chat →
      </button>

      {error && (
        <div className="text-sm text-rose-400 text-center">{error}</div>
      )}
    </div>
  );
}
