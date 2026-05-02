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

  const onDownload = async () => {
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
      className={`relative aspect-[9/16] w-full max-w-[460px] rounded-3xl overflow-hidden flex flex-col p-8 ${textColor}`}
      style={{ background: gradient }}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] opacity-70">
        <span>{cardLabel}</span>
        <span>group chat wrapped</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">{children}</div>

      <div className="flex items-center justify-between text-xs opacity-70">
        <span>2026</span>
        <button
          onClick={onDownload}
          disabled={downloading}
          aria-label="download as image"
          className="size-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center disabled:opacity-50"
        >
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}
