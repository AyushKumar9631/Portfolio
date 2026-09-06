import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { isAuthorized, parseActivityPayload } from "@/lib/activityAdmin";

// Update an existing activity (admin only).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const payload = parseActivityPayload(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid request — name, description, duration and date are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("activities")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activity: data });
}

// Delete an activity (admin only).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  const { id } = await params;
  const { error } = await supabaseAdmin.from("activities").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
