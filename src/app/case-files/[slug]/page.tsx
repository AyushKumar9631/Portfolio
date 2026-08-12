import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/lib/data";
import {
  getProjectBySlug,
  getExhibitLabel,
  getRelatedProjects,
} from "@/lib/exhibits";
import CaseFile from "@/components/CaseFile";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.name} — Case File`,
    description: project.detail.dek,
  };
}

export default async function CaseFilePage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const exhibitLabel = getExhibitLabel(project);
  const related = getRelatedProjects(project, 2);
  const relatedLabels = related.map((r) => getExhibitLabel(r));

  return (
    <CaseFile
      project={project}
      exhibitLabel={exhibitLabel}
      related={related}
      relatedLabels={relatedLabels}
    />
  );
}
