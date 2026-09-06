import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// Hit once a day by Vercel Cron (see vercel.json) to generate DB activity
// so the Supabase free-tier project doesn't auto-pause after a week idle.
// Vercel signs cron requests with `Authorization: Bearer $CRON_SECRET` when
// CRON_SECRET is set as an env var — reject anything else so randoms can't
// spam this route.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
  }

  const client = isSupabaseAdminConfigured ? supabaseAdmin : isSupabaseConfigured ? supabase : null;
  if (!client) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await client.from("activities").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
}
