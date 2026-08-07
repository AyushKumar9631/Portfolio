// Edit everything in this file with your own details.

export const profile = {
  name: "Your Name",
  role: "Full-Stack Developer",
  location: "Your City, Country",
  tagline: "I build web applications end to end, front to back.",
  summary:
    "Full-stack developer working across the MERN stack — React on the front end, Node and Express on the back end, MongoDB underneath. I like taking a project from a rough idea through to something people actually use.",
  availability: "Open to freelance & full-time roles",
  email: "you@example.com",
  github: "https://github.com/yourhandle",
  linkedin: "https://www.linkedin.com/in/yourhandle/",
};

export type Project = {
  id: string;
  tag: string;
  name: string;
  org: string;
  period: string;
  summary: string;
  stack: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    id: "01",
    tag: "Flagship",
    name: "Project One",
    org: "Personal / Client",
    period: "2026 — Now",
    summary:
      "One or two sentences on what this project does and the problem it solves. Mention the part you owned end to end.",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    href: "#",
  },
  {
    id: "02",
    tag: "Client work",
    name: "Project Two",
    org: "Client name",
    period: "2025",
    summary:
      "What the client needed, what you built, and the outcome — a metric or concrete result if you have one.",
    stack: ["React", "Express", "MongoDB", "AWS S3"],
    href: "#",
  },
  {
    id: "03",
    tag: "Side project",
    name: "Project Three",
    org: "Personal",
    period: "2025",
    summary:
      "A short, specific description. Avoid generic phrasing like 'a full-stack app' — say what it actually does.",
    stack: ["Next.js", "MongoDB", "Tailwind"],
    href: "#",
  },
];

export type StackItem = {
  code: string;
  name: string;
  detail: string;
  status: "daily" | "comfortable" | "learning";
};

export const stack: StackItem[] = [
  { code: "RCT", name: "React", detail: "Primary tool", status: "daily" },
  { code: "NODE", name: "Node.js", detail: "Primary tool", status: "daily" },
  { code: "EXPR", name: "Express", detail: "Primary tool", status: "daily" },
  { code: "MDB", name: "MongoDB", detail: "Primary tool", status: "daily" },
  { code: "NEXT", name: "Next.js", detail: "Comfortable", status: "comfortable" },
  { code: "TWX", name: "Tailwind CSS", detail: "Comfortable", status: "comfortable" },
  { code: "SUPA", name: "Supabase", detail: "Comfortable", status: "comfortable" },
  { code: "TS", name: "TypeScript", detail: "Learning", status: "learning" },
];

export type TimelineEntry = {
  period: string;
  role: string;
  org: string;
  detail: string;
};

export const timeline: TimelineEntry[] = [
  {
    period: "2026 — Now",
    role: "Full-Stack Developer",
    org: "Company / Freelance",
    detail: "What you're doing day to day, in plain terms.",
  },
  {
    period: "2024 — 2026",
    role: "Your previous role",
    org: "Company name",
    detail: "What you built or learned there.",
  },
  {
    period: "2023 — 2024",
    role: "Learning the MERN stack",
    org: "Self-taught / Bootcamp",
    detail: "Where you started — worth keeping if it's part of your story.",
  },
];
