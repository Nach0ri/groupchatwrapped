export function fmtDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) {
    const h = seconds / 3600;
    return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`;
  }
  return `${Math.round(seconds / 86400)}d`;
}

export function fmtDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year:
        start.getFullYear() === end.getFullYear() &&
        d.getTime() === start.getTime()
          ? undefined
          : "2-digit",
    });
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return `${fmt(start)} → ${fmt(end)}`;
}

export function fmtNumber(n: number): string {
  return n.toLocaleString("en-AU");
}
