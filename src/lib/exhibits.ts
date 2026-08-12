import { projects, type Project } from "./data";

export const EXHIBIT_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

/** Exhibit A is whichever project is internship work; falls back to the
 * first project if none is. Kept as a single source of truth so Work.tsx
 * and the /case-files/[slug] page never disagree on which one is "A". */
export function getFeaturedProject(): Project {
  return projects.find((p) => p.kind === "internship") ?? projects[0];
}

/** Featured project first, then the rest in declared order — the same
 * order Work.tsx renders them in, so exhibit letters line up. */
export function getOrderedProjects(): Project[] {
  const featured = getFeaturedProject();
  const rest = projects.filter((p) => p !== featured);
  return [featured, ...rest];
}

export function getExhibitLabel(project: Project): string {
  const index = getOrderedProjects().findIndex((p) => p.id === project.id);
  return EXHIBIT_LETTERS[index] ?? "?";
}

/** A couple of other projects to surface as "Related exhibits" on a
 * case-file page — everything except the current one, in declared order. */
export function getRelatedProjects(project: Project, count = 2): Project[] {
  return projects.filter((p) => p.id !== project.id).slice(0, count);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function hostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
