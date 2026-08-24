import { NextRequest, NextResponse } from "next/server";

// Server-only — never exposed to the client bundle (no NEXT_PUBLIC_ prefix).
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// Placeholder system prompt — just enough for the bot to talk. Gets
// replaced with real portfolio context (profile, projects, stack) in a
// later step.
const SYSTEM_PROMPT =
  "You are a helpful AI assistant embedded on Ayush Kumar's portfolio website. Be friendly and concise.";

type ChatMessage = { role: "user" | "assistant"; content: string };

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
      return NextResponse.json(
        { error: `Groq request failed (${groqRes.status})`, detail: errText },
        { status: 502 },
      );
    }

    const data = await groqRes.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 502 });
  }
}
