import { profile } from "@/lib/data";

const socials = [
  { label: "GitHub", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: "Email", href: `mailto:${profile.email}` },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-strong bg-bg px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a
            href="#top"
            className="font-mono text-sm tracking-widest text-ink transition-colors hover:text-accent-2"
          >
            {profile.name.toUpperCase()}
          </a>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-muted">
            {profile.role.toUpperCase()} — {profile.location.toUpperCase()}
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-widest text-muted">
          {socials.map((social) => {
            const isMail = social.href.startsWith("mailto:");
            return (
              <li key={social.label}>
                <a
                  href={social.href}
                  target={isMail ? undefined : "_blank"}
                  rel={isMail ? undefined : "noopener noreferrer"}
                  className="transition-colors hover:text-accent-2"
                >
                  {social.label.toUpperCase()}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-line pt-6 font-mono text-[10px] tracking-widest text-muted">
        © {year} {profile.name}. ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}
