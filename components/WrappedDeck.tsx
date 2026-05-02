"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CardDeck } from "@/components/CardDeck";
import { TitleCard } from "@/components/cards/TitleCard";
import { YapperCard } from "@/components/cards/YapperCard";
import { GhostCard } from "@/components/cards/GhostCard";
import { BeefStarterCard } from "@/components/cards/BeefStarterCard";
import { NonchalantCard } from "@/components/cards/NonchalantCard";
import { UnhingedCard } from "@/components/cards/UnhingedCard";
import { PhraseOfYearCard } from "@/components/cards/PhraseOfYearCard";
import { VerdictCard } from "@/components/cards/VerdictCard";
import { FinalShareCard } from "@/components/cards/FinalShareCard";
import {
  pickBeefStarter,
  pickGhost,
  pickNonchalant,
  pickPhraseOfYear,
  pickUnhinged,
  pickYapper,
} from "@/lib/stats/scores";
import type { ComputedStats, RoleKey, VerdictResponse } from "@/types";
import type { PromptStats } from "@/lib/llm/prompt";

interface WrappedDeckProps {
  stats: ComputedStats;
  permalinkPrefilled?: string;
  permalinkId?: string;
  onRestart?: () => void;
}

function buildPromptStats(
  stats: ComputedStats,
  roles: PromptStats["roles"],
): PromptStats {
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
      swearCount: p.swearCount,
      allCapsCount: p.allCapsCount,
      lowercaseRatio: p.lowercaseMsgRatio,
    })),
    roles,
  };
}

function computeRoles(stats: ComputedStats) {
  return {
    yapperRole: pickYapper(stats.perPerson),
    ghostRole: pickGhost(stats.perPerson),
    beefStarterRole: pickBeefStarter(stats.perPerson),
    nonchalantRole: pickNonchalant(stats.perPerson),
    unhingedRole: pickUnhinged(stats.perPerson),
    phraseOfYear: pickPhraseOfYear(stats.group),
  };
}

function rolesPayload(
  slots: ReturnType<typeof computeRoles>,
): PromptStats["roles"] {
  const payload: PromptStats["roles"] = {};
  payload.yapper = {
    name: slots.yapperRole.name,
    note: `${slots.yapperRole.percent.toFixed(0)}% of all messages, ${slots.yapperRole.count} total`,
  };
  if (slots.ghostRole) {
    payload.ghost = {
      name: slots.ghostRole.name,
      note: `median reply ${slots.ghostRole.latencyP50Sec ? Math.round(slots.ghostRole.latencyP50Sec / 60) + "min" : "n/a"}`,
    };
  }
  if (slots.beefStarterRole) {
    payload.beef_starter = {
      name: slots.beefStarterRole.name,
      note: `killed convo ${slots.beefStarterRole.beefCount} times`,
    };
  }
  if (slots.nonchalantRole) {
    payload.nonchalant = {
      name: slots.nonchalantRole.person.name,
      note: `${(slots.nonchalantRole.person.lowercaseMsgRatio * 100).toFixed(0)}% lowercase, ${slots.nonchalantRole.person.laughs} laughs total`,
    };
  }
  if (slots.unhingedRole) {
    payload.unhinged = {
      name: slots.unhingedRole.person.name,
      note: `${slots.unhingedRole.person.swearCount} swears, ${slots.unhingedRole.person.allCapsCount} ALL CAPS rants`,
    };
  }
  return payload;
}

export function WrappedDeck({
  stats,
  permalinkPrefilled,
  permalinkId,
  onRestart,
}: WrappedDeckProps) {
  const router = useRouter();
  const [verdict, setVerdict] = useState<VerdictResponse | null>(null);
  const [verdictLoading, setVerdictLoading] = useState(true);
  const [verdictFailed, setVerdictFailed] = useState(false);

  const handleExit = () => {
    onRestart?.();
    router.push("/");
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleSlots = useMemo(() => computeRoles(stats), [stats]);

  useEffect(() => {
    const ctrl = new AbortController();
    setVerdictLoading(true);
    fetch("/api/verdict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPromptStats(stats, rolesPayload(roleSlots))),
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
  }, [stats, roleSlots]);

  const createPermalink = async (): Promise<string | null> => {
    if (permalinkPrefilled) return permalinkPrefilled;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      if (!res.ok) return null;
      const { id } = (await res.json()) as { id: string };
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/w/${id}`;
    } catch {
      return null;
    }
  };

  const cards = useMemo(() => {
    const role = (key: RoleKey) => verdict?.role_roasts?.[key];
    const fallbackPerPerson = (name: string) =>
      verdict?.per_person_roasts?.[name];
    const ghost = roleSlots.ghostRole ?? roleSlots.yapperRole;

    const cardList: React.ReactNode[] = [
      <TitleCard key="title" group={stats.group} />,
      <YapperCard
        key="yapper"
        yapper={roleSlots.yapperRole}
        totalMessages={stats.group.total}
        roast={role("yapper") ?? fallbackPerPerson(roleSlots.yapperRole.name)}
      />,
      <GhostCard
        key="ghost"
        ghost={ghost}
        roast={role("ghost") ?? fallbackPerPerson(ghost.name)}
      />,
    ];

    if (roleSlots.beefStarterRole) {
      cardList.push(
        <BeefStarterCard
          key="beef"
          beefStarter={roleSlots.beefStarterRole}
          roast={
            role("beef_starter") ??
            fallbackPerPerson(roleSlots.beefStarterRole.name)
          }
        />,
      );
    }
    if (roleSlots.nonchalantRole) {
      cardList.push(
        <NonchalantCard
          key="nonchalant"
          person={roleSlots.nonchalantRole.person}
          roast={
            role("nonchalant") ??
            fallbackPerPerson(roleSlots.nonchalantRole.person.name)
          }
        />,
      );
    }
    if (roleSlots.unhingedRole) {
      cardList.push(
        <UnhingedCard
          key="unhinged"
          person={roleSlots.unhingedRole.person}
          roast={
            role("unhinged") ??
            fallbackPerPerson(roleSlots.unhingedRole.person.name)
          }
        />,
      );
    }
    if (roleSlots.phraseOfYear.render) {
      cardList.push(
        <PhraseOfYearCard
          key="phrase"
          phrases={roleSlots.phraseOfYear.phrases}
        />,
      );
    }

    cardList.push(
      <VerdictCard
        key="verdict"
        verdict={verdict?.group_verdict}
        loading={verdictLoading}
        failed={verdictFailed}
      />,
      <FinalShareCard
        key="final"
        onRestart={onRestart}
        onCreatePermalink={createPermalink}
        summaryHref={
          permalinkId ? `/w/${permalinkId}/summary` : "/wrapped/summary"
        }
      />,
    );

    return cardList;
  }, [
    stats,
    roleSlots,
    verdict,
    verdictLoading,
    verdictFailed,
    onRestart,
    permalinkPrefilled,
    permalinkId,
  ]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4 relative">
      <button
        onClick={handleExit}
        aria-label="exit to home"
        className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white/80 hover:text-white transition z-50"
      >
        <X className="size-5" />
      </button>
      <CardDeck cards={cards} />
    </main>
  );
}
