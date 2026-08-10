import { profile, masthead } from "@/lib/data";

/** Small inline separator dot used between the byline segments. */
function Dot() {
  return (
    <span aria-hidden="true" className="text-line-strong">
      •
    </span>
  );
}

export default function Masthead() {
  // "EST." always reflects the current year, the same way Footer.tsx
  // computes its copyright year — no manual upkeep required.
  const year = new Date().getFullYear();

  return (
    <div className="bg-bg">
      {/* Top strip: location — edition name — established year */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 pt-5 text-center font-mono text-[10px] tracking-[0.25em] text-muted sm:flex-row sm:justify-between sm:text-[11px]">
        <span>{profile.location.toUpperCase()}</span>
        <span className="text-ink">{masthead.edition.toUpperCase()}</span>
        <span>EST. {year}</span>
      </div>

      <div className="mx-auto mt-4 max-w-6xl border-t-2 border-black" />

      {/* Nameplate */}
      <div className="mx-auto max-w-6xl px-6 py-6 text-center sm:py-8">
        <h1 className="font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl md:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ink sm:text-xs">
          {masthead.subhead}
        </p>
      </div>

      <div className="mx-auto max-w-6xl border-t-2 border-black" />

      {/* Byline: last update — current standing — section — price */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 py-3 text-center font-mono text-[10px] tracking-[0.2em] text-muted sm:text-[11px]">
        <span>{masthead.lastUpdated.toUpperCase()}</span>
        <Dot />
        <span>{masthead.position.toUpperCase()}</span>
        <Dot />
        <span>{masthead.section.toUpperCase()}</span>
        <Dot />
        <span>PRICE: {masthead.price.toUpperCase()}</span>
      </div>

      <div className="mx-auto max-w-6xl border-b-2 border-black" />
    </div>
  );
}
