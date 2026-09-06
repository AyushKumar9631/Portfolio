"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Trash2 } from "lucide-react";

export type Activity = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  duration: string;
  activity_date: string; // "YYYY-MM-DD"
  github_link: string | null;
  demo_link: string | null;
  tags: string[];
};

type ActivityFormModalProps = {
  open: boolean;
  /** Editing this activity, or null when adding a brand new one. */
  activity: Activity | null;
  onClose: () => void;
  /** Called with the saved row after a successful create/update. */
  onSaved: (activity: Activity) => void;
  /** Called after a successful delete. */
  onDeleted: (id: string) => void;
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const emptyForm = {
  name: "",
  description: "",
  duration: "",
  activity_date: todayISO(),
  github_link: "",
  demo_link: "",
  tags: "",
};

export default function ActivityFormModal({
  open,
  activity,
  onClose,
  onSaved,
  onDeleted,
}: ActivityFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Repopulate the form whenever the modal opens (either fresh, or with the
  // activity being edited) — mirrors the reset-on-prop-change pattern used
  // in HireMeModal, run during render rather than an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError(null);
      setForm(
        activity
          ? {
              name: activity.name,
              description: activity.description,
              duration: activity.duration,
              activity_date: activity.activity_date,
              github_link: activity.github_link ?? "",
              demo_link: activity.demo_link ?? "",
              tags: activity.tags.join(", "),
            }
          : emptyForm,
      );
    }
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      activity_date: form.activity_date,
      github_link: form.github_link.trim() || null,
      demo_link: form.demo_link.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(
        activity ? `/api/admin/activities/${activity.id}` : "/api/admin/activities",
        {
          method: activity ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't save the activity.");
      onSaved(data.activity as Activity);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the activity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activity) return;
    if (!window.confirm(`Delete "${activity.name}"? This can't be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/activities/${activity.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't delete the activity.");
      onDeleted(activity.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the activity.");
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={busy ? undefined : onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-form-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col border-2 border-ink bg-paper shadow-[0_20px_60px_rgba(22,20,15,0.35)] outline-none"
          >
            <div className="flex flex-none items-center justify-between gap-4 border-b-2 border-ink px-5 py-4 sm:px-7">
              <div>
                <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-2">
                  {activity ? "Amend Record" : "New Entry"}
                </span>
                <h2
                  id="activity-form-title"
                  className="mt-1 font-display text-[clamp(19px,2.4vw,26px)] font-normal leading-none text-ink"
                >
                  {activity ? "Edit Activity" : "Add Activity"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
                className="flex h-9 w-9 flex-none items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-4">
                <Field label="Name" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                    placeholder="Built a rate limiter for the API"
                  />
                </Field>

                <Field label="Description" required>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full resize-y border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                    placeholder="What it is, what it does, why it exists…"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date" required>
                    <input
                      type="date"
                      required
                      value={form.activity_date}
                      onChange={(e) => updateField("activity_date", e.target.value)}
                      className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent-2"
                    />
                  </Field>
                  <Field label="Duration" required>
                    <input
                      type="text"
                      required
                      value={form.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                      className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                      placeholder="3 days / Jun — Aug 2026"
                    />
                  </Field>
                </div>

                <Field label="GitHub link">
                  <input
                    type="url"
                    value={form.github_link}
                    onChange={(e) => updateField("github_link", e.target.value)}
                    className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                    placeholder="https://github.com/…"
                  />
                </Field>

                <Field label="Demo link">
                  <input
                    type="url"
                    value={form.demo_link}
                    onChange={(e) => updateField("demo_link", e.target.value)}
                    className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                    placeholder="https://…"
                  />
                </Field>

                <Field label="Tags" hint="Comma-separated">
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    className="w-full border-2 border-ink bg-paper-bright px-3 py-2 font-text text-sm text-ink outline-none focus:border-accent-2"
                    placeholder="Next.js, Supabase, DSA"
                  />
                </Field>
              </div>

              {error && (
                <p className="mt-4 border-2 border-accent-2 bg-paper-bright px-3 py-2 font-mono text-xs text-accent-2">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-none items-center justify-between gap-3 border-t border-ink/20 pt-4">
                {activity ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex items-center gap-2 border-2 border-ink px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 size={14} aria-hidden="true" />
                    )}
                    Delete
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                  {activity ? "Save changes" : "Add activity"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
        {required && <span className="text-accent-2"> *</span>}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-muted">({hint})</span>}
      </span>
      {children}
    </label>
  );
}
