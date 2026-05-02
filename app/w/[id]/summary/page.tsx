import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SummaryPage } from "@/components/SummaryPage";
import type { ComputedStats } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID_RE = /^[a-z0-9]{6}$/;

function kvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PermalinkSummaryPage({ params }: PageProps) {
  const { id } = await params;
  if (!ID_RE.test(id)) notFound();

  if (!kvConfigured()) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <h1 className="text-3xl font-black">Permalinks aren't live yet</h1>
        <Link
          href="/"
          className="mt-2 rounded-full bg-white text-black py-3 px-6 text-sm font-bold"
        >
          go home
        </Link>
      </main>
    );
  }

  const data = await kv.get<ComputedStats>(`w:${id}`);
  if (!data) notFound();

  return <SummaryPage stats={data} backHref={`/w/${id}`} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Group Chat Wrapped — ${id} · all stats`,
    description: "every stat from this group chat's wrapped.",
  };
}
