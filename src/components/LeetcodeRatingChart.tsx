"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Trophy } from "lucide-react";

type ContestHistoryEntry = { title: string; startTime: number | null; rating: number; ranking: number };
type ContestRanking = {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
} | null;
type LeetcodeResponse = { ranking: ContestRanking; history: ContestHistoryEntry[] };

const CHART_W = 560;
const CHART_H = 160;
const PAD = 24;

function formatDate(unixSeconds: number | null) {
  if (!unixSeconds) return "";
  return new Date(unixSeconds * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

export default function LeetcodeRatingChart() {
  const [data, setData] = useState<LeetcodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leetcode/contest-rating")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.error || !Array.isArray(d?.history)) {
          setError("Couldn't load LeetCode contest data right now — it's an unofficial API, so this can be flaky.");
          return;
        }
        setData(d as LeetcodeResponse);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't reach LeetCode's contest API right now — it's unofficial, so this can be flaky.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const history = useMemo(
    () => (data ? [...data.history].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)) : []),
    [data],
  );

  const { path, area, points, minRating, maxRating } = useMemo(() => {
    if (history.length === 0) {
      return { path: "", area: "", points: [] as { x: number; y: number; entry: ContestHistoryEntry }[], minRating: 0, maxRating: 0 };
    }
    const ratings = history.map((h) => h.rating);
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const span = max - min || 1;
    const innerW = CHART_W - PAD * 2;
    const innerH = CHART_H - PAD * 2;

    const pts = history.map((entry, i) => {
      const x = PAD + (history.length === 1 ? innerW / 2 : (i / (history.length - 1)) * innerW);
      const y = PAD + innerH - ((entry.rating - min) / span) * innerH;
      return { x, y, entry };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${CHART_H - PAD} L ${pts[0].x.toFixed(1)} ${CHART_H - PAD} Z`;

    return { path: linePath, area: areaPath, points: pts, minRating: min, maxRating: max };
  }, [history]);

  return (
    <div className="border-2 border-ink">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-bg-elevated px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink">
          <Trophy size={14} aria-hidden="true" />
          Contest Score Sheet
        </span>
      </div>

      <div className="px-4 py-5 sm:px-5">
        {!data && !error && (
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Loading contest history…</p>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ListChecks size={20} className="text-ink-soft" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">{error}</p>
          </div>
        )}

        {data && history.length === 0 && !error && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ListChecks size={20} className="text-ink-soft" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">No contests attended yet.</p>
          </div>
        )}

        {data && history.length > 0 && (
          <>
            {data.ranking && (
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block -rotate-[1deg] border-2 border-accent-2 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-accent-2">
                  Rating {Math.round(data.ranking.rating)}
                </span>
                <span className="inline-block rotate-[1deg] border-2 border-ink/60 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-ink">
                  Global Rank {data.ranking.globalRanking.toLocaleString()}
                </span>
                <span className="inline-block -rotate-[1deg] border-2 border-ink/60 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-ink">
                  Top {data.ranking.topPercentage.toFixed(1)}%
                </span>
                <span className="inline-block rotate-[1deg] border-2 border-ink/60 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-ink">
                  {data.ranking.attendedContestsCount} Contests
                </span>
              </div>
            )}

            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" preserveAspectRatio="none">
              <line x1={PAD} y1={CHART_H - PAD} x2={CHART_W - PAD} y2={CHART_H - PAD} stroke="var(--line-strong)" strokeWidth={1} />
              <path d={area} fill="var(--accent-2)" opacity={0.12} />
              <path d={path} fill="none" stroke="var(--accent-2)" strokeWidth={2} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--accent-2)">
                  <title>
                    {p.entry.title} · {Math.round(p.entry.rating)} · {formatDate(p.entry.startTime)}
                  </title>
                </circle>
              ))}
            </svg>
            <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              <span>{Math.round(minRating)}</span>
              <span>Rating over {history.length} contests</span>
              <span>{Math.round(maxRating)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
