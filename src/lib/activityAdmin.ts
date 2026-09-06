import { NextRequest } from "next/server";

export function isAuthorized(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  return Boolean(token) && token === process.env.ADMIN_SESSION_SECRET;
}

export type ActivityPayload = {
  name: string;
  description: string;
  duration: string;
  activity_date: string;
  github_link: string | null;
  demo_link: string | null;
  tags: string[];
};

// Shared shape-check for the fields that come from the add/edit form.
// Returns a cleaned payload or null if something required is missing/bad.
export function parseActivityPayload(body: unknown): ActivityPayload | null {
  const b = body as Record<string, unknown> | null;
  if (!b) return null;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const duration = typeof b.duration === "string" ? b.duration.trim() : "";
  const activity_date =
    typeof b.activity_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.activity_date)
      ? b.activity_date
      : null;
  const github_link = typeof b.github_link === "string" && b.github_link.trim() ? b.github_link.trim() : null;
  const demo_link = typeof b.demo_link === "string" && b.demo_link.trim() ? b.demo_link.trim() : null;
  const tags = Array.isArray(b.tags)
    ? b.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim())
    : [];

  if (!name || !description || !duration || !activity_date) return null;

  return { name, description, duration, activity_date, github_link, demo_link, tags };
}
