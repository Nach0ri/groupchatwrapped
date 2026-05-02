"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { YapperCard } from "@/components/cards/YapperCard";
import type { ComputedStats } from "@/types";

const STORAGE_KEY = "gcw_stats_v1";

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

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
        loading…
      </div>
    );
  }

  const yapper = stats.perPerson[0];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
      <YapperCard yapper={yapper} totalMessages={stats.group.total} />

      <Link
        href="/"
        className="text-sm text-white/50 hover:text-white underline underline-offset-4"
      >
        ← drop another chat
      </Link>
    </main>
  );
}
