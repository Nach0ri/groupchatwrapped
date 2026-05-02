"use client";

import { Download } from "lucide-react";
import { useRef, useState } from "react";

interface CardShellProps {
  gradient: string;
  cardLabel: string;
  filename: string;
  children: React.ReactNode;
  textColor?: string;
}

export function CardShell({
  gradient,
  cardLabel,
  filename,
  children,
  textColor = "text-white",
}: CardShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ref.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("screenshot failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      ref={ref}
      className={`relative aspect-[9/16] w-full max-w-[460px] rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 ${textColor}`}
      style={{ background: gradient }}
    >
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] opacity-70 font-medium">
        {cardLabel}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        {children}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] opacity-60 font-medium">
          groupchatwrapped
        </span>
        <button
          onClick={onDownload}
          disabled={downloading}
          aria-label="download as image"
          className="shrink-0 size-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur flex items-center justify-center disabled:opacity-50 transition"
        >
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}
