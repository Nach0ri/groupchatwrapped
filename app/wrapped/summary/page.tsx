"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SummaryPage } from "@/components/SummaryPage";
import type { ComputedStats } from "@/types";

const STORAGE_KEY = "gcw_stats_v1";

export default function WrappedSummaryRoute() {
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

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
        loading…
      </div>
    );
  }

  return <SummaryPage stats={stats} backHref="/wrapped" />;
}
