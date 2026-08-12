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
  headlineLead: "Laziness Bred Automation. Curiosity Did the Rest — ",
  headlineEmphasis: "from development to AI & ML.",
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

/** Powers the case-file detail page at /case-files/[slug] (CaseFile.tsx). */
export type ProjectDetail = {
  /** Italic dek shown under the headline, e.g. a one-line thesis for the project. */
  dek: string;
  /** 3–4 body paragraphs for the article. First one gets the drop cap. */
  paragraphs: string[];
  /** Pulled out as a centered blockquote partway through the article. */
  pullQuote: string;
};

export type Project = {
  id: string;
  /** URL-safe slug for the case-file page, e.g. "vaidyascribe" -> /case-files/vaidyascribe */
  slug: string;
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
  /** Shown in the "How it was built" panel on the case-file page. */
  role: string;
  /** Shown in the "How it was built" panel, e.g. "Live" / "Deployed & running". */
  status: string;
  /** Article content for the case-file detail page. */
  detail: ProjectDetail;
};

export const projects: Project[] = [
  {
    id: "01",
    slug: "vaidyascribe",
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
    role: "Solo builder",
    status: "Live — deployed on Vercel",
    detail: {
      dek: "A doctor talks to a patient. VaidyaScribe listens, and turns the consult into a reviewable clinical note before either of them has left the room.",
      paragraphs: [
        "The problem VaidyaScribe was built to fix is a familiar one in Indian clinics: a doctor spends the consult typing instead of looking at the patient, or spends the evening writing up notes from memory. VaidyaScribe is built to sit in the room instead — recording the conversation and turning it into structured clinical documentation without asking the doctor to change how they talk to a patient.",
        "Audio goes in through Groq's Whisper endpoint for transcription, then Qwen3-32B reads that transcript and pulls out ten categories of clinical entity — symptoms, history, medications, and the rest — and assembles them into an editable SOAP note. Alongside it, the same extraction produces a standards-compliant FHIR R4 bundle, so the output is something a real health record system can actually ingest, not just a formatted paragraph.",
        "The whole pass, from recorded audio to a note ready for review, runs in under five seconds. It ships as a PWA so it works on whatever device is already in the consultation room, and it's built around one hard rule: nothing is written to a patient record until the doctor has read the note and confirmed it. The model drafts; the doctor decides.",
      ],
      pullQuote: "Nothing reaches a patient record until a doctor has read it and said yes.",
    },
  },
  {
    id: "02",
    slug: "disasterreliefops",
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
    role: "Solo builder — OpenEnv Hackathon entry",
    status: "Live demo on HuggingFace Spaces",
    detail: {
      dek: "Eight agents, one scarce pool of aid supplies, three mission tiers that escalate from routine to crisis. Cooperation and competition running on the same reward signal.",
      paragraphs: [
        "DisasterReliefOps started from a question about how cooperation actually forms under pressure: what happens when several agents need the same limited resources to do their jobs, and the jobs themselves get harder over time? The testbed simulates a humanitarian disaster response where eight AI agents have to retrieve and distribute aid supplies that are never quite enough to go around.",
        "The simulation is structured as three escalating mission tiers — supply retrieval, hub distribution, and full crisis coordination — each raising the coordination bar and shrinking the margin for waste. Agents were trained with the REINFORCE algorithm on top of PyTorch, learning policies that have to balance their own objective against seven other agents drawing from the same pool.",
        "The finished environment is shipped as an OpenEnv-compliant API behind a FastAPI backend, deployed on HuggingFace Spaces with a live Gradio interface so anyone can watch a run happen rather than just read a training curve. It was built for the OpenEnv Hackathon as an entry exploring emergent multi-agent behavior under scarcity.",
      ],
      pullQuote: "Cooperation and competition, running on the same reward signal.",
    },
  },
  {
    id: "03",
    slug: "neural-vision",
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
    role: "Solo builder",
    status: "Live — runs entirely client-side",
    detail: {
      dek: "Two models, trained by hand and shipped to the browser — inference with zero server round-trips and no image ever leaving the device.",
      paragraphs: [
        "Neural Vision exists to answer a specific question end to end: what does it actually take to get a hand-trained model out of a notebook and running live in someone's browser, with no backend in the loop? It bundles two separate models built for that purpose — a convolutional network trained to tell cats from dogs, and a dense network trained on MNIST to recognize handwritten digits.",
        "Both were trained in Keras/Python and then converted to run through TensorFlow.js, so every prediction happens on-device after the page loads. There's no upload step and no inference API — an image or a drawn digit never leaves the visitor's machine, which was as much the point of the project as the models themselves.",
        "The result is a small, self-contained demonstration of the full path from a trained model to a private, zero-latency browser experience — useful as a reference for any future project where sending user data to a server isn't something to reach for by default.",
      ],
      pullQuote: "The model ships to the browser — not the browser's data to a server.",
    },
  },
  {
    id: "04",
    slug: "sehita",
    tag: "Internship",
    name: "Sehita",
    href: "https://voiceai.jilohealth.com/",
    org: "Jilo Health Cosmos",
    period: "Jun — Aug 2026",
    summary:
      "A Hindi-language voice AI receptionist for Indian clinics and hospitals — answers every inbound patient call and routes it across seven conversation types (enquiries to red-flag escalation), runs outbound campaigns (screening invites, OPD follow-ups, newborn-vaccination reminders), and reschedules callbacks on request with the full prior conversation loaded. Built as part of a 5-person engineering team.",
    stack: ["React", "TanStack Start", "TypeScript", "Supabase", "Cloudflare Workers", "ElevenLabs", "Twilio", "Plivo"],
    phone: "+918035016969",
    kind: "internship",
    screenshot: "/images/Sehita.png",
    role: "Software engineering intern — team of 5",
    status: "Team project — built during internship",
    detail: {
      dek: "A Hindi-speaking voice receptionist that answers every inbound call to an Indian clinic, and already knows seven different ways the conversation can go.",
      paragraphs: [
        "Sehita was built to solve a problem every small Indian clinic knows well: the phone rings constantly, and there's rarely a receptionist free to answer it the way a patient needs. Sehita picks up in Hindi and carries the conversation itself — routing calls across seven distinct conversation types, from routine enquiries all the way up to red-flag symptom escalation that needs a human immediately.",
        "It's not just inbound. Sehita also runs outbound campaigns on the clinic's behalf — screening invites, OPD follow-ups, newborn-vaccination reminders — and if a patient asks to be called back later, it reschedules with the entire prior conversation already loaded, so nothing has to be repeated.",
        "The stack pairs a React and TanStack Start front end with Cloudflare Workers and Supabase on the backend, ElevenLabs for voice, and Twilio/Plivo for telephony. It was built during a summer internship at Jilo Health Cosmos as part of a five-person engineering team — this exhibit covers the parts built and owned directly within that team effort.",
      ],
      pullQuote: "Seven ways a phone call can go, and the system knows all of them before it says hello.",
    },
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
