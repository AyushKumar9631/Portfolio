// Edit everything in this file with your own details.

export const profile = {
  name: "Ayush Kumar",
  role: "Full-Stack Developer & ML Engineer",
  location: "Patna, India",
  tagline:
    "Building intelligent systems where deep learning, full-stack development, and clean engineering meet.",
  summary:
    "Computer Science undergrad at NIT Patna (CGPA 9.41) who ships full projects, not just notebooks — from a multi-agent reinforcement-learning testbed for disaster response to a production clinical-scribe app built for real doctors. Comfortable moving between PyTorch/TensorFlow on the ML side and React/Next.js on the product side.",
  availability: "Open to internships, freelance & research collaborations",
  email: "ayushkr1.ug23.cs@nitp.ac.in",
  github: "https://github.com/AyushKumar9631",
  linkedin: "https://linkedin.com/in/ayush-kumar-nitp",
};

// Powers the newspaper-style masthead at the very top of the page (above
// the nav bar). "EST." is computed from the current date automatically
// (see Masthead.tsx), so only these need updating by hand.
export const masthead = {
  edition: "The Investigation Edition",
  subhead: "The Professional Record of a B.Tech Grad",
  // lastUpdated removed — Masthead.tsx now shows today's actual date,
  // computed live and animated in on each load instead of this being
  // a manually-updated string.
  /** Your current year/standing — shown in the masthead byline row. */
  position: "B.Tech 4th Year",
  section: "Selected Works & Notes",
  price: "One Chai",
};

