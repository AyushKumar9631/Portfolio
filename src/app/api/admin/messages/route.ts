import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("id, created_at, name, email, subject, message")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
