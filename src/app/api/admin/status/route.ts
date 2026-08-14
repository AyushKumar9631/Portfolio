import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const isAdmin = Boolean(token) && token === process.env.ADMIN_SESSION_SECRET;
  return NextResponse.json({ isAdmin });
}
