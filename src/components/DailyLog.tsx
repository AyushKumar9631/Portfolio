"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import TicTacToe from "@/components/TicTacToe";

// How many days show at once. No horizontal scroll — this many day columns
// must fit the section width, so raise it and cells get proportionally
// narrower (still square), lower it and they get wider.
const VISIBLE_DAYS = 25;

// One row per day in Supabase (`daily_log`, see supabase/daily_log.sql). The
// UI transposes this: each topic becomes a table row, each day becomes a
// column — rows and columns swapped from how the data is stored.
type DailyLogRow = {
  log_date: string; // "YYYY-MM-DD"
  web_dev: boolean;
  leetcode_potd: boolean;
  gfg_potd: boolean;
  dbms: boolean;
};

type TopicKey = Exclude<keyof DailyLogRow, "log_date">;

const TOPICS: { key: TopicKey; label: string; title: string }[] = [
  { key: "web_dev", label: "Web Dev", title: "Web development — active build/ship time" },
  { key: "leetcode_potd", label: "LeetCode POTD", title: "LeetCode — problem of the day" },
  { key: "gfg_potd", label: "GfG POTD", title: "GeeksforGeeks — problem of the day" },
  { key: "dbms", label: "DBMS", title: "DBMS — concept review" },
];

// Grid track template shared by the header row and every topic row so their
// columns line up. Label column shrinks a little on narrow screens; day
// columns split the rest evenly and stay square via aspect-square below.
const GRID_TEMPLATE = `clamp(88px, 20vw, 168px) repeat(${VISIBLE_DAYS}, 1fr)`;

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function dayNumber(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).getDate();
}

function fullDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DailyLog({
  isAdmin = false,
  onAdminUnlock,
}: {
  isAdmin?: boolean;
  onAdminUnlock?: () => void;
}) {
  const [rows, setRows] = useState<DailyLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureAndLoad() {
      if (!supabase || !isSupabaseConfigured) {
        setError(
          "Not connected yet — add your Supabase project URL and anon key to .env.local.",
        );
        setRows([]);
        return;
      }

      const today = toISODate(new Date());

      // Backfill: find the most recently logged day and create every day
      // between it and today (covers days that went unlogged), all
      // defaulting to false. First-ever run seeds the last VISIBLE_DAYS
      // days instead, since there's no prior row to count from.
      try {
        const { data: latest } = await supabase
          .from("daily_log")
          .select("log_date")
          .order("log_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        const start = latest
          ? addDays(latest.log_date as string, 1)
          : addDays(today, -(VISIBLE_DAYS - 1));

        if (start <= today) {
          const missing: { log_date: string }[] = [];
          for (let cursor = start; cursor <= today; cursor = addDays(cursor, 1)) {
            missing.push({ log_date: cursor });
          }
          if (missing.length > 0) {
            await supabase
              .from("daily_log")
              .upsert(missing, { onConflict: "log_date", ignoreDuplicates: true });
          }
        }
      } catch {
        // Backfill is best-effort — if it fails (e.g. the insert policy
        // isn't set up yet) fall through and just show whatever exists.
      }

      if (cancelled) return;

      const { data, error: fetchError } = await supabase
        .from("daily_log")
        .select("log_date, web_dev, leetcode_potd, gfg_potd, dbms")
        .order("log_date", { ascending: false })
        .limit(VISIBLE_DAYS);

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load the daily log right now.");
        setRows([]);
        return;
      }

      // Oldest -> newest, left to right.
      setRows(((data as DailyLogRow[]) ?? []).slice().reverse());
    }

    ensureAndLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleCell(logDate: string, topic: TopicKey) {
    if (!isAdmin) return;

    setRows((prev) =>
      prev ? prev.map((r) => (r.log_date === logDate ? { ...r, [topic]: !r[topic] } : r)) : prev,
    );

    try {
      const res = await fetch("/api/admin/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_date: logDate, topic }),
      });
      if (!res.ok) throw new Error("toggle failed");
      const data = await res.json();
      setRows((prev) =>
        prev ? prev.map((r) => (r.log_date === logDate ? { ...r, [topic]: data.value } : r)) : prev,
      );
    } catch {
      setRows((prev) =>
        prev ? prev.map((r) => (r.log_date === logDate ? { ...r, [topic]: !r[topic] } : r)) : prev,
      );
    }
  }

  return (
    <div className="mt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="flex flex-wrap items-end justify-between gap-5 pb-2.5"
      >
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
            Field Notes
          </span>
          <h3 className="mt-1.5 font-display text-[clamp(24px,3vw,34px)] font-normal leading-[1.05] tracking-[-0.01em] text-ink">
            The Daily Docket
          </h3>
        </div>
        <div className="hidden flex-1 justify-center self-end sm:flex">
          <TicTacToe onUnlock={onAdminUnlock} />
        </div>
        <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Presence logged across the last {VISIBLE_DAYS} days
        </span>
      </motion.div>
      <div className="h-1 bg-ink" />

      <div className="mt-6 border-2 border-ink">
        {rows === null && (
          <p className="px-4 py-6 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Loading the docket…
          </p>
        )}

        {rows !== null && rows.length === 0 && (
          <p className="px-4 py-6 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {error ?? "No entries logged yet."}
          </p>
        )}

        {rows !== null && rows.length > 0 && (
          <div role="table" aria-label="Daily activity log" className="font-mono">
            <div
              role="row"
              className="grid bg-ink text-bg"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div
                role="columnheader"
                className="border-r border-bg/25 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                Activity
              </div>
              {rows.map((row) => (
                <div
                  key={row.log_date}
                  role="columnheader"
                  title={fullDateLabel(row.log_date)}
                  className="flex items-center justify-center border-l border-bg/25 px-0.5 py-2 text-[9px] font-bold"
                >
                  {dayNumber(row.log_date)}
                </div>
              ))}
            </div>

            {TOPICS.map((topic, i) => (
              <div
                key={topic.key}
                role="row"
                className={`group grid transition-colors hover:bg-bg-elevated ${
                  i === 0 ? "" : "border-t border-ink/25"
                }`}
                style={{ gridTemplateColumns: GRID_TEMPLATE }}
              >
                <div
                  role="rowheader"
                  title={topic.title}
                  className="flex items-center truncate border-r border-ink/25 bg-bg px-3 py-2 font-display text-[13px] tracking-normal text-ink transition-colors group-hover:bg-bg-elevated sm:text-[15px]"
                >
                  {topic.label}
                </div>
                {rows.map((row) => (
                  <div
                    key={row.log_date}
                    role="cell"
                    aria-label={
                      isAdmin
                        ? undefined
                        : `${topic.label} on ${fullDateLabel(row.log_date)}: ${
                            row[topic.key] ? "logged" : "not logged"
                          }`
                    }
                    className="aspect-square flex items-center justify-center border-l border-ink/10"
                  >
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => toggleCell(row.log_date, topic.key)}
                        aria-label={`Toggle ${topic.label} on ${fullDateLabel(row.log_date)}: currently ${
                          row[topic.key] ? "logged" : "not logged"
                        }`}
                        className="flex h-full w-full cursor-pointer items-center justify-center bg-transparent transition-colors hover:bg-ink/10"
                      >
                        {row[topic.key] && (
                          <Check size={12} strokeWidth={3} className="text-accent-2" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      row[topic.key] && (
                        <Check size={12} strokeWidth={3} className="text-accent-2" aria-hidden="true" />
                      )
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div
              role="row"
              className="grid border-t border-ink/25"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              <div
                role="rowheader"
                title="Machine learning — on pause for now"
                className="flex items-center truncate border-r border-ink/25 bg-bg px-3 py-2 font-display text-[13px] tracking-normal text-ink sm:text-[15px]"
              >
                ML
              </div>
              <div
                role="cell"
                style={{ gridColumn: "2 / -1" }}
                className="flex items-center justify-center px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:text-[11px]"
              >
                Continuing soon ...
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-left font-mono text-[11px] font-medium tracking-[0.04em] text-muted sm:text-right">
        A mark confirms the habit was logged that day — a blank cell means it wasn&apos;t.
      </p>
    </div>
  );
}
