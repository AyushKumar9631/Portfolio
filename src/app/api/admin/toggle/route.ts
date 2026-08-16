import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const TOPICS = ["web_dev", "leetcode_potd", "gfg_potd", "dbms"] as const;
type Topic = (typeof TOPICS)[number];

function isTopic(v: unknown): v is Topic {
  return typeof v === "string" && (TOPICS as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const logDate = typeof body?.log_date === "string" ? body.log_date : null;
  const topic = body?.topic;

  if (!logDate || !/^\d{4}-\d{2}-\d{2}$/.test(logDate) || !isTopic(topic)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("daily_log")
    .select(topic)
    .eq("log_date", logDate)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const current = Boolean((existing as Record<string, boolean> | null)?.[topic]);
  const next = !current;

  const { error: upsertError } = await supabaseAdmin
    .from("daily_log")
    .upsert({ log_date: logDate, [topic]: next }, { onConflict: "log_date" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ log_date: logDate, topic, value: next });
}
