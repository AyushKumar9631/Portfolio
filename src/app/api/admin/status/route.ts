import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const isAdmin = Boolean(token) && token === process.env.ADMIN_SESSION_SECRET;

  let expiresAt: number | null = null;
  if (isAdmin) {
    const raw = req.cookies.get("admin_session_expires")?.value;
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed)) expiresAt = parsed;
  }

  return NextResponse.json({ isAdmin, expiresAt });
}
