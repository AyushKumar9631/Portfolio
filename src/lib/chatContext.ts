import { profile, projects, stack, timeline } from "@/lib/data";
import { credentialGroups, standaloneDocuments } from "@/lib/credentials";

type LinkEntry = { label: string; url: string; description: string };

/** Every link the bot is allowed to hand back to the client — section
 * anchors, case-file/career-log pages, live project demos, document
 * links, and profile links. Built fresh from data.ts/credentials.ts on
 * every call, so adding a project or document there is the only edit
 * ever needed; this list (and the prompt below) pick it up automatically. */
function buildAvailableLinks(): LinkEntry[] {
  const links: LinkEntry[] = [
    { label: "Work section", url: "/#work", description: "Scrolls to the Work / Selected Works section listing every project." },
    { label: "Stack section", url: "/#stack", description: "Scrolls to the Tech Stack section." },
    { label: "Timeline section", url: "/#timeline", description: "Scrolls to the Timeline section (education + experience)." },
    { label: "Contact section", url: "/#contact", description: "Scrolls to the contact form." },
    { label: "GitHub profile", url: profile.github, description: "Ayush's GitHub profile." },
    { label: "LinkedIn profile", url: profile.linkedin, description: "Ayush's LinkedIn profile." },
    { label: "Email Ayush", url: `mailto:${profile.email}`, description: "Opens an email draft to Ayush directly." },
  ];

  for (const p of projects) {
    links.push({
      label: `${p.name} case file`,
      url: `/case-files/${p.slug}`,
      description: `Full case-file write-up for ${p.name} (${p.org}, ${p.period}).`,
    });
    if (p.href) {
      links.push({
        label: `${p.name} live link`,
        url: p.href,
        description: `Live/deployed link for ${p.name}.`,
      });
    }
  }

  for (const t of timeline) {
    if (t.slug) {
      links.push({
        label: `${t.role} record`,
        url: `/career-log/${t.slug}`,
        description: `Detail page for ${t.org} (${t.period}).`,
      });
    }
    // t.caseFileSlug entries (e.g. the internship) already have their
    // link covered by the matching project's case-file entry above.
  }

  const allDocs = [
    ...credentialGroups.flatMap((g) => g.documents.map((d) => ({ ...d, group: g.label }))),
    ...standaloneDocuments.map((d) => ({ ...d, group: "Documents" })),
  ];
  for (const d of allDocs) {
    links.push({
      label: d.title,
      url: d.sourceUrl,
      description: `${d.group} · ${d.category} · ${d.period}. ${d.description}`,
    });
  }

  return links;
}

/** Whitelist of link URLs the model is allowed to hand back — validated
 * server-side against this so a hallucinated URL can never reach the
 * client even if the model ignores its instructions. */
export function getValidLinkUrls(): Set<string> {
  return new Set(buildAvailableLinks().map((l) => l.url));
}

export function buildSystemPrompt(): string {
  const links = buildAvailableLinks();

  const projectsBlock = projects
    .map((p, i) => {
      const lines = [
        `${i + 1}. ${p.name} (${p.tag}) — ${p.org}, ${p.period}`,
        `   Role: ${p.role}`,
        `   Status: ${p.status}`,
        `   Stack: ${p.stack.join(", ")}`,
        `   Summary: ${p.summary}`,
      ];
      if (p.phone) lines.push(`   Contact number for this project: ${p.phone}`);
      return lines.join("\n");
    })
    .join("\n\n");

  const stackBlock = stack
    .map((s) => `- ${s.name} — ${s.detail} (${s.status})`)
    .join("\n");

  const timelineBlock = timeline
    .map((t, i) => `${i + 1}. ${t.period} — ${t.role} — ${t.org}\n   ${t.detail}`)
    .join("\n\n");

  const docsBlock = credentialGroups
    .map(
      (g) =>
        `${g.label}:\n` +
        g.documents
          .map((d) => `- ${d.title} (${d.category}, ${d.period}): ${d.description}`)
          .join("\n"),
    )
    .join("\n\n");

  const linksBlock = JSON.stringify(
    links.map((l) => ({ label: l.label, url: l.url })),
    null,
    2,
  );

  return `You are the AI assistant embedded on Ayush Kumar's portfolio website (a newspaper/editorial-themed site called "The Investigation Edition"). You speak naturally and concisely, like a sharp, friendly assistant — never mention that you're reading from structured data.

Everything you know about Ayush is listed below. Never invent, guess, or embellish facts that aren't here — if you don't know something, say so honestly.

=== PROFILE ===
Name: ${profile.name}
Role: ${profile.role}
Location: ${profile.location}
Tagline: ${profile.tagline}
Summary: ${profile.summary}
Availability: ${profile.availability}
Email: ${profile.email}
GitHub: ${profile.github}
LinkedIn: ${profile.linkedin}

=== PROJECTS (Work section) ===
${projectsBlock}

=== TECH STACK ===
${stackBlock}

=== TIMELINE (education & experience) ===
${timelineBlock}

=== DOCUMENTS ON FILE ===
${docsBlock}

=== AVAILABLE LINKS ===
You may ONLY use a "url" from this exact list, copied character-for-character. Never invent, guess, or modify a URL. If nothing here is relevant to what the user asked, omit "buttonName" and "link" entirely.
${linksBlock}

=== RESPONSE FORMAT ===
Reply with ONLY a single valid JSON object — no markdown code fences, no text before or after it, no commentary, no repeating the JSON object twice. Shape:
{
  "reply": "your natural-language answer, 1-4 sentences",
  "buttonName": "short call-to-action label, e.g. 'View Work section' — OMIT this field entirely if no link applies",
  "link": "must be copied exactly from AVAILABLE LINKS above — OMIT this field entirely if no link applies"
}
Only include buttonName/link when the question is clearly about a specific section, project, document, or contact method. Skip them for small talk, greetings, or general questions with no obvious matching link.

The "reply" text itself must be plain prose only — never include markdown links, bracket-and-parenthesis link syntax, or a raw URL inside it. If you want to point the user somewhere, that's exactly what the separate "buttonName"/"link" fields are for; never fabricate a URL (e.g. inventing a domain name) anywhere in the response.`;
}
