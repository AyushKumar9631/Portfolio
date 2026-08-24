"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

// How long the "need anything ask me" pill stays out after the page
// settles, and how long it waits before showing at all (lets the intro
// screen / hero finish landing first).
const GREETING_DELAY_MS = 1200;
const GREETING_VISIBLE_MS = 4000;

export default function ChatWidget() {
  const [greetingOpen, setGreetingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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

  function handleTriggerClick() {
    setGreetingOpen(false);
    setChatOpen((v) => !v);
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
            <div className="flex-1 space-y-3 overflow-y-auto bg-paper-warm px-4 py-4">
              <div className="max-w-[85%] border-2 border-ink bg-paper-bright px-3.5 py-2.5">
                <p className="font-text text-sm leading-[1.5] text-ink">
                  Evening. Ask me anything about Ayush&apos;s work, stack, or how to get in
                  touch.
                </p>
              </div>
            </div>

            {/* Input row — not wired up yet, next step */}
            <div className="flex flex-none items-center gap-2 border-t-2 border-ink px-3 py-3">
              <input
                type="text"
                placeholder="Type your tip…"
                disabled
                className="min-w-0 flex-1 border-2 border-ink/40 bg-paper px-3 py-2 font-text text-sm text-ink placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                disabled
                aria-label="Send"
                className="flex h-9 w-9 flex-none items-center justify-center border-2 border-ink bg-ink text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={14} aria-hidden="true" />
              </button>
            </div>
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
