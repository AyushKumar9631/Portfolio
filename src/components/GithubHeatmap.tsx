"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, ListChecks } from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";

type ContributionDay = { date: string; contributionCount: number; weekday: number };
type ContributionWeek = { contributionDays: ContributionDay[] };
type ContributionsResponse = { totalContributions: number; weeks: ContributionWeek[] };

const CELL = 10;
const GAP = 3;
const COL_WIDTH = CELL + GAP;
const LEVEL_OPACITY = [0, 0.22, 0.45, 0.68, 1];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function levelFor(count: number, max: number) {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  return Math.min(4, Math.ceil((count / max) * 4)) || 1;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** current/longest run of days with contributionCount > 0. */
function computeStreaks(days: ContributionDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let running = 0;
  for (const d of sorted) {
    running = d.contributionCount > 0 ? running + 1 : 0;
    longest = Math.max(longest, running);
  }
  let current = 0;
  for (let i = sorted.length - 1; i >= 0 && sorted[i].contributionCount > 0; i--) current++;
  return { current, longest };
}

export default function GithubHeatmap() {
  const [data, setData] = useState<ContributionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github/contributions")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.error || !Array.isArray(d?.weeks)) {
          setError("Couldn't load GitHub activity right now.");
          return;
        }
        setData(d as ContributionsResponse);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load GitHub activity right now.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo(() => {
    if (!data) return [];
    return data.weeks.map((week) => {
      const col: (ContributionDay | null)[] = Array(7).fill(null);
      for (const day of week.contributionDays) col[day.weekday] = day;
      return col;
    });
  }, [data]);

  const maxCount = useMemo(() => {
    if (!data) return 0;
    return data.weeks.reduce(
      (max, w) => w.contributionDays.reduce((m, d) => Math.max(m, d.contributionCount), max),
      0,
    );
  }, [data]);

  const streaks = useMemo(() => {
    if (!data) return null;
    return computeStreaks(data.weeks.flatMap((w) => w.contributionDays));
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    columns.forEach((col, i) => {
      const firstDay = col.find((d) => d !== null);
      if (!firstDay) return;
      const month = new Date(`${firstDay.date}T00:00:00`).getMonth();
      if (month !== lastMonth) {
        labels.push({ index: i, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [columns]);

  return (
    <div className="border-2 border-ink">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-bg-elevated px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink">
          <GithubIcon size={14} />
          Commit Ledger
        </span>
        {streaks && streaks.current > 0 && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-accent-2">
            <Flame size={12} aria-hidden="true" />
            {streaks.current}-day streak
          </span>
        )}
      </div>

      <div className="px-4 py-5 sm:px-5">
        {!data && !error && (
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Loading commits…</p>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ListChecks size={20} className="text-ink-soft" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">{error}</p>
          </div>
        )}

        {data && (
          <>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {data.totalContributions.toLocaleString()} contributions in the last year
              {streaks && streaks.longest > 0 && ` · longest streak ${streaks.longest} days`}
            </p>

            <div className="overflow-x-auto pb-1">
              <div className="relative" style={{ width: columns.length * COL_WIDTH, minWidth: "100%" }}>
                <div className="relative h-4">
                  {monthLabels.map(({ index, label }) => (
                    <span
                      key={index}
                      className="absolute top-0 font-mono text-[9px] uppercase tracking-[0.06em] text-muted"
                      style={{ left: index * COL_WIDTH }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex" style={{ gap: GAP }}>
                  {columns.map((col, ci) => (
                    <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
                      {col.map((day, ri) => (
                        <div
                          key={ri}
                          title={day ? `${day.contributionCount} contributions · ${formatDate(day.date)}` : undefined}
                          className="rounded-[2px] border border-ink/15 bg-accent-2"
                          style={{
                            width: CELL,
                            height: CELL,
                            opacity: day ? Math.max(LEVEL_OPACITY[levelFor(day.contributionCount, maxCount)], 0.06) : 0,
                            visibility: day ? "visible" : "hidden",
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              <span>Less</span>
              {LEVEL_OPACITY.map((op, i) => (
                <span
                  key={i}
                  className="rounded-[2px] border border-ink/15 bg-accent-2"
                  style={{ width: CELL, height: CELL, opacity: Math.max(op, 0.06) }}
                />
              ))}
              <span>More</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
