"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardDeck } from "@/components/CardDeck";
import { TitleCard } from "@/components/cards/TitleCard";
import { YapperCard } from "@/components/cards/YapperCard";
import { GhostCard } from "@/components/cards/GhostCard";
import { VerdictCard } from "@/components/cards/VerdictCard";
import { FinalShareCard } from "@/components/cards/FinalShareCard";
import type {
  ComputedStats,
  PerPersonStats,
  VerdictResponse,
} from "@/types";
import type { PromptStats } from "@/lib/llm/prompt";

const STORAGE_KEY = "gcw_stats_v1";

function pickGhost(perPerson: PerPersonStats[]): PerPersonStats | null {
  const candidates = perPerson.filter(
    (p) => p.count >= 3 && p.latencyP50Sec !== null,
  );
  if (!candidates.length) return null;
  return [...candidates].sort(
    (a, b) => (b.latencyP50Sec ?? 0) - (a.latencyP50Sec ?? 0),
  )[0];
}

function buildPromptStats(stats: ComputedStats): PromptStats {
  return {
    group: {
      total: stats.group.total,
      daysActive: stats.group.daysActive,
      peakHour: stats.group.peakHour.hour,
    },
    perPerson: stats.perPerson.map((p) => ({
      name: p.name,
      count: p.count,
      percent: p.percent,
      latencyP50Min: p.latencyP50Sec === null ? null : p.latencyP50Sec / 60,
      topEmojis: p.topEmojis,
      laughs: p.laughs,
      longestGhostMin:
        p.longestGhostSec === null ? null : p.longestGhostSec / 60,
      beefCount: p.beefCount,
      msgLenAvgChars: p.msgLenAvgChars,
    })),
  };
}

export default function WrappedPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ComputedStats | null>(null);
  const [verdict, setVerdict] = useState<VerdictResponse | null>(null);
  const [verdictLoading, setVerdictLoading] = useState(true);
  const [verdictFailed, setVerdictFailed] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setStats(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!stats) return;
    const ctrl = new AbortController();
    setVerdictLoading(true);
    fetch("/api/verdict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPromptStats(stats)),
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: VerdictResponse) => {
        setVerdict(data);
        setVerdictLoading(false);
      })
      .catch(() => {
        setVerdictFailed(true);
        setVerdictLoading(false);
      });
    return () => ctrl.abort();
  }, [stats]);

  const cards = useMemo(() => {
    if (!stats) return null;
    const yapper = stats.perPerson[0];
    const ghost = pickGhost(stats.perPerson) ?? yapper;
    const yapperRoast = verdict?.per_person_roasts[yapper.name];
    const ghostRoast = verdict?.per_person_roasts[ghost.name];
    return [
      <TitleCard key="title" group={stats.group} />,
      <YapperCard
        key="yapper"
        yapper={yapper}
        totalMessages={stats.group.total}
        roast={yapperRoast}
      />,
      <GhostCard key="ghost" ghost={ghost} roast={ghostRoast} />,
      <VerdictCard
        key="verdict"
        verdict={verdict?.group_verdict}
        loading={verdictLoading}
        failed={verdictFailed}
      />,
      <FinalShareCard
        key="final"
        onRestart={() => sessionStorage.removeItem(STORAGE_KEY)}
      />,
    ];
  }, [stats, verdict, verdictLoading, verdictFailed]);

  if (!stats || !cards) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
        loading…
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
      <CardDeck cards={cards} />
    </main>
  );
}