// Powers the newspaper front-page section directly below the nav bar
// (Hero.tsx). caseNumber is reused both in the kicker ("Case No. 43")
// and the first stat tile ("No. 43") so it only needs updating in one
// place.
export const hero = {
  sectionLabel: "Front Page",
  filedUnder: "Open Investigations",
  caseNumber: "02",
  statusLabel: "Internship Closed",
  headlineLead: "A Nitian engineer who likes building things — ",
  headlineEmphasis: "from full-stack development to ML.",
  pullQuote:
    "Three years in: a Nitian engineer who builds web applications, explores ML, and loves turning ideas into things that work.",
  primaryCta: { label: "Read the work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
  stats: [
    { value: "No. 01", label: "Edition · first printing" },
    // Fallback only — Hero.tsx fetches live Patna weather on mount and
    // overwrites this entry. Kept as a plausible static value so the
    // tile never shows a blank/broken state if that fetch fails.
    { value: "31°C", label: "Patna · Humid & Warm" },
    { value: "Global", label: "Circulation · remote-friendly" },
    { value: "Early Final", label: "7th sem to grad" },
  ],
  pictureCaption: "the subject, in his natural habitat",
  body: [
    "He enjoys the whole process — from a rough idea to something that ships. His main stack includes Next.js, Tailwind, and Supabase, with ML and AI added to the mix whenever the problem demands it.",
    "He's equally drawn to ML and AI — experimenting with models, exploring new ideas, and finding practical ways to put them to work. From building intelligent features to working with AI-powered systems, he enjoys the process of turning complex problems into useful solutions.",
  ],
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
  /** E.164 phone number, e.g. "+918035016969" — renders a "Call" CTA on the card. */
  phone?: string;
  /** Drives both which project is featured as Exhibit A (the internship
   * one) and the "Internship"/"Personal" hover stamp on its thumbnail in
   * Work.tsx. Add new projects with whichever of these fits. */
  kind: "internship" | "personal";
  /** Path under /public, e.g. "/images/vaidyascribe.png". Omit to show
   * the "Screenshot pending" placeholder instead. */
  screenshot?: string;
};

export const projects: Project[] = [
  {
    id: "01",
    tag: "Flagship",
    name: "VaidyaScribe",
    org: "Personal",
    period: "2025 — 2026",
    summary:
      "An ambient AI clinical scribe for Indian healthcare — transcribes a doctor's consultation with Groq Whisper, extracts ten clinical entity types with Qwen3-32B, and generates an editable SOAP note plus a standards-compliant FHIR R4 bundle in under five seconds. Nothing is saved until the doctor reviews and confirms.",
    stack: ["Next.js", "TypeScript", "Supabase", "Groq Whisper", "Qwen3-32B", "FHIR R4", "PWA"],
    href: "https://vaidyascribe.vercel.app",
    kind: "personal",
    screenshot: "/images/Vaidyascribe.png",
  },
  {
    id: "02",
    tag: "Multi-agent RL",
    name: "DisasterReliefOps",
    org: "OpenEnv Hackathon",
    period: "2025 — 2026",
    summary:
      "A multi-agent reinforcement-learning testbed simulating humanitarian disaster response — eight AI agents cooperate and compete over scarce aid supplies across three escalating mission tiers (supply retrieval, hub distribution, crisis coordination), trained with REINFORCE/PyTorch and deployed as an OpenEnv-compliant API on HuggingFace Spaces with a live Gradio UI.",
    stack: ["Python", "PyTorch", "Gymnasium", "FastAPI", "Gradio", "HuggingFace Spaces"],
    href: "https://huggingface.co/spaces/Ayush9631/Emergent_society",
    kind: "personal",
    screenshot: "/images/DRO.png",
  },
  {
    id: "03",
    tag: "In-browser ML",
    name: "Neural Vision",
    org: "Personal",
    period: "Oct — Nov 2025",
    summary:
      "Two hand-trained deep learning models — a CNN for cat/dog image classification and a dense network for MNIST handwritten digit recognition — served entirely client-side via TensorFlow.js, so inference runs in-browser with zero server round-trips and no image data ever leaving the device.",
    stack: ["TensorFlow.js", "Keras", "Python", "JavaScript"],
    href: "https://image-recognizer-delta.vercel.app",
    kind: "personal",
    screenshot: "/images/NeuralVision.png",
  },
  {
    id: "04",
    tag: "Internship",
    name: "Sehita",
    org: "Jilo Health Cosmos",
    period: "Jun — Aug 2026",
    summary:
      "A Hindi-language voice AI receptionist for Indian clinics and hospitals — answers every inbound patient call and routes it across seven conversation types (enquiries to red-flag escalation), runs outbound campaigns (screening invites, OPD follow-ups, newborn-vaccination reminders), and reschedules callbacks on request with the full prior conversation loaded. Built as part of a 5-person engineering team.",
    stack: ["React", "TanStack Start", "TypeScript", "Supabase", "Cloudflare Workers", "ElevenLabs", "Twilio", "Plivo"],
    phone: "+918035016969",
    kind: "internship",
    screenshot: "/images/Sehita.png",
  },
];

export type StackItem = {
  code: string;
  name: string;
  detail: string;
  status: "daily" | "comfortable" | "learning";
};

export const stack: StackItem[] = [
  { code: "JS/TS", name: "JavaScript / TypeScript", detail: "Primary tool", status: "daily" },
  { code: "PY", name: "Python", detail: "Primary tool", status: "daily" },
  { code: "RCT", name: "React", detail: "Primary tool", status: "daily" },
  { code: "NEXT", name: "Next.js", detail: "Comfortable", status: "comfortable" },
  { code: "NODE", name: "Node.js / Express", detail: "Comfortable", status: "comfortable" },
  { code: "TF", name: "TensorFlow / Keras", detail: "Comfortable", status: "comfortable" },
  { code: "TORCH", name: "PyTorch", detail: "Comfortable", status: "comfortable" },
  { code: "MDB", name: "MongoDB", detail: "Comfortable", status: "comfortable" },
  { code: "GIT", name: "Git / GitHub", detail: "Daily", status: "daily" },
];

export type TimelineEntry = {
  period: string;
  role: string;
  org: string;
  detail: string;
};

export const timeline: TimelineEntry[] = [
  {
    period: "2023 — 2027",
    role: "B.Tech, Computer Science Engineering",
    org: "National Institute of Technology, Patna",
    detail:
      "Current CGPA 9.41. Splitting coursework and personal projects between deep learning (PyTorch, TensorFlow) and full-stack web development (the MERN stack, Next.js).",
  },
  {
    period: "Jun — Aug 2026",
    role: "Software Engineering Intern",
    org: "Jilo Health Cosmos",
    detail:
      "Worked on Sehita, a Hindi-language voice AI receptionist for Indian clinics — built as part of a 5-person engineering team.",
  },
  {
    period: "2021",
    role: "Senior Secondary (12th)",
    org: "Central Board of Secondary Education (CBSE)",
    detail: "Completed with 84.5%.",
  },
  {
    period: "2019",
    role: "Secondary (10th)",
    org: "Indian Certificate of Secondary Education (ICSE)",
    detail: "Completed with 92.2%.",
  },
];
