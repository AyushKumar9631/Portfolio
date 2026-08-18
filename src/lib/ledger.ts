import { timeline, type TimelineEntry } from "./data";

export function getLedgerEntryBySlug(slug: string): TimelineEntry | undefined {
  return timeline.find((entry) => entry.slug === slug);
}

/** Where "Open record" should send a click for a given entry — its own
 * /career-log page, or an existing /case-files page if it points there
 * instead (see caseFileSlug on TimelineEntry). Undefined if neither is set. */
export function getLedgerHref(entry: TimelineEntry): string | undefined {
  if (entry.slug) return `/career-log/${entry.slug}`;
  if (entry.caseFileSlug) return `/case-files/${entry.caseFileSlug}`;
  return undefined;
}

/** A couple of other timeline entries to surface as "Related records" on a
 * ledger page — everything except the current one, in declared order,
 * skipping any entry with nowhere to link to. */
export function getRelatedLedgerEntries(
  current: TimelineEntry,
  count = 2,
): { entry: TimelineEntry; href: string }[] {
  return timeline
    .filter((entry) => entry !== current)
    .map((entry) => ({ entry, href: getLedgerHref(entry) }))
    .filter((r): r is { entry: TimelineEntry; href: string } => Boolean(r.href))
    .slice(0, count);
}

/** Earliest year mentioned across every entry's `period` string, for the
 * "Movements on record since {year}" subtitle — pulled from the data
 * instead of hardcoded so it never drifts out of sync with `timeline`. */
export function getEarliestTimelineYear(): number {
  const years = timeline.flatMap((entry) =>
    Array.from(entry.period.matchAll(/\d{4}/g), (m) => Number(m[0])),
  );
  return years.length > 0 ? Math.min(...years) : new Date().getFullYear();
}
