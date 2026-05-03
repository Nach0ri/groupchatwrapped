import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

const ID_CHARS = "abcdefghijkmnpqrstuvwxyz23456789";
const TTL_SECONDS = 60 * 60 * 24 * 30;

function makeId(): string {
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

function kvConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

export async function POST(req: NextRequest) {
  if (!kvConfigured()) {
    return Response.json(
      { error: "permalinks_unavailable" },
      { status: 503 },
    );
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }
  const obj = payload as Record<string, unknown>;
  const hasNewFormat =
    "stats" in obj &&
    obj.stats &&
    typeof obj.stats === "object" &&
    "perPerson" in (obj.stats as Record<string, unknown>);
  const hasOldFormat = "perPerson" in obj && Array.isArray(obj.perPerson);
  if (!hasNewFormat && !hasOldFormat) {
    return Response.json({ error: "invalid_payload" }, { status: 400 });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = makeId();
    const key = `w:${id}`;
    const existing = await kv.get(key);
    if (existing) continue;
    await kv.set(key, obj, { ex: TTL_SECONDS });
    return Response.json({ id });
  }
  return Response.json({ error: "id_collision" }, { status: 500 });
}
