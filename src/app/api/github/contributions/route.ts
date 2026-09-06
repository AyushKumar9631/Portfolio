import { NextResponse } from "next/server";
import { profile } from "@/lib/data";

// Cached for 6h — a token-authed GraphQL call, not something to re-run on
// every page load. See the `next.revalidate` on the fetch below for the
// actual Data Cache entry; this route-segment config sets the same default
// for the handler itself.
export const revalidate = 21600;

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// Derived from profile.github (single source of truth in data.ts) instead
// of a second hardcoded username.
const GITHUB_USERNAME = (() => {
  try {
    return new URL(profile.github).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
})();

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token || !GITHUB_USERNAME) {
    return NextResponse.json({ error: "GitHub integration not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USERNAME } }),
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`GitHub GraphQL error ${res.status}:`, text);
      return NextResponse.json({ error: `GitHub request failed (${res.status})` }, { status: 502 });
    }

    const json = await res.json();
    if (json.errors) {
      console.error("GitHub GraphQL errors:", json.errors);
      return NextResponse.json({ error: "GitHub GraphQL returned errors" }, { status: 502 });
    }

    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return NextResponse.json({ error: "Unexpected GitHub response shape" }, { status: 502 });
    }

    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("GitHub fetch threw:", message);
    return NextResponse.json({ error: "Failed to reach GitHub", detail: message }, { status: 502 });
  }
}
