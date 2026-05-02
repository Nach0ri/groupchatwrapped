"use client";

import Link from "next/link";
import { Heatmap } from "./Heatmap";
import { fmtDateRange, fmtDuration, fmtNumber } from "@/lib/format";
import {
  pickBeefStarter,
  pickGhost,
  pickNonchalant,
  pickUnhinged,
  pickYapper,
} from "@/lib/stats/scores";
import type { ComputedStats, PerPersonStats } from "@/types";

interface SummaryPageProps {
  stats: ComputedStats;
  backHref?: string;
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-4 ${className}`}>
      <h2 className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LineupRow({
  role,
  name,
  detail,
}: {
  role: string;
  name: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-3 items-baseline py-2 border-b border-white/5">
      <span className="text-xs text-white/50 uppercase tracking-wider">
        {role}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-lg font-bold">{name}</span>
        <span className="text-sm text-white/60">{detail}</span>
      </div>
    </div>
  );
}

function totalEmojis(perPerson: PerPersonStats[]): number {
  return perPerson.reduce((a, p) => a + p.totalEmojis, 0);
}
function totalLaughs(perPerson: PerPersonStats[]): number {
  return perPerson.reduce((a, p) => a + p.laughs, 0);
}
function totalSwears(perPerson: PerPersonStats[]): number {
  return perPerson.reduce((a, p) => a + p.swearCount, 0);
}
function totalCaps(perPerson: PerPersonStats[]): number {
  return perPerson.reduce((a, p) => a + p.allCapsCount, 0);
}
function totalBeef(perPerson: PerPersonStats[]): number {
  return perPerson.reduce((a, p) => a + p.beefCount, 0);
}

function PersonBlock({ p }: { p: PerPersonStats }) {
  return (
    <div className="flex flex-col gap-1 py-4 border-t border-white/10">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="text-2xl font-black tracking-tight">{p.name}</h3>
        <span className="text-sm text-white/60">
          {fmtNumber(p.count)} msgs · {p.percent.toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-white/70 mt-1">
        <Stat label="median reply" value={fmtDuration(p.latencyP50Sec)} />
        <Stat label="worst reply" value={fmtDuration(p.latencyMaxSec)} />
        <Stat label="avg length" value={`${Math.round(p.msgLenAvgChars)} chars`} />
        <Stat label="laughs" value={fmtNumber(p.laughs)} />
        <Stat label="emojis" value={fmtNumber(p.totalEmojis)} />
        <Stat label="lowercase msgs" value={`${(p.lowercaseMsgRatio * 100).toFixed(0)}%`} />
        <Stat label="swears" value={fmtNumber(p.swearCount)} />
        <Stat label="ALL CAPS" value={fmtNumber(p.allCapsCount)} />
        <Stat label="exclaims" value={fmtNumber(p.exclaimCount)} />
        <Stat label="vibe-kills" value={fmtNumber(p.beefCount)} />
        <Stat label="conv-starters" value={fmtNumber(p.convStarters)} />
        <Stat
          label="longest ghost"
          value={fmtDuration(p.longestGhostSec)}
        />
      </div>
      {p.topEmojis.length > 0 && (
        <div className="text-sm text-white/70 mt-1">
          <span className="text-white/50">top emojis: </span>
          <span className="text-base">{p.topEmojis.join(" ")}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/50 truncate">{label}</span>
      <span className="text-white font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function SummaryPage({ stats, backHref = "/wrapped" }: SummaryPageProps) {
  const yapper = pickYapper(stats.perPerson);
  const ghost = pickGhost(stats.perPerson);
  const beef = pickBeefStarter(stats.perPerson);
  const nonchalant = pickNonchalant(stats.perPerson);
  const unhinged = pickUnhinged(stats.perPerson);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 sm:py-16 flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          your wrapped
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
          all at once.
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {fmtNumber(stats.group.total)} messages · {stats.group.daysActive}{" "}
          days · {fmtDateRange(stats.group.startISO, stats.group.endISO)}
        </p>
      </header>

      <Section title="when you yap">
        <Heatmap hourDowDist={stats.group.hourDowDist ?? []} />
      </Section>

      <Section title={`the lineup · ${stats.perPerson.length} people`}>
        <div className="flex flex-col">
          <LineupRow
            role="yapper"
            name={yapper.name}
            detail={`${yapper.percent.toFixed(0)}% · ${fmtDuration(yapper.latencyP50Sec)} replies`}
          />
          {ghost && (
            <LineupRow
              role="ghost"
              name={ghost.name}
              detail={`${fmtDuration(ghost.latencyP50Sec)} median, ${fmtDuration(ghost.longestGhostSec)} longest`}
            />
          )}
          {beef && (
            <LineupRow
              role="vibe-killer"
              name={beef.name}
              detail={`killed convo ${beef.beefCount}× this season`}
            />
          )}
          {nonchalant && (
            <LineupRow
              role="nonchalant"
              name={nonchalant.person.name}
              detail={`${(nonchalant.person.lowercaseMsgRatio * 100).toFixed(0)}% lowercase · ${nonchalant.person.laughs} haha's`}
            />
          )}
          {unhinged && (
            <LineupRow
              role="unhinged"
              name={unhinged.person.name}
              detail={`${unhinged.person.swearCount} swears · ${unhinged.person.allCapsCount} ALL CAPS rants`}
            />
          )}
        </div>
      </Section>

      {stats.group.topNgrams.length > 0 && (
        <Section title="phrases of the season">
          <div className="flex flex-col">
            {stats.group.topNgrams.slice(0, 6).map((ng) => (
              <div
                key={ng.phrase}
                className="flex items-baseline justify-between py-2 border-b border-white/5"
              >
                <span className="text-base">&ldquo;{ng.phrase}&rdquo;</span>
                <span className="text-sm text-white/50 tabular-nums">
                  ×{ng.count}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="totals">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <Stat label="messages" value={fmtNumber(stats.group.total)} />
          <Stat label="days active" value={fmtNumber(stats.group.daysActive)} />
          <Stat label="people" value={fmtNumber(stats.perPerson.length)} />
          <Stat label="emojis" value={fmtNumber(totalEmojis(stats.perPerson))} />
          <Stat label="haha's" value={fmtNumber(totalLaughs(stats.perPerson))} />
          <Stat label="swears" value={fmtNumber(totalSwears(stats.perPerson))} />
          <Stat
            label="ALL CAPS"
            value={fmtNumber(totalCaps(stats.perPerson))}
          />
          <Stat label="vibe-kills" value={fmtNumber(totalBeef(stats.perPerson))} />
          <Stat label="peak hour" value={`${stats.group.peakHour.hour}:00`} />
        </div>
      </Section>

      <Section title="the full roster">
        <div className="flex flex-col">
          {stats.perPerson.map((p) => (
            <PersonBlock key={p.name} p={p} />
          ))}
        </div>
      </Section>

      <footer className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
        <Link
          href={backHref}
          className="rounded-full bg-white text-black py-3 px-6 text-sm font-bold text-center hover:bg-white/90 transition"
        >
          ← back to the story
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/20 py-3 px-6 text-sm font-bold text-center hover:bg-white/5 transition"
        >
          wrap another chat
        </Link>
      </footer>
    </main>
  );
}
