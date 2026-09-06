import { NextResponse } from "next/server";

// Same 6h cache rationale as the GitHub route — plus this endpoint is
// LeetCode's unofficial/unsupported GraphQL API, so fewer hits = less
// exposure to it breaking or rate-limiting us mid-browse.
export const revalidate = 21600;

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest {
        title
        startTime
      }
    }
  }
`;

export async function GET() {
  const username = process.env.LEETCODE_USERNAME?.trim();
  if (!username) {
    return NextResponse.json({ error: "LeetCode integration not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The unofficial endpoint 403s requests that don't look like they
        // came from leetcode.com itself.
        Referer: `https://leetcode.com/${username}/`,
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`LeetCode GraphQL error ${res.status}:`, text);
      return NextResponse.json({ error: `LeetCode request failed (${res.status})` }, { status: 502 });
    }

    const json = await res.json();
    if (json.errors) {
      console.error("LeetCode GraphQL errors:", json.errors);
      return NextResponse.json({ error: "LeetCode GraphQL returned errors" }, { status: 502 });
    }

    const ranking = json?.data?.userContestRanking ?? null;
    const historyRaw = json?.data?.userContestRankingHistory;
    if (!Array.isArray(historyRaw)) {
      return NextResponse.json({ error: "Unexpected LeetCode response shape" }, { status: 502 });
    }

    // Unattended contests come back with rating 0 padding out the array —
    // only attended ones are real chart points.
    const history = historyRaw
      .filter((entry) => entry?.attended)
      .map((entry) => ({
        title: entry.contest?.title ?? "Contest",
        startTime: entry.contest?.startTime ?? null,
        rating: entry.rating,
        ranking: entry.ranking,
      }));

    return NextResponse.json({ ranking, history });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("LeetCode fetch threw:", message);
    return NextResponse.json({ error: "Failed to reach LeetCode", detail: message }, { status: 502 });
  }
}
