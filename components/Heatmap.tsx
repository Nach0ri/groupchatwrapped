"use client";

interface HeatmapProps {
  hourDowDist: number[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

function bucket(value: number, max: number): number {
  if (max === 0 || value === 0) return 0;
  const ratio = value / max;
  if (ratio < 0.15) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.7) return 3;
  return 4;
}

const BUCKET_BG = [
  "rgba(255,255,255,0.04)",
  "rgba(236,72,153,0.25)",
  "rgba(236,72,153,0.5)",
  "rgba(236,72,153,0.78)",
  "rgba(236,72,153,1)",
];

export function Heatmap({ hourDowDist }: HeatmapProps) {
  if (!hourDowDist || hourDowDist.length !== 168) {
    return (
      <div className="text-sm text-white/40 italic">
        heatmap not available for this wrapped (older format).
      </div>
    );
  }

  const max = hourDowDist.reduce((a, b) => Math.max(a, b), 0);
  if (max === 0) {
    return (
      <div className="text-sm text-white/40 italic">no activity yet.</div>
    );
  }

  let peakDow = 0;
  let peakHour = 0;
  for (let i = 0; i < 168; i++) {
    if (hourDowDist[i] === max) {
      peakDow = Math.floor(i / 24);
      peakHour = i % 24;
      break;
    }
  }

  const peakDayName = DAY_LABELS[peakDow];
  const peakHourLabel =
    peakHour === 0
      ? "12am"
      : peakHour === 12
        ? "12pm"
        : peakHour < 12
          ? `${peakHour}am`
          : `${peakHour - 12}pm`;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="invisible text-[10px]">Sun</div>
        <div className="grid grid-cols-8 text-[10px] text-white/40 px-[2px]">
          {HOUR_LABELS.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {DAY_LABELS.map((day, dowIdx) => (
          <DayRow
            key={day}
            label={day}
            counts={hourDowDist.slice(dowIdx * 24, dowIdx * 24 + 24)}
            max={max}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span>quiet</span>
          <div className="flex gap-1">
            {BUCKET_BG.map((bg, i) => (
              <div
                key={i}
                className="size-3 rounded-[3px]"
                style={{ background: bg }}
              />
            ))}
          </div>
          <span>loud</span>
        </div>
        <div>
          peak:{" "}
          <span className="text-white">
            {peakDayName} {peakHourLabel}
          </span>{" "}
          <span className="opacity-50">({max} msgs)</span>
        </div>
      </div>
    </div>
  );
}

function DayRow({
  label,
  counts,
  max,
}: {
  label: string;
  counts: number[];
  max: number;
}) {
  return (
    <>
      <div className="text-[10px] uppercase text-white/40 leading-[1.4rem]">
        {label}
      </div>
      <div className="grid grid-cols-24 gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {counts.map((count, h) => {
          const b = bucket(count, max);
          const tooltip =
            count === 0 ? "no msgs" : `${count} msg${count === 1 ? "" : "s"}`;
          return (
            <div
              key={h}
              title={`${label} ${h}:00 — ${tooltip}`}
              className="aspect-square rounded-[2px]"
              style={{ background: BUCKET_BG[b] }}
            />
          );
        })}
      </div>
    </>
  );
}
