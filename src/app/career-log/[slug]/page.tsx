import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timeline } from "@/lib/data";
import { getLedgerEntryBySlug, getRelatedLedgerEntries } from "@/lib/ledger";
import LedgerEntry from "@/components/LedgerEntry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return timeline
    .filter((entry) => entry.slug)
    .map((entry) => ({ slug: entry.slug as string }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLedgerEntryBySlug(slug);
  if (!entry || !entry.record) return {};

  return {
    title: `${entry.org} — Career Log`,
    description: entry.record.dek,
  };
}

export default async function CareerLogPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getLedgerEntryBySlug(slug);

  if (!entry || !entry.record) {
    notFound();
  }

  const related = getRelatedLedgerEntries(entry, 2);

  return <LedgerEntry entry={entry} related={related} />;
}
