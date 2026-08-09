"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { profile } from "@/lib/data";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm: FormState = { name: "", email: "", message: "" };

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

const inputClasses =
  "w-full border border-line-strong bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

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
      message: form.message.trim(),
    });

    if (error) {
      setStatus("error");
      setStatusMessage(
        "Something went wrong sending your message. Please try again, or email me directly.",
      );
      return;
    }

    setStatus("success");
    setStatusMessage("Message sent — thanks for reaching out, I'll reply soon.");
    setForm(initialForm);
  }

  const isSubmitting = status === "submitting";

  return (
    <section id="contact" className="paper-grain px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-12 border-b border-line-strong pb-4"
        >
          <span className="font-mono text-xs tracking-widest text-accent-2">
            GET IN TOUCH
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Contact
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted">
            Have a project in mind or just want to say hi? Send a message
            below, or email me directly at{" "}
            <a
              href={`mailto:${profile.email}`}
              className="text-accent underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent-2"
            >
              {profile.email}
            </a>
            .
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="corner-brackets flex flex-col gap-5 border border-line bg-bg p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="contact-name"
              className="mb-2 block font-mono text-xs tracking-widest text-muted"
            >
              NAME
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={inputClasses}
              placeholder="Your name"
            />
            {errors.name && (
              <p
                id="contact-name-error"
                className="mt-2 text-xs text-red-700"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-2 block font-mono text-xs tracking-widest text-muted"
            >
              EMAIL
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
              className={inputClasses}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p
                id="contact-email-error"
                className="mt-2 text-xs text-red-700"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mb-2 block font-mono text-xs tracking-widest text-muted"
            >
              MESSAGE
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
              className={`${inputClasses} resize-none`}
              placeholder="What are you working on?"
            />
            {errors.message && (
              <p
                id="contact-message-error"
                className="mt-2 text-xs text-red-700"
              >
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center gap-2 border border-accent bg-accent px-6 py-3 font-mono text-xs tracking-widest text-bg transition-colors hover:bg-transparent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                SENDING…
              </>
            ) : (
              <>
                <Send size={14} aria-hidden="true" />
                SEND MESSAGE
              </>
            )}
          </button>

          <div role="status" aria-live="polite">
            {status === "success" && (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 size={16} aria-hidden="true" />
                {statusMessage}
              </p>
            )}
            {status === "error" && (
              <p className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={16} aria-hidden="true" />
                {statusMessage}
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
