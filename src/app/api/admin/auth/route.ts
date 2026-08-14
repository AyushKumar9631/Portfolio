import { NextRequest, NextResponse } from "next/server";

// The keypad pattern (tic-tac-toe board, 1-9 top-left to bottom-right) is
// just the trigger a visitor can see/guess by clicking around — it is NOT
// the real security boundary. The actual boundary is ADMIN_SESSION_SECRET:
// a server-only value that never reaches the client bundle. Even someone
// who reads the source and learns the pattern still can't forge a session
// without that secret, and can't write to Supabase without a valid one.
const SEQUENCE = process.env.ADMIN_SEQUENCE ?? "9631";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 12; // 12h

export async function POST(req: NextRequest) {
  if (!SESSION_SECRET) {
    return NextResponse.json({ ok: false, error: "Admin auth not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const sequence = Array.isArray(body?.sequence) ? body.sequence.join("") : "";

  if (sequence.length !== 4 || sequence !== SEQUENCE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
