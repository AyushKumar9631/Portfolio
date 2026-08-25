"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, ArrowRight, ExternalLink } from "lucide-react";

// How long the "need anything ask me" pill stays out after the page
// settles, and how long it waits before showing at all (lets the intro
// screen / hero finish landing first).
const GREETING_DELAY_MS = 1200;
const GREETING_VISIBLE_MS = 4000;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  buttonName?: string;
  link?: string;
};

type Suggestion = { question: string; preview?: string };

const SUGGESTIONS: Suggestion[] = [
  { question: "Tell me about him", preview: "He's a …" },
  { question: "Take me to his works" },
  { question: "Show me his grade card" },
];

function SuggestionsPanel({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent-2">
        Try Asking
      </span>
      <div className="flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.question}
            type="button"
            onClick={() => onPick(s.question)}
            className="border-2 border-ink bg-paper-bright px-3.5 py-2.5 text-left text-ink transition-colors hover:bg-bg-elevated"
          >
            <span className="block font-text text-sm leading-[1.4]">{s.question}</span>
            {s.preview && (
              <span className="mt-0.5 block font-text text-xs italic text-ink-soft">
                {s.preview}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** External destinations (other sites, docs, mailto) open in a new tab
 * via a plain <a>. Internal ones (section anchors, case-file/career-log
 * pages) use next/link so the site's route transition still applies. */
function isExternalLink(link: string) {
  return link.startsWith("http") || link.startsWith("mailto:");
}

function MessageLinkButton({
  buttonName,
  link,
  onNavigate,
}: {
  buttonName: string;
  link: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const classes =
    "mt-2.5 inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-transparent hover:text-ink";

  if (isExternalLink(link)) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={classes}>
        {buttonName}
        <ExternalLink size={12} aria-hidden="true" />
      </a>
    );
  }

  // Internal path, possibly with a "#section" hash (e.g. "/#work").
  const hashIndex = link.indexOf("#");
  const hash = hashIndex !== -1 ? link.slice(hashIndex + 1) : null;
  const path = hashIndex !== -1 ? link.slice(0, hashIndex) || "/" : link;

  function handleClick(e: React.MouseEvent) {
    onNavigate();
    // Next's router only re-scrolls a hash Link when the target URL
    // differs from the current one. If we're already on the target page,
    // the hash in the address bar is already set from a previous click,
    // so Link treats a repeat click (or a fresh button pointing at the
    // same section on a later turn) as a no-op. Scroll manually instead
    // — this always works, first click or fiftieth.
    if (hash && pathname === path) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", link);
    }
    // Otherwise we're crossing routes (e.g. from a case-file page back to
    // "/"); that's always a genuine navigation, so let Link handle it —
    // Next scrolls to the hash itself once the new page lands.
  }

  return (
    <Link href={link} onClick={handleClick} className={classes}>
      {buttonName}
      <ArrowRight size={12} aria-hidden="true" />
    </Link>
  );
}

export default function ChatWidget() {
  const [greetingOpen, setGreetingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // One-shot greeting pill on first mount. Root layout never remounts on
  // client-side navigation (see MotionProvider), so this only plays once
  // per visit rather than on every route change.
  useEffect(() => {
    const showTimer = setTimeout(() => setGreetingOpen(true), GREETING_DELAY_MS);
    const hideTimer = setTimeout(
      () => setGreetingOpen(false),
      GREETING_DELAY_MS + GREETING_VISIBLE_MS,
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setChatOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatOpen]);

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function handleTriggerClick() {
    setGreetingOpen(false);
    setChatOpen((v) => !v);
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.reply) {
        throw new Error(data?.error ?? "Something went wrong");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, buttonName: data.buttonName, link: data.link },
      ]);
    } catch {
      setError("Couldn't reach Jarvis. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage();
  }

  const showGreetingText = greetingOpen && !chatOpen;

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-widget-title"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-[calc(100%+16px)] right-0 flex h-[70vh] max-h-[560px] w-[92vw] max-w-[380px] flex-col border-2 border-ink bg-paper shadow-[0_20px_60px_rgba(22,20,15,0.35)]"
          >
            {/* Header */}
            <div className="flex flex-none items-center justify-between gap-3 border-b-2 border-ink px-4 py-3.5">
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent-2">
                  Assistance
                </span>
                <h2
                  id="chat-widget-title"
                  className="mt-0.5 font-display text-[18px] leading-none text-ink"
                >
                  Need Something? Ask Jarvis!!
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 flex-none items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-paper-warm px-4 py-4"
            >
              {messages.length === 0 && !loading && (
                <SuggestionsPanel onPick={(q) => sendMessage(q)} />
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] border-2 border-ink px-3.5 py-2.5 ${
                    m.role === "user" ? "ml-auto bg-ink text-paper" : "bg-paper-bright text-ink"
                  }`}
                >
                  <p className="font-text text-sm leading-[1.5]">{m.content}</p>
                  {m.buttonName && m.link && (
                    <MessageLinkButton
                      buttonName={m.buttonName}
                      link={m.link}
                      onNavigate={() => setChatOpen(false)}
                    />
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex max-w-[85%] items-center gap-2 border-2 border-ink bg-paper-bright px-3.5 py-2.5 text-ink">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-soft">
                    Typing…
                  </span>
                </div>
              )}
              {error && (
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-accent-2">
                  {error}
                </p>
              )}
            </div>

            {/* Input row */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-none items-center gap-2 border-t-2 border-ink px-3 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Jarvis…"
                disabled={loading}
                className="min-w-0 flex-1 border-2 border-ink/40 bg-paper px-3 py-2 font-text text-sm text-ink placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 flex-none items-center justify-center border-2 border-ink bg-ink text-paper transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-paper"
              >
                <Send size={14} aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        layout
        onClick={handleTriggerClick}
        aria-expanded={chatOpen}
        aria-label={chatOpen ? "Close chat" : "Open chat"}
        transition={{ layout: { duration: 0.35, ease: "easeInOut" } }}
        className={`flex h-14 items-center overflow-hidden rounded-full border-2 border-ink bg-ink text-paper shadow-[0_8px_24px_rgba(22,20,15,0.3)] ${
          showGreetingText ? "gap-2.5 px-5" : "w-14 justify-center"
        }`}
      >
        <motion.span layout="position" className="flex flex-none items-center justify-center">
          {chatOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <MessageCircle size={20} aria-hidden="true" />
          )}
        </motion.span>
        <AnimatePresence initial={false}>
          {showGreetingText && (
            <motion.span
              key="greeting"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25 }}
              className="whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.06em]"
            >
              Need anything? Ask me !!
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
