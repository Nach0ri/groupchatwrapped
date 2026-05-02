import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  fallbackVerdict,
  type PromptStats,
} from "@/lib/llm/prompt";
import type { VerdictResponse } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function tryParseJSON(text: string): VerdictResponse | null {
  try {
    return JSON.parse(text);
  } catch {}
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]+?\})\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }
  const braced = text.match(/\{[\s\S]+\}/);
  if (braced) {
    try {
      return JSON.parse(braced[0]);
    } catch {}
  }
  return null;
}

function isValid(v: unknown): v is VerdictResponse {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  if (typeof r.group_verdict !== "string") return false;
  if (typeof r.per_person_roasts !== "object" || !r.per_person_roasts) return false;
  for (const val of Object.values(r.per_person_roasts as Record<string, unknown>)) {
    if (typeof val !== "string") return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  let stats: PromptStats;
  try {
    stats = (await req.json()) as PromptStats;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (!stats?.perPerson?.length) {
    return Response.json({ error: "no stats" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const names = stats.perPerson.map((p) => p.name);

  if (!apiKey) {
    return Response.json(fallbackVerdict(names));
  }

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(stats) }],
    });

    const block = res.content.find((c) => c.type === "text");
    const text = block && "text" in block ? block.text : "";
    const parsed = tryParseJSON(text);

    if (parsed && isValid(parsed)) {
      const filtered: VerdictResponse = {
        group_verdict: parsed.group_verdict.slice(0, 320),
        per_person_roasts: {},
      };
      for (const name of names) {
        const roast = parsed.per_person_roasts[name];
        if (typeof roast === "string") {
          filtered.per_person_roasts[name] = roast.slice(0, 80);
        }
      }
      return Response.json(filtered);
    }

    return Response.json(fallbackVerdict(names));
  } catch (err) {
    console.error("verdict error", err);
    return Response.json(fallbackVerdict(names));
  }
}
