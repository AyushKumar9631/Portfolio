"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Inbox as InboxIcon, Loader2, RefreshCw } from "lucide-react";

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't load messages.");
      setMessages((data?.messages as Message[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount, mirrors the same pattern in DailyLog
    load();
  }, [load]);

  return (
    <>
      <div className="mb-[30px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="flex flex-wrap items-baseline justify-between gap-5 pb-2.5"
        >
          <div>
            <span className="block font-gothic text-xs font-bold uppercase tracking-[0.18em] text-accent-2">
              Eyes Only
            </span>
            <h2 className="mt-1.5 font-display text-[clamp(30px,4vw,46px)] font-normal leading-[1.02] tracking-[-0.015em]">
              The Inbox
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {messages ? `${messages.length} on file` : "Loading…"}
            </span>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-label="Refresh messages"
              className="flex h-8 w-8 flex-none items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
          style={{ transformOrigin: "left" }}
          className="h-1 bg-ink"
        />
      </div>

      <div className="border-2 border-ink">
        {messages === null && (
          <p className="flex items-center gap-2 px-6 py-10 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Pulling the inbox…
          </p>
        )}

        {messages !== null && messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <InboxIcon size={22} className="text-ink-soft" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
              {error ?? "No messages on file yet."}
            </p>
          </div>
        )}

        {messages !== null && messages.length > 0 && (
          <ul>
            {messages.map((m, i) => (
              <li
                key={m.id}
                className={`px-5 py-4 transition-colors hover:bg-bg-elevated sm:px-8 ${
                  i === 0 ? "" : "border-t border-ink/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[19px] leading-tight text-ink">
                      {m.subject?.trim() || "No subject"}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                      {m.name} · {m.email}
                    </p>
                  </div>
                  <span className="flex-none font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    {formatTimestamp(m.created_at)}
                  </span>
                </div>
                <p className="mt-2.5 max-w-[70ch] font-text text-sm leading-[1.55] text-ink">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
