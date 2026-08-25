import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, getValidLinkUrls } from "@/lib/chatContext";

// Server-only — never exposed to the client bundle (no NEXT_PUBLIC_ prefix).
// .trim() guards against a trailing newline/space sneaking in from a
// copy-paste into Vercel's env var field — invisible in the dashboard,
// but it breaks the Authorization header and Groq rejects it with a
// plain 401.
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

// Built fresh from data.ts/credentials.ts on module load — see
// src/lib/chatContext.ts. Adding a project/doc there is the only edit
// ever needed; nothing here has to change.
const SYSTEM_PROMPT = buildSystemPrompt();
const VALID_LINK_URLS = getValidLinkUrls();

type ChatMessage = { role: "user" | "assistant"; content: string };
type BotReply = { reply: string; buttonName?: string; link?: string };

/** The model is instructed to return raw JSON, but strip code-fences
 * defensively in case it wraps the object in ```json anyway. */
function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

/** Parses the model's JSON reply. Falls back to treating the raw text as
 * a plain reply (no button) if the model didn't return valid JSON, so a
 * formatting slip never breaks the conversation. */
function parseBotReply(raw: string): BotReply {
  try {
    const parsed = JSON.parse(extractJsonObject(raw));
    if (typeof parsed?.reply === "string" && parsed.reply.trim()) {
      const link = typeof parsed.link === "string" ? parsed.link : undefined;
      const buttonName = typeof parsed.buttonName === "string" ? parsed.buttonName : undefined;
      // Never trust a link the model didn't copy from the whitelist —
      // drop it (and its button) rather than risk a hallucinated URL.
      if (link && VALID_LINK_URLS.has(link)) {
        return { reply: parsed.reply, buttonName, link };
      }
      return { reply: parsed.reply };
    }
  } catch {
    // fall through to plain-text fallback below
  }
  return { reply: raw.trim() };
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "Chat is not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const history: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

  const messages = history
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.error(`Groq API error ${groqRes.status}:`, errText);
      return NextResponse.json(
        { error: `Groq request failed (${groqRes.status})`, detail: errText },
        { status: 502 },
      );
    }

    const data = await groqRes.json();
    const rawContent: string | undefined = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    return NextResponse.json(parseBotReply(rawContent));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Groq fetch threw:", message);
    return NextResponse.json({ error: "Failed to reach Groq", detail: message }, { status: 502 });
  }
}
