// Powers the "Hire Me" modal's document sidebar (HireMeModal.tsx).
// Add a new document by pasting its Google Drive "share" link into
// `sourceUrl` — the preview/download URLs are derived from that link
// automatically, nothing else needs to change.
//
// Documents are organized into named groups (rendered as sidebar
// sections, in array order) plus an optional flat list of standalone
// documents that render below the groups with no section header.

export type CredentialDocument = {
  id: string;
  title: string;
  /** Short tag shown next to the title, e.g. "Certificate", "Grade Card". */
  category: string;
  /** e.g. "Jun — Aug 2026 · 8 weeks", or a semester/date range. */
  period: string;
  description: string;
  /** A Google Drive share link (Share -> Copy link). */
  sourceUrl: string;
  /** Optional small highlight badge, e.g. "Latest". */
  tag?: string;
};

export type CredentialGroup = {
  id: string;
  label: string;
  documents: CredentialDocument[];
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

export const credentialGroups: CredentialGroup[] = [
  {
    id: "internships",
    label: "Internships",
    documents: [
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
    ],
  },
  {
    id: "college-grades",
    label: "College Grades",
    // Newest first — Semester 6 carries the "Latest" tag.
    documents: [
      {
        id: "sem-6-grade-card",
        title: "Semester 6 Grade Card",
        category: "Grade Card",
        period: "Jan — May 2026",
        description: "Official NIT Patna grade card for semester 6.",
        sourceUrl:
          "https://drive.google.com/file/d/17UVmfELfjf9K9495U2t3b4cEvBmMTvx9/view?usp=sharing",
        tag: "Latest",
      },
      {
        id: "sem-5-grade-card",
        title: "Semester 5 Grade Card",
        category: "Grade Card",
        period: "Aug — Dec 2025",
        description: "Official NIT Patna grade card for semester 5.",
        sourceUrl:
          "https://drive.google.com/file/d/1kEH2Pviy2yhTRRxL22IK3QLSs9hqujWE/view?usp=sharing",
      },
      {
        id: "sem-4-grade-card",
        title: "Semester 4 Grade Card",
        category: "Grade Card",
        period: "Jan — May 2025",
        description: "Official NIT Patna grade card for semester 4.",
        sourceUrl:
          "https://drive.google.com/file/d/12AK4l6XH88gnUyJMUXWuMsoTW8WqtX79/view?usp=sharing",
      },
      {
        id: "sem-3-grade-card",
        title: "Semester 3 Grade Card",
        category: "Grade Card",
        period: "Aug — Dec 2024",
        description: "Official NIT Patna grade card for semester 3.",
        sourceUrl:
          "https://drive.google.com/file/d/1YPPSDoErAHXCkGxX3Td-vthCOF-KI13c/view?usp=sharing",
      },
      {
        id: "sem-2-grade-card",
        title: "Semester 2 Grade Card",
        category: "Grade Card",
        period: "Jan — May 2024",
        description: "Official NIT Patna grade card for semester 2.",
        sourceUrl:
          "https://drive.google.com/file/d/1URiZ8_3IFWbTGsXuncTkjltj9qdihjYX/view?usp=sharing",
      },
      {
        id: "sem-1-grade-card",
        title: "Semester 1 Grade Card",
        category: "Grade Card",
        period: "Aug — Dec 2023",
        description: "Official NIT Patna grade card for semester 1.",
        sourceUrl:
          "https://drive.google.com/file/d/1VBemN3cm63qPtnSUjv8FNr_6Qm7Kr7tr/view?usp=sharing",
      },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    documents: [
      {
        id: "nptel-hci-certification",
        title: "NPTEL: Human-Computer Interaction — Certification",
        category: "Certification",
        period: "NPTEL",
        description:
          "NPTEL certification for the Human-Computer Interaction elective, awarded for the proctored exam component alongside the coursework.",
        sourceUrl:
          "https://drive.google.com/file/d/1R8EkzkoCfqyLJi5nKe1LD3qvL0dQeVYV/view?usp=sharing",
      },
      {
        id: "nptel-hci-certificate",
        title: "NPTEL: Human-Computer Interaction — Certificate",
        category: "Certificate",
        period: "NPTEL",
        description:
          "Completion certificate for the same NPTEL Human-Computer Interaction elective, issued for the assignment-based coursework.",
        sourceUrl:
          "https://drive.google.com/file/d/1-u-qqXaOZp0sKfJx3UEws3i5N33JVw5b/view?usp=sharing",
      },
      {
        id: "njack-hackathon-iit-patna",
        title: "Njack Hackathon — IIT Patna",
        category: "Award",
        period: "Winner",
        description: "Winning entry at the Njack hackathon hosted at IIT Patna.",
        sourceUrl:
          "https://drive.google.com/file/d/164NoE-Rot-Y5aQQ-LZZ0XK7XKIw4CyAw/view?usp=sharing",
      },
    ],
  },
  {
    id: "school-education",
    label: "School Education",
    documents: [
      {
        id: "class-10-certificate",
        title: "ICSE Class X Certificate",
        category: "Certificate",
        period: "2019 · Don Bosco Academy",
        description:
          "Board certificate for ICSE Class X, cleared in 2019 with 92.2% overall at Don Bosco Academy, Patna.",
        sourceUrl:
          "https://drive.google.com/file/d/14xULsuUejb7YWZNkIWVWpMSAbwVmzqW0/view?usp=sharing",
      },
      {
        id: "class-12-certificate",
        title: "CBSE Class XII Certificate",
        category: "Certificate",
        period: "2021 · Mithila Public School",
        description:
          "Board certificate for CBSE Class XII, cleared in 2021 with 84.5% aggregate at Mithila Public School, Araria.",
        sourceUrl:
          "https://drive.google.com/file/d/1VCW4Nu5zU808YoO9xBqR0fNsy_0GKBMp/view?usp=sharing",
      },
    ],
  },
];

/** Renders below the groups with no section header. */
export const standaloneDocuments: CredentialDocument[] = [];

/** Flat list of every document, groups first (in declared order) then
 * standalone — used for defaults ("show the first doc") and counts. */
export const allCredentialDocuments: CredentialDocument[] = [
  ...credentialGroups.flatMap((group) => group.documents),
  ...standaloneDocuments,
];
