"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

// How long the "need anything ask me" pill stays out after the page
// settles, and how long it waits before showing at all (lets the intro
// screen / hero finish landing first).
const GREETING_DELAY_MS = 1200;
const GREETING_VISIBLE_MS = 4000;

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Evening. Ask me anything about Ayush's work, stack, or how to get in touch.",
};

export default function ChatWidget() {
  const [greetingOpen, setGreetingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
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

  async function sendMessage() {
    const text = input.trim();
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

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the tip line. Try again in a moment.");
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
                  Tip Line
                </span>
                <h2
                  id="chat-widget-title"
                  className="mt-0.5 font-display text-[18px] leading-none text-ink"
                >
                  Got A Lead?
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
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] border-2 border-ink px-3.5 py-2.5 ${
                    m.role === "user" ? "ml-auto bg-ink text-paper" : "bg-paper-bright text-ink"
                  }`}
                >
                  <p className="font-text text-sm leading-[1.5]">{m.content}</p>
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
                placeholder="Type your tip…"
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
