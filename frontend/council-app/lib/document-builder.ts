export type DocumentKind = "permission_letter" | "report";

export const SOMAIYA_KJSCE_LOGO = "/K J Somaiya College of Engineering@2x.png";

export interface PermissionLetterFields {
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  body: string;
  eventName: string;
  eventDate: string;
  venue: string;
  councilName: string;
  signatoryName: string;
  signatoryRole: string;
}

export interface ReportFields {
  date: string;
  eventName: string;
  eventDate: string;
  venue: string;
  attendance: string;
  summary: string;
  highlights: string;
  outcomes: string;
  conclusion: string;
  councilName: string;
  submittedBy: string;
}

export interface DocumentBuilderState {
  kind: DocumentKind;
  eventId: string;
  letterheadUrl: string;
  permission: PermissionLetterFields;
  report: ReportFields;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function defaultPermissionFields(councilName = ""): PermissionLetterFields {
  return {
    refNo: "",
    date: todayISO(),
    recipient: "The Director,\nK J Somaiya School of Engineering,\nSomaiya Vidyavihar University",
    subject: "",
    body:
      "We hereby request your kind permission to conduct the above-mentioned event under the aegis of our council. All necessary arrangements regarding venue, faculty supervision, and student safety shall be ensured as per institute guidelines.",
    eventName: "",
    eventDate: "",
    venue: "",
    councilName,
    signatoryName: "",
    signatoryRole: "General Secretary",
  };
}

export function defaultReportFields(councilName = ""): ReportFields {
  return {
    date: todayISO(),
    eventName: "",
    eventDate: "",
    venue: "",
    attendance: "",
    summary: "",
    highlights: "",
    outcomes: "",
    conclusion: "",
    councilName,
    submittedBy: "",
  };
}

export function buildDefaultState(councilName = ""): DocumentBuilderState {
  return {
    kind: "permission_letter",
    eventId: "",
    letterheadUrl: "",
    permission: defaultPermissionFields(councilName),
    report: defaultReportFields(councilName),
  };
}

const DRAFT_KEY = "council_document_builder_draft";

export function loadDraft(): DocumentBuilderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DocumentBuilderState) : null;
  } catch {
    return null;
  }
}

export function saveDraft(state: DocumentBuilderState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}
