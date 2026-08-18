"use client";

import { useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { profile } from "@/lib/data";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm: FormState = { name: "", email: "", subject: "", message: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Enter your name.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name is too short.";
  }

  if (!form.email.trim()) {
    errors.email = "Enter your email.";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.message.trim()) {
    errors.message = "Enter a message.";
  } else if (form.message.trim().length < 10) {
    errors.message = "Message should be at least 10 characters.";
  }

  return errors;
}

const fieldClasses =
  "w-full border-2 border-ink bg-paper-bright px-3.5 py-3 font-text text-[16px] text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40";

const headerGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const headlineWords = ["Letters", "&", "Commissions"];

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot — real visitors never fill this hidden field.
    const honeypot = new FormData(e.currentTarget).get("company");
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return;
    }

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      setStatus("error");
      setStatusMessage(
        "The contact form isn't connected yet — add your Supabase project URL and anon key to .env.local (see .env.local.example).",
      );
      return;
    }

    setStatus("submitting");
    setStatusMessage("");

    const { error } = await supabase.from("messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });

    if (error) {
      setStatus("error");
      setStatusMessage(
        "Something went wrong sending your message. Please try again, or email him directly.",
      );
      return;
    }

    setStatus("success");
    setStatusMessage("Message sent — thanks for reaching out, he'll reply soon.");
    setForm(initialForm);
  }

  const isSubmitting = status === "submitting";

  return (
    <section id="contact" className="border-t-4 border-ink py-[76px]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-[30px]">
        <div className="mb-[30px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={headerGroup}
            className="flex flex-wrap items-baseline justify-between gap-5 pb-2.5"
          >
            <div>
              <motion.span
                variants={fadeUp}
                className="block font-gothic text-xs font-bold uppercase tracking-[0.18em] text-ink"
              >
                Submit a Tip
              </motion.span>
              <h2 className="mt-1.5 font-display text-[clamp(30px,4vw,46px)] font-normal leading-[1.02] tracking-[-0.015em]">
                {headlineWords.map((word, i) => (
                  <motion.span key={word + i} variants={wordReveal} className="inline-block">
                    {word}
                    {i < headlineWords.length - 1 ? "\u00A0" : ""}
                  </motion.span>
                ))}
              </h2>
            </div>
            <motion.span
              variants={fadeUp}
              className="whitespace-nowrap font-gothic text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft"
            >
              The desk is open for select work — 2026
            </motion.span>
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

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid grid-cols-1 border-2 border-ink min-[600px]:grid-cols-[1.15fr_0.85fr]"
        >
          {/* Form column */}
          <div className="border-b-2 border-ink p-6 min-[600px]:border-b-0 min-[600px]:border-r-2 min-[600px]:p-9">
            <h3 className="mb-1.5 font-display text-[32px] font-normal">Put it in writing</h3>
            <p className="mb-6 font-text text-[15px] leading-[1.55] text-ink-soft">
              {
                "A project in mind, a role to fill, or just a good question — send it through and he'll get back to you."
              }
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <input
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                name="company"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2">
                <div className="mb-4">
                  <label
                    htmlFor="contact-name"
                    className="mb-[7px] block font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={fieldClasses}
                    placeholder="Jane Doe"
                    required
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="mt-2 font-text text-xs text-red-700">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="contact-email"
                    className="mb-[7px] block font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={fieldClasses}
                    placeholder="jane@company.com"
                    required
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="mt-2 font-text text-xs text-red-700">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact-subject"
                  className="mb-[7px] block font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className={fieldClasses}
                  placeholder="A new product, a rebuild, a contract..."
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact-message"
                  className="mb-[7px] block font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft"
                >
                  The story
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={`${fieldClasses} min-h-[120px] resize-y leading-[1.5]`}
                  placeholder="Tell him what you're building."
                  required
                />
                {errors.message && (
                  <p id="contact-message-error" className="mt-2 font-text text-xs text-red-700">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="mt-[22px] flex flex-wrap items-center justify-between gap-4">
                <span className="font-gothic text-[11px] uppercase tracking-[0.06em] text-ink-soft">
                  Usually replies within 24 hours
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap border-2 border-ink bg-ink px-7 py-[15px] font-gothic text-[14px] font-bold uppercase tracking-[0.1em] text-paper transition-colors duration-150 hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    "Send the letter"
                  )}
                </button>
              </div>

              <div role="status" aria-live="polite" className="mt-4">
                {status === "success" && (
                  <p className="flex items-center gap-2 font-text text-sm text-emerald-700">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {statusMessage}
                  </p>
                )}
                {status === "error" && (
                  <p className="flex items-center gap-2 font-text text-sm text-red-700">
                    <AlertCircle size={16} aria-hidden="true" />
                    {statusMessage}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar column */}
          <div className="flex flex-col bg-paper-warm p-6 min-[600px]:p-8">
            <div className="border-b border-ink/25 py-4 pt-0 last:border-b-0">
              <p className="mb-[5px] font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Direct line
              </p>
              <p className="font-display text-[21px] leading-[1.2] [overflow-wrap:anywhere]">
                <a className="link-pencil" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </p>
              <p className="mt-1 font-text text-[14px] text-ink-soft">
                For freelance builds, ML collabs, and the occasional debate about clean code.
              </p>
            </div>

            <div className="border-b border-ink/25 py-4 last:border-b-0">
              <p className="mb-[5px] font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                The Desk
              </p>
              <p className="font-display text-[21px] leading-[1.2] [overflow-wrap:anywhere]">
                {profile.location}
              </p>
              <p className="mt-1 font-text text-[14px] text-ink-soft">
                IST — happy to sync with teams across time zones, remote-first.
              </p>
            </div>

            <div className="border-b border-ink/25 py-4 last:border-b-0">
              <p className="mb-[5px] font-gothic text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Availability
              </p>
              <p className="font-display text-[21px] leading-[1.2] [overflow-wrap:anywhere]">
                {profile.availability}
              </p>
              <p className="mt-1 font-text text-[14px] text-ink-soft">
                {"Currently a B.Tech student at NIT Patna, so he's picky about what makes the cut."}
              </p>
            </div>

            <div className="mt-auto flex gap-2.5 pt-[22px]">
              <a
                className="flex h-[42px] w-[42px] items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                className="flex h-[42px] w-[42px] items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </a>
              <a
                className="flex h-[42px] w-[42px] items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                href={`mailto:${profile.email}`}
                aria-label="Email"
              >
                <Mail size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
