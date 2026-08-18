// Powers the "Hire Me" modal's document sidebar (HireMeModal.tsx).
// Add a new document by pasting its Google Drive "share" link into
// `sourceUrl` — the preview/download URLs are derived from that link
// automatically, nothing else needs to change.

export type CredentialDocument = {
  id: string;
  title: string;
  /** Short tag shown next to the title, e.g. "Certificate", "Letter". */
  category: string;
  /** e.g. "Jun — Aug 2026 · 8 weeks". */
  period: string;
  description: string;
  /** A Google Drive share link (Share -> Copy link). */
  sourceUrl: string;
};

/** Pulls the file ID out of either Drive URL shape:
 *  .../file/d/FILE_ID/view?usp=sharing  or  ...?id=FILE_ID */
function extractDriveFileId(url: string): string | null {
  const pathMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return queryMatch ? queryMatch[1] : null;
}

/** Embeddable preview URL for an <iframe>. */
export function getPreviewUrl(doc: CredentialDocument): string {
  const fileId = extractDriveFileId(doc.sourceUrl);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : doc.sourceUrl;
}

/** Direct-download URL for the "Download" button. */
export function getDownloadUrl(doc: CredentialDocument): string {
  const fileId = extractDriveFileId(doc.sourceUrl);
  return fileId
    ? `https://drive.google.com/uc?export=download&id=${fileId}`
    : doc.sourceUrl;
}

export const credentialDocuments: CredentialDocument[] = [
  {
    id: "jilohealth-internship-certificate",
    title: "Jilo Health Internship Certificate",
    category: "Certificate",
    period: "Jun — Aug 2026 · 8 weeks",
    description:
      "Completion certificate for the eight-week software engineering internship at Jilo Health Cosmos, where he helped build Sehita, a Hindi-language voice AI receptionist for Indian clinics.",
    sourceUrl:
      "https://drive.google.com/file/d/1TYuz7BBE5mdsOSv7TfN8OrWGGi1lJ-gm/view?usp=sharing",
  },
];
