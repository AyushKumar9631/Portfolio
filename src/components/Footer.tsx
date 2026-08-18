"use client";

import { RotateCcw } from "lucide-react";
import { profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { resetIntroForReplay } from "@/components/IntroScreen";

const sectionLinks = [
  { href: "#work", label: "Selected Works" },
  { href: "#stack", label: "The Stack" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

const wireServices = [
  { href: profile.github, label: "GitHub" },
  { href: profile.linkedin, label: "LinkedIn" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const city = profile.location.split(",")[0];

  function handleReplayIntro() {
    resetIntroForReplay();
    window.location.reload();
  }

  return (
    <footer className="border-t-[6px] border-ink bg-ink px-0 pb-[30px] pt-14 text-paper">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-[30px]">
        <div className="border-b border-paper/30 pb-[22px] text-center font-display text-[clamp(42px,7vw,82px)] leading-[0.9] tracking-[-0.01em]">
          {profile.name}
        </div>

        <div className="grid grid-cols-1 gap-8 pt-[30px] min-[600px]:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="min-[600px]:col-span-1">
            <p className="max-w-[34ch] font-text text-[15px] leading-[1.6] text-paper/[0.78]">
              {
                "A computer science undergrad at NIT Patna, building full-stack apps and ML systems — from a multi-agent RL testbed for disaster response to a production clinical-scribe app used by real doctors. This broadsheet is hand-set in Lora and Oswald."
              }
            </p>
          </div>

          <div>
            <h4 className="mb-3.5 font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-paper/60">
              Sections
            </h4>
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="link-pencil-bright mb-2.5 block w-fit font-text text-[15px] text-paper"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <h4 className="mb-3.5 font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-paper/60">
              The Desk
            </h4>
            <p className="mb-2.5 font-text text-[15px] text-paper">{profile.location}</p>
            <p className="mb-2.5 font-text text-[15px] text-paper">IST · Remote-first</p>
            <a
              className="link-pencil-bright mb-2.5 block w-fit font-text text-[15px] text-paper"
              href={`mailto:${profile.email}`}
            >
              {profile.email}
            </a>
          </div>

          <div>
            <h4 className="mb-3.5 font-gothic text-[11px] font-bold uppercase tracking-[0.14em] text-paper/60">
              Wire Services
            </h4>
            {wireServices.map((service) => (
              <a
                key={service.label}
                className="link-pencil-bright mb-2.5 block w-fit font-text text-[15px] text-paper"
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {service.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <span
            aria-hidden="true"
            className="inline-block -rotate-6 border-4 border-stamp-bright px-6 py-2 font-gothic text-[15px] font-black uppercase tracking-[0.3em] text-stamp-bright [filter:url(#fm-rough)]"
          >
            Case Closed
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-paper/30 pt-5 font-gothic text-[11px] font-medium uppercase tracking-[0.1em] text-paper/70 min-[600px]:flex-row min-[600px]:justify-between">
          <span>
            © {year} The {profile.name} Times · All rights reserved · Printed in {city}
          </span>
          <div className="flex gap-2.5">
            <a
              className="flex h-10 w-10 items-center justify-center border border-paper/45 text-paper transition-colors hover:bg-paper hover:text-ink"
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              className="flex h-10 w-10 items-center justify-center border border-paper/45 text-paper transition-colors hover:bg-paper hover:text-ink"
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
            <button
              type="button"
              title="Reopen the case"
              aria-label="Reopen the case — replay the intro"
              onClick={handleReplayIntro}
              className="flex h-10 w-10 items-center justify-center border border-paper/45 text-paper transition-colors hover:border-stamp-bright hover:text-stamp-bright"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
