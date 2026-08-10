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
];
