"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardDeck } from "@/components/CardDeck";
import { TitleCard } from "@/components/cards/TitleCard";
import { YapperCard } from "@/components/cards/YapperCard";
import { GhostCard } from "@/components/cards/GhostCard";
import { VerdictCard } from "@/components/cards/VerdictCard";
import { FinalShareCard } from "@/components/cards/FinalShareCard";
import type { ComputedStats, PerPersonStats } from "@/types";

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

export default function WrappedPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ComputedStats | null>(null);

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

  const cards = useMemo(() => {
    if (!stats) return null;
    const yapper = stats.perPerson[0];
    const ghost = pickGhost(stats.perPerson) ?? yapper;
    return [
      <TitleCard key="title" group={stats.group} />,
      <YapperCard
        key="yapper"
        yapper={yapper}
        totalMessages={stats.group.total}
      />,
      <GhostCard key="ghost" ghost={ghost} />,
      <VerdictCard key="verdict" loading />,
      <FinalShareCard
        key="final"
        onRestart={() => sessionStorage.removeItem(STORAGE_KEY)}
      />,
    ];
  }, [stats]);

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
