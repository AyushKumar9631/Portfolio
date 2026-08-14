"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// One row per day in Supabase (`daily_log`, see supabase.sql). The UI below
// transposes this: each topic becomes a table row, each day becomes a
// column — rows and columns swapped from how the data is stored.
type DailyLogRow = {
  log_date: string; // "YYYY-MM-DD"
  web_dev: boolean;
  leetcode_potd: boolean;
  gfg_potd: boolean;
  dbms: boolean;
  ml_learning: boolean;
};

type TopicKey = Exclude<keyof DailyLogRow, "log_date">;

const TOPICS: { key: TopicKey; label: string }[] = [
  { key: "web_dev", label: "Web Dev — Active Development" },
  { key: "leetcode_potd", label: "LeetCode — Problem of the Day" },
  { key: "gfg_potd", label: "GfG — Problem of the Day" },
  { key: "dbms", label: "DBMS — Under Review" },
  { key: "ml_learning", label: "ML — Study Session" },
];

function formatDay(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function DailyLog() {
  const [rows, setRows] = useState<DailyLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase || !isSupabaseConfigured) {
        setError(
          "Not connected yet — add your Supabase project URL and anon key to .env.local.",
        );
        setRows([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("daily_log")
        .select("log_date, web_dev, leetcode_potd, gfg_potd, dbms, ml_learning")
        .order("log_date", { ascending: false })
        .limit(31);

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load the daily log right now.");
        setRows([]);
        return;
      }

      // Oldest -> newest, left to right.
      setRows(((data as DailyLogRow[]) ?? []).slice().reverse());
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="flex flex-wrap items-baseline justify-between gap-5 pb-2.5"
      >
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink">
            Field Notes
          </span>
          <h3 className="mt-1.5 font-display text-[clamp(24px,3vw,34px)] font-normal leading-[1.05] tracking-[-0.01em] text-ink">
            The Daily Docket
          </h3>
        </div>
        <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Presence logged across the last 31 days
        </span>
      </motion.div>
      <div className="h-1 bg-ink" />

      <div className="mt-6 overflow-x-auto border-2 border-ink">
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
          <table className="w-full border-separate border-spacing-0 font-mono text-[11px]">
            <thead>
              <tr className="bg-ink text-bg">
                <th className="sticky left-0 z-10 min-w-[200px] border-r border-bg/25 bg-ink px-4 py-[9px] text-left font-bold uppercase tracking-[0.12em]">
                  Activity
                </th>
                {rows.map((row) => (
                  <th
                    key={row.log_date}
                    className="min-w-[34px] border-l border-bg/25 px-1 py-[9px] text-center font-bold uppercase tracking-[0.08em]"
                  >
                    {formatDay(row.log_date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((topic, i) => (
                <tr key={topic.key} className="group">
                  <td
                    className={`sticky left-0 z-10 bg-bg px-4 py-2.5 text-left font-display text-[15px] tracking-normal text-ink transition-colors group-hover:bg-bg-elevated ${
                      i === 0 ? "" : "border-t border-ink/25"
                    } border-r border-ink/25`}
                  >
                    {topic.label}
                  </td>
                  {rows.map((row) => (
                    <td
                      key={row.log_date}
                      className={`border-l border-ink/10 px-1 py-2.5 text-center text-muted transition-colors group-hover:bg-bg-elevated ${
                        i === 0 ? "" : "border-t border-ink/25"
                      }`}
                    >
                      {row[topic.key] ? (
                        <Check
                          size={13}
                          strokeWidth={3}
                          className="mx-auto text-accent-2"
                          aria-label="Logged"
                        />
                      ) : (
                        <span aria-hidden="true">&nbsp;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-left font-mono text-[11px] font-medium tracking-[0.04em] text-muted sm:text-right">
        A mark confirms the habit was logged that day — a blank cell means it wasn&apos;t.
      </p>
    </div>
  );
}
