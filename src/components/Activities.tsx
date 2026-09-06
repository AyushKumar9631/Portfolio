"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Pencil, Plus, ListChecks } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import TicTacToe from "@/components/TicTacToe";
import ActivityFormModal, { type Activity } from "@/components/ActivityFormModal";
import { GithubIcon } from "@/components/icons/BrandIcons";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Activities({
  isAdmin = false,
  onAdminUnlock,
}: {
  isAdmin?: boolean;
  onAdminUnlock?: (expiresAt: number | null) => void;
}) {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase || !isSupabaseConfigured) {
        setError("Not connected yet — add your Supabase project URL and anon key to .env.local.");
        setActivities([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("activities")
        .select("id, created_at, name, description, duration, activity_date, github_link, demo_link, tags")
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load activities right now.");
        setActivities([]);
        return;
      }

      setActivities((data as Activity[]) ?? []);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setModalOpen(true);
  }

  function handleSaved(saved: Activity) {
    setActivities((prev) => {
      if (!prev) return [saved];
      const exists = prev.some((a) => a.id === saved.id);
      const next = exists ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev];
      return next
        .slice()
        .sort(
          (a, b) =>
            b.activity_date.localeCompare(a.activity_date) || b.created_at.localeCompare(a.created_at),
        );
    });
  }

  function handleDeleted(id: string) {
    setActivities((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
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
            The Activity Log
          </h3>
        </div>
        <div className="hidden flex-1 justify-center self-end sm:flex">
          <TicTacToe onUnlock={onAdminUnlock} />
        </div>
        <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          What&apos;s been worked on recently
        </span>
      </motion.div>
      <div className="h-1 bg-ink" />

      <div className="mt-6 border-2 border-ink">
        {isAdmin && (
          <div className="flex items-center justify-end border-b-2 border-ink bg-bg-elevated px-4 py-2.5">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              <Plus size={14} aria-hidden="true" />
              Add Activity
            </button>
          </div>
        )}

        {activities === null && (
          <p className="px-4 py-6 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Loading activity…
          </p>
        )}

        {activities !== null && activities.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ListChecks size={22} className="text-ink-soft" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
              {error ?? "No activity logged yet."}
            </p>
          </div>
        )}

        {activities !== null && activities.length > 0 && (
          <ul>
            {activities.map((activity, i) => (
              <li
                key={activity.id}
                className={`group px-5 py-4 transition-colors hover:bg-bg-elevated sm:px-6 ${
                  i === 0 ? "" : "border-t border-ink/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[19px] leading-tight text-ink">{activity.name}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                      {formatDate(activity.activity_date)} · {activity.duration}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => openEdit(activity)}
                      aria-label={`Edit ${activity.name}`}
                      className="flex h-8 w-8 flex-none items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <p className="mt-2.5 max-w-[70ch] font-text text-sm leading-[1.55] text-ink">
                  {activity.description}
                </p>

                {activity.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-ink/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {(activity.github_link || activity.demo_link) && (
                  <div className="mt-3 flex flex-wrap gap-4">
                    {activity.github_link && (
                      <a
                        href={activity.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border-b-[1.5px] border-accent-2 pb-0.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-accent-2 transition-colors hover:border-ink hover:text-ink"
                      >
                        <GithubIcon size={13} />
                        GitHub
                      </a>
                    )}
                    {activity.demo_link && (
                      <a
                        href={activity.demo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border-b-[1.5px] border-accent-2 pb-0.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-accent-2 transition-colors hover:border-ink hover:text-ink"
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                        Demo
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ActivityFormModal
        open={modalOpen}
        activity={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
