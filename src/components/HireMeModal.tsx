"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, Download, Mail, Loader2, ExternalLink, Briefcase } from "lucide-react";
import {
  credentialGroups,
  standaloneDocuments,
  allCredentialDocuments,
  getDownloadUrl,
  getPreviewUrl,
  type CredentialDocument,
} from "@/lib/credentials";

type HireMeModalProps = {
  open: boolean;
  onClose: () => void;
};

function DocButton({
  doc,
  active,
  onSelect,
}: {
  doc: CredentialDocument;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex w-full items-start gap-2.5 border-b border-ink/15 px-5 py-3 text-left transition-colors sm:px-6 sm:py-3.5 ${
        active ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-bg-elevated"
      }`}
    >
      <FileText size={14} className="mt-0.5 flex-none" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em]">
          <span className="min-w-0 truncate">{doc.title}</span>
          {doc.tag && (
            <span
              className={`flex-none border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.08em] ${
                active ? "border-paper text-paper" : "border-accent-2 text-accent-2"
              }`}
            >
              {doc.tag}
            </span>
          )}
        </span>
        <span
          className={`font-mono text-[10px] font-normal normal-case tracking-normal ${
            active ? "text-paper/70" : "text-ink-soft"
          }`}
        >
          {doc.category} · {doc.period}
        </span>
      </span>
    </button>
  );
}

export default function HireMeModal({ open, onClose }: HireMeModalProps) {
  const [selectedId, setSelectedId] = useState<string>(allCredentialDocuments[0]?.id ?? "");
  const [previewLoading, setPreviewLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset the selection back to the first document every time the modal
  // transitions from closed to open. This runs during render (React's
  // documented pattern for resetting state on a prop change) rather than
  // in an effect, so it doesn't cost an extra post-paint render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedId(allCredentialDocuments[0]?.id ?? "");
      setPreviewLoading(true);
    }
  }

  const selectedDoc: CredentialDocument | undefined = allCredentialDocuments.find(
    (doc) => doc.id === selectedId,
  );

  // Lock page scroll and move focus into the dialog for as long as it's
  // open; restore both the moment it closes or unmounts.
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

  function selectDoc(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    setPreviewLoading(true);
  }

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel — covers most of the viewport, never all of it */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-me-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 flex h-[88vh] max-h-[760px] w-full max-w-5xl flex-col border-2 border-ink bg-paper shadow-[0_20px_60px_rgba(22,20,15,0.35)] outline-none"
          >
            {/* Header */}
            <div className="flex flex-none items-center justify-between gap-4 border-b-2 border-ink px-5 py-4 sm:px-8">
              <div>
                <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-2">
                  Background Check
                </span>
                <h2
                  id="hire-me-title"
                  className="mt-1 font-display text-[clamp(20px,2.6vw,30px)] font-normal leading-none text-ink"
                >
                  The Paper Trail
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 flex-none items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Body: document list + preview */}
            <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
              {/* Sidebar — vertical on every breakpoint; its own scroll
                  region so a long document list never pushes the preview
                  off-screen. Capped shorter on mobile, where it sits above
                  the preview rather than beside it. */}
              <div className="flex max-h-[38vh] flex-none flex-col overflow-y-auto border-b-2 border-ink bg-paper-warm sm:h-full sm:max-h-none sm:w-[280px] sm:border-b-0 sm:border-r-2">
                <div className="flex-none px-5 pb-2 pt-4 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft sm:px-6 sm:pt-5">
                  {allCredentialDocuments.length} on file
                </div>

                {credentialGroups.map((group) => (
                  <div key={group.id} className="flex-none">
                    <div className="px-5 pb-1.5 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent-2 sm:px-6">
                      {group.label}
                    </div>
                    {group.documents.map((doc) => (
                      <DocButton
                        key={doc.id}
                        doc={doc}
                        active={doc.id === selectedId}
                        onSelect={() => selectDoc(doc.id)}
                      />
                    ))}
                  </div>
                ))}

                {standaloneDocuments.length > 0 && (
                  <div className="flex-none border-t border-ink/20 pt-1">
                    {standaloneDocuments.map((doc) => (
                      <DocButton
                        key={doc.id}
                        doc={doc}
                        active={doc.id === selectedId}
                        onSelect={() => selectDoc(doc.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Preview + actions */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {selectedDoc ? (
                  <>
                    <div className="flex flex-none flex-wrap items-start justify-between gap-4 border-b border-ink/20 px-5 py-4 sm:px-8">
                      <div>
                        <h3 className="font-display text-[20px] leading-tight text-ink sm:text-[24px]">
                          {selectedDoc.title}
                        </h3>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                          {selectedDoc.category} · {selectedDoc.period}
                        </p>
                        <p className="mt-2 max-w-[54ch] font-text text-sm leading-[1.5] text-muted">
                          {selectedDoc.description}
                        </p>
                      </div>

                      <div className="flex flex-none flex-wrap gap-2.5">
                        <a
                          href={getDownloadUrl(selectedDoc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 whitespace-nowrap border-2 border-ink bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-transparent hover:text-ink"
                        >
                          <Download size={14} aria-hidden="true" />
                          Download
                        </a>
                        <a
                          href="#contact"
                          onClick={onClose}
                          className="inline-flex items-center gap-2 whitespace-nowrap border-2 border-ink bg-transparent px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper"
                        >
                          <Mail size={14} aria-hidden="true" />
                          Contact him
                        </a>
                      </div>
                    </div>

                    <div className="relative flex-1 bg-paper-warm p-3 sm:p-5">
                      <div className="relative h-full w-full border-2 border-ink bg-paper-bright">
                        {previewLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                            Loading preview…
                          </div>
                        )}
                        <iframe
                          key={selectedDoc.id}
                          src={getPreviewUrl(selectedDoc)}
                          title={`Preview — ${selectedDoc.title}`}
                          onLoad={() => setPreviewLoading(false)}
                          className={`h-full w-full transition-opacity duration-200 ${
                            previewLoading ? "opacity-0" : "opacity-100"
                          }`}
                          allow="autoplay"
                        />
                      </div>
                      <a
                        href={selectedDoc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft transition-colors hover:text-ink"
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        Trouble viewing? Open in a new tab
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    <Briefcase size={22} className="text-ink-soft" aria-hidden="true" />
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                      No documents on file yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
